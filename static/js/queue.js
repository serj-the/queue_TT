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

});
