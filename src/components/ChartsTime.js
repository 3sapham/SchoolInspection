import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  MultiSelectField,
  MultiSelectOption,
  SingleSelectField,
  SingleSelectOption,
} from "@dhis2/ui";
import classes from "../App.module.css";

// Predefined set of colors for the chart lines
const colors = [
  "rgba(54, 162, 235, 0.6)", // Blue
  "rgba(255, 99, 132, 0.6)", // Red
  "rgba(255, 206, 86, 0.6)", // Yellow
  "rgba(153, 102, 255, 0.6)", // Purple
  "rgba(255, 159, 64, 0.6)", // Orange
  "rgba(60, 179, 113, 0.6)", // Green
  "rgba(75, 0, 130, 0.6)", // Indigo
];

export function ChartsTime({ events }) {
  // If no events data, display a message
  if (!events || (Array.isArray(events) && events.length === 0)) {
    return <p>No data available to display.</p>;
  }

  // Extract unique organization units (schools)
  const orgUnits = Array.from(
    new Set(events.map((event) => event.orgUnitName))
  );

  // Extract unique data elements for "NUMBER" valueType
  const dataElementsNumber = Array.from(
    new Set(
      events.flatMap((event) =>
        event.dataValues
          .filter((dv) => dv.valueType === "NUMBER")
          .map((dv) => dv.dataElement)
      )
    )
  );

  // Extract unique data elements for "INTEGER_POSITIVE" valueType
  const dataElementsIntegerPositive = Array.from(
    new Set(
      events.flatMap((event) =>
        event.dataValues
          .filter((dv) => dv.valueType === "INTEGER_POSITIVE")
          .map((dv) => dv.dataElement)
      )
    )
  );

  // Mapping of data elements to their short names for display
  const dataElementNames = {};
  events.forEach((event) => {
    event.dataValues.forEach((dv) => {
      if (!dataElementNames[dv.dataElement]) {
        dataElementNames[dv.dataElement] = dv.displayShortName;
      }
    });
  });

  // State for the charts (for both NUMBER and INTEGER_POSITIVE value types)
  const [chartNumberState, setChartNumberState] = useState({
    selectedOrgUnit: orgUnits[0], // Default to first orgUnit
    selectedDataElements: dataElementsNumber.slice(0, 3), // Default to first 3 dataElements
  });

  const [chartIntegerPositiveState, setChartIntegerPositiveState] = useState({
    selectedOrgUnit: orgUnits[0], // Default to first orgUnit
    selectedDataElements: dataElementsIntegerPositive.slice(0, 3), // Default to first 3 dataElements
  });

  // Function to update state for the "NUMBER" chart
  const handleNumberChartChange = (key, value) => {
    setChartNumberState((prev) => ({ ...prev, [key]: value }));
  };

  // Function to update state for the "INTEGER_POSITIVE" chart
  const handleIntegerPositiveChartChange = (key, value) => {
    setChartIntegerPositiveState((prev) => ({ ...prev, [key]: value }));
  };

  // Prepare chart data based on selected orgUnit and data elements
  const prepareChartData = (orgUnit, dataElements, valueType) => {
    const dateMap = new Map();

    // Filter events by orgUnit and accumulate data by date
    events
      .filter((event) => event.orgUnitName === orgUnit)
      .forEach((event) => {
        event.dataValues
          .filter(
            (dv) =>
              dataElements.includes(dv.dataElement) &&
              dv.valueType === valueType
          )
          .forEach((dv) => {
            const date = new Date(event.occurredAt)
              .toLocaleDateString()
              .split("T")[0]; // Format date
            if (!dateMap.has(date)) {
              dateMap.set(date, {});
            }
            const dataOnDate = dateMap.get(date);
            dataOnDate[dv.dataElement] =
              (dataOnDate[dv.dataElement] || 0) + parseFloat(dv.value);
          });
      });

    // Sort dates
    const labels = Array.from(dateMap.keys()).sort(
      (b, a) => new Date(a) - new Date(b)
    );

    // Prepare datasets for the chart
    const datasets = dataElements.map((dataElement, index) => {
      const data = labels.map((date) => dateMap.get(date)?.[dataElement] || 0);
      return {
        label: dataElementNames[dataElement] || dataElement, // Use name or ID for label
        data,
        fill: false,
        borderColor: colors[index % colors.length], // Use predefined colors
        backgroundColor: colors[index % colors.length],
        tension: 0.1, // Line smoothing
      };
    });

    return { labels, datasets };
  };

  // Prepare chart data for NUMBER valueType
  const chartNumberData = prepareChartData(
    chartNumberState.selectedOrgUnit,
    chartNumberState.selectedDataElements,
    "NUMBER"
  );

  // Prepare chart data for INTEGER_POSITIVE valueType
  const chartIntegerPositiveData = prepareChartData(
    chartIntegerPositiveState.selectedOrgUnit,
    chartIntegerPositiveState.selectedDataElements,
    "INTEGER_POSITIVE"
  );

  // Options for the chart (styling and axes)
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true, // Show legend
        position: "bottom", // Position the legend at the bottom
      },
      title: {
        display: false, // Do not display title
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date", // X-axis title
        },
      },
      y: {
        title: {
          display: true,
          text: "Value", // Y-axis title
        },
      },
    },
  };

  return (
    <div
      className={classes.cardRow}
      style={{
        display: "flex", // Flexbox layout
        gap: "20px", // Gap between elements
        flexDirection: "column", // Stack elements vertically
        marginBottom: "3em", // Margin at the bottom
      }}
    >
      {/* NUMBER Chart Section */}
      <h2 style={{ marginTop: "50px" }}>School Resource Trends</h2>
      <div className={classes.cardBox} style={{ width: "80%", margin: "auto" }}>
        <div
          style={{ display: "flex", gap: "20px" }}
          className={classes.resourceSelctionSection}
        >
          <div>
            <SingleSelectField
              label="Select School"
              selected={chartNumberState.selectedOrgUnit}
              onChange={({ selected }) =>
                handleNumberChartChange("selectedOrgUnit", selected)
              }
            >
              {orgUnits.map((orgUnit) => (
                <SingleSelectOption
                  key={orgUnit}
                  label={orgUnit}
                  value={orgUnit}
                />
              ))}
            </SingleSelectField>
          </div>
          <div>
            <MultiSelectField
              label="Select Resources"
              selected={chartNumberState.selectedDataElements}
              onChange={({ selected }) =>
                handleNumberChartChange("selectedDataElements", selected)
              }
              inputWidth="600px" // Set width of the input field
            >
              {dataElementsNumber.map((dataElement) => (
                <MultiSelectOption
                  key={dataElement}
                  label={dataElementNames[dataElement] || dataElement}
                  value={dataElement}
                />
              ))}
            </MultiSelectField>
          </div>
        </div>
        <Line data={chartNumberData} options={chartOptions} />
      </div>

      {/* INTEGER_POSITIVE Chart Section */}
      <h2 style={{ marginTop: "50px" }}>School Condition Trends</h2>
      <div className={classes.cardBox} style={{ width: "80%", margin: "auto" }}>
        <div
          style={{ display: "flex", gap: "20px" }}
          className={classes.resourceSelctionSection}
        >
          <SingleSelectField
            label="Select School"
            selected={chartIntegerPositiveState.selectedOrgUnit}
            onChange={({ selected }) =>
              handleIntegerPositiveChartChange("selectedOrgUnit", selected)
            }
          >
            {orgUnits.map((orgUnit) => (
              <SingleSelectOption
                key={orgUnit}
                label={orgUnit}
                value={orgUnit}
              />
            ))}
          </SingleSelectField>
          <MultiSelectField
            label="Select Resources"
            selected={chartIntegerPositiveState.selectedDataElements}
            onChange={({ selected }) =>
              handleIntegerPositiveChartChange("selectedDataElements", selected)
            }
            inputWidth="600px" // Set width of the input field
          >
            {dataElementsIntegerPositive.map((dataElement) => (
              <MultiSelectOption
                key={dataElement}
                label={dataElementNames[dataElement] || dataElement}
                value={dataElement}
              />
            ))}
          </MultiSelectField>
        </div>
        <Line data={chartIntegerPositiveData} options={chartOptions} />
      </div>
    </div>
  );
}
