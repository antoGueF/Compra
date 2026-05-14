let currentUser = null;

const usernameInput = document.getElementById('username');
const mainTitle = document.querySelector('h1');
const authView = document.getElementById('authView');
const appView = document.getElementById('appView');
const authTitle = document.getElementById('authTitle');
const authForm = document.getElementById('authForm');
const authButton = document.getElementById('authButton');
const toggleAuth = document.getElementById('toggleAuth');
const authMessage = document.getElementById('authMessage');
const splashView = document.getElementById('splashView'); 
const forgotPassword = document.getElementById('forgotPassword');
let isInitialLoad = true;
let authMode = 'login';

// Timeout de seguridad para la pantalla de splash
const splashTimeout = setTimeout(() => {
  console.warn('Timeout de splash - forzando vista de login');
  if (splashView) splashView.style.display = 'none';
  authView.style.display = 'block';
  appView.classList.remove('active');
  isInitialLoad = false;
}, 2500); // 2.5 segundos máximo de espera

// Función para limpiar el timeout cuando ya no lo necesites
const clearSplashTimeout = () => {
  if (splashTimeout) {
    clearTimeout(splashTimeout);
  }
};

toggleAuth.addEventListener('click', () => {
  authMode = authMode === 'login' ? 'register' : 'login';
  authTitle.textContent = authMode === 'login' ? 'Iniciar sesión' : 'Regístrate';
  authButton.textContent = authMode === 'login' ? 'Entrar' : 'Registrar';
  toggleAuth.innerHTML = authMode === 'login' ? '¿No tienes cuenta? <span>Regístrate</span>' : '¿Ya tienes cuenta? <span>Inicia sesión</span>';
  forgotPassword.style.display = authMode === 'login' ? 'block' : 'none';
  authMessage.textContent = '';

 const confirmPasswordInput = document.getElementById('confirmPassword');
if (authMode === 'register') {
  usernameInput.style.display = 'block';
  usernameInput.required = true;
  confirmPasswordInput.style.display = 'block';
  confirmPasswordInput.required = true;
} else {
  usernameInput.style.display = 'none';
  usernameInput.required = false;
  confirmPasswordInput.style.display = 'none';
  confirmPasswordInput.required = false;
}
});

forgotPassword.addEventListener('click', () => {
  const email = document.getElementById('email').value;
  
  if (!email) {
    document.getElementById('authMessage').textContent = 'Por favor, introduce tu correo electrónico';
    return;
  }
  
  // Enviar email de recuperación
  auth.sendPasswordResetEmail(email)
    .then(() => {
      document.getElementById('authMessage').style.color = 'green';
      document.getElementById('authMessage').textContent = 'Se ha enviado un correo de recuperación. Revisa tu bandeja de entrada.';
    })
    .catch((error) => {
      document.getElementById('authMessage').style.color = 'red';
      document.getElementById('authMessage').textContent = 'Error: ' + error.message;
    });
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const username = document.getElementById("username").value.trim();

  if (authMode === "register") {
    if (password !== confirmPassword) {
      authMessage.textContent = "Las contraseñas no coinciden.";
      return;
    }
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await db.collection("users").doc(user.uid).set({
  username: username,
  email: email,
  lists: {
    list1: [],
    list2: [],
    list3: []
  },
  itemLibrary: {}, // Nueva biblioteca de artículos del usuario
  hasSeenOnboarding: false
});

      currentUser = user;
      mainTitle.textContent = `Lista de la compra de ${username}`;
      authView.style.display = 'none';
    // 👈 Mostrar onboarding en lugar de ir directo a la app
    showOnboarding();
    
} catch (error) {
      // Mostrar mensajes más amigables según el tipo de error
      if (error.code === 'auth/weak-password') {
        authMessage.textContent = 'La contraseña debe tener al menos 6 caracteres';
      } else if (error.code === 'auth/email-already-in-use') {
        authMessage.textContent = 'Ya existe una cuenta con este correo electrónico';
      } else if (error.code === 'auth/invalid-email') {
        authMessage.textContent = 'El formato del correo electrónico no es válido';
      } else if (error.code === 'auth/operation-not-allowed') {
        authMessage.textContent = 'El registro con email está deshabilitado';
      } else {
        authMessage.textContent = 'Error al crear la cuenta. Inténtalo de nuevo';
      }
    }
  } else {
    // LOGIN
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

const doc = await db.collection("users").doc(user.uid).get();
const userData = doc.data();

currentUser = user;
mainTitle.textContent = `Lista de la compra de ${userData.username}`;

// Cargar nombres de listas guardados
if (userData.list1Name) {
  document.querySelector('[data-button-id="list1Button"]').textContent = userData.list1Name;
  document.getElementById('list1Button').textContent = userData.list1Name;
}
if (userData.list2Name) {
  document.querySelector('[data-button-id="list2Button"]').textContent = userData.list2Name;
  document.getElementById('list2Button').textContent = userData.list2Name;
}
if (userData.list3Name) {
  document.querySelector('[data-button-id="list3Button"]').textContent = userData.list3Name;
  document.getElementById('list3Button').textContent = userData.list3Name;
}

authView.style.display = 'none';
appView.classList.add('active');
loadLists();
          } catch (error) {
      // Mostrar mensajes más amigables según el tipo de error
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password') {
        authMessage.textContent = 'Usuario y/o contraseña incorrecta';
      } else if (error.code === 'auth/invalid-email') {
        authMessage.textContent = 'El formato del correo electrónico no es válido';
      } else if (error.code === 'auth/user-disabled') {
        authMessage.textContent = 'Esta cuenta ha sido deshabilitada';
      } else if (error.code === 'auth/too-many-requests') {
        authMessage.textContent = 'Demasiados intentos fallidos. Inténtalo más tarde';
      } else {
        authMessage.textContent = 'Error al iniciar sesión. Inténtalo de nuevo';
      }
    }
  }
});



function logout() {
    // Cerrar sesión en Firebase 
    auth.signOut().then(() => {
        console.log('Sesión cerrada correctamente');
        // El resto del código se ejecutará automáticamente por onAuthStateChanged
    }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
    });
    
    currentUser = null;
    ['list1','list2','list3','list4','list5'].forEach((id, i) => {
      const btnId = `${id}Button`;
      const el = document.getElementById(btnId);
      if (el) {
        el.textContent = `Lista ${i+1}`;
        const q = document.querySelector(`[data-button-id="${btnId}"]`);
        if (q) q.textContent = `Lista ${i+1}`;
      }
      const row = document.getElementById(`${id}Row`);
      if (row) row.style.display = i < 3 ? '' : 'none';
    });
    document.getElementById('addListBtn').style.display = 'flex';
    
    appView.classList.remove('active');
    authView.style.display = 'block';
    authForm.reset();
    mainTitle.textContent = 'Lista de la compra by AKOBU';
}

