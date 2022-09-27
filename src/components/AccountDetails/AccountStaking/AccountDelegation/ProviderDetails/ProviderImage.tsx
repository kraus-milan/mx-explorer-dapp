import React from 'react';
import { ProviderType } from 'helpers/types';
import { ReactComponent as DefaultAvatar } from 'assets/images/default-avatar.svg';

const ProviderImage = ({ provider }: { provider: ProviderType }) => (
  <div
    className={`provider-image rounded-circle d-flex mr-3 ${
      provider?.identityDetails?.avatar ? 'has-avatar' : ''
    }`}
  >
    {provider?.identityDetails?.avatar ? (
      <img
        className="rounded-circle"
        src={provider.identityDetails.avatar}
        alt={provider?.identityDetails?.name ?? provider.provider}
        height="42"
      />
    ) : (
      <DefaultAvatar className="default-image p-1" />
    )}
  </div>
);

export default ProviderImage;
