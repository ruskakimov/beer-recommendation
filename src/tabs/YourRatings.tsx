import {
  Paper,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const rows: [string, number][] = [
  ["Sausa Weizen", 5],
  ["Red Moon", 2],
  ["Black Horse Black Beer", 3],
  ["Sausa Pils", 4],
  ["Cauldron DIPA", 2],
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
              <TableCell align="right">
                <Rating
                  name={name}
                  value={rating}
                  // onChange={(event, newValue) => {
                  //   setValue(newValue);
                  // }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
