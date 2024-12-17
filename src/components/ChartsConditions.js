import React from "react";
// Import required components and tools for rendering charts, tables, tooltips, etc.
import {
  Tooltip,
  IconQuestion24,
  Table,
  TableHead,
  TableRowHead,
  TableCellHead,
  TableBody,
  TableRow,
  TableCell,
} from "@dhis2/ui";
import { Radar, Doughnut } from "react-chartjs-2";
import classes from "../App.module.css";

// Import necessary Chart.js components for rendering radar and doughnut charts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadarController,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Legend,
  ArcElement,
} from "chart.js";

// Register the required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadarController,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Legend,
  ArcElement
);

export function ChartsConditions({ mergedData }) {
  // Return a message if no data is available for the provided school(s)
  if (!mergedData || (Array.isArray(mergedData) && mergedData.length === 0)) {
    return <p>No completed event for this school</p>;
  }

  console.log(mergedData); // Debugging: Log the merged data

  // Ensure data is always in array format for consistent processing
  const events = Array.isArray(mergedData) ? mergedData : [mergedData];

  const schoolColorMap = {}; // Map to store color assignment for each school
  const predefinedColors = [
    "rgba(255, 99, 132, 0.6)", // Red
    "rgba(54, 162, 235, 0.6)", // Blue
    "rgba(255, 206, 86, 0.6)", // Yellow
    "rgba(60, 179, 113, 0.6)", // Green
    "rgba(153, 102, 255, 0.6)", // Purple
    "rgba(255, 159, 64, 0.6)", // Orange
    "rgba(75, 0, 130, 0.6)", // Indigo
  ];

  let colorIndex = 0; // Index to cycle through predefined colors

  // Function to assign a unique color to each school
  const assignColor = (school) => {
    if (!schoolColorMap[school]) {
      schoolColorMap[school] =
        predefinedColors[colorIndex % predefinedColors.length];
      colorIndex++;
    }
    return schoolColorMap[school];
  };

  const radarData = []; // Data for the radar chart
  const radarLabels = new Set(); // Labels for the radar chart
  const doughnutCounts = {}; // Data for the doughnut chart
  const categoryScores = {}; // Object to store total scores for each category

  // Process each event to prepare data for charts
  events.forEach((event) => {
    const color = assignColor(event.orgUnitName); // Assign a color to the school

    const radarDataset = {
      label: event.orgUnitName,
      data: [],
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
      fill: true, // Fill the radar chart area with color
    };

    event.dataValues.forEach((dv) => {
      if (dv.valueType === "INTEGER_POSITIVE") {
        const value = dv.value === null ? 0 : parseInt(dv.value); // Parse values or default to 0

        radarDataset.data.push(dv.value); // Add data to radar chart dataset
        radarLabels.add(dv.displayShortName); // Add unique labels to radar chart

        // Update doughnut chart data counts
        doughnutCounts[dv.value] = (doughnutCounts[dv.value] || 0) + 1;

        // Calculate cumulative scores for categories
        categoryScores[dv.displayShortName] =
          (categoryScores[dv.displayShortName] || 0) + value;
      }
    });

    if (radarDataset.data.length > 0) radarData.push(radarDataset); // Add dataset if it has data
  });

  // Radar chart data configuration
  const radarChartData = {
    labels: Array.from(radarLabels),
    datasets: radarData,
  };

  // Radar chart options for display
  const radarChartOptions = {
    plugins: {
      title: {
        display: true,
        text: "Radar Chart - School Condition Summary",
        font: {
          size: 16, // Font size for the title
        },
      },
      legend: {
        position: "bottom", // Place the legend at the bottom
      },
    },
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 5, // Set min and max scores for the radar chart
        ticks: {
          stepSize: 1, // Step size for tick marks
        },
      },
    },
  };

  // Calculate overall scores for the doughnut chart
  const totalMaxScore = 5 * events.length * 5; // Maximum possible score
  const totalScore = Object.values(categoryScores).reduce(
    (sum, score) => sum + score,
    0
  );

  // Determine the overall condition based on score percentage
  let condition = "Bad";
  const scorePercentage = ((totalScore / totalMaxScore) * 100).toFixed(); // Calculate percentage score
  if (scorePercentage >= 75) {
    condition = "Good";
  } else if (scorePercentage >= 50) {
    condition = "OK";
  }

  // Set doughnut chart color dynamically based on condition
  let doughnutColor = "rgba(255, 99, 132)"; // Default to red for "Bad"
  if (condition === "Good") {
    doughnutColor = "rgba(60, 179, 113)"; // Green for "Good"
  } else if (condition === "OK") {
    doughnutColor = "orange"; // Orange for "OK"
  }

  // Create a scoreboard displaying scores for each category
  const scoreboard = Object.entries(categoryScores).map(
    ([category, score]) => ({
      category,
      score,
      maxScore: 5 * events.length, // Maximum score per category
    })
  );

  // Doughnut chart data configuration
  const doughnutChartData = {
    labels: ["Score"],
    datasets: [
      {
        label: "Total",
        data: [scorePercentage, 100 - scorePercentage], // Data for score percentage and remaining
        backgroundColor: [doughnutColor, "rgba(169, 169, 169, 1)"], // Use dynamic color for condition
        borderWidth: 1, // Border width for chart slices
      },
    ],
  };

  // Doughnut chart options for display
  const doughnutChartOptions = {
    plugins: {
      legend: {
        position: "bottom", // Place legend at the bottom
      },
    },
  };

  return (
    <div style={{ marginBottom: "3em" }}>
      <h2 className={classes.headingStyling}>Summary of School Condition</h2>
      <div className={classes.cardRow}>
        {/* Doughnut Chart */}
        <div className={classes.cardBox} style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "15px", fontWeight: "600" }}>
            Overall Condition
          </h3>
          {/* Display percentage score */}
          <p
            style={{ fontSize: "1.2em", margin: 0 }}
          >{`${scorePercentage}%`}</p>
          {/* Display condition with corresponding color */}
          <p
            style={{
              fontWeight: "bold",
              color:
                condition === "Good"
                  ? "green"
                  : condition === "OK"
                  ? "orange"
                  : "red",
            }}
          >
            {`Condition: ${condition}`}
            {/* Tooltip explaining score thresholds */}
            <Tooltip
              content={
                <div
                  style={{ padding: "10px", fontSize: "1.2em", color: "black" }}
                >
                  <p
                    style={{
                      backgroundColor: "rgba(255, 99, 132)",
                      borderRadius: "8px",
                      padding: "1em",
                      fontWeight: "600",
                    }}
                  >
                    Bad: 0-50%
                  </p>
                  <p
                    style={{
                      backgroundColor: "rgba(255, 159, 64)",
                      borderRadius: "8px",
                      padding: "1em",
                      fontWeight: "600",
                    }}
                  >
                    OK: 51-75%
                  </p>
                  <p
                    style={{
                      backgroundColor: "rgba(60, 179, 113)",
                      borderRadius: "8px",
                      padding: "1em",
                      fontWeight: "600",
                    }}
                  >
                    Good: 76-100%
                  </p>
                </div>
              }
            >
              <IconQuestion24 />
            </Tooltip>
          </p>
          {/* Render Doughnut Chart */}
          <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
        </div>

        {/* Scoreboard */}
        <div className={classes.cardBox} style={{ flex: "1" }}>
          <h3
            style={{
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "20px",
            }}
          >
            Scoreboard
          </h3>
          <Table style={{ width: "100%" }}>
            <TableHead>
              <TableRowHead>
                <TableCellHead>Category</TableCellHead>
                <TableCellHead>Score</TableCellHead>
              </TableRowHead>
            </TableHead>
            <TableBody>
              {scoreboard.map(({ category, score, maxScore }) => (
                <TableRow key={category}>
                  <TableCell>{category}</TableCell>
                  <TableCell>
                    {/* Highlight missing facilities in red */}
                    <span style={{ color: score == 0 ? "red" : "black" }}>
                      {score == 0
                        ? "Missing facility"
                        : `${score} / ${maxScore}`}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Display final score */}
          <p
            style={{ fontWeight: "600" }}
          >{`Final Score: ${totalScore} / ${totalMaxScore}`}</p>
        </div>

        {/* Radar Chart */}
        <div className={classes.radarContainer} >
          <Radar data={radarChartData} options={radarChartOptions} />
        </div>
      </div>
    </div>
  );
}
