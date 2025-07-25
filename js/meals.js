// ===== MEALS.JS - GESTIONE PASTI =====

function addMeal() {
    const foodName = document.getElementById('foodName').value.trim();
    
    if (!foodName) {
        alert('⚠️ Inserisci il nome del cibo!');
        return;
    }

    const meal = {
        id: Date.now(),
        type: selectedMealType,
        food: foodName,
        notes: document.getElementById('foodNotes').value.trim(),
        photoBefore: getCurrentPhotoBefore(),
        photoAfter: getCurrentPhotoAfter(),
        time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        date: getDateString(currentDate)
    };

    meals.unshift(meal);
    saveMeals();
    renderMeals();
    clearForm();
    
    console.log(`➕ Pasto aggiunto: ${meal.food} (${meal.type})`);
    
    // Feedback visivo
    showNotification('✅ Pasto aggiunto con successo!', 'success');
}

function saveMeal() {
    if (editingMealId) {
        updateMeal();
    } else {
        addMeal();
    }
}

function editMeal(mealId) {
    const meal = meals.find(m => m.id === mealId);
    if (!meal) {
        console.error('❌ Pasto non trovato:', mealId);
        return;
    }

    console.log(`✏️ Modifica pasto: ${meal.food}`);

    // Popola il form con i dati del pasto
    document.getElementById('foodName').value = meal.food;
    document.getElementById('foodNotes').value = meal.notes || '';
    
    // Imposta il tipo di pasto
    document.querySelectorAll('.meal-type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === meal.type) {
            btn.classList.add('active');
            selectedMealType = meal.type;
        }
    });

    // Carica le foto esistenti
    setCurrentPhotoBefore(meal.photoBefore);
    setCurrentPhotoAfter(meal.photoAfter);
    
    updatePhotoPreview('photoBeforePreview', meal.photoBefore, 'Prima di mangiare');
    updatePhotoPreview('photoAfterPreview', meal.photoAfter, 'Dopo aver mangiato');

    // Imposta la data del pasto per la modifica
    const mealDate = new Date(meal.date.split('/').reverse().join('/'));
    currentDate = mealDate;
    updateCurrentDate();

    // Cambia modalità interfaccia
    editingMealId = mealId;
    document.querySelector('.add-btn').style.display = 'none';
    document.getElementById('updateBtn').style.display = 'block';
    document.getElementById('cancelEditBtn').style.display = 'block';

    // Mostra la sezione di aggiunta/modifica se nascosta
    document.getElementById('addMealSection').style.display = 'block';

    // Torna alla vista principale se siamo in archivio
    if (document.getElementById('dayDetailView').classList.contains('active')) {
        showMain();
    }

    // Scroll verso l'alto per mostrare il form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateMeal() {
    const foodName = document.getElementById('foodName').value.trim();
    
    if (!foodName) {
        alert('⚠️ Inserisci il nome del cibo!');
        return;
    }

    const mealIndex = meals.findIndex(m => m.id === editingMealId);
    if (mealIndex === -1) {
        console.error('❌ Pasto da aggiornare non trovato');
        return;
    }

    // Aggiorna il pasto esistente
    meals[mealIndex] = {
        ...meals[mealIndex],
        type: selectedMealType,
        food: foodName,
        notes: document.getElementById('foodNotes').value.trim(),
        photoBefore: getCurrentPhotoBefore(),
        photoAfter: getCurrentPhotoAfter()
    };

    saveMeals();
    renderMeals();
    cancelEdit();
    
    console.log(`✅ Pasto aggiornato: ${foodName}`);
    showNotification('✅ Pasto aggiornato con successo!', 'success');
}

function cancelEdit() {
    console.log('❌ Modifica annullata');
    
    editingMealId = null;
    clearForm();
    
    // Ripristina l'interfaccia normale
    document.querySelector('.add-btn').style.display = 'block';
    document.getElementById('updateBtn').style.display = 'none';
    document.getElementById('cancelEditBtn').style.display = 'none';
    
    // Torna a oggi
    currentDate = new Date();
    changeDay(0);
}

