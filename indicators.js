// Technical Indicators Calculator

function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null;
  
  let gains = 0, losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  return rsi;
}

function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (prices.length < slowPeriod) return null;
  
  const ema12 = calculateEMA(prices, fastPeriod);
  const ema26 = calculateEMA(prices, slowPeriod);
  const macd = ema12 - ema26;
  
  const macdLine = [];
  for (let i = 0; i < prices.length; i++) {
    const e12 = calculateEMA(prices.slice(0, i + 1), fastPeriod);
    const e26 = calculateEMA(prices.slice(0, i + 1), slowPeriod);
    macdLine.push(e12 - e26);
  }
  
  const signal = calculateEMA(macdLine, signalPeriod);
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}

function calculateEMA(prices, period) {
  if (prices.length === 0) return 0;
  const multiplier = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * multiplier + ema * (1 - multiplier);
  }
  return ema;
}

function calculateBollingerBands(prices, period = 20, stdDev = 2) {
  if (prices.length < period) return null;
  
  const slice = prices.slice(-period);
  const sma = slice.reduce((a, b) => a + b) / period;
  const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const std = Math.sqrt(variance);
  
  return {
    upper: sma + (std * stdDev),
    middle: sma,
    lower: sma - (std * stdDev)
  };
}

function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b) / period;
}

function calculateATR(highs, lows, closes, period = 14) {
  if (highs.length < period) return null;
  
  let tr = [];
  for (let i = 1; i < highs.length; i++) {
    const h = highs[i];
    const l = lows[i];
    const c = closes[i - 1];
    const tr1 = h - l;
    const tr2 = Math.abs(h - c);
    const tr3 = Math.abs(l - c);
    tr.push(Math.max(tr1, tr2, tr3));
  }
  
  let atr = tr.slice(0, period).reduce((a, b) => a + b) / period;
  for (let i = period; i < tr.length; i++) {
    atr = (atr * (period - 1) + tr[i]) / period;
  }
  
  return atr;
}

function calculateVolume(prices) {
  if (prices.length < 2) return 0;
  let totalVolume = 0;
  for (let i = 1; i < prices.length; i++) {
    const change = Math.abs(prices[i] - prices[i - 1]);
    totalVolume += change;
  }
  return totalVolume / prices.length;
}

function calculateMomentum(prices, period = 10) {
  if (prices.length < period) return 0;
  return ((prices[prices.length - 1] - prices[prices.length - period - 1]) / prices[prices.length - period - 1]) * 100;
}

function generateMockPriceData(symbol, days = 30) {
  const data = [];
  let basePrice = { 'BTC': 45000, 'ETH': 2500, 'XRP': 0.5, 'ADA': 0.8, 'DOGE': 0.08, 'SOL': 100 }[symbol] || 100;
  
  for (let i = 0; i < days * 24; i++) { // 24 hourly candles per day
    const volatility = 0.02;
    const change = (Math.random() - 0.5) * 2 * volatility;
    basePrice = basePrice * (1 + change);
    
    data.push({
      time: new Date(Date.now() - (days * 24 - i) * 3600000),
      open: basePrice * (1 - Math.random() * 0.001),
      high: basePrice * (1 + Math.random() * 0.002),
      low: basePrice * (1 - Math.random() * 0.002),
      close: basePrice,
      volume: Math.random() * 1000000
    });
  }
  
  return data;
}
