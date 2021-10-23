import Drawer from '@mui/material/Drawer';
import { ReactNode, useState } from "react";
import Head from 'next/head';

import DefaultLayout from "layout/DefaultLayout";
import theme from 'theme';
import { Button, Grid } from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';

interface LoggedInLayoutProps {
  title: string,
  children: ReactNode
}

export default function LoggedInLayout({
  title,
  children
}: LoggedInLayoutProps ) {
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  // TODO: if no current user, redirect to '/';
  const button = <MenuIcon onClick={()=>setShowDrawer(true)} />
  const menu = <Drawer
      anchor="left"
      open={showDrawer}
      onClose={()=>setShowDrawer(false)}      
    >
      Menu items
    </Drawer>
  return <DefaultLayout title={title}>
    {menu}
    <Grid container sx={{height: "100%"}} alignItems="stretch" flexWrap="nowrap">
      <Grid item sx={{padding: "20px"}}>{button}</Grid>
      <Grid item flexGrow={1} sx={{padding: "40px", background: theme.palette.grey[400]}}>{children}</Grid>
    </Grid>
  </DefaultLayout>
}