import { UITransactionType } from 'helpers/types';

export const getReceiverAssets = (transaction: UITransactionType) => {
  if (
    transaction.sender === transaction.receiver &&
    transaction?.action?.arguments?.receiver !== transaction.receiver
  ) {
    return transaction?.action?.arguments?.receiverAssets;
  }

  return transaction.receiverAssets;
};
