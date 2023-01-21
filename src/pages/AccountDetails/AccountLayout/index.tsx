import * as React from 'react';
import BigNumber from 'bignumber.js';
import { Redirect, useLocation, useRouteMatch } from 'react-router-dom';

import { multiversXNodesIdentity } from 'appConfig';
import { useGlobalDispatch, useGlobalState } from 'context';

import { addressIsBech32, useNetworkRoute, useSize } from 'helpers';
import { IdentityType, ProviderType, DelegationType } from 'helpers/types';
import { accountsRoutes } from 'routes';
import { Loader, useAdapter } from 'components';

import { AccountDetailsCard } from './AccountDetailsCard';
import { FailedAccount } from './FailedAccount';

export const AccountLayout = ({ children }: { children: React.ReactNode }) => {
  const ref = React.useRef(null);
  const { pathname } = useLocation();
  const { firstPageTicker } = useSize();
  const { activeNetwork } = useGlobalState();
  const dispatch = useGlobalDispatch();
  const {
    getAccount,
    getAccountDelegationLegacy,
    getAccountDelegation,
    getAccountStake,
    getProviders,
    getIdentities,
  } = useAdapter();
  const networkRoute = useNetworkRoute();

  const isOldAddressRoute = pathname.includes('/address/');
  const oldMatch: any = useRouteMatch(networkRoute(accountsRoutes.oldAccountDetails));
  const oldAddress = oldMatch ? oldMatch.params.hash : undefined;

  const match: any = useRouteMatch(networkRoute(accountsRoutes.accountDetails));
  const address = match ? match.params.hash : undefined;

  const [dataReady, setDataReady] = React.useState<boolean | undefined>();

  const fetchBalanceAndCount = () => {
    getAccount(address).then((accountDetailsData) => {
      const details = accountDetailsData.success ? accountDetailsData.data : {};

      if (ref.current !== null) {
        if (accountDetailsData.success) {
          dispatch({
            type: 'setAccountDetails',
            accountDetails: {
              ...details,
            },
          });
          setDataReady(true);
        }

        if (dataReady === undefined) {
          setDataReady(accountDetailsData.success);
        }
      }
    });
  };

  const fetchStakingDetails = () => {
    Promise.all([
      getAccountDelegation(address),
      getAccountStake(address),
      getAccountDelegationLegacy(address),
    ]).then(([delegationData, stakeData, delegationLegacyData]) => {
      let delegationLegacyIdentity: IdentityType | undefined = undefined;
      let delegationProviders: ProviderType[] = [];
      let bNtotalStaked = new BigNumber(0);
      let bNtotalDelegation = new BigNumber(0);
      let bNtotalLegacyDelegation = new BigNumber(0);
      let bNtotalLocked = new BigNumber(0);
      let bNtotalClaimable = new BigNumber(0);

      const delegationFetched = delegationData.success ? delegationData.data : {};
      const stakeFetched = stakeData.success ? stakeData.data : {};
      const delegationLegacyFetched = delegationLegacyData.success ? delegationLegacyData.data : {};

      const delegation: DelegationType[] = delegationFetched ? delegationData.data : [];
      const stake = stakeFetched ? stakeData.data : {};
      const delegationLegacy = delegationLegacyFetched ? delegationLegacyData.data : {};

      if (stake) {
        bNtotalStaked = new BigNumber(stake.totalStaked ? stake.totalStaked : 0);
      }
      if (delegationLegacy) {
        const bNuserActiveStake = new BigNumber(delegationLegacy.userActiveStake);
        const bNuserWaitingStake = new BigNumber(delegationLegacy.userWaitingStake);
        const bNClaimableRewardsLegacy = new BigNumber(delegationLegacy.claimableRewards);
        bNtotalClaimable = bNtotalClaimable.plus(bNClaimableRewardsLegacy);
        bNtotalLegacyDelegation = new BigNumber(
          bNuserActiveStake.plus(bNuserWaitingStake).plus(bNClaimableRewardsLegacy)
        );
      }

      if (delegation && delegation.length > 0) {
        const bNtotalUserActiveStake = delegation
          .map(({ userActiveStake }) => userActiveStake)
          .reduce((a, b) => new BigNumber(a).plus(b), new BigNumber('0'));
        const bNtotalClaimableRewards = delegation
          .map(({ claimableRewards }) => claimableRewards || '0')
          .reduce((a, b) => new BigNumber(a).plus(b), new BigNumber('0'));
        const undelegatedAmounts = delegation
          .map(({ userUndelegatedList }) => userUndelegatedList?.map(({ amount }) => amount) ?? [])
          .reduce((a, b) => a.concat(b), []);
        const bNtotalUserUnStakedValue = undelegatedAmounts.reduce(
          (a, b) => new BigNumber(a).plus(b),
          new BigNumber('0')
        );
        const activePlusUnStaked = bNtotalUserActiveStake.plus(bNtotalUserUnStakedValue);
        bNtotalDelegation = bNtotalClaimableRewards.plus(activePlusUnStaked);
        bNtotalClaimable = bNtotalClaimable.plus(bNtotalClaimableRewards);
      }
      if (stake && delegation && delegationLegacy) {
        bNtotalLocked = bNtotalStaked.plus(bNtotalLegacyDelegation).plus(bNtotalDelegation);
      }

      const visibleDelegation = delegation.filter(
        (delegation) =>
          delegation.userActiveStake !== '0' ||
          delegation.claimableRewards !== '0' ||
          (delegation.userUndelegatedList && delegation.userUndelegatedList.length > 0)
      );
      const showDelegation = visibleDelegation.length > 0;

      const showDelegationLegacy =
        delegationLegacy &&
        (delegationLegacy.claimableRewards !== '0' ||
          delegationLegacy.userWaitingStake !== '0' ||
          delegationLegacy.userActiveStake !== '0');

      const showStake =
        stake &&
        (stake?.totalStaked !== '0' || (stake?.unstakedTokens && stake.unstakedTokens.length > 0));

      //const updatedContracts = contracts ? contracts.join(',') : undefined;
      const fields = [
        'identity',
        'provider',
        'stake',
        'numNodes',
        'apr',
        'serviceFee',
        'delegationCap',
      ].join(',');
      const contracts = visibleDelegation.map((delegation) => delegation?.contract).join(',');

      const stakingDataReady = stakeFetched && delegationFetched && delegationLegacyFetched;
      const stakingData = {
        stakingDataReady,
        delegation,
        showDelegation,
        stake,
        showStake,
        delegationLegacy,
        showDelegationLegacy,
        bNtotalStaked,
        bNtotalDelegation,
        bNtotalLegacyDelegation,
        bNtotalLocked,
        bNtotalClaimable,
      };

      if (showDelegation || showDelegationLegacy) {
        getProviders({
          fields,
          ...(contracts ? { providers: contracts } : {}),
        }).then((providersData) => {
          if (providersData.success) {
            let newProvidersData: ProviderType[] = providersData.data;

            const providerIdentitiesList = newProvidersData
              .filter((item) => item.identity)
              .map((item) => item.identity);

            if (showDelegationLegacy && !providerIdentitiesList.includes(multiversXNodesIdentity)) {
              providerIdentitiesList.push(multiversXNodesIdentity);
            }

            const identities = providerIdentitiesList.join(',');

            if (identities) {
              getIdentities(identities).then((identitiesData) => {
                if (identitiesData.success) {
                  newProvidersData.forEach((provider) => {
                    if (provider.identity) {
                      const identityDetails = identitiesData.data.find(
                        (identity: IdentityType) => identity.identity === provider.identity
                      );

                      const multiversXNodes = identitiesData.data.filter(
                        (identity: IdentityType) => {
                          return identity.identity === multiversXNodesIdentity;
                        }
                      );
                      if (multiversXNodes.length > 0) {
                        delegationLegacyIdentity = multiversXNodes[0];
                      }

                      if (identityDetails) {
                        provider.identityDetails = identityDetails;
                      }
                    }
                  });

                  dispatch({
                    type: 'setAccountStakingDetails',
                    accountStakingDetails: {
                      ...stakingData,
                      providerDataReady: true,
                      delegationProviders: newProvidersData,
                      delegationLegacyIdentity,
                    },
                  });
                }

                dispatch({
                  type: 'setAccountStakingDetails',
                  accountStakingDetails: {
                    ...stakingData,
                    providerDataReady: true,
                    delegationProviders: newProvidersData,
                    delegationLegacyIdentity,
                  },
                });
              });
            } else {
              dispatch({
                type: 'setAccountStakingDetails',
                accountStakingDetails: {
                  ...stakingData,
                  providerDataReady: true,
                  delegationProviders: providersData.data,
                  delegationLegacyIdentity,
                },
              });
            }
          } else {
            dispatch({
              type: 'setAccountStakingDetails',
              accountStakingDetails: {
                ...stakingData,
                providerDataReady: providersData.success,
                delegationProviders,
                delegationLegacyIdentity,
              },
            });
          }
        });
      } else {
        dispatch({
          type: 'setAccountStakingDetails',
          accountStakingDetails: {
            ...stakingData,
            providerDataReady: true,
            delegationProviders,
            delegationLegacyIdentity,
          },
        });
      }
    });
  };

  React.useEffect(() => {
    if (!isOldAddressRoute) {
      fetchStakingDetails();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, activeNetwork.id]);

  React.useEffect(() => {
    if (!isOldAddressRoute) {
      fetchBalanceAndCount();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstPageTicker, activeNetwork.id, address]);

  React.useEffect(() => {
    setDataReady(undefined);
  }, [address, activeNetwork.id]);

  const loading = dataReady === undefined;
  const failed = dataReady === false || !addressIsBech32(address);

  return isOldAddressRoute ? (
    <Redirect to={networkRoute(`/accounts/${oldAddress}`)} />
  ) : (
    <>
      {loading && <Loader />}
      {!loading && failed && <FailedAccount address={address} />}

      <div ref={ref}>
        {!loading && !failed && (
          <div className="container page-content">
            <AccountDetailsCard />
            {children}
          </div>
        )}
      </div>
    </>
  );
};
