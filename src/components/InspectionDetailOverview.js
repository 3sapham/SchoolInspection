import {
  Table,
  TableHead,
  TableRowHead,
  TableCellHead,
  TableBody,
  TableRow,
  TableCell,
} from "@dhis2/ui";

export function InspectionDetailOverview({ eventData }) {
  return (
    <Table>
      {/* Table header with column titles */}
      <TableHead>
        <TableRowHead>
          <TableCellHead>Display Name</TableCellHead>
          <TableCellHead>Value</TableCellHead>
        </TableRowHead>
      </TableHead>
      <TableBody>
        {eventData.map((row) => (
          <TableRow key={row.id}>
            {/* Display the "displayFormName" in the first column */}
            <TableCell>{row.displayFormName}</TableCell>
            {/* Display the "value" in the second column */}
            <TableCell>{row.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
