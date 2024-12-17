import { useDataQuery } from "@dhis2/app-runtime";
import {
  SingleSelectField,
  SingleSelectOption,
  CircularLoader,
  Center,
} from "@dhis2/ui";
import { Field } from "react-final-form";

// Define a data query to fetch the organisation unit data (schools) for selection
const dataQuery = {
  jambalayaCluster: {
    resource: "organisationUnits/Jj1IUjjPaWf", // Resource endpoint for fetching organisation units
    params: {
      fields: ["children[displayName,id]"], // Fetch only the children with displayName and id
      paging: false, // Disable paging to fetch all data in one request
    },
  },
};

// Component to render a school selector dropdown
export function SelectSchool({ selectedSchoolId, setSelectedSchoolId }) {
  const { loading, error, data } = useDataQuery(dataQuery);

  if (error) {
    return <span>ERROR: {error.message}</span>;
  }

  if (loading) {
    return (
      <Center>
        <CircularLoader large aria-label="Loading schools" />
      </Center>
    );
  }

  // Map the fetched school data to options for the dropdown
  const schoolOptions = data.jambalayaCluster.children.map((school) => ({
    label: school.displayName,
    value: school.id,
  }));

  // Render the school selection field using react-final-form
  return (
    <Field
      name="selectedSchoolId"
      // Add validation to ensure a school is selected
      validate={(value) => (value ? undefined : "School selection is required")}
      render={({ input, meta }) => (
        <SingleSelectField
          {...input} // Pass form input props to the SingleSelectField
          clearText="Clear"
          empty="No data found"
          placeholder="School name"
          filterable
          label="Select school"
          error={meta.touched && meta.error}
          validationText={meta.touched && meta.error ? meta.error : ""}
          onChange={({ selected }) => {
            setSelectedSchoolId(selected); // Update the selected school ID in the parent component
            input.onChange(selected); // Update the form field value
          }}
          selected={selectedSchoolId || ""} // Set the currently selected value
        >
          {/* Render each school as an option in the dropdown */}
          {schoolOptions.map((school) => (
            <SingleSelectOption
              key={school.value}
              label={school.label}
              value={school.value}
            />
          ))}
        </SingleSelectField>
      )}
    />
  );
}
