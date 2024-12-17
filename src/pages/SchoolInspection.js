import React, { useState, useEffect } from "react";
import { useDataQuery, useDataMutation } from "@dhis2/app-runtime";
import {
  Button,
  ButtonStrip,
  CircularLoader,
  NoticeBox,
  InputFieldFF,
  RadioFieldFF,
  DataTable,
  DataTableHead,
  DataTableRow,
  DataTableCell,
  Box,
  Center,
  hasValue,
  number,
  composeValidators,
  AlertBar,
  AlertStack,
  Modal,
  ModalContent,
  ModalActions,
  ModalTitle,
  IconCheckmarkCircle24,
} from "@dhis2/ui";
import { Form, Field } from "react-final-form";
import { FormBox } from "../components/FormBox";
import { ReportDate } from "../components/ReportDate";
import { SelectSchool } from "../components/SelectSchool";
import classes from "../App.module.css";
import { BackButton } from "../components/BackButton";

// Define the query for fetching program stage data elements
const programStageDataElementsQuery = {
  programStage: {
    resource: "programStages/eJiBjm9Rl7E",
    params: {
      fields:
        "programStageDataElements[sortOrder,dataElement[id,displayFormName,valueType,optionSetValue,optionSet[id,options[displayFormName,id,code]]]]",
      paging: "false",
    },
  },
};

// Define a mutation for submitting the form data
const submitMutation = {
  resource: "tracker",
  type: "create",
  data: ({ events }) => ({
    events,
  }),
};

