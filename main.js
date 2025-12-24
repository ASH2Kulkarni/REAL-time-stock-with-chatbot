// const socket = io();

// /***********************
//  * State
//  ***********************/
// let priceData = {};
// let activeSymbols = new Set();
// const MAX_SYMBOLS = 5;
// let lastRenderTime = 0;
// const RENDER_INTERVAL = 1000;

// /***********************
//  * Colors
//  ***********************/
// const symbolColors = {
//   AAPL: '#00bcd4',
//   GOOG: '#ff4081',
//   TSLA: '#ff9800',
//   MSFT: '#9c27b0',
//   AMZN: '#cddc39',
//   NFLX: '#ff5722',
//   FB: '#3b5998',
//   NVDA: '#76ff03',
//   DIS: '#e91e63',
//   BABA: '#ffc107',
//   INTC: '#03a9f4',
//   PYPL: '#8bc34a',
//   ADBE: '#ff1744',
//   CRM: '#9c27b0'
// };

// // Company names → symbols
// const companyToSymbol = {
//   "apple": "AAPL",
//   "alphabet": "GOOG",
//   "google": "GOOG",
//   "tesla": "TSLA",
//   "microsoft": "MSFT",
//   "amazon": "AMZN",
//   "netflix": "NFLX",
//   "meta": "FB",
//   "facebook": "FB",
//   "nvidia": "NVDA",
//   "disney": "DIS",
//   "alibaba": "BABA",
//   "intel": "INTC",
//   "paypal": "PYPL",
//   "adobe": "ADBE",
//   "salesforce": "CRM"
// };

// /***********************
//  * Chart Layout
//  ***********************/
// const chartLayout = {
//   title: { text: 'Live Stock Prices', x: 0.5 },
//   paper_bgcolor: '#121212',
//   plot_bgcolor: '#1e1e1e',
//   font: { color: '#e0e0e0' },
//   xaxis: { title: 'Time', tickformat: '%H:%M:%S' },
//   yaxis: { title: 'Price (USD)' }
// };

// /***********************
//  * Initialization
//  ***********************/
// document.addEventListener("DOMContentLoaded", () => {
//   Plotly.newPlot("plotlyChart", [], chartLayout);
//   document.getElementById("exportBtn").addEventListener("click", exportCSV);
// });

// /***********************
//  * Add Symbol (Chart + Watchlist)
//  ***********************/
// function addSymbol() {
//   const symbol = document.getElementById("symbolDropdown").value;

//   if (activeSymbols.has(symbol)) return;

//   if (activeSymbols.size >= MAX_SYMBOLS) {
//     alert("Maximum 5 symbols allowed");
//     return;
//   }

//   activeSymbols.add(symbol);
//   priceData[symbol] = [];

//   socket.emit("add_symbol", symbol);
//   addToWatchlist(symbol);
// }

// /***********************
//  * Watchlist
//  ***********************/
// function addToWatchlist(symbol) {
//   const ul = document.getElementById("watchlist");
//   const li = document.createElement("li");

//   li.id = `watch-${symbol}`;
//   li.innerHTML = `<span style="background:${symbolColors[symbol]}"></span>${symbol}`;

//   ul.appendChild(li);
// }

// /***********************
//  * Socket Listener (Live Data)
//  ***********************/
// socket.on("stock_data", data => {
//   const { symbol, price, time } = data;

//   if (!activeSymbols.has(symbol)) return;

//   priceData[symbol].push({
//     time: new Date(time * 1000),
//     price: price
//   });

//   // Throttle rendering
//   const now = Date.now();
//   if (now - lastRenderTime < RENDER_INTERVAL) return;
//   lastRenderTime = now;

//   const traces = Array.from(activeSymbols).map(sym => ({
//     x: priceData[sym].map(d => d.time),
//     y: priceData[sym].map(d => d.price),
//     name: sym,
//     type: "scatter",
//     mode: "lines+markers",
//     line: { color: symbolColors[sym] },
//     marker: { size: 6, color: symbolColors[sym] }
//   }));

//   Plotly.react("plotlyChart", traces, chartLayout);
// });

// /***********************
//  * Export CSV (Latest Only)
//  ***********************/
// function exportCSV() {
//   let rows = [["Symbol", "Time", "Price"]];

