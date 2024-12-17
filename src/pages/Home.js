import { useDataQuery } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import React, { useState } from "react";
import { TabBar, Tab, IconHome24, IconVisualizationColumn24 } from "@dhis2/ui";
import { Dashboard } from "./Dashboard";
import { Report } from "./Report";

// Data query to fetch user information (me)
const query = {
  me: {
    resource: "me", // Resource to fetch logged-in user info
  },
};

const Home = ({
  onNavigateToInspection,
  activePageHandler,
  navigateToReportSummary,
}) => {
  const { error, loading, data } = useDataQuery(query); // Fetch data using useDataQuery hook
  const [activeTab, setActiveTab] = useState("Dashboard"); // State to track active tab (default is Dashboard)
  const [selectedOrgUnitForReport, setSelectedOrgUnitForReport] =
    useState(null); // State for storing selected organization unit for the report

  // Display error message if there's an error while fetching data
  if (error) {
    return <span>{i18n.t("ERROR")}</span>;
  }

  // Display loading message while data is being fetched
  if (loading) {
    return <span>{i18n.t("Loading...")}</span>;
  }

  // Function to navigate to the report tab when an organization unit is selected
  function navigateToReportSummary(orgUnitId) {
    setSelectedOrgUnitForReport(orgUnitId); // Set the selected org unit for the report
    setActiveTab("Report"); // Switch the active tab to Report
  }

  // Function to handle tab change (Dashboard or Report)
  const handleTabChange = (tab) => {
    setActiveTab(tab); // Set the active tab to the selected tab
  };

  return (
    <div>
      {/* Tab navigation bar */}
      <TabBar fixed>
        {/* Dashboard Tab */}
        <Tab
          key={"Dashboard"}
          value={"Dashboard"}
          selected={activeTab === "Dashboard"} // Check if Dashboard tab is selected
          onClick={() => handleTabChange("Dashboard")} // Switch to Dashboard tab on click
          icon={<IconHome24 />} // Icon for Dashboard tab
        >
          Dashboard
        </Tab>
        {/* Report Tab */}
        <Tab
          key={"Report"}
          value={"Report"}
          selected={activeTab === "Report"} // Check if Report tab is selected
          onClick={() => handleTabChange("Report")} // Switch to Report tab on click
          icon={<IconVisualizationColumn24 color="#6C7787" />} // Icon for Report tab
        >
          Management Report
        </Tab>
      </TabBar>

      {/* Conditional rendering of content based on the selected tab */}
      {activeTab === "Dashboard" && (
        <Dashboard
          onNavigateToInspection={onNavigateToInspection} // Pass down props for inspection navigation
          activePageHandler={activePageHandler} // Pass activePageHandler prop
          navigateToReportSummary={navigateToReportSummary} // Pass function for navigating to the report
        />
      )}

      {/* Render the Report component if Report tab is selected */}
      {activeTab === "Report" && (
        <Report selectedOrgUnitForReport={selectedOrgUnitForReport} /> // Pass selected org unit for the report
      )}
    </div>
  );
};

export default Home;
