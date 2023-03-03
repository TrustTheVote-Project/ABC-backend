import Page from "../public/about.html";
const htmlDoc = { __html: Page };

import type { NextPage } from "next";
import LoggedInLayout from "layout/LoggedInLayout";
import { Typography } from "@mui/material";

import Section from "component/Section";

const About: NextPage = () => {
  return (
    <LoggedInLayout title="About">
      <Typography variant="h1">About</Typography>
      <Section>
        <div dangerouslySetInnerHTML={htmlDoc} />
      </Section>
    </LoggedInLayout>
  );
};

export default About;
