import os
import requests
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()
API_KEY = os.getenv("ALPHA_VANTAGE_KEY")

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret'
socketio = SocketIO(app, async_mode='eventlet')

# Keep track of active symbols and threads
active_symbols = set()
threads = {}

@app.route('/')
def index():
    return render_template('index.html')


def get_stock_price(symbol="AAPL"):
    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={API_KEY}"
    response = requests.get(url)
    data = response.json()
    try:
        price = data["Global Quote"]["05. price"]
        return {"symbol": symbol, "price": float(price)}
    except (KeyError, TypeError, ValueError):
        return None


def background_price_stream(symbol):
    """Background thread to emit stock prices every 5 seconds."""
    while symbol in active_symbols:
        price_data = get_stock_price(symbol)
        if price_data:
            price_data["time"] = int(time.time())
            socketio.emit("stock_data", price_data)
        socketio.sleep(5)


@socketio.on('add_symbol')
def handle_add_symbol(symbol):
    symbol = symbol.upper()
    if symbol not in active_symbols:
        active_symbols.add(symbol)
        # Start background thread for this symbol if not already running
        if symbol not in threads:
            threads[symbol] = socketio.start_background_task(background_price_stream, symbol)


# --- API for chatbot queries ---
@app.route('/api/price')
def api_price():
    symbol = request.args.get("symbol", "").upper()
    if not symbol:
        return jsonify({"error": "No symbol provided"}), 400

    price_data = get_stock_price(symbol)
    if price_data:
        return jsonify(price_data)
    else:
        return jsonify({"error": "Invalid symbol or no data"}), 404


if __name__ == '__main__':
    print("Starting server on http://localhost:5000")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)


# import os
# import requests
# from flask import Flask, render_template, request, jsonify
# from flask_socketio import SocketIO
# from dotenv import load_dotenv
# import time
# import threading

# # Load environment variables
# load_dotenv()
# API_KEY = os.getenv("ALPHA_VANTAGE_KEY")

# app = Flask(__name__)
# app.config['SECRET_KEY'] = 'dev-secret'
# socketio = SocketIO(app, async_mode='eventlet')

# # --- Global state ---
# active_symbols = set()
# symbol_lock = threading.Lock()  # thread-safe access

# # Mapping old symbol FB to new META
# SYMBOL_CORRECTIONS = {
#     "FB": "META"
# }

# # --- Helper function to fetch stock price ---
# def get_stock_price(symbol: str):
#     symbol = SYMBOL_CORRECTIONS.get(symbol.upper(), symbol.upper())
#     url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={API_KEY}"
#     try:
#         response = requests.get(url, timeout=10)
#         data = response.json()
#         price = float(data["Global Quote"]["05. price"])
#         return {"symbol": symbol, "price": price}
#     except (KeyError, TypeError, ValueError):
#         return None

# # --- Background thread to stream active symbols ---
# def stock_streamer():
#     while True:
#         with symbol_lock:
#             symbols = list(active_symbols)
#         for symbol in symbols:
#             price_data = get_stock_price(symbol)
#             if price_data:
#                 price_data["time"] = int(time.time())
#                 socketio.emit("stock_data", price_data, broadcast=True)
#         socketio.sleep(5)  # 5-second interval

# # Start the background thread
# threading.Thread(target=stock_streamer, daemon=True).start()

# # --- Routes ---
# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route('/api/price')
# def api_price():
#     """Return real-time price for chatbot queries"""
#     symbol = request.args.get("symbol", "").upper()
#     if not symbol:
#         return jsonify({"error": "No symbol provided"}), 400
#     symbol = SYMBOL_CORRECTIONS.get(symbol, symbol)
#     price_data = get_stock_price(symbol)
#     if price_data:
#         return jsonify(price_data)
#     else:
#         return jsonify({"error": "Invalid symbol or no data"}), 404

# # --- SocketIO handlers ---
# @socketio.on('add_symbol')
# def handle_add_symbol(symbol):
#     """Add symbol to active watchlist"""
#     symbol = SYMBOL_CORRECTIONS.get(symbol.upper(), symbol.upper())
#     with symbol_lock:
#         active_symbols.add(symbol)
#     # No while loop here; background thread handles streaming

# if __name__ == '__main__':
#     print("Starting server on http://localhost:5000")
#     socketio.run(app, host='0.0.0.0', port=5000, debug=True)



# import os
# import requests
# from flask import Flask, render_template, request, jsonify
# from flask_socketio import SocketIO, emit
# from dotenv import load_dotenv
# import time

# # Load environment variables
# load_dotenv()
# API_KEY = os.getenv("ALPHA_VANTAGE_KEY")

# app = Flask(__name__)
# app.config['SECRET_KEY'] = 'dev-secret'
# socketio = SocketIO(app, async_mode='eventlet')

# @app.route('/')
# def index():
#     return render_template('index.html')

# def get_stock_price(symbol="AAPL"):
#     """Fetch latest stock price from Alpha Vantage"""
#     url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={API_KEY}"
#     response = requests.get(url)
#     data = response.json()
#     try:
#         price = data["Global Quote"]["05. price"]
#         return {"symbol": symbol, "price": float(price)}
#     except (KeyError, TypeError, ValueError):
#         return None

# # --- Socket streaming for chart/watchlist ---
# @socketio.on('add_symbol')
# def stream_prices(symbol):
#     """Stream stock prices every 5 seconds"""
#     symbol = symbol.upper()
#     while True:
#         price_data = get_stock_price(symbol)
#         if price_data:
#             price_data["time"] = int(time.time())  # UNIX timestamp
#             emit('stock_data', price_data, broadcast=True)
#         socketio.sleep(5)

# # --- API for chatbot queries ---
# @app.route('/api/price')
# def api_price():
#     """Return real-time price for chatbot queries"""
#     symbol = request.args.get("symbol", "").upper()
#     if not symbol:
#         return jsonify({"error": "No symbol provided"}), 400

#     price_data = get_stock_price(symbol)
#     if price_data:
#         return jsonify(price_data)
#     else:
#         return jsonify({"error": "Invalid symbol or no data"}), 404

# if __name__ == '__main__':
#     print("Starting server on http://localhost:5000")
#     socketio.run(app, host='0.0.0.0', port=5000, debug=True)
