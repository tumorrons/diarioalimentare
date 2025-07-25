// ===== NAVIGATION.JS - GESTIONE NAVIGAZIONE (CORRETTO) =====

// Stati delle viste
const VIEWS = {
    MAIN: 'main',
    ARCHIVE: 'archive',
    DAY_DETAIL: 'dayDetail',
    BACKUP: 'backup',
    PRINT: 'print'
};

let currentView = VIEWS.MAIN;

function showMain() {
    console.log('🏠 Navigazione: Vista principale');
    
    hideAllViews();
    document.getElementById('mainView').style.display = 'block';
    currentView = VIEWS.MAIN;
    
    // Torna a oggi se non in modalità modifica
    if (!editingMealId) {
        currentDate = new Date();
        changeDay(0);
    }
    
    updateNavigationState();
}

function showArchive() {
    console.log('📚 Navigazione: Archivio');
    
    hideAllViews();
    document.getElementById('archiveView').classList.add('active');
    currentView = VIEWS.ARCHIVE;
    
    renderArchive();
    updateNavigationState();
}

function showDayDetail(dateStr) {
    console.log(`📖 Navigazione: Dettaglio giorno ${dateStr}`);
    
    hideAllViews();
    document.getElementById('dayDetailView').classList.add('active');
    currentView = VIEWS.DAY_DETAIL;
    
    renderDayDetail(dateStr);
    updateNavigationState();
}

function showBackup() {
    console.log('💾 Navigazione: Backup');
    
    hideAllViews();
    document.getElementById('backupView').classList.add('active');
    currentView = VIEWS.BACKUP;
    
    updateNavigationState();
}

function showPrint() {
    console.log('🖨️ Navigazione: Stampa');
    
    hideAllViews();
    document.getElementById('printView').style.display = 'block';
    currentView = VIEWS.PRINT;
    
    // Imposta il mese corrente
    const currentMonth = new Date().toISOString().slice(0, 7);
    document.getElementById('printMonth').value = currentMonth;
    generatePrintPreview();
    
    updateNavigationState();
}

function hideAllViews() {
    // Nascondi tutte le viste
    document.getElementById('mainView').style.display = 'none';
    document.getElementById('archiveView').classList.remove('active');
    document.getElementById('dayDetailView').classList.remove('active');
    document.getElementById('backupView').classList.remove('active');
    document.getElementById('printView').style.display = 'none';
}

function updateNavigationState() {
    // Aggiorna stato UI basato sulla vista corrente
    const body = document.body;
    
    // Rimuovi tutte le classi di vista precedenti
    body.classList.remove('view-main', 'view-archive', 'view-day-detail', 'view-backup', 'view-print');
    
    // Aggiungi classe per la vista corrente
    body.classList.add(`view-${currentView.toLowerCase().replace('_', '-')}`);
    
    // Aggiorna titolo pagina
    updatePageTitle();
    
    // Gestisci il back button del browser
    updateBrowserHistory();
}

function updatePageTitle() {
    const titles = {
        [VIEWS.MAIN]: 'Il Mio Diario Alimentare',
        [VIEWS.ARCHIVE]: 'Archivio - Diario Alimentare',
        [VIEWS.DAY_DETAIL]: 'Dettaglio Giorno - Diario Alimentare',
        [VIEWS.BACKUP]: 'Backup - Diario Alimentare',
        [VIEWS.PRINT]: 'Stampa - Diario Alimentare'
    };
    
    document.title = titles[currentView] || 'Diario Alimentare';
}

function updateBrowserHistory() {
    // Aggiorna l'URL senza ricaricare la pagina
    const urls = {
        [VIEWS.MAIN]: '#/',
        [VIEWS.ARCHIVE]: '#/archive',
        [VIEWS.DAY_DETAIL]: '#/day',
        [VIEWS.BACKUP]: '#/backup',
        [VIEWS.PRINT]: '#/print'
    };
    
    const newUrl = urls[currentView] || '#/';
    
    if (window.location.hash !== newUrl) {
        history.pushState({ view: currentView }, '', newUrl);
    }
}

// Gestione navigazione browser (back/forward)
function setupBrowserNavigation() {
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.view) {
            handleBrowserNavigation(event.state.view);
        } else {
            // Fallback: determina vista dall'URL
            const hash = window.location.hash;
            if (hash.includes('archive')) {
                showArchive();
            } else if (hash.includes('backup')) {
                showBackup();
            } else if (hash.includes('print')) {
                showPrint();
            } else {
                showMain();
            }
        }
    });
    
    // Gestione iniziale dell'URL
    handleInitialUrl();
    
    console.log('🧭 Navigazione browser configurata');
}

function handleBrowserNavigation(view) {
    switch (view) {
        case VIEWS.MAIN:
            showMain();
            break;
        case VIEWS.ARCHIVE:
            showArchive();
            break;
        case VIEWS.BACKUP:
            showBackup();
            break;
        case VIEWS.PRINT:
            showPrint();
            break;
        default:
            showMain();
    }
}