function showList(viewId) {
  closeAllMenus();
  document.getElementById('welcomeView').style.display = 'none';
  document.getElementById('selectorView').style.display = 'none';
  document.getElementById('list1View').style.display = 'none';
  document.getElementById('list2View').style.display = 'none';
  document.getElementById('list3View').style.display = 'none';
  document.getElementById('list4View').style.display = 'none';
  document.getElementById('list5View').style.display = 'none';
  document.getElementById('articlesView').style.display = 'none';
  document.getElementById('accountView').style.display = 'none';
  if (viewId === 'selectorView') {
    document.getElementById('selectorView').style.display = 'flex';
  } else {
    document.getElementById(viewId).style.display = 'block';
  }
  
  if (viewId === 'articlesView') {
    loadArticles();
  } else if (viewId.startsWith('list') && viewId.endsWith('View')) {
    loadLists();
  } else if (viewId === 'accountView') {
    loadAccountView();
  }
}

async function loadLists() {
  if (!currentUser) return;
  
  try {
    const doc = await db.collection("users").doc(currentUser.uid).get();
    const userData = doc.data();
    const data = userData.lists || { list1: [], list2: [], list3: [] };
    
['list1', 'list2', 'list3', 'list4', 'list5'].forEach(listId => {
  const container = document.getElementById(listId);
  container.innerHTML = '';
  const orderedList = reorderList(data[listId] || []);
  orderedList.forEach((item, index) => {
  const el = document.createElement('div');
  el.className = 'item';
  const img = document.createElement('img');
  img.src = item.img || 'https://cdn-icons-png.flaticon.com/512/685/685655.png';
  img.className = item.img ? '' : 'default-img';
  img.onclick = () => {
    if (!item.img) {
      selectImage(index, listId);
    } else {
      document.getElementById('modalImage').src = item.img;
      document.getElementById('modal').style.display = 'flex';
    }
  };
        const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.checked = item.checked;
checkbox.onchange = async () => {
  item.checked = checkbox.checked;



  // Reordenar la lista: no marcados primero, marcados al final
  const reorderedList = data[listId].sort((a, b) => {
  if (a.checked !== b.checked) {
    return a.checked ? 1 : -1; // Los marcados van al final
  }
  return a.name.toLowerCase().localeCompare(b.name.toLowerCase()); // Orden alfabético
});
  
  await saveItemToFirebase(listId, reorderedList);
  loadLists(); // Recargar para mostrar el nuevo orden
};
        const span = document.createElement('span');
span.textContent = item.name;
span.className = 'editable' + (item.checked ? ' checked' : '');
span.style.cursor = 'pointer';
span.onclick = () => editArticleNameFromList(item.name, index, listId);
el.append(checkbox, img, span);
        container.appendChild(el);
      });
    });
  } catch (error) {
    console.error("Error al cargar listas:", error);
  }
}

async function saveItemToFirebase(listId, items) {
  if (!currentUser) return;
  try {
    await db.collection("users").doc(currentUser.uid).update({
      [`lists.${listId}`]: items
    });
  } catch (error) {
    console.error("Error al guardar en Firebase:", error);
  }
}

function reorderList(list) {
  // Separar elementos marcados y no marcados, ordenados alfabéticamente
  const unchecked = list.filter(item => !item.checked).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  const checked = list.filter(item => item.checked).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  
  // Devolver primero los no marcados, luego los marcados
  return [...unchecked, ...checked];
}

async function addItem(e, listId) {
  e.preventDefault();
  const input = document.getElementById(`name-${listId}`);
  const name = input.value.trim();
  if (!name || !currentUser) return;
  
  try {
    const doc = await db.collection("users").doc(currentUser.uid).get();
    const userData = doc.data();
    const currentList = userData.lists[listId] || [];
    const itemLibrary = userData.itemLibrary || {};
    
    // Crear el nuevo item
    const newItem = { name, checked: false };
    
    // Si el artículo ya existe en la biblioteca, usar su imagen
const normalizedName = name.toLowerCase().trim();
if (itemLibrary[normalizedName] && itemLibrary[normalizedName].img) {
  newItem.img = itemLibrary[normalizedName].img;
  console.log('Usando imagen guardada para:', name);
}

// Siempre guardar el artículo en la biblioteca (sin imagen si no la tiene)
itemLibrary[normalizedName] = {
  name: name,
  img: newItem.img || null
};

currentList.unshift(newItem);
    
    // Reordenar la lista antes de guardar
const reorderedList = reorderList(currentList);

console.log('Guardando itemLibrary:', itemLibrary);
await db.collection("users").doc(currentUser.uid).update({
  [`lists.${listId}`]: reorderedList,
  itemLibrary: itemLibrary
});
console.log('Guardado exitoso');  

    input.value = '';
    loadLists();
  } catch (error) {
    console.error("Error al añadir artículo:", error);
  }
}

