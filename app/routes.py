from flask import jsonify, request
from datetime import datetime

def init_routes(app):
    # ======== Системные ========
    @app.route('/api/ping')
    def ping():
        return jsonify({"status": "ok", "time": datetime.now().isoformat()})
    
    # ======== Пользователи ========
    @app.route('/api/users/upsert', methods=['POST'])
    def upsert_user():
        data = request.json
        result = app.supabase.table('users').upsert({
            "telegram_id": data['telegram_id'],
            "nickname": data['nickname'],
            "last_active": datetime.now().isoformat()
        }, on_conflict="telegram_id").execute()
        return jsonify(result.data)
    
    # ======== Споты ========
    @app.route('/api/spots')
    def get_spots():
        result = app.supabase.table('spots').select("*").execute()
        return jsonify(result.data)
    
    # ======== Очереди ========
    @app.route('/api/queues', methods=['GET'])
    def get_queues():
        spot_id = request.args.get('spot_id')
        query = app.supabase.table('queues').select("*")
        
        if spot_id:
            query = query.eq("spot_id", spot_id)
            
        result = query.execute()
        return jsonify(result.data)
    
    @app.route('/api/queues/join', methods=['POST'])
    def join_queue():
        data = request.json
        result = app.supabase.table('queues').insert({
            "spot_id": data['spot_id'],
            "user_id": data['user_id'],
            "status": "waiting",
            "joined_at": datetime.now().isoformat()
        }).execute()
        return jsonify(result.data)
    
    @app.route('/api/queues/leave', methods=['POST'])
    def leave_queue():
        data = request.json
        result = app.supabase.table('queues').update({
            "status": "left",
            "left_at": datetime.now().isoformat()
        }).eq("user_id", data['user_id']).execute()
        return jsonify(result.data)
    
    # ======== Рейтинги ========
    @app.route('/api/ratings')
    def get_ratings():
        result = app.supabase.table('users').select(
            "telegram_id, nickname, rating"
        ).order("rating", desc=True).limit(50).execute()
        return jsonify(result.data)
