// ===== ARCHIVE.JS - GESTIONE ARCHIVIO =====

function renderArchive() {
    const archiveList = document.getElementById('archiveList');
    
    console.log(`📚 Rendering archivio con ${meals.length} pasti totali`);
    
    // Raggruppa i pasti per data
    const mealsByDate = groupMealsByDate();
    const dates = getSortedDates(mealsByDate);

    if (dates.length === 0) {
        renderEmptyArchive(archiveList);
        return;
    }

    // Renderizza la lista dei giorni
    archiveList.innerHTML = `
        <div class="archive-header">
            <div class="archive-stats">
                ${renderArchiveStats(dates, mealsByDate)}
            </div>
            <div class="archive-filters">
                ${renderArchiveFilters()}
            </div>
        </div>
        <div class="archive-days">
            ${dates.map(dateStr => renderArchiveDay(dateStr, mealsByDate[dateStr])).join('')}
        </div>
    `;
    
    // Configura i filtri
    setupArchiveFilters();
}

function groupMealsByDate() {
    const mealsByDate = {};
    
    meals.forEach(meal => {
        if (!mealsByDate[meal.date]) {
            mealsByDate[meal.date] = [];
        }
        mealsByDate[meal.date].push(meal);
    });
    
    return mealsByDate;
}

function getSortedDates(mealsByDate) {
    return Object.keys(mealsByDate).sort((a, b) => {
        return new Date(b.split('/').reverse().join('/')) - new Date(a.split('/').reverse().join('/'));
    });
}

function renderEmptyArchive(container) {
    container.innerHTML = `
        <div class="empty-state">
            <div style="font-size: 48px; margin-bottom: 15px;">📅</div>
            <p>Nessun dato nell'archivio.<br>Inizia registrando i tuoi pasti!</p>
        </div>
    `;
}

function renderArchiveStats(dates, mealsByDate) {
    const totalDays = dates.length;
    const totalMeals = meals.length;
    const avgMealsPerDay = totalDays > 0 ? (totalMeals / totalDays).toFixed(1) : 0;
    
    // Calcola periodo
    const firstDate = new Date(dates[dates.length - 1].split('/').reverse().join('/'));
    const lastDate = new Date(dates[0].split('/').reverse().join('/'));
    const daysDiff = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Conta foto
    const photosCount = meals.reduce((count, meal) => {
        return count + (meal.photoBefore ? 1 : 0) + (meal.photoAfter ? 1 : 0);
    }, 0);
    
    return `
        <div class="stat-item">
            <div class="stat-number">${totalDays}</div>
            <div class="stat-label">Giorni Attivi</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${totalMeals}</div>
            <div class="stat-label">Pasti Totali</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${avgMealsPerDay}</div>
            <div class="stat-label">Media/Giorno</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${photosCount}</div>
            <div class="stat-label">Foto</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${daysDiff}</div>
            <div class="stat-label">Giorni Periodo</div>
        </div>
    `;
}

function renderArchiveFilters() {
    return `
        <div class="filter-group">
            <select id="monthFilter" onchange="filterArchive()">
                <option value="">Tutti i mesi</option>
                ${getAvailableMonths().map(month => 
                    `<option value="${month.value}">${month.label}</option>`
                ).join('')}
            </select>
            
            <select id="mealTypeFilter" onchange="filterArchive()">
                <option value="">Tutti i pasti</option>
                <option value="colazione">🌅 Colazione</option>
                <option value="pranzo">☀️ Pranzo</option>
                <option value="cena">🌙 Cena</option>
                <option value="snack">🍎 Snack</option>
            </select>
            
            <input type="text" id="searchFilter" placeholder="🔍 Cerca cibo..." onkeyup="filterArchive()">
        </div>
        
        <div class="view-options">
            <button class="view-btn ${getArchiveView() === 'list' ? 'active' : ''}" onclick="setArchiveView('list')">📋 Lista</button>
            <button class="view-btn ${getArchiveView() === 'calendar' ? 'active' : ''}" onclick="setArchiveView('calendar')">📅 Calendario</button>
            <button class="view-btn ${getArchiveView() === 'chart' ? 'active' : ''}" onclick="setArchiveView('chart')">📊 Grafici</button>
        </div>
    `;
}

