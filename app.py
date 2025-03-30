from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Временные данные
queues = {
    "court_1": [
        {"user_id": 123, "name": "Игрок 1", "rating": 1200},
        {"user_id": 456, "name": "Игрок 2", "rating": 1350}
    ]
}

players_rating = [
    {"id": 1, "name": "Сергей Ч.", "rating": 1820, "city": "Москва"},
    {"id": 335261856, "name": "Алексей Т.", "rating": 1520, "city": "Москва"}
]

@app.route('/')
def home():
    return render_template('map.html', active_tab='map')

@app.route('/map')
def map_page():
    return render_template('map.html', active_tab='map')

@app.route('/rating')
def rating_page():  # Изменили имя функции
    return render_template('rating.html',
                         active_tab='rating',
                         players=players_rating,
                         current_user_id=335261856)

@app.route('/profile')
def profile():
    tg_user = {
        'id': 335261856,
        'name': "Алексей Теннисов",
        'rating': 1520,
        'matches': 27,
        'wins': 18,
        'photo_url': "https://via.placeholder.com/150"
    }
    return render_template('profile.html', 
                         active_tab='profile',
                         user=tg_user)

@app.route('/queue')
def queue():
    return render_template('queue.html', 
                         active_tab='queue',
                         queues=queues)

@app.route('/api/queue', methods=['POST'])
def handle_queue():
    data = request.json
    court_id = data.get('court_id')
    user_id = data.get('user_id')
    
    if court_id not in queues:
        queues[court_id] = []
    
    if not any(u['user_id'] == user_id for u in queues[court_id]):
        queues[court_id].append({
            "user_id": user_id,
            "name": data.get('user_name', "Игрок"),
            "rating": data.get('rating', 1000)
        })
    
    return jsonify({
        "status": "success", 
        "queue": queues[court_id],
        "position": len(queues[court_id])
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
