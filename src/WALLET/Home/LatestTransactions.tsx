import React from 'react';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TransactionType } from 'components/Transactions';
import { TimeAgo, Loader } from 'sharedComponents';
import { truncate, dateFormatted } from 'helpers';
import { useWalletState } from './../context';
import { getLatestTransactions } from './helpers/asyncRequests';
import { useGlobalState } from './../../context';

const LatestTransactions = () => {
  let ref = React.useRef(null);
  const {
    timeout,
    activeTestnet: { elasticUrl },
  } = useGlobalState();
  const { publicKey } = useWalletState();

  const [transactions, setTransactions] = React.useState([]);
  const [fetching, setFetching] = React.useState(true);
  const [success, setSuccess] = React.useState(true);

  React.useEffect(() => {
    if (ref.current !== null)
      getLatestTransactions({ elasticUrl, publicKey, timeout }).then(
        ({ transactions, success }) => {
          if (success && ref.current !== null) {
            setTransactions(transactions);
          }
          setFetching(false);
        }
      );
  });

  return (
    <div ref={ref}>
      {fetching ? (
        <Loader />
      ) : (
        <div className="card">
          <div className="card-body" style={{ height: '512px' }}>
            <div className="d-flex align-items-center flex-row mb-3">
              <h4 className="card-title mb-0 mr-auto">Latest Transactions</h4>
              {transactions.length > 0 && (
                <a href={`https://explorer.elrond.com/#/address/${publicKey}`}>
                  View Address Transactions
                </a>
              )}
            </div>
            {transactions.length === 0 ? (
              <div
                style={{ height: 'calc(100% - 50px)' }}
                className="d-flex justify-content-center"
              >
                <div className="align-self-center mb-5">
                  <div className="empty align-self-center">
                    <FontAwesomeIcon icon={faExchangeAlt} className="empty-icon" />
                    <span className="h5 empty-heading">No Transactions</span>
                    <span className="empty-details">No transactions found for this wallet.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-scroll" style={{ height: 'calc(100% - 50px)' }}>
                <div className="animated fadeIn">
                  {transactions.map((tx: TransactionType, i) => (
                    <>
                      <div className="row">
                        <div className="col-6">
                          <span className="icon-container-round">
                            <i className="fa fa-exchange-alt" />
                          </span>
                          <a href={`https://explorer.elrond.com/#/transactions/${tx.hash}`}>
                            {truncate(tx.hash, 20)}
                          </a>
                          <br />
                          <span className="text-secondary" title={dateFormatted(tx.timestamp)}>
                            <TimeAgo value={tx.timestamp} />
                          </span>
                        </div>
                        <div className="col-6">
                          From
                          <a href={`https://explorer.elrond.com/#/address/${tx.sender}`}>
                            {truncate(tx.sender, 20)}
                          </a>
                          <br />
                          To
                          <a href={`https://explorer.elrond.com/#/address/${tx.receiver}`}>
                            {truncate(tx.receiver, 20)}
                          </a>
                        </div>
                      </div>
                      {i !== transactions.length - 1 && (
                        <div>
                          <hr className="hr-space" />
                        </div>
                      )}
                    </>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LatestTransactions;
