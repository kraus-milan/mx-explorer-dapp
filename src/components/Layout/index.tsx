import React from 'react';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from './Navbar/index';
import Footer from './Footer';
import TestnetRouter from './TestnetRouter';
import { useGlobalState } from 'context';
import RoundManager from './RoundManager';
import { Highlights } from 'sharedComponents';

const Layout = ({ children, navbar }: { children: React.ReactNode; navbar?: React.ReactNode }) => {
  const { activeTestnet } = useGlobalState();
  return (
    <>
      <TestnetRouter />
      <RoundManager />
      {navbar ? navbar : <Navbar />}
      <main role="main">
        {activeTestnet.fetchedFromNetworkConfig === false ? (
          <div className="container pt-3 pb-3">
            <div className="row">
              <div className="offset-lg-3 col-lg-6 mt-4 mb-4">
                <div className="card">
                  <div className="card-body card-details" data-testid="errorScreen">
                    <div className="empty">
                      <FontAwesomeIcon icon={faBan} className="empty-icon" />
                      <span className="h4 empty-heading">
                        {activeTestnet.default
                          ? `${activeTestnet.name} unavailable`
                          : `${activeTestnet.name} testnet unavialable`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Highlights />
            {children}
          </>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Layout;
