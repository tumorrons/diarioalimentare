// ===== PRINT.JS - GESTIONE STAMPE =====

function generatePrintPreview() {
    const monthInput = document.getElementById('printMonth').value;
    if (!monthInput) {
        console.warn('⚠️ Nessun mese selezionato per la stampa');
        return;
    }

    const [year, month] = monthInput.split('-');
    console.log(`🖨️ Generazione anteprima stampa per ${getMonthName(month)} ${year}`);
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const monthMeals = meals.filter(meal => {
        const mealDate = new Date(meal.date.split('/').reverse().join('/'));
        return mealDate >= startDate && mealDate <= endDate;
    });

    const printContent = document.getElementById('printContent');
    
    if (monthMeals.length === 0) {
        renderEmptyPrintPreview(printContent, month, year);
        return;
    }

    // Raggruppa per giorno
    const mealsByDate = {};
    monthMeals.forEach(meal => {
        if (!mealsByDate[meal.date]) {
            mealsByDate[meal.date] = [];
        }
        mealsByDate[meal.date].push(meal);
    });

    const sortedDates = Object.keys(mealsByDate).sort((a, b) => {
        return new Date(a.split('/').reverse().join('/')) - new Date(b.split('/').reverse().join('/'));
    });

    // Genera contenuto stampa
    printContent.innerHTML = generatePrintContent(year, month, monthMeals, mealsByDate, sortedDates);
    
    console.log(`✅ Anteprima generata: ${monthMeals.length} pasti in ${sortedDates.length} giorni`);
}

function renderEmptyPrintPreview(container, month, year) {
    container.innerHTML = `
        <div class="empty-print-state">
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 15px;">📅</div>
                <h3>Nessun pasto registrato</h3>
                <p>Non ci sono pasti registrati per ${getMonthName(month)} ${year}</p>
                <button onclick="showMain()" style="
                    margin-top: 15px; padding: 10px 20px; 
                    background: #667eea; color: white; 
                    border: none; border-radius: 8px; cursor: pointer;
                ">
                    ➕ Aggiungi Pasti
                </button>
            </div>
        </div>
    `;
}

function generatePrintContent(year, month, monthMeals, mealsByDate, sortedDates) {
    const stats = calculateMonthStats(monthMeals, sortedDates);
    const daysInMonth = new Date(year, month, 0).getDate();
    const allDays = Array.from({length: daysInMonth}, (_, i) => i + 1);
    
    return `
        <div class="print-document">
            ${generatePrintHeader(month, year)}
            ${generatePrintStats(stats)}
            ${generatePrintTable(year, month, allDays, mealsByDate)}
            ${generatePrintFooter(stats)}
        </div>
    `;
}

function generatePrintHeader(month, year) {
    return `
        <div class="print-header">
            📖 DIARIO ALIMENTARE - ${getMonthName(month).toUpperCase()} ${year}
        </div>
    `;
}

function generatePrintStats(stats) {
    return `
        <div class="print-stats">
            <div class="print-stat">
                <div class="print-stat-number">${stats.activeDays}</div>
                <div>Giorni Attivi</div>
            </div>
            <div class="print-stat">
                <div class="print-stat-number">${stats.totalMeals}</div>
                <div>Pasti Totali</div>
            </div>
            <div class="print-stat">
                <div class="print-stat-number">${stats.avgMealsPerDay}</div>
                <div>Media/Giorno</div>
            </div>
            <div class="print-stat">
                <div class="print-stat-number">${stats.uniqueMealTypes}</div>
                <div>Tipi Pasto</div>
            </div>
            <div class="print-stat">
                <div class="print-stat-number">${stats.totalPhotos}</div>
                <div>Foto</div>
            </div>
        </div>
    `;
}

function generatePrintTable(year, month, allDays, mealsByDate) {
    return `
        <table class="print-month-table">
            ${allDays.map(dayNumber => generateDayRow(year, month, dayNumber, mealsByDate)).join('')}
        </table>
    `;
}

