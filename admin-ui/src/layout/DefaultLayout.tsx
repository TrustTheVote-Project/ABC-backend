import { ReactNode } from "react";
import Head from 'next/head';

import Nav from 'component/Nav';

import theme from 'theme';

interface DefaultLayoutProps {
  title: string,
  children: ReactNode
}

export default function DefaultLayout({
  title,
  children
}: DefaultLayoutProps ) {
  return <>
    <Head>
      <title>{title}</title>
    </Head>
    <Nav />
    <main style={{position: "fixed", bottom: 0, right: 0, left: 0, top: theme.mixins.toolbar.minHeight}}>
      {children}
    </main>
  </>
}