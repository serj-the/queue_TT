from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Временное хранилище очередей (в продакшене замените на БД)
queues = {
    "court_1": [
        {"user_id": 123, "name": "Игрок 1", "rating": 1200},
        {"user_id": 456, "name": "Игрок 2", "rating": 1350}
    ],
    "court_2": [
        {"user_id": 789, "name": "Игрок 3", "rating": 1100}
    ]
}

@app.route('/profile')
def profile():
    tg_user = {
        'id': 335261856,
        'name': "Алексей Теннисов",
        'rating': 1520,
        'matches': 27,
        'wins': 18,
        'photo_url': "https://via.placeholder.com/150",
        'last_games': [
            {"opponent": "Иван И.", "result": "6:4", "date": "01.05.2023"},
            {"opponent": "Мария С.", "result": "3:6", "date": "28.04.2023"}
        ]
    }
    return render_template('profile.html', 
                         active_tab='profile',
                         user=tg_user)

@app.route('/rating')
def rating():
    players = [
        {"id": 1, "name": "Сергей Ч.", "rating": 1820, "city": "Москва"},
        {"id": 2, "name": "Анна К.", "rating": 1750, "city": "Санкт-Петербург"},
        {"id": 335261856, "name": "Алексей Т.", "rating": 1520, "city": "Москва"},
        {"id": 4, "name": "Дмитрий П.", "rating": 1480, "city": "Казань"}
    ]
    return render_template('rating.html',
                         active_tab='rating',
                         players=players,
                         current_user_id=335261856)

@app.route('/')
def home():
    return render_template('map.html', active_tab='map')

@app.route('/map')
def map_page():
    return render_template('map.html', active_tab='map')

@app.route('/rating')
def rating():
    return render_template('rating.html', active_tab='rating')

@app.route('/profile')
def profile():
    tg_user = {
        'name': "Тестовый Пользователь",
        'rating': 1200,
        'matches': 15
    }
    return render_template('profile.html', 
                         active_tab='profile',
                         user=tg_user)

@app.route('/queue')
def queue():
    return render_template('queue.html', 
                         active_tab='queue',
                         queues=queues)

# API для работы с очередью
@app.route('/api/queue', methods=['POST'])
def handle_queue():
    data = request.json
    court_id = data.get('court_id')
    user_id = data.get('user_id')
    user_name = data.get('user_name')
    
    if court_id not in queues:
        queues[court_id] = []
    
    # Проверяем, не в очереди ли уже пользователь
    if not any(u['user_id'] == user_id for u in queues[court_id]):
        queues[court_id].append({
            "user_id": user_id,
            "name": user_name,
            "rating": data.get('rating', 1000)
        })
    
    return jsonify({
        "status": "success", 
        "queue": queues[court_id],
        "position": len(queues[court_id])
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
