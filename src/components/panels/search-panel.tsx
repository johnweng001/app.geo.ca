import { Typography } from "@mui/material";
import GeoSearch from "../search/geosearch";

export default function SearchPanel(): JSX.Element {
  return (
    <div style={{ backgroundColor: "white" }}>
      <Typography variant="body2" color="textSecondary" component="div">
        {GeoSearch(
          true,
          false,
          () => {},
          () => {},
          ""
        )}
      </Typography>
    </div>
  );
}
