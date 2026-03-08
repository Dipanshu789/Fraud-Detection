import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LiveTransactionFeed from '../components/LiveTransactionFeed';
import FraudMetricsPanel from '../components/FraudMetricsPanel';
import LiveFraudRateChart from '../components/LiveFraudRateChart';
import { useTransactionWS } from '../hooks/useTransactionWS';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Info, HelpCircle, ChevronDown, ChevronUp, Shield, BarChart2, Network, Heart, ArrowRight } from 'lucide-react';

const Dashboard = () => {
    const { transactions, readyState } = useTransactionWS();
    const [showTips, setShowTips] = useState(false);

    const navLinks = [
        { to: '/predict', label: 'Predictor', desc: 'Fraud Analysis', icon: Shield, color: 'text-accent' },
        { to: '/explainability', label: 'Reasoning', desc: 'AI Logs', icon: BarChart2, color: 'text-fraud' },
        { to: '/graph', label: 'Explorer', desc: 'Graph UI', icon: Network, color: 'text-safe' },
        { to: '/monitoring', label: 'Health', desc: 'System stats', icon: Heart, color: 'text-purple-400' },
    ];

    // Calculate live stats
    const stats = {
        total_count: transactions.length,
        fraud_count: transactions.filter(tx => tx.is_fraud).length,
        flagged_amount: transactions.reduce((acc, tx) => tx.is_fraud ? acc + tx.amount : acc, 0),
        avg_confidence: transactions.length > 0
            ? (transactions.reduce((acc, tx) => acc + tx.confidence, 0) / transactions.length) * 100
            : 0
    };

    const tips = [
        "Live Feed: Real-time transactions analyzed by the GNN model.",
        "Fraud Rate Chart: Trends in detection frequency over time.",
        "Risk Metrics: Highlight the total value of prevented financial fraud.",
        "System Load: Monitoring GPU resources used for AI inference."
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 max-w-7xl mx-auto flex flex-col gap-8 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar pr-4 pb-20"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="font-syne font-extrabold text-4xl glow-text flex items-center gap-3">
                        <LayoutDashboard className="text-accent" /> Control Center
                    </h1>
                    <p className="text-gray-400 text-sm opacity-80">
                        Real-time overview of transaction flow and fraud detection performance.
                    </p>
                </div>

                <button
                    onClick={() => setShowTips(!showTips)}
                    className="flex items-center gap-2 px-4 py-2 bg-navy-800 border border-navy-700 rounded-lg text-xs font-medium text-gray-400 hover:text-accent transition-all"
                >
                    <HelpCircle size={14} /> {showTips ? 'Hide Tips' : 'Dashboard Tips'}
                    {showTips ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            <AnimatePresence>
                {showTips && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {tips.map((tip, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                                    <p className="text-xs text-gray-400 leading-relaxed font-medium">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Navigation Launchpad */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {navLinks.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className="p-4 rounded-xl bg-navy-800/40 border border-navy-700/50 hover:border-accent/50 hover:bg-navy-800/60 transition-all group flex flex-col gap-3"
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg bg-navy-900 border border-navy-700 ${link.color} group-hover:scale-110 transition-transform`}>
                                <link.icon size={18} />
                            </div>
                            <ArrowRight size={14} className="text-gray-600 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </div>
                        <div>
                            <h3 className="font-syne font-bold text-sm text-gray-200">{link.label}</h3>
                            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">{link.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                <div className="lg:col-span-4 lg:h-[600px]">
                    <LiveTransactionFeed transactions={transactions} />
                </div>

                <div className="lg:col-span-6 flex flex-col gap-8">
                    <FraudMetricsPanel stats={stats} />

                    <div className="h-64 lg:h-96">
                        <LiveFraudRateChart transactions={transactions} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-navy-800/40 border border-navy-700/50 flex flex-col justify-center items-center gap-4 group hover:border-accent/30 transition-all duration-300 backdrop-blur-sm">
                            <span className="text-gray-500 font-syne text-[10px] uppercase tracking-widest text-center">AI Load</span>
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-navy-700" />
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.74)} className="text-accent drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
                                </svg>
                                <span className="absolute text-xl font-bold font-syne text-accent">74%</span>
                            </div>
                            <span className="text-xs text-gray-400">Normal</span>
                        </div>

                        <div className="p-6 rounded-2xl bg-navy-800/40 border border-navy-700/50 flex flex-col justify-center items-center gap-4 group hover:border-accent/30 transition-all duration-300 backdrop-blur-sm">
                            <span className="text-gray-500 font-syne text-[10px] uppercase tracking-widest text-center">Network Delay</span>
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-navy-700" />
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.05)} className="text-safe drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]" />
                                </svg>
                                <span className="absolute text-xl font-bold font-syne text-safe">LOW</span>
                            </div>
                            <span className="text-xs text-gray-400">Wait: 2ms</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
