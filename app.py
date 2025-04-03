from flask import Flask, send_from_directory, jsonify
import os
from supabase import create_client

app = Flask(__name__, static_folder='static')

@app.route('/')
def home():
    return send_from_directory('static', 'queue.html')  # По умолчанию очередь

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
