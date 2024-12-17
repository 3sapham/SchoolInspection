import React from "react";
import { MultiSelectField, MultiSelectOption } from "@dhis2/ui";
import classes from "../App.module.css";

export function MultiSelectSchool({ selected, onChange, schoolColorMap }) {
  return (
      <div className={classes.multiSelectSchoolSection}>
        <MultiSelectField
          inputWidth="100%"
          label="Select Schools"
          selected={selected}
          onChange={({ selected }) => onChange(selected)}
          placeholder="Choose schools to display"
        >
          {Object.entries(schoolColorMap).map(([school, color]) => (
            <MultiSelectOption
              key={school}
              label={school}
              value={school}
              style={{
                color,
                fontWeight: selected.includes(school) ? "bold" : "normal",
              }}
            />
          ))}
        </MultiSelectField>
      </div>
  );
}
