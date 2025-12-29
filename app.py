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



