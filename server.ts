import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Disable caching for API routes
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
  });

  // Helper to load fallback data
  const getFallbackData = async () => {
    try {
      const data = await fs.readFile(path.join(process.cwd(), 'simulation.json'), 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading simulation.json', e);
      return null;
    }
  };

  // API Routes
  app.get('/api/price', async (req, res) => {
    try {
      const asset = (req.query.asset as string) || 'bitcoin';
      // Try real API first with a timeout
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: asset,
          vs_currencies: 'inr',
          include_24hr_change: 'true',
          include_24hr_high_low: 'true'
        },
        timeout: 4000 
      });
      res.json(response.data[asset] || {});
    } catch (error) {
      console.warn(`CoinGecko API error for ${req.query.asset}. Using local fallback.`);
      const fallback = await getFallbackData();
      const asset = (req.query.asset as string) || 'bitcoin';
      if (fallback && fallback[asset]) {
        res.json(fallback[asset]);
      } else {
        res.json({
          inr: asset === 'bitcoin' ? 5842000 : (asset === 'ethereum' ? 220000 : 8000),
          inr_24h_change: 1.25,
          inr_24h_high: asset === 'bitcoin' ? 6000000 : 250000,
          inr_24h_low: asset === 'bitcoin' ? 5700000 : 210000
        });
      }
    }
  });

  app.get('/api/market-delta', async (req, res) => {
    try {
      const asset = (req.query.asset as string) || 'bitcoin';
      const range = (req.query.range as string) || '1';
      
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${asset}/market_chart`, {
        params: {
          vs_currency: 'inr',
          days: range,
          interval: range === '1' ? 'hourly' : 'daily'
        },
        timeout: 5000
      });

      // Transform data for recharts
      const chartData = response.data.prices.map(([timestamp, price]: [number, number]) => ({
        time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(timestamp).toLocaleDateString(),
        price: price
      }));

      res.json(chartData);
    } catch (error) {
      console.error('Market chart fetch failed, sending mock data');
      // Mock chart data if API fails
      const points = 24;
      const mockData = Array.from({ length: points }).map((_, i) => ({
        time: `${i}:00`,
        price: 5800000 + Math.random() * 200000,
      }));
      res.json(mockData);
    }
  });

  app.get('/api/simulate-dca', async (req, res) => {
    const monthlyInvestment = Number(req.query.amount) || 10000;
    const asset = (req.query.asset as string) || 'BTC';
    
    // We can use the simulation.json as a base if no params are provided for a "default" view
    const fallback = await getFallbackData();
    if (!req.query.amount && fallback && fallback.dca_simulation) {
      res.json(fallback.dca_simulation);
    } else {
        // Dynamic simulation
        const months = 12;
        const basePrice = asset === 'BTC' ? 5800000 : (asset === 'ETH' ? 250000 : 10000); // Rough starting prices in INR
        const lots = [];
        let totalAssetAmount = 0;
        let totalInvested = 0;

        for (let i = 0; i < months; i++) {
            // Simulated price drift
            const priceAtPurchase = basePrice * (1 + (Math.random() * 0.4 - 0.2) + (i * 0.03));
            const amountBought = (monthlyInvestment * 0.99) / priceAtPurchase; // 1% TDS
            
            lots.push({
                id: `lot-${i}`,
                date: new Date(Date.now() - (months - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
                purchasePrice: priceAtPurchase,
                btcAmount: amountBought, // We keep the key as btcAmount for frontend compatibility
                inrValueAtPurchase: monthlyInvestment,
                tdsPaid: monthlyInvestment * 0.01
            });
            
            totalAssetAmount += amountBought;
            totalInvested += monthlyInvestment;
        }

        res.json({
            totalBtc: totalAssetAmount,
            totalInvested,
            lots,
            currentBtcPrice: basePrice * 1.15, // Mocked 15% gain overall
            taxRules: {
                flatTax: 0.3,
                tds: 0.01
            }
        });
    }
  });

  app.post('/api/execute', (req, res) => {
    res.json({ success: true, message: 'DCA Executed', newBalance: 0.021 });
  });

  app.post('/api/tax-harvest', (req, res) => {
    const { lossLotsIds } = req.body;
    console.log(`Harvesting losses for lots: ${lossLotsIds?.join(', ')}`);
    
    res.json({
      status: 'success',
      harvestedCount: lossLotsIds?.length || 0,
      timestamp: new Date().toISOString(),
      message: `Tax-loss harvesting confirmed. ${lossLotsIds?.length} lots processed under Section 115BBH protocols.`
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
