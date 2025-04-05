document.addEventListener('DOMContentLoaded', async () => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initDataUnsafe?.user) {
        alert('Открывай через Telegram 😢');
        return;
    }

    tg.expand();

    const user = tg.initDataUnsafe.user;
    console.log('TG user:', user);

    if (!user?.id) {
        console.error('Не получен telegram_id');
        return;
    }

    const telegramId = String(user.id);

async function loadAndRenderProfile(telegramId) {
    try {
        showLoader();

        const response = await fetch(`/api/user`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();

        const profileData = users.find(user => String(user.telegram_id) === String(telegramId));

        if (!profileData) {
            throw new Error('User not found');
        }

        renderProfile(profileData);
    } catch (error) {
        console.error('Profile load error:', error);
        showError(`Не удалось загрузить профиль: ${error.message}`);
    }
}

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
        console.error('Ошибка при загрузке профиля:', error);
        document.querySelector('.profile-container').innerHTML = `
            <p style="text-align:center;">❌ Не удалось загрузить профиль: ${error.message}</p>
        `;
    }
});
