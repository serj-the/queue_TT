document.addEventListener('DOMContentLoaded', async () => {
    
        try {
            const response = await fetch(`/api/users?telegram_id=eq.${telegramId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const users = await response.json();

            if (!Array.isArray(users) || users.length === 0) {
                throw new Error('User not found');
            }

            const profileData = users[0];

            // Рендерим профиль
            renderProfile(profileData);
        } catch (error) {
            console.error('Profile load error:', error);
            showError(`Не удалось загрузить профиль: ${error.message}`);
        }

    function renderProfile(data) {
        if (!data) {
            throw new Error('No data provided');
        }

        const profilePhoto = document.querySelector('.profile-photo');
        const profileName = document.querySelector('.profile-info h2');
        
        profilePhoto.src = data.photo_url || null;
        profilePhoto.onerror = () => { profilePhoto.src = null; };
        
        profileName.textContent = data.nickname || 
                               [data.first_name, data.last_name].filter(Boolean).join(' ').trim() || 
                               'Игрок';

        // Статистика
        const matches = data.matches_played || 0;
        const wins = data.wins || 0;
        const loses = matches - wins;
        const winPercentage = matches > 0 ? Math.round((wins / matches) * 100) : 0;

        document.querySelector('.rating-badge').innerHTML = `
            ⭐ ${data.rating || 1000} 
            <span class="rank">(${winPercentage}% побед)</span>
        `;
        
        document.querySelector('.stat-value.matches').textContent = matches;
        document.querySelector('.stat-value.wins').textContent = wins;
        document.querySelector('.stat-value.loses').textContent = loses;

        // Последние игры
        renderGames(data.last_games || []);
    }

    function renderGames(games) {
        const gamesList = document.querySelector('.games-list');
        
        if (!games || games.length === 0) {
            gamesList.innerHTML = '<p>Нет данных о последних играх</p>';
            return;
        }

        gamesList.innerHTML = games.map(game => `
            <div class="game-item">
                <span class="opponent">${game.opponent || 'Unknown'}</span>
                <span class="result ${game.is_win ? 'win' : 'lose'}">
                    ${game.result || '0:0'}
                </span>
                <span class="game-date">${game.date || 'N/A'}</span>
            </div>
        `).join('');
    }

    function showLoader() {
        document.querySelector('.profile-container').innerHTML = `
            <div class="loader">
                <p>Загрузка профиля...</p>
            </div>
        `;
    }

    function showError(message) {
        document.querySelector('.profile-container').innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button class="tg-button" onclick="window.location.href='/queue'">
                    Вернуться в очередь
                </button>
            </div>
        `;
    }
});
