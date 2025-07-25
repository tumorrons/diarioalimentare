// ===== PHOTOS.JS - GESTIONE FOTO =====

let currentPhotoBefore = null;
let currentPhotoAfter = null;

// Configurazione compressione foto
const PHOTO_CONFIG = {
    maxWidth: 600,
    maxHeight: 600,
    quality: 0.7,
    maxFileSize: 3 * 1024 * 1024 // 3MB
};

function setupPhotoHandlers() {
    // Gestione foto prima
    document.getElementById('photoBeforeInput').addEventListener('change', function(e) {
        handlePhotoInput(e, 'before');
    });

    // Gestione foto dopo
    document.getElementById('photoAfterInput').addEventListener('change', function(e) {
        handlePhotoInput(e, 'after');
    });
    
    console.log('📸 Photo handlers configurati');
}

function handlePhotoInput(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    console.log(`📷 Elaborazione foto ${type}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Verifica dimensione file
    if (file.size > PHOTO_CONFIG.maxFileSize) {
        alert(`⚠️ Foto troppo grande! Massimo ${PHOTO_CONFIG.maxFileSize / 1024 / 1024}MB.`);
        event.target.value = '';
        return;
    }

    // Verifica tipo file
    if (!file.type.startsWith('image/')) {
        alert('⚠️ Seleziona solo file immagine!');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const originalPhoto = e.target.result;
        
        // Mostra loading
        showPhotoLoading(type);
        
        // Comprimi la foto
        compressPhoto(originalPhoto, (compressedPhoto) => {
            if (type === 'before') {
                currentPhotoBefore = compressedPhoto;
                updatePhotoPreview('photoBeforePreview', compressedPhoto, 'Prima di mangiare');
            } else {
                currentPhotoAfter = compressedPhoto;
                updatePhotoPreview('photoAfterPreview', compressedPhoto, 'Dopo aver mangiato');
            }
            
            console.log(`✅ Foto ${type} elaborata e salvata`);
        });
    };
    
    reader.onerror = function() {
        console.error(`❌ Errore nella lettura della foto ${type}`);
        alert('❌ Errore nella lettura del file');
    };
    
    reader.readAsDataURL(file);
}

function compressPhoto(photoDataUrl, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        // Calcola nuove dimensioni mantenendo le proporzioni
        let { width, height } = img;
        const { maxWidth, maxHeight } = PHOTO_CONFIG;
        
        if (width > height) {
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Disegna l'immagine ridimensionata con qualità ottimizzata
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Comprimi con qualità configurabile
        const compressedDataUrl = canvas.toDataURL('image/jpeg', PHOTO_CONFIG.quality);
        
        // Calcola riduzione dimensioni
        const originalSize = photoDataUrl.length;
        const compressedSize = compressedDataUrl.length;
        const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
        
        console.log(`🗜️ Compressione: ${reduction}% riduzione dimensioni`);
        
        callback(compressedDataUrl);
    };
    
    img.onerror = function() {
        console.error('❌ Errore nel caricamento immagine per compressione');
        callback(photoDataUrl); // Fallback all'originale
    };
    
    img.src = photoDataUrl;
}

function updatePhotoPreview(previewId, photoData, label) {
    const preview = document.getElementById(previewId);
    
    if (photoData) {
        preview.innerHTML = `
            <img src="${photoData}" alt="${label}" style="max-width: 100%; max-height: 120px; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.2);">
            <div class="photo-preview-label">${label}</div>
            <button class="remove-photo-btn" onclick="removePhoto('${previewId.includes('Before') ? 'before' : 'after'}')" title="Rimuovi foto">🗑️</button>
        `;
        
        // Stile per il pulsante rimuovi
        const removeBtn = preview.querySelector('.remove-photo-btn');
        removeBtn.style.cssText = `
            position: absolute; top: 5px; right: 5px; 
            background: rgba(255, 71, 87, 0.8); color: white; 
            border: none; border-radius: 50%; width: 25px; height: 25px; 
            cursor: pointer; font-size: 12px; display: none;
        `;
        
        // Mostra il pulsante al hover
        preview.style.position = 'relative';
        preview.onmouseenter = () => removeBtn.style.display = 'block';
        preview.onmouseleave = () => removeBtn.style.display = 'none';
        
    } else {
        preview.innerHTML = `<div class="photo-preview-label">${label}</div>`;
        preview.style.position = 'static';
        preview.onmouseenter = null;
        preview.onmouseleave = null;
    }
}

function showPhotoLoading(type) {
    const previewId = type === 'before' ? 'photoBeforePreview' : 'photoAfterPreview';
    const label = type === 'before' ? 'Prima di mangiare' : 'Dopo aver mangiato';
    
    document.getElementById(previewId).innerHTML = `
        <div class="photo-loading">
            <div class="spinner" style="
                border: 3px solid #f3f3f3; border-top: 3px solid #667eea; 
                border-radius: 50%; width: 30px; height: 30px; 
                animation: spin 1s linear infinite; margin: 0 auto 10px;
            "></div>
            <div class="photo-preview-label">Elaborazione ${label.toLowerCase()}...</div>
        </div>
    `;
    
    // Aggiungi animazione spinner se non esiste
    if (!document.querySelector('style[data-spinner]')) {
        const style = document.createElement('style');
        style.setAttribute('data-spinner', 'true');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

function removePhoto(type) {
    if (type === 'before') {
        currentPhotoBefore = null;
        updatePhotoPreview('photoBeforePreview', null, 'Prima di mangiare');
        document.getElementById('photoBeforeInput').value = '';
        console.log('🗑️ Foto prima rimossa');
    } else {
        currentPhotoAfter = null;
        updatePhotoPreview('photoAfterPreview', null, 'Dopo aver mangiato');
        document.getElementById('photoAfterInput').value = '';
        console.log('🗑️ Foto dopo rimossa');
    }
}

function clearPhotos() {
    currentPhotoBefore = null;
    currentPhotoAfter = null;
    console.log('🧹 Foto pulite');
}

// Getter/Setter per le foto correnti
function getCurrentPhotoBefore() {
    return currentPhotoBefore;
}

function getCurrentPhotoAfter() {
    return currentPhotoAfter;
}

function setCurrentPhotoBefore(photo) {
    currentPhotoBefore = photo;
}

function setCurrentPhotoAfter(photo) {
    currentPhotoAfter = photo;
}

// Funzioni per la gestione batch delle foto
function compressAllMealPhotos() {
    return new Promise((resolve) => {
        let processed = 0;
        let totalPhotos = 0;
        
        // Conta le foto totali
        meals.forEach(meal => {
            if (meal.photoBefore) totalPhotos++;
            if (meal.photoAfter) totalPhotos++;
        });
        
        if (totalPhotos === 0) {
            resolve(0);
            return;
        }
        
        console.log(`🗜️ Avvio compressione di ${totalPhotos} foto...`);
        
        meals.forEach(meal => {
            if (meal.photoBefore) {
                compressPhoto(meal.photoBefore, (compressed) => {
                    meal.photoBefore = compressed;
                    processed++;
                    if (processed === totalPhotos) resolve(processed);
                });
            }
            
            if (meal.photoAfter) {
                compressPhoto(meal.photoAfter, (compressed) => {
                    meal.photoAfter = compressed;
                    processed++;
                    if (processed === totalPhotos) resolve(processed);
                });
            }
        });
    });
}

// Utility per convertire foto in diversi formati
function convertPhotoFormat(photoDataUrl, format = 'jpeg', quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Per PNG, riempi lo sfondo di bianco
            if (format === 'png') {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            ctx.drawImage(img, 0, 0);
            
            const mimeType = `image/${format}`;
            const convertedDataUrl = canvas.toDataURL(mimeType, quality);
            resolve(convertedDataUrl);
        };
        
        img.src = photoDataUrl;
    });
}

// Analisi foto per statistiche
function getPhotosStats() {
    let beforeCount = 0;
    let afterCount = 0;
    let totalSize = 0;
    
    meals.forEach(meal => {
        if (meal.photoBefore) {
            beforeCount++;
            totalSize += meal.photoBefore.length;
        }
        if (meal.photoAfter) {
            afterCount++;
            totalSize += meal.photoAfter.length;
        }
    });
    
    return {
        beforeCount,
        afterCount,
        totalCount: beforeCount + afterCount,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        averageSizeKB: beforeCount + afterCount > 0 ? 
            ((totalSize / (beforeCount + afterCount)) / 1024).toFixed(1) : 0
    };
}