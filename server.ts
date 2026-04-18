import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/btc-price', async (req, res) => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'bitcoin',
          vs_currencies: 'inr',
          include_24hr_change: 'true',
          include_24hr_high_low: 'true'
        }
      });
      res.json(response.data.bitcoin);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch BTC price' });
    }
  });

  app.get('/api/simulation', (req, res) => {
    // Generate a simulated 12-month DCA
    // Monthly investment: ₹10,000
    // We'll mock some price drift for the simulation
    const monthlyInvestment = 10000;
    const months = 12;
    const basePrice = 5000000; // Starting around 50L INR
    
    const lots = [];
    let totalBtc = 0;
    let totalInvested = 0;

    for (let i = 0; i < months; i++) {
        // Random price variation for simulation
        const priceAtPurchase = basePrice * (1 + (Math.random() * 0.4 - 0.2) + (i * 0.05));
        const btcBought = (monthlyInvestment * 0.99) / priceAtPurchase; // 1% TDS deducted upfront
        
        lots.push({
            id: `lot-${i}`,
            date: new Date(Date.now() - (months - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
            purchasePrice: priceAtPurchase,
            btcAmount: btcBought,
            inrValueAtPurchase: monthlyInvestment,
            tdsPaid: monthlyInvestment * 0.01
        });
        
        totalBtc += btcBought;
        totalInvested += monthlyInvestment;
    }

    res.json({
        totalBtc,
        totalInvested,
        lots,
        currentBtcPrice: basePrice * 1.2, // Simulated current price
        taxRules: {
            flatTax: 0.3,
            tds: 0.01
        }
    });
  });

  app.post('/api/execute', (req, res) => {
    // In a real app, this would update a database. 
    // Here we just return success to simulate the "Agentic" action.
    const { amount, asset } = req.body;
    console.log(`Executing autonomous ${asset} DCA transaction of ₹${amount}`);
    
    res.json({
      status: 'success',
      transactionId: `tx-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      message: `Successfully executed autonomous DCA for ₹${amount} in ${asset}.`
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
