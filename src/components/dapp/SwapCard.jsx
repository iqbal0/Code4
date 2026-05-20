import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ArrowDown, Settings, RefreshCw, AlertCircle } from 'lucide-react';
import { useWeb3 } from '../../context/Web3Context';
import { FACTORY_ADDRESS, FACTORY_ABI, PAIR_ABI, ERC20_ABI } from '../../constants/contract';

export default function SwapCard({ setToast }) {
  const { provider, signer, account } = useWeb3();
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [pairAddress, setPairAddress] = useState(null);
  const [reserves, setReserves] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isToken0, setIsToken0] = useState(true);

  // Fetch Pair and Reserves when tokens change
  useEffect(() => {
    const fetchPair = async () => {
      if (!provider || !tokenA || !tokenB || tokenA.length !== 42 || tokenB.length !== 42) {
        setPairAddress(null);
        setReserves(null);
        return;
      }
      try {
        const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
        const pair = await factory.getPair(tokenA, tokenB);
        
        if (pair === ethers.ZeroAddress) {
          setPairAddress(null);
          setReserves(null);
          return;
        }
        
        setPairAddress(pair);
        const pairContract = new ethers.Contract(pair, PAIR_ABI, provider);
        const [res0, res1] = await pairContract.getReserves();
        const t0 = await pairContract.token0();
        
        const isA0 = t0.toLowerCase() === tokenA.toLowerCase();
        setIsToken0(isA0);
        
        setReserves({
          reserveA: isA0 ? res0 : res1,
          reserveB: isA0 ? res1 : res0
        });
      } catch (err) {
        console.error("Error fetching pair:", err);
      }
    };
    fetchPair();
  }, [tokenA, tokenB, provider]);

  // Calculate Amount Out (x * y = k with 0.3% fee)
  useEffect(() => {
    if (!amountIn || !reserves || isNaN(amountIn)) {
      setAmountOut('');
      return;
    }
    try {
      const amountInWei = ethers.parseEther(amountIn);
      if (amountInWei === 0n) {
        setAmountOut('');
        return;
      }
      
      const amountInWithFee = amountInWei * 997n;
      const numerator = amountInWithFee * reserves.reserveB;
      const denominator = (reserves.reserveA * 1000n) + amountInWithFee;
      const outWei = numerator / denominator;
      
      setAmountOut(ethers.formatEther(outWei));
    } catch (err) {
      setAmountOut('');
    }
  }, [amountIn, reserves]);

  const handleSwap = async () => {
    if (!signer || !pairAddress || !amountIn || !amountOut) return;
    setLoading(true);
    try {
      const amountInWei = ethers.parseEther(amountIn);
      const amountOutWei = ethers.parseEther(amountOut);
      
      // 1. Transfer Token A to Pair (Router-less AMM pattern)
      const tokenAContract = new ethers.Contract(tokenA, ERC20_ABI, signer);
      setToast({ message: 'Transferring tokens to pair...', type: 'success' });
      const tx1 = await tokenAContract.transfer(pairAddress, amountInWei);
      await tx1.wait();

      // 2. Call Swap on Pair
      const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, signer);
      const amount0Out = isToken0 ? 0n : amountOutWei;
      const amount1Out = isToken0 ? amountOutWei : 0n;
      
      setToast({ message: 'Executing swap...', type: 'success' });
      const tx2 = await pairContract.swap(amount0Out, amount1Out, account, "0x");
      await tx2.wait();
      
      setToast({ message: 'Swap successful!', type: 'success' });
      setAmountIn('');
    } catch (err) {
      console.error(err);
      setToast({ message: err.reason || 'Swap failed. Check console.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 max-w-md w-full mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Swap</h2>
        <button className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {/* Input Token */}
        <div className="bg-gray-950/50 border border-gray-800/50 rounded-2xl p-4 transition-all focus-within:border-cyan-500/50">
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-400">You pay</label>
          </div>
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              className="bg-transparent text-3xl font-semibold outline-none w-full placeholder-gray-700"
            />
          </div>
          <input
            type="text"
            placeholder="Token Address (0x...)"
            value={tokenA}
            onChange={(e) => setTokenA(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-500 outline-none mt-3 border-t border-gray-800/50 pt-3"
          />
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center -my-4 relative z-10">
          <button 
            onClick={() => {
              setTokenA(tokenB);
              setTokenB(tokenA);
              setAmountIn(amountOut);
            }}
            className="bg-gray-900 border-4 border-gray-950 p-2 rounded-xl hover:text-cyan-400 transition-colors"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>

        {/* Output Token */}
        <div className="bg-gray-950/50 border border-gray-800/50 rounded-2xl p-4 transition-all focus-within:border-cyan-500/50">
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-400">You receive</label>
          </div>
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="0.0"
              value={amountOut}
              readOnly
              className="bg-transparent text-3xl font-semibold outline-none w-full text-gray-300 placeholder-gray-700"
            />
          </div>
          <input
            type="text"
            placeholder="Token Address (0x...)"
            value={tokenB}
            onChange={(e) => setTokenB(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-500 outline-none mt-3 border-t border-gray-800/50 pt-3"
          />
        </div>
      </div>

      {/* Pool Info */}
      {tokenA && tokenB && (
        <div className="mt-4 p-3 rounded-xl bg-gray-900/50 border border-gray-800/50 text-sm flex items-start gap-2">
          {pairAddress ? (
            <>
              <RefreshCw className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
              <div className="text-gray-400">
                <p>Pool Found: <span className="text-gray-300 font-mono">{pairAddress.slice(0,8)}...{pairAddress.slice(-6)}</span></p>
                <p>Reserves: {ethers.formatEther(reserves.reserveA)} / {ethers.formatEther(reserves.reserveB)}</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-amber-500/90">No liquidity pool exists for this pair yet. Go to the Pool tab to create one.</p>
            </>
          )}
        </div>
      )}

      <button
        onClick={handleSwap}
        disabled={!account || !pairAddress || !amountIn || loading}
        className="btn-primary mt-6"
      >
        {!account ? 'Connect Wallet' : 
         !pairAddress ? 'Insufficient Liquidity' : 
         loading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Swapping...</> : 
         'Swap'}
      </button>
    </div>
  );
}
