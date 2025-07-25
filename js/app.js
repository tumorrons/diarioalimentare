// ===== APP.JS - LOGICA PRINCIPALE =====

// Variabili globali
let meals = [];
let selectedMealType = 'colazione';
let currentDate = new Date();
let editingMealId = null;

// Inizializzazione dell'app
function initApp() {
    console.log('🚀 Inizializzazione Diario Alimentare...');
    
    // Carica i dati salvati
    loadMeals();
    
    // Inizializza la data corrente
    updateCurrentDate();
    
    // Renderizza i pasti del giorno corrente
    renderMeals();
    
    // Configura event listeners
    setupEventListeners();
    
    console.log('✅ App inizializzata con successo!');
}

// Configurazione event listeners
function setupEventListeners() {
    // Gestione selezione tipo pasto
    document.querySelectorAll('.meal-type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.meal-type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedMealType = this.dataset.type;
            console.log(`🍽️ Tipo pasto selezionato: ${selectedMealType}`);
        });
    });

    // Gestione input foto
    setupPhotoHandlers();

    // Gestione touch per mobile
    document.addEventListener('touchstart', function() {}, true);
    
    console.log('🎯 Event listeners configurati');
}

// Utility functions
function formatDate(date) {
    return date.toLocaleDateString('it-IT', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function getDateString(date) {
    return date.toLocaleDateString('it-IT');
}

function getMealTypeIcon(type) {
    const icons = {
        'colazione': '🌅',
        'pranzo': '☀️',
        'cena': '🌙',
        'snack': '🍎'
    };
    return icons[type] || '🍽️';
}

function updateCurrentDate() {
    const today = new Date();
    const dateStr = getDateString(currentDate);
    const todayStr = getDateString(today);
    
    let displayText = formatDate(currentDate);
    if (dateStr === todayStr) {
        displayText = "Oggi - " + formatDate(currentDate);
    } else {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        if (dateStr === getDateString(yesterday)) {
            displayText = "Ieri - " + formatDate(currentDate);
        } else if (dateStr === getDateString(tomorrow)) {
            displayText = "Domani - " + formatDate(currentDate);
        }
    }
    
    document.getElementById('currentDate').textContent = displayText;
    
    // Aggiorna il titolo del diario
    const titleElement = document.getElementById('diaryTitle');
    if (dateStr === todayStr) {
        titleElement.textContent = "📖 Il Tuo Diario di Oggi";
    } else {
        titleElement.textContent = `📖 Diario del ${currentDate.toLocaleDateString('it-IT')}`;
    }
}

function changeDay(offset) {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + offset);
    currentDate = newDate;
    
    // Aggiorna i pulsanti di navigazione
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (offset === -1) {
        document.querySelectorAll('.nav-btn')[0].classList.add('active');
    } else if (offset === 0) {
        document.querySelectorAll('.nav-btn')[1].classList.add('active');
    } else {
        document.querySelectorAll('.nav-btn')[2].classList.add('active');
    }
    
    updateCurrentDate();
    renderMeals();
    
    // Mostra/nascondi sezione aggiungi pasto (solo per oggi e futuro)
    const today = new Date();
    const isToday = getDateString(currentDate) === getDateString(today);
    const isFuture = currentDate > today;
    
    document.getElementById('addMealSection').style.display = 
        (isToday || isFuture) ? 'block' : 'none';
    
    console.log(`📅 Cambiato giorno: ${getDateString(currentDate)}`);
}

function clearForm() {
    document.getElementById('foodName').value = '';
    document.getElementById('foodNotes').value = '';
    document.getElementById('photoBeforePreview').innerHTML = '<div class="photo-preview-label">Prima di mangiare</div>';
    document.getElementById('photoAfterPreview').innerHTML = '<div class="photo-preview-label">Dopo aver mangiato</div>';
    clearPhotos();
    document.getElementById('photoBeforeInput').value = '';
    document.getElementById('photoAfterInput').value = '';
    console.log('🧹 Form pulito');
}

// Avvio dell'app quando la pagina è caricata
window.addEventListener('load', function() {
    console.log('📱 Pagina caricata, avvio app...');
    initApp();
});
    