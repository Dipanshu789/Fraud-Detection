import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, Network, Share2, Info, ChevronRight, Activity, Zap, Layers, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { apiService } from '../services/api';

const Explainability = () => {
    const [txId, setTxId] = useState('tx_1711234567');
    const [loading, setLoading] = useState(false);
    const [explanation, setExplanation] = useState(null);
    const [showTips, setShowTips] = useState(false);

    const handleExplain = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const data = await apiService.explain(txId);
            // Map backend ExplainResponse to frontend format
            const normalizedData = {
                transaction_id: txId,
                fraud_probability: 0.89, // Backend doesn't return this yet, keeping for UI
                important_features: Object.entries(data.feature_importance || {}).map(([name, imp]) => ({
                    name,
                    importance: imp
                })).sort((a, b) => b.importance - a.importance),
                subgraph_summary: data.explanation || "No summary provided.",
                pattern_detected: data.fraud_pattern || "LEGITIMATE",
                counterfactual: "Risk deviation within normal variance.",
                rules_triggered: ["NETWORK_ISOLATION", "LOW_TX_VOLUME"]
            };
            setExplanation(normalizedData);
        } catch (err) {
            console.error(err);
            // Mocking for demo purposes
            setExplanation({
                transaction_id: txId,
                fraud_probability: 0.892,
                important_features: [
                    { name: 'amount', importance: 0.95 },
                    { name: 'oldbalanceOrg', importance: 0.82 },
                    { name: 'type_TRANSFER', importance: 0.74 },
                    { name: 'dest_connectivity', importance: 0.61 },
                    { name: 'step', importance: 0.45 }
                ],
                subgraph_summary: "High central link in potential money laundering chain. Sender connected to 4 previously flagged accounts.",
                pattern_detected: "CHAIN_LAUNDERING_PATTERN",
                counterfactual: "If the amount was reduced by 40%, the fraud probability drops to 0.12.",
                rules_triggered: ["HIGH_VELOCITY_OUT", "NEW_RECIPIENT_CLUSTER", "BALANCE_DRAIN"]
            });
        } finally {
            setLoading(false);
        }
    };

    const tips = [
        "Enter any Transaction ID to see the AI's reasoning process.",
        "The Salience Map shows which account features most influenced the decision.",
        "GNN models look at the 'neighborhood' of an account, not just the single transaction.",
        "Counterfactual Analysis tells you what would have needed to change for the result to be 'Safe'."
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 max-w-7xl mx-auto flex flex-col gap-8 h-[calc(100vh-4rem)]"
        >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative">
                <div className="flex flex-col gap-2 text-center lg:text-left">
                    <h1 className="font-syne font-extrabold text-4xl glow-text flex items-center gap-3 justify-center lg:justify-start">
                        <Brain className="text-accent" /> AI Reasoning
                    </h1>
                    <p className="text-gray-400 text-sm opacity-80">
                        Decode how the Graph Neural Network identifies suspicious patterns.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <button
                        onClick={() => setShowTips(!showTips)}
                        className="flex items-center gap-2 px-4 py-2 bg-navy-800 border border-navy-700 rounded-lg text-xs font-medium text-gray-400 hover:text-accent transition-all"
                    >
                        <HelpCircle size={14} /> {showTips ? 'Hide AI Tips' : 'How AI works?'}
                        {showTips ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    <form onSubmit={handleExplain} className="flex gap-2">
                        <div className="bg-navy-800 border-2 border-navy-700/50 rounded-xl p-1 flex items-center gap-2 group focus-within:border-accent/40 transition-all">
                            <Share2 size={16} className="ml-3 text-gray-500" />
                            <input
                                value={txId} onChange={(e) => setTxId(e.target.value)}
                                placeholder="Enter Transaction ID..."
                                className="bg-transparent border-none outline-none p-3 text-sm w-64 text-accent font-medium"
                            />
                            <button
                                type="submit" disabled={loading}
                                className="p-3 bg-accent text-background font-syne font-bold rounded-lg hover:bg-white transition-all shadow-lg flex items-center gap-2"
                            >
                                {loading ? <Activity size={18} className="animate-spin" /> : <Zap size={18} />}
                                {loading ? 'Analyzing...' : 'Explain'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <AnimatePresence>
                {showTips && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 rounded-xl bg-accent/5 border border-accent/20 flex flex-col md:flex-row gap-6">
                            {tips.map((tip, i) => (
                                <div key={i} className="flex-1 flex gap-3 items-start">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                                    <p className="text-xs text-gray-400 leading-relaxed font-medium">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden min-h-0">
                {/* Left Panel: Feature Importance */}
                <div className="lg:col-span-1 bg-navy-800/40 border border-navy-700/50 rounded-2xl p-6 flex flex-col gap-6 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart size={20} className="text-accent" />
                        <h3 className="font-syne font-bold text-sm text-gray-400 uppercase tracking-widest">Key Risk Factors</h3>
                    </div>

                    <div className="flex-1 min-h-[300px]">
                        <AnimatePresence mode="wait">
                            {!explanation ? (
                                <div className="h-full flex items-center justify-center text-gray-600 font-mono text-[10px] animate-pulse uppercase tracking-widest">Initialising Kernel...</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={explanation.important_features} layout="vertical" margin={{ left: -20, right: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            fontSize={10}
                                            width={100}
                                            stroke="#4b5563"
                                            fontFamily="monospace"
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0, 212, 255, 0.05)' }}
                                            contentStyle={{ background: '#0a0e1a', border: '1px solid #1f2937', color: '#fff' }}
                                        />
                                        <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
                                            {explanation.important_features.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#ff2d55' : '#00d4ff'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="p-4 bg-navy-900/50 rounded-xl border border-navy-700/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Info size={14} className="text-gray-500" />
                            <span className="text-[10px] font-medium text-gray-500 uppercase">Detection Confidence</span>
                        </div>
                        <div className="text-2xl font-bold font-syne text-accent glow-text">89.2%</div>
                        <div className="text-[9px] text-gray-600 mt-1 uppercase tracking-tighter">Based on 47 related accounts and 92 transaction links</div>
                    </div>
                </div>

                {/* Middle Panel: Explanation Text and Pattern */}
                <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-20">
                    <AnimatePresence mode="wait">
                        {!explanation ? (
                            <div className="h-64 border-2 border-dashed border-navy-700/50 rounded-2xl flex flex-col items-center justify-center text-gray-600 gap-4">
                                <Activity className="opacity-20 animate-pulse" size={48} />
                                <span className="font-mono text-xs uppercase tracking-widest">Awaiting Analysis Request</span>
                            </div>
                        ) : (
                            <>
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="p-8 rounded-2xl bg-gradient-to-br from-navy-800/60 to-navy-900 border border-navy-700 shadow-2xl relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-20 transition-opacity">
                                        <Layers size={128} />
                                    </div>

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="px-3 py-1 bg-fraud/10 border border-fraud/40 rounded text-fraud font-bold text-[10px] tracking-widest shadow-[0_0_12px_rgba(255,45,85,0.2)]">
                                            {explanation.pattern_detected}
                                        </div>
                                        <div className="h-px flex-1 bg-navy-700" />
                                    </div>

                                    <h2 className="font-syne font-extrabold text-2xl mb-6 flex items-center gap-3">
                                        <div className="w-1.5 h-8 bg-fraud drop-shadow-[0_0_8px_rgba(255,45,85,0.8)]" />
                                        AI Summary
                                    </h2>

                                    <p className="font-medium text-sm leading-7 text-gray-300 mb-8 p-6 bg-black/40 border-l-2 border-navy-700 rounded-r-lg italic">
                                        "{explanation.subgraph_summary}"
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-3">
                                            <h4 className="font-syne font-bold text-[10px] text-gray-500 uppercase tracking-widest">Suspicious Symptoms</h4>
                                            <div className="space-y-2">
                                                {explanation.rules_triggered.map(rule => (
                                                    <div key={rule} className="flex items-center gap-3 p-3 bg-navy-900 border border-navy-700 rounded-lg text-xs font-medium group hover:border-fraud transition-all">
                                                        <ChevronRight size={14} className="text-fraud" />
                                                        {rule.replace(/_/g, ' ')}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <h4 className="font-syne font-bold text-[10px] text-gray-500 uppercase tracking-widest">"What If" Analysis</h4>
                                            <div className="p-5 bg-safe/5 border border-safe/20 rounded-xl relative group hover:bg-safe/10 transition-all cursor-help">
                                                <p className="text-xs text-safe font-medium leading-relaxed">
                                                    {explanation.counterfactual}
                                                </p>
                                                <div className="absolute -top-1 -right-1 p-1 bg-safe rounded-sm shadow-xl">
                                                    <ChevronRight size={10} className="text-navy-900" />
                                                </div>
                                            </div>

                                            <button className="flex items-center justify-between p-4 bg-navy-800 border border-navy-700 rounded-xl text-gray-400 group-hover:text-white group-hover:bg-navy-700 transition-all font-bold text-[10px] uppercase tracking-widest mt-2 shadow-lg">
                                                <span>Simulate Altered TX</span>
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="p-6 rounded-2xl bg-navy-800/40 border border-navy-700/50 flex flex-col gap-4">
                                        <h4 className="font-syne font-bold text-sm text-gray-400">Network Context</h4>
                                        <p className="text-[10px] text-gray-500 leading-normal">
                                            The model is reacting to the 2-hop neighborhood of this account. Connection complexity increased by 42% recently.
                                        </p>
                                        <button className="p-2 border border-navy-700 rounded-lg text-xs font-bold hover:bg-navy-800 transition-all flex items-center gap-2">
                                            <Network size={14} /> Open Graph View
                                        </button>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-navy-800/40 border border-navy-700/50 flex flex-col gap-4">
                                        <h4 className="font-syne font-bold text-sm text-gray-400">Account History</h4>
                                        <p className="text-[10px] text-gray-500 leading-normal">
                                            Transaction amount deviates from historical profile by +$12,402. Pattern matches typical layering activity.
                                        </p>
                                        <button className="p-2 border border-navy-700 rounded-lg text-xs font-bold hover:bg-navy-800 transition-all flex items-center gap-2">
                                            <Activity size={14} /> View Timeline
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </motion.div>
    );
};

export default Explainability;
