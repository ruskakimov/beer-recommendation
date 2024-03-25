import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  ListSubheader,
  Paper,
  Popper,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  autocompleteClasses,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { ListChildComponentProps, VariableSizeList } from "react-window";

import DeleteIcon from "@mui/icons-material/Delete";

import React from "react";
import beers from "../beers.json";

interface BeerRating {
  beer_id: number;
  name: string;
  score: number;
}

const beerRatingsKey = "beer-ratings";

function useBeerRatings() {
  const [data, setData] = useState<BeerRating[]>(() =>
    JSON.parse(localStorage.getItem(beerRatingsKey) || "[]")
  );

  useEffect(() => {
    localStorage.setItem(beerRatingsKey, JSON.stringify(data));
  }, [data]);

  return {
    ratings: data,
    onChange: (index: number, newScore: number) => {
      const copy = data.slice();
      copy[index] = { ...copy[index], score: newScore };
      setData(copy);
    },
    onDelete: (index: number) => {
      const copy = data.slice();
      copy.splice(index, 1);
      setData(copy);
    },
    onAdd: (rating: BeerRating) => {
      setData([...data, rating]);
    },
  };
}

export default function YourRatings() {
  const { ratings, onChange, onDelete, onAdd } = useBeerRatings();

  // Add modal state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<BeerRating>>({});

  const filled = form.beer_id && form.name && form.score;

  return (
    <>
      <TableContainer component={Paper}>
        <Table aria-label="rating table">
          <TableHead>
            <TableRow>
              <TableCell>Beer</TableCell>
              <TableCell align="right">Rating</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ratings.map(({ name, score }, index) => (
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
                    value={score}
                    onChange={(event, newScore) => {
                      if (newScore) {
                        onChange(index, newScore);
                      }
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label="delete"
                    onClick={() => onDelete(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Beer
        </Button>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Beer</DialogTitle>
        <DialogContent>
          <Box style={{ display: "flex", flexDirection: "column" }}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Autocomplete
                id="combo-box-demo"
                disableListWrap
                PopperComponent={StyledPopper}
                ListboxComponent={ListboxComponent}
                options={beers as { id: number; name: string }[]}
                getOptionLabel={(option) => option.name}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Beer" />}
                renderOption={(props, option, state) =>
                  [props, option, state.index] as React.ReactNode
                }
                renderGroup={(params) => params as any}
                onChange={(event, value) => {
                  if (value)
                    setForm((f) => ({
                      ...f,
                      beer_id: value.id,
                      name: value.name,
                    }));
                }}
              />
            </FormControl>
            <div style={{ padding: "8px" }}>
              <Rating
                name={"new-beer-rating"}
                value={form.score}
                onChange={(event, newValue) => {
                  if (newValue) setForm((f) => ({ ...f, score: newValue }));
                }}
              />
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={!filled}
            onClick={() => {
              setOpen(false);
              if (filled) onAdd({ ...(form as BeerRating) });
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: "border-box",
    "& ul": {
      padding: 0,
      margin: 0,
    },
  },
});

const LISTBOX_PADDING = 8; // px

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  const item = data[index];
  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING,
  };

  if (item.hasOwnProperty("group")) {
    return (
      <ListSubheader key={item.key} component="div" style={inlineStyle}>
        {item.group}
      </ListSubheader>
    );
  }

  return (
    <Typography component="li" {...item[0]} noWrap style={inlineStyle}>
      {`${item[1].name}`}
    </Typography>
  );
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData: React.ReactElement[] = [];
  (children as React.ReactElement[]).forEach(
    (item: React.ReactElement & { children?: React.ReactElement[] }) => {
      itemData.push(item);
      itemData.push(...(item.children || []));
    }
  );

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up("sm"), {
    noSsr: true,
  });
  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;

  const getChildSize = (child: React.ReactElement) => {
    if (child.hasOwnProperty("group")) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});
