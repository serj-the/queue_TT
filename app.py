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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
