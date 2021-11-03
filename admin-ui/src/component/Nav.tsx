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
  const { user, logout } = userContext;

  const menuItems: Array<Array<any>> = [
    ["About", "/about"],
    ["Contact", "/contact"],    
  ]
  if (user) {
    menuItems.splice(0,0, ["Dashboard", "/dashboard"])
    menuItems.push(["Logout", logout])
  }

  return <AppBar position="fixed">
    <Toolbar>
      <Link href="/">MarkIt Provisioner</Link>
      <Menu>
        {menuItems.map(([label, url])=>{
          if (typeof(url)==="string") {
            return <li key={label}><Link href={url}>{label}</Link></li>
          } else {
            return <li key={label} onClick={url}>{label}</li>
          }
        })}
      </Menu>
    </Toolbar>
  </AppBar>  
}