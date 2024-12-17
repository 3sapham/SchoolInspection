import React, { useState, useRef } from "react";
import { Map, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import { useDataQuery } from "@dhis2/app-runtime";
import "leaflet/dist/leaflet.css";
import { icon } from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Button } from "@dhis2/ui";

const { Overlay } = LayersControl;

export function MapOrgLevel() {
  // State variables to track the current level and selected region/district
  const [currentLevel, setCurrentLevel] = useState(2);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [currentDistrict, setCurrentDistrict] = useState(null);

  // Reference for the map instance
  const mapRef = useRef();

  // Requests for different levels (Region, District, School)
  const requests = {
    level2: { resource: "organisationUnits.geojson", params: { level: "2" } },
    level3: { resource: "organisationUnits.geojson", params: { level: "3" } },
    level4: { resource: "organisationUnits.geojson", params: { level: "4" } },
  };

  // Fetch map data using the useDataQuery hook
  const { loading, error, data } = useDataQuery(requests);

  // Loading and error handling
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading map data</div>;

  // Custom marker icon for level 4 (school)
  const customIcon = icon({
    iconUrl: markerIcon,
    iconSize: [25, 41],
    shadowUrl: markerShadow,
    shadowSize: [41, 41],
    shadowAnchor: [12, 21],
  });

  // Handle feature click to set the current region or district and move to the next level
  const handleFeatureClick = (feature) => {
    const level = feature.properties.level;
    if (level === "2") {
      setCurrentRegion(feature);
      setCurrentLevel(3);
    } else if (level === "3") {
      setCurrentDistrict(feature);
      setCurrentLevel(4);
    }
  };

  // Bind popup and tooltip to each feature, and set custom styles for each level
  const onEachFeature = (feature, layer) => {
    if (feature.properties?.name) {
      // Create and bind the popup content
      const propertiesContent = Object.entries(feature.properties)
        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
        .join("<br/>");

      layer.bindPopup(propertiesContent, {
        direction: "top",
        permanent: false,
        offset: [0, -10],
      });
      layer.bindTooltip(feature.properties.name, {
        direction: "top",
        permanent: false,
        offset: [0, -18],
      });

      // Set custom icon for level 4 (school)
      if (feature.properties.level === "4") {
        layer.setIcon(customIcon);
      }

      // Style changes on hover
      layer.on("mouseover", () => {
        if (layer.setStyle) {
          layer.setStyle({ weight: 5, fillOpacity: 1 });
        }
        layer.openTooltip();
      });

      layer.on("mouseout", () => {
        if (layer.setStyle) {
          layer.setStyle(levelStyle[feature.properties.level]);
        }
        layer.closeTooltip();
      });

      // Handle click event on feature
      layer.on("click", () => {
        handleFeatureClick(feature);
        if (layer.getBounds) {
          mapRef.current.leafletElement.fitBounds(layer.getBounds());
        }
      });
    }
  };

  // Styling for different levels (Region, District, School)
  const levelStyle = {
    2: { color: "red", weight: 2, opacity: 1, fillOpacity: 0.3 }, // Region
    3: { color: "blue", weight: 2, opacity: 1, fillOpacity: 0.3 }, // District
    4: { color: "green", weight: 2, opacity: 1, fillOpacity: 0.3 }, // School
  };

  // Render GeoJSON data based on the current level
  const renderLevel = (level) => {
    let geoJsonData = null;
    if (level === 2 && data.level2) {
      geoJsonData = data.level2;
    } else if (level === 3 && data.level3 && currentRegion) {
      geoJsonData = {
        features: data.level3.features.filter(
          (feature) => feature.properties.parent === currentRegion.id
        ),
      };
    } else if (level === 4 && data.level4 && currentDistrict) {
      geoJsonData = {
        features: data.level4.features.filter(
          (feature) => feature.properties.parent === currentDistrict.id
        ),
      };
    }

    return geoJsonData ? (
      <GeoJSON
        data={geoJsonData}
        style={levelStyle[level]}
        onEachFeature={onEachFeature}
      />
    ) : null;
  };

  // Move up a level when the button is clicked
  const goUpLevel = () => {
    if (currentLevel === 4) {
      setCurrentDistrict(null);
      setCurrentLevel(3);
      mapRef.current.leafletElement.setZoom(10);
    } else if (currentLevel === 3) {
      setCurrentRegion(null);
      setCurrentLevel(2);
      mapRef.current.leafletElement.setZoom(9);
    }
  };

  return (
    <div>
      {/* Button to go up a level */}
      <Button onClick={goUpLevel}>Level Up</Button>

      {/* Leaflet map container */}
      <Map
        center={[13.4432, -15.3101]}
        zoom={9}
        style={{ width: "100%", height: "600px" }}
        ref={mapRef}
      >
        {/* OpenStreetMap tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Layers control to toggle visibility of different levels */}
        <LayersControl position="topright">
          <Overlay name="Region" checked={currentLevel === 2}>
            {renderLevel(2)}
          </Overlay>
          <Overlay name="District" checked={currentLevel === 3}>
            {renderLevel(3)}
          </Overlay>
          <Overlay name="School" checked={currentLevel === 4}>
            {renderLevel(4)}
          </Overlay>
        </LayersControl>
      </Map>
    </div>
  );
}
