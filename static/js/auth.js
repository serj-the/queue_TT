async function initTelegramUser() {
    if (!window.Telegram?.WebApp?.initDataUnsafe?.user) {
        console.warn('Telegram user not detected');
        return null;
    }

    const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
    const userData = {
        telegram_id: tgUser.id.toString(),
        nickname: tgUser.username || `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
        photo_url: tgUser.photo_url
    };

    try {
        // Сохраняем/обновляем пользователя в БД
        const response = await fetch('/api/user/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) throw new Error('Failed to save user');
        
        const user = await response.json();
        localStorage.setItem('current_user', JSON.stringify(user));
        return user;
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}

// Вызываем при загрузке каждой страницы
document.addEventListener('DOMContentLoaded', async () => {
    const user = await initTelegramUser();
    if (!user) {
        // Обработка случая, когда пользователь не авторизован
        console.log('User not authenticated');
    }
});
