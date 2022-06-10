import { Grid, Typography } from "@mui/material";
import { ReactNode } from "react";

import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';

interface CompletedCheckboxProps {
  isComplete: boolean,
  children?: ReactNode
}

export default function CompletedCheckbox({
  isComplete,
  children
}: CompletedCheckboxProps) {
  return <Grid spacing={1} container justifyContent="space-between" alignItems="center" flexWrap="nowrap">
    <Grid item>
      <Typography variant="subtitle2">{children}</Typography>
    </Grid>
    <Grid item>
      {isComplete ? <CheckBoxOutlinedIcon /> : <CheckBoxOutlineBlankOutlinedIcon /> }
    </Grid>
  </Grid>
}