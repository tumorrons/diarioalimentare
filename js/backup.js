// ===== BACKUP.JS - GESTIONE BACKUP =====

function downloadBackup() {
    console.log('📥 Avvio download backup...');
    
    const backupData = createBackupData();
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    // Calcola dimensioni
    const sizeInMB = (dataBlob.size / 1024 / 1024).toFixed(2);
    console.log(`📊 Dimensione backup: ${sizeInMB} MB`);
    
    const fileName = generateBackupFileName();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`✅ Backup scaricato: ${fileName}`);
    showNotification(`✅ Backup scaricato (${sizeInMB} MB)`, 'success');
    
    // Salva informazioni ultimo backup
    saveLastBackupInfo(fileName, sizeInMB);
}

function createBackupData() {
    const photosStats = getPhotosStats();
    
    return {
        // Metadati backup
        version: '2.0',
        appName: 'Diario Alimentare',
        exportDate: new Date().toISOString(),
        
        // Statistiche
        stats: {
            totalMeals: meals.length,
            totalPhotos: photosStats.totalCount,
            dateRange: getDateRange(),
            exportSizeMB: 0 // Verrà calcolato dopo
        },
        
        // Dati principali
        meals: meals,
        
        // Impostazioni (se presenti)
        settings: loadSettings(),
        
        // Informazioni device/browser
        deviceInfo: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: Date.now()
        }
    };
}

function generateBackupFileName() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const timeStr = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM
    return `diario-alimentare-backup-${dateStr}-${timeStr}.json`;
}

function getDateRange() {
    if (meals.length === 0) return null;
    
    const dates = meals.map(meal => new Date(meal.date.split('/').reverse().join('/')))
                      .sort((a, b) => a - b);
    
    return {
        from: dates[0].toISOString().slice(0, 10),
        to: dates[dates.length - 1].toISOString().slice(0, 10),
        totalDays: Math.ceil((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24)) + 1
    };
}

function uploadBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log(`📤 Caricamento backup: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    if (!file.name.toLowerCase().endsWith('.json')) {
        showNotification('❌ Seleziona un file JSON valido', 'error');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            processBackupUpload(backupData);
        } catch (error) {
            console.error('❌ Errore parsing JSON:', error);
            showNotification('❌ File JSON non valido!', 'error');
        }
    };
    
    reader.onerror = function() {
        console.error('❌ Errore lettura file');
        showNotification('❌ Errore nella lettura del file', 'error');
    };
    
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
}

function processBackupUpload(backupData) {
    console.log('🔍 Analisi backup caricato...');
    
    // Validazione struttura backup
    const validation = validateBackupData(backupData);
    
    if (!validation.isValid) {
        showNotification(`❌ Backup non valido: ${validation.error}`, 'error');
        return;
    }
    
    // Mostra anteprima backup
    showBackupPreview(backupData, validation);
}

function validateBackupData(backupData) {
    try {
        // Controlli di base
        if (!backupData || typeof backupData !== 'object') {
            return { isValid: false, error: 'Struttura dati non valida' };
        }
        
        if (!backupData.meals || !Array.isArray(backupData.meals)) {
            return { isValid: false, error: 'Array pasti mancante o non valido' };
        }
        
        // Validazione pasti
        for (let i = 0; i < backupData.meals.length; i++) {
            const meal = backupData.meals[i];
            
            if (!meal.id || !meal.type || !meal.food || !meal.date) {
                return { 
                    isValid: false, 
                    error: `Pasto ${i + 1} incompleto (mancano campi obbligatori)` 
                };
            }
            
            // Validazione tipo pasto
            if (!['colazione', 'pranzo', 'cena', 'snack'].includes(meal.type)) {
                return { 
                    isValid: false, 
                    error: `Pasto ${i + 1} ha tipo non valido: ${meal.type}` 
                };
            }
        }
        
        // Calcola statistiche
        const stats = {
            mealsCount: backupData.meals.length,
            photosCount: backupData.meals.reduce((count, meal) => 
                count + (meal.photoBefore ? 1 : 0) + (meal.photoAfter ? 1 : 0), 0),
            dateRange: getDateRangeFromMeals(backupData.meals),
            version: backupData.version || 'legacy',
            exportDate: backupData.exportDate || 'Non disponibile'
        };
        
        return { isValid: true, stats };
        
    } catch (error) {
        return { isValid: false, error: 'Errore durante la validazione: ' + error.message };
    }
}

function getDateRangeFromMeals(mealsData) {
    if (mealsData.length === 0) return null;
    
    const dates = mealsData.map(meal => new Date(meal.date.split('/').reverse().join('/')))
                           .sort((a, b) => a - b);
    
    return {
        from: dates[0].toLocaleDateString('it-IT'),
        to: dates[dates.length - 1].toLocaleDateString('it-IT'),
        totalDays: Math.ceil((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24)) + 1
    };
}

function showBackupPreview(backupData, validation) {
    const modal = document.createElement('div');
    modal.className = 'backup-preview-modal';
    modal.innerHTML = `
        <div class="backup-preview-content">
            <div class="backup-preview-header">
                <h3>📋 Anteprima Backup</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            
            <div class="backup-preview-body">
                <div class="backup-info">
                    <div class="info-row">
                        <span class="label">Versione:</span>
                        <span class="value">${validation.stats.version}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Data esportazione:</span>
                        <span class="value">${new Date(validation.stats.exportDate).toLocaleString('it-IT')}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Pasti:</span>
                        <span class="value">${validation.stats.mealsCount}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Foto:</span>
                        <span class="value">${validation.stats.photosCount}</span>
                    </div>
                    ${validation.stats.dateRange ? `
                        <div class="info-row">
                            <span class="label">Periodo:</span>
                            <span class="value">${validation.stats.dateRange.from} - ${validation.stats.dateRange.to}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Giorni totali:</span>
                            <span class="value">${validation.stats.dateRange.totalDays}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="backup-warning">
                    <div class="warning-content">
                        <div class="warning-icon">⚠️</div>
                        <div class="warning-text">
                            <strong>Attenzione:</strong> Questo ripristinerà tutti i tuoi dati attuali 
                            (${meals.length} pasti) con quelli del backup (${validation.stats.mealsCount} pasti).
                            <br><br>
                            <strong>Raccomandazione:</strong> Scarica prima un backup dei tuoi dati attuali.
                        </div>
                    </div>
                </div>
                
                <div class="restore-options">
                    <label class="restore-option">
                        <input type="radio" name="restoreMode" value="merge">
                        <span>➕ Aggiungi ai dati esistenti</span>
                        <small>Mantiene i dati attuali e aggiunge quelli del backup (potrebbero esserci duplicati)</small>
                    </label>
                    
                    <label class="restore-option">
                        <input type="radio" name="restoreMode" value="smart">
                        <span>🤖 Unione intelligente</span>
                        <small>Unisce i dati evitando duplicati (basato su data e nome pasto)</small>
                    </label>
                </div>
            </div>
            
            <div class="backup-preview-footer">
                <button class="cancel-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                    ❌ Annulla
                </button>
                <button class="download-current-btn" onclick="downloadCurrentBeforeRestore()">
                    💾 Backup Corrente
                </button>
                <button class="restore-btn" onclick="executeRestore()">
                    ✅ Ripristina
                </button>
            </div>
        </div>
    `;
    
    // Stili per il modal
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); display: flex; align-items: center; 
        justify-content: center; z-index: 2000; padding: 20px;
    `;
    
    const content = modal.querySelector('.backup-preview-content');
    content.style.cssText = `
        background: white; border-radius: 15px; max-width: 500px; 
        width: 100%; max-height: 90vh; overflow-y: auto;
    `;
    
    // Salva i dati del backup nel modal per uso successivo
    modal.backupData = backupData;
    
    document.body.appendChild(modal);
    
    // Aggiungi stili se non esistono
    addBackupModalStyles();
}

function addBackupModalStyles() {
    if (document.querySelector('style[data-backup-modal]')) return;
    
    const style = document.createElement('style');
    style.setAttribute('data-backup-modal', 'true');
    style.textContent = `
        .backup-preview-header {
            padding: 20px 20px 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #eee;
            margin-bottom: 20px;
        }
        
        .backup-preview-header h3 {
            margin: 0;
            color: #333;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .backup-preview-body {
            padding: 0 20px 20px 20px;
        }
        
        .backup-info {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .info-row:last-child {
            margin-bottom: 0;
        }
        
        .label {
            font-weight: 600;
            color: #555;
        }
        
        .value {
            color: #333;
        }
        
        .backup-warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .warning-content {
            display: flex;
            gap: 10px;
        }
        
        .warning-icon {
            font-size: 24px;
            flex-shrink: 0;
        }
        
        .warning-text {
            font-size: 14px;
            line-height: 1.4;
        }
        
        .restore-options {
            space-y: 10px;
        }
        
        .restore-option {
            display: block;
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .restore-option:hover {
            border-color: #667eea;
            background: rgba(102, 126, 234, 0.05);
        }
        
        .restore-option input[type="radio"] {
            margin-right: 10px;
        }
        
        .restore-option span {
            font-weight: 600;
            color: #333;
        }
        
        .restore-option small {
            display: block;
            color: #666;
            margin-top: 5px;
            font-size: 12px;
        }
        
        .backup-preview-footer {
            padding: 20px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        
        .backup-preview-footer button {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .cancel-btn {
            background: #6c757d;
            color: white;
        }
        
        .download-current-btn {
            background: #00d2d3;
            color: white;
        }
        
        .restore-btn {
            background: #27ae60;
            color: white;
        }
        
        .backup-preview-footer button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
    `;
    
    document.head.appendChild(style);
}

function downloadCurrentBeforeRestore() {
    console.log('💾 Download backup corrente prima del ripristino...');
    downloadBackup();
}

function executeRestore() {
    const modal = document.querySelector('.backup-preview-modal');
    const restoreMode = modal.querySelector('input[name="restoreMode"]:checked').value;
    const backupData = modal.backupData;
    
    console.log(`🔄 Esecuzione ripristino con modalità: ${restoreMode}`);
    
    // Conferma finale
    const confirmMessage = getRestoreConfirmMessage(restoreMode, backupData);
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Esegui il ripristino
    performRestore(backupData, restoreMode);
    
    // Chiudi modal
    modal.remove();
}

function getRestoreConfirmMessage(mode, backupData) {
    const messages = {
        replace: `⚠️ Confermi di voler SOSTITUIRE tutti i tuoi ${meals.length} pasti attuali con i ${backupData.meals.length} pasti del backup?\n\nQuesta operazione NON può essere annullata!`,
        merge: `✅ Confermi di voler AGGIUNGERE i ${backupData.meals.length} pasti del backup ai tuoi ${meals.length} pasti attuali?\n\nPotresti avere pasti duplicati.`,
        smart: `🤖 Confermi di voler eseguire un'UNIONE INTELLIGENTE dei ${backupData.meals.length} pasti del backup con i tuoi ${meals.length} pasti attuali?\n\nI duplicati verranno automaticamente gestiti.`
    };
    
    return messages[mode] || messages.replace;
}

function performRestore(backupData, mode) {
    try {
        let newMeals;
        let addedCount = 0;
        let skippedCount = 0;
        
        switch (mode) {
            case 'replace':
                newMeals = [...backupData.meals];
                addedCount = newMeals.length;
                break;
                
            case 'merge':
                newMeals = [...meals, ...backupData.meals];
                addedCount = backupData.meals.length;
                break;
                
            case 'smart':
                const result = smartMerge(meals, backupData.meals);
                newMeals = result.meals;
                addedCount = result.added;
                skippedCount = result.skipped;
                break;
                
            default:
                throw new Error('Modalità ripristino non valida');
        }
        
        // Aggiorna i dati
        meals = newMeals;
        
        // Salva e renderizza
        if (saveMeals()) {
            renderMeals();
            
            // Ripristina impostazioni se presenti
            if (backupData.settings) {
                saveSettings(backupData.settings);
                console.log('⚙️ Impostazioni ripristinate');
            }
            
            // Messaggio di successo
            let message = `✅ Ripristino completato!\n\n`;
            message += `• Pasti totali: ${meals.length}\n`;
            message += `• Pasti aggiunti: ${addedCount}\n`;
            if (skippedCount > 0) {
                message += `• Duplicati saltati: ${skippedCount}\n`;
            }
            
            alert(message);
            
            console.log(`✅ Ripristino completato: ${addedCount} aggiunti, ${skippedCount} saltati`);
            showNotification('✅ Backup ripristinato con successo!', 'success');
            
        } else {
            throw new Error('Errore nel salvataggio dei dati ripristinati');
        }
        
    } catch (error) {
        console.error('❌ Errore durante il ripristino:', error);
        showNotification('❌ Errore durante il ripristino: ' + error.message, 'error');
    }
}

function smartMerge(currentMeals, backupMeals) {
    const merged = [...currentMeals];
    let added = 0;
    let skipped = 0;
    
    backupMeals.forEach(backupMeal => {
        // Cerca duplicati basandosi su data, tipo e nome cibo
        const isDuplicate = merged.some(existingMeal => 
            existingMeal.date === backupMeal.date &&
            existingMeal.type === backupMeal.type &&
            existingMeal.food.toLowerCase().trim() === backupMeal.food.toLowerCase().trim()
        );
        
        if (!isDuplicate) {
            // Assegna nuovo ID per evitare conflitti
            const newMeal = {
                ...backupMeal,
                id: Date.now() + Math.random() * 1000
            };
            merged.push(newMeal);
            added++;
        } else {
            skipped++;
        }
    });
    
    return { meals: merged, added, skipped };
}

function saveLastBackupInfo(fileName, sizeMB) {
    const backupInfo = {
        fileName,
        sizeMB,
        date: new Date().toISOString(),
        mealsCount: meals.length
    };
    
    localStorage.setItem('lastBackupInfo', JSON.stringify(backupInfo));
}

function getLastBackupInfo() {
    try {
        const saved = localStorage.getItem('lastBackupInfo');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
}

// Funzioni di utilità per backup automatico
function shouldCreateAutoBackup() {
    const lastBackup = getLastBackupInfo();
    if (!lastBackup) return true;
    
    const lastBackupDate = new Date(lastBackup.date);
    const daysSinceBackup = (new Date() - lastBackupDate) / (1000 * 60 * 60 * 24);
    
    return daysSinceBackup >= 7; // Backup automatico ogni 7 giorni
}

function createAutoBackupIfNeeded() {
    if (meals.length > 0 && shouldCreateAutoBackup()) {
        console.log('🤖 Creazione backup automatico...');
        
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>💾 Vuoi scaricare un backup automatico dei tuoi dati?</span>
                <button onclick="downloadBackup(); this.parentElement.parentElement.remove();" 
                        style="background: #27ae60; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                    Sì
                </button>
                <button onclick="this.parentElement.parentElement.remove();" 
                        style="background: #6c757d; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                    No
                </button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: white; padding: 15px; border-radius: 10px; 
            box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 1000;
            max-width: 300px; border-left: 4px solid #27ae60;
        `;
        
        document.body.appendChild(notification);
        
        // Rimuovi automaticamente dopo 10 secondi
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }
}

// Backup differenziale (solo cambiamenti)
function createDifferentialBackup() {
    const lastBackup = getLastBackupInfo();
    if (!lastBackup) {
        return downloadBackup(); // Backup completo se è il primo
    }
    
    const lastBackupDate = new Date(lastBackup.date);
    const changedMeals = meals.filter(meal => {
        // Considera cambiati i pasti creati/modificati dopo l'ultimo backup
        // Nota: questo richiede un campo lastModified nei pasti
        return meal.lastModified && new Date(meal.lastModified) > lastBackupDate;
    });
    
    if (changedMeals.length === 0) {
        showNotification('ℹ️ Nessun cambiamento dal ultimo backup', 'info');
        return;
    }
    
    const diffBackup = {
        version: '2.0',
        type: 'differential',
        basedOn: lastBackup.fileName,
        exportDate: new Date().toISOString(),
        changes: changedMeals,
        stats: {
            changedMeals: changedMeals.length,
            baseMeals: lastBackup.mealsCount
        }
    };
    
    const dataStr = JSON.stringify(diffBackup, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const fileName = `diario-diff-${new Date().toISOString().slice(0, 10)}.json`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`✅ Backup differenziale creato: ${changedMeals.length} cambiamenti`);
    showNotification(`✅ Backup differenziale: ${changedMeals.length} cambiamenti`, 'success');
}="replace" checked>
                        <span>🔄 Sostituisci tutti i dati</span>
                        <small>Elimina tutti i dati attuali e li sostituisce con quelli del backup</small>
                    </label>
                    
                    <label class="restore-option">
                        <input type="radio" name="restoreMode" value