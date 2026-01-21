import fs from 'fs';
import path from 'path';
import http from 'http';
import { ingredientsData } from '../data/ingredients';
import { translations } from './ingredient-translations';

const INGREDIENTS_FOLDER = path.join(process.cwd(), 'public', 'img', 'ingredients');
const PORT = 3001;

// Function to sanitize filename (all lowercase)
function sanitizeFilename(name: string): string {
  const sanitized = name
    .replace(/'/g, '')
    .replace(/\s+/g, '-')
    .replace(/[àáâãäåÀÁÂÃÄÅ]/g, 'a')
    .replace(/[èéêëÈÉÊË]/g, 'e')
    .replace(/[ìíîïÌÍÎÏ]/g, 'i')
    .replace(/[òóôõöÒÓÔÕÖ]/g, 'o')
    .replace(/[ùúûüÙÚÛÜ]/g, 'u')
    .replace(/[çÇ]/g, 'c')
    .replace(/[œŒ]/g, 'oe')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase();
  
  return sanitized;
}

// Get all image files sorted by creation date (oldest first)
function getImageFiles(): string[] {
  const files = fs.readdirSync(INGREDIENTS_FOLDER)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .filter(file => {
      // Only UUID-named files
      return file.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(jpg|jpeg|png|webp|gif)$/i);
    });
  
  // Sort by creation date (oldest first)
  return files.sort((a, b) => {
    const statA = fs.statSync(path.join(INGREDIENTS_FOLDER, a));
    const statB = fs.statSync(path.join(INGREDIENTS_FOLDER, b));
    return statA.birthtimeMs - statB.birthtimeMs;
  });
}

let currentIndex = 0;
let imageFiles = getImageFiles();
const renamedLog: Array<{ old: string; new: string; ingredient: string }> = [];

