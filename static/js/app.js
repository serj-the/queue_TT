class TennisApp {
    constructor() {
        this.app = document.getElementById('app');
        this.tabContent = document.getElementById('tab-content');
        this.currentTab = 'map';
        this.init();
    }

    init() {
        // Проверяем наличие Telegram WebApp API
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.expand();
            Telegram.WebApp.enableClosingConfirmation();
        } else {
            console.log('Running outside Telegram environment');
        }
        
        // Улучшенный обработчик вкладок
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.tab);
            });
        });
        
        // Первоначальная загрузка с обработкой ошибок
        try {
            this.loadTabContent();
        } catch (e) {
            console.error('Initial load error:', e);
            this.showError();
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        this.loadTabContent();
    }

    loadTabContent() {
        // Очищаем контент перед загрузкой нового
        this.tabContent.innerHTML = '';
        
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
        // Добавляем лоадер перед загрузкой карты
        this.tabContent.innerHTML = '<div class="loader">Загрузка карты...</div>';
        
        const iframe = document.createElement('iframe');
        iframe.src = 'https://yandex.ru/map-widget/v1/?um=constructor%3A364c361b98ec98810672f3b77dfe80b8487de7eac5cd0f7d7b694e1b883f34e4&amp;source=constructor';
        iframe.className = 'yandex-map';
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        
        // Обработчики для iframe
        iframe.onload = () => {
            try {
                iframe.contentWindow.document.body.style.overflow = 'hidden';
            } catch (e) {
                console.log('Could not access iframe content:', e);
            }
        };
        
        iframe.onerror = () => {
            this.tabContent.innerHTML = '<div class="error">Не удалось загрузить карту. Проверьте подключение к интернету.</div>';
        };
        
        // Заменяем лоадер на iframe
        this.tabContent.innerHTML = '';
        this.tabContent.appendChild(iframe);
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
        
        // Добавляем обработчик кнопки
        document.querySelector('.join-btn')?.addEventListener('click', () => {
            alert('Функция "Встать в очередь" будет доступна в следующей версии');
        });
    }

    renderProfile() {
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
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

    showError() {
        this.tabContent.innerHTML = `
            <div class="error">
                Произошла ошибка. Пожалуйста, перезагрузите приложение.
            </div>
        `;
    }
}

// Запускаем приложение после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new TennisApp();
});
