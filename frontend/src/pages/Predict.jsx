import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, ArrowRight, Table, Upload, AlertTriangle, CheckCircle, Activity, Info, HelpCircle } from 'lucide-react';
import { apiService } from '../services/api';

const Predict = () => {
    const [formData, setFormData] = useState({
        step: 1,
        type: 'PAYMENT',
        amount: 1000.0,
        nameOrig: 'C123456789',
        oldbalanceOrg: 5000.0,
        newbalanceOrig: 4000.0,
        nameDest: 'M987654321',
        oldbalanceDest: 0.0,
        newbalanceDest: 0.0,
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [showTips, setShowTips] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'step' || name.includes('balance') || name === 'amount' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await apiService.predict(formData);
            setResult(data);
        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const types = ["PAYMENT", "TRANSFER", "CASH_OUT", "DEBIT", "CASH_IN"];

    const tips = [
        "Step represents the hour of the transaction (1-744).",
        "Higher amounts during 'TRANSFER' types often trigger risk alerts.",
        "Zero balances in receiver accounts are common in initial fraud stages.",
        "The GNN model analyzes the connection between sender and receiver accounts."
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-10"
        >
            {/* Form Section */}
            <div className="lg:w-1/2 flex flex-col gap-6">
                <div className="flex flex-col gap-2 mb-4">
                    <h1 className="font-syne font-extrabold text-4xl glow-text flex items-center gap-3">
                        <Shield className="text-accent" /> Transaction Analysis
                    </h1>
                    <p className="text-gray-400 text-sm opacity-80">
                        Enter transaction details below to check for potential fraud risk.
                    </p>
                </div>

                <div className="relative">
                    <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-navy-800/40 border border-navy-700/50 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-gray-400 mb-2 block flex justify-between">
                                    <span>Time Step (Hour: 1-744)</span>
                                    <span className="text-accent font-bold">Hour {formData.step}</span>
                                </label>
                                <input
                                    type="range" min="1" max="744" step="1"
                                    name="step" value={formData.step} onChange={handleChange}
                                    className="w-full accent-accent h-2 rounded-lg bg-navy-900 appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-400 mb-2 block">Transaction Type</label>
                                <select
                                    name="type" value={formData.type} onChange={handleChange}
                                    className="w-full bg-navy-900 border border-navy-700 rounded-lg p-3 text-sm focus:border-accent outline-none appearance-none cursor-pointer"
                                >
                                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-400 mb-2 block">Amount (USD)</label>
                                <input
                                    name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange}
                                    className="w-full bg-navy-900 border border-navy-700 rounded-lg p-3 text-sm focus:border-accent outline-none"
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-400 mb-2 block">Sender Account ID</label>
                                <input
                                    name="nameOrig" value={formData.nameOrig} onChange={handleChange}
                                    className="w-full bg-navy-900 border border-navy-700 rounded-lg p-3 text-sm focus:border-accent outline-none"
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-400 mb-2 block">Receiver Account ID</label>
                                <input
                                    name="nameDest" value={formData.nameDest} onChange={handleChange}
                                    className="w-full bg-navy-900 border border-navy-700 rounded-lg p-3 text-sm focus:border-accent outline-none"
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-400 mb-2 block">Sender Initial Balance</label>
                                <input
                                    name="oldbalanceOrg" type="number" value={formData.oldbalanceOrg} onChange={handleChange}
                                    className="w-full bg-navy-900 border border-navy-700 rounded-lg p-3 text-sm focus:border-accent outline-none"
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-400 mb-2 block">Sender Final Balance</label>
                                <input
                                    name="newbalanceOrig" type="number" value={formData.newbalanceOrig} onChange={handleChange}
                                    className="w-full bg-navy-900 border border-navy-700 rounded-lg p-3 text-sm focus:border-accent outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full mt-10 p-4 bg-accent hover:bg-accent/80 text-background font-syne font-bold text-lg rounded-xl transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                        >
                            {loading ? (
                                <>
                                    <Activity size={20} className="animate-spin text-background" />
                                    Analyzing Transaction...
                                </>
                            ) : (
                                <>
                                    Analyze for Fraud <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick Tips Toggle */}
                    <button
                        onClick={() => setShowTips(!showTips)}
                        className="absolute -top-3 -right-3 p-2 bg-navy-700 rounded-full border border-navy-600 text-gray-400 hover:text-accent transition-colors shadow-lg z-10"
                        title="Display Analysis Tips"
                    >
                        <HelpCircle size={20} />
                    </button>

                    <AnimatePresence>
                        {showTips && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-4 p-4 rounded-xl bg-accent/5 border border-accent/20 backdrop-blur-sm"
                            >
                                <h4 className="text-accent font-bold text-sm mb-2 flex items-center gap-2">
                                    <Info size={14} /> Analysis Tips
                                </h4>
                                <ul className="space-y-1">
                                    {tips.map((tip, i) => (
                                        <li key={i} className="text-gray-400 text-xs flex items-start gap-2">
                                            <span className="text-accent mt-0.5">•</span> {tip}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex gap-4">
                    <button className="flex-1 flex items-center justify-center gap-2 p-4 bg-navy-800/40 border border-navy-700 rounded-xl text-gray-400 hover:text-white transition-all text-sm font-medium">
                        <Upload size={18} /> Batch Upload CSV
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 p-4 bg-navy-800/40 border border-navy-700 rounded-xl text-gray-400 hover:text-white transition-all text-sm font-medium">
                        <Table size={18} /> View Sample Schema
                    </button>
                </div>
            </div>

            {/* Result Section */}
            <div className="lg:w-1/2 min-h-[500px]">
                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full border-2 border-dashed border-navy-700/50 rounded-2xl flex flex-col items-center justify-center text-gray-600 gap-4"
                        >
                            <Search size={64} className="opacity-20" />
                            <p className="font-mono text-sm tracking-widest uppercase">Awaiting Input Data</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="h-full flex flex-col gap-6"
                        >
                            <div className={cn(
                                "p-8 rounded-2xl border-2 backdrop-blur-md shadow-2xl relative overflow-hidden",
                                result.is_fraud ? "bg-fraud/10 border-fraud/40 shadow-fraud/5" : "bg-safe/10 border-safe/40 shadow-safe/5"
                            )}>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="font-syne font-extrabold text-2xl uppercase tracking-tighter">Analysis Results</h2>
                                    <span className="font-mono text-xs opacity-50 uppercase">Latency: {result.latency_ms}ms</span>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-6 mb-10">
                                    <div className="relative w-48 h-48 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-navy-900" />
                                            <motion.circle
                                                initial={{ strokeDashoffset: 502.4 }}
                                                animate={{ strokeDashoffset: 502.4 * (1 - result.risk_score) }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="502.4"
                                                className={result.is_fraud ? "text-fraud drop-shadow-[0_0_12px_rgba(255,45,85,0.8)]" : "text-safe drop-shadow-[0_0_12px_rgba(0,255,136,0.8)]"}
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <span className={cn(
                                                "text-4xl font-bold font-syne",
                                                result.is_fraud ? "text-fraud glow-text" : "text-safe"
                                            )}>
                                                {(result.risk_score * 100).toFixed(1)}%
                                            </span>
                                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Risk Score</span>
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "flex items-center gap-2 px-6 py-2 rounded-full font-bold font-syne text-xl",
                                        result.is_fraud ? "bg-fraud text-white shadow-[0_0_20px_rgba(255,45,85,0.4)]" : "bg-safe text-background shadow-[0_0_20px_rgba(0,255,136,0.4)]"
                                    )}>
                                        {result.is_fraud ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                                        {result.is_fraud ? "Potential Fraud" : "Safe Transaction"}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-medium text-xs text-gray-400 uppercase tracking-widest border-b border-navy-700 pb-2">Why this result?</h3>
                                    <p className="text-sm leading-relaxed text-gray-300">
                                        {result.explanation}
                                    </p>

                                    <div className="bg-navy-900/50 p-4 rounded-xl border border-navy-700/50 flex flex-col gap-3">
                                        <div className="flex justify-between items-center text-[11px] font-mono text-gray-500">
                                            <span>AI Confidence</span>
                                            <span className="text-accent">{(result.confidence * 100).toFixed(2)}%</span>
                                        </div>
                                        <div className="w-full bg-navy-800 h-1 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${result.confidence * 100}%` }}
                                                transition={{ duration: 1 }}
                                                className="h-full bg-accent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-navy-800/20 border border-navy-700/50 backdrop-blur-sm flex flex-col gap-4">
                                <h4 className="font-syne font-bold text-sm text-gray-400">Next Steps</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="p-3 text-xs bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded-lg font-medium transition-all">
                                        View Node Connections
                                    </button>
                                    <button className="p-3 text-xs bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded-lg font-medium transition-all">
                                        Download PDF Report
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Predict;

function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
}
