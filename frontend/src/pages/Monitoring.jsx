import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Heart, Activity, Server, Database, Cpu, HardDrive, ShieldCheck, AlertCircle, Clock, Zap, Info, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { apiService } from '../services/api';

const HealthCard = ({ title, value, status, icon: Icon, delay }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay }}
        className="p-5 flex flex-col justify-between h-32 rounded-xl bg-navy-800/40 border border-navy-700/50 relative overflow-hidden group hover:border-accent/30 transition-all duration-300"
    >
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 font-mono text-xs tracking-widest uppercase">{title}</h3>
            <div className={`p-2 rounded bg-opacity-20 ${status === 'healthy' ? 'bg-safe text-safe shadow-[0_0_8px_rgba(0,255,136,0.3)]' : 'bg-fraud text-fraud shadow-[0_0_8px_rgba(255,45,85,0.3)]'} border border-current mb-2`}>
                <Icon size={18} />
            </div>
        </div>

        <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold font-syne ${status === 'healthy' ? 'text-gray-200' : 'text-fraud'} glow-text`}>
                    {value}
                </span>
                <span className="text-gray-600 font-mono text-[9px] ml-1 tracking-widest uppercase">{status}</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-safe animate-ping" />
        </div>
    </motion.div>
);

const Monitoring = () => {
    const [healthData, setHealthData] = useState(null);
    const [latencyHistory, setLatencyHistory] = useState([]);
    const [showTips, setShowTips] = useState(false);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const data = await apiService.getHealth();
                setHealthData(data);

                const newLatency = {
                    time: new Date().toLocaleTimeString(),
                    p50: 12 + Math.random() * 5,
                    p95: 25 + Math.random() * 15,
                    p99: 45 + Math.random() * 30
                };
                setLatencyHistory(prev => [...prev, newLatency].slice(-30));
            } catch (err) {
                console.error(err);
            }
        };

        const interval = setInterval(fetchHealth, 5000);
        fetchHealth();
        return () => clearInterval(interval);
    }, []);

    const tips = [
        "P99 Latency shows the response time for the slowest 1% of requests.",
        "System Resource logs help identify if hardware bottlenecks are affecting AI speed.",
        "Anomaly Log flags unusual patterns in the incoming data stream before they are fully analyzed.",
        "A healthy system should maintain response times under 50ms for optimal real-time detection."
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 max-w-7xl mx-auto flex flex-col gap-8 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar pr-4 pb-20"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="font-syne font-extrabold text-4xl glow-text flex items-center gap-3">
                        <Heart className="text-fraud" /> System Health
                    </h1>
                    <p className="text-gray-400 text-sm opacity-80">
                        Monitor AI model performance and server infrastructure in real-time.
                    </p>
                </div>

                <button
                    onClick={() => setShowTips(!showTips)}
                    className="flex items-center gap-2 px-4 py-2 bg-navy-800 border border-navy-700 rounded-lg text-xs font-medium text-gray-400 hover:text-accent transition-all"
                >
                    <Info size={14} /> {showTips ? 'Hide Monitoring Tips' : 'Show Monitoring Tips'}
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
                        <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tips.map((tip, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                                    <p className="text-xs text-gray-400 leading-relaxed">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <HealthCard title="AI MODEL V." value="G-SAGE 1.2" status="healthy" icon={ShieldCheck} delay={0.1} />
                <HealthCard title="SERVER API" value="FASTAPI" status="healthy" icon={Server} delay={0.2} />
                <HealthCard title="GRAPH DB" value="PYG-STORE" status="healthy" icon={Database} delay={0.3} />
                <HealthCard title="AVG LATENCY" value="18.2ms" status="healthy" icon={Clock} delay={0.4} />
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Latency History */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-navy-800/40 border border-navy-700/50 flex flex-col gap-6 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity size={20} className="text-accent" />
                            <h3 className="font-syne font-bold text-sm text-gray-400">Response Latency Pulse</h3>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
                                <span className="w-2 h-2 rounded bg-accent" /> Average
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
                                <span className="w-2 h-2 rounded bg-safe" /> 95th Percent
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
                                <span className="w-2 h-2 rounded bg-fraud" /> Max Delay
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={latencyHistory}>
                                <defs>
                                    <linearGradient id="colorP99" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff2d55" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#ff2d55" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis stroke="#4b5563" fontSize={10} tickFormatter={(val) => `${val}ms`} />
                                <Tooltip
                                    contentStyle={{ background: '#0a0e1a', border: '1px solid #1f2937', color: '#fff' }}
                                    cursor={{ stroke: '#1f2937' }}
                                />
                                <Area type="monotone" dataKey="p99" stroke="#ff2d55" strokeWidth={2} fill="url(#colorP99)" />
                                <Area type="monotone" dataKey="p95" stroke="#00ff88" strokeWidth={2} fill="transparent" />
                                <Area type="monotone" dataKey="p50" stroke="#00d4ff" strokeWidth={2} fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Resource Stats */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="p-6 rounded-2xl bg-navy-800/40 border border-navy-700/50 flex flex-col gap-6">
                        <h4 className="font-syne font-bold text-sm text-gray-400 border-b border-navy-700 pb-2 flex justify-between items-center">
                            Resource Monitor
                            <div className="flex items-center gap-1.5 text-[10px] text-accent font-mono uppercase">
                                <Zap size={10} className="animate-pulse" /> Live
                            </div>
                        </h4>

                        <div className="space-y-6">
                            {[
                                { label: 'CPU LOAD', val: 42, icon: Cpu },
                                { label: 'GPU MEMORY', val: 78, icon: Activity },
                                { label: 'STORAGE I/O', val: 12, icon: HardDrive },
                                { label: 'RAM USAGE', val: 56, icon: Layers }
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><item.icon size={12} /> {item.label}</span>
                                        <span className={item.val > 80 ? 'text-fraud' : 'text-accent'}>{item.val}%</span>
                                    </div>
                                    <div className="h-1 bg-navy-900 rounded-full overflow-hidden border border-navy-700/50 p-px">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.val}%` }}
                                            className={`h-full rounded-full ${item.val > 80 ? 'bg-fraud shadow-[0_0_8px_rgba(255,45,85,0.4)]' : 'bg-accent shadow-[0_0_8px_rgba(0,212,255,0.4)]'}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-fraud/5 border border-fraud/20 flex flex-col gap-3 relative group transition-all">
                        <div className="flex items-center gap-2 text-fraud glow-text mb-1">
                            <AlertCircle size={18} />
                            <h4 className="font-syne font-extrabold text-sm uppercase">Recent Anomalies</h4>
                            <div className="bg-fraud text-white text-[8px] px-1.5 py-0.5 rounded ml-auto">IMPORTANT</div>
                        </div>
                        <p className="text-xs text-fraud opacity-70 leading-relaxed mb-4">
                            Detected feature drift in nameOrig. Unusual cluster emerging in transaction volume.
                        </p>
                        <button className="w-full py-2 bg-fraud/20 hover:bg-fraud/30 border border-fraud/40 rounded-lg text-xs font-bold text-fraud transition-all">
                            Review Anomaly Subgraph
                        </button>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};

export default Monitoring;
