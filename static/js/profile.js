document.addEventListener('DOMContentLoaded', async () => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initDataUnsafe?.user) {
        alert('Открывай через Telegram 😢');
        return;
    }

    const telegramId = String(tg.initDataUnsafe.user.id);

    try {
        const response = await fetch(`/api/user?telegram_id=eq.${telegramId}`);
        const users = await response.json();

        if (!Array.isArray(users) || users.length === 0) {
            throw new Error('Пользователь не найден');
        }

        const user = users[0];

        // Фото
        const profilePhoto = document.querySelector('.profile-photo');
        profilePhoto.src = user.photo_url || 'https://via.placeholder.com/150';
        profilePhoto.onerror = () => {
            profilePhoto.src = 'https://via.placeholder.com/150';
        };

        // Имя
        const profileName = document.querySelector('.profile-info h2');
        profileName.textContent = user.nickname || `${user.first_name} ${user.last_name}` || 'Игрок';

        // Рейтинг и победы
        const rating = user.rating || 1000;
        const matches = Math.floor(Math.random() * 20) + 1;
        const wins = Math.floor(Math.random() * (matches + 1));
        const loses = matches - wins;
        const winPercent = matches > 0 ? Math.round((wins / matches) * 100) : 0;

        document.querySelector('.rating-value').textContent = rating;
        document.querySelector('.rank').textContent = `(${winPercent}% побед)`;

        // Статистика
        document.querySelector('.stat-value.matches').textContent = matches;
        document.querySelector('.stat-value.wins').textContent = wins;
        document.querySelector('.stat-value.loses').textContent = loses;

        // Последние игры (рандом-заглушка)
        const gamesList = document.querySelector('.games-list');
        gamesList.innerHTML = Array.from({ length: 3 }).map(() => {
            const isWin = Math.random() > 0.5;
            return `
                <div class="game-item">
                    <span class="opponent">Соперник</span>
                    <span class="result ${isWin ? 'win' : 'lose'}">${isWin ? '2:1' : '0:2'}</span>
                    <span class="game-date">Сегодня</span>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error(error);
        document.querySelector('.profile-container').innerHTML = `
            <p style="text-align:center;">❌ ${error.message}</p>
        `;
    }
});
