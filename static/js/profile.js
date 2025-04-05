document.addEventListener('DOMContentLoaded', async () => {
        console.log('🔥 DOM Loaded');
const tg = window.Telegram?.WebApp;
if (!tg?.initDataUnsafe?.user) {
    console.warn('❌ Telegram WebApp не найден или нет user');
    showError('Приложение доступно только в Telegram');
    return;
}

console.log('✅ Telegram user:', tg.initDataUnsafe.user);
    tg.expand();

    const user = tg.initDataUnsafe.user;
    console.log('TG user:', user);

    if (!user?.id) {
        console.error('Не получен telegram_id');
        return;
    }

    const telegramId = '335261856';

    async function loadAndRenderProfile(telegramId) {
    showLoader();

    try {
        const res = await fetch('/api/user');
        const users = await res.json();

        console.log('👥 Users:', users);

        const profile = users.find(u => String(u.telegram_id) === String(telegramId));

        if (!profile) throw new Error('User not found');

        // Заглушка случайных данных
        profile.matches_played = Math.floor(Math.random() * 10);
        profile.wins = Math.floor(Math.random() * profile.matches_played);
        profile.last_games = [
            { opponent: 'Игрок 1', result: '2:1', is_win: true, date: 'Сегодня' },
            { opponent: 'Игрок 2', result: '1:2', is_win: false, date: 'Вчера' },
        ];

        renderProfile(profile);
    } catch (err) {
        console.error('💥 Ошибка профиля:', err);
        showError(`Не удалось загрузить профиль: ${err.message}`);
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
