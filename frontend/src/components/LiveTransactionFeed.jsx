import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, DollarSign, ArrowRight, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const LiveTransactionFeed = ({ transactions }) => {
    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col bg-navy-900/50 border border-navy-700/50 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="p-4 border-b border-navy-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
                    <h2 className="font-syne font-bold text-lg glow-text flex items-center gap-2">
                        LIVE_FEED <span className="font-mono text-xs opacity-50 px-2 py-0.5 rounded border border-navy-700 bg-navy-800">1.2ms_LATENCY</span>
                    </h2>
                </div>
                <div className="text-xs font-mono text-gray-400">
                    COUNT: <span className="text-accent">{transactions.length}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                <AnimatePresence initial={false}>
                    {transactions.map((tx, idx) => (
                        <motion.div
                            layout
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={`${tx.tx_id}-${idx}`}
                            className={cn(
                                "group relative mb-2 p-3 rounded-lg border border-transparent transition-all duration-300 font-mono text-sm leading-relaxed",
                                tx.is_fraud
                                    ? "bg-fraud/10 border-fraud/20 hover:bg-fraud/20 fraud-pulse"
                                    : "bg-navy-800/40 border-navy-700/20 hover:border-accent/30"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{tx.type}</span>
                                    <span className="text-gray-600 px-1 border-r border-navy-700">|</span>
                                    <span className="text-accent truncate w-24 glow-text">{tx.tx_id}</span>
                                </div>
                                <div className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold tracking-tighter uppercase",
                                    tx.is_fraud ? "bg-fraud text-white" : "bg-safe text-background"
                                )}>
                                    {tx.is_fraud ? "FLAGGED" : "CLEARED"}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                            <User size={10} /> {tx.sender}
                                        </div>
                                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                            <ArrowRight size={10} className="text-accent" /> {tx.receiver}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className={cn(
                                        "text-lg font-bold flex items-center justify-end font-syne",
                                        tx.is_fraud ? "text-fraud glow-text" : "text-safe"
                                    )}>
                                        <DollarSign size={16} />{tx.amount.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-mono">
                                        CONF: {tx.confidence.toFixed(4)}
                                    </div>
                                </div>
                            </div>

                            {tx.is_fraud && (
                                <div className="absolute inset-0 bg-gradient-to-r from-fraud/10 to-transparent pointer-events-none" />
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LiveTransactionFeed;
