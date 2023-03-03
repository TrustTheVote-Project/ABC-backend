import Page from "../public/help.html";
const htmlDoc = { __html: Page };

import type { NextPage } from "next";
import LoggedInLayout from "layout/LoggedInLayout";
import { Typography } from "@mui/material";

import Section from "component/Section";

const Help: NextPage = () => {
  return (
    <LoggedInLayout title="Help">
      <Typography variant="h1">Help and Frequently Asked Questions</Typography>
      <Section>
        <div dangerouslySetInnerHTML={htmlDoc} />
      </Section>
    </LoggedInLayout>
  );
};

export default Help;
