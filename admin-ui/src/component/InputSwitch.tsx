import { Grid, Typography, Switch } from "@mui/material";
import { ReactNode } from "react";

import CheckBoxOutlineBlankOutlinedIcon from "@mui/icons-material/CheckBoxOutlineBlankOutlined";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

interface CompletedCheckboxProps {
  value: boolean | null | undefined;
  children?: ReactNode;
  onChange: (value: boolean | null) => void;
}

export default function InputSwitch({
  value,
  onChange,
  children,
}: CompletedCheckboxProps) {
  let stringValue: string | null = null;
  if (value) {
    stringValue = "yes";
  } else if (value === false) {
    stringValue = "no";
  }

  return (
    <Grid
      container
      spacing={1}
      justifyContent="space-between"
      alignItems="center"
      flexWrap="nowrap"
    >
      <Grid item>
        <Typography variant="subtitle1">{children}</Typography>
      </Grid>
      <Grid item>
        <ToggleButtonGroup
          value={stringValue}
          exclusive
          onChange={(_event: any, newValue: string) => {
            let castValue: boolean | null = null;
            if (newValue === "yes") {
              castValue = true;
            } else if (newValue === "no") {
              castValue = false;
            }
            onChange && onChange(castValue);
          }}
        >
          <ToggleButton value="yes">Yes</ToggleButton>
          <ToggleButton value="no">No</ToggleButton>
        </ToggleButtonGroup>
      </Grid>
    </Grid>
  );
}
