class TennisApp {
    constructor() {
        this.app = document.getElementById('app');
        this.tabContent = document.getElementById('tab-content');
        this.currentTab = 'map';
        this.init();
    }

    init() {
        // Инициализация Telegram WebApp
        Telegram.WebApp.expand();
        Telegram.WebApp.enableClosingConfirmation();
        
        // Обработчик вкладок
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Первоначальная загрузка
        this.loadTabContent();
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        this.loadTabContent();
    }

    loadTabContent() {
        switch (this.currentTab) {
            case 'map':
                this.renderMap();
                break;
            case 'queue':
                this.renderQueue();
                break;
            case 'profile':
                this.renderProfile();
                break;
        }
    }

    renderMap() {
        this.tabContent.innerHTML = `
            <div class="map-container">
                <iframe 
                    src="https://yandex.ru/map-widget/v1/?um=constructor%3A364c361b98ec98810672f3b77dfe80b8487de7eac5cd0f7d7b694e1b883f34e4&amp;source=constructor"
                    frameborder="0"
                    class="yandex-map"
                    allowfullscreen
                ></iframe>
            </div>
        `;
        
        // Блокируем скролл страницы
        const iframe = document.querySelector('.yandex-map');
        iframe.addEventListener('load', () => {
            iframe.contentWindow.document.body.style.overflow = 'hidden';
        });
    }

    renderQueue() {
        this.tabContent.innerHTML = `
            <div class="queue-container">
                <h2>Очередь на корты</h2>
                <div class="court-card">
                    <h3>Центральный корт</h3>
                    <div class="queue-list">
                        <div class="queue-item">1. Алексей (играет)</div>
                        <div class="queue-item">2. Мария (ожидает)</div>
                    </div>
                    <button class="join-btn">Встать в очередь</button>
                </div>
            </div>
        `;
    }

    renderProfile() {
        const user = Telegram.WebApp.initDataUnsafe.user || {};
        this.tabContent.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
                    <h2>${user.first_name || 'Гость'}</h2>
                    <p>Рейтинг: 1200</p>
                </div>
                <div class="stats">
                    <div class="stat">
                        <span>27</span>
                        <span>Матчей</span>
                    </div>
                    <div class="stat">
                        <span>18</span>
                        <span>Побед</span>
                    </div>
                </div>
            </div>
        `;
    }
}

new TennisApp();
