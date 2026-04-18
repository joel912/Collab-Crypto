export interface SimulationLot {
  id: string;
  date: string;
  purchasePrice: number;
  btcAmount: number;
  inrValueAtPurchase: number;
  tdsPaid: number;
}

export interface SimulationData {
  totalBtc: number;
  totalInvested: number;
  lots: SimulationLot[];
  currentBtcPrice: number;
  taxRules: {
    flatTax: number;
    tds: number;
  };
}

export interface BtcPriceInfo {
  inr: number;
  inr_24h_change?: number;
  inr_24h_high?: number;
  inr_24h_low?: number;
}

export interface ReasoningStep {
  id: string;
  type: 'core' | 'tax' | 'market';
  message: string;
  timestamp: string;
}
