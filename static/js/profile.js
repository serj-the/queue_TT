document.addEventListener('DOMContentLoaded', async () => {
    const tg = window.Telegram?.WebApp;
    
    // Если есть данные Telegram, авторизуем пользователя
    if (tg?.initDataUnsafe?.user) {
        const tgUser = tg.initDataUnsafe.user;
        try {
            const authResponse = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegram_id: tgUser.id,
                    first_name: tgUser.first_name,
                    last_name: tgUser.last_name || '',
                    username: tgUser.username || '',
                    photo_url: tgUser.photo_url || '',
                    auth_date: tg.initDataUnsafe.auth_date,
                    hash: tg.initDataUnsafe.hash
                })
            });
            
            const userData = await authResponse.json();
            localStorage.setItem('current_user', JSON.stringify(userData));
            await loadAndRenderProfile(userData.telegram_id);
        } catch (error) {
            console.error('Auth error:', error);
        }
    } else {
        // Пытаемся загрузить из localStorage
        const savedUser = JSON.parse(localStorage.getItem('current_user'));
        if (savedUser?.telegram_id) {
            await loadAndRenderProfile(savedUser.telegram_id);
        } else {
            // Нет данных пользователя - перенаправляем или показываем ошибку
            window.location.href = '/';
        }
    }
    
    // Обработчик кнопки редактирования
    document.querySelector('.edit-profile')?.addEventListener('click', () => {
        if (tg) {
            tg.showAlert('Редактирование профиля будет доступно в следующей версии');
        } else {
            alert('Редактирование профиля');
        }
    });
});

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
