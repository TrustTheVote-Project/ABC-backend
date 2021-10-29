import { Grid, Typography, Switch } from "@mui/material";
import { ReactNode } from "react";

import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';

interface CompletedCheckboxProps {
  value: boolean,
  children?: ReactNode
  onChange:(value: boolean) => void
}

export default function InputSwitch({
  value,
  onChange,
  children
}: CompletedCheckboxProps) {
  return <Grid container spacing={1} justifyContent="space-between" alignItems="center" flexWrap="nowrap">
    <Grid item>
      <Typography variant="subtitle1">{children}</Typography>
    </Grid>
    <Grid item>
      <Switch defaultChecked={value} onChange={(_event, value)=>onChange(value)}/>
    </Grid>
  </Grid>
}