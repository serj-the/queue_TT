from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

# Главная страница Mini App
@app.route('/')
def index():
    return render_template('index.html')

# API для работы с очередью
@app.route('/api/queue', methods=['POST'])
def handle_queue():
    data = request.json
    print("Получены данные:", data)
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