//   activeSymbols.forEach(symbol => {
//     const arr = priceData[symbol];
//     if (!arr || arr.length === 0) return;

//     const latest = arr[arr.length - 1];
//     rows.push([symbol, latest.time.toISOString(), latest.price]);
//   });

//   const csv =
//     "data:text/csv;charset=utf-8," +
//     rows.map(r => r.join(",")).join("\n");

//   const a = document.createElement("a");
//   a.href = encodeURI(csv);
//   a.download = `latest_prices_${Date.now()}.csv`;
//   a.click();
// }

// /***********************
//  * Chatbot (API-based)
//  ***********************/
// async function sendChat() {
//   const input = document.getElementById("chatInput");
//   const msg = input.value.trim();
//   if (!msg) return;

//   addChatMessage("You", msg, "chat-user");
//   await processChatMessage(msg);
//   input.value = "";
// }

// async function processChatMessage(message) {
//   const msgLower = message.toLowerCase();
//   let foundSymbol = null;

//   // 1️⃣ Exact symbol match
//   for (const sym of Object.values(companyToSymbol)) {
//     if (message.toUpperCase().includes(sym)) {
//       foundSymbol = sym;
//       break;
//     }
//   }

//   // 2️⃣ Company name partial match start
//   if (!foundSymbol) {
//     for (const [name, sym] of Object.entries(companyToSymbol)) {
//       if (name.startsWith(msgLower)) {
//         foundSymbol = sym;
//         break;
//       }
//     }
//   }

//   // 3️⃣ Company name contains partial anywhere
//   if (!foundSymbol) {
//     for (const [name, sym] of Object.entries(companyToSymbol)) {
//       if (name.includes(msgLower)) {
//         foundSymbol = sym;
//         break;
//       }
//     }
//   }

//   // 4️⃣ Fetch price from API
//   if (foundSymbol) {
//     try {
//       const res = await fetch(`/api/price?symbol=${foundSymbol}`);
//       if (!res.ok) throw new Error("API error");
//       const data = await res.json();

//       addChatMessage(
//         "Bot",
//         `📈 ${data.symbol} real-time price is $${data.price.toFixed(2)}`,
//         "chat-bot"
//       );
//     } catch (err) {
//       addChatMessage("Bot", "❌ Unable to fetch price", "chat-bot");
//     }
//   } else {
//     addChatMessage("Bot", "❌ Invalid symbol", "chat-bot");
//   }
// }

// function addChatMessage(sender, text, cls) {
//   const box = document.getElementById("chatbot-messages");
//   const div = document.createElement("div");
//   div.className = cls;
//   div.innerText = `${sender}: ${text}`;
//   box.appendChild(div);
//   box.scrollTop = box.scrollHeight;
// }

const socket = io();

/***********************
 * State
 ***********************/
let priceData = {};
let activeSymbols = new Set();
const MAX_SYMBOLS = 5;
let lastRenderTime = 0;
const RENDER_INTERVAL = 1000;

/***********************
 * Colors
 ***********************/
const symbolColors = {
  AAPL: '#00bcd4', GOOG: '#ff4081', TSLA: '#ff9800',
  MSFT: '#9c27b0', AMZN: '#cddc39', NFLX: '#ff5722',
  FB: '#3b5998', NVDA: '#76ff03', DIS: '#e91e63',
  BABA: '#ffc107', INTC: '#03a9f4', PYPL: '#8bc34a',
  ADBE: '#ff1744', CRM: '#9c27b0'
};

// Company names → symbols for chatbot
const companyToSymbol = {
  "apple": "AAPL", "alphabet": "GOOG", "google": "GOOG",
  "tesla": "TSLA", "microsoft": "MSFT", "amazon": "AMZN",
  "netflix": "NFLX", "meta": "FB", "facebook": "FB",
  "nvidia": "NVDA", "disney": "DIS", "alibaba": "BABA",
  "intel": "INTC", "paypal": "PYPL", "adobe": "ADBE",
  "salesforce": "CRM"
};

/***********************
 * Chart Layout
 ***********************/
const chartLayout = {
  title: { text: 'Live Stock Prices', x: 0.5 },
  paper_bgcolor: '#121212',
  plot_bgcolor: '#1e1e1e',
  font: { color: '#e0e0e0' },
  xaxis: { title: 'Time', tickformat: '%H:%M:%S' },
  yaxis: { title: 'Price (USD)' }
};

