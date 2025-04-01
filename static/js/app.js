class TennisApp {
    constructor() {
        this.app = document.getElementById('app');
        this.tabContent = document.getElementById('tab-content');
        this.currentTab = 'map';
        console.log('TennisApp initialized');
        this.init();
    }

    init() {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.expand();
            // Удалим enableClosingConfirmation для теста
            console.log('Running inside Telegram environment');
        } else {
            console.log('Running outside Telegram environment');
        }
        
        document.querySelectorAll('.tab').forEach(tab => {
            console.log(`Found tab: ${tab.dataset.tab}`);
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.tab);
            });
        });
        
        this.loadTabContent();
    }

    switchTab(tabName) {
        console.log(`Switching to tab: ${tabName}`);
        this.currentTab = tabName;
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        this.loadTabContent();
    }

    loadTabContent() {
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
        console.log('Rendering map...');
        this.tabContent.innerHTML = '<div class="loader">Загрузка карты...</div>';
        
        setTimeout(() => {
            this.tabContent.innerHTML = `
                <iframe 
                    src="https://yandex.ru/map-widget/v1/?um=constructor%3A364c361b98ec98810672f3b77dfe80b8487de7eac5cd0f7d7b694e1b883f34e4&source=constructor" 
                    class="yandex-map" 
                    frameborder="0" 
                    allowfullscreen>
                </iframe>`;
        }, 500);
    }

    renderQueue() {
        console.log('Rendering queue...');
        this.tabContent.innerHTML = '<div class="queue-container">Очередь на корты</div>';
    }

    renderProfile() {
        console.log('Rendering profile...');
        this.tabContent.innerHTML = '<div class="profile-container">Профиль</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TennisApp();
});
