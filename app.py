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
