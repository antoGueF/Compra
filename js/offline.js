const STORAGE_KEY = 'shopping_lists_offline';

let currentList = null;
let previousView = null;
let allArticles = [];
let listsData = {
    lista1: {
        name: 'Lista 1',
        items: []
    },
    lista2: {
        name: 'Lista 2', 
        items: []
    },
    lista3: {
        name: 'Lista 3',
        items: []
    }
};

const mainView = document.getElementById('mainView');
const listView = document.getElementById('listView');
const articlesView = document.getElementById('articlesView');
const listTitle = document.getElementById('listTitle');
const itemInput = document.getElementById('itemInput');
const addItemBtn = document.getElementById('addItemBtn');
const itemsList = document.getElementById('itemsList');
const allArticlesList = document.getElementById('allArticlesList');
const backBtn = document.querySelector('.back-btn');
const menuBtn = document.querySelector('.menu-btn');
const menuDropdown = document.querySelector('.menu-dropdown');

function init() {
    loadData();
    updateListButtons();
    setupEventListeners();
    setupOfflineColorPicker();
}

// ===== COLOR THEME SYSTEM =====
function setupOfflineColorPicker() {
    const savedTheme = localStorage.getItem('app-theme') || 'azul';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const grid = document.getElementById('offlineColorGrid');
    if (!grid) return;
    
    grid.querySelectorAll('.color-swatch').forEach(el => {
        el.classList.toggle('active', el.dataset.theme === savedTheme);
        el.addEventListener('click', () => {
            const themeId = el.dataset.theme;
            document.documentElement.setAttribute('data-theme', themeId);
            localStorage.setItem('app-theme', themeId);
            grid.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            el.classList.add('active');
        });
    });
}

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const data = JSON.parse(saved);
        listsData = data.lists || listsData;
        allArticles = data.articles || [];
    }
}

function saveData() {
    try {
        const dataToSave = {
            lists: listsData,
            articles: allArticles
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
        alert('Error: No se pudieron guardar las imágenes. El almacenamiento está lleno. Registrate para usar el almacenamiento en la nube.');
    }
}

function updateListButtons() {
    document.querySelectorAll('.list-button').forEach(button => {
        const listId = button.dataset.list;
        if (listsData[listId]) {
            button.textContent = listsData[listId].name;
        }
    });
}

function setupEventListeners() {
    document.querySelectorAll('.list-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const listId = e.target.dataset.list;
            
            if (listId === 'lista1') {
                openList(listId);
            } else {
                showMessage('Regístrate para poder usar mas listas de la compra', true);
            }
        });
    });

document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-container')) {
        document.querySelectorAll('.menu-dropdown').forEach(menu => {
            menu.classList.remove('show');
        });
    }
    
    if (!e.target.closest('.article-menu-container')) {
        document.querySelectorAll('.article-menu-dropdown').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('back-btn')) {
        if (!listView.classList.contains('hidden')) {
            closeList();
        } else if (!articlesView.classList.contains('hidden')) {
            closeArticlesView();
        } else if (!mainView.classList.contains('hidden')) {
            window.location.href = 'index.html';
        }
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('menu-btn')) {
        e.stopPropagation();
        e.preventDefault();
        const dropdown = e.target.nextElementSibling;
        dropdown.classList.toggle('show');
        
        document.querySelectorAll('.menu-dropdown').forEach(menu => {
            if (menu !== dropdown) {
                menu.classList.remove('show');
            }
        });
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('menu-item')) {
        const action = e.target.dataset.action;
        handleMenuAction(action);
        document.querySelectorAll('.menu-dropdown').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

    addItemBtn.addEventListener('click', addItem);
    itemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addItem();
        }
    });

    listTitle.addEventListener('click', editListTitle);
}

function openList(listId) {
    currentList = listId;
    listTitle.textContent = listsData[listId].name;
    
    mainView.classList.add('hidden');
    listView.classList.remove('hidden');
    
    renderItems();
}

function closeList() {
    currentList = null;
    listView.classList.add('hidden');
    mainView.classList.remove('hidden');
    itemInput.value = '';
}

function closeArticlesView() {
    articlesView.classList.add('hidden');
    
    if (previousView === 'list' && currentList) {
        listView.classList.remove('hidden');
        renderItems();
    } else {
        mainView.classList.remove('hidden');
    }
    
    previousView = null;
}

