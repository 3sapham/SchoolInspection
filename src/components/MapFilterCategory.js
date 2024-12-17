import React, { useEffect } from "react";
import { useLeaflet } from "react-leaflet";
import L from "leaflet";

export function MapFilterCategory({
  currentCategory,
  changeCategory,
  categoryCounts,
  colorMap,
}) {
  // Get the Leaflet map instance from react-leaflet
  const { map } = useLeaflet();

  // UseEffect hook to create a custom control on the map
  useEffect(() => {
    // Create a custom control for categories on the map
    const CategoryControl = L.Control.extend({
      onAdd: () => {
        const div = L.DomUtil.create("div", "leaflet-control-categories");
        div.style.backgroundColor = "white";
        div.style.opacity = "0.9";
        div.style.padding = "15px";
        div.style.borderRadius = "5px";
        div.style.boxShadow = "0px 0px 5px rgba(0, 0, 0, 0.2)";

        return div;
      },
    });

    // Add the category control to the bottom left of the map
    const categoryControl = new CategoryControl({ position: "bottomleft" });
    categoryControl.addTo(map);

    // Clean up the control when the component is unmounted or map changes
    return () => {
      map.removeControl(categoryControl);
    };
  }, [map]);

  // Categories to be displayed in the filter
  const categories = [
    "all schools",
    "bad condition",
    "inspection needed soon",
    "good condition",
    "scheduled",
  ];

  return (
    <div
      style={{
        position: "absolute", // Position the filter at the bottom left of the map
        bottom: "10px",
        left: "10px",
        backgroundColor: "white",
        opacity: "0.9",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
        fontSize: "12px",
      }}
    >
      <strong style={{ marginLeft: "5px", color: "#777", fontSize: "13px" }}>
        Filter schools:
      </strong>
      <div
        style={{
          display: "flex",
          flexDirection: "column", // Stack filter options vertically
          gap: "0",
          marginTop: "8px",
        }}
      >
        {/* Loop through each category and display it */}
        {categories.map((category) => {
          // Format the category name (camel case to sentence case)
          const categoryName = category
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());

          // Get the count for the category or set to 0 if not available
          const count = categoryCounts[category] || 0;

          // Check if the category is currently active (selected)
          const isActive = currentCategory === category;

          return (
            <div
              key={category}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer", // Show pointer cursor on hover
                padding: "6px",
                borderRadius: "5px",
                backgroundColor: isActive ? "teal" : "white", // Highlight the active category
                color: isActive ? "white" : "black",
                fontWeight: isActive ? "bold" : "normal",
              }}
              onClick={() => changeCategory(category)} // Change category on click
            >
              {/* Show the color for the category */}
              <span
                style={{
                  backgroundColor: colorMap[category], // Use color map for each category
                  color: "white",
                  borderRadius: "3px",
                  padding: "1px 8px",
                  marginRight: "5px",
                }}
              >
                &nbsp;
              </span>
              {categoryName}
              {/* Show the count for the category */}
              <span
                style={{
                  backgroundColor: "lightslategrey",
                  color: "white",
                  borderRadius: "5px",
                  padding: "0px 5px",
                  marginLeft: "5px",
                  fontSize: "12px",
                }}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
