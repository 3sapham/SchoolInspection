import React, { useState, useEffect } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import {
  Box,
  CircularLoader,
  Center,
  TabBar,
  Tab,
  Chip,
  SingleSelectField,
  SingleSelectOption,
  IconQuestion16,
  Tooltip,
} from "@dhis2/ui";
import { ChartsConditions } from "../components/ChartsConditions";
import { ChartsCount } from "../components/ChartsCount";
import { ChartsCompare } from "../components/ChartsCompare";
import { ChartsTime } from "../components/ChartsTime";
import classes from "../App.module.css";

const dataQuery = {
  events: {
    resource: "tracker/events", // Fetch event data from tracker/events
    params: {
      program: "UxK2o06ScIe", // Specify the program
      programStage: "eJiBjm9Rl7E", // Specify the program stage
      status: "COMPLETED", // Only get completed events
    },
  },
  dataElementGroups: {
    resource: "dataElementGroups/KY12l6IVEB2", // Fetch data element group details
    params: {
      fields: "dataElements[id,displayShortName,valueType]", // Fields to fetch from data elements
      paging: "false", // Disable paging
    },
  },
  jambalayaCluster: {
    resource: "organisationUnits/Jj1IUjjPaWf", // Fetch details of the organization unit
    params: {
      fields: ["children[displayName,id]"], // Fetch children (schools) of the unit
      paging: false, // Disable paging
    },
  },
};

// Function to merge event data with data element group info
function mergeData(data) {
  const events = data.events.instances;
  if (!events || events.length === 0) {
    console.error("No event instances found.");
    return [];
  }

  return events.map((event) => ({
    event: event.event, // Event ID
    status: event.status, // Event status
    orgUnitName: event.orgUnitName, // Organization unit name (school name)
    orgUnitId: event.orgUnit, // Organization unit ID
    occurredAt: event.occurredAt, // Event occurrence date
    dataValues: data.dataElementGroups.dataElements.map((d) => {
      const matchedValue = event.dataValues.find(
        (dv) => dv.dataElement === d.id
      );
      return {
        dataElement: d.id, // Data element ID
        value: matchedValue ? matchedValue.value : null, // Event data value
        valueType: d.valueType, // Value type of the data element
        displayShortName: d.displayShortName, // Display name of the data element
      };
    }),
  }));
}

// Function to filter out events for only the first occurrence of each organization unit
function filterFirstEventForOrgUnits(events) {
  const seenOrgUnits = new Set();
  return events.filter((event) => {
    if (!seenOrgUnits.has(event.orgUnitName)) {
      seenOrgUnits.add(event.orgUnitName);
      return true;
    }
    return false;
  });
}

// Function to filter data by the selected school (organization unit)
function filterDataBySchool(data, selectedSchool) {
  if (!selectedSchool) return data; // Return all data if no school is selected
  return data.filter((event) => event.orgUnitId === selectedSchool); // Filter by selected school
}

