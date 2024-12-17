import React, { useState } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import {
  CircularLoader,
  Center,
  Box,
  Tooltip,
  IconQuestionFilled24,
} from "@dhis2/ui";
import { MapComponent } from "./MapComponent";
import { PlanVisitModal } from "./PlanVisitModal";
import classes from "../App.module.css";

// Define the query for fetching tracker events, data elements, and organisation units
const dataQuery = {
  events: {
    resource: "tracker/events",
    params: { program: "UxK2o06ScIe", paging: "false" },
  },
  dataElementGroups: {
    resource: "dataElementGroups/KY12l6IVEB2",
    params: {
      fields:
        "dataElements[id,displayFormName,valueType,optionSetValue,optionSet[id,options[displayFormName,id,code]]]",
      paging: "false",
    },
  },
  organisationUnits: {
    resource: "/organisationUnits/Jj1IUjjPaWf",
    params: {
      fields:
        "children[name,geometry[coordinates,type],id],name,geometry[coordinates,type]",
    },
  },
};

// Function to merge event data with its corresponding data elements
function mergeData(events, dataElements) {
  // Create a map of data elements for easier lookup
  const dataElementMap = Object.fromEntries(
    dataElements.map((de) => [
      de.id,
      {
        displayFormName: de.displayFormName,
        optionSet: de.optionSetValue ? de.optionSet : null,
        valueType: de.valueType,
      },
    ])
  );

  // Map over each event and enrich it with details from the data element map
  return events.map((event) => {
    const eventData = event.dataValues.map((dataValue) => {
      const dataElement = dataElementMap[dataValue.dataElement];
      let valueDisplay = dataValue.value;

      // Replace value with option set display name if applicable
      if (dataElement?.optionSet) {
        const option = dataElement.optionSet.options.find(
          (opt) => opt.id === dataValue.value || opt.code === dataValue.value
        );
        if (option) {
          valueDisplay = option.displayFormName;
        }
      }

      return {
        displayFormName: dataElement?.displayFormName,
        id: dataValue.dataElement,
        value: valueDisplay,
        valueType: dataElement?.valueType,
        integerValue: dataValue.value,
      };
    });

    return {
      eventId: event.event,
      orgUnitName: event.orgUnitName,
      orgUnit: event.orgUnit,
      occurredAt: event.occurredAt.trim(),
      status: event.status,
      eventData,
    };
  });
}

// Function to categorize events into different groups based on their statuses and conditions
const categorizeEvents = (events, locations) => {
  const now = new Date();
  const processedOrgUnits = new Set();

  // Define categories for events
  const categories = {
    needFollowUp: [],
    soonNeedInspection: [],
    scheduled: [],
    good: [],
  };

  // Iterate over events and classify them into categories
  events.forEach((event) => {
    if (processedOrgUnits.has(event.orgUnit)) return;

    const createdAt = new Date(event.occurredAt);
    const daysAgo = (now - createdAt) / (1000 * 60 * 60 * 24);
    const needsFollowUp = event.eventData.some(
      ({ valueType, integerValue }) =>
        valueType === "INTEGER_POSITIVE" && Number(integerValue) < 3
    );

    if (event.status === "SCHEDULE") {
      categories.scheduled.push(event);
    } else if (needsFollowUp) {
      categories.needFollowUp.push(event);
    } else if (daysAgo > 15) {
      categories.soonNeedInspection.push(event);
    } else {
      categories.good.push(event);
    }

    processedOrgUnits.add(event.orgUnit);
  });

  // Add locations without events to the "soonNeedInspection" category
  locations.forEach((location) => {
    if (!processedOrgUnits.has(location.id)) {
      categories.soonNeedInspection.push({
        orgUnit: location.id,
        orgUnitName: location.name,
        status: "No events",
      });
    }
  });

  return categories;
};

// Utility to calculate how many days ago a date occurred
const calculateDaysAgo = (date) =>
  Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));

