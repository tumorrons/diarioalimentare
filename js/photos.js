// ===== PHOTOS.JS - GESTIONE FOTO (WEBVIEW ANDROID FIX) =====

let currentPhotoBefore = null;
let currentPhotoAfter = null;

// Configurazione compressione foto
const PHOTO_CONFIG = {
    maxWidth: 600,
    maxHeight: 600,
    quality: 0.7,
    maxFileSize: 3 * 1024 * 1024 // 3MB
};

// Detecta se siamo in una WebView Android
function isAndroidWebView() {
    const ua = navigator.userAgent;
    return /Android/.test(ua) && /wv/.test(ua);
}

// Detecta se siamo in una app Android (anche senza wv flag)
function isAndroidApp() {
    const ua = navigator.userAgent;
    return /Android/.test(ua) && !ua.includes('Chrome/') && !ua.includes('Firefox/');
}

function setupPhotoHandlers() {
    // Gestione foto prima
    const photoBeforeInput = document.getElementById('photoBeforeInput');
    const photoAfterInput = document.getElementById('photoAfterInput');
    
    if (photoBeforeInput) {
        photoBeforeInput.addEventListener('change', function(e) {
            handlePhotoInput(e, 'before');
        });
    }

    if (photoAfterInput) {
        photoAfterInput.addEventListener('change', function(e) {
            handlePhotoInput(e, 'after');
        });
    }
    
    console.log('📸 Photo handlers configurati');
    console.log('🤖 Android WebView:', isAndroidWebView());
    console.log('📱 Android App:', isAndroidApp());
}

// Fix specifico per WebView Android
function triggerPhotoInput(type) {
    const inputId = type === 'before' ? 'photoBeforeInput' : 'photoAfterInput';
    const input = document.getElementById(inputId);
    
    if (!input) {
        console.error(`❌ Input foto ${type} non trovato`);
        return;
    }

    console.log(`📱 Trigger foto ${type} - WebView: ${isAndroidWebView()}`);

    // Per WebView Android, usa un approccio più diretto
    if (isAndroidWebView() || isAndroidApp()) {
        // Reset dell'input
        input.value = '';
        
        // Configura l'input per WebView
        input.style.position = 'fixed';
        input.style.top = '0';
        input.style.left = '0';
        input.style.width = '100%';
        input.style.height = '100%';
        input.style.opacity = '0';
        input.style.zIndex = '9999';
        input.style.display = 'block';
        input.style.pointerEvents = 'auto';
        
        // Focus prima del click (importante per WebView)
        input.focus();
        
        // Attendi un frame prima del click
        setTimeout(() => {
            // Crea evento sintetico
            const event = new Event('click', {
                bubbles: true,
                cancelable: true
            });
            
            input.dispatchEvent(event);
            
            // Se il primo metodo non funziona, prova il click diretto
            setTimeout(() => {
                input.click();
            }, 50);
            
            // Nascondi dopo il tentativo
            setTimeout(() => {
                input.style.display = 'none';
                input.style.position = '';
                input.style.zIndex = '';
                input.style.opacity = '';
                input.style.pointerEvents = '';
            }, 200);
        }, 100);
        
    } else {
        // Per browser normali, usa il metodo standard
        input.style.display = 'block';
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        input.style.opacity = '0';
        
        input.focus();
        input.click();
        
        setTimeout(() => {
            input.style.display = 'none';
        }, 100);
    }
    
    console.log(`📷 Tentativo attivazione input ${type} completato`);
}

