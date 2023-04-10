import {
  Grid,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import React from "react";
import { ReactNode } from "react";

interface OptionData {
  name: string;
  value: string;
}

interface InputEnumProps {
  value: string | undefined;
  options: OptionData[];
  children?: ReactNode;
  onChange: (value: string) => void;
}

export default function InputEnumSelect({
  value = '',
  options,
  onChange,
  children,
}: InputEnumProps) {
  const selectedValue = value || options[0].value;
  const optionElements = [];
  for (const key in options) {
    const option = options[key];
    optionElements.push(
      <MenuItem selected={value == option.value} value={option.value} key={`select-${key}`}>
        {option.name}
      </MenuItem>
    );
  }

  const handleChange = (event: SelectChangeEvent) => {
    onChange && onChange(event.target.value);
  };

  return (
    <Grid
      container
      spacing={0}
      justifyContent="space-between"
      alignItems="center"
      flexWrap="nowrap"
    >
      <Grid item>
        <Typography variant="subtitle1">{children}</Typography>
      </Grid>
      <Grid item>
        <Select value={value} onChange={handleChange} fullWidth>
          {optionElements}
        </Select>
      </Grid>
    </Grid>
  );
}
