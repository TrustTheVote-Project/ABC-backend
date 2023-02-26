import Drawer from "@mui/material/Drawer";
import { ReactNode, useContext, useState } from "react";
import { useRouter } from "next/router";

import DefaultLayout from "layout/DefaultLayout";
import theme from "theme";
import { Button, Link, Grid, MenuItem, MenuList } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import UserContext from "context/UserContext";
import { grey } from "@mui/material/colors";

interface LoggedInLayoutProps {
  title: string;
  children: ReactNode;
}

export default function LoggedInLayout({
  title,
  children,
}: LoggedInLayoutProps) {
  const userContext = useContext(UserContext);
  const { user } = userContext;
  const router = useRouter();

  if (typeof window !== "undefined" && router && !user) {
    router.push("/");
  }

  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  // TODO: if no current user, redirect to '/';
  const button = <MenuIcon onClick={() => setShowDrawer(true)} />;
  const menu = (
    <Drawer
      anchor="left"
      open={showDrawer}
      onClose={() => setShowDrawer(false)}
    >
      <MenuList>
        <Link sx={{ color: "inherit" }} underline="none" href="/elections/new">
          <MenuItem>Create Election</MenuItem>
        </Link>
        <Link sx={{ color: "inherit" }} underline="none" href="/dashboard">
          <MenuItem>Current Elections</MenuItem>
        </Link>
        <Link sx={{ color: "inherit" }} underline="none" href="/archive">
          <MenuItem>Archived Elections</MenuItem>
        </Link>
      </MenuList>
    </Drawer>
  );
  return (
    <DefaultLayout title={title}>
      {menu}
      <Grid
        container
        sx={{ height: "100%" }}
        alignItems="stretch"
        flexWrap="nowrap"
      >
        <Grid item sx={{ padding: "20px", background: grey[50] }}>
          {button}
        </Grid>
        <Grid
          item
          flexGrow={1}
          sx={{
            overflowY: "scroll",
            padding: "20px 40px 10px",
            background: theme.palette.background.default,
          }}
        >
          {children}
        </Grid>
      </Grid>
    </DefaultLayout>
  );
}
