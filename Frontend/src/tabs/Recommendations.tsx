import React, { useEffect, useState } from "react";
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
  CircularProgress,
} from "@mui/material";

import beers from "../beers.json";

const beerData = beers as { id: number; name: string }[];

const beerRecommendationsKey = "beer-recommendations";

export default function Recommendations(props: any) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<[string, number][]>(
    JSON.parse(localStorage.getItem(beerRecommendationsKey) || "") || [
      ["No ratings yet!", 0],
    ]
  );

  useEffect(() => {
    localStorage.setItem(beerRecommendationsKey, JSON.stringify(rows));
  }, [rows]);

  function postRatings() {
    setLoading(true);
    fetch("http://localhost:5000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ratings: localStorage.getItem("beer-ratings") }),
    })
      .then((res) => res.json())
      .then((res) => {
        let recommendedBeerIDs = res.map((beer: any) => beer[1]);
        let recommendedBeerRatings = res.map((beer: any) => beer[0]);

        console.log(recommendedBeerIDs);
        console.log(recommendedBeerRatings);

        let recommendedBeers: any = [];

        beerData.forEach((beer) =>
          recommendedBeerIDs.includes(beer.id)
            ? recommendedBeers.push([
                beer.name,
                recommendedBeerRatings[recommendedBeerIDs.indexOf(beer.id)],
              ])
            : ""
        );
        console.log(recommendedBeers);
        setLoading(false);
        setRows(recommendedBeers);
      });
  }

  return (
    <div>
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <Button variant="contained" onClick={() => postRatings()}>
          Get Recommendations!
        </Button>
      </div>
      <div style={{ textAlign: "center", paddingBottom: "4px" }}>
        {loading ? <CircularProgress color="secondary" /> : ""}
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