// Main VisitPlanner component
export function VisitPlanner({ activePageHandler }) {
  // Fetch data using the provided query
  const { loading, error, data, refetch } = useDataQuery(dataQuery);

  // State for modal, selected school, and current category
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState({
    name: "",
    id: "",
    lastEventDate: "",
  });
  const [currentCategory, setCurrentCategory] = useState("all schools");

  // Handler to open the modal for planning a visit
  const handlePlanVisitClick = (schoolName, schoolId, eventDate) => {
    setSelectedSchool({
      name: schoolName,
      id: schoolId,
      lastEventDate: new Date(eventDate).toLocaleDateString(),
    });
    setModalOpen(true);
  };

  // Handler to close the modal and refresh data
  const handleModalClose = () => {
    setModalOpen(false);
    refetch();
  };

  // Change the current category for filtering
  const changeCategory = (category) => {
    setCurrentCategory(category); // This will update the category in MapComponent
  };

  // Show a loader while data is being fetched
  if (loading)
    return (
      <Center>
        <CircularLoader large />
      </Center>
    );

  // Show an error message if the query fails
  if (error) return <span>ERROR: {error.message}</span>;

  // Process the fetched data
  const orgUnitIds = data.organisationUnits.children.map((child) => child.id);
  const filteredEvents = data.events?.instances.filter((event) =>
    orgUnitIds.includes(event.orgUnit)
  );
  const eventsData = mergeData(
    filteredEvents,
    data.dataElementGroups?.dataElements
  );
  const locations = data.organisationUnits.children.map((child) => ({
    id: child.id,
    name: child.name,
    coordinates: child.geometry.coordinates,
  }));
  const categorizedEvents = categorizeEvents(eventsData, locations);

  // Category details for display
  const categoryDetails = {
    needFollowUp: {
      backgroundColor: "rgb(254, 55, 59)",
      name: "Bad Condition",
      tooltip: "Requires immediate follow-up due to critical conditions.",
    },
    soonNeedInspection: {
      backgroundColor: "rgb(253, 215, 54)",
      name: "Inspection Needed Soon",
      tooltip:
        "Occurred more than 15 days ago or yet to occur - requiring inspection.",
    },
    good: {
      backgroundColor: "rgb(113, 220, 61)",
      name: "Good Condition",
      tooltip: "Conditions are normal; no immediate inspection required.",
    },
    scheduled: {
      backgroundColor: "rgb(54, 165, 255)",
      name: "Scheduled",
      tooltip: "Scheduled for inspection in the near future.",
    },
  };

  // Render the component
  return (
    <div className={classes.componentContainer}>
      <div className={classes.categoryContainer}>
        <Box className={classes.cardContainer}>
          {Object.keys(categorizedEvents).map((category) => {
            const { name, tooltip, backgroundColor } =
              categoryDetails[category] || {};
            return (
              <div
                key={category}
                className={classes.categoryCard}
                style={{ backgroundColor }}
              >
                <div
                  className={classes.cardcontent}
                  onClick={() => changeCategory(name.toLowerCase())}
                >
                  <h3 className={classes.categoryHeading}>
                    {name}
                    <Tooltip
                      content={
                        <p style={{ padding: "10px", fontSize: "1.1em" }}>
                          {tooltip}
                        </p>
                      }
                    >
                      <IconQuestionFilled24 />
                    </Tooltip>
                  </h3>
                  <h4 className={classes.count}>
                    {categorizedEvents[category].length}
                  </h4>
                </div>
              </div>
            );
          })}
        </Box>
      </div>

      {/* Render modal if open */}
      {modalOpen && (
        <PlanVisitModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          schoolName={selectedSchool.name}
          schoolId={selectedSchool.id}
          lastEventDate={selectedSchool.lastEventDate}
        />
      )}

      {/* Render MapComponent */}
      <MapComponent
        eventsData={eventsData}
        locations={locations}
        categorizedEvents={categorizedEvents}
        currentCategory={currentCategory} // Pass the selected category
        setCurrentCategory={setCurrentCategory}
        onPlanVisit={handlePlanVisitClick}
        handleModalClose={handleModalClose}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        selectedSchool={selectedSchool}
        setSelectedSchool={setSelectedSchool}
        calculateDaysAgo={calculateDaysAgo}
      />
    </div>
  );
}
