// ===== APP.JS - LOGICA PRINCIPALE (WEBVIEW ANDROID FIX) =====

// Variabili globali
let meals = [];
let selectedMealType = 'colazione';
let currentDate = new Date();
let editingMealId = null;

// Inizializzazione dell'app
function initApp() {
    console.log('🚀 Inizializzazione Diario Alimentare...');
    
    // Detecta l'ambiente
    detectEnvironment();
    
    // Carica i dati salvati
    loadMeals();
    
    // Inizializza la data corrente
    updateCurrentDate();
    
    // Renderizza i pasti del giorno corrente
    renderMeals();
    
    // Configura event listeners
    setupEventListeners();
    
    // Inizializza la navigazione
    initNavigation();
    
    // Setup specifico per WebView Android
    setupWebViewFeatures();
    
    console.log('✅ App inizializzata con successo!');
}

// Detecta l'ambiente di esecuzione
function detectEnvironment() {
    const ua = navigator.userAgent;
    const isWebView = /Android/.test(ua) && /wv/.test(ua);
    const isAndroidApp = /Android/.test(ua) && !ua.includes('Chrome/') && !ua.includes('Firefox/');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
    
    console.log('🔍 Ambiente rilevato:');
    console.log('- User Agent:', ua);
    console.log('- WebView Android:', isWebView);
    console.log('- App Android:', isAndroidApp);
    console.log('- Mobile:', isMobile);
    console.log('- Screen size:', window.screen.width + 'x' + window.screen.height);
    console.log('- Viewport:', window.innerWidth + 'x' + window.innerHeight);
}

// Setup specifico per WebView Android
function setupWebViewFeatures() {
    const ua = navigator.userAgent;
    const isWebView = /Android/.test(ua) && /wv/.test(ua);
    const isAndroidApp = /Android/.test(ua) && !ua.includes('Chrome/') && !ua.includes('Firefox/');
    
    if (isWebView || isAndroidApp) {
        console.log('📱 Configurazione WebView Android...');
        
        // Aggiungi pulsanti fallback per foto dopo un delay
        setTimeout(() => {
            addWebViewPhotoFallback();
        }, 2000);
        
        // Aggiungi debug button per sviluppatori
        if (window.location.hostname.includes('localhost') || window.location.hostname.includes('vercel.app')) {
            addWebViewDebugButton();
        }
        
        // Fix per zoom su input focus
        addWebViewInputFix();
        
        // Migliora la gestione dei touch
        addWebViewTouchFix();
        
        console.log('✅ Configurazione WebView completata');
    }
}

// Aggiungi pulsante di debug per WebView
function addWebViewDebugButton() {
    const debugBtn = document.createElement('button');
    debugBtn.innerHTML = '🔧 Debug WebView';
    debugBtn.style.cssText = `
        position: fixed; top: 10px; right: 10px; z-index: 9999;
        background: #ff6b6b; color: white; border: none;
        padding: 5px 10px; border-radius: 5px; font-size: 12px;
        cursor: pointer;
    `;
    debugBtn.onclick = () => {
        debugPhotoInputs();
        showWebViewInfo();
    };
    document.body.appendChild(debugBtn);
}

// Mostra informazioni WebView
function showWebViewInfo() {
    const info = `
🔍 DEBUG WEBVIEW ANDROID

User Agent: ${navigator.userAgent}

Caratteristiche supportate:
- File input: ${!!document.createElement('input').files}
- Camera API: ${!!navigator.mediaDevices}
- Touch events: ${!!('ontouchstart' in window)}

Dimensioni:
- Screen: ${window.screen.width}x${window.screen.height}
- Viewport: ${window.innerWidth}x${window.innerHeight}
- Device pixel ratio: ${window.devicePixelRatio}

Storage:
- localStorage: ${!!window.localStorage}
- Pasti salvati: ${meals.length}

Foto inputs:
- Before input: ${!!document.getElementById('photoBeforeInput')}
- After input: ${!!document.getElementById('photoAfterInput')}
    `;
    
    alert(info);
}

// Fix per evitare zoom su input focus in WebView
function addWebViewInputFix() {
    const style = document.createElement('style');
    style.textContent = `
        @media screen and (max-width: 768px) {
            input[type="text"], input[type="email"], input[type="number"], 
            input[type="tel"], input[type="url"], textarea, select {
                font-size: 16px !important;
            }
        }
    `;
    document.head.appendChild(style);
    console.log('📱 Fix zoom WebView applicato');
}

// Migliora la gestione dei touch in WebView
function addWebViewTouchFix() {
    // Disabilita il double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Migliora la reattività dei touch
    document.addEventListener('touchstart', function() {}, {passive: true});
    
    console.log('👆 Fix touch WebView applicato');
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
        
        // Aggiungi evento touch per WebView
        btn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        }, {passive: true});
        
        btn.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        }, {passive: true});
    });

    // Gestione input foto
    setupPhotoHandlers();

    // Gestione touch per mobile
    document.addEventListener('touchstart', function() {}, {passive: true});
    
    // Debug: aggiungi listener per il pulsante aggiungi
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        console.log('✅ Pulsante aggiungi trovato e funzionante');
        
        // Aggiungi feedback visivo per WebView
        addBtn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        }, {passive: true});
        
        addBtn.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        }, {passive: true});
    } else {
        console.error('❌ Pulsante aggiungi non trovato!');
    }
    
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
        } else if (