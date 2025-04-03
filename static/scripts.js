// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    // Загрузка спотов
    const spots = await fetch('/api/spots').then(r => r.json());
    renderSpots(spots);
    
    // Обработчик входа в очередь
    document.getElementById('join-btn').addEventListener('click', async () => {
        const spotId = selectedSpotId;
        const comment = document.getElementById('comment').value;
        
        const response = await fetch('/api/queue/join', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                spot_id: spotId,
                user_id: currentUser.telegram_id,
                comment: comment
            })
        });
        
        if (response.ok) {
            alert('Вы в очереди!');
            updateQueue();
        }
    });
});

async function updateQueue() {
    const queue = await fetch(`/api/queue/${currentSpotId}`).then(r => r.json());
    renderQueue(queue);
}
