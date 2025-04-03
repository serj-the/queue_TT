from flask import Flask, request, jsonify, send_from_directory
from supabase import create_client
import os
from datetime import datetime

app = Flask(__name__, static_folder='static')

# Инициализация Supabase
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

# ================== API Endpoints ==================

@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

# --------- Пользователи ---------
@app.route('/api/users/upsert', methods=['POST'])
def upsert_user():
    data = request.json
    result = supabase.table('users').upsert({
        "telegram_id": data['telegram_id'],
        "nickname": data['nickname'],
        "last_active": datetime.now().isoformat()
    }, on_conflict="telegram_id").execute()
    return jsonify(result.data)

# --------- Споты ---------
@app.route('/api/spots')
def get_spots():
    result = supabase.table('spots').select("*").execute()
    return jsonify(result.data)

# --------- Очереди ---------
@app.route('/api/queues', methods=['GET'])
def get_queues():
    spot_id = request.args.get('spot_id')
    query = supabase.table('queues').select("*, users(nickname), spots(name)")
    
    if spot_id:
        query = query.eq("spot_id", spot_id)
        
    result = query.execute()
    return jsonify(result.data)

@app.route('/api/queues/join', methods=['POST'])
def join_queue():
    data = request.json
    result = supabase.table('queues').insert({
        "spot_id": data['spot_id'],
        "user_id": data['user_id'],
        "status": "waiting",
        "joined_at": datetime.now().isoformat()
    }).execute()
    return jsonify(result.data)

@app.route('/api/queues/leave', methods=['POST'])
def leave_queue():
    data = request.json
    result = supabase.table('queues').update({
        "status": "left",
        "left_at": datetime.now().isoformat()
    }).eq("user_id", data['user_id']).execute()
    return jsonify(result.data)

# --------- Рейтинги ---------
@app.route('/api/ratings')
def get_ratings():
    result = supabase.table('users').select(
        "telegram_id, nickname, rating"
    ).order("rating", desc=True).limit(50).execute()
    return jsonify(result.data)

# ================== Запуск приложения ==================
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
