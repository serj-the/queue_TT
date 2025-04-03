from flask import Flask
from supabase import create_client
import os

def create_app():
    app = Flask(__name__)
    
    # Конфигурация Supabase
    app.supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_KEY')
    )
    
    # Импорт маршрутов
    from app.routes import init_routes
    init_routes(app)
    
    return app
