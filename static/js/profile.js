async function initApp() {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initDataUnsafe?.user) {
        console.error('Not in Telegram WebApp');
        return;
    }

    try {
        tg.expand();
        const tgUser = tg.initDataUnsafe.user;
        
        const authResponse = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telegram_id: tgUser.id,
                first_name: tgUser.first_name,
                last_name: tgUser.last_name || '',
                photo_url: tgUser.photo_url || ''
            })
        });

        if (!authResponse.ok) {
            throw new Error('Auth failed');
        }

        console.log('User authenticated successfully');
        
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

document.addEventListener('DOMContentLoaded', initApp);


async function loadAndRenderProfile(telegramId) {
    try {
        const response = await fetch(`/api/user/${telegramId}`);
        if (!response.ok) throw new Error('Profile not found');
        
        const profileData = await response.json();
        renderProfile(profileData);
    } catch (error) {
        console.error('Profile load error:', error);
        // Показываем сообщение об ошибке
        document.querySelector('.profile-container').innerHTML = `
            <div class="error-message">
                <p>Не удалось загрузить профиль</p>
                <button onclick="window.location.reload()">Попробовать снова</button>
            </div>
        `;
    }
}

function renderProfile(data) {
    if (!data) return;

    // Основная информация
    document.querySelector('.profile-photo').src = data.photo_url || 'https://via.placeholder.com/150';
    document.querySelector('.profile-info h2').textContent = data.nickname || `${data.first_name} ${data.last_name || ''}`.trim();
    
    // Рейтинг и статистика
    const winPercentage = data.matches_played > 0 
        ? Math.round((data.wins / data.matches_played) * 100) 
        : 0;
    
    document.querySelector('.rating-badge').innerHTML = `
        ⭐ ${data.rating || 1000} 
        <span class="rank">(${winPercentage}% побед)</span>
    `;
    
    document.querySelector('.stat-value.matches').textContent = data.matches_played || 0;
    document.querySelector('.stat-value.wins').textContent = data.wins || 0;
    document.querySelector('.stat-value.loses').textContent = (data.matches_played || 0) - (data.wins || 0);
    
    // Последние игры
    const gamesList = document.querySelector('.games-list');
    if (data.last_games && data.last_games.length > 0) {
        gamesList.innerHTML = data.last_games.map(game => `
            <div class="game-item">
                <span class="opponent">${game.opponent || 'Unknown'}</span>
                <span class="result ${game.is_win ? 'win' : 'lose'}">
                    ${game.result}
                </span>
                <span class="game-date">${game.date}</span>
            </div>
        `).join('');
    } else {
        gamesList.innerHTML = '<p>Нет данных о последних играх</p>';
    }
}
