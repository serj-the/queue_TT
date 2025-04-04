from flask import Flask, send_from_directory, jsonify, request
from supabase import create_client
import os
from datetime import datetime

app = Flask(__name__, static_folder='static')

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

@app.after_request
def add_cors_headers(response):
    if request.path.startswith('/api'):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

@app.route('/api/auth', methods=['POST'])
def auth_user():
    try:
        data = request.get_json()
        if not data or 'telegram_id' not in data:
            return jsonify({'error': 'Telegram ID is required'}), 400

        telegram_id = str(data['telegram_id'])

        # Безопасно подставляем значения или пустые строки
        user_data = {
            'telegram_id': telegram_id,
            'nickname': data.get('nickname') or f"User-{telegram_id[-4:]}",
            'first_name': data.get('first_name', ''),
            'last_name': data.get('last_name', ''),
            'photo_url': data.get('photo_url', ''),
            'last_active': datetime.now().isoformat()
        }

        # НЕ удаляем ключи с пустыми строками — они нужны для вызова RPC
        response = supabase.rpc('upsert_user', {
            'p_telegram_id': user_data['telegram_id'],
            'p_nickname': user_data['nickname'],
            'p_first_name': user_data['first_name'],
            'p_last_name': user_data['last_name'],
            'p_photo_url': user_data['photo_url']
        }).execute()

        return jsonify(response.data[0] if response.data else {'status': 'created'})

    except Exception as e:
        app.logger.error(f"Auth error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/user/<telegram_id>')
def get_user(telegram_id):
    try:
        user_result = supabase.from_('users').select('*').eq('telegram_id', telegram_id).execute()

        if not user_result.data:
            return jsonify({'error': 'User not found'}), 404

        games_result = supabase.from_('games').select('*, opponent:opponent_id(nickname, photo_url)')\
            .or_(f'player1_id.eq.{telegram_id},player2_id.eq.{telegram_id}')\
            .order('played_at', desc=True).limit(5).execute()

        last_games = []
        for game in games_result.data:
            opponent = game.get('opponent', {})
            last_games.append({
                'opponent': opponent.get('nickname', 'Unknown'),
                'result': f"{game.get('player1_score', 0)}:{game.get('player2_score', 0)}",
                'date': game.get('played_at', '').split('T')[0],
                'is_win': (game.get('player1_id') == telegram_id and game.get('player1_score', 0) > game.get('player2_score', 0)) or \
                         (game.get('player2_id') == telegram_id and game.get('player2_score', 0) > game.get('player1_score', 0))
            })

        user_data = user_result.data[0]
        user_data['last_games'] = last_games

        return jsonify(user_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/spots')
def get_spots():
    try:
        result = supabase.from_('spots').select('*').execute()
        return jsonify(result.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/queue', methods=['GET'])
def get_queue():
    spot_id = request.args.get('spot_id')
    if not spot_id:
        return jsonify({'error': 'spot_id is required'}), 400

    try:
        # Получаем всех "ожидающих" пользователей на конкретной площадке
        queue_result = supabase.from_('queue') \
            .select('*') \
            .eq('spot_id', spot_id) \
            .eq('status', 'waiting') \
            .order('joined_at') \
            .execute()

        queue_data = queue_result.data or []

        # По user_id тянем данные юзеров отдельно
        user_ids = [item['user_id'] for item in queue_data]
        users_result = supabase.from_('users') \
            .select('telegram_id, nickname, photo_url') \
            .in_('telegram_id', user_ids) \
            .execute()
        users_data = {user['telegram_id']: user for user in (users_result.data or [])}

        # Склеиваем данные
        response = []
        for item in queue_data:
            user_info = users_data.get(item['user_id'], {})
            response.append({
                'id': item['id'],
                'user_id': item['user_id'],
                'spot_id': item['spot_id'],
                'status': item['status'],
                'joined_at': item['joined_at'],
                'comment': item.get('comment', ''),
                'nickname': user_info.get('nickname', 'Unknown'),
                'photo_url': user_info.get('photo_url', '')
            })

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/queue/join', methods=['POST'])
def join_queue():
    data = request.json
    if not data or 'spot_id' not in data or 'user_id' not in data:
        return jsonify({'error': 'spot_id and user_id are required'}), 400

    try:
        existing = supabase.from_('queue').select('*').eq('user_id', data['user_id']).eq('status', 'waiting').execute()

        if existing.data:
            return jsonify({'error': 'User already in queue'}), 400

try:
    result = supabase.from_('queue') \
        .select('*') \
        .eq('spot_id', spot_id) \
        .eq('status', 'waiting') \
        .order('joined_at') \
        .execute()
except Exception as e:
    print('Error loading queue:', e)
    return jsonify({'error': str(e)}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/queue/leave', methods=['POST'])
def leave_queue():
    data = request.json
    if not data or 'user_id' not in data:
        return jsonify({'error': 'user_id is required'}), 400

    try:
        result = supabase.from_('queue').update({
            'status': 'left',
            'left_at': datetime.now().isoformat()
        }).eq('user_id', data['user_id']).eq('status', 'waiting').execute()

        if not result.data:
            return jsonify({'error': 'No active queue found'}), 404

        return jsonify({'success': True})

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
    app.run(host='0.0.0.0', port=5000)
