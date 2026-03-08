import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import Graph from './pages/Graph';
import Explainability from './pages/Explainability';
import Monitoring from './pages/Monitoring';
import { useTransactionWS } from './hooks/useTransactionWS';

const queryClient = new QueryClient();

function App() {
  const { readyState } = useTransactionWS();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background relative selection:bg-accent/30 selection:text-white">
          {/* Scanline Effect Layer */}
          <div className="scanlines" />

          <Navbar readyState={readyState} />

          <main className="relative z-10">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/predict" element={<Predict />} />
              <Route path="/graph" element={<Graph />} />
              <Route path="/graphs" element={<Graph />} />
              <Route path="/explainability" element={<Explainability />} />
              <Route path="/monitoring" element={<Monitoring />} />
            </Routes>
          </main>

          {/* Subtle Global Glows */}
          <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-fraud/5 blur-[100px] rounded-full pointer-events-none -z-10" />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
