import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode
  skipPaper?: boolean
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

const StyledSection =styled("section")`
  padding: 20px;
  margin: 20px -20px;
`

export default function Section({children, skipPaper, props}: SectionProps ) {
  const Component = skipPaper ? StyledSection : StyledPaper;
  return <Component {...props}>
    {children}
  </Component>
}