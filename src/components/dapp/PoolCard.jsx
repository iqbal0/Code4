import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Plus, Droplets, RefreshCw } from 'lucide-react';
import { useWeb3 } from '../../context/Web3Context';
import { FACTORY_ADDRESS, FACTORY_ABI, PAIR_ABI, ERC20_ABI } from '../../constants/contract';

export default function PoolCard({ setToast }) {
  const { provider, signer, account } = useWeb3();
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [pairAddress, setPairAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkPair = async () => {
      if (!provider || !tokenA || !tokenB || tokenA.length !== 42 || tokenB.length !== 42) {
        setPairAddress(null);
        return;
      }
      try {
        const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
        const pair = await factory.getPair(tokenA, tokenB);
        setPairAddress(pair === ethers.ZeroAddress ? null : pair);
      } catch (err) {
        console.error(err);
      }
    };
    checkPair();
  }, [tokenA, tokenB, provider]);

  const handleAddLiquidity = async () => {
    if (!signer || !amountA || !amountB) return;
    setLoading(true);
    try {
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      let currentPair = pairAddress;

      // 1. Create Pair if it doesn't exist
      if (!currentPair) {
        setToast({ message: 'Creating new pair...', type: 'success' });
        const txCreate = await factory.createPair(tokenA, tokenB);
        await txCreate.wait();
        currentPair = await factory.getPair(tokenA, tokenB);
        setPairAddress(currentPair);
      }

      const amtAWei = ethers.parseEther(amountA);
      const amtBWei = ethers.parseEther(amountB);

      // 2. Transfer Token A to Pair
      setToast({ message: 'Transferring Token A...', type: 'success' });
      const tA = new ethers.Contract(tokenA, ERC20_ABI, signer);
      const txA = await tA.transfer(currentPair, amtAWei);
      await txA.wait();

      // 3. Transfer Token B to Pair
      setToast({ message: 'Transferring Token B...', type: 'success' });
      const tB = new ethers.Contract(tokenB, ERC20_ABI, signer);
      const txB = await tB.transfer(currentPair, amtBWei);
      await txB.wait();

      // 4. Mint LP Tokens
      setToast({ message: 'Minting LP Tokens...', type: 'success' });
      const pairContract = new ethers.Contract(currentPair, PAIR_ABI, signer);
      const txMint = await pairContract.mint(account);
      await txMint.wait();

      setToast({ message: 'Liquidity added successfully!', type: 'success' });
      setAmountA('');
      setAmountB('');
    } catch (err) {
      console.error(err);
      setToast({ message: err.reason || 'Transaction failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 max-w-md w-full mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Droplets className="w-5 h-5 text-emerald-400" />
          Add Liquidity
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Token A Address</label>
          <input
            type="text"
            placeholder="0x..."
            value={tokenA}
            onChange={(e) => setTokenA(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Amount A"
            value={amountA}
            onChange={(e) => setAmountA(e.target.value)}
            className="input-field mt-2"
          />
        </div>

        <div className="flex justify-center">
          <Plus className="w-6 h-6 text-gray-600" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Token B Address</label>
          <input
            type="text"
            placeholder="0x..."
            value={tokenB}
            onChange={(e) => setTokenB(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Amount B"
            value={amountB}
            onChange={(e) => setAmountB(e.target.value)}
            className="input-field mt-2"
          />
        </div>
      </div>

      <button
        onClick={handleAddLiquidity}
        disabled={!account || !amountA || !amountB || loading}
        className="btn-primary mt-8 bg-emerald-600 hover:bg-emerald-500"
      >
        {!account ? 'Connect Wallet' : 
         loading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Processing...</> : 
         !pairAddress ? 'Create Pair & Add Liquidity' : 'Add Liquidity'}
      </button>
    </div>
  );
}
