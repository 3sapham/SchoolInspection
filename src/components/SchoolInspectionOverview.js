import React, { useState } from "react";
import {
  Box,
  Tag,
  DataTable,
  DataTableHead,
  DataTableColumnHeader,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  Button,
  IconDelete16,
  IconEdit16,
  Chip,
  SegmentedControl,
  IconList16,
  IconApps16,
  IconVisualizationColumn16,
} from "@dhis2/ui";

import { InspectionDetailOverview } from "./InspectionDetailOverview";
import classes from "../App.module.css";

// Component to display a school inspection overview, including a table and an expanded view
const SchoolInspectionOverview = ({
  eventsData, // Array of event data
  statusFilter, // Filter to show events by status
  navigateToReportSummary, // Function to navigate to the report summary
}) => {
  const [expandedRow, setExpandedRow] = useState(null); // State to track which table row is expanded
  const [viewMode, setViewMode] = useState("table"); // State to track the current view mode (table or expanded)

  // Filter the events based on the selected status filter
  const filteredEvents = statusFilter
    ? eventsData.filter((event) => event.status === statusFilter)
    : eventsData;

  return (
    <div>
      {/* SegmentedControl to switch between table and expanded view modes */}
      <SegmentedControl
        ariaLabel="View Mode"
        options={[
          { label: <IconList16 />, value: "table" }, // Table view option
          { label: <IconApps16 />, value: "expanded" }, // Expanded view option
        ]}
        selected={viewMode} // Current view mode
        onChange={({ value }) => setViewMode(value)} // Update view mode on selection
      />

      {/* Render table view if viewMode is "table" */}
      {viewMode === "table" ? (
        <DataTable>
          <DataTableHead>
            <DataTableRow>
              <DataTableColumnHeader />
              <DataTableColumnHeader>School</DataTableColumnHeader>
              <DataTableColumnHeader>Date</DataTableColumnHeader>
              <DataTableColumnHeader>Status</DataTableColumnHeader>
              <DataTableColumnHeader></DataTableColumnHeader>
              <DataTableColumnHeader></DataTableColumnHeader>
              <DataTableColumnHeader></DataTableColumnHeader>
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {/* Render each filtered event as a table row */}
            {filteredEvents.map((event) => (
              <DataTableRow
                key={event.eventId}
                style={{ cursor: "pointer" }} // Cursor pointer for row
                expanded={expandedRow === event.eventId} // Show expanded content if this row is expanded
                onExpandToggle={() =>
                  setExpandedRow(
                    expandedRow === event.eventId ? null : event.eventId
                  )
                } // Toggle expanded row
                onClick={() =>
                  setExpandedRow(
                    expandedRow === event.eventId ? null : event.eventId
                  )
                } // Toggle expanded row on click
                expandableContent={
                  <InspectionDetailOverview eventData={event.eventData} />
                } // Content to show when row is expanded
              >
                <DataTableCell>{event.orgUnitName}</DataTableCell>
                <DataTableCell>
                  {new Date(event.occurredAt).toLocaleString([], {
                    dateStyle: "short", // Format the date
                  })}
                </DataTableCell>
                <DataTableCell>
                  <Tag positive={event.status === "COMPLETED"}>
                    {event.status} {/* Tag to display event status */}
                  </Tag>
                </DataTableCell>
                <DataTableCell>
                  <Button
                    className={classes.inspectionOverviewButtons}
                    small
                    onClick={() => navigateToReportSummary(event.orgUnit)} // Navigate to report summary
                    icon={<IconVisualizationColumn16 color="#6C7787" />}
                  >
                    Report Summary
                  </Button>
                </DataTableCell>
                <DataTableCell>
                  <Button
                    className={classes.inspectionOverviewButtons}
                    small
                    onClick={() => console.log(event)}
                    icon={<IconEdit16 />}
                  >
                    Edit
                  </Button>
                </DataTableCell>
                <DataTableCell>
                  <Button
                    className={classes.inspectionOverviewButtons}
                    destructive
                    small
                    onClick={() => console.log(event)}
                    icon={<IconDelete16 />}
                  >
                    Delete
                  </Button>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      ) : (
        // Render expanded view if viewMode is not "table"
        <div className={classes.cardContainer}>
          {/* Render each filtered event in an expanded card view */}
          {filteredEvents.map((event) => (
            <Box key={event.eventId} className={classes.box} width="100%">
              <Chip selected>{event.orgUnitName}</Chip>
              <Chip>
                Date:{" "}
                {new Date(event.occurredAt).toLocaleString([], {
                  dateStyle: "short", // Format the date
                })}
              </Chip>
              <Tag positive={event.status === "COMPLETED"}>{event.status}</Tag>
              {/* Display detailed event data */}
              <InspectionDetailOverview eventData={event.eventData} />
            </Box>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolInspectionOverview;
