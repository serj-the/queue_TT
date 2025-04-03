// Инициализация пользователя Telegram
document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        const userData = {
            id: tgUser.id.toString(),
            nickname: tgUser.username || `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
            photo_url: tgUser.photo_url
        };
        
        localStorage.setItem('tg_user', JSON.stringify(userData));
        
        // Отправка данных на сервер
        fetch('/api/user/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: userData.id,
                nickname: userData.nickname
            })
        });
    }
});
