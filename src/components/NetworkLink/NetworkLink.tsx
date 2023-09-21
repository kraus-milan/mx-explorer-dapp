import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { useGetSubdomainNetwork } from 'hooks';
import { activeNetworkSelector, defaultNetworkSelector } from 'redux/selectors';
import { NetworkLinkPropsType } from './types';

export const NetworkLink = ({
  to,
  children,
  preventScrollReset = false,
  ...rest
}: NetworkLinkPropsType) => {
  const { id: activeNetworkId } = useSelector(activeNetworkSelector);
  const { id: defaultNetworkId } = useSelector(defaultNetworkSelector);
  const subdomainNetwork = useGetSubdomainNetwork();

  const prependLink =
    activeNetworkId &&
    activeNetworkId !== defaultNetworkId &&
    !to.includes(activeNetworkId) &&
    !subdomainNetwork;

  if (!to.startsWith('/')) {
    console.error('Link not prepeded by / : ', to);
    to = `/${to}`;
  }

  const props = {
    to: prependLink ? `/${activeNetworkId}${to}` : to,
    ...rest
  };

  return (
    <Link {...props} preventScrollReset={preventScrollReset}>
      {children}
    </Link>
  );
};
