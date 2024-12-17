import React, { useEffect } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import { CircularLoader, Center } from "@dhis2/ui";
import {
  Table,
  TableHead,
  TableRowHead,
  TableCellHead,
  TableBody,
  TableRow,
  TableCell,
} from "@dhis2/ui";

// Define the query to fetch organisation units and their children
const dataQuery = {
  organisationUnits: {
    resource: "/organisationUnits", // API endpoint
    id: ({ id }) => id, // Dynamic ID for the resource
    params: {
      fields: ["children[id, displayName, created]"], // Fields to retrieve
      paging: false, // Disable pagination
    },
  },
};

// OrgUnitsTable component displays organisation units in a table
export function OrgUnitsTable({ id }) {
  // Use the data query hook to fetch data based on the provided ID
  const { loading, error, data, refetch } = useDataQuery(dataQuery, {
    variables: {
      id: id, // Pass the ID dynamically
    },
  });

  // Re-fetch data whenever the ID changes
  useEffect(() => {
    refetch({ id: id });
  }, [id, refetch]);

  if (loading) {
    return (
      <Center>
        <CircularLoader large aria-label="Default Loader" />
      </Center>
    );
  }

  // Display an error message if the query fails
  if (error) {
    return <span>ERROR: {error.message}</span>;
  }

  // Render a table if data is successfully fetched
  if (data) {
    // Extract the children of the root organisation unit
    const orgElements = data.organisationUnits.children;

    return (
      <div style={{ width: "100%", overflow: "scroll" }}>
        <Table>
          {/* Table headers for display name, ID, and creation date */}
          <TableHead>
            <TableRowHead>
              <TableCellHead>Display name</TableCellHead>
              <TableCellHead>ID</TableCellHead>
              <TableCellHead>Created</TableCellHead>
            </TableRowHead>
          </TableHead>
          <TableBody>
            {/* Render each organisation unit as a row */}
            {orgElements.map((orgElement) => (
              <TableRow key={orgElement.id}>
                <TableCell>{orgElement.displayName}</TableCell>
                <TableCell>{orgElement.id}</TableCell>
                <TableCell>
                  {new Date(orgElement.created).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return null; // Return nothing if no data is available
}