function deleteMeal(id) {
    const meal = meals.find(m => m.id === id);
    if (!meal) {
        console.error('❌ Pasto da eliminare non trovato');
        return;
    }

    if (confirm(`🗑️ Sei sicuro di voler eliminare "${meal.food}"?`)) {
        meals = meals.filter(meal => meal.id !== id);
        saveMeals();
        renderMeals();
        
        console.log(`🗑️ Pasto eliminato: ${meal.food}`);
        showNotification('🗑️ Pasto eliminato', 'info');
    }
}

function renderMeals() {
    const mealsList = document.getElementById('mealsList');
    const currentDateStr = getDateString(currentDate);
    const dayMeals = meals.filter(meal => meal.date === currentDateStr);
    
    console.log(`🔄 Rendering ${dayMeals.length} pasti per ${currentDateStr}`);
    
    if (dayMeals.length === 0) {
        mealsList.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 48px; margin-bottom: 15px;">🍽️</div>
                <p>Nessun pasto registrato per questo giorno.<br>Inizia aggiungendo il tuo primo pasto!</p>
            </div>
        `;
        return;
    }

    // Ordina i pasti per ora (più recenti prima)
    dayMeals.sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return (timeB[0] * 60 + timeB[1]) - (timeA[0] * 60 + timeA[1]);
    });

    mealsList.innerHTML = dayMeals.map(meal => `
        <div class="meal-entry" data-meal-id="${meal.id}">
            <div class="meal-header">
                <span class="meal-type-badge">${getMealTypeIcon(meal.type)} ${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</span>
                <div class="meal-actions">
                    <span class="meal-time">${meal.time}</span>
                    <button class="edit-btn" onclick="editMeal(${meal.id})" title="Modifica pasto">✏️</button>
                    <button class="delete-btn" onclick="deleteMeal(${meal.id})" title="Elimina pasto">🗑️</button>
                </div>
            </div>
            <div class="meal-food">${meal.food}</div>
            ${meal.notes ? `<div class="meal-notes">${meal.notes}</div>` : ''}
            ${renderMealPhotos(meal)}
        </div>
    `).join('');
}

function renderMealPhotos(meal) {
    if (!meal.photoBefore && !meal.photoAfter) {
        return '';
    }

    return `
        <div class="meal-photos">
            ${meal.photoBefore ? `
                <div class="meal-photo-container">
                    <img src="${meal.photoBefore}" alt="Prima" class="meal-photo" onclick="showPhotoModal('${meal.photoBefore}', 'Prima di mangiare')">
                    <div class="meal-photo-label">Prima</div>
                </div>
            ` : '<div></div>'}
            ${meal.photoAfter ? `
                <div class="meal-photo-container">
                    <img src="${meal.photoAfter}" alt="Dopo" class="meal-photo" onclick="showPhotoModal('${meal.photoAfter}', 'Dopo aver mangiato')">
                    <div class="meal-photo-label">Dopo</div>
                </div>
            ` : '<div></div>'}
        </div>
    `;
}

function showPhotoModal(photoSrc, title) {
    // Crea modal per visualizzare la foto a schermo intero
    const modal = document.createElement('div');
    modal.className = 'photo-modal';
    modal.innerHTML = `
        <div class="photo-modal-content">
            <span class="photo-modal-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>${title}</h3>
            <img src="${photoSrc}" alt="${title}" style="max-width: 100%; max-height: 80vh; border-radius: 10px;">
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); display: flex; align-items: center; 
        justify-content: center; z-index: 1000; cursor: pointer;
    `;
    
    modal.querySelector('.photo-modal-content').style.cssText = `
        background: white; padding: 20px; border-radius: 15px; 
        text-align: center; max-width: 90%; max-height: 90%; 
        position: relative; cursor: default;
    `;
    
    modal.querySelector('.photo-modal-close').style.cssText = `
        position: absolute; top: 10px; right: 15px; 
        font-size: 24px; cursor: pointer; color: #666;
    `;
    
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    document.body.appendChild(modal);
}

// Funzione di notifica
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        padding: 15px 20px; border-radius: 10px; 
        color: white; font-weight: 600; z-index: 1000;
        transform: translateX(100%); transition: transform 0.3s;
        ${type === 'success' ? 'background: #27ae60;' : 
          type === 'error' ? 'background: #e74c3c;' : 
          'background: #3498db;'}
    `;
    
    document.body.appendChild(notification);
    
    // Anima l'entrata
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Rimuovi dopo 3 secondi
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}