function renderArchiveDay(dateStr, dayMeals) {
    const date = new Date(dateStr.split('/').reverse().join('/'));
    const isToday = getDateString(new Date()) === dateStr;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Raggruppa pasti per tipo
    const mealsByType = {};
    dayMeals.forEach(meal => {
        if (!mealsByType[meal.type]) {
            mealsByType[meal.type] = [];
        }
        mealsByType[meal.type].push(meal);
    });
    
    const mealTypes = Object.keys(mealsByType);
    const preview = mealTypes.map(type => getMealTypeIcon(type)).join(' ');
    const photoCount = dayMeals.reduce((count, meal) => 
        count + (meal.photoBefore ? 1 : 0) + (meal.photoAfter ? 1 : 0), 0);
    
    return `
        <div class="archive-day ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}" 
             onclick="showDayDetail('${dateStr}')" data-date="${dateStr}">
            <div class="archive-day-header">
                <div class="archive-date">
                    <span class="day-name">${date.toLocaleDateString('it-IT', { weekday: 'short' })}</span>
                    <span class="day-number">${date.getDate()}</span>
                    <span class="month-year">${date.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div class="archive-badges">
                    <div class="meal-count">${dayMeals.length} pasti</div>
                    ${photoCount > 0 ? `<div class="photo-count">📸 ${photoCount}</div>` : ''}
                </div>
            </div>
            <div class="archive-preview">
                <div class="meal-types">${preview}</div>
                <div class="meal-summary">${generateMealSummary(dayMeals)}</div>
            </div>
            <div class="archive-actions">
                <button class="quick-edit-btn" onclick="event.stopPropagation(); quickEditDay('${dateStr}')" title="Modifica rapida">✏️</button>
                <button class="export-day-btn" onclick="event.stopPropagation(); exportDay('${dateStr}')" title="Esporta giorno">📤</button>
            </div>
        </div>
    `;
}

function generateMealSummary(dayMeals) {
    if (dayMeals.length <= 3) {
        return dayMeals.map(meal => meal.food).join(', ');
    } else {
        return dayMeals.slice(0, 2).map(meal => meal.food).join(', ') + ` e altri ${dayMeals.length - 2}...`;
    }
}

function getAvailableMonths() {
    const monthsSet = new Set();
    
    meals.forEach(meal => {
        const date = new Date(meal.date.split('/').reverse().join('/'));
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
        monthsSet.add(monthKey);
    });
    
    return Array.from(monthsSet).sort().reverse().map(monthKey => {
        const date = new Date(monthKey + '-01');
        return {
            value: monthKey,
            label: date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
        };
    });
}

