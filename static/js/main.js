// Конфигурация
const config = {
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-anon-key'
};

// Состояние приложения
let state = {
  currentUser: null,
  currentSpot: null,
  queue: [],
  spots: []
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
  await initTelegramAuth();
  await loadSpots();
  setupEventListeners();
  updateUI();
});

// 1. Авторизация через Telegram
async function initTelegramAuth() {
  if (window.Telegram && window.Telegram.WebApp) {
    const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
    
    if (tgUser) {
      state.currentUser = {
        id: tgUser.id.toString(),
        nickname: tgUser.username || `${tgUser.first_name} ${tgUser.last_name || ''}`.trim()
      };
      
      // Сохраняем пользователя в БД
      await fetch('/api/users/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: state.currentUser.id,
          nickname: state.currentUser.nickname
        })
      });
    }
  } else {
    console.warn('Not in Telegram environment');
    state.currentUser = { id: 'test-user', nickname: 'Test User' };
  }
}

// 2. Загрузка спотов
async function loadSpots() {
  try {
    const response = await fetch('/api/spots');
    state.spots = await response.json();
    renderSpots();
  } catch (error) {
    console.error('Failed to load spots:', error);
    showError('Не удалось загрузить площадки');
  }
}

// 3. Работа с очередью
async function joinQueue() {
  if (!state.currentSpot) return;
  
  try {
    const comment = document.getElementById('queue-comment').value;
    
    const response = await fetch('/api/queue/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spot_id: state.currentSpot.id,
        user_id: state.currentUser.id,
        comment: comment
      })
    });
    
    if (response.ok) {
      showSuccess('Вы в очереди!');
      await updateQueue();
    }
  } catch (error) {
    console.error('Join queue error:', error);
    showError('Ошибка при добавлении в очередь');
  }
}

async function leaveQueue() {
  try {
    const response = await fetch('/api/queue/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: state.currentUser.id
      })
    });
    
    if (response.ok) {
      showSuccess('Вы вышли из очереди');
      await updateQueue();
    }
  } catch (error) {
    console.error('Leave queue error:', error);
    showError('Ошибка при выходе из очереди');
  }
}

async function updateQueue() {
  if (!state.currentSpot) return;
  
  try {
    const response = await fetch(`/api/queue/${state.currentSpot.id}`);
    state.queue = await response.json();
    renderQueue();
  } catch (error) {
    console.error('Queue update error:', error);
  }
}

// 4. Рендер функций
function renderSpots() {
  const spotsContainer = document.getElementById('spots-container');
  spotsContainer.innerHTML = state.spots.map(spot => `
    <div class="spot-card" data-id="${spot.id}">
      <h3>${spot.name}</h3>
      <button class="btn-select-spot">Выбрать</button>
    </div>
  `).join('');
}

function renderQueue() {
  const queueContainer = document.getElementById('queue-container');
  queueContainer.innerHTML = state.queue.map((item, index) => `
    <div class="queue-item ${item.user_id === state.currentUser.id ? 'current-user' : ''}">
      <span class="position">${index + 1}.</span>
      <span class="user">${item.user.nickname}</span>
      ${item.comment ? `<span class="comment">"${item.comment}"</span>` : ''}
      ${item.user_id === state.currentUser.id ? 
        `<button class="btn-leave">Выйти</button>` : ''}
    </div>
  `).join('');
}

// 5. Вспомогательные функции
function setupEventListeners() {
  // Выбор спота
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-select-spot')) {
      const spotId = e.target.closest('.spot-card').dataset.id;
      state.currentSpot = state.spots.find(s => s.id === spotId);
      await updateQueue();
      updateUI();
    }
    
    // Выход из очереди
    if (e.target.classList.contains('btn-leave')) {
      await leaveQueue();
    }
  });
  
  // Кнопка "Встать в очередь"
  document.getElementById('btn-join').addEventListener('click', joinQueue);
}

function updateUI() {
  // Показываем/скрываем разделы
  document.getElementById('spot-selection').style.display = 
    state.currentSpot ? 'none' : 'block';
  document.getElementById('queue-section').style.display = 
    state.currentSpot ? 'block' : 'none';
  
  // Обновляем заголовок
  if (state.currentSpot) {
    document.getElementById('current-spot-name').textContent = state.currentSpot.name;
  }
}

function showError(message) {
  const alert = document.createElement('div');
  alert.className = 'alert error';
  alert.textContent = message;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

function showSuccess(message) {
  const alert = document.createElement('div');
  alert.className = 'alert success';
  alert.textContent = message;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

// Экспортируем для отладки
if (typeof module !== 'undefined') {
  module.exports = { state, initTelegramAuth, loadSpots };
}
