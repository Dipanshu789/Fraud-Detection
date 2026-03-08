import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Shield, Network, BarChart2, Heart } from 'lucide-react';

const Navbar = ({ readyState }) => {
    const isConnected = readyState === 1;

    const links = [
        { to: '/dashboard', label: 'DASHBOARD', icon: <Activity size={18} /> },
        { to: '/predict', label: 'PREDICT', icon: <Shield size={18} /> },
        { to: '/graph', label: 'NETWORK', icon: <Network size={18} /> },
        { to: '/explainability', label: 'EXPLAIN', icon: <BarChart2 size={18} /> },
        { to: '/monitoring', label: 'SYSTEM', icon: <Heart size={18} /> },
    ];

    return (
        <nav className="h-16 border-b border-navy-700 bg-background/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded flex items-center justify-center text-background font-bold text-xl drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]">S</div>
                    <span className="font-syne font-extrabold text-2xl tracking-tighter glow-text">SENTINEL</span>
                </div>

                <div className="hidden md:flex items-center gap-1">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) => `
                flex items-center gap-2 px-4 py-2 rounded transition-all duration-200 text-sm font-medium
                ${isActive ? 'bg-accent/10 text-accent border border-accent/30' : 'text-gray-400 hover:text-white hover:bg-navy-800'}
              `}
                        >
                            {link.icon}
                            {link.label}
                        </NavLink>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-800 border border-navy-700">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-safe shadow-[0_0_8px_rgba(0,255,136,0.8)]' : 'bg-fraud shadow-[0_0_8px_rgba(255,45,85,0.8)]'}`} />
                    <span className={isConnected ? 'text-safe' : 'text-fraud'}>
                        {isConnected ? 'NODE_CONNECTED' : 'NODE_OFFLINE'}
                    </span>
                </div>
                <div className="text-gray-500 border-l border-navy-700 pl-4 py-1">
                    LOCAL_UPTIME: <span className="text-gray-300">04:12:08:14</span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
