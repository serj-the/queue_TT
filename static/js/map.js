document.addEventListener('DOMContentLoaded', () => {
    // Инициализация карты
    initMap();
    
    // Обработчик ресайза окна
    window.addEventListener('resize', adjustMapHeight);
});

function initMap() {
    adjustMapHeight();
    
    // Здесь можно добавить логику работы с картой
    console.log("Карта инициализирована");
}

function adjustMapHeight() {
    const mapContainer = document.querySelector('.map-container');
    const tabs = document.querySelector('.tabs');
    
    if (mapContainer && tabs) {
        const tabsHeight = tabs.offsetHeight;
        mapContainer.style.height = `calc(100vh - ${tabsHeight/2}px)`;
    }
}