// Metodo alternativo per WebView molto restrittive
function showPhotoInputOverlay(type) {
    const overlay = document.createElement('div');
    const inputId = type === 'before' ? 'photoBeforeInput' : 'photoAfterInput';
    const input = document.getElementById(inputId);
    
    overlay.innerHTML = `
        <div class="photo-overlay">
            <div class="photo-overlay-content">
                <h3>📷 Seleziona Foto</h3>
                <p>Tocca il pulsante qui sotto per ${type === 'before' ? 'foto prima' : 'foto dopo'}</p>
                <input type="file" accept="image/*" capture="environment" style="
                    width: 100%; 
                    height: 60px; 
                    font-size: 16px; 
                    padding: 10px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                ">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    margin-top: 15px; 
                    padding: 10px 20px; 
                    background: #6c757d; 
                    color: white; 
                    border: none; 
                    border-radius: 8px; 
                    cursor: pointer;
                ">Annulla</button>
            </div>
        </div>
    `;
    
    overlay.style.cssText = `
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%; 
        background: rgba(0,0,0,0.8); 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        z-index: 10000;
        padding: 20px;
    `;
    
    const content = overlay.querySelector('.photo-overlay-content');
    content.style.cssText = `
        background: white; 
        padding: 30px; 
        border-radius: 15px; 
        text-align: center; 
        max-width: 300px; 
        width: 100%;
    `;
    
    // Collega l'evento change al nuovo input
    const newInput = overlay.querySelector('input[type="file"]');
    newInput.addEventListener('change', function(e) {
        if (e.target.files[0]) {
            handlePhotoInput(e, type);
            overlay.remove();
        }
    });
    
    document.body.appendChild(overlay);
    
    console.log(`📱 Mostrato overlay foto per ${type}`);
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
            
            // Mostra notifica specifica per WebView
            if (isAndroidWebView()) {
                showNotification(`📷 Foto ${type} aggiunta!`, 'success');
            }
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
        if (removeBtn) {
            removeBtn.style.cssText = `
                position: absolute; top: 5px; right: 5px; 
                background: rgba(255, 71, 87, 0.8); color: white; 
                border: none; border-radius: 50%; width: 25px; height: 25px; 
                cursor: pointer; font-size: 12px; display: none;
            `;
        }
        
        // Mostra il pulsante al hover (desktop) o touch (mobile)
        preview.style.position = 'relative';
        preview.onmouseenter = () => {
            if (removeBtn) removeBtn.style.display = 'block';
        };
        preview.onmouseleave = () => {
            if (removeBtn) removeBtn.style.display = 'none';
        };
        preview.ontouchstart = () => {
            if (removeBtn) removeBtn.style.display = 'block';
        };
        
    } else {
        preview.innerHTML = `<div class="photo-preview-label">${label}</div>`;
        preview.style.position = 'static';
        preview.onmouseenter = null;
        preview.onmouseleave = null;
        preview.ontouchstart = null;
    }
}

function showPhotoLoading(type) {
    const previewId = type === 'before' ? 'photoBeforePreview' : 'photoAfterPreview';
    const label = type === 'before' ? 'Prima di mangiare' : 'Dopo aver mangiato';
    
    const preview = document.getElementById(previewId);
    if (preview) {
        preview.innerHTML = `
            <div class="photo-loading">
                <div class="spinner" style="
                    border: 3px solid #f3f3f3; border-top: 3px solid #667eea; 
                    border-radius: 50%; width: 30px; height: 30px; 
                    animation: spin 1s linear infinite; margin: 0 auto 10px;
                "></div>
                <div class="photo-preview-label">Elaborazione ${label.toLowerCase()}...</div>
            </div>
        `;
    }
    
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
        const input = document.getElementById('photoBeforeInput');
        if (input) input.value = '';
        console.log('🗑️ Foto prima rimossa');
    } else {
        currentPhotoAfter = null;
        updatePhotoPreview('photoAfterPreview', null, 'Dopo aver mangiato');
        const input = document.getElementById('photoAfterInput');
        if (input) input.value = '';
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

// Funzione di debug per WebView
function debugPhotoInputs() {
    const beforeInput = document.getElementById('photoBeforeInput');
    const afterInput = document.getElementById('photoAfterInput');
    
    console.log('🔍 Debug Photo Inputs:');
    console.log('- Before input exists:', !!beforeInput);
    console.log('- After input exists:', !!afterInput);
    console.log('- Before input accept:', beforeInput?.accept);
    console.log('- After input accept:', afterInput?.accept);
    console.log('- User Agent:', navigator.userAgent);
    console.log('- Is WebView:', isAndroidWebView());
    console.log('- Is Android App:', isAndroidApp());
    
    // Test click su input
    if (beforeInput) {
        console.log('🧪 Test click input before...');
        beforeInput.click();
    }
}

// Fallback per WebView molto restrittive - mostra pulsante alternativo
function addWebViewPhotoFallback() {
    if (isAndroidWebView() || isAndroidApp()) {
        const photoSection = document.querySelector('.photo-section');
        if (photoSection && !document.getElementById('webview-photo-fallback')) {
            const fallbackDiv = document.createElement('div');
            fallbackDiv.id = 'webview-photo-fallback';
            fallbackDiv.innerHTML = `
                <div style="margin-top: 15px; padding: 15px; background: #fff3cd; border-radius: 10px; text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #856404;">
                        <strong>📱 Modalità WebView Android</strong><br>
                        Se i pulsanti foto non funzionano, usa questi:
                    </p>
                    <button onclick="showPhotoInputOverlay('before')" style="
                        margin: 5px; padding: 8px 15px; background: #4CAF50; color: white; 
                        border: none; border-radius: 8px; cursor: pointer;
                    ">📷 Foto Prima (Alt)</button>
                    <button onclick="showPhotoInputOverlay('after')" style="
                        margin: 5px; padding: 8px 15px; background: #ff9ff3; color: white; 
                        border: none; border-radius: 8px; cursor: pointer;
                    ">📸 Foto Dopo (Alt)</button>
                </div>
            `;
            photoSection.appendChild(fallbackDiv);
            console.log('📱 Aggiunto fallback WebView per foto');
        }
    }
}

// Funzioni per la gestione batch delle foto (mantenute dall'originale)
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