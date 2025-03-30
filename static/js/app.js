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

function adjustForIOS() {
    if (/iPhone/.test(navigator.userAgent)) {
        const doc = document.documentElement;
        doc.style.setProperty('--safe-area-inset-bottom', '20px');
        
        // Дополнительная проверка для новых iPhone
        if (window.screen.height >= 812) {
            doc.style.setProperty('--nav-height', '72px');
        }
    }
}

document.addEventListener('DOMContentLoaded', adjustForIOS);
window.addEventListener('resize', adjustForIOS);
