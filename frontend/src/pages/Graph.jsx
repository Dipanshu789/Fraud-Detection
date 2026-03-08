import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RefreshCw, Layers, Shield, Activity, Target, Search, Info, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';

const GraphVisualization = () => {
    const svgRef = useRef(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [stats, setStats] = useState({ nodes: 100, edges: 150, clusters: 3 });
    const [showTips, setShowTips] = useState(false);

    useEffect(() => {
        if (!svgRef.current) return;

        const updateSize = () => {
            const width = svgRef.current.clientWidth || window.innerWidth - 320;
            const height = svgRef.current.clientHeight || window.innerHeight - 64;

            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove();

            const g = svg.append("g");

            const zoom = d3.zoom()
                .scaleExtent([0.1, 4])
                .on("zoom", (event) => {
                    g.attr("transform", event.transform);
                });

            svg.call(zoom);

            // Generate synthetic graph data
            const nodes = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                name: `ACC_${Math.floor(Math.random() * 900000) + 100000}`,
                group: Math.random() < 0.1 ? "fraud" : "legit",
                val: Math.random() * 10 + 10
            }));

            const links = Array.from({ length: 80 }, () => ({
                source: Math.floor(Math.random() * nodes.length),
                target: Math.floor(Math.random() * nodes.length),
                value: Math.random() * 2
            }));

            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id).distance(100))
                .force("charge", d3.forceManyBody().strength(-200))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("collision", d3.forceCollide().radius(d => d.val + 5));

            const link = g.append("g")
                .selectAll("line")
                .data(links)
                .enter().append("line")
                .attr("stroke", d => {
                    const s = typeof d.source === 'object' ? d.source : nodes[d.source];
                    const t = typeof d.target === 'object' ? d.target : nodes[d.target];
                    return (s?.group === "fraud" || t?.group === "fraud") ? "#ff2d55" : "#1f2937";
                })
                .attr("stroke-opacity", 0.4)
                .attr("stroke-width", d => Math.max(1, d.value || 1));

            const node = g.append("g")
                .selectAll("circle")
                .data(nodes)
                .enter().append("circle")
                .attr("r", d => d.val)
                .attr("fill", d => d.group === "fraud" ? "#ff2d55" : "#00d4ff")
                .attr("stroke", "#0a0e1a")
                .attr("stroke-width", 2)
                .style("cursor", "pointer")
                .call(d3.drag()
                    .on("start", (event) => {
                        if (!event.active) simulation.alphaTarget(0.3).restart();
                        event.subject.fx = event.subject.x;
                        event.subject.fy = event.subject.y;
                    })
                    .on("drag", (event) => {
                        event.subject.fx = event.x;
                        event.subject.fy = event.y;
                    })
                    .on("end", (event) => {
                        if (!event.active) simulation.alphaTarget(0);
                        event.subject.fx = null;
                        event.subject.fy = null;
                    }))
                .on("click", (event, d) => {
                    setSelectedNode(d);
                });

            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x || 0)
                    .attr("y1", d => d.source.y || 0)
                    .attr("x2", d => d.target.x || 0)
                    .attr("y2", d => d.target.y || 0);

                node
                    .attr("cx", d => d.x || 0)
                    .attr("cy", d => d.y || 0);
            });

            return simulation;
        };

        const simulation = updateSize();
        window.addEventListener('resize', updateSize);

        return () => {
            if (simulation) simulation.stop();
            window.removeEventListener('resize', updateSize);
        };
    }, []);

    const tips = [
        "Red nodes indicate high-risk accounts flagged by the GNN model.",
        "Lines represent financial transactions between accounts.",
        "Clusters of red nodes often indicate organized fraud rings.",
        "You can drag nodes to rearrange the view and zoom in to see details."
    ];

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
            {/* Sidebar Controls */}
            <div className="w-80 bg-navy-900 border-r border-navy-700 flex flex-col p-6 overflow-y-auto custom-scrollbar z-10 shadow-2xl">
                <div className="mb-8">
                    <h2 className="font-syne font-extrabold text-xl glow-text mb-4">Network Explorer</h2>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input className="w-full bg-navy-800 border border-navy-700 rounded-lg py-2 pl-10 pr-4 text-xs focus:border-accent outline-none" placeholder="Search Account ID..." />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-widest pl-1">Map Filters</label>
                        <div className="flex flex-col gap-2">
                            <button className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/40 text-xs text-accent">
                                <span className="flex items-center gap-2"><Layers size={14} /> Full Transaction Graph</span>
                                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            </button>
                            <button className="flex items-center justify-between p-3 rounded-lg bg-navy-800 border border-navy-700 text-xs text-gray-400 hover:text-gray-200 transition-colors">
                                <span className="flex items-center gap-2"><Target size={14} /> Fraud Clusters Only</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-widest pl-1">Node Details</label>
                        <AnimatePresence mode="wait">
                            {!selectedNode ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-8 border-2 border-dashed border-navy-700 rounded-xl flex flex-col items-center justify-center text-center opacity-40 text-gray-500"
                                >
                                    <Activity size={32} className="mb-2" />
                                    <span className="text-[10px] font-mono uppercase">Select a node to view info</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className={`p-6 rounded-xl border-t-4 ${selectedNode.group === "fraud" ? "bg-fraud/10 border-fraud shadow-fraud/5" : "bg-accent/10 border-accent shadow-accent/5"}`}
                                >
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded ${selectedNode.group === "fraud" ? "bg-fraud text-white" : "bg-accent text-background"}`}>
                                                <Shield size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-syne font-bold text-sm tracking-tighter">{selectedNode.name}</span>
                                                <span className="text-[9px] text-gray-500 uppercase">Account #{selectedNode.id}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-[10px] uppercase">
                                            <div className="p-2 border border-navy-700 rounded bg-navy-900">
                                                <span className="text-gray-500 block">Risk Status</span>
                                                <span className={selectedNode.group === "fraud" ? "text-fraud font-bold" : "text-safe font-bold"}>
                                                    {selectedNode.group === "fraud" ? "HIGH RISK" : "CLEAN"}
                                                </span>
                                            </div>
                                            <div className="p-2 border border-navy-700 rounded bg-navy-900">
                                                <span className="text-gray-500 block">Connections</span>
                                                <span className="text-gray-300 font-bold">{Math.floor(Math.random() * 15) + 1}</span>
                                            </div>
                                        </div>

                                        <button className="w-full py-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded-lg text-xs font-bold transition-all">
                                            Deep Dive Analysis
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Graph Tips Section */}
                    <div className="mt-auto">
                        <button
                            onClick={() => setShowTips(!showTips)}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-navy-800 border border-navy-700 text-xs text-gray-400 hover:text-accent transition-colors mb-4"
                        >
                            <span className="flex items-center gap-2"><HelpCircle size={14} /> Visualization Tips</span>
                            {showTips ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        <AnimatePresence>
                            {showTips && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mb-4"
                                >
                                    <div className="p-4 rounded-xl bg-navy-800/50 border border-navy-700/50 space-y-3">
                                        {tips.map((tip, i) => (
                                            <div key={i} className="flex gap-2 items-start">
                                                <div className="mt-1.5 w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                                                <p className="text-[10px] text-gray-500 leading-tight">{tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="p-4 rounded-xl bg-navy-800 border border-navy-700 font-mono text-[9px] leading-tight text-gray-500">
                        <p className="mb-1 text-gray-400 font-bold">GRAPH STATS:</p>
                        <p>NODES: {stats.nodes}</p>
                        <p>EDGES: {stats.edges}</p>
                        <p>CLUSTERS: {stats.clusters}</p>
                    </div>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="relative flex-1 bg-black/40 overflow-hidden">
                <svg ref={svgRef} className="w-full h-full select-none" />

                {/* Floating UI Overlay */}
                <div className="absolute top-6 right-6 flex items-center gap-2">
                    <button className="p-3 bg-navy-900/80 border border-navy-700 rounded-full hover:border-accent transition-all text-gray-400 hover:text-accent shadow-xl">
                        <ZoomIn size={18} />
                    </button>
                    <button className="p-3 bg-navy-900/80 border border-navy-700 rounded-full hover:border-accent transition-all text-gray-400 hover:text-accent shadow-xl">
                        <ZoomOut size={18} />
                    </button>
                    <button className="p-3 bg-navy-900/80 border border-navy-700 rounded-full hover:border-accent transition-all text-gray-400 hover:text-accent shadow-xl">
                        <RefreshCw size={18} />
                    </button>
                </div>

                {/* Grid Pattern Background */}
                <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(0,212,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>
        </div>
    );
};

export default GraphVisualization;
