import {
  Button,
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
  ["Sausa Pils", 5],
  ["Blue Moon", 4.5],
  ["Hoegaarden", 4],
  ["Sausa Wels", 3.5],
  ["Budweiser", 3.5],
];

export default function Recommendations() {
  return (
    <div>
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <Button variant="contained" onClick={() => {}}>
          Refresh
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table aria-label="rating table">
          <TableHead>
            <TableRow>
              <TableCell>Beer</TableCell>
              <TableCell align="right">Predicted rating</TableCell>
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
                  <Rating name={name} value={rating} readOnly precision={0.5} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
