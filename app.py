from flask import Flask, request, jsonify, send_from_directory
import os
from supabase import create_client
from datetime import datetime

app = Flask(__name__, static_folder='static', static_url_path='')

# Конфигурация Supabase
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

# Маршрут для главной страницы
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# Маршруты API
@app.route('/api/spots')
def get_spots():
    try:
        result = supabase.table('spots').select("*").execute()
        return jsonify(result.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/queue/<spot_id>', methods=['GET'])
def get_queue(spot_id):
    try:
        result = supabase.table('queue').select(
            "*, user:user_id(nickname), spot:spot_id(name)"
        ).eq("spot_id", spot_id).eq("status", "waiting").execute()
        return jsonify(result.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Обработка всех остальных путей для SPA
@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
