import { useDataQuery } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import React, { useState } from "react";
import { Dashboard } from "./pages/Dashboard";
import { SchoolInspection } from "./pages/SchoolInspection";
import { Report } from "./pages/Report";
import Home from "./pages/Home";
import "leaflet/dist/leaflet.css";
import classes from "./App.module.css";

const query = {
  me: {
    resource: "me", // Query to fetch current user's data
  },
};

const MyApp = () => {
  const [activePage, setActivePage] = useState("Home"); // State for tracking the active page
  const { error, loading, data } = useDataQuery(query); // Hook for data fetching
  const [inspectionData, setInspectionData] = useState(null); // State for storing inspection data

  // Function to navigate to an inspection, pre-filling details if scheduled
  const navigateToInspection = (event) => {
    if (event.status === "SCHEDULE") {
      setInspectionData({
        date: new Date(event.occurredAt).toISOString(), // Pre-fill date for inspection
        school: event.orgUnit, // Pre-fill school ID
      });
    } else {
      setInspectionData(null); // Reset data if not scheduled
    }
    setActivePage("SchoolInspection");
  };

  // Function to change the active page
  function activePageHandler(page) {
    setActivePage(page);
  }

  if (error) {
    return <span>{i18n.t("ERROR")}</span>;
  }

  if (loading) {
    return <span>{i18n.t("Loading...")}</span>;
  }

  // Main return block rendering different components based on the active page
  return (
    <div className={classes.container}>
      <div>
        {activePage === "Home" && (
          <Home
            onNavigateToInspection={navigateToInspection} // Pass navigation handler
            activePageHandler={activePageHandler} // Pass page handler
          />
        )}
        {activePage === "SchoolInspection" && (
          <SchoolInspection
            date={inspectionData?.date} // Pass inspection date if available
            school={inspectionData?.school} // Pass school ID if available
            activePageHandler={activePageHandler} // Pass page handler
          />
        )}
        {activePage === "Dashboard" && (
          <Dashboard
            onNavigateToInspection={navigateToInspection} // Pass navigation handler
            activePageHandler={activePageHandler} // Pass page handler
          />
        )}
        {activePage === "Report" && <Report />}
      </div>
    </div>
  );
};

export default MyApp;
