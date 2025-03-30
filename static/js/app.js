from flask import Flask, render_template

app = Flask(__name__)

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

@app.route('/duels')
def duels():
    return render_template('duels.html', active_tab='duels')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
