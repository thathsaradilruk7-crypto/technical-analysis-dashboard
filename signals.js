// Trading Signal Generation Logic

function analyzeIndicators(prices) {
  const rsi = calculateRSI(prices, 14);
  const macd = calculateMACD(prices);
  const bb = calculateBollingerBands(prices, 20);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  const momentum = calculateMomentum(prices, 10);
  
  const currentPrice = prices[prices.length - 1];
  
  return {
    rsi: { value: rsi, signal: rsi < 30 ? 'oversold' : rsi > 70 ? 'overbought' : 'neutral' },
    macd: { value: macd.macd, signal: macd.histogram > 0 ? 'bullish' : 'bearish' },
    bb: {
      value: currentPrice,
      position: currentPrice > bb.upper ? 'above' : currentPrice < bb.lower ? 'below' : 'middle',
      upper: bb.upper,
      lower: bb.lower,
      middle: bb.middle
    },
    trend: {
      sma20: sma20,
      sma50: sma50,
      signal: sma20 > sma50 ? 'bullish' : 'bearish'
    },
    momentum: { value: momentum, signal: momentum > 0 ? 'bullish' : 'bearish' },
    currentPrice: currentPrice
  };
}

function generateSignal(indicators, leverage, riskPercent, accountSize) {
  let longScore = 0, shortScore = 0;
  let signals = [];
  
  // RSI Analysis
  if (indicators.rsi.value < 30) {
    longScore += 2;
    signals.push('RSI oversold (bullish)');
  } else if (indicators.rsi.value > 70) {
    shortScore += 2;
    signals.push('RSI overbought (bearish)');
  } else if (indicators.rsi.value >= 40 && indicators.rsi.value <= 60) {
    signals.push('RSI neutral');
  }
  
  // MACD Analysis
  if (indicators.macd.signal === 'bullish') {
    longScore += 2;
    signals.push('MACD bullish crossover');
  } else {
    shortScore += 2;
    signals.push('MACD bearish crossover');
  }
  
  // Bollinger Bands Analysis
  if (indicators.bb.position === 'below') {
    longScore += 1.5;
    signals.push('Price near lower BB (support)');
  } else if (indicators.bb.position === 'above') {
    shortScore += 1.5;
    signals.push('Price near upper BB (resistance)');
  }
  
  // Trend Analysis (SMA)
  if (indicators.trend.signal === 'bullish') {
    longScore += 2;
    signals.push('SMA20 > SMA50 (uptrend)');
  } else {
    shortScore += 2;
    signals.push('SMA20 < SMA50 (downtrend)');
  }
  
  // Momentum Analysis
  if (indicators.momentum.signal === 'bullish') {
    longScore += 1;
    signals.push('Positive momentum');
  } else {
    shortScore += 1;
    signals.push('Negative momentum');
  }
  
  // Determine Signal Type
  let signalType = 'NEUTRAL';
  let confidence = 0;
  
  if (longScore > shortScore) {
    signalType = 'LONG';
    confidence = (longScore / 10) * 100;
  } else if (shortScore > longScore) {
    signalType = 'SHORT';
    confidence = (shortScore / 10) * 100;
  } else {
    signalType = 'NEUTRAL';
    confidence = 0;
  }
  
  confidence = Math.min(confidence, 95);
  
  // Calculate Position Size
  const riskAmount = (accountSize * riskPercent) / 100;
  const positionSize = (riskAmount * leverage) / indicators.currentPrice;
  
  // Calculate TP/SL
  const volatility = Math.abs(indicators.bb.upper - indicators.bb.lower) / indicators.bb.middle;
  const slDistance = volatility * indicators.currentPrice * 0.5;
  const tpDistance = slDistance * (1 + (confidence / 100) * 2); // Risk/Reward based on confidence
  
  let entry, sl, tp1, tp2, tp3;
  
  if (signalType === 'LONG') {
    entry = indicators.currentPrice;
    sl = entry - slDistance;
    tp1 = entry + (tpDistance * 0.3);
    tp2 = entry + (tpDistance * 0.6);
    tp3 = entry + (tpDistance * 1.0);
  } else if (signalType === 'SHORT') {
    entry = indicators.currentPrice;
    sl = entry + slDistance;
    tp1 = entry - (tpDistance * 0.3);
    tp2 = entry - (tpDistance * 0.6);
    tp3 = entry - (tpDistance * 1.0);
  }
  
  const riskRewardRatio = Math.abs(tp2 - entry) / Math.abs(entry - sl);
  
  return {
    type: signalType,
    confidence: confidence,
    entry: entry,
    tp: [tp1, tp2, tp3],
    sl: sl,
    riskRewardRatio: riskRewardRatio,
    positionSize: positionSize,
    riskAmount: riskAmount,
    signals: signals,
    indicators: indicators,
    timestamp: new Date()
  };
}

function calculateWinRate(tradeHistory) {
  if (tradeHistory.length === 0) return 0;
  
  const wins = tradeHistory.filter(trade => trade.result === 'win').length;
  return (wins / tradeHistory.length) * 100;
}