/***********************
 * Initialization
 ***********************/
document.addEventListener("DOMContentLoaded", () => {
  Plotly.newPlot("plotlyChart", [], chartLayout);
  document.getElementById("exportBtn").addEventListener("click", exportCSV);
});

/***********************
 * Add Symbol (Chart + Watchlist)
 ***********************/
function addSymbol() {
  const symbol = document.getElementById("symbolDropdown").value;
  if (activeSymbols.has(symbol)) return;
  if (activeSymbols.size >= MAX_SYMBOLS) {
    alert("Maximum 5 symbols allowed");
    return;
  }

  activeSymbols.add(symbol);
  priceData[symbol] = [];

  socket.emit("add_symbol", symbol);
  addToWatchlist(symbol);
}

/***********************
 * Watchlist
 ***********************/
function addToWatchlist(symbol) {
  const ul = document.getElementById("watchlist");
  const li = document.createElement("li");
  li.id = `watch-${symbol}`;
  li.innerHTML = `<span style="background:${symbolColors[symbol]}"></span>${symbol}`;
  ul.appendChild(li);
}

/***********************
 * Socket Listener (Live Data)
 ***********************/
socket.on("stock_data", data => {
  const { symbol, price, time } = data;
  if (!activeSymbols.has(symbol)) return;

  priceData[symbol].push({ time: new Date(time * 1000), price: price });

  const now = Date.now();
  if (now - lastRenderTime < RENDER_INTERVAL) return;
  lastRenderTime = now;

  const traces = Array.from(activeSymbols).map(sym => ({
    x: priceData[sym].map(d => d.time),
    y: priceData[sym].map(d => d.price),
    name: sym,
    type: "scatter",
    mode: "lines+markers",
    line: { color: symbolColors[sym] },
    marker: { size: 6, color: symbolColors[sym] }
  }));

  Plotly.react("plotlyChart", traces, chartLayout);
});

/***********************
 * Export CSV (Latest Only)
 ***********************/
function exportCSV() {
  let rows = [["Symbol", "Time", "Price"]];
  activeSymbols.forEach(symbol => {
    const arr = priceData[symbol];
    if (!arr || arr.length === 0) return;
    const latest = arr[arr.length - 1];
    rows.push([symbol, latest.time.toISOString(), latest.price]);
  });

  const csv = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = encodeURI(csv);
  a.download = `latest_prices_${Date.now()}.csv`;
  a.click();
}

/***********************
 * Chatbot (API-based)
 ***********************/
async function sendChat() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;

  addChatMessage("You", msg, "chat-user");
  await processChatMessage(msg);
  input.value = "";
}
document.getElementById("chatInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // prevent form submission
    sendChat();
  }})

async function processChatMessage(message) {
  const msgLower = message.toLowerCase();
  let foundSymbol = null;

  // Exact symbol match
  for (const sym of Object.values(companyToSymbol)) {
    if (message.toUpperCase().includes(sym)) {
      foundSymbol = sym;
      break;
    }
  }

  // Company name partial match start
  if (!foundSymbol) {
    for (const [name, sym] of Object.entries(companyToSymbol)) {
      if (name.startsWith(msgLower)) {
        foundSymbol = sym;
        break;
      }
    }
  }

  // Company name partial match anywhere
  if (!foundSymbol) {
    for (const [name, sym] of Object.entries(companyToSymbol)) {
      if (name.includes(msgLower)) {
        foundSymbol = sym;
        break;
      }
    }
  }

  // Fetch from Flask API
  if (foundSymbol) {
    try {
      const res = await fetch(`/api/price?symbol=${foundSymbol}`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      addChatMessage(
        "Bot",
        `📈 ${data.symbol} real-time price is $${parseFloat(data.price).toFixed(2)}`,
        "chat-bot"
      );
    } catch (err) {
      addChatMessage("Bot", "❌ Unable to fetch price", "chat-bot");
    }
  } else {
    addChatMessage("Bot", "❌ Invalid symbol", "chat-bot");
  }
}

function addChatMessage(sender, text, cls) {
  const box = document.getElementById("chatbot-messages");
  const div = document.createElement("div");
  div.className = cls;
  div.innerText = `${sender}: ${text}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
