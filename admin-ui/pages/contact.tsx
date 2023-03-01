import Page from "../public/contact.html";
const htmlDoc = { __html: Page };

import type { NextPage } from "next";
import LoggedInLayout from "layout/LoggedInLayout";
import { Typography } from "@mui/material";

import Section from "component/Section";

const Contact: NextPage = () => {
  return (
    <LoggedInLayout title="Contact">
      <Typography variant="h1">Contact</Typography>
      <Section>
        <div dangerouslySetInnerHTML={htmlDoc} />
      </Section>
    </LoggedInLayout>
  );
};

export default Contact;