export function SchoolInspection({ date, school, activePageHandler }) {
  // State to manage selected school, date, visible form fields, and submission status
  const [selectedSchoolId, setSelectedSchoolId] = useState(school || "");
  const [selectedDate, setSelectedDate] = useState(date || "");
  const [visibleSortOrders, setVisibleSortOrders] = useState([]);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch data and handle submission mutation
  const { loading, error, data, refetch } = useDataQuery(
    programStageDataElementsQuery
  );
  const [submitForm, { loading: submitting }] = useDataMutation(submitMutation);

  // Effect to determine which fields should be visible based on sort orders
  useEffect(() => {
    if (data?.programStage?.programStageDataElements) {
      const initialSortOrders = data.programStage.programStageDataElements
        .filter(
          ({ sortOrder }) =>
            (sortOrder % 2 === 0 && sortOrder < 12) || sortOrder > 12
        )
        .map(({ sortOrder }) => sortOrder);
      setVisibleSortOrders(initialSortOrders);
    }
  }, [data]);

  // Update visible fields dynamically based on user input
  const handleVisibility = (values) => {
    const updatedVisibleSortOrders = [...visibleSortOrders];

    data.programStage.programStageDataElements.forEach(
      ({ sortOrder, dataElement }) => {
        if (sortOrder % 2 === 0 && values[dataElement.id] >= 1) {
          const nextSortOrder = sortOrder + 1;
          if (!updatedVisibleSortOrders.includes(nextSortOrder)) {
            updatedVisibleSortOrders.push(nextSortOrder);
          }
        } else if (sortOrder % 2 === 0 && values[dataElement.id] == 0) {
          const nextSortOrder = sortOrder + 1;
          const index = updatedVisibleSortOrders.indexOf(nextSortOrder);
          if (index > -1) {
            updatedVisibleSortOrders.splice(index, 1);
          }
        }

        if (sortOrder === 13 || sortOrder === 14) {
          if (!updatedVisibleSortOrders.includes(sortOrder)) {
            updatedVisibleSortOrders.push(sortOrder);
          }
        }
      }
    );

    setVisibleSortOrders(updatedVisibleSortOrders);
  };

  // Submit the form and handle success or error
  const handleSubmit = async (values) => {
    try {
      const validDataElements = data.programStage.programStageDataElements.map(
        ({ dataElement }) => dataElement.id
      );

      const dataValues = Object.entries(values)
        .filter(([dataElement]) => validDataElements.includes(dataElement))
        .map(([dataElement, value]) => ({
          dataElement,
          value,
        }));

      const eventPayload = {
        program: "UxK2o06ScIe",
        programStage: "eJiBjm9Rl7E",
        orgUnit: selectedSchoolId,
        eventDate: selectedDate,
        occurredAt: selectedDate,
        status: "COMPLETED",
        dataValues,
      };

      await submitForm({
        events: [eventPayload],
      });

      setSubmissionSuccess(true);
      setModalOpen(true);
    } catch (error) {
      setSubmitError(error.message || "An unknown error occurred.");
      setSubmissionSuccess(false);
    }
  };

  // Close the success modal and refresh data
  const handleModalClose = () => {
    setModalOpen(false);
    refetch();
  };

  // Show a loader while data is loading
  if (loading) {
    return (
      <Center>
        <CircularLoader large aria-label="Default Loader" />
      </Center>
    );
  }

  // Show error message if data fetching fails
  if (error) return <NoticeBox error>{error.message}</NoticeBox>;

  return (
    <div className={classes.container}>
      <Box className={classes.box} width="100%">
        <Form
          initialValues={{
            selectedSchoolId: selectedSchoolId,
            reportDate: selectedDate,
          }}
          onSubmit={handleSubmit}
          subscription={{ values: true }}
          render={({ handleSubmit, values }) => {
            useEffect(() => {
              handleVisibility(values);
            }, [values]);

            return (
              <form onSubmit={handleSubmit}>
                <BackButton activePageHandler={activePageHandler} />
                <h1 className={classes.pageHeading}>School Inspection Form</h1>
                <FormBox tagName={"Report Details"}>
                  <SelectSchool
                    selectedSchoolId={selectedSchoolId}
                    setSelectedSchoolId={(schoolId) => {
                      setSelectedSchoolId(schoolId);
                    }}
                  />
                  <ReportDate
                    selectedDate={selectedDate}
                    setSelectedDate={(date) => {
                      setSelectedDate(date);
                    }}
                  />
                </FormBox>
                <FormBox tagName={"School Condition"}>
                  {data.programStage.programStageDataElements
                    .filter(
                      ({ sortOrder }) =>
                        visibleSortOrders.includes(sortOrder) && sortOrder < 12
                    )
                    .map(({ dataElement }) => (
                      <DataTable
                        className={classes.inputTable}
                        key={dataElement.id}
                      >
                        <DataTableHead>
                          <DataTableRow className={classes.rows}>
                            <DataTableCell large tag="th" align="center">
                              <label>{dataElement.displayFormName}</label>
                            </DataTableCell>
                          </DataTableRow>
                          <DataTableRow>
                            <DataTableCell>
                              <Center>
                                <div className={classes.inputContainer}>
                                  {dataElement.optionSetValue &&
                                    dataElement.optionSet.options.map(
                                      (option) => (
                                        <Field
                                          key={option.id}
                                          component={RadioFieldFF}
                                          name={dataElement.id}
                                          label={option.displayFormName}
                                          value={option.code}
                                          type="radio"
                                          validate={composeValidators(hasValue)}
                                        />
                                      )
                                    )}
                                  {dataElement.valueType === "NUMBER" && (
                                    <Field
                                      component={InputFieldFF}
                                      name={dataElement.id}
                                      type="number"
                                      validate={composeValidators(
                                        hasValue,
                                        number
                                      )}
                                    />
                                  )}
                                </div>
                              </Center>
                            </DataTableCell>
                          </DataTableRow>
                        </DataTableHead>
                      </DataTable>
                    ))}
                </FormBox>
                <FormBox tagName={"Human Resources"}>
                  {data.programStage.programStageDataElements
                    .filter(
                      ({ sortOrder }) => sortOrder === 12 || sortOrder === 14
                    )
                    .map(({ dataElement }) => (
                      <DataTable
                        className={classes.inputTable}
                        key={dataElement.id}
                      >
                        <DataTableHead>
                          <DataTableRow className={classes.rows}>
                            <DataTableCell large tag="th" align="center">
                              <label>{dataElement.displayFormName}</label>
                            </DataTableCell>
                          </DataTableRow>
                          <DataTableRow>
                            <DataTableCell>
                              <Center>
                                <div className={classes.inputContainer}>
                                  {dataElement.valueType === "NUMBER" && (
                                    <Field
                                      component={InputFieldFF}
                                      name={dataElement.id}
                                      type="number"
                                      validate={composeValidators(
                                        hasValue,
                                        number
                                      )}
                                    />
                                  )}
                                </div>
                              </Center>
                            </DataTableCell>
                          </DataTableRow>
                        </DataTableHead>
                      </DataTable>
                    ))}
                </FormBox>
                <FormBox tagName={"Resources and Facilities"}>
                  {data.programStage.programStageDataElements
                    .filter(({ sortOrder }) => sortOrder >= 15)
                    .map(({ dataElement }) => (
                      <DataTable
                        className={classes.inputTable}
                        key={dataElement.id}
                      >
                        <DataTableHead>
                          <DataTableRow className={classes.rows}>
                            <DataTableCell large tag="th" align="center">
                              <label>{dataElement.displayFormName}</label>
                            </DataTableCell>
                          </DataTableRow>
                          <DataTableRow>
                            <DataTableCell>
                              <Center>
                                <div className={classes.inputContainer}>
                                  {dataElement.valueType === "NUMBER" && (
                                    <Field
                                      component={InputFieldFF}
                                      name={dataElement.id}
                                      type="number"
                                      validate={composeValidators(
                                        hasValue,
                                        number
                                      )}
                                    />
                                  )}
                                </div>
                              </Center>
                            </DataTableCell>
                          </DataTableRow>
                        </DataTableHead>
                      </DataTable>
                    ))}
                </FormBox>
                {modalOpen && (
                  <Modal onClose={handleModalClose} small>
                    <div className={classes.checkMarkIcon}>
                      <IconCheckmarkCircle24 color="#228B22" />
                    </div>
                    <ModalTitle>
                      Inspection has been successfully submitted!
                    </ModalTitle>
                    <ModalActions>
                      <Button onClick={() => activePageHandler("Home")}>
                        Go back to Dashboard
                      </Button>
                    </ModalActions>
                  </Modal>
                )}
                {submitError && (
                  <NoticeBox error>
                    {submitError.message ||
                      "An error occurred during submission."}
                  </NoticeBox>
                )}
                <div className={classes.submitButton}>
                  <Button type="submit" primary disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Inspection"}
                  </Button>
                </div>
              </form>
            );
          }}
        />
      </Box>
    </div>
  );
}