export function Report({ selectedOrgUnitForReport }) {
  const [activeTab, setActiveTab] = useState("ReportSummary"); // State for active tab
  const [selectedSchool, setSelectedSchool] = useState(null); // State for selected school
  const [selectedEvent, setSelectedEvent] = useState(null); // State for selected event

  // Update selectedSchool if selectedOrgUnitForReport is provided
  useEffect(() => {
    if (selectedOrgUnitForReport) {
      setSelectedSchool(selectedOrgUnitForReport);
    }
  }, [selectedOrgUnitForReport]);

  const { loading, error, data } = useDataQuery(dataQuery); // Fetch data using useDataQuery hook

  // Display error message if there's an error fetching data
  if (error) return <span>ERROR: {error.message}</span>;

  // Show a loading spinner while the data is being fetched
  if (loading)
    return (
      <Center>
        <CircularLoader large aria-label="Default Loader" />
      </Center>
    );

  const mergedData = data ? mergeData(data) : []; // Merge the fetched data
  const schoolOptions = data.jambalayaCluster.children.map((school) => ({
    label: school.displayName, // Label of the school
    value: school.id, // School ID
  }));

  const firstEventPerOrgUnit = filterFirstEventForOrgUnits(mergedData); // Get first event per school
  const filteredSchool = filterDataBySchool(mergedData, selectedSchool); // Filter events by selected school

  const firstEvent =
    selectedSchool && filteredSchool.length > 0 ? filteredSchool[0] : null; // Get the first event for the selected school

  const currentEvent = selectedEvent || firstEvent; // Use selected event, or default to the first event

  // Handle event selection
  const handleEventSelect = (eventId) => {
    const event = filteredSchool.find((e) => e.event === eventId); // Find the event by ID
    setSelectedEvent(event || null); // Set the selected event
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab); // Set the active tab
    setSelectedSchool(null); // Reset selected school
    setSelectedEvent(null); // Reset selected event
  };

  return (
    <Box className={classes.box}>
      <h1 className={classes.headingStyling} style={{ marginTop: "1.6em" }}>
        Management Report
      </h1>
      {/* TabBar for switching between different report views */}
      <TabBar>
        {["ReportSummary", "ResourceTrends", "DataComparison"].map((tab) => (
          <Tab
            key={tab}
            value={tab}
            selected={activeTab === tab} // Check if the tab is active
            onClick={() => handleTabChange(tab)} // Switch tab on click
          >
            {tab === "ReportSummary"
              ? "Report Summary"
              : tab === "ResourceTrends"
              ? "School Trends"
              : "School Data Comparison"}
          </Tab>
        ))}
      </TabBar>

      {/* Render Report Summary tab content */}
      {activeTab === "ReportSummary" && (
        <div>
          <div style={{ margin: "2em 0" }}>
            {/* Cluster Overview Chip, resets selected school and event */}
            <Chip
              key="cluster-overview"
              onClick={() => {
                setSelectedSchool(null);
                setSelectedEvent(null);
              }}
              selected={selectedSchool === null}
            >
              Cluster Overview
              {/* Tooltip for cluster overview */}
              <Tooltip
                content={
                  <p style={{ padding: "10px" }}>
                    A comprehensive overview of the cluster based on the most
                    recent inspections across all schools within the cluster.
                  </p>
                }
              >
                <IconQuestion16 />
              </Tooltip>
            </Chip>

            {/* Render chip for each school */}
            {schoolOptions.map((school) => (
              <Chip
                key={school.value}
                onClick={() => {
                  setSelectedSchool(school.value); // Set the selected school
                  setSelectedEvent(null); // Reset event selection when school changes
                }}
                selected={selectedSchool === school.value} // Check if the school is selected
              >
                {school.label}
              </Chip>
            ))}
          </div>

          {/* Render event selection dropdown if a school is selected */}
          {selectedSchool && filteredSchool.length > 0 && (
            <div className={classes.cardBox}>
              <SingleSelectField
                label="Select Inspection"
                filterable // Allow search/filtering of inspections
                selected={currentEvent ? currentEvent.event : null} // Set selected event
                onChange={({ selected }) => handleEventSelect(selected)} // Handle event selection
              >
                {/* Render available events */}
                {filteredSchool.map((event) => (
                  <SingleSelectOption
                    key={event.event}
                    label={`${event.orgUnitName} - ${new Date(
                      event.occurredAt
                    ).toLocaleDateString()}`} // Display school name and event date
                    value={event.event} // Set the event ID as the value
                  />
                ))}
              </SingleSelectField>
            </div>
          )}

          {/* Render various chart components */}
          <div>
            <ChartsCount
              mergedData={currentEvent ? [currentEvent] : firstEventPerOrgUnit}
            />
            <ChartsConditions
              mergedData={currentEvent ? [currentEvent] : firstEventPerOrgUnit}
            />
          </div>
        </div>
      )}

      {/* Render charts for Resource Trends and Data Comparison tabs */}
      {activeTab === "ResourceTrends" && <ChartsTime events={filteredSchool} />}
      {activeTab === "DataComparison" && (
        <ChartsCompare mergedData={firstEventPerOrgUnit} />
      )}
    </Box>
  );
}
