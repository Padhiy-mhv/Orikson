// Инициализируем HP, если его нет
if (!localStorage.getItem('currentHP')) {
    localStorage.setItem('currentHP', '100'); // Стартовое HP
}

// Функция для обновления HP
function updateHP(change) {
    let currentHP = parseInt(localStorage.getItem('currentHP'));
    currentHP += change;
    if (currentHP < 0) currentHP = 0;
    if (currentHP > 100) currentHP = 100; // Максимум 100 HP
    localStorage.setItem('currentHP', currentHP.toString());
    return currentHP;
}

// Функция для получения текущего HP
function getCurrentHP() {
    return parseInt(localStorage.getItem('currentHP'));
}

// Функция для сброса HP
function resetHP() {
    localStorage.setItem('currentHP', '100');
}