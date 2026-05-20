import React, { useState } from 'react';
import { Droplets, Activity } from 'lucide-react';
import { Web3Provider } from './context/Web3Context';
import WalletButton from './components/web3/WalletButton';
import SwapCard from './components/dapp/SwapCard';
import PoolCard from './components/dapp/PoolCard';
import HowItWorks from './pages/HowItWorks';
import Toast from './components/ui/Toast';
import { FACTORY_ADDRESS } from './constants/contract';

function AppContent() {
  const [activeTab, setActiveTab] = useState('swap');
  const [toast, setToast] = useState(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Nexus<span className="text-cyan-500">AMM</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-1 bg-gray-900/50 p-1 rounded-full border border-gray-800">
            {['swap', 'pool', 'about'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                  activeTab === tab ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <WalletButton />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 py-12 relative">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        
        {activeTab === 'swap' && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-3">Swap Tokens</h1>
              <p className="text-gray-400">Instantly trade tokens with low fees.</p>
            </div>
            <SwapCard setToast={setToast} />
          </div>
        )}

        {activeTab === 'pool' && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-3">Liquidity Pools</h1>
              <p className="text-gray-400">Provide liquidity to earn 0.3% trading fees.</p>
            </div>
            <PoolCard setToast={setToast} />
          </div>
        )}

        {activeTab === 'about' && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HowItWorks />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 bg-gray-950/50 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="w-4 h-4 text-emerald-500" />
            Factory: <span className="font-mono text-gray-400">{FACTORY_ADDRESS}</span>
          </div>
          <div className="text-sm text-gray-500">
            Built by <a href="http://www.codexero.xyz/" target="_blank" rel="noreferrer" className="text-cyan-500 hover:underline">CodeXero</a> - Powered by <a href="https://www.clusterprotocol.ai/" target="_blank" rel="noreferrer" className="text-cyan-500 hover:underline">Cluster Protocol</a>
          </div>
        </div>
      </footer>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}
