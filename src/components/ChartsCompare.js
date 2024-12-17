import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import classes from "../App.module.css";
import { MultiSelectSchool } from "./MultiSelectSchool";

export function ChartsCompare({ mergedData }) {
    if (!mergedData || (Array.isArray(mergedData) && mergedData.length === 0)) {
        return <p>No completed event for this school</p>;
    }

    const events = Array.isArray(mergedData) ? mergedData : [mergedData];

    const schoolColorMap = {};
    const predefinedColors = [
        "rgba(255, 99, 132, 0.6)", // Red
        "rgba(54, 162, 235, 0.6)", // Blue
        "rgba(255, 206, 86, 0.6)", // Yellow
        "rgba(75, 192, 192, 0.6)", // Green
        "rgba(153, 102, 255, 0.6)", // Purple
        "rgba(255, 159, 64, 0.6)", // Orange
        "rgba(75, 0, 130, 0.6)", // Indigo
    ];

    let colorIndex = 0;

    const assignColor = (school) => {
        if (!schoolColorMap[school]) {
            schoolColorMap[school] =
                predefinedColors[colorIndex % predefinedColors.length];
            colorIndex++;
        }
        return schoolColorMap[school];
    };

    const conditionData = [];
    const barData = [];
    const conditionLabels = new Set();
    const barLabels = new Set();

    events.forEach((event) => {
        const color = assignColor(event.orgUnitName);

        const conditionDataset = {
            label: event.orgUnitName,
            data: [],
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
            fill: true,
        };

        const barDataset = {
            label: event.orgUnitName,
            data: [],
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
        };

        event.dataValues.forEach((dv) => {
            if (dv.valueType === "INTEGER_POSITIVE") {
                conditionDataset.data.push(dv.value);
                conditionLabels.add(dv.displayShortName);
            }

            if (dv.valueType === "NUMBER") {
                barDataset.data.push(dv.value);
                barLabels.add(dv.displayShortName);
            }
        });

        if (conditionDataset.data.length > 0) conditionData.push(conditionDataset);
        if (barDataset.data.length > 0) barData.push(barDataset);
    });

    // Limit selection to two schools by default
    const [selectedConditionSchools, setSelectedConditionSchools] = useState(
        () => conditionData.slice(0, 2).map((dataset) => dataset.label) // Default to first two schools
    );

    const [selectedBarSchools, setSelectedBarSchools] = useState(
        () => barData.slice(0, 2).map((dataset) => dataset.label) // Default to first two schools
    );

    const barChartData = {
        labels: Array.from(barLabels),
        datasets: barData.filter((dataset) =>
            selectedBarSchools.includes(dataset.label)
        ),
    };

    const conditionChartData = {
        labels: Array.from(conditionLabels),
        datasets: conditionData.filter((dataset) =>
            selectedConditionSchools.includes(dataset.label)
        ),
    };

    const conditionChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                min: 1,
                max: 5,
                ticks: { stepSize: 1 },
                title: { display: true, text: "Condition Values" },
            },
        },
        indexAxis: "y",
    };

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                title: { display: true, text: "Item category" },
            },
            y: {
                title: { display: true, text: "Total count" },
            },
        },
    };

    return (
        <div
            className={classes.cardRow}
            style={{
                display: "flex",
                gap: "20px",
                flexDirection: "column",
                marginBottom: "3em",
            }}
        >
            <h2 style={{ marginTop: "50px" }}>Compare School Resources</h2>

            {/* Bar Chart */}
            <div className={classes.cardBox} style={{ width: "80%", margin: "auto" }}>
                <div style={{ display: "flex", gap: "20px" }}
                    className={classes.resourceSelctionSection}>
                    {/* MultiSelect for Bar Chart */}
                    <MultiSelectSchool
                        label="Compare Schools for Count"
                        selected={selectedBarSchools}
                        onChange={setSelectedBarSchools}
                        schoolColorMap={schoolColorMap}
                    />
                </div>
                <Bar data={barChartData} options={barChartOptions} />
            </div>
            <h2 style={{ marginTop: "50px" }}>Compare School Conditions</h2>

            {/* Condition Chart */}
            <div className={classes.cardBox} className2={classes.chartContainer}  style={{ width: "80%", margin: "auto" }}>
                {/* MultiSelect for Condition Chart */}
                <div style={{ display: "flex", gap: "20px" }}
                    className={classes.resourceSelctionSection}>
                    <MultiSelectSchool
                        label="Compare Schools for Condition"
                        selected={selectedConditionSchools}
                        onChange={setSelectedConditionSchools}
                        schoolColorMap={schoolColorMap}
                    />
                </div>
                <Bar data={conditionChartData} options={conditionChartOptions} />
            </div>
        </div>
    );
}
