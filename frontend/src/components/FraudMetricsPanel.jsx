import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity, Users, ShieldAlert } from 'lucide-react';

const StatCard = ({ title, value, unit, icon, trend, color, delay }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseFloat(value) || 0;
        if (start === end) return;

        let totalDuration = 1000;
        let increment = end / (totalDuration / 16);

        let timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay }}
            className="p-5 flex flex-col justify-between h-32 rounded-xl bg-navy-800/40 border border-navy-700/50 relative overflow-hidden group hover:border-accent/30 transition-all duration-300"
        >
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 font-mono text-xs tracking-widest uppercase">{title}</h3>
                <div className={`p-2 rounded bg-opacity-20 bg-${color} text-${color} border border-${color}/20 mb-2`}>
                    {icon}
                </div>
            </div>

            <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold font-syne text-${color} glow-text`}>
                        {unit === '$' ? '$' : ''}{unit === '#' ? count.toLocaleString(undefined, { maximumFractionDigits: 0 }).replace(/,/g, '') : count.toLocaleString(undefined, { maximumFractionDigits: unit === '%' ? 2 : 0 })}
                        {unit === '%' ? '%' : ''}
                    </span>
                    <span className="text-gray-500 font-mono text-[10px] ml-1">RT</span>
                </div>
                <div className={`flex items-center text-[11px] font-bold ${trend > 0 ? 'text-fraud' : 'text-safe'} font-mono`}>
                    {trend > 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                    {Math.abs(trend)}% 24h
                </div>
            </div>

            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/10 blur-3xl rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </motion.div>
    );
};

const FraudMetricsPanel = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="TOTAL_PROCESSED"
                value={stats.total_count || 0}
                unit="#"
                icon={<Activity size={18} />}
                trend={-2.4}
                color="accent"
                delay={0.1}
            />
            <StatCard
                title="FRAUD_DETECTED"
                value={stats.fraud_count || 0}
                unit="#"
                icon={<ShieldAlert size={18} />}
                trend={12.8}
                color="fraud"
                delay={0.2}
            />
            <StatCard
                title="VALUE_FLAGGED"
                value={stats.flagged_amount || 0}
                unit="$"
                icon={<DollarSign size={18} />}
                trend={8.5}
                color="fraud"
                delay={0.3}
            />
            <StatCard
                title="AVG_CONFIDENCE"
                value={stats.avg_confidence || 89.2}
                unit="%"
                icon={<Users size={18} />}
                trend={-0.5}
                color="safe"
                delay={0.4}
            />
        </div>
    );
};

export default FraudMetricsPanel;
