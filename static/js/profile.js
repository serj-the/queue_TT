document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user || {};
    
    // Заполняем профиль (моки, если нет данных из Telegram)
    const profileContainer = document.querySelector('.profile-container');
    profileContainer.innerHTML = `
        <div class="profile-header">
            <img src="${user.photo_url || 'https://via.placeholder.com/150'}" class="profile-photo">
            <div class="profile-info">
                <h2>${user.first_name || 'Игрок'}</h2>
                <div class="rating-badge">
                    ⭐ 1250 <span class="rank">(Топ 15%)</span>
                </div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">27</div>
                <div class="stat-label">Матчей</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">18</div>
                <div class="stat-label">Побед</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">9</div>
                <div class="stat-label">Поражений</div>
            </div>
        </div>

        <h3 class="section-title">Последние игры</h3>
        <div class="games-list">
            <div class="game-item win">
                <span class="opponent">Алексей</span>
                <span class="result">6:4</span>
                <span class="game-date">12.05.2023</span>
            </div>
            <div class="game-item lose">
                <span class="opponent">Мария</span>
                <span class="result">3:6</span>
                <span class="game-date">10.05.2023</span>
            </div>
        </div>

        <!-- Кнопка вызова на матч -->
        <button class="tg-button challenge-btn">Вызвать на матч</button>

        <!-- Рейтинг по городу -->
        <h3 class="section-title">Топ-3 игрока</h3>
        <div class="rating-list">
            <div class="rating-item">
                <span class="rank">1</span>
                <span class="name">Иван Петров</span>
                <span class="points">⭐ 1850</span>
            </div>
            <div class="rating-item">
                <span class="rank">2</span>
                <span class="name">Елена Смирнова</span>
                <span class="points">⭐ 1720</span>
            </div>
            <div class="rating-item">
                <span class="rank">3</span>
                <span class="name">Алексей К.</span>
                <span class="points">⭐ 1680</span>
            </div>
        </div>

        <!-- Участок для подключения БД -->
        <!-- 
        /////// НАЧАЛО БЛОКА ДЛЯ ПОДКЛЮЧЕНИЯ FIREBASE ///////
        // 1. Импортируйте Firebase в проект:
        // import { initializeApp } from "firebase/app";
        // import { getFirestore, doc, getDoc } from "firebase/firestore";
        
        // 2. Конфиг Firebase (замените на ваш):
        const firebaseConfig = {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_AUTH_DOMAIN",
            projectId: "YOUR_PROJECT_ID"
        };
        
        // 3. Инициализация:
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        // 4. Загрузка данных профиля (пример):
        async function loadProfile() {
            const userRef = doc(db, "users", user.id.toString());
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                // Обновите DOM здесь...
            }
        }
        loadProfile();
        /////// КОНЕЦ БЛОКА ДЛЯ БД ///////
        -->
    `;

    // Обработчики кнопок
    document.querySelector('.challenge-btn')?.addEventListener('click', () => {
        tg?.showAlert('Вызов отправлен! Ожидайте подтверждения.');
    });
});
