import * as React from 'react';
import { useGlobalDispatch } from 'context';
import { Loader, useAdapter } from 'components';
import { useSize, useGetHash } from 'helpers';
import { FailedCollectionDetails } from './FailedCollectionDetails';
import { CollectionDetailsCard } from './CollectionDetailsCard';

import { useSelector } from 'react-redux';
import { activeNetworkSelector } from 'redux/selectors';

export const CollectionLayout = ({ children }: { children: React.ReactNode }) => {
  const ref = React.useRef(null);
  const { firstPageTicker } = useSize();
  const { id: activeNetworkId } = useSelector(activeNetworkSelector);
  const dispatch = useGlobalDispatch();
  const { getCollection } = useAdapter();

  const collection = useGetHash();

  const [dataReady, setDataReady] = React.useState<boolean | undefined>();

  const fetchCollectionDetails = () => {
    if (collection) {
      getCollection(collection).then((collectionDetailsData) => {
        const details = collectionDetailsData.success ? collectionDetailsData.data : {};

        if (ref.current !== null) {
          if (collectionDetailsData.success) {
            dispatch({
              type: 'setCollectionDetails',
              collectionDetails: {
                ...details,
              },
            });
            setDataReady(true);
          }

          if (dataReady === undefined) {
            setDataReady(collectionDetailsData.success);
          }
        }
      });
    }
  };

  React.useEffect(() => {
    fetchCollectionDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstPageTicker, activeNetworkId, collection]);

  React.useEffect(() => {
    setDataReady(undefined);
  }, [collection, activeNetworkId]);

  const loading = dataReady === undefined;
  const failed = dataReady === false;

  return (
    <>
      {loading && <Loader />}
      {!loading && failed && <FailedCollectionDetails collection={collection} />}

      <div ref={ref}>
        {!loading && !failed && (
          <div className="container page-content">
            <CollectionDetailsCard />
            {children}
          </div>
        )}
      </div>
    </>
  );
};
