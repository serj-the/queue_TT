from flask import Flask, request, jsonify
import os
from supabase import create_client, Client

app = Flask(__name__)

# Инициализация Supabase (ключи берутся из переменных окружения)
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

@app.route('/api/upsert_user', methods=['POST'])
def upsert_user():
    user_data = request.json
    response = supabase.table('users').upsert({
        "telegram_id": user_data['telegram_id'],
        "nickname": user_data['nickname']
    }, on_conflict="telegram_id").execute()
    return jsonify(response.data)

@app.route('/api/get_queue')
def get_queue():
    response = supabase.table('queues').select("*").execute()
    return jsonify(response.data)

@app.route('/api/get_user/<user_id>')
def get_user(user_id):
    response = supabase.table('users').select("*").eq("telegram_id", user_id).single().execute()
    return jsonify(response.data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
