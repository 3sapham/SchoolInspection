import React from "react";
import {
  Modal,
  ModalContent,
  ModalActions,
  Button,
  Box,
  Tag,
  ButtonStrip,
} from "@dhis2/ui";
import classes from "../App.module.css";

// NewInspectionModal component to display and handle inspection-related actions
export function NewInspectionModal({
  isOpen, // Prop to control modal visibility
  onClose, // Function to close the modal
  eventsData, // Array of inspection events to display
  onNavigateToInspection, // Function to navigate to the inspection process
  activePageHandler, // Function to handle navigation to the inspection page
}) {
  return (
    <Modal fluid position="middle" onClose={onClose} open={isOpen}>
      <ModalContent>
        <Box width="100%">
          <div className={classes.newInspectionCardContainer}>
            {/* Render a card for each inspection event */}
            {eventsData.map((event) => (
              <Box key={event.eventId} className={classes.card}>
                <h4>{event.orgUnitName}</h4>
                <Tag
                  neutral={event.status === "SCHEDULE"}
                  positive={event.status === "COMPLETED"}
                >
                  {event.status}
                </Tag>
                <p>
                  <strong>Due Date:</strong>{" "}
                  {new Date(event.occurredAt).toLocaleString([], {
                    dateStyle: "short", // Format the date
                  })}
                </p>
                {/* Button to start the inspection */}
                <Button
                  primary
                  onClick={() => {
                    onNavigateToInspection(event);
                  }}
                >
                  Start Inspection
                </Button>
              </Box>
            ))}
            {/* Option to create a new inspection */}
            <div onClick={() => activePageHandler("SchoolInspection")}>
              <Box className={classes.newInspectionCard}>
                <div className={classes.plusSignContainer}>
                  <span className={classes.plusSign}>﹢</span>
                </div>
                <h4 className={classes.newInspectionText}>
                  Create New School Inspection
                </h4>
              </Box>
            </div>
          </div>
        </Box>
      </ModalContent>
      <ModalActions>
        <ButtonStrip end>
          <Button onClick={onClose}>Close</Button>
        </ButtonStrip>
      </ModalActions>
    </Modal>
  );
}
