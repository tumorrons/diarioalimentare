// ===== STORAGE.JS - GESTIONE LOCALSTORAGE (CORRETTO) =====

const STORAGE_KEY = 'foodDiaryMeals';
const SETTINGS_KEY = 'foodDiarySettings';

function saveMeals() {
    try {
        const dataToSave = {
            meals: meals,
            lastSaved: new Date().toISOString(),
            version: '2.0'
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        console.log(`💾 Dati salvati: ${meals.length} pasti`);
        
        // Calcola la dimensione dei dati
        const dataSize = new Blob([JSON.stringify(dataToSave)]).size;
        const sizeInMB = (dataSize / 1024 / 1024).toFixed(2);
        console.log(`📊 Dimensione dati: ${sizeInMB} MB`);
        
        return true;
    } catch (e) {
        console.error('❌ Errore nel salvare i dati:', e);
        
        if (e.name === 'QuotaExceededError') {
            handleStorageQuotaExceeded();
        } else {
            if (typeof showNotification === 'function') {
                showNotification('❌ Errore nel salvare i dati', 'error');
            }
        }
        
        return false;
    }
}

function loadMeals() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        
        if (!saved) {
            meals = [];
            console.log('📝 Nuovo diario inizializzato');
            return;
        }
        
        const data = JSON.parse(saved);
        
        // Gestisci diverse versioni dei dati
        if (data.meals && Array.isArray(data.meals)) {
            // Nuovo formato (v2.0+)
            meals = data.meals;
            console.log(`✅ Dati caricati (v${data.version || '2.0'}): ${meals.length} pasti`);
            console.log(`📅 Ultimo salvataggio: ${data.lastSaved || 'Non disponibile'}`);
        } else if (Array.isArray(data)) {
            // Formato legacy (v1.x)
            meals = data;
            console.log(`✅ Dati legacy caricati: ${meals.length} pasti`);
            
            // Aggiorna al nuovo formato
            saveMeals();
        } else {
            throw new Error('Formato dati non riconosciuto');
        }
        
        // Verifica integrità dati
        validateMealsData();
        
    } catch (e) {
        console.error('❌ Errore nel caricare i dati:', e);
        meals = [];
        
        // Prova a recuperare un backup
        if (attemptDataRecovery()) {
            if (typeof showNotification === 'function') {
                showNotification('⚠️ Dati recuperati da backup locale', 'info');
            }
        } else {
            if (typeof showNotification === 'function') {
                showNotification('⚠️ Errore nel caricare i dati. Diario resettato.', 'error');
            }
        }
    }
}

function validateMealsData() {
    let photosCount = 0;
    let corruptedMeals = 0;
    
    meals = meals.filter(meal => {
        // Verifica che il pasto abbia i campi essenziali
        if (!meal.id || !meal.type || !meal.food || !meal.date) {
            corruptedMeals++;
            return false;
        }
        
        // Conta le foto
        if (meal.photoBefore) photosCount++;
        if (meal.photoAfter) photosCount++;
        
        return true;
    });
    
    if (corruptedMeals > 0) {
        console.warn(`⚠️ ${corruptedMeals} pasti corrotti rimossi`);
        saveMeals(); // Salva la versione pulita
    }
    
    console.log(`📸 Foto caricate: ${photosCount}`);
    console.log(`✅ Validazione completata: ${meals.length} pasti validi`);
}

function handleStorageQuotaExceeded() {
    console.warn('⚠️ Quota storage superata!');
    
    const choice = confirm(
        '⚠️ Spazio di archiviazione esaurito!\n\n' +
        'Le foto occupano troppo spazio. Vuoi:\n' +
        '• OK: Ridurre automaticamente la qualità delle foto\n' +
        '• Annulla: Fare un backup manuale dei dati'
    );
    
    if (choice) {
        compressAllPhotos();
    } else {
        if (typeof showNotification === 'function') {
            showNotification('💾 Fai un backup dei dati dalla sezione Backup', 'info');
        }
    }
}

function compressAllPhotos() {
    console.log('🗜️ Avvio compressione automatica foto...');
    
    let compressedPhotos = 0;
    let totalPhotos = 0;
    
    meals.forEach(meal => {
        if (meal.photoBefore) {
            totalPhotos++;
            compressPhotoAggressive(meal.photoBefore, (compressed) => {
                meal.photoBefore = compressed;
                compressedPhotos++;
                checkCompressionComplete();
            });
        }
        
        if (meal.photoAfter) {
            totalPhotos++;
            compressPhotoAggressive(meal.photoAfter, (compressed) => {
                meal.photoAfter = compressed;
                compressedPhotos++;
                checkCompressionComplete();
            });
        }
    });
    
    function checkCompressionComplete() {
        if (compressedPhotos === totalPhotos) {
            console.log(`✅ Compressione completata: ${compressedPhotos} foto`);
            
            if (saveMeals()) {
                if (typeof showNotification === 'function') {
                    showNotification(`✅ ${compressedPhotos} foto compresse con successo`, 'success');
                }
            }
        }
    }
    
    if (totalPhotos === 0) {
        if (typeof showNotification === 'function') {
            showNotification('ℹ️ Nessuna foto da comprimere', 'info');
        }
    }
}

