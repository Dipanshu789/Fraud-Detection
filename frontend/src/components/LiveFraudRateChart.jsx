import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

const LiveFraudRateChart = ({ transactions }) => {
    const data = useMemo(() => {
        // Group transactions into buckets of 10 for smoothing if we have many
        // or just show recent fraud rate trend
        const windowSize = 20;
        const recentTx = [...transactions].reverse();

        // Calculate rolling fraud rate
        const chartData = [];
        for (let i = 0; i < recentTx.length; i++) {
            const slice = recentTx.slice(Math.max(0, i - windowSize), i + 1);
            const fraudCount = slice.filter(tx => tx.is_fraud).length;
            const rate = slice.length > 0 ? (fraudCount / slice.length) * 100 : 0;

            chartData.push({
                time: i,
                rate,
                isSpike: rate > 15, // Simple threshold-based anomaly
                amount: recentTx[i].amount,
                type: recentTx[i].type
            });
        }

        // Pad if not enough data
        if (chartData.length < 60) {
            const padding = Array.from({ length: 60 - chartData.length }, (_, i) => ({
                time: i - (60 - chartData.length),
                rate: 0
            }));
            return [...padding, ...chartData];
        }

        return chartData.slice(-60);
    }, [transactions]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-navy-900/90 border border-navy-700 p-3 rounded-lg shadow-2xl backdrop-blur-md">
                    <p className="font-mono text-[10px] text-gray-500 mb-1">FRAUD_PROBABILITY</p>
                    <p className="font-syne font-bold text-lg text-accent glow-text">
                        {payload[0].value.toFixed(2)}%
                    </p>
                    <div className="mt-2 border-t border-navy-700 pt-2 flex flex-col gap-1">
                        <span className="text-[10px] text-gray-400">STATUS: {payload[0].value > 15 ? 'ALERT' : 'NORMAL'}</span>
                        <span className="text-[10px] text-gray-400">ID: {payload[0].payload.time}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-navy-800/40 border border-navy-700/50 rounded-xl h-full flex flex-col shadow-inner backdrop-blur-sm group hover:border-accent/30 transition-all duration-300 overflow-hidden"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-syne font-bold text-lg glow-text flex items-center gap-2">
                        NETWORK_THREAT_INDEX <span className="bg-fraud/10 text-fraud text-[10px] px-2 py-0.5 rounded border border-fraud/20">REAL_TIME</span>
                    </h3>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-tighter">Rolling 60-second fraud detection density</p>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-2xl font-bold font-syne text-safe">{data[data.length - 1]?.rate.toFixed(2)}%</span>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">CURRENT_DENSITY</span>
                </div>
            </div>

            <div className="flex-1 min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorSpike" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff2d55" stopOpacity={0.6} />
                                <stop offset="95%" stopColor="#ff2d55" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis
                            stroke="#4b5563"
                            fontSize={10}
                            tickFormatter={(val) => `${val}%`}
                            domain={[0, 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#00d4ff', strokeWidth: 1 }} />
                        <Area
                            type="monotone"
                            dataKey="rate"
                            stroke="#00d4ff"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRate)"
                            animationDuration={500}
                            isAnimationActive={false} // Faster updates
                        />
                    </AreaChart>
                </ResponsiveContainer>

                {/* Anomaly markers */}
                <div className="absolute top-0 right-0 left-10 h-full pointer-events-none flex justify-around opacity-40">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-[1px] h-full bg-navy-700/30" />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default LiveFraudRateChart;
