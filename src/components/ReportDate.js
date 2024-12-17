import { CalendarInput } from "@dhis2/ui";
import { Field } from "react-final-form";

// Component for selecting and displaying a report date
export function ReportDate({ selectedDate, setSelectedDate }) {
  // Function to convert a date string to the local date format (YYYY-MM-DD)
  const convertToLocalDate = (dateString) => {
    if (!dateString) return null; // If no date string is provided, return null
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    // Return the formatted date string in YYYY-MM-DD format
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  };

  return (
    // Render a Field component for form integration
    <Field
      name="reportDate"
      validate={(value) => (value ? undefined : "Required")} // Validation to ensure a value is selected
      render={({ input: { value, onChange }, meta }) => (
        <CalendarInput
          calendar="gregory"
          label="Report Date"
          placeholder="YYYY-MM-DD"
          date={convertToLocalDate(selectedDate)} // Set the initial date value
          onDateSelect={(selectedDate) => {
            // When a date is selected, update the state and form value
            setSelectedDate(selectedDate.calendarDateString);
            onChange(selectedDate.calendarDateString);
          }}
          error={meta.touched && meta.error} // Show error state if the field was touched and is invalid
          validationText={
            meta.touched && meta.error ? "Date is required" : "" // Show validation message if there is an error
          }
        />
      )}
    />
  );
}
