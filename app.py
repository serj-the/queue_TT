from flask import Flask, send_from_directory, jsonify, request
from supabase import create_client
import os
from datetime import datetime
from typing import Optional

app = Flask(__name__, static_folder='static')

# Инициализация Supabase
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

# Добавим обработку CORS для API
@app.after_request
def add_cors_headers(response):
    if request.path.startswith('/api'):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

# API endpoints
@app.route('/api/queue', methods=['GET'])
def get_queue():
    spot_id = request.args.get('spot_id')
    if not spot_id:
        return jsonify({'error': 'spot_id is required'}), 400
    
    try:
        result = supabase.table('queue').select('*, user:user_id(nickname, photo_url), spot:spot_id(name)').eq('spot_id', spot_id).eq('status', 'waiting').order('joined_at').execute()
        return jsonify(result.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/spots')
def get_spots():
    try:
        result = supabase.table('spots').select('*').execute()
        return jsonify(result.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/queue/join', methods=['POST'])
def join_queue():
    data = request.json
    required_fields = ['spot_id', 'user_id']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        # Проверяем, не находится ли пользователь уже в очереди
        existing = supabase.table('queue').select('*').eq('user_id', data['user_id']).eq('status', 'waiting').execute()
        if existing.data:
            return jsonify({'error': 'User already in queue'}), 400

        result = supabase.table('queue').insert({
            'spot_id': data['spot_id'],
            'user_id': data['user_id'],
            'comment': data.get('comment', ''),
            'joined_at': datetime.now().isoformat(),
            'status': 'waiting'
        }).execute()
        return jsonify(result.data[0])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/queue/leave', methods=['POST'])
def leave_queue():
    data = request.json
    if 'user_id' not in data:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        result = supabase.table('queue').update({
            'status': 'left',
            'left_at': datetime.now().isoformat()
        }).eq('user_id', data['user_id']).eq('status', 'waiting').execute()
        
        if len(result.data) == 0:
            return jsonify({'error': 'No active queue found'}), 404
            
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/upsert', methods=['POST'])
def upsert_user():
    user_data = request.json
    if 'telegram_id' not in user_data:
        return jsonify({'error': 'telegram_id is required'}), 400
    
    try:
        existing = supabase.table('users').select('*').eq('telegram_id', user_data['telegram_id']).execute()
        
        update_data = {
            'last_active': datetime.now().isoformat(),
            'nickname': user_data.get('nickname', existing.data[0]['nickname'] if existing.data else 'Игрок')
        }
        
        if 'photo_url' in user_data:
            update_data['photo_url'] = user_data['photo_url']
        
        if existing.data:
            result = supabase.table('users').update(update_data).eq('telegram_id', user_data['telegram_id']).execute()
        else:
            result = supabase.table('users').insert({
                'telegram_id': user_data['telegram_id'],
                'rating': 1000,
                'matches_played': 0,
                'created_at': datetime.now().isoformat(),
                **update_data
            }).execute()
            
        return jsonify(result.data[0])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<telegram_id>')
def get_user(telegram_id: str):
    try:
        result = supabase.table('users').select('*').eq('telegram_id', telegram_id).single().execute()
        return jsonify(result.data)
    except Exception as e:
        return jsonify({'error': 'User not found'}), 404

# Статические файлы
@app.route('/')
def home():
    return send_from_directory('static', 'queue.html')

@app.route('/<page>')
def serve_page(page: str):
    valid_pages = ['map', 'queue', 'profile']
    if page in valid_pages:
        return send_from_directory('static', f'{page}.html')
    return send_from_directory('static', 'queue.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
