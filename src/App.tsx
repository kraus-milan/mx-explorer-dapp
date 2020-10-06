import * as Sentry from '@sentry/browser';
import React, { useMemo } from 'react';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import PageNotFoud from './components/PageNotFoud';
import { GlobalProvider, useGlobalState } from './context';
import { ConfigType, NetworkType } from './context/state';
import routes from './routes';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({ dsn: 'https://8ed464acd35d44a6a582ff624dd3c38d@sentry.io/485879' });
}
export const Routes = ({
  routes,
}: {
  routes: { path: string; component: React.ComponentClass }[];
}) => {
  const {
    config: { networks },
    activeNetwork,
  } = useGlobalState();

  return useMemo(
    () => (
      <React.Suspense fallback={<span>Loading...</span>}>
        <Switch>
          {networks.map((network: NetworkType, i: number) => {
            return routes.map((route, i) => {
              return (
                <Route
                  path={`/${network.id}${route.path}`}
                  key={network.id + route.path}
                  exact={true}
                  component={route.component}
                />
              );
            });
          })}
          <Route
            path={`${activeNetwork.id}/:any`}
            key={activeNetwork.id + '404'}
            exact={true}
            component={PageNotFoud}
          />
          ,
          {routes.map((route, i) => {
            return (
              <Route
                path={route.path}
                key={route.path + i}
                component={route.component}
                exact={true}
              />
            );
          })}
          <Route component={PageNotFoud} />
        </Switch>
      </React.Suspense>
    ),
    [networks, activeNetwork, routes]
  );
};

export const App = ({ optionalConfig }: { optionalConfig?: ConfigType }) => {
  React.useEffect(() => {
    if (process.env.REACT_APP_CACHE_BUST) {
      // tslint:disable-next-line
      console.log('Elrond Web wallet version: ', process.env.REACT_APP_CACHE_BUST);
    }
  }, []);

  return (
    <GlobalProvider optionalConfig={optionalConfig}>
      <Layout>
        <Routes routes={routes} />
      </Layout>
    </GlobalProvider>
  );
};

const RoutedApp = () => {
  const DevWrapper = ({ children }: any) => <>{children}</>;
  const ProdErrorBoundary = process.env.NODE_ENV === 'production' ? ErrorBoundary : DevWrapper;

  return (
    <ProdErrorBoundary>
      <Router>
        <App />
      </Router>
    </ProdErrorBoundary>
  );
};

export default hot(RoutedApp);
