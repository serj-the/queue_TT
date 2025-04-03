from flask import Flask, send_from_directory, jsonify
import os
from supabase import create_client

app = Flask(__name__, static_folder='static')

# Инициализация Supabase
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

# API маршруты
@app.route('/api/ping')
def ping():
    return jsonify({"status": "ok"})

# Главный маршрут для SPA
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# Fallback для всех SPA роутов
@app.route('/<path:path>')
def catch_all(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
