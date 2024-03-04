import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const rows = [
  ["Frozen yoghurt", 5],
  ["Ice cream sandwich", 2],
  ["Eclair", 3],
  ["Cupcake", 4],
  ["Gingerbread", 2],
];

export default function YourRatings() {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="rating table">
        <TableHead>
          <TableRow>
            <TableCell>Beer</TableCell>
            <TableCell align="right">Rating</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(([name, rating]) => (
            <TableRow
              key={name}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {name}
              </TableCell>
              <TableCell align="right">{rating}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