function addItem() {
    const itemName = itemInput.value.trim();
    if (!itemName || !currentList) return;

    const newItem = {
        id: Date.now(),
        name: itemName,
        checked: false,
        image: null
    };

    listsData[currentList].items.push(newItem);
    
    addToAllArticles(itemName, null);
    
    saveData();
    renderItems();
    itemInput.value = '';
}

function addToAllArticles(itemName, itemImage = null) {
    const normalizedName = itemName.toLowerCase().trim();
    let existingArticle = allArticles.find(article => 
        article.name.toLowerCase().trim() === normalizedName
    );
    
    if (!existingArticle) {
        allArticles.push({
            id: Date.now() + Math.random(),
            name: itemName,
            image: itemImage
        });
    } else if (itemImage && !existingArticle.image) {
        existingArticle.image = itemImage;
    }
}

function openArticlesView() {
    if (!mainView.classList.contains('hidden')) {
        previousView = 'main';
    } else if (!listView.classList.contains('hidden')) {
        previousView = 'list';
    }
    
    mainView.classList.add('hidden');
    listView.classList.add('hidden');
    articlesView.classList.remove('hidden');
    renderAllArticles();
}

function renderAllArticles() {
    const sortedArticles = [...allArticles].sort((a, b) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    allArticlesList.innerHTML = '';

    sortedArticles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.className = 'article-item';
        
        const img = document.createElement('img');
        img.src = article.image || 'https://cdn-icons-png.flaticon.com/512/685/685655.png';
        img.className = article.image ? '' : 'default-img';
        img.onclick = () => {
            if (!article.image) {
                selectImageForArticle(article.name);
            } else {
                showImageModal(article.image);
            }
        };
        
        const span = document.createElement('span');
        span.textContent = article.name;
        
        const menuContainer = document.createElement('div');
        menuContainer.className = 'article-menu-container';
        
        const menuBtn = document.createElement('button');
        menuBtn.innerHTML = '✎';
        menuBtn.className = 'menu-btn';
        menuBtn.style.minWidth = '35px';
        menuBtn.style.height = '35px';
        menuBtn.style.fontSize = '16px';
        menuBtn.onclick = (e) => {
            e.stopPropagation();
            toggleArticleMenu(menuContainer);
        };
        
        const dropdown = document.createElement('div');
        dropdown.className = 'article-menu-dropdown';
        dropdown.innerHTML = `
            <div class="article-menu-item" onclick="changeArticleImage('${article.name}')">
                Cambiar foto
            </div>
            <div class="article-menu-item" onclick="editArticleName('${article.name}')">
                Editar nombre
            </div>
            <div class="article-menu-item delete" onclick="deleteArticle('${article.name}')">
                Borrar artículo
            </div>
        `;
        
        menuContainer.appendChild(menuBtn);
        menuContainer.appendChild(dropdown);
        
        articleDiv.appendChild(img);
        articleDiv.appendChild(span);
        articleDiv.appendChild(menuContainer);
        allArticlesList.appendChild(articleDiv);
    });
}

function toggleArticleMenu(menuContainer) {
    const dropdown = menuContainer.querySelector('.article-menu-dropdown');
    const isVisible = dropdown.classList.contains('show');
    
    document.querySelectorAll('.article-menu-dropdown').forEach(menu => {
        menu.classList.remove('show');
    });
    
    if (!isVisible) {
        dropdown.classList.add('show');
    }
}

function changeArticleImage(articleName) {
    selectImageForArticle(articleName);
}

function editArticleName(articleName) {
    const article = allArticles.find(a => a.name === articleName);
    if (!article) return;

    const newName = prompt('Editar nombre del artículo:', article.name);
    if (newName && newName.trim() && newName.trim() !== article.name) {
        const oldName = article.name;
        const trimmedName = newName.trim();
        
        article.name = trimmedName;
        
        Object.keys(listsData).forEach(listKey => {
            listsData[listKey].items.forEach(item => {
                if (item.name.toLowerCase() === oldName.toLowerCase()) {
                    item.name = trimmedName;
                }
            });
        });
        
        saveData();
        renderAllArticles();
        
        if (currentList) {
            renderItems();
        }
    }
}

