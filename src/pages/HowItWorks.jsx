import React from 'react';
import { Droplets, ArrowRightLeft, Coins, ShieldCheck } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <Droplets className="w-8 h-8 text-cyan-400" />,
      title: "1. Provide Liquidity",
      desc: "Users deposit pairs of tokens into smart contract pools. This creates the liquidity needed for others to trade against."
    },
    {
      icon: <ArrowRightLeft className="w-8 h-8 text-emerald-400" />,
      title: "2. Constant Product Formula",
      desc: "Prices are determined automatically using the x * y = k formula. As one token is bought, its price increases relative to the other."
    },
    {
      icon: <Coins className="w-8 h-8 text-amber-400" />,
      title: "3. Earn Trading Fees",
      desc: "Every swap incurs a 0.3% fee. This fee is added directly to the pool reserves, increasing the value of LP tokens over time."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-violet-400" />,
      title: "4. Decentralized & Trustless",
      desc: "No order books, no centralized matching engine. All trades are executed instantly on-chain via immutable smart contracts."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          How Nexus AMM Works
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          A fully decentralized automated market maker built on the constant product formula.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {steps.map((step, i) => (
          <div key={i} className="glass-panel p-8 rounded-3xl hover:border-gray-700 transition-colors">
            <div className="bg-gray-900/80 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-gray-800">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-100">{step.title}</h3>
            <p className="text-gray-400 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
