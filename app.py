from flask import Flask, jsonify
import os
from supabase import create_client, Client

app = Flask(__name__)

# Проверка переменных окружения
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase credentials not set in environment variables")

# Инициализация Supabase с обработкой ошибок
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase client initialized successfully")
except Exception as e:
    print(f"❌ Supabase init error: {str(e)}")
    raise

@app.route('/')
def home():
    return jsonify({"status": "OK", "supabase": "connected"})

@app.route('/api/test')
def test():
    try:
        # Тестовый запрос к любой таблице
        response = supabase.table('users').select("*").limit(1).execute()
        return jsonify({
            "status": "success",
            "data": response.data
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "solution": "Check your Supabase table permissions"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
