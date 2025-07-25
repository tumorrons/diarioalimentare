# 🍽️ Diario Alimentare

Un'applicazione web moderna per tracciare i tuoi pasti quotidiani con foto e note dettagliate.

## ✨ Caratteristiche

### 📱 **Interfaccia Mobile-First**
- Design responsive ottimizzato per smartphone
- Touch gestures e swipe navigation
- Supporto PWA (Progressive Web App)
- Interface ottimizzata per dispositivi touch

### 🍎 **Gestione Pasti**
- Registrazione rapida di colazione, pranzo, cena e snack
- Aggiunta di note dettagliate per ogni pasto
- Navigazione semplice tra i giorni
- Modifica e cancellazione pasti esistenti

### 📸 **Gestione Foto**
- Foto "prima" e "dopo" per ogni pasto
- Compressione automatica delle immagini
- Ottimizzazione dello spazio di archiviazione
- Visualizzazione full-screen delle foto

### 📚 **Archivio Completo**
- Vista cronologica di tutti i pasti
- Filtri per mese, tipo di pasto e ricerca testuale
- Statistiche dettagliate
- Esportazione singoli giorni

### 💾 **Backup e Sincronizzazione**
- Backup automatici giornalieri
- Esportazione dati in formato JSON
- Ripristino con modalità intelligente
- Gestione duplicati automatica

### 🖨️ **Stampa Ottimizzata**
- Layout mensile compatto
- Indicatori foto colorati (invece di immagini)
- Ottimizzazione per risparmio inchiostro
- Formato A4 professionale

## 🗂️ Struttura del Progetto

```
diario-alimentare/
├── index.html              # File principale HTML
├── css/
│   ├── main.css            # Stili principali
│   ├── mobile.css          # Stili responsive
│   └── print.css           # Stili per la stampa
├── js/
│   ├── app.js              # Logica principale
│   ├── meals.js            # Gestione pasti
│   ├── photos.js           # Gestione foto
│   ├── navigation.js       # Navigazione tra viste
│   ├── archive.js          # Funzionalità archivio
│   ├── backup.js           # Import/Export dati
│   ├── print.js            # Generazione stampe
│   └── storage.js          # Gestione localStorage
└── README.md               # Questa documentazione
```

## 🚀 Installazione e Setup

### Metodo 1: Download Diretto
1. Scarica tutti i files nella stessa cartella
2. Apri `index.html` in un browser moderno
3. L'app funziona completamente offline!

### Metodo 2: Server Locale
```bash
# Se hai Python installato
python -m http.server 8000

# Se hai Node.js installato
npx serve .

# Poi vai su http://localhost:8000
```

### Metodo 3: Hosting Web
Carica tutti i files su qualsiasi servizio di hosting statico:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

## 📖 Guida all'Uso

### **Primo Avvio**
1. Apri l'app nel browser
2. Inizia aggiungendo il tuo primo pasto
3. Seleziona il tipo (colazione, pranzo, cena, snack)
4. Inserisci il nome del cibo
5. Aggiungi note opzionali
6. Scatta foto prima e dopo (opzionale)
7. Salva il pasto

### **Navigazione**
- **Frecce laterali**: Cambia giorno
- **Archivio**: Visualizza tutti i pasti passati
- **Backup**: Scarica/ripristina i tuoi dati
- **Stampa**: Genera report mensili

### **Shortcuts Tastiera**
- `H` - Home (vista principale)
- `A` - Archivio
- `B` - Backup
- `P` - Stampa
- `ESC` - Torna indietro
- `←` `→` - Cambia giorno (solo in home)

### **Gestione Swipe (Mobile)**
- Swipe destro: Giorno precedente
- Swipe sinistro: Giorno successivo

## ⚙️ Configurazione Avanzata

### **Compressione Foto**
Le foto vengono automaticamente compresse per ottimizzare lo spazio:
- Dimensione massima: 600x600px
- Qualità JPEG: 70%
- Formato di output: JPEG

### **Storage Browser**
L'app utilizza localStorage per salvare:
- Tutti i pasti e le foto
- Impostazioni utente
- Backup automatici (ultimi 7 giorni)

### **Gestione Memoria**
Se lo spazio si esaurisce, l'app:
1. Propone compressione automatica
2. Suggerisce backup dei dati
3. Mantiene backup di emergenza

## 🔧 Personalizzazione

### **Modifica Colori**
Edita `css/main.css` e cerca le variabili colore:
```css
/* Colore principale */
background: linear-gradient(45deg, #667eea, #764ba2);

/* Colori pulsanti */
.archive-btn { background: linear-gradient(45deg, #ff6b6b, #ee5a24); }
.backup-btn { background: linear-gradient(45deg, #00d2d3, #54a0ff); }
.print-btn { background: linear-gradient(45deg, #5f27cd, #341f97); }
```

### **Aggiungere Nuovi Tipi Pasto**
In `js/meals.js`, modifica la funzione `getMealTypeIcon()`:
```javascript
function getMealTypeIcon(type) {
    const icons = {
        'colazione': '🌅',
        'pranzo': '☀️',
        'cena': '🌙',
        'snack': '🍎',
        'merenda': '🧁',  // Nuovo tipo
        'aperitivo': '🍹' // Nuovo tipo
    };
    return icons[type] || '🍽️';
}
```

