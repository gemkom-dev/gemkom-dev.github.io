import { initNavbar } from '../components/navbar.js';
import { guardRoute } from '../authService.js';
import { authedFetch } from '../authService.js';
import { backendBase } from '../base.js';
import Sidebar from '../components/sidebar.js';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = {
    currentSection: 'view-requests', // Default to "Bakım Taleplerini Görüntüle"
    maintenanceRequests: [],
    currentFilter: 'all'
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchMaintenanceRequests() {
    try {
        const response = await authedFetch(`${backendBase}/machines/faults/`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch maintenance requests');
        }
        
        const requests = await response.json();
        state.maintenanceRequests = requests;
        return requests;
    } catch (error) {
        console.error('Error fetching maintenance requests:', error);
        throw error;
    }
}

async function fetchMachines() {
    try {
        const response = await authedFetch(`${backendBase}/machines/`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch machines');
        }
        
        const machines = await response.json();
        return machines;
    } catch (error) {
        console.error('Error fetching machines:', error);
        throw error;
    }
}

// ============================================================================
// CONTENT MANAGEMENT
// ============================================================================

function createMaintenanceRequestForm() {
    return `
        <div class="maintenance-section active" id="create-request">
            <h2>Bakım/Arıza Talebi Oluştur</h2>
            <p class="description">Yeni bir bakım veya arıza talebi oluşturun.</p>
            
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <form id="maintenance-request-form">
                                <div class="mb-3">
                                    <label for="machine-select" class="form-label">Makine Seçin</label>
                                    <select class="form-select" id="machine-select" required>
                                        <option value="">Makine seçin...</option>
                                        <!-- Machines will be loaded dynamically -->
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="request-type" class="form-label">Talep Türü</label>
                                    <select class="form-select" id="request-type" required>
                                        <option value="">Tür seçin...</option>
                                        <option value="maintenance">Bakım</option>
                                        <option value="fault">Arıza</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3" id="fault-operable-container" style="display: none;">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="is-operable" checked>
                                        <label class="form-check-label" for="is-operable">
                                            Makine çalışır durumda
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="description" class="form-label">Açıklama</label>
                                    <textarea class="form-control" id="description" rows="4" 
                                              placeholder="Bakım/arıza detaylarını açıklayın..." required></textarea>
                                </div>
                                
                                <div class="text-end">
                                    <button type="submit" class="btn btn-primary">Talep Oluştur</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Bilgi</h5>
                            <p class="card-text">
                                Bakım talepleri planlı bakım işlemleri için kullanılır.<br><br>
                                Arıza talepleri acil durumlar ve beklenmeyen sorunlar için kullanılır.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createViewRequestsSection() {
    return `
        <div class="maintenance-section active" id="view-requests">
            <h2>Bakım Taleplerini Görüntüle</h2>
            <p class="description">Mevcut bakım ve arıza taleplerini görüntüleyin ve yönetin.</p>
            
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="card-title mb-0">Bakım Talepleri</h5>
                                <div class="btn-group" role="group">
                                    <button type="button" class="btn btn-outline-primary active" data-filter="all">Tümü</button>
                                    <button type="button" class="btn btn-outline-primary" data-filter="maintenance">Bakım</button>
                                    <button type="button" class="btn btn-outline-primary" data-filter="fault">Arıza</button>
                                </div>
                            </div>
                            
                            <div id="requests-list">
                                <div class="text-center py-4">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Yükleniyor...</span>
                                    </div>
                                    <p class="mt-2">Talepler yükleniyor...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderMaintenanceRequests() {
    const requestsList = document.getElementById('requests-list');
    
    if (!requestsList) return;
    
    const filteredRequests = filterRequests(state.maintenanceRequests, state.currentFilter);
    
    if (filteredRequests.length === 0) {
        requestsList.innerHTML = `
            <div class="text-center py-4">
                <p class="text-muted">Gösterilecek talep bulunamadı.</p>
            </div>
        `;
        return;
    }
    
    const requestsHTML = filteredRequests.map(request => createRequestCard(request)).join('');
    requestsList.innerHTML = requestsHTML;
}

function filterRequests(requests, filter) {
    if (filter === 'all') {
        return requests;
    }
    // Assuming the API response has a type field or we can determine type from other fields
    // You may need to adjust this based on the actual API response structure
    return requests.filter(request => {
        // This is a placeholder - adjust based on actual API response
        return true; // For now, show all requests
    });
}

function createRequestCard(request) {
    const statusClass = request.resolved_at ? 'success' : 'warning';
    const statusText = request.resolved_at ? 'Çözüldü' : 'Açık';
    const statusIcon = request.resolved_at ? '✅' : '⚠️';
    
    // Format dates properly
    const reportedAt = new Date(request.reported_at).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    const resolvedAt = request.resolved_at ? new Date(request.resolved_at).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }) : '-';
    
    // Create breaking status indicator
    const breakingStatus = request.is_breaking ? `
        <div class="mb-2">
            <span class="badge bg-danger">
                🛑 Makine Duruşta
            </span>
        </div>
    ` : '';
    
    // Create collapsible description
    const descriptionId = `description-${request.id}`;
    const descriptionContent = request.description || 'Açıklama yok';
    
    const collapsibleDescription = `
        <div class="description-toggle-container">
            <button class="btn btn-link btn-sm p-0 description-toggle" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#${descriptionId}" 
                    aria-expanded="false" 
                    aria-controls="${descriptionId}">
                <strong>Açıklamayı Görüntüle</strong> ▼
            </button>
            <div class="collapse" id="${descriptionId}">
                <div class="description-content mt-2">
                    ${descriptionContent}
                </div>
            </div>
        </div>
    `;
    
    return `
        <div class="card mb-3">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h6 class="card-title">${request.machine_name || 'Makine Adı Yok'}</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <small class="text-muted">
                                    <strong>Bildirilme:</strong> ${reportedAt}
                                </small>
                            </div>
                            <div class="col-md-6">
                                <small class="text-muted">
                                    <strong>Çözülme:</strong> ${resolvedAt}
                                </small>
                            </div>
                        </div>
                        <div class="card-text mt-2">
                            ${collapsibleDescription}
                        </div>
                    </div>
                    <div class="col-md-4 text-end">
                        <span class="badge bg-${statusClass}">
                            ${statusIcon} ${statusText}
                        </span>
                        ${breakingStatus}
                        <small class="text-muted">
                            <strong>Bildiren:</strong> ${request.reported_by_username || 'Bilinmiyor'}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadContent() {
    console.log("loadContent");
    const contentContainer = document.getElementById('maintenance-content');
    
    // Clear existing content
    contentContainer.innerHTML = '';
    
    // Add both sections (one will be active)
    contentContainer.innerHTML = createMaintenanceRequestForm() + createViewRequestsSection();
    
    // Show the current section
    showSection(state.currentSection);
    
    // Load maintenance requests if viewing that section
    if (state.currentSection === 'view-requests') {
        loadMaintenanceRequests();
    }
    
    else if (state.currentSection === 'create-request') {
        console.log('create-request');
        loadMachines();
        setupMaintenanceRequestForm();
    }
    console.log("HELLO");
}

async function loadMaintenanceRequests() {
    try {
        await fetchMaintenanceRequests();
        renderMaintenanceRequests();
        setupFilterHandlers();
    } catch (error) {
        const requestsList = document.getElementById('requests-list');
        if (requestsList) {
            requestsList.innerHTML = `
                <div class="text-center py-4">
                    <div class="alert alert-danger">
                        <p>Talep yüklenirken hata oluştu.</p>
                        <button class="btn btn-outline-danger btn-sm" onclick="location.reload()">Tekrar Dene</button>
                    </div>
                </div>
            `;
        }
    }
}

function setupFilterHandlers() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            e.target.classList.add('active');
            
            // Update filter and re-render
            state.currentFilter = e.target.dataset.filter;
            renderMaintenanceRequests();
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.maintenance-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update state
    state.currentSection = sectionId;
    
    // Load maintenance requests if switching to that section
    if (sectionId === 'view-requests') {
        loadMaintenanceRequests();
    }
    
    // Load machines if switching to create request section
    if (sectionId === 'create-request') {
        loadMachines();
        setupMaintenanceRequestForm();
    }
}

// ============================================================================
// SIDEBAR SETUP
// ============================================================================

function setupSidebar() {
    const sidebarRoot = document.getElementById('sidebar-root');
    const sidebar = new Sidebar(sidebarRoot);
    
    // Add sidebar items
    const createRequestItem = sidebar.addItem('Bakım/Arıza Talebi Oluştur');
    const viewRequestsItem = sidebar.addItem('Bakım Taleplerini Görüntüle');
    
    // Add click handlers
    createRequestItem.addEventListener('click', () => {
        showSection('create-request');
        updateSidebarActiveState(createRequestItem, viewRequestsItem);
    });
    
    viewRequestsItem.addEventListener('click', () => {
        showSection('view-requests');
        updateSidebarActiveState(viewRequestsItem, createRequestItem);
    });
    
    // Highlight the default active item
    updateSidebarActiveState(viewRequestsItem, createRequestItem);
}

function updateSidebarActiveState(activeItem, inactiveItem) {
    // Remove active class from all items
    activeItem.classList.remove('active');
    inactiveItem.classList.remove('active');
    
    // Add active class to the clicked item
    activeItem.classList.add('active');
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    if (!guardRoute()) {
        return;
    }
    
    initNavbar();
    setupSidebar();
    loadContent();
});

async function loadMachines() {
    const machineSelect = document.getElementById('machine-select');
    if (!machineSelect) return;
    
    // Show loading state
    machineSelect.innerHTML = '<option value="">Makineler yükleniyor...</option>';
    machineSelect.disabled = true;
    
    try {
        const machines = await fetchMachines();
        populateMachinesDropdown(machines);
    } catch (error) {
        machineSelect.innerHTML = `
            <option value="">Makine yüklenirken hata oluştu</option>
        `;
        machineSelect.disabled = true;
        console.error('Error loading machines:', error);
    }
}

function populateMachinesDropdown(machines) {
    const machineSelect = document.getElementById('machine-select');
    if (!machineSelect) return;
    
    // Clear existing options except the first placeholder
    machineSelect.innerHTML = '<option value="">Makine seçin...</option>';
    
    // Add machine options
    machines.forEach(machine => {
        const option = document.createElement('option');
        option.value = machine.id;
        option.textContent = machine.name || `Makine ${machine.id}`;
        machineSelect.appendChild(option);
    });
    
    // Enable the select if it was disabled during loading
    machineSelect.disabled = false;
}

function setupMaintenanceRequestForm() {
    const form = document.getElementById('maintenance-request-form');
    if (!form) return;
    
    // Add event listener for request type changes
    const requestTypeSelect = document.getElementById('request-type');
    const faultOperableContainer = document.getElementById('fault-operable-container');
    
    if (requestTypeSelect && faultOperableContainer) {
        requestTypeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'fault') {
                faultOperableContainer.style.display = 'block';
            } else {
                faultOperableContainer.style.display = 'none';
            }
        });
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const machineId = document.getElementById('machine-select').value;
        const requestType = document.getElementById('request-type').value;
        const description = document.getElementById('description').value;
        const isOperable = document.getElementById('is-operable').checked;
        
        if (!machineId || !requestType || !description) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }
        
        try {
            await createMaintenanceRequest({
                machine: machineId,
                is_maintenance: requestType === 'maintenance',
                description: description,
                is_breaking: !isOperable
            });
            
            // Reset form
            form.reset();
            // Hide the operable checkbox after form reset
            if (faultOperableContainer) {
                faultOperableContainer.style.display = 'none';
            }
            alert('Bakım talebi başarıyla oluşturuldu.');
            
            // Switch to view requests to see the new request
            showSection('view-requests');
            
        } catch (error) {
            console.error('Error creating maintenance request:', error);
            alert('Bakım talebi oluşturulurken hata oluştu.');
        }
    });
}

async function createMaintenanceRequest(requestData) {
    const response = await authedFetch(`${backendBase}/machines/faults/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
        throw new Error('Failed to create maintenance request');
    }
    
    return response.json();
}