function deleteArticle(articleName) {
    if (confirm(`¿Estás seguro de que quieres borrar "${articleName}"?\n\nEsto también lo eliminará de todas las listas donde aparezca.`)) {
        const articleIndex = allArticles.findIndex(a => a.name === articleName);
        if (articleIndex !== -1) {
            allArticles.splice(articleIndex, 1);
        }
        
        Object.keys(listsData).forEach(listKey => {
            listsData[listKey].items = listsData[listKey].items.filter(item => 
                item.name.toLowerCase() !== articleName.toLowerCase()
            );
        });
        
        saveData();
        renderAllArticles();
        
        if (currentList) {
            renderItems();
        }
        
        showMessage('Artículo eliminado');
    }
}

function addArticleToCurrentList(articleName) {
    if (!currentList) {
        showMessage('Primero selecciona una lista');
        return;
    }

    const exists = listsData[currentList].items.some(item => 
        item.name.toLowerCase() === articleName.toLowerCase()
    );

    if (exists) {
        showMessage('Este artículo ya está en la lista');
        return;
    }

    const article = allArticles.find(a => a.name === articleName);
    const articleImage = article ? article.image : null;

    const newItem = {
        id: Date.now(),
        name: articleName,
        checked: false,
        image: articleImage
    };

    listsData[currentList].items.push(newItem);
    saveData();
    
    if (previousView === 'list') {
        closeArticlesView();
        renderItems();
    } else {
        showMessage('Artículo añadido a la lista');
    }
}

async function compressImage(file, maxSizeKB = 100, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            const maxWidth = 800;
            const maxHeight = 600;
            let { width, height } = img;
            
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
            
            ctx.drawImage(img, 0, 0, width, height);
            
            const tryCompress = (currentQuality) => {
                canvas.toBlob((blob) => {
                    if (blob.size <= maxSizeKB * 1024 || currentQuality <= 0.1) {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    } else {
                        tryCompress(currentQuality - 0.1);
                    }
                }, 'image/jpeg', currentQuality);
            };
            
            tryCompress(quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

async function selectImageForItem(itemId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressedData = await compressImage(file, 150);
                
                const item = listsData[currentList].items.find(i => i.id === itemId);
                if (item) {
                    item.image = compressedData;
                    
                    const article = allArticles.find(a => a.name.toLowerCase() === item.name.toLowerCase());
                    if (article) {
                        article.image = compressedData;
                    }
                    
                    saveData();
                    renderItems();
                }
            } catch (error) {
                alert('Error al procesar la imagen');
            }
        }
    };
    
    input.click();
}

async function selectImageForArticle(articleName) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressedData = await compressImage(file, 150);
                
                const article = allArticles.find(a => a.name === articleName);
                if (article) {
                    article.image = compressedData;
                    
                    Object.keys(listsData).forEach(listKey => {
                        listsData[listKey].items.forEach(item => {
                            if (item.name.toLowerCase() === articleName.toLowerCase()) {
                                item.image = compressedData;
                            }
                        });
                    });
                    
                    saveData();
                    renderAllArticles();
                    
                    if (currentList) {
                        renderItems();
                    }
                }
            } catch (error) {
                alert('Error al procesar la imagen');
            }
        }
    };
    
    input.click();
}

function showImageModal(imageSrc) {
    document.getElementById('modalImage').src = imageSrc;
    document.getElementById('imageModal').style.display = 'flex';
}

function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
}

function renderItems() {
    if (!currentList) return;

    let items = [...listsData[currentList].items];
    
    const uncheckedItems = items.filter(item => !item.checked);
    const checkedItems = items.filter(item => item.checked);
    
    uncheckedItems.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    checkedItems.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    
    const sortedItems = [...uncheckedItems, ...checkedItems];
    
    itemsList.innerHTML = '';

    sortedItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        
        itemDiv.innerHTML = `
            <input type="checkbox" ${item.checked ? 'checked' : ''} 
                   onchange="toggleItem(${item.id})">
            <img src="${item.image || 'https://cdn-icons-png.flaticon.com/512/685/685655.png'}" 
                 class="${item.image ? '' : 'default-img'}"
                 onclick="${item.image ? `showImageModal('${item.image}')` : `selectImageForItem(${item.id})`}"
                 style="width: 40px; height: 40px; object-fit: cover; margin-right: 10px; border-radius: 6px; cursor: pointer;">
            <span class="editable ${item.checked ? 'checked' : ''}" 
                  onclick="editItem(${item.id})">${item.name}</span>
        `;
        
        itemsList.appendChild(itemDiv);
    });
}

