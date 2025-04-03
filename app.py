from flask import Flask, request, jsonify
import os
from supabase import create_client, Client

app = Flask(__name__)

# Конфиг Supabase
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/')
def home():
    """Статическая страница (ваш фронтенд будет в /public)"""
    return app.send_static_file('index.html')

# API для работы с очередью
@app.route('/api/join_queue', methods=['POST'])
def join_queue():
    data = request.json
    response = supabase.table('queues').insert({
        "spot_id": data['spot_id'],
        "user_id": data['user_id'],
        "status": "waiting"
    }).execute()
    return jsonify(response.data)

@app.route('/api/get_queue/<spot_id>')
def get_queue(spot_id):
    response = supabase.table('queues').select("*").eq("spot_id", spot_id).execute()
    return jsonify(response.data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