function generateDayRow(year, month, dayNumber, mealsByDate) {
    const dayDate = new Date(year, month - 1, dayNumber);
    const dayStr = dayDate.toLocaleDateString('it-IT');
    const dayMeals = mealsByDate[dayStr] || [];
    const dayName = dayDate.toLocaleDateString('it-IT', { weekday: 'short' });
    const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
    const isToday = getDateString(new Date()) === dayStr;
    
    return `
        <tr class="print-day-row ${isWeekend ? 'day-weekend' : ''} ${isToday ? 'day-today' : ''}">
            <td class="print-day-cell">
                <strong>${dayName.charAt(0).toUpperCase()}</strong><br>
                <span class="day-number">${dayNumber}</span>
            </td>
            <td class="print-meals-cell">
                ${dayMeals.length > 0 ? generateDayMealsContent(dayMeals) : generateEmptyDayContent()}
            </td>
        </tr>
    `;
}

function generateDayMealsContent(dayMeals) {
    // Ordina pasti per ora
    const sortedMeals = dayMeals.sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
    
    return sortedMeals.map(meal => `
        <div class="print-meal-item">
            <span class="print-meal-type">${getMealTypeIcon(meal.type)}</span>
            <span class="print-meal-time">${meal.time}</span>
            <span class="print-meal-food">${meal.food}</span>
            ${meal.notes ? `<div class="print-meal-notes">${truncateText(meal.notes, 50)}</div>` : ''}
            ${generatePhotoIndicators(meal)}
        </div>
    `).join('');
}

function generateEmptyDayContent() {
    return '<div class="print-empty-day">Nessun pasto</div>';
}

function generatePhotoIndicators(meal) {
    if (!meal.photoBefore && !meal.photoAfter) return '';
    
    return `
        <div class="print-meal-photos">
            ${meal.photoBefore ? '<span class="print-photo-indicator before" title="Foto prima"></span>' : ''}
            ${meal.photoAfter ? '<span class="print-photo-indicator after" title="Foto dopo"></span>' : ''}
        </div>
    `;
}

function generatePrintFooter(stats) {
    const now = new Date();
    return `
        <div class="print-footer">
            Generato il ${now.toLocaleDateString('it-IT')} alle ${now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} | 
            Diario Alimentare App | 
            Totale: ${stats.totalMeals} pasti in ${stats.activeDays} giorni | 
            🟢 = Foto Prima, 🟣 = Foto Dopo
        </div>
    `;
}

function calculateMonthStats(monthMeals, sortedDates) {
    const totalMeals = monthMeals.length;
    const activeDays = sortedDates.length;
    const avgMealsPerDay = activeDays > 0 ? (totalMeals / activeDays).toFixed(1) : 0;
    
    const mealTypes = new Set(monthMeals.map(meal => meal.type));
    const uniqueMealTypes = mealTypes.size;
    
    const totalPhotos = monthMeals.reduce((count, meal) => 
        count + (meal.photoBefore ? 1 : 0) + (meal.photoAfter ? 1 : 0), 0);
    
    return {
        totalMeals,
        activeDays,
        avgMealsPerDay,
        uniqueMealTypes,
        totalPhotos
    };
}

function printMonth() {
    console.log('🖨️ Avvio stampa...');
    
    // Verifica che ci sia contenuto da stampare
    const printContent = document.getElementById('printContent');
    if (!printContent.innerHTML.trim()) {
        showNotification('⚠️ Genera prima l\'anteprima di stampa', 'error');
        return;
    }
    
    // Prepara la stampa
    preparePrintStyles();
    
    // Stampa
    window.print();
    
    console.log('✅ Comando stampa inviato');
}

