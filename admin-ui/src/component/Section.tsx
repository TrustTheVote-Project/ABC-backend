import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode
  [x: string]: any
}


import { styled } from '@mui/material/styles';
import { Paper } from "@mui/material";
import theme from "theme";

const StyledPaper =styled(Paper)`
  padding: 20px;
  margin: 20px -20px;
  background-color: ${theme.palette.grey[100]}
`

export default function Section({children, props}: SectionProps ) {
  return <StyledPaper {...props}>
    {children}
  </StyledPaper>
}