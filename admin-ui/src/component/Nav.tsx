import { useContext } from "react";
import { AppBar, Toolbar } from "@mui/material";
import Link from 'next/link';

import UserContext from "context/UserContext";

import { styled } from '@mui/material/styles';

const Menu =styled('ul')`
  margin: 0;
  padding: 0;
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: flex-end;
  list-style: none;
  li {
    margin: 0 0 0 1em;
  }
`

export default function Nav() {
  const userContext = useContext(UserContext);
  const { user } = userContext;

  const menuItems = [
    ["About", "/about"],
    ["Contact", "/contact"]
  ]
  if (user) {
    menuItems.splice(0,0, ["Dashboard", "/dashboard"])
  }

  return <AppBar position="fixed">
    <Toolbar>
      <Link href="/">BABE</Link>
      <Menu>
        {menuItems.map(([label, url])=>{
          return <li key={url}><Link href={url}>{label}</Link></li>
        })}
      </Menu>
    </Toolbar>
  </AppBar>  
}