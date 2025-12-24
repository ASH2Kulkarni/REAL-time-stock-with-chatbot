Real-Time Stock Dashboard displays live stock prices for popular companies with interactive Plotly charts and a watchlist. Users can track up to 5 symbols simultaneously, query prices via a chatbot using company names or symbols, and export the latest data to CSV. Built with Flask, Socket.IO, and Alpha Vantage API.

Features

Live stock price streaming using Socket.IO

Interactive Plotly charts for selected symbols

Watchlist to monitor up to 5 stocks simultaneously

Chatbot for real-time price queries using company names or symbols

Export CSV functionality for latest stock prices

Dark-themed responsive UI

FOLDER STRUCTURE

stock-dashboard/
│
├── app.py                  # Flask application with Socket.IO
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (API key)
│
├── templates/
│   └── index.html          # Main HTML template
│
├── static/
│   ├── css/
│   │   └── style.css       # Dashboard styles
│   └── js/
│       └── main.js         # Frontend JS for charts, watchlist, chatbot
│
└── README.md               # Project documentation

Dependencies

Python 3.10+
Flask
Flask-SocketIO
requests
eventlet
Plotly (frontend)
Socket.IO (frontend)

NOTES:
You can track a maximum of 5 symbols in the chart/watchlist at a time.Ensure your Alpha Vantage API key is active to fetch stock data.
Chatbot supports company name aliases (e.g., “google” → GOOG, “meta” → FB).
