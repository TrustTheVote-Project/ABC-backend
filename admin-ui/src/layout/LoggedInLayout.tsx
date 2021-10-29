import Drawer from '@mui/material/Drawer';
import { ReactNode, useState } from "react";
import Head from 'next/head';

import DefaultLayout from "layout/DefaultLayout";
import theme from 'theme';
import { Button, Link, Grid, MenuItem, MenuList } from '@mui/material';

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
      <MenuList>
        <Link sx={{color: 'inherit'}} underline="none" href="/elections/new"><MenuItem>Create Election</MenuItem></Link>
        <Link sx={{color: 'inherit'}} underline="none" href="/dashboard"><MenuItem>Current Elections</MenuItem></Link>
        <MenuItem>Election Archive</MenuItem>
      </MenuList>
    </Drawer>
  return <DefaultLayout title={title}>
    {menu}
    <Grid container sx={{height: "100%"}} alignItems="stretch" flexWrap="nowrap">
      <Grid item sx={{padding: "20px"}}>{button}</Grid>
      <Grid item flexGrow={1} sx={{padding: "40px", background: theme.palette.grey[200]}}>{children}</Grid>
    </Grid>
  </DefaultLayout>
}