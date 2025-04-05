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
        
        // Инициализация очереди
        await updateQueue();
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
    
document.addEventListener('DOMContentLoaded', () => {
    const getCommentButton = document.getElementById('get-comment-button');
    const sendCommentButton = document.getElementById('send-comment-button');
    const lastCommentContainer = document.getElementById('last-comment');
    const commentInput = document.getElementById('comment-input');
    const numberInput = document.getElementById('number-input');

    // Получить последний комментарий
    getCommentButton.addEventListener('click', async () => {
        const response = await fetch('/api/comments');
        const data = await response.json();
        if (data.comment) {
            lastCommentContainer.textContent = data.comment;
        } else {
            lastCommentContainer.textContent = 'Комментариев нет.';
        }
    });

    // Отправить новый комментарий
    sendCommentButton.addEventListener('click', async () => {
        const comment = commentInput.value;
        const number = numberInput.value;

        if (!comment || !number) {
            alert('Заполните все поля!');
            return;
        }

        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment, number }),
        });

        const data = await response.json();
        if (data.success) {
            alert('Комментарий успешно добавлен!');
            commentInput.value = '';
            numberInput.value = '';
        } else {
            alert('Ошибка при добавлении комментария');
        }
    });
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