function setupArchiveFilters() {
    // Aggiungi stili per i filtri se non esistono
    if (!document.querySelector('style[data-archive-filters]')) {
        const style = document.createElement('style');
        style.setAttribute('data-archive-filters', 'true');
        style.textContent = `
            .archive-header {
                background: white;
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .archive-stats {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .stat-item {
                text-align: center;
            }
            
            .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: #667eea;
            }
            
            .stat-label {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
            }
            
            .archive-filters {
                border-top: 1px solid #eee;
                padding-top: 15px;
            }
            
            .filter-group {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .filter-group select, .filter-group input {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 14px;
            }
            
            .view-options {
                display: flex;
                gap: 5px;
            }
            
            .view-btn {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s;
            }
            
            .view-btn.active {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }
            
            .archive-day.today {
                border-left-color: #27ae60 !important;
                background: rgba(39, 174, 96, 0.05);
            }
            
            .archive-day.weekend {
                background: rgba(255, 193, 7, 0.05);
            }
            
            .archive-day-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 10px;
            }
            
            .archive-date {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }
            
            .day-name {
                font-size: 12px;
                color: #666;
                text-transform: uppercase;
            }
            
            .day-number {
                font-size: 18px;
                font-weight: bold;
                color: #333;
            }
            
            .month-year {
                font-size: 11px;
                color: #999;
            }
            
            .archive-badges {
                display: flex;
                flex-direction: column;
                gap: 5px;
                align-items: flex-end;
            }
            
            .photo-count {
                background: #ff9ff3;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 600;
            }
            
            .archive-preview {
                margin-bottom: 10px;
            }
            
            .meal-types {
                font-size: 18px;
                margin-bottom: 5px;
            }
            
            .meal-summary {
                font-size: 13px;
                color: #666;
                line-height: 1.3;
            }
            
            .archive-actions {
                display: flex;
                gap: 5px;
                justify-content: flex-end;
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .archive-day:hover .archive-actions {
                opacity: 1;
            }
            
            .quick-edit-btn, .export-day-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 5px 8px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s;
            }
            
            .export-day-btn {
                background: #00d2d3;
            }
            
            .quick-edit-btn:hover, .export-day-btn:hover {
                transform: scale(1.1);
            }
            
            @media (max-width: 480px) {
                .archive-stats {
                    grid-template-columns: repeat(3, 1fr);
                }
                
                .filter-group {
                    grid-template-columns: 1fr;
                }
                
                .archive-day-header {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .archive-badges {
                    flex-direction: row;
                    align-items: center;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function filterArchive() {
    const monthFilter = document.getElementById('monthFilter')?.value || '';
    const mealTypeFilter = document.getElementById('mealTypeFilter')?.value || '';
    const searchFilter = document.getElementById('searchFilter')?.value.toLowerCase() || '';
    
    console.log(`🔍 Filtro archivio: mese=${monthFilter}, tipo=${mealTypeFilter}, ricerca="${searchFilter}"`);
    
    const archiveDays = document.querySelectorAll('.archive-day');
    let visibleCount = 0;
    
    archiveDays.forEach(dayElement => {
        const dateStr = dayElement.dataset.date;
        const date = new Date(dateStr.split('/').reverse().join('/'));
        const dayMeals = meals.filter(meal => meal.date === dateStr);
        
        let shouldShow = true;
        
        // Filtro mese
        if (monthFilter) {
            const monthKey = date.toISOString().slice(0, 7);
            if (monthKey !== monthFilter) {
                shouldShow = false;
            }
        }
        
        // Filtro tipo pasto
        if (mealTypeFilter && shouldShow) {
            const hasType = dayMeals.some(meal => meal.type === mealTypeFilter);
            if (!hasType) {
                shouldShow = false;
            }
        }
        
        // Filtro ricerca
        if (searchFilter && shouldShow) {
            const hasMatch = dayMeals.some(meal => 
                meal.food.toLowerCase().includes(searchFilter) ||
                (meal.notes && meal.notes.toLowerCase().includes(searchFilter))
            );
            if (!hasMatch) {
                shouldShow = false;
            }
        }
        
        dayElement.style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) visibleCount++;
    });
    
    // Mostra messaggio se nessun risultato
    updateFilterResults(visibleCount);
}

function updateFilterResults(count) {
    let noResults = document.getElementById('noFilterResults');
    
    if (count === 0) {
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.id = 'noFilterResults';
            noResults.className = 'empty-state';
            noResults.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 15px;">🔍</div>
                <p>Nessun risultato trovato.<br>Prova a modificare i filtri di ricerca.</p>
                <button onclick="clearArchiveFilters()" style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Cancella Filtri</button>
            `;
            document.querySelector('.archive-days').appendChild(noResults);
        }
        noResults.style.display = 'block';
    } else {
        if (noResults) {
            noResults.style.display = 'none';
        }
    }
}

function clearArchiveFilters() {
    document.getElementById('monthFilter').value = '';
    document.getElementById('mealTypeFilter').value = '';
    document.getElementById('searchFilter').value = '';
    filterArchive();
}

function getArchiveView() {
    return localStorage.getItem('archiveView') || 'list';
}