### **Personalizzare Layout Stampa**
Modifica `css/print.css` per cambiare:
- Dimensioni celle: `.print-day-cell { width: 25mm; }`
- Altezza righe: `.print-day-row { height: 15mm; }`
- Font size: `font-size: 7px;`

## 🛠️ API e Estensioni

### **Struttura Dati Pasto**
```javascript
{
    id: 1234567890,           // Timestamp univoco
    type: 'colazione',        // Tipo pasto
    food: 'Pasta al pomodoro', // Nome cibo
    notes: 'Molto buona!',    // Note opzionali
    photoBefore: 'data:image/jpeg;base64,...', // Foto prima
    photoAfter: 'data:image/jpeg;base64,...',  // Foto dopo
    time: '13:30',            // Ora del pasto
    date: '25/07/2025'        // Data italiana
}
```

### **Eventi Custom**
L'app emette eventi personalizzati:
```javascript
// Ascolta quando un pasto viene aggiunto
document.addEventListener('mealAdded', function(e) {
    console.log('Nuovo pasto:', e.detail.meal);
});

// Ascolta quando i dati vengono salvati
document.addEventListener('dataSaved', function(e) {
    console.log('Dati salvati:', e.detail.count);
});
```

### **Estensioni Possibili**
- **Conteggio calorie**: Integrazione con database nutrizionali
- **Condivisione social**: Export su Instagram/Facebook
- **Analisi AI**: Riconoscimento automatico cibi dalle foto
- **Sincronizzazione cloud**: Backup su Google Drive/Dropbox
- **Promemoria**: Notifiche per registrare pasti

## 📊 Statistiche e Analytics

### **Metriche Automatiche**
L'app traccia automaticamente:
- Numero totale pasti
- Pasti per giorno/settimana/mese
- Tipi di pasto più frequenti
- Giorni con più/meno pasti
- Numero di foto scattate

### **Esportazione Dati**
I backup includono metadati utili:
```javascript
{
    version: '2.0',
    exportDate: '2025-07-25T10:30:00Z',
    stats: {
        totalMeals: 150,
        totalPhotos: 280,
        dateRange: { from: '2025-01-01', to: '2025-07-25' }
    },
    meals: [/* array pasti */],
    settings: {/* impostazioni utente */}
}
```

## 🔒 Privacy e Sicurezza

### **Dati Locali**
- **Nessun server**: Tutti i dati restano sul tuo dispositivo
- **Nessun tracking**: Zero analytics o tracciamento
- **Nessuna registrazione**: Nessun account richiesto
- **Controllo totale**: Tu possiedi tutti i tuoi dati

### **Backup Sicuri**
- I backup sono file JSON leggibili
- Nessuna crittografia (per trasparenza)
- Raccomandato: Salva backup in cloud personali
- Possibilità di backup multipli

## 🐛 Troubleshooting

### **App Non Si Carica**
1. Verifica che JavaScript sia abilitato
2. Usa un browser moderno (Chrome 80+, Firefox 75+, Safari 13+)
3. Controlla la console per errori
4. Prova in modalità incognito

### **Foto Non Si Caricano**
1. Verifica permessi fotocamera
2. Controlla spazio disponibile
3. Prova con file più piccoli (<3MB)
4. Assicurati di usare formati supportati (JPG, PNG)

### **Backup Non Funziona**
1. Verifica permessi download
2. Controlla spazio disponibile sul dispositivo
3. Prova con browser diverso
4. Controlla console per errori JSON

### **Stampa Non Ottimale**
1. Usa browser Chrome per risultati migliori
2. Imposta margini "Minimi"
3. Abilita "Grafica di sfondo"
4. Seleziona formato A4

## 🆕 Cronologia Versioni

### **v2.0** (Attuale)
- ✨ Struttura modulare completa
- 📱 Design mobile ottimizzato
- 🖨️ Stampa professionale
- 💾 Backup intelligente
- 📸 Gestione foto avanzata

### **v1.0** (Precedente)
- 🍽️ Funzionalità base
- 📝 Registrazione pasti
- 📚 Archivio semplice
- 💾 Backup JSON

## 🤝 Contributi

### **Come Contribuire**
1. Fai un fork del progetto
2. Crea un branch per la tua feature
3. Testa le modifiche
4. Invia una pull request

### **Aree di Miglioramento**
- 🌍 Traduzione in altre lingue
- 📊 Grafici e statistiche avanzate
- 🔄 Sincronizzazione cloud
- 🤖 Intelligenza artificiale
- ♿ Miglioramenti accessibilità

## 📝 Licenza

Questo progetto è rilasciato sotto licenza MIT. Sei libero di:
- ✅ Usare commercialmente
- ✅ Modificare il codice
- ✅ Distribuire copie
- ✅ Usare privatamente

## 🆘 Supporto

### **Problemi e Bug**
- Apri una issue su GitHub
- Includi screenshot se possibile
- Specifica browser e versione
- Descrivi i passi per riprodurre

### **Richieste Feature**
- Proponi nuove funzionalità
- Spiega il caso d'uso
- Considera l'impatto sulle performance
- Valuta la compatibilità mobile

### **Contatti**
- 📧 Email: [il-tuo-email@example.com]
- 🐦 Twitter: [@il-tuo-handle]
- 💬 Discord: [server-discord]

---

**Fatto con ❤️ per aiutarti a tenere traccia della tua alimentazione in modo semplice e privato.**