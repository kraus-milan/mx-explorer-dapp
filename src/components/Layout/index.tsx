import React from 'react';
import Navbar from './Navbar/index';
import Footer from './Footer';
import TestnetRouter from './TestnetRouter';
import RoundManager from './RoundManager';
import { Highlights } from './../../sharedComponents';

//TODO: remove form tag from Hero Search

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <TestnetRouter />
    <RoundManager />
    <Navbar />
    <main role="main">
      <Highlights />
      {children}
    </main>
    <Footer />
  </>
);

export default Layout;
