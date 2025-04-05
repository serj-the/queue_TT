document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔥 DOM Loaded');

    try {
        const tg = window.Telegram?.WebApp;

        if (!tg?.initDataUnsafe?.user) {
            console.warn('❌ Telegram WebApp не найден или нет user');
            showError('Приложение доступно только в Telegram');
            return;
        }

        tg.expand();
        const user = tg.initDataUnsafe.user;
        console.log('✅ Telegram user:', user);

        const telegramId = user.id;
        console.log(`🆔 Telegram ID: ${telegramId}`); // Логируем ID перед отправкой запроса

        await loadAndRenderProfile(telegramId);
    } catch (error) {
        console.error('💥 Ошибка при загрузке профиля:', error);
        showError(`❌ Не удалось загрузить профиль: ${error.message}`);
    }
});

async function loadAndRenderProfile(telegramId) {
    showLoader();

    try {
        console.log(`🔍 Загружаем профиль для ID: ${telegramId}`); // Логируем перед запросом

        const res = await fetch(`/api/user/${telegramId}`);

        if (!res.ok) {
            // Обрабатываем ошибку от сервера
            throw new Error(`Ошибка ${res.status}: ${res.statusText}`);
        }

        const profile = await res.json();

        console.log('👤 Profile:', profile); // Логируем ответ сервера

        if (!profile) throw new Error('User not found');

        renderProfile(profile);
    } catch (err) {
        console.error('💥 Ошибка загрузки данных:', err);
        showError(`Не удалось загрузить профиль: ${err.message}`);
    }
}

function renderProfile(profile) {
    const profileName = document.querySelector('.profile-info h2');
    profileName.textContent = profile.username || profile.name || 'Игрок';

    const rating = profile.rating;
    const matches = profile.matches_played;
    const wins = profile.wins;
    const loses = matches - wins;
    const winPercent = matches > 0 ? Math.round((wins / matches) * 100) : 0;

    document.querySelector('.rating-value').textContent = rating;
    document.querySelector('.rank').textContent = `(${winPercent}% побед)`;

    document.querySelector('.stat-value.matches').textContent = matches;
    document.querySelector('.stat-value.wins').textContent = wins;
    document.querySelector('.stat-value.loses').textContent = loses;

    const gamesList = document.querySelector('.games-list');
    gamesList.innerHTML = profile.last_games.map(game => `
        <div class="game-item">
            <span class="opponent">${game.opponent}</span>
            <span class="result ${game.is_win ? 'win' : 'lose'}">${game.result}</span>
            <span class="game-date">${game.date}</span>
        </div>
    `).join('');
}

function showLoader() {
    const gamesList = document.querySelector('.games-list');
    gamesList.innerHTML = `<p>Загрузка...</p>`;
}

function showError(message) {
    const container = document.querySelector('.profile-container');
    container.innerHTML = `
        <p style="text-align:center; padding: 1em;">${message}</p>
    `;
}
