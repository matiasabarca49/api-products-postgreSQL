// Base URL - Ajustar según tu configuración
const API_URL = 'http://localhost:8080/api/users';

let users = [];
let currentFilters = {
    search: '',
    role: '',
    sortBy: 'name'
};

// Cargar usuarios al iniciar
loadUsers();

// Event Listeners
document.getElementById('searchInput').addEventListener('input', (e) => {
    currentFilters.search = e.target.value;
    applyFilters();
});

document.getElementById('roleFilter').addEventListener('change', (e) => {
    currentFilters.role = e.target.value;
    applyFilters();
});

document.getElementById('sortBy').addEventListener('change', (e) => {
    currentFilters.sortBy = e.target.value;
    applyFilters();
});

document.getElementById('userForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveUser();
});

document.getElementById('addUserBtn').addEventListener('click', () => {
    openModal('add');
});

document.getElementById('closeModalBtn').addEventListener('click', () => {
    closeModal();
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    closeModal();
});

// Cargar usuarios
async function loadUsers() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log("Usuarios obtenidos: ", data);
        users = data.data.docs || [];
        applyFilters();
    } catch (error) {
        showError('Error al cargar usuarios: ' + error.message);
    }
}

// Aplicar filtros
function applyFilters() {
    let filteredUsers = [...users];

    // Filtro de búsqueda
    if (currentFilters.search) {
        const search = currentFilters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
            user.name?.toLowerCase().includes(search) ||
            user.last_name?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search) ||
            (user._id && user._id.toLowerCase().includes(search)) ||
            (user.id && user.id.toString().toLowerCase().includes(search))
        );
    }

    // Filtro por rol
    if (currentFilters.role) {
        filteredUsers = filteredUsers.filter(user => user.rol === currentFilters.role);
    }

    // Ordenar
    filteredUsers.sort((a, b) => {
        const aVal = a[currentFilters.sortBy] || '';
        const bVal = b[currentFilters.sortBy] || '';
        return aVal.toString().localeCompare(bVal.toString());
    });

    renderUsers(filteredUsers);
}

// Renderizar usuarios
function renderUsers(usersToRender) {
    const grid = document.getElementById('usersGrid');
    grid.innerHTML = '';

    if (usersToRender.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <h3>No se encontraron usuarios</h3>
                <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
        `;
        return;
    }

    usersToRender.forEach(user => {
        const userId = user.id;
        const card = document.createElement('div');
        card.className = 'user-card';
        
        const deleteButton = user.rol !== 'Admin' 
            ? `<button class="delete-btn" onclick="deleteUser('${userId}')">×</button>` 
            : '';
        
        card.innerHTML = `
            <div class="card-header">
                <p class="card-id">ID: ${userId}</p>
                <div class="header-buttons">
                    <button class="edit-btn" onclick="openModal('edit', '${userId}')">✏</button>
                    ${deleteButton}
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-name">${user.name} ${user.last_name}</h5>
                <p class="card-email">${user.email}</p>
            </div>
            <div class="card-footer">
                <span class="card-role">${user.rol}</span>
                <span class="card-age">Edad: ${user.age || 'N/A'}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Abrir modal
function openModal(mode, userId = null) {

    console.log("Abriendo modal en modo: ", mode, " para usuario ID: ", userId);
    console.log("Usuarios disponibles: ", users);
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('userForm');
    const passwordGroup = document.getElementById('passwordGroup');
    const passwordInput = document.getElementById('userPassword');
    
    form.reset();
    
    if (mode === 'add') {
        modalTitle.textContent = 'Agregar Usuario';
        document.getElementById('userId').value = '';
        passwordInput.required = true;
        passwordGroup.style.display = 'block';
    } else {
        modalTitle.textContent = 'Editar Usuario';
        const user = users.find(u => u.id === parseInt(userId));
        console.log("Usuario seleccionado para editar: ", user);
        if (user) {
            document.getElementById('userId').value = user._id || user.id;
            document.getElementById('userName').value = user.name;
            document.getElementById('userLastName').value = user.last_name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userAge').value = user.age || '';
            document.getElementById('userRole').value = user.rol;
            passwordInput.required = false;
            passwordGroup.style.display = 'none';
        }
    }
    
    modal.style.display = 'block';
}

// Cerrar modal
function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Guardar usuario (crear o editar)
async function saveUser() {
    const userId = document.getElementById('userId').value;
    const userData = {
        name: document.getElementById('userName').value,
        last_name: document.getElementById('userLastName').value,
        email: document.getElementById('userEmail').value,
        age: parseInt(document.getElementById('userAge').value) || undefined,
        rol: document.getElementById('userRole').value
    };

    // Solo incluir password si está presente
    const password = document.getElementById('userPassword').value;
    if (password) {
        userData.password = password;
    }

    try {
        let response;
        if (userId) {
            // Editar usuario existente
            response = await fetch(`${API_URL}/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
        } else {
            // Crear nuevo usuario
            if (!password) {
                showError('La contraseña es requerida para nuevos usuarios');
                return;
            }
            response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
        }

        const data = await response.json();
        
        if (response.ok) {
            closeModal();
            loadUsers();
            showSuccess(userId ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
        } else {
            showError(data.message || 'Error al guardar usuario');
        }
    } catch (error) {
        showError('Error al guardar usuario: ' + error.message);
    }
}

// Eliminar usuario
async function deleteUser(userId) {
    if (!confirm('¿Está seguro de eliminar este usuario?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            loadUsers();
            showSuccess('Usuario eliminado exitosamente');
        } else {
            const data = await response.json();
            showError(data.message || 'Error al eliminar usuario');
        }
    } catch (error) {
        showError('Error al eliminar usuario: ' + error.message);
    }
}

// Mostrar mensaje de error
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    errorText.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a52)';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 4000);
}

// Mostrar mensaje de éxito
function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const errorTitle = errorDiv.querySelector('h3');
    errorTitle.textContent = 'Éxito';
    errorText.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
        errorTitle.textContent = 'Error';
    }, 3000);
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        closeModal();
    }
}