from flask import Flask, request, jsonify, send_from_directory
from supabase import create_client, Client
import os
from datetime import datetime
from typing import Optional

app = Flask(__name__, static_folder='static')

# Инициализация Supabase
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

# API для работы с очередью
@app.route('/api/queue/join', methods=['POST'])
def join_queue():
    data = request.json
    try:
        # Проверяем, есть ли пользователь уже в очереди
        existing = supabase.table('queue') \
            .select('*') \
            .eq('user_id', data['user_id']) \
            .eq('status', 'waiting') \
            .execute()
        
        if len(existing.data) > 0:
            return jsonify({"error": "User already in queue"}), 400

        # Добавляем в очередь
        result = supabase.table('queue').insert({
            "spot_id": data['spot_id'],
            "user_id": data['user_id'],
            "joined_at": datetime.now().isoformat(),
            "status": "waiting",
            "comment": data.get('comment', '')
        }).execute()

        return jsonify(result.data[0])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/queue/leave', methods=['POST'])
def leave_queue():
    data = request.json
    try:
        result = supabase.table('queue').update({
            "status": "left",
            "left_at": datetime.now().isoformat()
        }).eq('user_id', data['user_id']) \
          .eq('status', 'waiting') \
          .execute()
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/queue/<spot_id>')
def get_queue(spot_id):
    try:
        result = supabase.table('queue') \
            .select('*, user:user_id(nickname), spot:spot_id(name)') \
            .eq('spot_id', spot_id) \
            .eq('status', 'waiting') \
            .order('joined_at') \
            .execute()
        
        return jsonify(result.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API для работы с пользователями
@app.route('/api/user/upsert', methods=['POST'])
def upsert_user():
    data = request.json
    try:
        result = supabase.table('users').upsert({
            "telegram_id": data['telegram_id'],
            "nickname": data['nickname'],
            "last_active": datetime.now().isoformat()
        }, on_conflict='telegram_id').execute()
        
        return jsonify(result.data[0])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API для работы со спотами
@app.route('/api/spots')
def get_spots():
    try:
        result = supabase.table('spots') \
            .select('*') \
            .execute()
        
        return jsonify(result.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Статические файлы
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
