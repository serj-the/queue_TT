document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram WebApp
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.expand();
        tg.enableClosingConfirmation();
        
        // Можно использовать данные пользователя
        const user = tg.initDataUnsafe.user;
        console.log('User:', user);
        
        // Добавляем ID пользователя во все запросы
        document.body.dataset.userId = user?.id;
    }
    
    // Инициализация карты (если на странице есть карта)
    if (document.getElementById('map')) {
        initMap();
    }
});

function initMap() {
    // Заглушка для будущей интеграции с 2GIS
    console.log('Инициализация карты...');
}