// Función para comprimir imágenes
async function compressImage(file, maxSizeKB = 100, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo la proporción
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
      
      // Dibujar la imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir a blob y ajustar calidad si es necesario
      const tryCompress = (currentQuality) => {
        canvas.toBlob((blob) => {
          if (blob.size <= maxSizeKB * 1024 || currentQuality <= 0.1) {
            resolve(blob);
          } else {
            // Si aún es muy grande, reducir más la calidad
            tryCompress(currentQuality - 0.1);
          }
        }, 'image/jpeg', currentQuality);
      };
      
      tryCompress(quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

function showImageLoading() {
  let loadingOverlay = document.getElementById('image-loading-overlay');
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'image-loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="loading-backdrop">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p>Procesando imagen...</p>
        </div>
      </div>
    `;
    document.body.appendChild(loadingOverlay);
  }
  loadingOverlay.style.display = 'flex';
}

function hideImageLoading() {
  const loadingOverlay = document.getElementById('image-loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
}

async function selectImage(itemIndex, listId) {
  console.log('Seleccionando imagen para item:', itemIndex, 'en lista:', listId);
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  // input.capture = 'environment';
input.onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
   showImageLoading();
    
    console.log('Archivo seleccionado:', file.name, 'Tamaño original:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    
    try {
      // Comprimir la imagen antes de subirla
      const compressedFile = await compressImage(file, 50); // 50KB máximo
      console.log('Imagen comprimida:', (compressedFile.size / 1024).toFixed(2) + 'KB');
      
      // Crear una referencia única para la imagen
      const imageRef = storage.ref(`images/${currentUser.uid}/${listId}/${itemIndex}_${Date.now()}`);
      
      // Subir la imagen comprimida a Firebase Storage
      console.log('Subiendo imagen comprimida a Storage...');
      const snapshot = await imageRef.put(compressedFile);
      
      // Obtener la URL de descarga
      const downloadURL = await snapshot.ref.getDownloadURL();
      console.log('URL de imagen obtenida:', downloadURL);
      
      // Obtener la lista actual de Firebase
      const doc = await db.collection("users").doc(currentUser.uid).get();
      const userData = doc.data();
      const currentList = userData.lists[listId] || [];
      const itemLibrary = userData.itemLibrary || {};
      
      console.log('Lista actual:', currentList);
      console.log('Item a actualizar:', currentList[itemIndex]);
      
      // Actualizar el item específico usando el índice
      if (currentList[itemIndex]) {
        currentList[itemIndex].img = downloadURL;
        
        // Guardar también en la biblioteca del usuario
        const normalizedName = currentList[itemIndex].name.toLowerCase().trim();
        itemLibrary[normalizedName] = {
          name: currentList[itemIndex].name,
          img: downloadURL
        };
        
        console.log('Item actualizado con URL de imagen y guardado en biblioteca');
        
        // Guardar tanto la lista como la biblioteca
        await db.collection("users").doc(currentUser.uid).update({
          [`lists.${listId}`]: currentList,
          itemLibrary: itemLibrary
        });
        
        console.log('Guardado en Firebase');
        
        // Recargar las listas para mostrar la nueva imagen
        loadLists();
      }
    } catch (error) {
      console.error("Error al guardar imagen:", error);
    }finally {
      hideImageLoading(); // ← AÑADIR ESTA LÍNEA (reemplaza o añade el finally)
    }
  };
  input.click();
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

async function editListTitle(element) {
  const currentTitle = element.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentTitle;
  input.style.fontSize = '24px';
  input.style.width = '100%';

  input.onblur = async () => {
    const newTitle = input.value.trim() || currentTitle;
    element.textContent = newTitle;

    const buttonId = element.getAttribute('data-button-id');
    const button = document.getElementById(buttonId);
    if (button) button.textContent = newTitle;

    // Guardar en Firebase
    if (currentUser && newTitle !== currentTitle) {
      try {
        const listKey = buttonId === 'list1Button' ? 'list1Name' : 
                buttonId === 'list2Button' ? 'list2Name' : 
                buttonId === 'list3Button' ? 'list3Name' :
                buttonId === 'list4Button' ? 'list4Name' :
                'list5Name';
        await db.collection("users").doc(currentUser.uid).update({
          [listKey]: newTitle
        });
      } catch (error) {
        console.error("Error al guardar el nombre de la lista:", error);
      }
    }

    // Volver a activar la edición si se hace clic de nuevo
    element.onclick = () => editListTitle(element);
  };

  element.textContent = '';
  element.onclick = null; // quitar el evento mientras se edita
  element.appendChild(input);
  input.focus();
}

function toggleMenu(menuId) {
  // Si no se especifica un ID, usar el menú principal de la vista actual
  if (!menuId) {
    const currentView = getCurrentView();
    if (currentView === 'selectorView') menuId = 'menuDropdown';
    else if (currentView === 'list1View') menuId = 'menuDropdown2';
    else if (currentView === 'list2View') menuId = 'menuDropdown3';
    else if (currentView === 'list3View') menuId = 'menuDropdown6';
    else if (currentView === 'list4View') menuId = 'menuDropdown7';
    else if (currentView === 'list5View') menuId = 'menuDropdown8';
    else if (currentView === 'articlesView') menuId = 'menuDropdown4';
    else if (currentView === 'accountView') menuId = 'menuDropdown5';
  }
  
  const targetDropdown = document.getElementById(menuId);
  if (targetDropdown) {
    targetDropdown.classList.toggle('show');
  }
}

function getCurrentView() {
  if (document.getElementById('selectorView').style.display !== 'none') return 'selectorView';
  if (document.getElementById('list1View').style.display === 'block') return 'list1View';
  if (document.getElementById('list2View').style.display === 'block') return 'list2View';
  if (document.getElementById('list3View').style.display === 'block') return 'list3View';
  if (document.getElementById('list4View').style.display === 'block') return 'list4View';
  if (document.getElementById('list5View').style.display === 'block') return 'list5View';
  if (document.getElementById('articlesView').style.display === 'block') return 'articlesView';
  if (document.getElementById('accountView').style.display === 'block') return 'accountView';
  return 'selectorView';
}

function closeAllMenus() {
  const dropdowns = document.querySelectorAll('.menu-dropdown');
  dropdowns.forEach(dropdown => {
    dropdown.classList.remove('show');
  });
}

// Cerrar el menú si se hace clic fuera de él
document.addEventListener('click', function(event) {
  const menuContainers = document.querySelectorAll('.menu-container, .list-menu');
  let clickedInsideMenu = false;
  
  menuContainers.forEach(container => {
    if (container.contains(event.target)) {
      clickedInsideMenu = true;
    }
  });
  
  if (!clickedInsideMenu) {
    document.querySelectorAll('.menu-dropdown, .list-menu-dropdown').forEach(dropdown => {
      dropdown.classList.remove('show');
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
    // Detectar si es móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (isMobile) {
        // En móvil, cerrar menús en varios eventos
        const externalLinks = document.querySelectorAll('a[href$=".html"], a[href*="/"]');
        
        externalLinks.forEach(link => {
            // Usar touchstart en lugar de click para móviles
            link.addEventListener('touchstart', function() {
                closeAllMenus();
            });
            
            link.addEventListener('click', function() {
                closeAllMenus();
            });
        });
        
        // También cerrar cuando se pierde el foco de la ventana
        window.addEventListener('pagehide', function() {
            closeAllMenus();
        });
        
        window.addEventListener('blur', function() {
            closeAllMenus();
        });
    } else {
        // En PC, usar la solución original
        const externalLinks = document.querySelectorAll('a[href$=".html"], a[href*="/"]');
        externalLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeAllMenus();
            });
        });
        
        window.addEventListener('beforeunload', function() {
            closeAllMenus();
        });
    }
});

async function loadArticles() {
  if (!currentUser) return;
  
  try {
    const doc = await db.collection("users").doc(currentUser.uid).get();
    const userData = doc.data();
    const itemLibrary = userData.itemLibrary || {};

        console.log('userData:', userData);
    console.log('itemLibrary:', itemLibrary);
    
    const container = document.getElementById('articlesList');
    container.innerHTML = '';
    
    // Convertir el objeto itemLibrary en array y ordenar alfabéticamente
    const articles = Object.values(itemLibrary).sort((a, b) => a.name.localeCompare(b.name));
    
    if (articles.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #888; font-style: italic;">No tienes artículos guardados aún.</p>';
      return;
    }
    
articles.forEach(article => {
  const el = document.createElement('div');
  el.className = 'item';
  
  const img = document.createElement('img');
  img.src = article.img || 'https://cdn-icons-png.flaticon.com/512/685/685655.png';
  img.className = article.img ? '' : 'default-img';
  img.onclick = () => {
    if (!article.img) {
      selectImageForArticle(article.name);
    } else {
      document.getElementById('modalImage').src = article.img;
      document.getElementById('modal').style.display = 'flex';
    }
  };
  
  const span = document.createElement('span');
  span.textContent = article.name;
  span.className = 'editable';
  
  // Crear el menú de edición
  const menuContainer = document.createElement('div');
  menuContainer.className = 'menu-container';
  menuContainer.style.marginLeft = 'auto';
  
  const editBtn = document.createElement('button');
  editBtn.innerHTML = '✎';
  editBtn.className = 'menu-btn';
  editBtn.style.minWidth = '35px';
  editBtn.style.height = '35px';
  editBtn.style.fontSize = '16px';
  editBtn.onclick = (e) => {
    e.stopPropagation();
    toggleArticleMenu(menuContainer);
  };
  
  const dropdown = document.createElement('div');
  dropdown.className = 'menu-dropdown';
  
  const changePhotoItem = document.createElement('div');
  changePhotoItem.className = 'menu-item';
  changePhotoItem.textContent = 'Cambiar foto';
  changePhotoItem.onclick = () => {
    selectImageForArticle(article.name);
    closeAllMenus();
  };
  
  const editNameItem = document.createElement('div');
  editNameItem.className = 'menu-item';
  editNameItem.textContent = 'Editar nombre';
  editNameItem.onclick = () => {
    editArticleName(article.name);
    closeAllMenus();
  };
  
  const deleteItem = document.createElement('div');
  deleteItem.className = 'menu-item';
  deleteItem.textContent = 'Borrar artículo';
  deleteItem.onclick = () => {
    deleteArticle(article.name);
    closeAllMenus();
  };
  
  dropdown.append(changePhotoItem, editNameItem, deleteItem);
  menuContainer.append(editBtn, dropdown);
  
  el.append(img, span, menuContainer);
  container.appendChild(el);
});
    
     console.log('Artículos cargados:', articles.length);
  } catch (error) {
    console.error("Error al cargar artículos:", error);
  }
}

function toggleArticleMenu(menuContainer) {
  const dropdown = menuContainer.querySelector('.menu-dropdown');
  
  // Cerrar otros menús primero
  document.querySelectorAll('.menu-dropdown').forEach(otherDropdown => {
    if (otherDropdown !== dropdown) {
      otherDropdown.classList.remove('show');
    }
  });
  
  dropdown.classList.toggle('show');
}

async function editArticleName(oldName) {
  const newName = prompt('Nuevo nombre del artículo:', oldName);
  if (!newName || newName.trim() === '' || newName.trim() === oldName) return;
  
  try {
    const doc = await db.collection("users").doc(currentUser.uid).get();
    const userData = doc.data();
    const itemLibrary = userData.itemLibrary || {};
    const lists = userData.lists || { list1: [], list2: [],list3: [] };
    
    const oldNormalizedName = oldName.toLowerCase().trim();
    const newNormalizedName = newName.trim().toLowerCase();
    
    // Verificar si el nuevo nombre ya existe (y no es el mismo artículo)
    if (itemLibrary[newNormalizedName] && newNormalizedName !== oldNormalizedName) {
      alert(`Ya existe un artículo con el nombre "${newName.trim()}". Por favor, elige otro nombre.`);
      return;
    }
    
    // Actualizar en la biblioteca
    if (itemLibrary[oldNormalizedName]) {
      const articleData = itemLibrary[oldNormalizedName];
      itemLibrary[newNormalizedName] = {
        name: newName.trim(),
        img: articleData.img
      };
      delete itemLibrary[oldNormalizedName];
    }
    
    // Actualizar en todas las listas que contengan este artículo
    Object.keys(lists).forEach(listKey => {
      lists[listKey].forEach(item => {
        if (item.name.toLowerCase().trim() === oldNormalizedName) {
          item.name = newName.trim();
        }
      });
    });
    
    // Guardar cambios en Firebase
    await db.collection("users").doc(currentUser.uid).update({
      itemLibrary: itemLibrary,
      lists: lists
    });
    
    console.log('Nombre actualizado correctamente');
    loadArticles();
    
    // Si estamos viendo alguna lista, recargarla también
    if (document.getElementById('list1View').style.display === 'block' || 
        document.getElementById('list2View').style.display === 'block' || 
        document.getElementById('list3View').style.display === 'block') {
      loadLists();
    }
    
  } catch (error) {
    console.error("Error al editar nombre del artículo:", error);
    alert("Error al cambiar el nombre del artículo");
  }
}

async function editArticleNameFromList(oldName, itemIndex, listId) {
  const newName = prompt('Nuevo nombre del artículo:', oldName);
  if (!newName || newName.trim() === '' || newName.trim() === oldName) return;
  
  try {
    const doc = await db.collection("users").doc(currentUser.uid).get();
    const userData = doc.data();
    const itemLibrary = userData.itemLibrary || {};
    const lists = userData.lists || { list1: [], list2: [], list3: [] };
    
    const oldNormalizedName = oldName.toLowerCase().trim();
    const newNormalizedName = newName.trim().toLowerCase();
    
    // Verificar si el nuevo nombre ya existe (y no es el mismo artículo)
    if (itemLibrary[newNormalizedName] && newNormalizedName !== oldNormalizedName) {
      alert(`Ya existe un artículo con el nombre "${newName.trim()}". Por favor, elige otro nombre.`);
      return;
    }
    
    // Actualizar en la biblioteca
    if (itemLibrary[oldNormalizedName]) {
      const articleData = itemLibrary[oldNormalizedName];
      itemLibrary[newNormalizedName] = {
        name: newName.trim(),
        img: articleData.img
      };
      delete itemLibrary[oldNormalizedName];
    }
    
    // Actualizar en todas las listas que contengan este artículo
    Object.keys(lists).forEach(listKey => {
      lists[listKey].forEach(item => {
        if (item.name.toLowerCase().trim() === oldNormalizedName) {
          item.name = newName.trim();
        }
      });
    });
    
    // Guardar cambios en Firebase
    await db.collection("users").doc(currentUser.uid).update({
      itemLibrary: itemLibrary,
      lists: lists
    });
    
    // Recargar las listas para mostrar el cambio
    loadLists();
    
  } catch (error) {
    console.error("Error al editar nombre del artículo:", error);
  }
}

async function deleteArticle(articleName) {
  if (!confirm(`¿Estás seguro de que quieres borrar "${articleName}"?\n\nEsto también lo eliminará de todas las listas de la compra.`)) return;
  
  try {
    const doc = await db.collection("users").doc(currentUser.uid).get();
    const userData = doc.data();
    const itemLibrary = userData.itemLibrary || {};
    const lists = userData.lists || { list1: [], list2: [],list3: [] };
    
    const normalizedName = articleName.toLowerCase().trim();
    
    // Obtener la URL de la imagen antes de eliminar el artículo
    const imageUrl = itemLibrary[normalizedName]?.img;
    
    // Si el artículo tiene imagen, eliminarla de Storage
    if (imageUrl) {
      try {
        const imageRef = storage.refFromURL(imageUrl);
        await imageRef.delete();
        console.log('Imagen eliminada de Storage:', imageUrl);
      } catch (imageError) {
        console.warn('Error al eliminar imagen de Storage:', imageError);
        // Continuar aunque falle el borrado de la imagen
      }
    }
    
    // Eliminar de la biblioteca
    delete itemLibrary[normalizedName];
    
    // Eliminar de todas las listas
    Object.keys(lists).forEach(listKey => {
      lists[listKey] = lists[listKey].filter(item => 
        item.name.toLowerCase().trim() !== normalizedName
      );
    });
    
    // Guardar cambios en Firebase
    await db.collection("users").doc(currentUser.uid).update({
      itemLibrary: itemLibrary,
      lists: lists
    });
    
    console.log('Artículo eliminado correctamente');
    loadArticles();
    
    // Si estamos viendo alguna lista, recargarla también
    if (document.getElementById('list1View').style.display === 'block' || 
        document.getElementById('list2View').style.display === 'block' || 
        document.getElementById('list3View').style.display === 'block') {
      loadLists();
    }
    
  } catch (error) {
    console.error("Error al eliminar artículo:", error);
    alert("Error al eliminar el artículo");
  }
}

async function selectImageForArticle(articleName) {
  console.log('Seleccionando imagen para artículo:', articleName);
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
input.onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
   showImageLoading();
    
    console.log('Archivo seleccionado:', file.name, 'Tamaño original:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    
    try {
      // Comprimir la imagen antes de subirla
      const compressedFile = await compressImage(file, 50); // 50KB máximo
      console.log('Imagen comprimida:', (compressedFile.size / 1024).toFixed(2) + 'KB');
      
      // Crear una referencia única para la imagen
      const imageRef = storage.ref(`images/${currentUser.uid}/articles/${articleName}_${Date.now()}`);
      
      // Subir la imagen comprimida a Firebase Storage
      console.log('Subiendo imagen comprimida a Storage...');
      const snapshot = await imageRef.put(compressedFile);
      
      // Obtener la URL de descarga
      const downloadURL = await snapshot.ref.getDownloadURL();
      console.log('URL de imagen obtenida:', downloadURL);
      
      // Obtener los datos actuales del usuario
      const doc = await db.collection("users").doc(currentUser.uid).get();
      const userData = doc.data();
      const itemLibrary = userData.itemLibrary || {};
      
      // Actualizar la imagen del artículo en la biblioteca
      const normalizedName = articleName.toLowerCase().trim();
      itemLibrary[normalizedName] = itemLibrary[normalizedName] || { name: articleName };
      itemLibrary[normalizedName].img = downloadURL;

      // Obtener las listas y actualizar todas las que contengan este artículo
      const lists = userData.lists || { list1: [], list2: [], list3: []  };

      Object.keys(lists).forEach(listKey => {
        lists[listKey].forEach(item => {
          if (item.name.toLowerCase().trim() === normalizedName) {
            item.img = downloadURL;
            console.log('Actualizando imagen en lista:', listKey, 'para artículo:', item.name);
          }
        });
      });

      console.log('Artículo actualizado con nueva imagen');

      // Guardar tanto la biblioteca como las listas actualizadas
      await db.collection("users").doc(currentUser.uid).update({
        itemLibrary: itemLibrary,
        lists: lists
      });
        
      console.log('Guardado en Firebase');
      
      // Recargar tanto la vista de artículos como las listas si estamos en una vista de lista
      loadArticles();
      if (document.getElementById('list1View').style.display === 'block' || 
          document.getElementById('list2View').style.display === 'block' || 
          document.getElementById('list3View').style.display === 'block') {
        loadLists();
      }
    } catch (error) {
      console.error("Error al guardar imagen del artículo:", error);
    }finally {
      hideImageLoading(); // ← AÑADIR ESTA LÍNEA (reemplaza o añade el finally)
    }
  };
  input.click();
}

async function clearCompletedItems(listId) {
  if (!currentUser) return;
  
  // Cerrar el menú primero
  closeAllMenus();
  
  try {
    const doc = await db.collection("users").doc(currentUser.uid).get();
    const userData = doc.data();
    const currentList = userData.lists[listId] || [];
    
    // Contar cuántos artículos se van a borrar
    const completedItems = currentList.filter(item => item.checked);
    
    if (completedItems.length === 0) {
      alert('No hay artículos comprados para borrar.');
      return;
    }
    
    if (!confirm(`¿Estás seguro de que quieres borrar ${completedItems.length} artículo(s) comprado(s)?`)) {
      return;
    }
    
    // Filtrar solo los artículos no marcados (borrar los marcados)
    const remainingItems = currentList.filter(item => !item.checked);
    
    // Guardar la lista actualizada en Firebase
    await db.collection("users").doc(currentUser.uid).update({
      [`lists.${listId}`]: remainingItems
    });
    
    console.log(`${completedItems.length} artículos comprados eliminados de ${listId}`);
    loadLists();
    
  } catch (error) {
    console.error("Error al borrar artículos comprados:", error);
    alert("Error al borrar los artículos comprados");
  }
}

async function handleAddList() {
  if (!currentUser) return;
  
  const newName = prompt('Nombre de la nueva lista:');
  if (!newName || newName.trim() === '') return;
  
  try {
    const doc = await db.collection("users").doc(currentUser.uid).get();
    const userData = doc.data();
    const lists = userData.lists || {};

    if (!lists.hasOwnProperty('list4') || lists.list4 === null) {
      await db.collection("users").doc(currentUser.uid).update({
        'lists.list4': [],
        'list4Name': newName.trim()
      });
      document.getElementById('list4Button').textContent = newName.trim();
      document.getElementById('list4Row').style.display = '';
    } else if (!lists.hasOwnProperty('list5') || lists.list5 === null) {
      await db.collection("users").doc(currentUser.uid).update({
        'lists.list5': [],
        'list5Name': newName.trim()
      });
      document.getElementById('list5Button').textContent = newName.trim();
      document.getElementById('list5Row').style.display = '';
    } else {
      return;
    }

    const updatedDoc = await db.collection("users").doc(currentUser.uid).get();
    const updatedData = updatedDoc.data();
    const updatedLists = updatedData.lists || {};
    const listCount = Object.keys(updatedLists).filter(k => k.startsWith('list') && updatedLists[k] !== null).length;
    if (listCount >= 5) {
      document.getElementById('addListBtn').style.display = 'none';
    }
    loadLists();
  } catch (error) {
    console.error("Error adding list:", error);
  }
}

function toggleListMenu(event, listId) {
  if (event) event.stopPropagation();
  const num = listId.replace('list', '');
  const menu = document.getElementById('listMenu' + num);
  if (!menu) return;
  
  document.querySelectorAll('.list-menu-dropdown').forEach(m => {
    if (m !== menu) m.classList.remove('show');
  });
  
  menu.classList.toggle('show');
}

async function renameList(listId) {
  document.querySelectorAll('.list-menu-dropdown').forEach(m => m.classList.remove('show'));
  
  const button = document.getElementById(listId + 'Button');
  if (!button) return;
  const currentName = button.textContent.trim();
  const newName = prompt('Nuevo nombre de la lista:', currentName);
  if (!newName || newName.trim() === '' || newName.trim() === currentName) return;
  
  button.textContent = newName.trim();
  const q = document.querySelector(`[data-button-id="${listId}Button"]`);
  if (q) q.textContent = newName.trim();
  
  if (currentUser) {
    try {
      await db.collection("users").doc(currentUser.uid).update({
        [listId + 'Name']: newName.trim()
      });
    } catch (error) {
      console.error("Error renaming list:", error);
    }
  }
}

async function deleteList(listId) {
  document.querySelectorAll('.list-menu-dropdown').forEach(m => m.classList.remove('show'));
  
  const button = document.getElementById(listId + 'Button');
  if (!button) return;
  const listName = button.textContent.trim();
  
  if (!confirm(`¿Estás seguro de que quieres eliminar la lista "${listName}"?`)) return;
  
  if (currentUser) {
    try {
      await db.collection("users").doc(currentUser.uid).update({
        [`lists.${listId}`]: null,
        [listId + 'Name']: null
      });
    } catch (error) {
      console.error("Error deleting list:", error);
      return;
    }
  }
  
  const row = document.getElementById(listId + 'Row');
  if (row) row.style.display = 'none';
  document.getElementById('addListBtn').style.display = 'flex';
}

// Detector de estado de autenticación con splash screen
auth.onAuthStateChanged(async (user) => {
  console.log('Estado de autenticación cambió:', user ? 'Logueado' : 'No logueado');
  
  // Función para ocultar splash y mostrar la vista correcta
const showFinalView = () => {
  clearSplashTimeout(); // Limpiar timeout de seguridad
  if (splashView) splashView.style.display = 'none';
  
  if (user) {
    // Usuario logueado
    document.getElementById('welcomeView').style.display = 'none';
  document.getElementById('authView').style.display = 'none';
  document.body.classList.remove('welcome-active');
  appView.classList.add('active');
  showList('selectorView');
} else {
    // No hay usuario  
     document.getElementById('welcomeView').style.display = 'block';
  document.getElementById('authView').style.display = 'none';
  document.body.classList.add('welcome-active');
  appView.classList.remove('active');
}
};
  
  if (user) {
    // Usuario está logueado
    console.log('Usuario detectado:', user.email);
    currentUser = user;
    
    try {
      // Cargar datos del usuario
      const doc = await db.collection("users").doc(user.uid).get();
      const userData = doc.data();
      
      // Actualizar el título con el nombre del usuario
      mainTitle.textContent = `Lista de la compra de ${userData.username}`;
      mainTitle.style.display = 'block';
      
      // PRIMERO: Resetear TODOS los nombres a valores por defecto
['list1','list2','list3','list4','list5'].forEach((id, i) => {
  const btnId = `${id}Button`;
  const el = document.getElementById(btnId);
  if (el) {
    el.textContent = `Lista ${i+1}`;
    const q = document.querySelector(`[data-button-id="${btnId}"]`);
    if (q) q.textContent = `Lista ${i+1}`;
  }
  const row = document.getElementById(`${id}Row`);
  if (row) row.style.display = i < 3 ? '' : 'none';
});

// Cargar nombres personalizados y visibilidad
      if (userData.list1Name) {
        document.querySelector('[data-button-id="list1Button"]').textContent = userData.list1Name;
        document.getElementById('list1Button').textContent = userData.list1Name;
      }
      if (userData.list2Name) {
        document.querySelector('[data-button-id="list2Button"]').textContent = userData.list2Name;
        document.getElementById('list2Button').textContent = userData.list2Name;
      }
      if (userData.list3Name) {
        document.querySelector('[data-button-id="list3Button"]').textContent = userData.list3Name;
        document.getElementById('list3Button').textContent = userData.list3Name;
      }
      if (userData.list4Name) {
        document.querySelector('[data-button-id="list4Button"]').textContent = userData.list4Name;
        document.getElementById('list4Button').textContent = userData.list4Name;
      }
      if (userData.list5Name) {
        document.querySelector('[data-button-id="list5Button"]').textContent = userData.list5Name;
        document.getElementById('list5Button').textContent = userData.list5Name;
      }
      
      // Mostrar listas extra según datos
      const lists = userData.lists || {};
      if (lists.hasOwnProperty('list4') && lists.list4 !== null) {
        document.getElementById('list4Row').style.display = '';
      }
      if (lists.hasOwnProperty('list5') && lists.list5 !== null) {
        document.getElementById('list5Row').style.display = '';
      }
      // Ocultar botón añadir si ya hay 5
      const listCount = Object.keys(lists).filter(k => k.startsWith('list') && lists[k] !== null).length;
      document.getElementById('addListBtn').style.display = listCount >= 5 ? 'none' : 'flex';
      
      // Mostrar vista después del delay solo en carga inicial
      if (isInitialLoad) {
        setTimeout(() => {
          showFinalView();
          isInitialLoad = false;
        }, 1500); // 1.5 segundos de splash
      } else {
        showFinalView(); // Sin delay si no es carga inicial
      }
      
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      auth.signOut(); // Si hay error, hacer logout
    }
  } else {
    // No hay usuario logueado
    console.log('No hay usuario logueado');
    currentUser = null;
    mainTitle.textContent = 'Lista de la compra by AKOBU';
    mainTitle.style.display = 'block';
    
    // Mostrar vista después del delay solo en carga inicial
    if (isInitialLoad) {
      setTimeout(() => {
        showFinalView();
        isInitialLoad = false;
      }, 1500); // 1.5 segundos de splash
    } else {
      showFinalView(); // Sin delay si no es carga inicial
    }
  }
});

async function changeUsername() {
  const newUsername = document.getElementById('currentUsername').value.trim();
  if (!newUsername || !currentUser) return;
  
  try {
    // Actualizar el nombre de usuario en Firestore
    await db.collection("users").doc(currentUser.uid).update({
      username: newUsername
    });
    
    // Actualizar el título de la aplicación
    mainTitle.textContent = `Lista de la compra de ${newUsername}`;
    
    // Mostrar mensaje de éxito
    showAccountMessage('Usuario cambiado correctamente', 'success');
    
  } catch (error) {
    console.error("Error al cambiar usuario:", error);
    showAccountMessage('Error al cambiar el usuario', 'error');
  }
}

async function changePassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;
  
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    showAccountMessage('Por favor, completa todos los campos', 'error');
    return;
  }
  
  if (newPassword !== confirmNewPassword) {
    showAccountMessage('Las contraseñas nuevas no coinciden', 'error');
    return;
  }
  
  if (newPassword.length < 6) {
    showAccountMessage('La nueva contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }
  
  try {
    // Reautenticar al usuario con la contraseña actual
    const credential = firebase.auth.EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );
    await currentUser.reauthenticateWithCredential(credential);
    
    // Cambiar la contraseña
    await currentUser.updatePassword(newPassword);
    
    // Limpiar los campos
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    
    showAccountMessage('Contraseña cambiada correctamente', 'success');
    
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    if (error.code === 'auth/wrong-password') {
      showAccountMessage('La contraseña actual es incorrecta', 'error');
    } else if (error.code === 'auth/weak-password') {
      showAccountMessage('La nueva contraseña es muy débil', 'error');
    } else {
      showAccountMessage('Error al cambiar la contraseña', 'error');
    }
  }
}

function showAccountMessage(message, type) {
  const messageDiv = document.getElementById('accountMessage');
  messageDiv.textContent = message;
  messageDiv.style.display = 'block';
  
  if (type === 'success') {
    messageDiv.style.backgroundColor = '#d4edda';
    messageDiv.style.color = '#155724';
    messageDiv.style.border = '1px solid #c3e6cb';
  } else {
    messageDiv.style.backgroundColor = '#f8d7da';
    messageDiv.style.color = '#721c24';
    messageDiv.style.border = '1px solid #f5c6cb';
  }
  
  // Ocultar el mensaje después de 5 segundos
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

async function loadAccountView() {
  if (!currentUser) return;
  
  try {
    const doc = await db.collection("users").doc(currentUser.uid).get();
    const userData = doc.data();
    
    // Cargar el email (solo lectura)
    document.getElementById('currentEmail').value = currentUser.email;
    
    // Cargar el nombre de usuario actual
    document.getElementById('currentUsername').value = userData.username || '';
    
  } catch (error) {
    console.error("Error al cargar datos de la cuenta:", error);
  }
}

// Inicialización - mostrar splash al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  if (splashView) {
    splashView.style.display = 'flex';
  }
  authView.style.display = 'none';
  appView.classList.remove('active');
});

function goToAbout() {
    const user = firebase.auth().currentUser;
    if (user) {
        const username = user.displayName || user.email || 'Usuario';
        window.location.href = `about.html?user=${encodeURIComponent(username)}`;
    } else {
        window.location.href = 'about.html';
    }
}

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('App visible again - refreshing lists');
        loadLists();
    }
});

function goToSuggestions() {
    let username = 'Usuario';
    
    // Intentar obtener el nombre del usuario actual
    if (currentUser && currentUser.displayName) {
        username = currentUser.displayName;
    } else if (currentUser && currentUser.email) {
        username = currentUser.email.split('@')[0]; // Usar parte antes del @
    }
    
    window.location.href = `suggestions.html?user=${encodeURIComponent(username)}`;
}

function goToBlog() {

    window.location.href = 'blog_dinamico.html';
}

    
// Registro y gestión del Service Worker

let updateAvailable = false;

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrado correctamente:', registration.scope);
        
        // Verificar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('Nueva versión del Service Worker encontrada');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Hay una nueva versión disponible
                updateAvailable = true;
                showUpdateNotification();
              } else {
                // Primera instalación
                console.log('Service Worker instalado por primera vez');
              }
            }
          });
        });
      })
      .catch(error => {
        console.error('Error al registrar Service Worker:', error);
      });
  });

  // Escuchar cambios en el Service Worker
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (updateAvailable) {
    // Marcar que acabamos de actualizar
    sessionStorage.setItem('justUpdated', 'true');
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }
});
}

// Función para mostrar notificación de actualización
function showUpdateNotification() {
 
    // Opción 2: Notificación personalizada 
  // Limpiar notificación anterior si existe
  const existingNotification = document.getElementById('update-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.id = 'update-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--accent);
      color: #fff;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      font-family: Arial, sans-serif;
      width: 250px;
      max-width: 90vw;
      font-size: 14px;
      line-height: 1.4;
      text-align: center;
    ">
      <strong>¡Nueva versión disponible!</strong><br>
      Actualizando aplicación...
    </div>
  `;
  
  // Agregar al DOM
  document.body.appendChild(notification);

updateApp();
}

 

// Función para actualizar la app
function updateApp() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  }
}

