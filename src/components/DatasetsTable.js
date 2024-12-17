import React, { useEffect } from "react"; // Import React and useEffect hook
import { useDataQuery } from "@dhis2/app-runtime"; // Import custom hook for querying data
import { CircularLoader, Center } from "@dhis2/ui"; // Import UI components for loading spinner and centering
import {
  Table, // Import table components from DHIS2 UI
  TableHead,
  TableRowHead,
  TableCellHead,
  TableBody,
  TableRow,
  TableCell,
} from "@dhis2/ui";

// Define the data query to fetch data element groups with specific fields
const dataQuery = {
  dataSets: {
    resource: "/dataElementGroups", // API endpoint for data element groups
    id: ({ id }) => id, // Dynamic id parameter for the query
    params: {
      fields: ["dataElements[id,displayFormName,created]"], // Specify the fields to fetch
      paging: false, // Disable paging for the results
    },
  },
};

export function DatasetsTable({ id }) {
  // Use the useDataQuery hook to fetch data based on the provided 'id'
  const { loading, error, data, refetch } = useDataQuery(dataQuery, {
    variables: {
      id: id, // Pass the id prop as the query variable
    },
  });

  // Re-fetch the data when the 'id' changes
  useEffect(() => {
    refetch({ id: id });
  }, [id]);

  // Show a loading spinner while data is being fetched
  if (loading) {
    return (
      <Center>
        {" "}
        {/* Center the loader in the middle of the screen */}
        <CircularLoader large aria-label="Default Loader" />{" "}
        {/* Display a large circular loader */}
      </Center>
    );
  }

  // Show an error message if there was an issue with the query
  if (error) {
    return <span>ERROR: {error.message}</span>; // Display error message
  }

  // If data is available, render the data in a table
  if (data) {
    const dataElements = data.dataSets.dataElements; // Extract the data elements from the fetched data

    return (
      <div style={{ width: "100%", overflow: "scroll" }}>
        {" "}
        {/* Allow horizontal scrolling for large tables */}
        <Table>
          {/* Table Header */}
          <TableHead>
            <TableRowHead>
              <TableCellHead>Display name</TableCellHead>{" "}
              {/* Header for the display name column */}
              <TableCellHead>ID</TableCellHead> {/* Header for the ID column */}
              <TableCellHead>Created</TableCellHead>{" "}
              {/* Header for the created date column */}
            </TableRowHead>
          </TableHead>
          {/* Table Body */}
          <TableBody>
            {/* Map through the data elements and render each one in a row */}
            {dataElements.map((dataElement) => {
              return (
                <TableRow key={dataElement.id}>
                  <TableCell>{dataElement.displayFormName}</TableCell>{" "}
                  <TableCell>{dataElement.id}</TableCell>{" "}
                  <TableCell>
                    {/* Format and display the created date */}
                    {new Date(dataElement.created).toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
}
