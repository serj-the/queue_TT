from flask import Flask, send_from_directory, jsonify, request
from supabase import create_client, Client
import os
from datetime import datetime

app = Flask(__name__, static_folder='static')

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

@app.route('/api/user/upsert', methods=['POST'])
def upsert_user():
    try:
        user_data = request.get_json()
        if not user_data or 'telegram_id' not in user_data:
            return jsonify({'error': 'Telegram ID is required'}), 400

        # Логируем входящие данные
        app.logger.info(f"Received user data: {user_data}")
        
        telegram_id = str(user_data['telegram_id'])
        nickname = user_data.get('nickname', '')
        photo_url = user_data.get('photo_url', '')

        # Выполняем upsert в базу данных
        response = supabase.table('users').upsert({
            'telegram_id': telegram_id,
            'nickname': nickname,
            'photo_url': photo_url,
            'last_active': 'now()'
        }).execute()

        if response.error:
            app.logger.error(f"Supabase error: {response.error}")
            return jsonify({'error': response.error}), 500
        
        return jsonify(response.data[0] if response.data else {'status': 'created'})

    except Exception as e:
        app.logger.error(f"Exception occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.after_request
def add_cors_headers(response):
    if request.path.startswith('/api'):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

@app.route('/api/spots')
def get_spots():
    try:
        result = supabase.from_('spots').select('*').execute()
        return jsonify(result.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/')
def home():
    return send_from_directory('static', 'queue.html')

@app.route('/<page>')
def serve_page(page):
    valid_pages = ['map', 'queue', 'profile']
    if page in valid_pages:
        return send_from_directory('static', f'{page}.html')
    return send_from_directory('static', 'queue.html')
    
if __name__ == '__main__':
    app.run(debug=True)
