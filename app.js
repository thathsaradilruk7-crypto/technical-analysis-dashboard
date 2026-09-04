// Main Application Logic

let tradeHistory = [];
let currentSignal = null;
let chartInstance = null;

function showStatus(message, type = 'info') {
  const statusDiv = document.getElementById('statusMessage');
  statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
}

async function analyzeMarket() {
  const symbol = document.getElementById('symbol').value;
  const leverage = parseInt(document.getElementById('leverage').value);
  const riskPercent = parseFloat(document.getElementById('riskPercent').value);
  const accountSize = parseFloat(document.getElementById('accountSize').value);
  
  showStatus('📊 Analyzing market data...', 'info');
  
  try {
    // Simulate fetching real data (in production, use exchange API)
    const priceData = generateMockPriceData(symbol, 30);
    const prices = priceData.map(d => d.close);
    
    // Analyze indicators
    const indicators = analyzeIndicators(prices);
    
    // Generate signal
    const signal = generateSignal(indicators, leverage, riskPercent, accountSize);
    currentSignal = signal;
    
    // Display signal
    displaySignal(signal);
    
    // Display indicators
    displayIndicators(indicators);
    
    // Draw chart
    drawChart(priceData, indicators);
    
    // Update performance
    updatePerformance();
    
    showStatus(`✅ Signal generated at ${new Date().toLocaleTimeString()}`, 'success');
    
  } catch (error) {
    showStatus(`❌ Error: ${error.message}`, 'error');
    console.error(error);
  }
}

function displaySignal(signal) {
  const container = document.getElementById('signalContainer');
  const signalClass = signal.type === 'LONG' ? 'signal-long' : signal.type === 'SHORT' ? 'signal-short' : 'signal-neutral';
  const signalColor = signal.type === 'LONG' ? 'long' : signal.type === 'SHORT' ? 'short' : 'neutral';
  
  let html = `
    <div class="signal-box ${signalClass}">
      <div class="signal-title"><span class="${signalColor}">${signal.type}</span> Signal</div>
      <div class="signal-detail">Confidence: <strong>${signal.confidence.toFixed(1)}%</strong></div>
      <div class="confidence-bar">
        <div class="confidence-fill" style="width: ${signal.confidence}%;"></div>
      </div>
      <div class="signal-detail">Entry: <strong>$${signal.entry.toFixed(8)}</strong></div>
      <div class="signal-detail">Stop Loss: <strong style="color: #f44336;">$${signal.sl.toFixed(8)}</strong></div>
      <div class="signal-detail">Take Profit 1: <strong style="color: #ffc107;">$${signal.tp[0].toFixed(8)}</strong></div>
      <div class="signal-detail">Take Profit 2: <strong style="color: #ffc107;">$${signal.tp[1].toFixed(8)}</strong></div>
      <div class="signal-detail">Take Profit 3: <strong style="color: #ffc107;">$${signal.tp[2].toFixed(8)}</strong></div>
      <div class="signal-detail">Risk/Reward Ratio: <strong>${signal.riskRewardRatio.toFixed(2)}:1</strong></div>
      <div class="signal-detail">Position Size: <strong>${signal.positionSize.toFixed(4)} units</strong></div>
      <div class="signal-detail">Risk Amount: <strong>$${signal.riskAmount.toFixed(2)}</strong></div>
      <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
  `;
  
  signal.signals.forEach((sig, i) => {
    html += `<div class="signal-detail">✓ ${sig}</div>`;
  });
  
  html += `</div>`;
  container.innerHTML = html;
}

function displayIndicators(indicators) {
  const container = document.getElementById('indicatorsContainer');
  
  const rsiStatus = indicators.rsi.value < 30 ? 'buy' : indicators.rsi.value > 70 ? 'sell' : 'neutral';
  const macdStatus = indicators.macd.signal === 'bullish' ? 'buy' : 'sell';
  const trendStatus = indicators.trend.signal === 'bullish' ? 'buy' : 'sell';
  const momentumStatus = indicators.momentum.signal === 'bullish' ? 'buy' : 'sell';
  
  html = `
    <div class="indicator">
      <div class="indicator-name">RSI (14)</div>
      <div class="indicator-value">${indicators.rsi.value.toFixed(2)}</div>
      <div class="indicator-status ${rsiStatus}">${indicators.rsi.signal.toUpperCase()}</div>
    </div>
    <div class="indicator">
      <div class="indicator-name">MACD</div>
      <div class="indicator-value">${indicators.macd.value.toFixed(6)}</div>
      <div class="indicator-status ${macdStatus}">${indicators.macd.signal.toUpperCase()}</div>
    </div>
    <div class="indicator">
      <div class="indicator-name">SMA Trend</div>
      <div class="indicator-value">SMA20/50</div>
      <div class="indicator-status ${trendStatus}">${indicators.trend.signal.toUpperCase()}</div>
    </div>
    <div class="indicator">
      <div class="indicator-name">Momentum</div>
      <div class="indicator-value">${indicators.momentum.value.toFixed(2)}%</div>
      <div class="indicator-status ${momentumStatus}">${indicators.momentum.signal.toUpperCase()}</div>
    </div>
    <div class="indicator">
      <div class="indicator-name">BB Position</div>
      <div class="indicator-value">${indicators.bb.position.toUpperCase()}</div>
      <div class="indicator-status neutral">Support/Resistance</div>
    </div>
  `;
  
  container.innerHTML = html;
}

function drawChart(priceData, indicators) {
  const ctx = document.getElementById('priceChart').getContext('2d');
  
  const labels = priceData.map(d => d.time.toLocaleTimeString());
  const prices = priceData.map(d => d.close);
  
  if (chartInstance) chartInstance.destroy();
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Price',
          data: prices,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        },
        {
          label: 'SMA 20',
          data: prices.map((_, i) => {
            const slice = prices.slice(Math.max(0, i - 19), i + 1);
            return slice.reduce((a, b) => a + b) / slice.length;
          }),
          borderColor: '#ffc107',
          borderWidth: 1,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false
        },
        {
          label: 'SMA 50',
          data: prices.map((_, i) => {
            const slice = prices.slice(Math.max(0, i - 49), i + 1);
            return slice.reduce((a, b) => a + b) / slice.length;
          }),
          borderColor: '#f44336',
          borderWidth: 1,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#e0e0e0' }
        }
      },
      scales: {
        y: {
          ticks: { color: '#888' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: {
          ticks: { color: '#888' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
}

function updatePerformance() {
  // Simulate trade history for demo
  if (!tradeHistory.length) {
    // Generate simulated historical trades
    for (let i = 0; i < 50; i++) {
      tradeHistory.push({
        result: Math.random() > 0.35 ? 'win' : 'loss', // ~65% win rate simulation
        riskReward: Math.random() * 3 + 0.5
      });
    }
  }
  
  const winRate = calculateWinRate(tradeHistory);
  const wins = tradeHistory.filter(t => t.result === 'win').length;
  const avgRR = tradeHistory.reduce((sum, t) => sum + t.riskReward, 0) / tradeHistory.length;
  
  document.getElementById('winRate').textContent = winRate.toFixed(1) + '%';
  document.getElementById('signalCount').textContent = tradeHistory.length;
  document.getElementById('winCount').textContent = wins;
  document.getElementById('rrRatio').textContent = avgRR.toFixed(2) + ':1';
}

// Initialize on page load
window.addEventListener('load', () => {
  updatePerformance();
});