function compressPhotoAggressive(photoDataUrl, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        // Ridimensiona aggressivamente
        const maxSize = 300; // Ridotto da 600
        let { width, height } = img;
        
        if (width > height) {
            if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Qualità molto bassa per ridurre dimensioni
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.4);
        callback(compressedDataUrl);
    };
    
    img.src = photoDataUrl;
}

function attemptDataRecovery() {
    try {
        // Cerca backup automatici
        const backupKeys = Object.keys(localStorage).filter(key => 
            key.startsWith(STORAGE_KEY + '_backup_')
        );
        
        if (backupKeys.length > 0) {
            // Ordina per data (più recente prima)
            backupKeys.sort().reverse();
            
            for (const backupKey of backupKeys) {
                try {
                    const backupData = JSON.parse(localStorage.getItem(backupKey));
                    if (backupData && Array.isArray(backupData.meals)) {
                        meals = backupData.meals;
                        console.log(`🔄 Dati recuperati da: ${backupKey}`);
                        return true;
                    }
                } catch (e) {
                    console.warn(`⚠️ Backup corrotto: ${backupKey}`);
                }
            }
        }
        
        return false;
    } catch (e) {
        console.error('❌ Errore nel tentativo di recupero:', e);
        return false;
    }
}

function createAutoBackup() {
    try {
        const now = new Date();
        const backupKey = `${STORAGE_KEY}_backup_${now.toISOString().slice(0, 10)}`;
        
        const backupData = {
            meals: meals,
            created: now.toISOString(),
            version: '2.0'
        };
        
        localStorage.setItem(backupKey, JSON.stringify(backupData));
        console.log(`💾 Backup automatico creato: ${backupKey}`);
        
        // Mantieni solo gli ultimi 7 backup
        cleanOldBackups();
        
    } catch (e) {
        console.warn('⚠️ Impossibile creare backup automatico:', e);
    }
}

function cleanOldBackups() {
    try {
        const backupKeys = Object.keys(localStorage)
            .filter(key => key.startsWith(STORAGE_KEY + '_backup_'))
            .sort()
            .reverse();
        
        // Rimuovi backup oltre il limite (mantieni i 7 più recenti)
        if (backupKeys.length > 7) {
            backupKeys.slice(7).forEach(key => {
                localStorage.removeItem(key);
                console.log(`🗑️ Backup rimosso: ${key}`);
            });
        }
    } catch (e) {
        console.warn('⚠️ Errore nella pulizia backup:', e);
    }
}

// Crea backup automatico ogni volta che si salvano i dati (una volta al giorno)
function saveWithAutoBackup() {
    const today = new Date().toISOString().slice(0, 10);
    const lastBackup = localStorage.getItem(STORAGE_KEY + '_last_backup');
    
    if (lastBackup !== today) {
        createAutoBackup();
        localStorage.setItem(STORAGE_KEY + '_last_backup', today);
    }
    
    return originalSaveMeals();
}

// Mantieni la funzione originale
const originalSaveMeals = saveMeals;

// Sostituisci la funzione saveMeals con quella che include il backup automatico
saveMeals = function() {
    return saveWithAutoBackup();
};

// Funzioni per impostazioni app
function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        console.log('⚙️ Impostazioni salvate');
        return true;
    } catch (e) {
        console.error('❌ Errore nel salvare le impostazioni:', e);
        return false;
    }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('❌ Errore nel caricare le impostazioni:', e);
    }
    
    // Impostazioni predefinite
    return {
        photoQuality: 0.7,
        photoMaxSize: 600,
        autoBackup: true,
        notifications: true
    };
}

// Informazioni storage
function getStorageInfo() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const dataSize = data ? new Blob([data]).size : 0;
        
        return {
            used: dataSize,
            usedMB: (dataSize / 1024 / 1024).toFixed(2),
            mealsCount: meals.length,
            photosCount: meals.reduce((count, meal) => {
                return count + (meal.photoBefore ? 1 : 0) + (meal.photoAfter ? 1 : 0);
            }, 0)
        };
    } catch (e) {
        console.error('❌ Errore nel calcolare info storage:', e);
        return null;
    }
}