function handleInitialUrl() {
    const hash = window.location.hash;
    
    if (hash.includes('archive')) {
        showArchive();
    } else if (hash.includes('backup')) {
        showBackup();
    } else if (hash.includes('print')) {
        showPrint();
    } else {
        showMain();
    }
}

// Navigazione con animazioni
function animatedTransition(fromView, toView, callback) {
    const fromElement = getViewElement(fromView);
    const toElement = getViewElement(toView);
    
    if (!fromElement || !toElement) {
        callback();
        return;
    }
    
    // Animazione di uscita
    fromElement.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    fromElement.style.opacity = '0';
    fromElement.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
        callback();
        
        // Animazione di entrata
        toElement.style.transition = 'opacity 0.3s ease-in, transform 0.3s ease-in';
        toElement.style.opacity = '0';
        toElement.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            toElement.style.opacity = '1';
            toElement.style.transform = 'translateX(0)';
            
            // Pulisci gli stili di transizione
            setTimeout(() => {
                fromElement.style.transition = '';
                toElement.style.transition = '';
                fromElement.style.transform = '';
                toElement.style.transform = '';
            }, 300);
        }, 50);
    }, 300);
}

function getViewElement(view) {
    const elements = {
        [VIEWS.MAIN]: document.getElementById('mainView'),
        [VIEWS.ARCHIVE]: document.getElementById('archiveView'),
        [VIEWS.DAY_DETAIL]: document.getElementById('dayDetailView'),
        [VIEWS.BACKUP]: document.getElementById('backupView'),
        [VIEWS.PRINT]: document.getElementById('printView')
    };
    
    return elements[view];
}

// Breadcrumb navigation
function updateBreadcrumb() {
    let breadcrumb = document.getElementById('breadcrumb');
    
    if (!breadcrumb) {
        // Crea breadcrumb se non esiste
        breadcrumb = document.createElement('div');
        breadcrumb.id = 'breadcrumb';
        breadcrumb.style.cssText = `
            padding: 10px 20px; background: rgba(255,255,255,0.1); 
            color: white; font-size: 14px; margin-bottom: 20px;
            border-radius: 10px; backdrop-filter: blur(10px);
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(breadcrumb, container.firstChild.nextSibling);
    }
    
    const breadcrumbs = {
        [VIEWS.MAIN]: '🏠 Home',
        [VIEWS.ARCHIVE]: '🏠 Home > 📚 Archivio',
        [VIEWS.DAY_DETAIL]: '🏠 Home > 📚 Archivio > 📖 Dettaglio',
        [VIEWS.BACKUP]: '🏠 Home > 💾 Backup',
        [VIEWS.PRINT]: '🏠 Home > 🖨️ Stampa'
    };
    
    breadcrumb.innerHTML = breadcrumbs[currentView] || '🏠 Home';
    breadcrumb.style.display = currentView === VIEWS.MAIN ? 'none' : 'block';
}

// Shortcuts da tastiera
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Solo se non stiamo scrivendo in un input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.key) {
            case 'h':
            case 'Home':
                event.preventDefault();
                showMain();
                break;
                
            case 'a':
                event.preventDefault();
                showArchive();
                break;
                
            case 'b':
                event.preventDefault();
                showBackup();
                break;
                
            case 'p':
                event.preventDefault();
                showPrint();
                break;
                
            case 'Escape':
                event.preventDefault();
                if (currentView !== VIEWS.MAIN) {
                    showMain();
                }
                break;
                
            case 'ArrowLeft':
                if (currentView === VIEWS.MAIN) {
                    event.preventDefault();
                    changeDay(-1);
                }
                break;
                
            case 'ArrowRight':
                if (currentView === VIEWS.MAIN) {
                    event.preventDefault();
                    changeDay(1);
                }
                break;
        }
    });
    
    console.log('⌨️ Shortcuts tastiera configurati');
    console.log('📋 Shortcuts: H=Home, A=Archivio, B=Backup, P=Stampa, ESC=Indietro, ←→=Cambia giorno');
}

// Gestione swipe per mobile
function setupSwipeNavigation() {
    let startX = 0;
    let startY = 0;
    const minSwipeDistance = 100;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(e) {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // Solo swipe orizzontali significativi
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (currentView === VIEWS.MAIN) {
                if (deltaX > 0) {
                    // Swipe destro = giorno precedente
                    changeDay(-1);
                } else {
                    // Swipe sinistro = giorno successivo
                    changeDay(1);
                }
            }
        }
        
        startX = 0;
        startY = 0;
    });
    
    console.log('👆 Navigazione swipe configurata');
}

// Inizializzazione navigazione
function initNavigation() {
    setupBrowserNavigation();
    setupKeyboardShortcuts();
    setupSwipeNavigation();
    
    // Aggiorna breadcrumb iniziale
    updateBreadcrumb();
    
    console.log('🧭 Sistema di navigazione inizializzato');
}