// ===== BACKUP.JS - GESTIONE BACKUP (MOBILE FIX) =====

function downloadBackup() {
    console.log('📥 Avvio download backup...');
    
    const backupData = createBackupData();
    const dataStr = JSON.stringify(backupData, null, 2);
    
    // Calcola dimensioni
    const sizeInMB = (dataStr.length / 1024 / 1024).toFixed(2);
    console.log(`📊 Dimensione backup: ${sizeInMB} MB`);
    
    const fileName = generateBackupFileName();
    
    // Fix per mobile: usa un approccio più compatibile
    try {
        // Metodo 1: Blob + URL (preferito)
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            // Per dispositivi mobile con Web Share API
            const file = new File([dataBlob], fileName, { type: 'application/json' });
            navigator.share({
                files: [file],
                title: 'Backup Diario Alimentare',
                text: 'Backup dei tuoi dati del diario alimentare'
            }).then(() => {
                console.log('✅ Backup condiviso tramite Web Share API');
                showNotification(`✅ Backup condiviso (${sizeInMB} MB)`, 'success');
            }).catch((error) => {
                console.log('⚠️ Web Share non disponibile, uso download tradizionale');
                fallbackDownload(dataBlob, fileName, sizeInMB);
            });
        } else {
            // Download tradizionale
            fallbackDownload(dataBlob, fileName, sizeInMB);
        }
    } catch (error) {
        console.error('❌ Errore nel download:', error);
        
        // Metodo 2: Data URI (fallback per browser molto vecchi)
        try {
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const link = document.createElement('a');
            link.href = dataUri;
            link.download = fileName;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log(`✅ Backup scaricato con data URI: ${fileName}`);
            showNotification(`✅ Backup scaricato (${sizeInMB} MB)`, 'success');
        } catch (dataUriError) {
            console.error('❌ Anche data URI fallito:', dataUriError);
            showBackupText(dataStr, fileName);
        }
    }
    
    // Salva informazioni ultimo backup
    saveLastBackupInfo(fileName, sizeInMB);
}

function fallbackDownload(dataBlob, fileName, sizeInMB) {
    try {
        const link = document.createElement('a');
        const url = URL.createObjectURL(dataBlob);
        
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        // Per mobile: aggiungi attributi extra
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener');
        
        document.body.appendChild(link);
        
        // Simula click con eventi multipli per compatibilità mobile
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        
        link.dispatchEvent(clickEvent);
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
        
        console.log(`✅ Backup scaricato: ${fileName}`);
        showNotification(`✅ Backup scaricato (${sizeInMB} MB)`, 'success');
        
    } catch (error) {
        console.error('❌ Fallback download fallito:', error);
        showBackupText(dataBlob, fileName);
    }
}

function showBackupText(dataStr, fileName) {
    // Ultima risorsa: mostra il testo in un modal per copia manuale
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div class="backup-text-modal">
            <div class="modal-header">
                <h3>📄 Backup Manuale</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="modal-body">
                <p>Il download automatico non è supportato. Copia il testo qui sotto e salvalo in un file chiamato <strong>${fileName}</strong>:</p>
                <textarea readonly style="width: 100%; height: 200px; font-family: monospace; font-size: 10px;">${dataStr}</textarea>
                <button onclick="copyBackupText(this)" style="margin-top: 10px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px;">
                    📋 Copia Testo
                </button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); display: flex; align-items: center; 
        justify-content: center; z-index: 2000; padding: 20px;
    `;
    
    modal.querySelector('.backup-text-modal').style.cssText = `
        background: white; border-radius: 15px; max-width: 500px; 
        width: 100%; max-height: 80vh; overflow-y: auto;
    `;
    
    document.body.appendChild(modal);
    showNotification('📄 Usa il backup manuale', 'info');
}

function copyBackupText(button) {
    const textarea = button.parentElement.querySelector('textarea');
    textarea.select();
    textarea.setSelectionRange(0, 99999); // Per mobile
    
    try {
        document.execCommand('copy');
        button.textContent = '✅ Copiato!';
        setTimeout(() => {
            button.textContent = '📋 Copia Testo';
        }, 2000);
    } catch (error) {
        console.error('❌ Errore nella copia:', error);
        alert('Seleziona tutto il testo e copialo manualmente (Ctrl+A, Ctrl+C)');
    }
}

// Fix per mobile: funzione dedicata per attivare input file
function triggerBackupInput() {
    const input = document.getElementById('backupFileInput');
    
    if (input) {
        // Per mobile: assicurati che l'input sia visibile e cliccabile
        input.style.display = 'block';
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        input.style.opacity = '0';
        input.style.pointerEvents = 'auto';
        
        // Focus e click per compatibilità mobile
        input.focus();
        
        // Simula click con eventi multipli
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        input.dispatchEvent(clickEvent);
        
        // Per iOS Safari
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            input.click();
        }
        
        // Torna invisibile dopo il click
        setTimeout(() => {
            input.style.display = 'none';
        }, 100);
        
        console.log('📱 Trigger backup input per mobile');
    } else {
        console.error('❌ Input backup non trovato');
    }
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

// Funzioni backup preview (mantengo le stesse dell'originale)
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
                        <input type="radio" name="restoreMode" value="replace" checked>
                        <span>🔄 Sostituisci tutti i dati</span>
                        <small>Elimina tutti i dati attuali e li sostituisce con quelli del backup</small>
                    </label>
                    
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
            margin-bottom: 20px;
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
        
        @media (max-width: 480px) {
            .backup-preview-footer {
                flex-direction: column;
            }
            
            .backup-preview-footer button {
                width: 100%;
                margin-bottom: 5px;
            }
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
    if (!modal) return;
    
    const restoreMode = modal.querySelector('input[name="restoreMode"]:checked')?.value || 'replace';
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
    
    try {
        localStorage.setItem('lastBackupInfo', JSON.stringify(backupInfo));
    } catch (error) {
        console.warn('⚠️ Impossibile salvare info ultimo backup:', error);
    }
}

function getLastBackupInfo() {
    try {
        const saved = localStorage.getItem('lastBackupInfo');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
}