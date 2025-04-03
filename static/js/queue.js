document.addEventListener('DOMContentLoaded', async () => {
    // Проверяем авторизацию
    const user = JSON.parse(localStorage.getItem('tg_user'));
    if (!user) {
        alert('Пожалуйста, войдите через Telegram');
        return;
    }

    // Загрузка спотов
    try {
        const spotsResponse = await fetch('/api/spots');
        const spots = await spotsResponse.json();
        
        const spotSelect = document.getElementById('spot-select');
        spotSelect.innerHTML = spots.map(spot => 
            `<option value="${spot.id}">${spot.name}</option>`
        ).join('');
        
        // Инициализация очереди
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
        const queueResponse = await fetch(`/api/queue?spot_id=${spotId}`);
        const queue = await queueResponse.json();
        
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
