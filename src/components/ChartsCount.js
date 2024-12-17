import React from "react";
// Import required components and icons from dhis2/ui and chart.js
import {
  Tooltip,
  IconQuestion24,
  IconCheckmark24,
  IconCross24,
} from "@dhis2/ui";
import classes from "../App.module.css"; // Import custom CSS styles
import { Bar } from "react-chartjs-2"; // Bar chart component
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadarController,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Legend,
  Tooltip as ChartJSTooltip,
  ArcElement,
} from "chart.js";

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartJSTooltip,
  RadarController,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Functional component to display charts and statistics
export function ChartsCount({ mergedData }) {
  console.log("in count", mergedData);

  // Handle empty or invalid data
  if (!mergedData || (Array.isArray(mergedData) && mergedData.length === 0)) {
    return <p>No completed event for this school</p>;
  }

  const events = Array.isArray(mergedData) ? mergedData : [mergedData]; // Ensure data is in array format

  const schoolColorMap = {}; // Map to assign colors to schools
  const predefinedColors = [
    // Array of predefined colors for schools
    "rgba(54, 162, 235, 0.6)", // Blue
    "rgba(255, 99, 132, 0.6)", // Red
    "rgba(255, 206, 86, 0.6)", // Yellow
    "rgba(153, 102, 255, 0.6)", // Purple
    "rgba(255, 159, 64, 0.6)", // Orange
    "rgba(60, 179, 113, 0.6)", // Green
    "rgba(75, 0, 130, 0.6)", // Indigo
  ];

  let colorIndex = 0; // Index to cycle through colors

  // Function to assign a unique color to each school
  const assignColor = (school) => {
    if (!schoolColorMap[school]) {
      schoolColorMap[school] =
        predefinedColors[colorIndex % predefinedColors.length];
      colorIndex++;
    }
    return schoolColorMap[school];
  };

  const barData = []; // Data for bar chart
  const barLabels = new Set(); // Labels for the bar chart

  const dataElementSums = {}; // Object to store the total counts for each data element
  let studentCount = 0; // Total count of students

  // Allowed data elements to display in the chart
  const allowedDataElements = [
    "Seats",
    "Desks",
    "Books",
    "Teachers",
    "Classrooms",
    "Toilets",
  ];

  // Loop through events to process data
  events.forEach((event) => {
    const color = assignColor(event.orgUnitName); // Assign color to school

    // Prepare dataset for the current school
    const barDataset = {
      label: event.orgUnitName,
      data: [],
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
    };

    // Process data values for each event
    event.dataValues.forEach((dv) => {
      if (
        allowedDataElements.includes(dv.displayShortName) &&
        dv.valueType === "NUMBER"
      ) {
        barDataset.data.push(dv.value); // Add data to dataset
        barLabels.add(dv.displayShortName); // Add label

        // Calculate sum of each data element
        if (!dataElementSums[dv.displayShortName]) {
          dataElementSums[dv.displayShortName] = 0;
        }
        dataElementSums[dv.displayShortName] += parseInt(dv.value);
      }

      if (dv.displayShortName === "Students") {
        studentCount += parseInt(dv.value); // Update student count
      }
    });

    // Add dataset if it contains data
    if (barDataset.data.length > 0) barData.push(barDataset);
  });

  // Minimum standards for ratios
  const minimumStandards = {
    Seats: 1,
    Desks: 1,
    Books: 1,
    Teachers: 45,
    Classrooms: 53,
    Toilets: 25,
  };

  // Function to calculate ratios and compare with standards
  const calculateRatio = (dataElement, sum) => {
    const ratio = (studentCount/sum).toFixed(2); // Calculate ratio
    const ratio2 = (sum/studentCount).toFixed(2); // Calculate ratio
    switch (dataElement) {
      case "Seats": // Seat-to-student ratio
      case "Desks": // Desk-to-student ratio
      case "Books": // Book-to-student ratio
        return {
          ratio: ratio2,
          threshold: ">" + minimumStandards[dataElement],
          meetsStandard: ratio2 >= minimumStandards[dataElement],
        };
      case "Teachers": // Learner-to-teacher ratio
      case "Classrooms": // Learner-to-classroom ratio
      case "Toilets": // Learner-to-toilet ratio
        return {
          ratio: ratio,
          threshold: "<" + minimumStandards[dataElement],
          meetsStandard: ratio < minimumStandards[dataElement],
        };
      default:
        return { ratio: "N/A", threshold: "N/A", meetsStandard: false };
    }
  };

  // Prepare data for the bar chart
  const barChartData = {
    labels: Array.from(barLabels), // Convert labels to array
    datasets: [
      ...barData, // Add bar datasets
      {
        label: "Minimum Standard",
        data: Array.from(barLabels).map(
          (label) => studentCount / minimumStandards[label]
        ), // Calculate minimums
        type: "line", // Line chart for standards
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        borderColor: "rgba(0, 0, 0, 1)",
        borderWidth: 2,
        borderDash: [5, 5], // Dashed line
        pointRadius: 1,
        stepped: "middle",
      },
    ],
  };

  // Options for the bar chart
  const barChartOptions = {
    plugins: {
      title: {
        display: true,
        text: "School Resources Summary",
        font: {
          size: 16,
        },
      },
      legend: {
        position: "bottom",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Item category",
        },
        stacked: true, // Stacked bars
      },
      y: {
        title: {
          display: true,
          text: "Total count",
        },
        stacked: true, // Stacked bars
      },
    },
  };

  return (
    <div style={{ marginBottom: "6em", marginTop: "3em" }}>
      <h2 className={classes.headingStyling}>Summary of School Resources</h2>
      <div className={classes.cardRow}>
        <div className={classes.cardBox} >
          <div
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              marginBottom: "15px",
            }}
          >
            <p>Total Students</p>
            <h3 className={classes.count}>{studentCount}</h3>
          </div>
          {/* Display resources and their ratios */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            {Object.keys(dataElementSums).map((dataElement) => {
              const sum = dataElementSums[dataElement];
              const { ratio, threshold, meetsStandard } = calculateRatio(
                dataElement,
                sum
              );
              const statusText = meetsStandard
                ? "Meets the minimum standard"
                : "Does not meet the minimum standard";
              const statusColor = meetsStandard ? "green" : "red";

              return (
                <div
                  key={dataElement}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    borderRadius: "8px",
                        flex: "1 1 calc(33.3% - 16px)"

                  }}
                >
                  <p style={{ marginBottom: 0 }}>{dataElement}</p>
                  <div
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      margin: 0,
                    }}
                  >
                    {/* Icon for status */}
                    <div style={{ paddingRight: "3px", marginTop: "5px" }}>
                      {statusColor === "green" ? (
                        <IconCheckmark24 color="rgba(60, 179, 113)" />
                      ) : (
                        <IconCross24 color="rgba(255, 99, 132)" />
                      )}
                    </div>
                    {/* Display ratio and tooltip */}
                    <h3 style={{ fontSize: "1.5rem", margin: 0 }}>
                      {sum}
                      <Tooltip
                        content={
                          <div style={{ padding: "10px" }}>
                            <p
                              style={{
                                backgroundColor:
                                  statusColor === "green"
                                    ? "rgba(60, 179, 113)"
                                    : "rgba(255, 99, 132)",
                                fontSize: "1rem",
                                fontWeight: "bold",
                                padding: "1em",
                                borderRadius: "8px",
                              }}
                            >
                              {statusText} ({threshold}:1)
                            </p>
                            <p>Student-{dataElement} Ratio: </p>
                            <p
                              style={{
                                color:
                                  statusColor === "green"
                                    ? "rgba(60, 179, 113)"
                                    : "rgba(255, 99, 132)",
                                fontSize: "1.2rem",
                                fontWeight: "bold",
                                marginTop: 0,
                              }}
                            >
                              {ratio}:1
                            </p>
                          </div>
                        }
                      >
                        <IconQuestion24 />
                      </Tooltip>
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={classes.cardBox} style={{width: "100%"}}>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>
    </div>
  );
}
