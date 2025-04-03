document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab-content').forEach(panel => {
            panel.style.display = 'none';
        });
        document.querySelector(`#tab-${this.dataset.tab}`).style.display = 'block';
        
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
    });
});
