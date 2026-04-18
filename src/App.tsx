import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Bolt, 
  Search, 
  ShieldCheck, 
  Bot, 
  PieChart, 
  Wallet, 
  Settings, 
  TrendingUp,
  Cpu,
  ArrowUpRight,
  PiggyBank,
  Loader2,
  Check
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';
import { cn, formatINR } from './lib/utils';
import { SimulationData, BtcPriceInfo, ReasoningStep } from './types';

// Mock reasoning log initial state
const INITIAL_LOGS: ReasoningStep[] = [
  { id: '1', type: 'core', message: 'Analyzing macro liquidations on WazirX... detected high inflow.', timestamp: new Date().toISOString() },
  { id: '2', type: 'core', message: 'Rebalancing portfolio for India tax efficiency.', timestamp: new Date().toISOString() },
  { id: '3', type: 'tax', message: 'Scoped 14 loss-harvesting opportunities in sub-wallets.', timestamp: new Date().toISOString() },
];

export default function App() {
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [priceInfo, setPriceInfo] = useState<BtcPriceInfo | null>(null);
  const [logs, setLogs] = useState<ReasoningStep[]>(INITIAL_LOGS);
  const [harvestingActive, setHarvestingActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'core' | 'portfolio' | 'tax' | 'settings'>('core');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [harvestSuccess, setHarvestSuccess] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'nominal' | 'optimizing' | 'harvesting'>('nominal');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [isChartPulsing, setIsChartPulsing] = useState(false);
  const [simulatorAsset, setSimulatorAsset] = useState(() => localStorage.getItem('simulatorAsset') || 'BTC');
  const [monthlyAmount, setMonthlyAmount] = useState(() => localStorage.getItem('monthlyAmount') || '10000');

  const assets = [
    { id: 'BTC', name: 'Bitcoin', cap: '₹105T', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { id: 'ETH', name: 'Ethereum', cap: '₹22T', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'SOL', name: 'Solana', cap: '₹4.5T', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { id: 'MATIC', name: 'Polygon', cap: '₹0.8T', color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  ];

  const filteredAssets = useMemo(() => {
    if (!searchQuery) return [];
    return assets.filter(a => 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('simulatorAsset', simulatorAsset);
    localStorage.setItem('monthlyAmount', monthlyAmount);
    localStorage.setItem('harvestingActive', String(harvestingActive));
    localStorage.setItem('showNotifications', String(showNotifications));
  }, [simulatorAsset, monthlyAmount, harvestingActive, showNotifications]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      setShowSearchDropdown(true);
      if (query.toLowerCase().includes('btc') || query.toLowerCase().includes('bitcoin')) {
        addLog(`Analyzing market search intent: ${query.toUpperCase()}${query.length < 5 ? '... fetching deep liquidity pools.' : ''}`, 'market');
      }
    } else {
      setShowSearchDropdown(false);
    }
  };

  const selectAsset = (asset: string) => {
    setSelectedAsset(asset);
    setSearchQuery(asset === 'BTC' ? 'Bitcoin' : asset);
    setShowSearchDropdown(false);
    setActiveTab('portfolio');
    setSimulatorAsset(asset);
    
    // Agent acknowledgment
    addLog(`Focusing Collab-Crypto Agent on ${asset === 'BTC' ? 'Bitcoin (BTC)' : asset} portfolio...`, 'core');
    
    // Visual Pulse
    setIsChartPulsing(true);
    setTimeout(() => setIsChartPulsing(false), 2000);
  };

  const notifications = [
    { id: '1', title: 'DCA Executed', message: '₹10,000 processed via kernel X-041', time: '2h ago' },
    { id: '2', title: 'Tax Opportunity', message: 'Loss-harvesting lot identified (₹4,200 savings)', time: '5h ago' },
    { id: '3', title: 'Price Alert', message: 'BTC breached upper resistance channel', time: '1d ago' },
  ];

  const addLog = (message: string, type: 'core' | 'tax' | 'market' = 'core') => {
    const newLog: ReasoningStep = {
      id: Math.random().toString(),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 15));
  };

    const fetchData = async () => {
      try {
        const cacheBuster = `t=${Date.now()}`;
        const [simRes, priceRes] = await Promise.all([
          fetch(`/api/simulate-dca?${cacheBuster}`).then(r => r.json()),
          fetch(`/api/price?${cacheBuster}`).then(r => r.json())
        ]);
        setSimulation(simRes);
        setPriceInfo(priceRes);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };

    // Fetch data on mount and set up intervals
    useEffect(() => {
      fetchData();

      // Refresh market data every 30 seconds
      const priceInterval = setInterval(() => {
        fetchData();
        addLog('Real-time price feed synchronized with CoinGecko API.', 'market');
      }, 30000);

      // Stream fake reasoning steps every 12 seconds
      const interval = setInterval(() => {
          const types: ('core'|'tax'|'market')[] = ['core', 'tax', 'market'];
          const messages = [
              "Detecting market dip in BTC/INR pair...",
              "Calculating tax offset for FY 2024-25...",
              "Executing autonomous limit order at support level.",
              "Analyzing block-level whale movements on-chain.",
              "Optimizing gas fees for batch settlement."
          ];
          const newLog: ReasoningStep = {
              id: Math.random().toString(),
              type: types[Math.floor(Math.random() * types.length)],
              message: messages[Math.floor(Math.random() * messages.length)],
              timestamp: new Date().toISOString()
          };
          setLogs(prev => [newLog, ...prev].slice(0, 15));
      }, 12000);

      return () => clearInterval(interval);
    }, []);

    // Detailed tax reasoning sequence based on simulations
    useEffect(() => {
      if (!simulation || !priceInfo) return;

      const currentPrice = priceInfo.inr || simulation.currentBtcPrice;
      const lossLots = simulation.lots.filter(lot => currentPrice < lot.purchasePrice);
      
      let delay = 2000;
      lossLots.forEach((lot, index) => {
          setTimeout(() => {
              const lossPerBtc = lot.purchasePrice - currentPrice;
              const totalLoss = lossPerBtc * lot.btcAmount;
              const taxSaving = totalLoss * 0.3; // 30% VDA Tax in India

              const newLog: ReasoningStep = {
                  id: `lot-calc-${lot.id}`,
                  type: 'tax',
                  message: `Lot [${index + 1}]: bought at ${formatINR(lot.purchasePrice)}. Current loss: ${formatINR(lossPerBtc)}/BTC. Harvesting ₹${Math.round(taxSaving).toLocaleString()} in tax savings.`,
                  timestamp: new Date().toISOString()
              };
              setLogs(prev => [newLog, ...prev].slice(0, 15));
          }, delay);
          delay += 2500;
      });

      if (lossLots.length > 0) {
        setTimeout(() => {
            const totalSavings = lossLots.reduce((acc, lot) => acc + (lot.purchasePrice - currentPrice) * lot.btcAmount * 0.3, 0);
            const summaryLog: ReasoningStep = {
                id: 'tax-summary-log',
                type: 'tax',
                message: `Tax Analysis Complete: Total potential offset identified: ₹${Math.round(totalSavings).toLocaleString()}. Ready for optimization.`,
                timestamp: new Date().toISOString()
            };
            setLogs(prev => [summaryLog, ...prev].slice(0, 15));
        }, delay);
      }
    }, [simulation, priceInfo]);
  
  const handleOrbToggle = () => {
    const statuses: ('nominal' | 'optimizing' | 'harvesting')[] = ['nominal', 'optimizing', 'harvesting'];
    const currentIndex = statuses.indexOf(agentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    setAgentStatus(nextStatus);
    addLog(`Agent diagnostics triggered. Switching kernel profile to: ${nextStatus.toUpperCase()}.`, 'core');
    
    // Force a fresh market check when agent status changes
    fetchData(); 
  };

  const handleExecute = async () => {
    console.log('Attempting API Call...');
    setIsExecuting(true);
    try {
      const cacheBuster = `t=${Date.now()}`;
      const response = await fetch(`/api/execute?${cacheBuster}`, { method: 'POST' });
      const data = await response.json();
      console.log('Data Received:', data);
      
      // Keep existing logic for UI state
      const simRes = await fetch(`/api/simulate-dca?amount=${monthlyAmount}&asset=${simulatorAsset}&${cacheBuster}`);
      const simData = await simRes.json();
      
      setTimeout(() => {
          setSimulation(simData);
          addLog(`DCA Strategy Executed: ${data.message}. New Balance Segment: ${data.newBalance} BTC`, 'core');
          setIsExecuting(false);
      }, 1500);
    } catch (err) {
      console.error('Network Error:', err);
      setIsExecuting(false);
    }
  };

  const handleHarvestTax = async () => {
    console.log('Harvest Button Clicked!');
    if (!simulation || !priceInfo || !taxAnalysis.unrealizedLosses) return;
    
    setIsHarvesting(true);
    setHarvestSuccess(false);
    
    addLog('Tax-loss harvesting confirmed. Recalculating net position under Section 115BBH...', 'tax');

    const currentPrice = priceInfo.inr || simulation.currentBtcPrice;
    const lossLotsIds = simulation.lots
      .filter(lot => currentPrice < lot.purchasePrice)
      .map(lot => lot.id);

    try {
        const res = await fetch('/api/tax-harvest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lossLotsIds })
        });
        const data = await res.json();
        
        setTimeout(() => {
            addLog(data.message, 'tax');
            setHarvestSuccess(true);
            setIsHarvesting(false);
            
            // To visibly decrease the figure, we simulate the "post-harvest" state 
            // by filtering out the harvested lots from the local simulation state
            setSimulation(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    lots: prev.lots.filter(lot => !lossLotsIds.includes(lot.id))
                };
            });
            
            // Reset success state after visual confirmation
            setTimeout(() => setHarvestSuccess(false), 3000);
        }, 2000);
    } catch (err) {
        console.error('Harvesting failed', err);
        setIsHarvesting(false);
    }
  };

  const taxAnalysis = useMemo(() => {
    if (!simulation || !priceInfo) return { totalLiability: 0, unrealizedLosses: 0 };
    
    const currentPrice = priceInfo.inr || simulation.currentBtcPrice;
    let totalLiability = 0;
    let unrealizedLosses = 0;

    simulation.lots.forEach(lot => {
        const valueChange = (currentPrice - lot.purchasePrice) * lot.btcAmount;
        if (valueChange > 0) {
            // 30% flat tax on gains per lot
            totalLiability += valueChange * 0.3;
        } else {
            // Total losses (cannot be offset)
            unrealizedLosses += Math.abs(valueChange);
        }
    });

    return { totalLiability, unrealizedLosses };
  }, [simulation, priceInfo]);

  const chartData = useMemo(() => {
    if (!simulation) return [];
    const lotsData = simulation.lots.map(lot => ({
        date: new Date(lot.date).toLocaleDateString('en-IN', { month: 'short' }),
        price: Math.round(lot.purchasePrice),
        amount: lot.btcAmount,
        type: 'historical'
    }));

    // Add current live price as a final bar
    if (priceInfo?.inr) {
        lotsData.push({
            date: 'LIVE',
            price: Math.round(priceInfo.inr),
            amount: 0,
            type: 'live'
        });
    }

    return lotsData;
  }, [simulation, priceInfo]);

  const allocationData = [
    { name: 'Bitcoin', value: 72, color: '#f7931a' },
    { name: 'INR Cash', value: 28, color: '#353534' },
  ];

  if (!simulation) return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-headline animate-pulse">Initializing Agentic Monolith...</div>

  return (
    <div className="bg-background text-white font-sans selection:bg-primary selection:text-black min-h-screen pb-32 overflow-x-hidden relative">
      {/* TopAppBar */}
      <header className="bg-neutral-900/60 backdrop-blur-3xl shadow-2xl fixed top-0 left-0 right-0 z-[200] border-b border-white/5">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <span 
                onClick={() => setActiveTab('core')}
                className="text-2xl font-black text-orange-500 uppercase tracking-tighter font-headline flex items-center gap-2 cursor-pointer"
            >
                Collab-Crypto
            </span>
            <nav className="hidden md:flex items-center gap-6 font-headline">
              <button 
                onClick={() => setActiveTab('core')}
                className={cn(
                    "transition-all px-3 py-1 rounded-full",
                    activeTab === 'core' ? "text-orange-500 font-bold bg-white/5" : "text-neutral-400 hover:text-white"
                )}
              >Core</button>
              <button 
                onClick={() => setActiveTab('portfolio')}
                className={cn(
                    "transition-all px-3 py-1 rounded-full",
                    activeTab === 'portfolio' ? "text-orange-500 font-bold bg-white/5" : "text-neutral-400 hover:text-white"
                )}
              >Portfolio</button>
              <button 
                onClick={() => setActiveTab('tax')}
                className={cn(
                    "transition-all px-3 py-1 rounded-full",
                    activeTab === 'tax' ? "text-orange-500 font-bold bg-white/5" : "text-neutral-400 hover:text-white"
                )}
              >Tax</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <input 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowSearchDropdown(true)}
                className="bg-[#0e0e0e] text-white border border-white/10 rounded-full px-6 py-2 w-64 focus:ring-1 focus:ring-primary transition-all placeholder:text-neutral-600 z-[210] relative" 
                placeholder="Search assets..." 
                type="text"
              />
              <Search className="absolute right-4 top-2.5 w-4 h-4 text-neutral-500 z-[211]" />
              
              <AnimatePresence>
                {showSearchDropdown && filteredAssets.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-12 left-0 w-full glass-card ghost-border rounded-2xl p-2 shadow-2xl z-[205] overflow-hidden"
                    >
                        {filteredAssets.map(asset => (
                            <div 
                                key={asset.id}
                                onClick={() => {
                                    selectAsset(asset.id);
                                }}
                                className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer group"
                            >
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border", asset.bg, asset.border, "group-hover:opacity-80")}>
                                    <span className={cn("font-bold text-[10px]", asset.color)}>{asset.id}</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase tracking-wider">{asset.name}</p>
                                    <p className="text-[10px] text-neutral-500">Market Cap: {asset.cap}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2 relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-[#a2eeff]/10 group rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5 text-neutral-400 group-hover:text-[#a2eeff] transition-colors" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-neutral-900" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-14 right-0 w-80 glass-card ghost-border rounded-2xl p-4 shadow-2xl z-[300]"
                  >
                    <h4 className="font-headline font-bold text-sm mb-4 uppercase tracking-widest text-[#a2eeff]">Recent Alerts</h4>
                    <div className="space-y-3">
                      {notifications.map(n => (
                        <div key={n.id} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                          <p className="text-xs font-bold text-neutral-200">{n.title}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">{n.message}</p>
                          <p className="text-[8px] text-neutral-600 mt-1 uppercase font-bold">{n.time}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={() => setActiveTab('settings')}
                className="p-2 hover:bg-[#a2eeff]/10 group rounded-full transition-colors"
              >
                <Bolt className="w-5 h-5 text-neutral-400 group-hover:text-[#a2eeff] transition-colors" />
              </button>
              <div 
                onClick={() => setActiveTab('settings')}
                className="w-10 h-10 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center cursor-pointer hover:border-[#a2eeff]/50 hover:bg-[#a2eeff]/10 transition-all group"
              >
                  <Bot className="w-6 h-6 text-primary group-hover:text-[#a2eeff] transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 pt-24">
        {/* India Tax Banner Chip */}
        <div className="flex justify-end mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card ghost-border flex items-center gap-4 px-6 py-3 rounded-full"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-gradient-to-b from-[#FF9933] via-white to-[#138808] rounded-sm relative overflow-hidden shadow-lg border border-white/10" />
              <span className="text-tertiary font-headline text-[10px] uppercase tracking-widest font-bold">India Tax Status</span>
            </div>
            <span className="font-medium text-sm">30% Flat Tax + 1% TDS</span>
            <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_10px_#86d2e3] animate-pulse" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-20 gap-8">
          {activeTab === 'core' && (
            <div className="lg:col-span-13 flex flex-col gap-8">
              
              {/* Hero Balance Card */}
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => {
                fetchData();
                setAgentStatus('optimizing');
                addLog('Portfolio balance element triggered manual verification. Re-syncing balances.', 'core');
              }}
              className={cn(
                "p-8 rounded-lg relative overflow-hidden cursor-pointer group transition-all duration-700",
                (searchQuery.toLowerCase().includes('btc') || searchQuery.toLowerCase().includes('bitcoin')) 
                    ? "ring-2 ring-primary shadow-[0_0_40px_rgba(247,147,26,0.3)] bg-surface-high scale-[1.01]" 
                    : "bg-surface-low ghost-border"
              )}
            >
              <div className="relative z-10 transition-transform group-hover:translate-x-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-tertiary font-headline text-[10px] uppercase tracking-widest font-bold">Autonomous Balance</span>
                  <ShieldCheck className="w-3 h-3 text-tertiary" />
                </div>
                <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter mb-2">
                  {simulation.totalBtc.toFixed(2)} <span className="text-primary">BTC</span>
                </h1>
                <p className="text-2xl font-headline font-medium text-neutral-400">
                    ≈ <span className="text-tertiary">INR</span> {formatINR(simulation.totalBtc * (priceInfo?.inr || simulation.currentBtcPrice)).replace('₹', '')}
                </p>
              </div>
              <div className="absolute -right-20 -bottom-20 w-80 h-80 orb-glow opacity-30 animate-pulse" />
            </motion.section>

            {/* Bitcoin Price Chart */}
            <section 
              onClick={() => {
                fetchData();
                addLog('Price chart interaction detected. Fetching high-fidelity market deltas.', 'market');
              }}
              className={cn(
                "glass-card p-8 rounded-lg min-h-[450px] relative transition-all duration-700 hover:bg-white/[0.02] cursor-pointer group",
                (searchQuery.toLowerCase().includes('btc') || searchQuery.toLowerCase().includes('bitcoin')) 
                    ? "ring-2 ring-primary shadow-[0_0_40px_rgba(247,147,26,0.2)] border-primary/50" 
                    : "ghost-border",
                isChartPulsing && "animate-pulse ring-4 ring-primary shadow-[0_0_60px_rgba(247,147,26,0.4)]"
              )}
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="font-headline text-2xl font-bold">BTC/INR Market Delta</h2>
                  <p className="text-neutral-400 text-sm">HFT Optimized Streaming Data</p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-white/5 hover:bg-white/10 px-4 py-1 rounded-full text-xs font-bold text-tertiary">1H</button>
                  <button className="bg-primary text-black px-4 py-1 rounded-full text-xs font-bold shadow-sm">1D</button>
                  <button className="bg-white/5 hover:bg-white/10 px-4 py-1 rounded-full text-xs font-bold">1W</button>
                </div>
              </div>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }}
                      interval={0}
                    />
                    <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#131313', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        formatter={(value: number) => [formatINR(value), 'Price']}
                    />
                    <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#f7931a' : 'rgba(247,147,26,0.3)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="p-4 bg-[#0e0e0e] rounded-lg border border-white/5 transition-transform hover:scale-[1.02]">
                  <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1">24h High</p>
                  <p className="text-lg font-headline font-bold">{formatINR(priceInfo?.inr_24h_high || 0)}</p>
                </div>
                <div className="p-4 bg-[#0e0e0e] rounded-lg border border-white/5 transition-transform hover:scale-[1.02]">
                  <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1">24h Low</p>
                  <p className="text-lg font-headline font-bold">{formatINR(priceInfo?.inr_24h_low || 0)}</p>
                </div>
                <div className="p-4 bg-[#0e0e0e] rounded-lg border border-white/5 transition-transform hover:scale-[1.02]">
                  <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1">Volatility</p>
                  <p className="text-lg font-headline font-bold text-tertiary">1.24%</p>
                </div>
              </div>
            </section>
          </div>
          )}

          {activeTab === 'core' && (
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Collab-Crypto Core Agent reasoning */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleOrbToggle}
              className="glass-card ghost-border p-8 rounded-lg flex flex-col items-center relative overflow-hidden cursor-pointer group transition-all hover:border-primary/50"
            >
              <div className={cn(
                "absolute top-0 left-0 w-full h-[2px] transition-all duration-700 opacity-50",
                agentStatus === 'nominal' ? "bg-gradient-to-r from-transparent via-primary to-transparent" :
                agentStatus === 'optimizing' ? "bg-gradient-to-r from-transparent via-blue-400 to-transparent" :
                "bg-gradient-to-r from-transparent via-tertiary to-transparent"
              )} />
              <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center relative mb-6">
                <div className={cn(
                  "absolute inset-0 orb-glow transition-all duration-1000",
                  agentStatus === 'nominal' ? "animate-pulse" : 
                  agentStatus === 'optimizing' ? "animate-spin brightness-125 saturate-150" : "animate-bounce"
                )} />
                <Cpu className={cn(
                  "w-12 h-12 transition-colors duration-500",
                  agentStatus === 'nominal' ? "text-primary" :
                  agentStatus === 'optimizing' ? "text-blue-400" : "text-tertiary"
                )} />
              </div>
              <h3 className="font-headline text-2xl font-bold mb-1">Collab-Crypto Core</h3>
              <p className={cn(
                "font-headline text-[10px] uppercase tracking-[0.2em] mb-2 transition-colors",
                agentStatus === 'nominal' ? "text-tertiary" :
                agentStatus === 'optimizing' ? "text-blue-400" : "text-primary"
              )}>Agent Identity: X-041</p>
              <div className="flex items-center gap-2 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                <span className="text-[9px] font-bold text-neutral-500 uppercase">Status: {agentStatus}</span>
              </div>
              
              <div className="w-full bg-white/5 rounded-xl p-4 hide-scrollbar h-48 overflow-y-auto space-y-4 border border-white/5 shadow-inner">
                <AnimatePresence mode="popLayout">
                  {logs.map((log) => (
                    <motion.div 
                      key={log.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mt-2 shrink-0",
                        log.type === 'core' ? "bg-primary" : log.type === 'tax' ? "bg-tertiary" : "bg-neutral-400"
                      )} />
                      <p className="text-sm text-neutral-400 leading-relaxed">
                        <span className="text-neutral-200 font-medium capitalize">Core:</span> {log.message}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>

            {/* Asset Allocation Donut */}
            <section 
              onClick={() => {
                addLog('Simulating portfolio rebalancing impact on current entries...', 'core');
              }}
              className="bg-surface-low ghost-border p-8 rounded-lg cursor-pointer transition-all hover:bg-white/[0.03]"
            >
              <h3 className="font-headline text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neutral-400" />
                Asset Allocation
              </h3>
              <div className="flex items-center gap-8">
                <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                            <Pie
                                data={allocationData}
                                innerRadius={42}
                                outerRadius={50}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {allocationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                        </RePieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-neutral-500">BTC</span>
                        <span className="text-sm font-black">72%</span>
                    </div>
                </div>
                <div className="flex-1 space-y-3">
                  {allocationData.map((item) => (
                    <div key={item.name} className="flex justify-between items-center group cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Tax Optimizer Card */}
            <section className="glass-card ghost-border p-8 rounded-lg relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-headline text-xl font-bold">VDA Tax Monitor</h3>
                  <p className="text-tertiary text-[10px] font-bold tracking-widest uppercase italic">Regulatory: 115BBH</p>
                </div>
                <PiggyBank className="w-6 h-6 text-red-400" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter mb-1">Est. Tax Liability</p>
                    <p className="text-2xl font-headline font-black text-red-500">₹{Math.round(taxAnalysis.totalLiability).toLocaleString('en-IN')}</p>
                </div>
                <div>
                    <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter mb-1">Unrealized Loss</p>
                    <p className="text-2xl font-headline font-black text-neutral-400">₹{Math.round(taxAnalysis.unrealizedLosses).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                <div className="flex gap-3">
                    <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-[10px] leading-relaxed text-red-200 uppercase font-bold">
                        Regulatory Alert: Losses from VDA assets cannot be used to offset gains from other VDA assets or income sources.
                    </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 transition-all hover:bg-black/60">
                <div>
                  <p className="text-sm font-bold">Tax-Aware Strategy</p>
                  <p className="text-[10px] text-neutral-500 uppercase">Per-Lot Optimization</p>
                </div>
                <button 
                  onClick={() => setHarvestingActive(!harvestingActive)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors duration-300",
                    harvestingActive ? "bg-primary/20" : "bg-white/10"
                  )}
                >
                  <motion.div 
                    animate={{ x: harvestingActive ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-primary shadow-lg"
                  />
                </button>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleHarvestTax();
                }}
                disabled={isHarvesting || taxAnalysis.unrealizedLosses === 0}
                className={cn(
                  "w-full mt-6 py-4 rounded-full font-headline font-bold text-black text-sm uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 z-[999] relative",
                  harvestSuccess ? "bg-green-500 shadow-[0_0_20px_#22c55e]" : "clay-button bg-primary",
                  (isHarvesting || taxAnalysis.unrealizedLosses === 0) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isHarvesting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-black" />
                    <span>Processing...</span>
                  </>
                ) : harvestSuccess ? (
                  <>
                    <Check className="w-5 h-5 text-black" />
                    <span>Harvest Successful</span>
                  </>
                ) : (
                  "Sync Tax Report"
                )}
              </button>
            </section>
          </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="lg:col-span-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl w-full col-span-1">
                    <h2 className="font-headline text-2xl font-black mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        DCA Simulator
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-2 block">Target Asset</label>
                            <input 
                                value={simulatorAsset}
                                onChange={(e) => setSimulatorAsset(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary transition-all font-bold"
                                placeholder="BTC, ETH..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-2 block">Monthly Amount (INR)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-neutral-500 font-bold">₹</span>
                                <input 
                                    value={monthlyAmount}
                                    onChange={(e) => setMonthlyAmount(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-8 py-3 focus:ring-1 focus:ring-primary transition-all font-bold"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleExecute}
                            className="w-full py-4 rounded-xl font-headline font-bold text-black bg-primary uppercase tracking-widest active:scale-95 transition-transform z-[999] relative"
                        >
                            Run Simulation
                        </button>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 rounded-2xl w-full col-span-1">
                    <h2 className="font-headline text-2xl font-black mb-4">Investment History</h2>
                    <div className="space-y-4">
                        {simulation?.lots.slice().reverse().map((lot) => (
                            <div key={lot.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <p className="text-xs text-neutral-500">{new Date(lot.date).toLocaleDateString()}</p>
                                    <p className="font-bold">{lot.btcAmount.toFixed(6)} BTC</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-neutral-500">Price Paid</p>
                                    <p className="font-bold text-tertiary">₹{lot.purchasePrice.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
                <div className="lg:col-span-2 glass-card p-8 rounded-2xl">
                    <h2 className="font-headline text-2xl font-black mb-4">Portfolio Analytics</h2>
                    <p className="text-neutral-400">Total Invested: <span className="text-white font-bold">₹{simulation?.totalInvested.toLocaleString()}</span></p>
                    <p className="text-neutral-400">Average Purchase: <span className="text-white font-bold">₹{simulation ? (simulation.totalInvested / simulation.totalBtc).toLocaleString() : '0'}</span></p>
                    <div className="mt-8 p-6 bg-primary/10 rounded-2xl border border-primary/20">
                        <p className="text-sm text-primary font-bold uppercase tracking-widest mb-2">Performance</p>
                        <p className="text-4xl font-black">+{simulation ? (((simulation.totalBtc * (priceInfo?.inr || simulation.currentBtcPrice)) / simulation.totalInvested - 1) * 100).toFixed(2) : '0'}%</p>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="lg:col-span-20 shrink-0">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 rounded-2xl mb-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="font-headline text-3xl font-black">Indian VDA Tax Matrix</h2>
                            <p className="text-neutral-400">Section 115BBH Optimization Engine</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-neutral-500 font-bold uppercase">Estimated Liability</p>
                            <p className="text-3xl font-black text-red-500">₹{Math.round(taxAnalysis.totalLiability).toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-neutral-500 uppercase font-bold mb-1">30% Flat Tax</p>
                            <p className="text-xl font-bold">Active</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-neutral-500 uppercase font-bold mb-1">1% TDS</p>
                            <p className="text-xl font-bold">Deducted At Source</p>
                        </div>
                        <div className="p-6 bg-red-400/10 rounded-2xl border border-red-400/20">
                            <p className="text-[10px] text-red-400 uppercase font-bold mb-1">Unrealized Loss</p>
                            <p className="text-xl font-bold">₹{Math.round(taxAnalysis.unrealizedLosses).toLocaleString()}</p>
                        </div>
                        <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20">
                            <p className="text-[10px] text-primary uppercase font-bold mb-1">Net Gain (Post-Tax)</p>
                            <p className="text-xl font-bold text-primary">₹{Math.round(taxAnalysis.totalLiability / 0.3 * 0.7).toLocaleString()}</p>
                        </div>
                    </div>
                </motion.div>
                
                {/* Re-using the Tax Optimizer Card here */}
                <section className="glass-card ghost-border p-8 rounded-lg relative overflow-hidden max-w-xl mx-auto">
                    <h3 className="font-headline text-xl font-bold mb-6">Optimization Execution</h3>
                    <button 
                      onClick={handleHarvestTax}
                      disabled={isHarvesting || taxAnalysis.unrealizedLosses === 0}
                      className={cn(
                        "w-full py-4 rounded-full font-headline font-bold text-black text-sm uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 z-[999] relative",
                        harvestSuccess ? "bg-green-500 shadow-[0_0_20px_#22c55e]" : "clay-button bg-primary",
                        (isHarvesting || taxAnalysis.unrealizedLosses === 0) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                        {isHarvesting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-black" />
                            <span>Processing...</span>
                          </>
                        ) : harvestSuccess ? (
                          <>
                            <Check className="w-5 h-5 text-black" />
                            <span>Harvest Successful</span>
                          </>
                        ) : (
                          "Confirm Tax Harvesting"
                        )}
                    </button>
                </section>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="lg:col-span-20 max-w-2xl mx-auto w-full">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 rounded-2xl">
                    <h2 className="font-headline text-2xl font-black mb-8">Agent Parameters</h2>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center pb-6 border-b border-white/5">
                            <div>
                                <p className="font-bold">Autonomous Execution</p>
                                <p className="text-xs text-neutral-500">Allow agent to execute DCA without confirmation</p>
                            </div>
                            <div 
                                onClick={() => setHarvestingActive(!harvestingActive)}
                                className={cn(
                                    "w-12 h-6 rounded-full relative transition-colors duration-300 cursor-pointer",
                                    harvestingActive ? "bg-primary/20" : "bg-white/10"
                                )}
                            >
                                <motion.div 
                                    animate={{ x: harvestingActive ? 24 : 4 }}
                                    className="absolute top-1 w-4 h-4 rounded-full bg-primary shadow-lg"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center pb-6 border-b border-white/5">
                            <div>
                                <p className="font-bold">Tax-Aware Strategy</p>
                                <p className="text-xs text-neutral-500">Optimize entries for maximum tax harvesting</p>
                            </div>
                            <div className="w-12 h-6 rounded-full bg-primary/20 relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-primary" />
                            </div>
                        </div>
                        <div className="pt-4">
                            <button 
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.reload();
                                }}
                                className="text-red-400 text-sm font-bold border border-red-400/20 px-4 py-2 rounded-full hover:bg-red-400/10 transition-colors"
                            >
                                Reset Agent Collab-Crypto X-041
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
          )}
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50 flex justify-around items-center px-4 py-2 bg-neutral-800/60 backdrop-blur-2xl shadow-2xl rounded-full border border-white/10">
        <div 
            onClick={() => setActiveTab('core')}
            className={cn(
                "flex flex-col items-center justify-center rounded-full w-14 h-14 transition-all cursor-pointer",
                activeTab === 'core' ? "text-black clay-button scale-110 shadow-lg" : "text-neutral-500 hover:text-white"
            )}
        >
          <Bot className="w-6 h-6" />
          <span className="font-headline text-[8px] uppercase tracking-widest font-black">Core</span>
        </div>
        <div 
            onClick={() => setActiveTab('portfolio')}
            className={cn(
                "flex flex-col items-center justify-center rounded-full w-14 h-14 transition-all cursor-pointer",
                activeTab === 'portfolio' ? "text-black clay-button scale-110 shadow-lg" : "text-neutral-500 hover:text-white"
            )}
        >
          <PieChart className="w-6 h-6" />
          <span className="font-headline text-[8px] uppercase tracking-widest mt-1">Portfolio</span>
        </div>
        <div 
            onClick={() => setActiveTab('tax')}
            className={cn(
                "flex flex-col items-center justify-center rounded-full w-14 h-14 transition-all cursor-pointer",
                activeTab === 'tax' ? "text-black clay-button scale-110 shadow-lg" : "text-neutral-500 hover:text-white"
            )}
        >
          <Wallet className="w-6 h-6" />
          <span className="font-headline text-[8px] uppercase tracking-widest mt-1">Tax</span>
        </div>
        <div 
            onClick={() => setActiveTab('settings')}
            className={cn(
                "flex flex-col items-center justify-center rounded-full w-14 h-14 transition-all cursor-pointer",
                activeTab === 'settings' ? "text-black clay-button scale-110 shadow-lg" : "text-neutral-500 hover:text-white"
            )}
        >
          <Settings className="w-6 h-6" />
          <span className="font-headline text-[8px] uppercase tracking-widest mt-1">Setup</span>
        </div>
      </nav>

      {/* Agent Command Bar (Contextual) */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
        <div className="glass-card ghost-border rounded-full p-2 flex items-center gap-4">
          <div className="pl-4">
            <p className="text-[10px] text-tertiary font-headline uppercase tracking-widest leading-none">Agent Status</p>
            <p className="text-xs font-bold leading-none mt-1">{isExecuting ? 'Processing...' : 'Ready for Txn'}</p>
          </div>
          <div className="ml-auto">
            <button 
                onClick={handleExecute}
                disabled={isExecuting}
                className={cn(
                    "clay-button px-6 py-2.5 rounded-full text-black font-headline font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform z-[999] relative",
                    isExecuting && "opacity-50 cursor-not-allowed"
                )}
            >
                {isExecuting ? 'Executing...' : 'Execute Transaction'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