function preparePrintStyles() {
    // Assicurati che gli stili di stampa siano applicati
    if (!document.querySelector('style[data-print-dynamic]')) {
        const style = document.createElement('style');
        style.setAttribute('data-print-dynamic', 'true');
        style.textContent = `
            @media print {
                .print-day-row.day-today {
                    background: rgba(39, 174, 96, 0.1) !important;
                    border-left: 3px solid #27ae60 !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function getMonthName(monthNum) {
    const months = [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return months[parseInt(monthNum) - 1];
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Funzioni di stampa avanzate
function generateDetailedPrint() {
    const monthInput = document.getElementById('printMonth').value;
    if (!monthInput) return;
    
    const [year, month] = monthInput.split('-');
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const monthMeals = meals.filter(meal => {
        const mealDate = new Date(meal.date.split('/').reverse().join('/'));
        return mealDate >= startDate && mealDate <= endDate;
    });
    
    if (monthMeals.length === 0) {
        showNotification('⚠️ Nessun pasto da stampare per questo mese', 'info');
        return;
    }
    
    // Crea finestra popup per stampa dettagliata
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(generateDetailedPrintHTML(year, month, monthMeals));
    printWindow.document.close();
    
    printWindow.onload = function() {
        printWindow.print();
        printWindow.close();
    };
}

function generateDetailedPrintHTML(year, month, monthMeals) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Diario Alimentare Dettagliato - ${getMonthName(month)} ${year}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .meal-day { page-break-inside: avoid; margin-bottom: 20px; }
                .day-header { background: #f0f0f0; padding: 10px; font-weight: bold; }
                .meal-item { margin: 10px 0; padding: 10px; border-left: 3px solid #667eea; }
                .meal-type { background: #667eea; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
                .meal-time { color: #666; font-size: 14px; }
                .meal-food { font-weight: bold; margin: 5px 0; }
                .meal-notes { color: #666; font-style: italic; }
                .meal-photos { margin-top: 5px; }
                .photo-indicator { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 5px; }
                .photo-before { background: #4CAF50; }
                .photo-after { background: #ff9ff3; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📖 Diario Alimentare Dettagliato</h1>
                <h2>${getMonthName(month)} ${year}</h2>
                <p>Generato il ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}</p>
            </div>
            
            ${generateDetailedContent(monthMeals)}
            
            <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
                <p>Diario Alimentare App - Totale: ${monthMeals.length} pasti</p>
                <p>🟢 = Foto Prima del pasto | 🟣 = Foto Dopo il pasto</p>
            </div>
        </body>
        </html>
    `;
}

function generateDetailedContent(monthMeals) {
    // Raggruppa per data
    const mealsByDate = {};
    monthMeals.forEach(meal => {
        if (!mealsByDate[meal.date]) {
            mealsByDate[meal.date] = [];
        }
        mealsByDate[meal.date].push(meal);
    });
    
    const sortedDates = Object.keys(mealsByDate).sort((a, b) => {
        return new Date(a.split('/').reverse().join('/')) - new Date(b.split('/').reverse().join('/'));
    });
    
    return sortedDates.map(dateStr => {
        const dayMeals = mealsByDate[dateStr];
        const date = new Date(dateStr.split('/').reverse().join('/'));
        
        // Ordina pasti per ora
        dayMeals.sort((a, b) => {
            const timeA = a.time.split(':').map(Number);
            const timeB = b.time.split(':').map(Number);
            return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
        });
        
        return `
            <div class="meal-day">
                <div class="day-header">
                    ${formatDate(date)} - ${dayMeals.length} pasti
                </div>
                ${dayMeals.map(meal => `
                    <div class="meal-item">
                        <div>
                            <span class="meal-type">${getMealTypeIcon(meal.type)} ${meal.type.toUpperCase()}</span>
                            <span class="meal-time">${meal.time}</span>
                        </div>
                        <div class="meal-food">${meal.food}</div>
                        ${meal.notes ? `<div class="meal-notes">${meal.notes}</div>` : ''}
                        ${(meal.photoBefore || meal.photoAfter) ? `
                            <div class="meal-photos">
                                Foto: 
                                ${meal.photoBefore ? '<span class="photo-indicator photo-before" title="Prima"></span>Prima' : ''}
                                ${meal.photoAfter ? '<span class="photo-indicator photo-after" title="Dopo"></span>Dopo' : ''}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

// Funzioni di esportazione PDF (se disponibili)
function exportToPDF() {
    // Verifica se il browser supporta la stampa in PDF
    if ('onbeforeprint' in window) {
        console.log('📄 Tentativo esportazione PDF...');
        
        // Suggerimenti per l'utente
        showPDFExportInstructions();
        
        // Prepara e stampa
        preparePrintStyles();
        setTimeout(() => {
            window.print();
        }, 1000);
    } else {
        showNotification('⚠️ Esportazione PDF non supportata da questo browser', 'error');
    }
}

function showPDFExportInstructions() {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div class="pdf-instructions">
            <h3>📄 Esportazione PDF</h3>
            <p>Per salvare come PDF:</p>
            <ol>
                <li>Nella finestra di stampa, seleziona <strong>"Salva come PDF"</strong> come destinazione</li>
                <li>Imposta i margini su <strong>"Minimi"</strong></li>
                <li>Abilita <strong>"Grafica di sfondo"</strong> per mantenere i colori</li>
                <li>Clicca <strong>"Salva"</strong></li>
            </ol>
            <div class="modal-actions">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="close-btn">
                    ✅ Ho Capito
                </button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); display: flex; align-items: center; 
        justify-content: center; z-index: 2000;
    `;
    
    modal.querySelector('.pdf-instructions').style.cssText = `
        background: white; padding: 30px; border-radius: 15px; 
        max-width: 400px; text-align: left;
    `;
    
    modal.querySelector('.close-btn').style.cssText = `
        background: #667eea; color: white; border: none; 
        padding: 10px 20px; border-radius: 8px; cursor: pointer; 
        margin-top: 20px; width: 100%;
    `;
    
    document.body.appendChild(modal);
    
    // Rimuovi automaticamente dopo 15 secondi
    setTimeout(() => {
        if (modal.parentElement) {
            modal.remove();
        }
    }, 15000);
}

// Funzioni di stampa personalizzata
function customPrintOptions() {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div class="print-options-modal">
            <div class="print-options-header">
                <h3>🖨️ Opzioni di Stampa</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            
            <div class="print-options-body">
                <div class="option-group">
                    <h4>📅 Periodo</h4>
                    <label>
                        <input type="radio" name="period" value="month" checked>
                        Solo mese selezionato
                    </label>
                    <label>
                        <input type="radio" name="period" value="range">
                        Intervallo personalizzato
                    </label>
                    <div class="date-range" style="display: none; margin-top: 10px;">
                        <input type="date" id="startDate" style="margin-right: 10px;">
                        <input type="date" id="endDate">
                    </div>
                </div>
                
                <div class="option-group">
                    <h4>📊 Contenuto</h4>
                    <label>
                        <input type="checkbox" name="content" value="stats" checked>
                        Statistiche mensili
                    </label>
                    <label>
                        <input type="checkbox" name="content" value="photos" checked>
                        Indicatori foto
                    </label>
                    <label>
                        <input type="checkbox" name="content" value="notes" checked>
                        Note dei pasti
                    </label>
                    <label>
                        <input type="checkbox" name="content" value="emptyDays">
                        Giorni senza pasti
                    </label>
                </div>
                
                <div class="option-group">
                    <h4>🎨 Formato</h4>
                    <label>
                        <input type="radio" name="format" value="compact" checked>
                        Compatto (una pagina)
                    </label>
                    <label>
                        <input type="radio" name="format" value="detailed">
                        Dettagliato (più pagine)
                    </label>
                    <label>
                        <input type="radio" name="format" value="list">
                        Lista cronologica
                    </label>
                </div>
            </div>
            
            <div class="print-options-footer">
                <button class="cancel-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                    ❌ Annulla
                </button>
                <button class="preview-btn" onclick="generateCustomPreview()">
                    👁️ Anteprima
                </button>
                <button class="print-btn" onclick="executeCustomPrint()">
                    🖨️ Stampa
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
    
    // Aggiungi event listeners
    modal.addEventListener('change', function(e) {
        if (e.target.name === 'period') {
            const dateRange = modal.querySelector('.date-range');
            dateRange.style.display = e.target.value === 'range' ? 'block' : 'none';
        }
    });
    
    document.body.appendChild(modal);
    addPrintOptionsStyles();
}

function addPrintOptionsStyles() {
    if (document.querySelector('style[data-print-options]')) return;
    
    const style = document.createElement('style');
    style.setAttribute('data-print-options', 'true');
    style.textContent = `
        .print-options-modal .print-options-modal {
            background: white; border-radius: 15px; max-width: 500px; 
            width: 100%; max-height: 90vh; overflow-y: auto;
        }
        
        .print-options-header {
            padding: 20px 20px 0 20px; display: flex; 
            justify-content: space-between; align-items: center; 
            border-bottom: 1px solid #eee; margin-bottom: 20px;
        }
        
        .print-options-body {
            padding: 0 20px 20px 20px;
        }
        
        .option-group {
            margin-bottom: 25px;
        }
        
        .option-group h4 {
            margin: 0 0 10px 0; color: #333;
        }
        
        .option-group label {
            display: block; margin-bottom: 8px; 
            cursor: pointer; padding: 5px 0;
        }
        
        .option-group input[type="checkbox"], 
        .option-group input[type="radio"] {
            margin-right: 8px;
        }
        
        .print-options-footer {
            padding: 20px; border-top: 1px solid #eee; 
            display: flex; gap: 10px; justify-content: flex-end;
        }
        
        .print-options-footer button {
            padding: 10px 20px; border: none; border-radius: 8px; 
            cursor: pointer; font-weight: 600;
        }
        
        .cancel-btn { background: #6c757d; color: white; }
        .preview-btn { background: #00d2d3; color: white; }
        .print-btn { background: #27ae60; color: white; }
    `;
    
    document.head.appendChild(style);
}

function generateCustomPreview() {
    const modal = document.querySelector('.print-options-modal').parentElement;
    const options = gatherPrintOptions(modal);
    
    console.log('👁️ Generazione anteprima personalizzata:', options);
    
    // Chiudi modal
    modal.remove();
    
    // Genera anteprima basata sulle opzioni
    generatePreviewWithOptions(options);
    
    showNotification('👁️ Anteprima personalizzata generata', 'success');
}

function executeCustomPrint() {
    const modal = document.querySelector('.print-options-modal').parentElement;
    const options = gatherPrintOptions(modal);
    
    console.log('🖨️ Esecuzione stampa personalizzata:', options);
    
    // Chiudi modal
    modal.remove();
    
    // Genera e stampa
    generatePreviewWithOptions(options);
    setTimeout(() => {
        window.print();
    }, 500);
}

function gatherPrintOptions(modal) {
    return {
        period: modal.querySelector('input[name="period"]:checked').value,
        startDate: modal.querySelector('#startDate').value,
        endDate: modal.querySelector('#endDate').value,
        content: Array.from(modal.querySelectorAll('input[name="content"]:checked')).map(cb => cb.value),
        format: modal.querySelector('input[name="format"]:checked').value
    };
}

function generatePreviewWithOptions(options) {
    // TODO: Implementare generazione anteprima basata sulle opzioni personalizzate
    console.log('🔧 Funzione di anteprima personalizzata in sviluppo...');
    
    // Per ora, usa la generazione standard
    generatePrintPreview();
    
    showNotification('🔧 Opzioni personalizzate in arrivo! Usando formato standard.', 'info');
}

// Funzioni di utilità per la stampa
function optimizeForPrint() {
    // Ottimizza le dimensioni delle immagini per la stampa
    const images = document.querySelectorAll('#printContent img');
    images.forEach(img => {
        img.style.maxWidth = '20px';
        img.style.maxHeight = '20px';
        img.style.objectFit = 'cover';
    });
    
    console.log(`🔧 Ottimizzate ${images.length} immagini per la stampa`);
}

function resetPrintOptimization() {
    // Ripristina le dimensioni originali delle immagini
    const images = document.querySelectorAll('#printContent img');
    images.forEach(img => {
        img.style.maxWidth = '';
        img.style.maxHeight = '';
        img.style.objectFit = '';
    });
    
    console.log('🔄 Reset ottimizzazioni stampa');
}

// Event listeners per la stampa
function setupPrintEventListeners() {
    // Prima della stampa
    window.addEventListener('beforeprint', function() {
        console.log('🖨️ Preparazione stampa...');
        optimizeForPrint();
    });
    
    // Dopo la stampa
    window.addEventListener('afterprint', function() {
        console.log('✅ Stampa completata');
        resetPrintOptimization();
        showNotification('✅ Stampa completata!', 'success');
    });
    
    console.log('🎯 Event listeners stampa configurati');
}