function toggleItem(itemId) {
    if (!currentList) return;

    const item = listsData[currentList].items.find(i => i.id === itemId);
    if (item) {
        item.checked = !item.checked;
        saveData();
        renderItems();
    }
}

function editItem(itemId) {
    if (!currentList) return;

    const item = listsData[currentList].items.find(i => i.id === itemId);
    if (!item) return;

    const oldName = item.name;
    const newName = prompt('Editar artículo:', item.name);
    
    if (newName && newName.trim() && newName.trim() !== oldName) {
        const trimmedName = newName.trim();
        
        item.name = trimmedName;
        
        const article = allArticles.find(a => a.name.toLowerCase() === oldName.toLowerCase());
        if (article) {
            article.name = trimmedName;
            
            Object.keys(listsData).forEach(listKey => {
                listsData[listKey].items.forEach(listItem => {
                    if (listItem.name.toLowerCase() === oldName.toLowerCase() && listItem.id !== itemId) {
                        listItem.name = trimmedName;
                    }
                });
            });
        } else {
            addToAllArticles(trimmedName, item.image);
        }
        
        saveData();
        renderItems();
    }
}

function editListTitle() {
    if (!currentList || currentList !== 'lista1') return;

    const currentName = listsData[currentList].name;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.style.fontSize = '24px';
    input.style.margin = '0';
    input.style.padding = '5px';
    input.style.border = '2px solid #4caf50';
    input.style.borderRadius = '4px';
    input.style.width = '100%';
    input.style.boxSizing = 'border-box';
    
    listTitle.style.display = 'none';
    listTitle.parentNode.insertBefore(input, listTitle);
    input.focus();
    input.select();
    
    const saveTitle = () => {
        const newName = input.value.trim();
        if (newName && newName !== currentName) {
            listsData[currentList].name = newName;
            listTitle.textContent = newName;
            saveData();
            updateListButtons();
        }
        input.remove();
        listTitle.style.display = 'block';
    };
    
    input.addEventListener('blur', saveTitle);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveTitle();
        }
    });
}

function handleMenuAction(action) {
    switch(action) {
        case 'articles':
            openArticlesView();
            break;
        case 'delete-bought':
            deleteBoughtItems();
            break;
        case 'suggestions':
        case 'account':
        case 'close-session':
        case 'about':
            showMessage('Esta funcionalidad estará disponible próximamente');
            break;
    }
}

function deleteBoughtItems() {
    if (!currentList) return;

    const boughtCount = listsData[currentList].items.filter(item => item.checked).length;
    
    if (boughtCount === 0) {
        alert('No hay artículos comprados para borrar.');
        return;
    }

    if (confirm(`¿Estás seguro de que quieres borrar ${boughtCount} artículo(s) comprado(s)?`)) {
        listsData[currentList].items = listsData[currentList].items.filter(item => !item.checked);
        saveData();
        renderItems();
    }
}

function showMessage(message, isPopup = false, buttonText = 'OK') {
    if (isPopup) {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        overlay.innerHTML = `
            <div class="popup-content">
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">${buttonText}</button>
            </div>
        `;
        document.body.appendChild(overlay);
        return;
    }
    
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alert = document.createElement('div');
    alert.className = 'alert alert-info';
    alert.textContent = message;
    
    const container = listView.classList.contains('hidden') ? mainView : listView.querySelector('.list-container');
    container.insertBefore(alert, container.firstChild);

    setTimeout(() => {
        alert.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', init);

function goToSuggestions() {
    window.location.href = 'suggestions.html';
}

function goToAbout() {
    window.location.href = 'about.html';
}

function goToBlog() {
    window.location.href = 'blog_dinamico.html';
}

function showVersion() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener('message', event => {
      document.getElementById('version-display').textContent = `Versión ${event.data}`;
    });
    
    navigator.serviceWorker.controller.postMessage('GET_VERSION');
  }
}

document.addEventListener('DOMContentLoaded', showVersion);