window.addEventListener('load', () => {
  // Verificar si acabamos de actualizar
  if (sessionStorage.getItem('justUpdated') === 'true') {
    sessionStorage.removeItem('justUpdated');
    showUpdateCompletedNotification();
  }
});

function showUpdateCompletedNotification() {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--accent);
      color: #fff;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      font-family: Arial, sans-serif;
      width: 250px;
      max-width: 90vw;
      font-size: 14px;
      text-align: center;
    ">
      <strong>¡Actualización completada!</strong><br><br>
      - Nueva pagina de bienvenida y nuevo blog!!<br>
      - Ahora se puede usar la app sin registro.<br>
      - Y algunos arreglos menores.<br><br>
      <!-- ¡Gracias a nuestra usuaria Irene por las sugerencias!<br> -->
      <!-- <br><br> -->
      <button onclick="this.closest('div').parentElement.remove()" style="
        background: white;
        color: var(--accent);
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      ">OK</button>
    </div>
  `;
  
  document.body.appendChild(notification);
}


// Variables para onboarding
let currentOnboardingStep = 0;
let isNewUser = false;
let isIOS = false;
let isAndroid = false;

// Detectar dispositivo
function detectDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  isIOS = /iphone|ipad|ipod/.test(userAgent);
  isAndroid = /android/.test(userAgent);
}

// Inicializar onboarding
function initOnboarding() {
  detectDevice();
  setupOnboardingEvents();
}

// Configurar eventos del onboarding
function setupOnboardingEvents() {
  document.getElementById('nextOnboarding').addEventListener('click', nextOnboardingStep);
  document.getElementById('skipOnboarding').addEventListener('click', closeOnboarding);
}

// Datos de los pasos
function getOnboardingSteps() {
  return [
    {
      icon: '📱',
      title: '¡Bienvenido a tu Lista de Compra!',
      text: 'Esta aplicación funciona como una app nativa. Te vamos a mostrar cómo instalarla en tu dispositivo.',
      showInstructions: false
    },
    {
      icon: isIOS ? '📤' : '⋮',
      title: isIOS ? 'Paso 1: Botón Compartir' : 'Paso 1: Menú del navegador',
      text: isIOS ? 'Toca el botón de compartir en la barra inferior de Safari' : 'Toca los tres puntos (⋮) en la esquina superior derecha de Chrome',
      showInstructions: true,
      step: 1
    },
    {
      icon: '➕',
      title: isIOS ? 'Paso 2: Añadir a Inicio' : 'Paso 2: Instalar App',
      text: isIOS ? 'Busca y toca "Añadir a pantalla de inicio"' : 'Toca "Instalar app" en el menú',
      showInstructions: true,
      step: 2
    },
    {
      icon: '🏠',
      title: '¡Listo para usar!',
      text: 'Una vez instalada, podrás acceder a tu lista de compra directamente desde tu pantalla de inicio, ¡como cualquier otra app!',
      showInstructions: false
    }
  ];
}

// Actualizar contenido del paso
function updateOnboardingStep() {
  const steps = getOnboardingSteps();
  const currentStep = steps[currentOnboardingStep];
  
  // Actualizar indicadores de progreso
  document.querySelectorAll('.progress-dot').forEach((dot, index) => {
    dot.classList.toggle('active', index <= currentOnboardingStep);
  });
  
  // Actualizar contenido
  document.getElementById('onboardingIcon').textContent = currentStep.icon;
  document.getElementById('onboardingTitle').textContent = currentStep.title;
  document.getElementById('onboardingText').textContent = currentStep.text;
  
  // Mostrar/ocultar instrucciones
  const container = document.getElementById('instructionsContainer');
  if (currentStep.showInstructions) {
    container.style.display = 'block';
    updateInstructionVisual(currentStep.step);
  } else {
    container.style.display = 'none';
  }
  
  // Actualizar botón
  const nextBtn = document.getElementById('nextOnboarding');
  nextBtn.textContent = currentOnboardingStep === steps.length - 1 ? '¡Empezar!' : 'Siguiente';
}

// Actualizar visual de instrucciones
function updateInstructionVisual(step) {
  const mockup = document.getElementById('phoneMockup');
  const instructionText = document.getElementById('instructionText');
  
  if (isIOS && step === 1) {
    mockup.innerHTML = `
      <img src="ios-step1.jpeg" 
           alt="Paso 1 iOS" 
           style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">
    `;
  } else if (isIOS && step === 2) {
    mockup.innerHTML = `
      <img src="ios-step2.jpeg" 
           alt="Paso 2 iOS" 
           style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">
    `;
  } else if (isAndroid && step === 1) {
    mockup.innerHTML = `
      <img src="android-step1.jpeg" 
           alt="Paso 1 Android" 
           style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">
    `;
  } else if (isAndroid && step === 2) {
    mockup.innerHTML = `
      <img src="android-step2.jpeg" 
           alt="Paso 2 Android" 
           style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">
    `;
  }
  
}

// Siguiente paso del onboarding
function nextOnboardingStep() {
  const steps = getOnboardingSteps();
  if (currentOnboardingStep < steps.length - 1) {
    currentOnboardingStep++;
    updateOnboardingStep();
  } else {
    closeOnboarding();
  }
}

// Cerrar onboarding
function closeOnboarding() {
  document.getElementById('pwaOnboarding').style.display = 'none';
  
  // 👈 AQUÍ es donde debe activarse la app
  appView.classList.add('active');
  loadLists(); // También cargar las listas
  
  // Marcar que el usuario ya vio el onboarding
  if (currentUser) {
    db.collection("users").doc(currentUser.uid).update({
      hasSeenOnboarding: true
    });
  }
}

// Mostrar onboarding
function showOnboarding() {
  currentOnboardingStep = 0;
  updateOnboardingStep();
  document.getElementById('pwaOnboarding').style.display = 'flex';
}

// Inicializar cuando carga la página
document.addEventListener('DOMContentLoaded', initOnboarding);

function showVersion() {
  if (navigator.serviceWorker.controller) {
    // Escuchar respuesta del SW
    navigator.serviceWorker.addEventListener('message', event => {
      document.getElementById('version-display').textContent = `Versión ${event.data}`;
    });
    
    // Pedir versión al SW
    navigator.serviceWorker.controller.postMessage('GET_VERSION');
  }
}

// Llamar cuando se carga la página
document.addEventListener('DOMContentLoaded', showVersion);

// Funciones para navegación desde welcome view
function showAuthView(mode) {
  // Ocultar welcome view
  document.getElementById('welcomeView').style.display = 'none';
  document.body.classList.remove('welcome-active');
  
  // Mostrar auth view
  document.getElementById('authView').style.display = 'block';
  authMode = mode || 'login';
  
  // Configurar modo (login o register)
  if (mode === 'register') {
    // Cambiar a modo registro
    document.getElementById('authTitle').textContent = 'Regístrate';
    document.getElementById('username').style.display = 'block';
    document.getElementById('confirmPassword').style.display = 'block';
    document.getElementById('authButton').textContent = 'Registrar';
    document.getElementById('toggleAuth').innerHTML = '¿Ya tienes cuenta? <span>Inicia sesión</span>';
    document.getElementById('forgotPassword').style.display = 'none';
  } else {
    // Cambiar a modo login
    document.getElementById('authTitle').textContent = 'Iniciar sesión';
    document.getElementById('username').style.display = 'none';
    document.getElementById('confirmPassword').style.display = 'none';
    document.getElementById('authButton').textContent = 'Entrar';
    document.getElementById('toggleAuth').innerHTML = '¿No tienes cuenta? <span>Regístrate</span>';
    document.getElementById('forgotPassword').style.display = 'block';
  }
  
  // Limpiar campos
  document.getElementById('authForm').reset();
  document.getElementById('authMessage').textContent = '';
}

function useWithoutRegister() {
  // Redirigir a la página de sin registro
  window.location.href = 'offline.html'; // Cambia por el nombre real de tu archivo
}

function goToWelcome() {
    document.getElementById('authView').style.display = 'none';
    document.getElementById('welcomeView').style.display = 'block';
}

    
document.addEventListener('DOMContentLoaded', function() {
    loadBlogPreview();
});

async function loadBlogPreview() {
    const container = document.getElementById('blogPreview');
    
    try {
        const response = await fetch('blog-articles.json');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const data = await response.json();
        renderBlogPreview(data.articles);
        
    } catch (error) {
        console.error('Error cargando artículos:', error);
        container.innerHTML = '<p style="color: #666; text-align: center;">No se pudieron cargar los últimos artículos.</p>';
    }
}

function renderBlogPreview(articles) {
    const container = document.getElementById('blogPreview');
    
    // Ordenar por fecha y tomar solo los 3 más recientes
    const recentArticles = articles
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
    
    container.innerHTML = '';
    
    recentArticles.forEach((article, index) => {
        const date = new Date(article.date);
        const formattedDate = date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const articleElement = document.createElement('article');
        articleElement.style.cssText = `padding: 15px 0; ${index < 2 ? 'border-bottom: 1px solid #eee;' : ''}`;
        
        articleElement.innerHTML = `
            <h3 style="font-size: 18px; margin-bottom: 8px; color: #333;">${article.title}</h3>
            <p style="color: #666; margin-bottom: 8px; font-size: 16px;">${article.excerpt}</p>
            <span style="color: #999; font-size: 14px;">${formattedDate}</span>
        `;
        
        container.appendChild(articleElement);
    });
}
    // Verificar consentimiento cuando carga la página
  document.addEventListener('DOMContentLoaded', function() {
    checkCookieConsent();
  });
