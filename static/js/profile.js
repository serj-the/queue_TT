document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram WebApp
    const tg = window.Telegram?.WebApp;
    if (tg) {
        // Заполняем реальными данными из Telegram
        const user = tg.initDataUnsafe.user;
        if (user) {
            document.querySelector('.profile-photo').src = user.photo_url || 'https://via.placeholder.com/150';
            document.querySelector('.profile-info h2').textContent = 
                `${user.first_name} ${user.last_name || ''}`.trim();
        }
    }

    // Обработчик кнопки редактирования
    document.querySelector('.edit-profile').addEventListener('click', () => {
        if (tg) {
            tg.showAlert('Редактирование профиля будет доступно в следующей версии');
        } else {
            alert('Редактирование профиля');
        }
    });
});
