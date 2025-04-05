document.addEventListener('DOMContentLoaded', async () => {
    
async function initApp() {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initDataUnsafe?.user) {
        console.error('Not in Telegram WebApp');
        return;
    }

    try {
        tg.expand();
        const tgUser = tg.initDataUnsafe.user;
        
        const authResponse = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telegram_id: tgUser.id,
                first_name: tgUser.first_name,
                last_name: tgUser.last_name || '',
                photo_url: tgUser.photo_url || ''
            })
        });

        if (!authResponse.ok) {
            throw new Error('Auth failed');
        }

        console.log('User authenticated successfully');
        
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

document.addEventListener('DOMContentLoaded', initApp);

    // Загрузка спотов
    try {
        const spotsResponse = await fetch('/api/spots');
        const spots = await spotsResponse.json();
        
        const spotSelect = document.getElementById('spot-select');
        spotSelect.innerHTML = spots.map(spot => 
            `<option value="${spot.id}">${spot.name}</option>`
        ).join('');
        
        await updateQueue();
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
    
    // Обработчик кнопки
    document.getElementById('join-button').addEventListener('click', async () => {
        const spotId = document.getElementById('spot-select').value;
        const comment = document.getElementById('comment-input').value;
        
        await fetch('/api/queue/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                spot_id: spotId,
                user_id: user.id,
                comment: comment
            })
        });
        
        await updateQueue();
    });
    
    // Обновление очереди
    async function updateQueue() {
        const spotId = document.getElementById('spot-select').value;
        const queueResponse = await fetch(`/api/queue?spot_id=${spotId}&telegram_id=${telegramId}`);
        const queue = await queueResponse.json();
        if (!Array.isArray(queue)) {
  console.error('Не массив:', queue);
  return;
}
        document.getElementById('queue-container').innerHTML = queue.map(item => `
            <div class="queue-item">
                <div class="user">${item.user.nickname}</div>
                ${item.comment ? `<div class="comment">${item.comment}</div>` : ''}
            </div>
        `).join('');
    }
    
    // Первоначальная загрузка
    await updateQueue();
});
