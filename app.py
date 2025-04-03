from flask import Flask, send_from_directory, jsonify, request
from supabase import create_client
import os
from datetime import datetime

app = Flask(__name__, static_folder='static')

# Инициализация Supabase
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

# API endpoints
@app.route('/api/queue', methods=['GET'])
def get_queue():
    spot_id = request.args.get('spot_id')
    result = supabase.table('queue').select('*, user:user_id(nickname)').eq('spot_id', spot_id).execute()
    return jsonify(result.data)

@app.route('/api/user/<user_id>')
def get_user(user_id):
    result = supabase.table('users').select('*').eq('telegram_id', user_id).single().execute()
    return jsonify(result.data)

# Страницы
@app.route('/')
def home():
    return send_from_directory('static', 'queue.html')

@app.route('/<page>')
def serve_page(page):
    if page in ['map', 'queue', 'profile']:
        return send_from_directory('static', f'{page}.html')
    return send_from_directory('static', 'queue.html')

@app.route('/api/spots')
def get_spots():
    result = supabase.table('spots').select('*').execute()
    return jsonify(result.data)

@app.route('/api/queue/join', methods=['POST'])
def join_queue():
    data = request.json
    result = supabase.table('queue').insert({
        'spot_id': data['spot_id'],
        'user_id': data['user_id'],
        'comment': data.get('comment', ''),
        'joined_at': datetime.now().isoformat(),
        'status': 'waiting'
    }).execute()
    return jsonify(result.data[0])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
