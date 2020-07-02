import axios from 'axios';

interface GetTransactionsType {
  elasticUrl?: string;
  nodeUrl?: string;
  timeout: number;
  transactionId: string;
}

export async function getTransaction({ elasticUrl, transactionId, timeout }: GetTransactionsType) {
  const {
    data: { _id, _source },
  } = await axios.get(`${elasticUrl}/transactions/_doc/${transactionId}`, { timeout });

  return {
    data: { hash: _id, ..._source },
    transactionFetched: true,
  };
}

export async function getPendingTransaction({
  transactionId,
  timeout,
  nodeUrl,
}: GetTransactionsType) {
  try {
    const {
      data: {
        data: { transaction },
        code,
        error,
      },
    } = await axios.get(`${nodeUrl}/transaction/${transactionId}`, { timeout });

    if (code === 'successful') {
      return {
        data: { hash: transactionId, ...transaction },
        transactionFetched: true,
      };
    } else {
      throw new Error(error);
    }
  } catch {
    return {
      data: {},
      transactionFetched: false,
    };
  }
}