function setArchiveView(view) {
    localStorage.setItem('archiveView', view);
    
    // Aggiorna pulsanti
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Implementa le diverse viste
    switch (view) {
        case 'calendar':
            renderCalendarView();
            break;
        case 'chart':
            renderChartView();
            break;
        default:
            renderArchive(); // Lista normale
    }
    
    console.log(`📊 Vista archivio cambiata: ${view}`);
}

function renderCalendarView() {
    // TODO: Implementare vista calendario
    showNotification('📅 Vista calendario in arrivo!', 'info');
}

function renderChartView() {
    // TODO: Implementare vista grafici
    showNotification('📊 Vista grafici in arrivo!', 'info');
}

function quickEditDay(dateStr) {
    console.log(`✏️ Modifica rapida giorno: ${dateStr}`);
    
    // Imposta la data e mostra la vista principale
    const date = new Date(dateStr.split('/').reverse().join('/'));
    currentDate = date;
    showMain();
    
    showNotification(`📝 Modifica il ${formatDate(date)}`, 'info');
}

function exportDay(dateStr) {
    const dayMeals = meals.filter(meal => meal.date === dateStr);
    
    if (dayMeals.length === 0) {
        showNotification('⚠️ Nessun pasto da esportare per questo giorno', 'info');
        return;
    }
    
    const exportData = {
        date: dateStr,
        meals: dayMeals,
        exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `diario-${dateStr.replace(/\//g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`📤 Esportato giorno: ${dateStr}`);
    showNotification(`📤 Giorno ${dateStr} esportato!`, 'success');
}

function renderDayDetail(dateStr) {
    const dayDetailMeals = document.getElementById('dayDetailMeals');
    const dayDetailTitle = document.getElementById('dayDetailTitle');
    
    const dayMeals = meals.filter(meal => meal.date === dateStr);
    const date = new Date(dateStr.split('/').reverse().join('/'));
    
    console.log(`📖 Rendering dettaglio giorno ${dateStr} con ${dayMeals.length} pasti`);
    
    dayDetailTitle.textContent = `📖 ${formatDate(date)}`;
    
    if (dayMeals.length === 0) {
        dayDetailMeals.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 48px; margin-bottom: 15px;">🍽️</div>
                <p>Nessun pasto registrato per questo giorno.</p>
                <button onclick="quickEditDay('${dateStr}')" style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    ➕ Aggiungi Pasto
                </button>
            </div>
        `;
        return;
    }

    // Ordina pasti per ora
    dayMeals.sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });

    dayDetailMeals.innerHTML = `
        <div class="day-summary">
            <div class="day-stats">
                <div class="stat">
                    <span class="stat-number">${dayMeals.length}</span>
                    <span class="stat-label">Pasti</span>
                </div>
                <div class="stat">
                    <span class="stat-number">${dayMeals.reduce((count, meal) => 
                        count + (meal.photoBefore ? 1 : 0) + (meal.photoAfter ? 1 : 0), 0)}</span>
                    <span class="stat-label">Foto</span>
                </div>
                <div class="stat">
                    <span class="stat-number">${[...new Set(dayMeals.map(meal => meal.type))].length}</span>
                    <span class="stat-label">Tipi</span>
                </div>
            </div>
            <div class="day-actions">
                <button onclick="exportDay('${dateStr}')" class="action-btn">📤 Esporta</button>
                <button onclick="quickEditDay('${dateStr}')" class="action-btn">✏️ Modifica</button>
            </div>
        </div>
        ${dayMeals.map(meal => `
            <div class="meal-entry">
                <div class="meal-header">
                    <span class="meal-type-badge">${getMealTypeIcon(meal.type)} ${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</span>
                    <div class="meal-actions">
                        <span class="meal-time">${meal.time}</span>
                        <button class="edit-btn" onclick="editMeal(${meal.id})">✏️</button>
                        <button class="delete-btn" onclick="deleteMeal(${meal.id}); renderDayDetail('${dateStr}')">🗑️</button>
                    </div>
                </div>
                <div class="meal-food">${meal.food}</div>
                ${meal.notes ? `<div class="meal-notes">${meal.notes}</div>` : ''}
                ${renderMealPhotos(meal)}
            </div>
        `).join('')}
    `;
}