// Create HTML page
function createHTML(currentFile: string, index: number, total: number): string {
  const ingredientsWithTranslations = ingredientsData.map(ing => ({
    name: ing.name,
    english: translations[ing.name] || ''
  }));
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Renommage d'ingrédients - ${index + 1}/${total}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 900px;
      width: 100%;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    .progress {
      font-size: 18px;
      opacity: 0.9;
    }
    .progress-bar {
      background: rgba(255,255,255,0.2);
      height: 8px;
      border-radius: 4px;
      margin-top: 15px;
      overflow: hidden;
    }
    .progress-fill {
      background: #4ade80;
      height: 100%;
      transition: width 0.3s ease;
      width: ${((index + 1) / total * 100).toFixed(1)}%;
    }
    .content {
      padding: 40px;
    }
    .image-container {
      text-align: center;
      margin-bottom: 30px;
      background: #f9fafb;
      border-radius: 12px;
      padding: 30px;
    }
    .image-container img {
      max-width: 100%;
      max-height: 400px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .filename {
      margin-top: 15px;
      color: #6b7280;
      font-size: 14px;
      font-family: 'Courier New', monospace;
    }
    .form-container {
      background: #f9fafb;
      padding: 30px;
      border-radius: 12px;
    }
    label {
      display: block;
      font-weight: 600;
      color: #374151;
      margin-bottom: 10px;
      font-size: 16px;
    }
    input[type="text"] {
      width: 100%;
      padding: 15px;
      font-size: 18px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.3s;
      font-family: inherit;
    }
    input[type="text"]:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    .autocomplete-list {
      max-height: 200px;
      overflow-y: auto;
      background: white;
      border: 2px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 8px 8px;
      margin-top: -8px;
      display: none;
    }
    .autocomplete-list.show {
      display: block;
    }
    .autocomplete-item {
      padding: 12px 15px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .autocomplete-item:hover {
      background: #f3f4f6;
    }
    .autocomplete-item.selected {
      background: #667eea;
      color: white;
    }
    .buttons {
      display: flex;
      gap: 15px;
      margin-top: 20px;
    }
    button {
      flex: 1;
      padding: 15px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-rename {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .btn-rename:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    .btn-skip {
      background: #e5e7eb;
      color: #374151;
    }
    .btn-skip:hover {
      background: #d1d5db;
    }
    .stats {
      margin-top: 30px;
      padding: 20px;
      background: #ecfdf5;
      border-radius: 8px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }
    .stat {
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #059669;
    }
    .stat-label {
      font-size: 14px;
      color: #6b7280;
      margin-top: 5px;
    }
    .hint {
      margin-top: 15px;
      padding: 12px;
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
      font-size: 14px;
      color: #92400e;
    }
    .ingredients-list {
      margin-top: 30px;
      max-height: 300px;
      overflow-y: auto;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
    }
    .ingredients-list h3 {
      position: sticky;
      top: 0;
      background: white;
      padding: 10px 0;
      margin: 0 0 10px 0;
      border-bottom: 2px solid #e5e7eb;
      font-size: 16px;
      color: #374151;
    }
    .ingredient-item {
      display: flex;
      justify-content: space-between;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .ingredient-item:hover {
      background: #f3f4f6;
    }
    .ingredient-french {
      font-weight: 600;
      color: #374151;
    }
    .ingredient-english {
      color: #6b7280;
      font-style: italic;
    }
    .search-box {
      position: sticky;
      top: 0;
      background: white;
      padding: 10px 0;
      margin-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .search-box input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🖼️ Renommage d'ingrédients</h1>
      <div class="progress">Image ${index + 1} sur ${total}</div>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
    </div>
    
    <div class="content">
      <div class="image-container">
        <img src="/img/ingredients/${currentFile}" alt="Ingrédient">
        <div class="filename">${currentFile}</div>
      </div>
      
      <div class="form-container">
        <form id="renameForm">
          <label for="ingredientName">Nom de l'ingrédient :</label>
          <input 
            type="text" 
            id="ingredientName" 
            name="ingredientName" 
            placeholder="Tapez ou collez le nom..."
            autocomplete="off"
            autofocus
          >
          <div id="autocompleteList" class="autocomplete-list"></div>
          
          <div class="buttons">
            <button type="submit" class="btn-rename">✓ Renommer (Entrée)</button>
            <button type="button" class="btn-skip" onclick="skip()">→ Passer</button>
          </div>
        </form>
        
        <div class="hint">
          💡 <strong>Astuce :</strong> Tapez en français ou en anglais, puis sélectionnez dans la liste ou appuyez sur Entrée
        </div>
      </div>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${renamedLog.length}</div>
          <div class="stat-label">Renommées</div>
        </div>
        <div class="stat">
          <div class="stat-value">${total - index - 1}</div>
          <div class="stat-label">Restantes</div>
        </div>
        <div class="stat">
          <div class="stat-value">${total}</div>
          <div class="stat-label">Total</div>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    const ingredientsWithTranslations = ${JSON.stringify(ingredientsWithTranslations)};
    const input = document.getElementById('ingredientName');
    const autocompleteList = document.getElementById('autocompleteList');
    let selectedIndex = -1;
    
    // Autocomplete - search in French and English
    input.addEventListener('input', function() {
      const value = this.value.toLowerCase().trim();
      autocompleteList.innerHTML = '';
      selectedIndex = -1;
      
      if (!value) {
        autocompleteList.classList.remove('show');
        return;
      }
      
      // Search in both French and English
      const matches = ingredientsWithTranslations.filter(ing => 
        ing.name.toLowerCase().includes(value) || 
        (ing.english && ing.english.toLowerCase().includes(value))
      ).slice(0, 10);
      
      if (matches.length > 0) {
        matches.forEach((match, index) => {
          const div = document.createElement('div');
          div.className = 'autocomplete-item';
          div.innerHTML = \`<strong>\${match.name}</strong> \${match.english ? \`<span style="color: #6b7280; font-style: italic; margin-left: 8px;">\${match.english}</span>\` : ''}\`;
          div.onclick = () => {
            input.value = match.name;
            autocompleteList.classList.remove('show');
            input.focus();
          };
          autocompleteList.appendChild(div);
        });
        autocompleteList.classList.add('show');
      } else {
        autocompleteList.classList.remove('show');
      }
    });
    
    // Keyboard navigation
    input.addEventListener('keydown', function(e) {
      const items = autocompleteList.querySelectorAll('.autocomplete-item');
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelection(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection(items);
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0) {
          e.preventDefault();
          items[selectedIndex].click();
        } else {
          // Close autocomplete and let form submit
          autocompleteList.classList.remove('show');
        }
      }
    });
    
    function updateSelection(items) {
      items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedIndex);
        if (index === selectedIndex) {
          item.scrollIntoView({ block: 'nearest' });
        }
      });
    }
    
    // Form submit
    document.getElementById('renameForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = input.value.trim();
      
      if (!name) {
        alert('Veuillez entrer un nom d\\'ingrédient');
        return;
      }
      
      const response = await fetch('/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      
      const result = await response.json();
      
      if (result.success) {
        window.location.reload();
      } else {
        alert('Erreur : ' + result.error);
      }
    });
    
    async function skip() {
      const response = await fetch('/skip', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        window.location.reload();
      }
    }
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', function(e) {
      if (e.target !== input) {
        autocompleteList.classList.remove('show');
      }
    });
  </script>
</body>
</html>`;
}

// Create server
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    if (currentIndex >= imageFiles.length) {
      // Finished!
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Terminé!</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              text-align: center;
            }
            h1 { font-size: 48px; margin-bottom: 20px; }
            p { font-size: 24px; opacity: 0.9; }
            .stats { margin-top: 40px; font-size: 18px; }
          </style>
        </head>
        <body>
          <div>
            <h1>🎉 Terminé!</h1>
            <p>Toutes les images ont été traitées.</p>
            <div class="stats">
              <p>${renamedLog.length} images renommées</p>
              <p>${imageFiles.length - renamedLog.length} images passées</p>
            </div>
          </div>
        </body>
        </html>
      `);
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(createHTML(imageFiles[currentIndex], currentIndex, imageFiles.length));
  }
  else if (req.method === 'POST' && req.url === '/rename') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { name } = JSON.parse(body);
        const currentFile = imageFiles[currentIndex];
        const ext = path.extname(currentFile);
        const sanitizedName = sanitizeFilename(name);
        
        let newFileName = `${sanitizedName}${ext}`;
        let counter = 1;
        let newFilePath = path.join(INGREDIENTS_FOLDER, newFileName);
        
        while (fs.existsSync(newFilePath)) {
          newFileName = `${sanitizedName}-${counter}${ext}`;
          newFilePath = path.join(INGREDIENTS_FOLDER, newFileName);
          counter++;
        }
        
        const oldFilePath = path.join(INGREDIENTS_FOLDER, currentFile);
        fs.renameSync(oldFilePath, newFilePath);
        
        renamedLog.push({ old: currentFile, new: newFileName, ingredient: name });
        console.log(`✅ Renommé: ${currentFile} → ${newFileName} (${name})`);
        
        currentIndex++;
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: String(error) }));
      }
    });
  }
  else if (req.method === 'POST' && req.url === '/skip') {
    currentIndex++;
    console.log(`⏭️  Passé: ${imageFiles[currentIndex - 1]}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  }
  else if (req.url?.startsWith('/img/ingredients/')) {
    const filename = req.url.replace('/img/ingredients/', '');
    const filePath = path.join(INGREDIENTS_FOLDER, filename);
    
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'image/jpeg';
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.gif') contentType = 'image/gif';
      
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }
  else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🎨 Serveur de renommage d\'ingrédients démarré!');
  console.log('='.repeat(60));
  console.log(`\n📍 Ouvrez votre navigateur à l'adresse:`);
  console.log(`\n   👉 http://localhost:${PORT}\n`);
  console.log(`📊 Images à traiter: ${imageFiles.length}`);
  console.log('\n💡 Instructions:');
  console.log('   1. L\'image s\'affiche dans le navigateur');
  console.log('   2. Copiez le nom de l\'ingrédient depuis votre fichier');
  console.log('   3. Collez-le dans le champ et appuyez sur Entrée');
  console.log('   4. L\'image suivante s\'affiche automatiquement');
  console.log('\n🛑 Pour arrêter: Ctrl+C');
  console.log('='.repeat(60) + '\n');
});

// Save log on exit
process.on('SIGINT', () => {
  if (renamedLog.length > 0) {
    const logPath = path.join(process.cwd(), 'ingredient-rename-log.json');
    fs.writeFileSync(logPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: imageFiles.length,
        renamed: renamedLog.length,
        remaining: imageFiles.length - currentIndex,
      },
      renamedFiles: renamedLog,
    }, null, 2));
    console.log(`\n\n📄 Log sauvegardé dans: ingredient-rename-log.json`);
    console.log(`✅ ${renamedLog.length} images renommées\n`);
  }
  process.exit();
});
