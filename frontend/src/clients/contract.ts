import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  nativeToScVal,
  Address,
  Networks,
  BASE_FEE,
  Transaction,
} from '@stellar/stellar-sdk';
import { getAddress, signTransaction } from '@stellar/freighter-api';

const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE =
  import.meta.env.VITE_NETWORK_PASSPHRASE || Networks.TESTNET;

export class LendingClient {
  private server: SorobanRpc.Server;
  private contract: Contract;

  constructor(contractId: string) {
    this.server = new SorobanRpc.Server(RPC_URL);
    this.contract = new Contract(contractId);
  }

  async requestLoan(
    token: string,
    amount: bigint,
    interestRate: number,
  ): Promise<string> {
    const { address: publicKey } = await getAddress();
    const source = await this.server.getAccount(publicKey);

    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        this.contract.call(
          'request_loan',
          new Address(publicKey).toScVal(),
          new Address(token).toScVal(),
          nativeToScVal(amount, { type: 'i128' }),
          nativeToScVal(interestRate, { type: 'u32' }),
        ),
      )
      .setTimeout(30)
      .build();

    const prepared = await this.server.prepareTransaction(tx);
    const xdr = prepared.toXDR();
    const { signedTxXdr } = await signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    const signed = TransactionBuilder.fromXDR(
      signedTxXdr,
      NETWORK_PASSPHRASE,
    ) as Transaction;
    const result = await this.server.sendTransaction(signed);

    if (result.status === 'PENDING' || result.status === 'DUPLICATE') {
      return result.hash;
    }
    throw new Error(`Transaction failed: ${result.status}`);
  }

  async fundLoan(loanId: number): Promise<string> {
    const { address: publicKey } = await getAddress();
    const source = await this.server.getAccount(publicKey);

    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        this.contract.call(
          'fund_loan',
          new Address(publicKey).toScVal(),
          nativeToScVal(loanId, { type: 'u64' }),
        ),
      )
      .setTimeout(30)
      .build();

    const prepared = await this.server.prepareTransaction(tx);
    const xdr = prepared.toXDR();
    const { signedTxXdr } = await signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    const signed = TransactionBuilder.fromXDR(
      signedTxXdr,
      NETWORK_PASSPHRASE,
    ) as Transaction;
    const result = await this.server.sendTransaction(signed);

    if (result.status === 'PENDING' || result.status === 'DUPLICATE') {
      return result.hash;
    }
    throw new Error(`Transaction failed: ${result.status}`);
  }

  async repayLoan(loanId: number, paymentAmount: bigint): Promise<string> {
    const { address: publicKey } = await getAddress();
    const source = await this.server.getAccount(publicKey);

    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        this.contract.call(
          'repay_loan',
          new Address(publicKey).toScVal(),
          nativeToScVal(loanId, { type: 'u64' }),
          nativeToScVal(paymentAmount, { type: 'i128' }),
        ),
      )
      .setTimeout(30)
      .build();

    const prepared = await this.server.prepareTransaction(tx);
    const xdr = prepared.toXDR();
    const { signedTxXdr } = await signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    const signed = TransactionBuilder.fromXDR(
      signedTxXdr,
      NETWORK_PASSPHRASE,
    ) as Transaction;
    const result = await this.server.sendTransaction(signed);

    if (result.status === 'PENDING' || result.status === 'DUPLICATE') {
      return result.hash;
    }
    throw new Error(`Transaction failed: ${result.status}`);
  }
}
