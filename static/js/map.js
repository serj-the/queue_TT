document.addEventListener('DOMContentLoaded', () => {
    const mapWrapper = document.getElementById('map-wrapper');
    let startY, startX, scrollTop, scrollLeft;
    let isDragging = false;

    // Обработка касаний
    mapWrapper.addEventListener('touchstart', (e) => {
        startY = e.touches[0].pageY - mapWrapper.offsetTop;
        startX = e.touches[0].pageX - mapWrapper.offsetLeft;
        scrollTop = mapWrapper.scrollTop;
        scrollLeft = mapWrapper.scrollLeft;
        isDragging = true;
    });

    mapWrapper.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const y = e.touches[0].pageY - mapWrapper.offsetTop;
        const x = e.touches[0].pageX - mapWrapper.offsetLeft;
        const walkY = (y - startY) * 2;
        const walkX = (x - startX) * 2;
        
        mapWrapper.scrollTop = scrollTop - walkY;
        mapWrapper.scrollLeft = scrollLeft - walkX;
    });

    mapWrapper.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Для десктопов
    mapWrapper.addEventListener('mousedown', (e) => {
        if (e.target.closest('.locate-btn')) return;
        
        startY = e.pageY - mapWrapper.offsetTop;
        startX = e.pageX - mapWrapper.offsetLeft;
        scrollTop = mapWrapper.scrollTop;
        scrollLeft = mapWrapper.scrollLeft;
        isDragging = true;
        
        mapWrapper.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const y = e.pageY - mapWrapper.offsetTop;
        const x = e.pageX - mapWrapper.offsetLeft;
        const walkY = (y - startY) * 2;
        const walkX = (x - startX) * 2;
        
        mapWrapper.scrollTop = scrollTop - walkY;
        mapWrapper.scrollLeft = scrollLeft - walkX;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        mapWrapper.style.cursor = 'grab';
    });
});
