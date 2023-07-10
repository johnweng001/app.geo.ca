import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const styles = {
  formControl: {
    width: "auto",
    marginLeft: "5px",
  },
  select: {
    fontFamily: "Open Sans",
    fontSize: "0.875rem",
    color: "#54595f",
  },
  divcontrol: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    marginTop: "5px",
    display: "flex",
    fontFamily: "Open Sans",
    fontSize: "0.875rem",
    color: "#54595f",
  },
  icon: {
    fill: "white",
  },
  option: {
    fontFamily: "Open Sans",
    fontSize: "0.875rem",
    color: "#54595f",
  },
  root: {
    color: "white",
  },
};

const useStyles = makeStyles(styles);

interface SortingProps {
  label: string;
  labelClassName: string;
  defaultValue: string;
  options: SortingOptionInfo[];
  selectClassName: string;
  optionClassName: string;
  iconClassName: string;
  onSorting: (value: string) => void;
}
export interface SortingOptionInfo {
  label: string;
  value: string;
  sortDirection?: string;
}
export default function Sorting(props: SortingProps): JSX.Element {
  const {
    label,
    labelClassName,
    selectClassName,
    optionClassName,
    iconClassName,
    defaultValue,
    options,
    onSorting,
  } = props;
  const { t } = useTranslation();

  const classes = useStyles();
  const onChange = (event: any) => {
    onSorting(event.target.value);
  };
  useEffect(() => {
    console.log(props);
  }, []);
  return (
    <>
      <div className={classes.divcontrol}>
        <InputLabel id="demo-simple-select-standard-label">
          {t(label)}
        </InputLabel>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={defaultValue}
            onChange={onChange}
          >
            {options.map((op, index) =>
              op.sortDirection === undefined ? (
                <MenuItem key={index} value={op.value}>
                  {t(op.label)}
                </MenuItem>
              ) : op.sortDirection === "asc" ? (
                <MenuItem key={index} value={op.value}>
                  {t(op.label)} &uarr;
                </MenuItem>
              ) : (
                <MenuItem key={index} value={op.value}>
                  {t(op.label)} &darr;
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
      </div>
    </>
  );
}
