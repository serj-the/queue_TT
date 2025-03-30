document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.expand();
        Telegram.WebApp.enableClosingConfirmation();
        
        // Можно использовать данные пользователя
        const user = Telegram.WebApp.initDataUnsafe.user;
        console.log('User:', user);
    }
    
    // Здесь будет инициализация карты
    initMap();
});

function initMap() {
    // Заглушка для будущей интеграции с 2GIS
    console.log('Инициализация карты...');
    
    // Пример: можно добавить кнопку для теста
    const testButton = document.createElement('button');
    testButton.textContent = 'Тест карты';
    testButton.className = 'tg-button';
    testButton.onclick = () => alert('Карта будет здесь!');
    document.getElementById('map').append(testButton);
}
