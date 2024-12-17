import React, { useState } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import {
  CircularLoader,
  Center,
  Box,
  Chip,
  Button,
  IconAdd16,
  IconFileDocument24,
} from "@dhis2/ui";
import classes from "../App.module.css";
import SchoolInspectionOverview from "../components/SchoolInspectionOverview";
import { NewInspectionModal } from "../components/NewInspectionModal";
import { VisitPlanner } from "../components/VisitPlanner";

// Define the data queries to fetch events and data element groups
const dataQuery = {
  events: {
    resource: "tracker/events", // Fetch events from the tracker API
    params: {
      program: "UxK2o06ScIe", // The program ID for filtering the events
      paging: "false", // No paging, fetch all records
    },
  },
  dataElementGroups: {
    resource: "dataElementGroups/KY12l6IVEB2", // Fetch data element groups by their ID
    params: {
      fields:
        "dataElements[id,displayFormName,valueType,optionSetValue,optionSet[id,options[displayFormName,id,code]]]",
      paging: "false", // No paging
    },
  },
};

// Function to merge event data with the corresponding data element information
function mergeData(events, dataElementGroups) {
  // Map data element information for quick access
  const dataElementMap = Object.fromEntries(
    dataElementGroups.map((de) => [
      de.id,
      {
        displayFormName: de.displayFormName, // Data element name to display
        optionSet: de.optionSetValue ? de.optionSet : null, // Option set if exists
      },
    ])
  );

  // Map the events and add the corresponding data element details
  return events.map((event) => {
    const eventData = event.dataValues.map((dataValue) => {
      const dataElement = dataElementMap[dataValue.dataElement];
      let valueDisplay = dataValue.value;

      // If the data element has an option set, find the matching option display name
      if (dataElement?.optionSet) {
        const option = dataElement.optionSet.options.find(
          (opt) => opt.id === dataValue.value || opt.code === dataValue.value
        );
        if (option) {
          valueDisplay = option.displayFormName; // Update value to display name
        }
      }

      return {
        displayFormName: dataElement?.displayFormName || dataValue.dataElement,
        id: dataValue.dataElement,
        value: valueDisplay,
      };
    });

    // Return a complete event object with merged data
    return {
      eventId: event.event,
      orgUnit: event.orgUnit,
      orgUnitName: event.orgUnitName,
      occurredAt: event.occurredAt.trim(),
      status: event.status,
      eventData,
    };
  });
}

// Function to filter and return scheduled events, sorted by occurrence date
function scheduledEvents(events) {
  const processedOrgUnits = new Set();

  // Filter to only include events that are scheduled and haven't been processed yet
  const filteredEvents = events.filter((event) => {
    if (processedOrgUnits.has(event.orgUnit)) return;
    processedOrgUnits.add(event.orgUnit);
    return event.status === "SCHEDULE";
  });

  // Sort the events by the occurrence date
  return filteredEvents.sort((a, b) => {
    const dateA = new Date(a.occurredAt);
    const dateB = new Date(b.occurredAt);
    return dateA - dateB;
  });
}

export function Dashboard({
  onNavigateToInspection,
  activePageHandler,
  navigateToReportSummary,
}) {

  // Using useDataQuery to fetch events and data element groups
  const { loading, error, data, refetch } = useDataQuery(dataQuery);
  const [newInspectionModalOpen, setNewInspectionModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("all");

  // If there's an error, display it
  if (error) {
    console.error("Error fetching data:", error);
    return <span>ERROR: {error.message}</span>;
  }

  // If the data is still loading, show a loader
  if (loading) {
    return (
      <Center>
        <CircularLoader large aria-label="Default Loader" />
      </Center>
    );
  }

  console.log("Fetched data:", data);

  if (data) {
    // Merge event data with the corresponding data elements
    const eventsData = mergeData(
      data.events?.instances,
      data.dataElementGroups?.dataElements
    );

    // Get the scheduled events and sort them
    const scheduled = scheduledEvents(eventsData);

    console.log("Merged event data:", eventsData);

    // Filter out events that are not scheduled
    const filteredEvents = eventsData.filter(
      (event) => event.status !== "SCHEDULE"
    );

    console.log("Filtered event data:", filteredEvents);

    // Handle opening and closing of NewInspectionModal
    const handleNewInspectionModalOpen = () => {
      refetch();
      setNewInspectionModalOpen(true);
    }

    const handleNewInspectionModalClose = () =>
      setNewInspectionModalOpen(false);

    return (
      <Box className={classes.box} width="100%">
        <div className={classes.newInspectionButton}>
          <h1 className={classes.pageHeading}>School Inspection Dashboard</h1>
          <Button
            large
            onClick={handleNewInspectionModalOpen} // Open modal on button click
            primary
            icon={<IconAdd16 />}
          >
            New Inspection
          </Button>
        </div>
        <VisitPlanner />
        {/* Display the NewInspectionModal if it is open */}
        {newInspectionModalOpen && (
          <NewInspectionModal
            isOpen={handleNewInspectionModalOpen}
            eventsData={scheduled} // Pass scheduled events data to the modal
            onNavigateToInspection={onNavigateToInspection}
            activePageHandler={activePageHandler}
            onClose={handleNewInspectionModalClose} // Close the modal
          />
        )}
        <h1 className={classes.pageHeading} style={{ fontSize: "1.8em" }}>
          Recent School Inspections
        </h1>
        <div>
          <div className={classes.segbuttons}>
            {/* Filter buttons to change the view */}
            <Chip
              large
              selected={viewMode === "all"}
              onClick={() => setViewMode("all")} // Select 'All Inspections' view
            >
              All Inspections
            </Chip>
            <Chip
              selected={viewMode === "active"}
              onClick={() => setViewMode("active")} // Select 'Active' inspections view
            >
              Active
            </Chip>
            <Chip
              selected={viewMode === "completed"}
              onClick={() => setViewMode("completed")} // Select 'Completed' inspections view
            >
              Completed
            </Chip>
          </div>

          {/* Render the inspection overview based on the selected view mode */}
          {(() => {
            switch (viewMode) {
              case "all":
                return (
                  <SchoolInspectionOverview
                    eventsData={filteredEvents}
                    statusFilter={null} // No filter for 'All'
                    onNavigateToInspection={onNavigateToInspection}
                    navigateToReportSummary={navigateToReportSummary}
                  />
                );
              case "active":
                return (
                  <SchoolInspectionOverview
                    eventsData={filteredEvents}
                    statusFilter="ACTIVE" // Filter for 'Active' inspections
                    onNavigateToInspection={onNavigateToInspection}
                    navigateToReportSummary={navigateToReportSummary}
                  />
                );

              case "completed":
                return (
                  <SchoolInspectionOverview
                    eventsData={filteredEvents}
                    statusFilter="COMPLETED" // Filter for 'Completed' inspections
                    onNavigateToInspection={onNavigateToInspection}
                    navigateToReportSummary={navigateToReportSummary}
                  />
                );
              default:
                return null; // If no valid view mode, return nothing
            }
          })()}
        </div>
      </Box>
    );
  }
}
