import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalActions,
  ModalTitle,
  Button,
  ButtonStrip,
  ReactFinalForm,
  Calendar,
  composeValidators,
  hasValue,
  NoticeBox,
  Table,
  TableCell,
  AlertBar,
} from "@dhis2/ui";
import { useDataMutation } from "@dhis2/app-runtime";

// Mutation configuration for creating a tracker event
const eventMutation = {
  resource: "tracker",
  type: "create",
  data: ({ events }) => ({
    events, // The mutation will take an array of events as its payload
  }),
};

// PlanVisitModal Component: A modal for scheduling a school visit
export function PlanVisitModal({
  isOpen, // Whether the modal is open or not
  onClose, // Function to close the modal
  schoolName, // Name of the selected school
  schoolId, // ID of the selected school
  lastEventDate, // The date of the last inspection
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [mutate, { loading: submitting, error: submitError }] =
    useDataMutation(eventMutation); // Hook to execute the event mutation
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Function to handle form submission
  const onSubmit = async () => {
    const eventPayload = {
      program: "UxK2o06ScIe", // The program identifier
      programStage: "eJiBjm9Rl7E", // The program stage identifier
      orgUnit: schoolId, // The organization unit (school ID)
      scheduledAt: selectedDate, // The scheduled date for the visit
      status: "SCHEDULE", // Status of the event
      occurredAt: selectedDate, // The same date as the occurrence date
    };
    console.log("Event Payload:", eventPayload);

    try {
      const response = await mutate({ events: [eventPayload] }); // Execute the mutation with the event payload
      console.log("Response:", response);
      setSubmissionSuccess(true); // Indicate successful submission
      setTimeout(() => {
        onClose(); // Close the modal after 2 seconds
      }, 2000);
    } catch (error) {
      console.error("Submission failed:", error); // Log any errors
      setSubmissionSuccess(false); // Indicate submission failure
    }
  };

  return (
    <Modal position="middle" onClose={onClose} open={isOpen}>
      <ReactFinalForm.Form onSubmit={onSubmit}>
        {({ handleSubmit, submitting, pristine }) => (
          <form onSubmit={handleSubmit} autoComplete="off">
            <ModalContent>
              <Table>
                <TableCell>
                  <ModalTitle>Plan Visit</ModalTitle>
                  <p>
                    <strong>School:</strong> {schoolName}
                  </p>
                  <p>
                    <strong>Last inspected:</strong> {lastEventDate}
                  </p>
                </TableCell>
                <TableCell>
                  <ReactFinalForm.Field
                    required
                    name="date"
                    component={Calendar}
                    date={selectedDate}
                    onDateSelect={(date) => {
                      setSelectedDate(date.calendarDateString); // Update the selected date state
                    }}
                    validate={composeValidators(hasValue)} // Validate that a value is provided
                  />
                </TableCell>
              </Table>
              {/* Display success or error messages based on submission state */}
              {submissionSuccess && (
                <AlertBar success>
                  Visit has been successfully scheduled!
                </AlertBar>
              )}
              {submitError && (
                <NoticeBox error>{submitError.message}</NoticeBox>
              )}
            </ModalContent>
            <ModalActions>
              <ButtonStrip end>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  primary
                  type="submit"
                  onClick={onSubmit}
                  disabled={submitting || !selectedDate} // Disable button if submitting or no date is selected
                >
                  Confirm
                </Button>
              </ButtonStrip>
            </ModalActions>
          </form>
        )}
      </ReactFinalForm.Form>
    </Modal>
  );
}
