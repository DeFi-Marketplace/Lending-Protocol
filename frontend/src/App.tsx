import { useState } from 'react';
import { requestAccess, getAddress } from '@stellar/freighter-api';
import { LendingClient } from './clients/contract';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID;

function App() {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const connectWallet = async () => {
    try {
      await requestAccess();
      const addr = await getAddress();
      if (addr.address) setAddress(addr.address);
    } catch {
      alert('Please install and unlock the Freighter wallet extension.');
    }
  };

  const handleRequestLoan = async () => {
    if (!address) return;
    setLoading(true);
    setStatus('Checking credit score...');
    setScore(null);
    setTxHash('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/credit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      setScore(data.score);

      if (!data.isEligible) {
        setStatus(`Loan denied. Credit score (${data.score}) below 600.`);
        setLoading(false);
        return;
      }

      setStatus(`Credit score: ${data.score}. Submitting loan on-chain...`);

      if (!CONTRACT_ID) {
        setStatus('Set VITE_CONTRACT_ID in your environment to submit on-chain transactions.');
        setLoading(false);
        return;
      }

      const client = new LendingClient(CONTRACT_ID);
      const hash = await client.requestLoan(
        'CDLZ6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6',
        1000n,
        500,
      );
      setTxHash(hash);
      setStatus('Loan request submitted successfully!');
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Stellar P2P Lending</h1>
      <p className="subtitle">Undercollateralized lending on Soroban</p>

      {!address ? (
        <button onClick={connectWallet}>Connect Freighter Wallet</button>
      ) : (
        <div>
          <p className="address">Connected: {address}</p>
          <button onClick={handleRequestLoan} disabled={loading}>
            {loading ? 'Processing...' : 'Request Loan'}
          </button>

          {score !== null && (
            <p className="info">Credit score: {score}</p>
          )}

          {status && <p className="info">{status}</p>}

          {txHash && (
            <p className="info">Tx hash: {txHash}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
