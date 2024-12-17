import React, { useState } from "react";
import { Map, TileLayer, Marker, Tooltip, Popup } from "react-leaflet"; // Leaflet components for map rendering
import "leaflet/dist/leaflet.css"; // Styles for the Leaflet map
import { Button, IconCross24, Tag, Modal, ModalContent } from "@dhis2/ui";
import { PlanVisitModal } from "../components/PlanVisitModal";
import { InspectionDetailOverview } from "./InspectionDetailOverview";
import { MapFilterCategory } from "./MapFilterCategory";

export function MapComponent({
  eventsData,
  locations,
  categorizedEvents,
  currentCategory,
  setCurrentCategory,
  handleModalClose,
  modalOpen,
  setModalOpen,
  selectedSchool,
  setSelectedSchool,
  calculateDaysAgo,
}) {
  // State variables for selected location and sidebar visibility
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Categorize locations based on events
  const categoryCounts = {
    "all schools": locations.length,
    "bad condition": categorizedEvents.needFollowUp.length,
    "inspection needed soon": categorizedEvents.soonNeedInspection.length,
    "good condition":
      locations.length -
      (categorizedEvents.needFollowUp.length +
        categorizedEvents.soonNeedInspection.length +
        categorizedEvents.scheduled.length),
    scheduled: categorizedEvents.scheduled.length,
  };

  // Determine event category for a given location
  const getEventCategory = (orgUnitId) => {
    if (
      categorizedEvents.needFollowUp.some(
        (event) => event.orgUnit === orgUnitId
      )
    )
      return "bad condition";
    if (
      categorizedEvents.soonNeedInspection.some(
        (event) => event.orgUnit === orgUnitId
      )
    )
      return "inspection needed soon";
    if (
      categorizedEvents.scheduled.some((event) => event.orgUnit === orgUnitId)
    )
      return "scheduled";
    return "good condition";
  };

  // Change the current category and hide sidebar
  const changeCategory = (category) => {
    setCurrentCategory(category);
    setSidebarVisible(false);
  };

  // Filter locations based on the current category
  const filteredLocations = locations.filter((location) => {
    if (currentCategory === "all schools") return true;
    const category = getEventCategory(location.id);
    return category === currentCategory;
  });

  // Map colors for event categories
  const colorMap = {
    "bad condition": "rgb(254, 55, 59)",
    "inspection needed soon": "rgb(253, 215, 54)",
    "good condition": "rgb(113, 220, 61)",
    scheduled: "rgb(54, 165, 255)",
    "all schools": "black",
  };

  // Create custom icon for a location marker
  const createCustomIcon = (orgUnitId) => {
    const category = getEventCategory(orgUnitId);

    return L.divIcon({
      className: "custom-icon",
      html: `<div style="background-color: ${colorMap[category]}; border-radius: 50%; width: 25px; height: 25px; color: ${colorMap[category]}; box-shadow: 0px 0px 0px 4px rgba(0,0,0,0.3);">•</div>`,
      iconSize: [25, 25],
      iconAnchor: [12, 12],
    });
  };

  // Handle click on a location marker to show location details
  const handleMarkerClick = (location) => {
    const locationEvents = eventsData.filter(
      (event) => event.orgUnit === location.id
    );
    setSelectedLocation({ ...location, events: locationEvents });
  };

  // Get details of the scheduled event for a location
  const getScheduledEventDetails = (location) => {
    const scheduledEvent = categorizedEvents.scheduled.find(
      (event) => event.orgUnit === location.id
    );
    return scheduledEvent ? scheduledEvent.occurredAt : null;
  };

  return (
    <div style={{ display: "flex", width: "100%" }}>
      {/* Map component rendering */}
      <Map
        center={[13.4544, -16.5753]} // Set initial map center
        zoom={14.2} // Set initial zoom level
        style={{
          width: sidebarVisible ? "75%" : "100%", // Adjust width based on sidebar visibility
          height: "400px", // Set height of the map
          margin: sidebarVisible ? "0" : "0 auto", // Adjust margin based on sidebar visibility
          display: sidebarVisible ? "block" : "flex", // Adjust display style
          justifyContent: "center", // Center map when sidebar is visible
          alignItems: "center", // Align items at the center
        }}
      >
        {/* Tile layer for the map */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Map filter component for selecting event categories */}
        <MapFilterCategory
          currentCategory={currentCategory}
          changeCategory={changeCategory}
          categoryCounts={categoryCounts}
          colorMap={colorMap}
        />
        {/* Display filtered locations with markers */}
        {filteredLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.coordinates[1], location.coordinates[0]]}
            icon={createCustomIcon(location.id)} // Custom marker icon
            onClick={() => handleMarkerClick(location)} // Handle marker click
          >
            {/* Tooltip for each marker showing location info */}
            <Tooltip direction="top" offset={[0, -10]}>
              <div>
                <strong>{location.name}</strong>
                <br />
                {/* Display event info based on category */}
                {getEventCategory(location.id) === "scheduled" ? (
                  <span>
                    Scheduled in:{" "}
                    {calculateDaysAgo(
                      new Date(getScheduledEventDetails(location))
                    ) * -1}{" "}
                    days
                  </span>
                ) : (
                  <span>
                    Last inspected:{" "}
                    {calculateDaysAgo(
                      eventsData.find((event) => event.orgUnit === location.id)
                        ?.occurredAt || 0
                    )}{" "}
                    days ago
                  </span>
                )}
              </div>
            </Tooltip>
            {/* Popup for each marker with more detailed info */}
            <Popup>
              <div>
                <h3>{location.name}</h3>
                <p>
                  <strong>Category: </strong>
                  <span
                    style={{
                      backgroundColor: colorMap[getEventCategory(location.id)],
                      color: "white",
                      borderRadius: "3px",
                      padding: "2px 5px",
                      fontWeight: "bold",
                    }}
                  >
                    {getEventCategory(location.id).charAt(0).toUpperCase() +
                      getEventCategory(location.id).slice(1)}
                  </span>
                </p>
                {/* Display event details or inspection details */}
                {getEventCategory(location.id) === "scheduled" ? (
                  <p>
                    Scheduled in:{" "}
                    {calculateDaysAgo(
                      new Date(getScheduledEventDetails(location))
                    ) * -1}{" "}
                    days
                  </p>
                ) : (
                  <>
                    <p>
                      Last inspected:{" "}
                      {calculateDaysAgo(
                        eventsData.find(
                          (event) => event.orgUnit === location.id
                        )?.occurredAt || 0
                      )}{" "}
                      days ago
                    </p>
                    <p
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => setSidebarVisible(true)} // Open sidebar for inspection details
                    >
                      See last inspection details
                    </p>
                  </>
                )}
                {/* Button to plan a visit */}
                <Button
                  primary
                  large
                  style={{ width: "100%" }}
                  onClick={() => {
                    setSelectedSchool({
                      name: selectedLocation.name,
                      id: selectedLocation.id,
                      lastEventDate: new Date(
                        selectedLocation.events[0].occurredAt
                      ).toLocaleDateString(),
                    });
                    setModalOpen(true); // Open modal to plan visit
                  }}
                >
                  Plan visit
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </Map>

      {/* Sidebar modal for showing inspection details */}
      {sidebarVisible && (
        <Modal>
          <ModalContent>
            <Button
              destructive
              onClick={() => setSidebarVisible(false)} // Close sidebar
              style={{ float: "right" }}
              icon={<IconCross24 />}
            ></Button>
            <h3>{selectedLocation.name}</h3>
            <p>
              <strong>Category: </strong>
              <span
                style={{
                  backgroundColor:
                    colorMap[getEventCategory(selectedLocation.id)],
                  color: "white",
                  borderRadius: "3px",
                  padding: "2px 5px",
                  fontWeight: "bold",
                }}
              >
                {getEventCategory(selectedLocation.id).charAt(0).toUpperCase() +
                  getEventCategory(selectedLocation.id).slice(1)}
              </span>
            </p>
            {/* Display details for scheduled or last inspection */}
            {getEventCategory(selectedLocation.id) === "scheduled" ? (
              <p>
                <strong>Scheduled in:</strong>{" "}
                {new Date(
                  getScheduledEventDetails(selectedLocation)
                ).toLocaleDateString()}
                , in{" "}
                {calculateDaysAgo(
                  new Date(getScheduledEventDetails(selectedLocation))
                ) * -1}{" "}
                days
              </p>
            ) : (
              <>
                <p>
                  <strong>Last inspection:</strong>{" "}
                  {new Date(
                    selectedLocation.events[0].occurredAt
                  ).toLocaleDateString()}
                  , {calculateDaysAgo(selectedLocation.events[0].occurredAt)}{" "}
                  days ago
                </p>

                {/* Inspection detail component */}
                <InspectionDetailOverview
                  eventData={selectedLocation.events[0].eventData}
                />
              </>
            )}
          </ModalContent>
        </Modal>
      )}

      {/* Modal to plan a visit to a school */}
      {modalOpen && (
        <PlanVisitModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          schoolName={selectedSchool.name}
          schoolId={selectedSchool.id}
          lastEventDate={selectedSchool.lastEventDate}
        />
      )}
    </div>
  );
}
