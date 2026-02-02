/**
 * Property Folder System
 * Handles folder-based property management with documents and valuations
 */

console.log('!!! VALUATIONS.JS EXECUTING !!!');
window.VALUATIONS_TEST = true;

const VALUATIONS_API_BASE_URL = 'http://localhost:8000';

// Global state
let currentPropertyForDetail = null;
let currentFilter = 'Active';  // 'Active' (Owned+Rented) or 'Sold'
window.allProperties = [];
let currentPreviewDocument = null;

/**
 * Initialize folder system when section becomes active
 */
console.log('[Valuations.js] File loaded');

async function initializePropertyFolders() {
    console.log('[Valuations.js] initializePropertyFolders called');
    await loadAllProperties();
    renderPropertyFolders();
}

/**
 * Load all properties
 */
async function loadAllProperties() {
    console.log('[Valuations.js] loadAllProperties called');
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${VALUATIONS_API_BASE_URL}/api/realestate/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.warn('[Valuations.js] Unauthorized - clearing session and redirecting');
                // Use dashboard.js logout if available, otherwise manual clear
                if (typeof window.logout === 'function') {
                    window.logout();
                } else {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user_email');
                    localStorage.removeItem('aether_realestate_transactions');
                    window.location.href = 'index.html';
                }
                return;
            }
            const errorText = await response.text();
            throw new Error(`Failed to fetch properties: ${response.status} ${response.statusText} - ${errorText}`);
        }
        window.allProperties = await response.json();

        // Update counts
        updatePropertyCounts();
    } catch (error) {
        console.error('Error loading properties:', error);
        window.allProperties = [];
    }
}

/**
 * Update property counts in toggle buttons
 */
function updatePropertyCounts() {
    // Active = Owned + Rented
    const activeCount = window.allProperties.filter(p => p.status === 'Owned' || p.status === 'Rented').length;
    const soldCount = window.allProperties.filter(p => p.status === 'Sold').length;

    document.getElementById('active-count').textContent = `(${activeCount})`;
    document.getElementById('sold-count').textContent = `(${soldCount})`;
}

/**
 * Filter properties by status
 */
function filterPropertiesByStatus(status) {
    currentFilter = status;

    // Update toggle button states
    document.querySelectorAll('.property-status-toggle .toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-status') === status);
    });

    // Re-render folders
    renderPropertyFolders();
}

/**
 * Render property folder cards
 */
async function renderPropertyFolders() {
    const container = document.getElementById('property-folders-grid');
    if (!container) return;

    // Filter properties by current filter
    let filteredProperties;
    if (currentFilter === 'Active') {
        // Active = Owned OR Rented
        filteredProperties = window.allProperties.filter(p => p.status === 'Owned' || p.status === 'Rented');
    } else {
        // Sold
        filteredProperties = window.allProperties.filter(p => p.status === 'Sold');
    }

    if (filteredProperties.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text-white-50 mb-3" style="font-size: 3rem;">📁</div>
                <h5 class="text-white mb-2">No ${currentFilter} Properties</h5>
                <p class="text-white-50 small">Click "Add Property" to get started</p>
            </div>
        `;
        return;
    }

    // Fetch counts for each property
    const foldersHTML = await Promise.all(filteredProperties.map(async (property) => {
        const counts = await getPropertyCounts(property.id);
        const value = property.current_value || property.purchase_price || 0;
        const formattedValue = `₹${(value / 100000).toFixed(2)}L`;

        return `
            <div class="col-lg-4 col-md-6">
                <div class="property-folder-card" onclick="openPropertyDetail('${property.id}')">
                    <div class="folder-icon">📁</div>
                    <h5 class="property-name text-white mb-2">${property.name}</h5>
                    <div class="property-value text-white mb-3">${formattedValue}</div>
                    <div class="folder-stats">
                        <span class="stat-item">
                            <span class="stat-icon">📄</span>
                            <span class="stat-text">${counts.documents} docs</span>
                        </span>
                        <span class="stat-item">
                            <span class="stat-icon">💰</span>
                            <span class="stat-text">${counts.valuations} entries</span>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }));

    container.innerHTML = foldersHTML.join('');
}

/**
 * Get document and valuation counts for a property
 */
async function getPropertyCounts(propertyId) {
    try {
        const token = localStorage.getItem('access_token');

        // Fetch documents
        const docsResponse = await fetch(`${VALUATIONS_API_BASE_URL}/api/realestate/documents?property_id=${propertyId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const documents = docsResponse.ok ? await docsResponse.json() : [];

        // Fetch valuations
        const valsResponse = await fetch(`${VALUATIONS_API_BASE_URL}/api/realestate/valuations/${propertyId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const valuations = valsResponse.ok ? await valsResponse.json() : [];

        return {
            documents: documents.length,
            valuations: valuations.length
        };
    } catch (error) {
        console.error('Error fetching counts:', error);
        return { documents: 0, valuations: 0 };
    }
}

/**
 * Open property detail panel
 */
async function openPropertyDetail(propertyId) {
    currentPropertyForDetail = window.allProperties.find(p => p.id === propertyId);
    if (!currentPropertyForDetail) return;

    // Hide folders, show detail panel
    document.getElementById('property-folders-grid').style.display = 'none';
    const detailPanel = document.getElementById('property-detail-panel');
    detailPanel.style.display = 'block';

    // Set property name
    document.getElementById('detail-property-name').textContent = currentPropertyForDetail.name;

    // Load documents and valuations
    await loadPropertyDocuments(propertyId);
    await loadPropertyValuations(propertyId);
}

/**
 * Close property detail panel
 */
function closePropertyDetail() {
    document.getElementById('property-detail-panel').style.display = 'none';
    document.getElementById('property-folders-grid').style.display = 'flex';
    currentPropertyForDetail = null;
}

/**
 * Load documents for property detail view
 */
async function loadPropertyDocuments(propertyId) {
    const container = document.getElementById('detail-documents-list');

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${VALUATIONS_API_BASE_URL}/api/realestate/documents/property/${propertyId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch documents');
        const documents = await response.json();

        if (documents.length === 0) {
            container.innerHTML = `
                <div class="text-center text-white-50 py-4 small">
                    <div class="mb-2 opacity-50">📂</div>
                    No documents uploaded yet
                </div>
            `;
            return;
        }

        container.innerHTML = documents.map(doc => {
            const uploadDate = new Date(doc.uploaded_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            return `
                <div class="document-item d-flex justify-content-between align-items-start py-3 px-3 mb-2" 
                     style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    <div class="d-flex gap-3 overflow-hidden cursor-pointer" 
                         onclick="viewDocument('${VALUATIONS_API_BASE_URL}${doc.file_url}', '${doc.file_name}')">
                        <div class="d-flex align-items-center justify-content-center flex-shrink-0" 
                             style="width: 40px; height: 40px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; color: #60a5fa;">
                            📄
                        </div>
                        <div class="d-flex flex-column" style="min-width: 0;">
                            <div class="text-white fw-medium small text-truncate">${doc.document_type}</div>
                            <div class="text-white-50 small text-truncate hover-text-white transition-colors" style="font-size: 0.75rem;">
                                ${doc.file_name}
                            </div>
                            ${doc.description ? `<div class="text-white-30 mt-1 small text-truncate" style="font-size: 0.7rem;">${doc.description}</div>` : ''}
                            <div class="text-white-20 mt-1" style="font-size: 0.65rem;">${uploadDate}</div>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-danger border-0 opacity-50 hover-opacity-100" 
                            onclick="event.stopPropagation(); deleteDocument('${doc.id}', '${propertyId}')" title="Delete Document">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading documents:', error);
        container.innerHTML = '<div class="text-center text-danger py-3 small">Failed to load documents</div>';
    }
}

/**
 * View document in modal
 */
async function viewDocument(fileUrl, fileName) {
    try {
        const modal = document.getElementById('document-preview-modal');
        const contentArea = document.getElementById('preview-content');
        const nameDisplay = document.getElementById('preview-doc-name');

        // Show modal
        modal.classList.remove('hidden');
        modal.style.display = 'block';
        if (nameDisplay) nameDisplay.textContent = fileName;

        // Show loading
        contentArea.innerHTML = `
            <div class="h-100 d-flex align-items-center justify-content-center">
                <div class="spinner-border text-white-50" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;

        // Fetch document content
        const token = localStorage.getItem('access_token');
        const response = await fetch(fileUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load document');

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const ext = fileName.split('.').pop().toLowerCase();

        // Store for download
        currentPreviewDocument = {
            url: blobUrl,
            filename: fileName,
            originalUrl: fileUrl
        };

        // Render based on type
        if (ext === 'pdf') {
            contentArea.innerHTML = `
                <iframe src="${blobUrl}" 
                    style="width: 100%; height: 100%; border: none; background: white; border-radius: 8px;"
                    title="PDF Preview">
                </iframe>
            `;
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
            contentArea.innerHTML = `
                <div class="h-100 d-flex align-items-center justify-content-center">
                    <img src="${blobUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px;">
                </div>
            `;
        } else {
            // Text or other
            contentArea.innerHTML = `
                <div class="h-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
                    <div class="mb-3 text-white-50">Preview not available for .${ext} files</div>
                    <button onclick="downloadCurrentDocument()" class="btn glass-button rounded-pill px-4">
                        Download File
                    </button>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error previewing document:', error);
        const contentArea = document.getElementById('preview-content');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="h-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
                    <div class="text-danger mb-2">Failed to load document</div>
                    <div class="text-white-50 small">${error.message}</div>
                </div>
            `;
        }
    }
}

function closeDocumentPreview() {
    const modal = document.getElementById('document-preview-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';

        // Clean up blob URL to prevent memory leaks
        if (currentPreviewDocument && currentPreviewDocument.url) {
            window.URL.revokeObjectURL(currentPreviewDocument.url);
        }
        currentPreviewDocument = null;

        // Clear content
        const contentArea = document.getElementById('preview-content');
        if (contentArea) contentArea.innerHTML = '';
    }
}

function downloadCurrentDocument() {
    if (!currentPreviewDocument) return;

    const a = document.createElement('a');
    a.href = currentPreviewDocument.url;
    a.download = currentPreviewDocument.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * Delete a document
 */
async function deleteDocument(documentId, propertyId) {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${VALUATIONS_API_BASE_URL}/api/realestate/documents/${documentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            // Reload documents
            loadPropertyDocuments(propertyId);
            // Update document count if function exists
            if (typeof updatePropertyCounts === 'function') updatePropertyCounts();
        } else {
            alert('Failed to delete document');
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        alert('Error deleting document');
    }
}


/**
 * Load valuations table for property detail view
 */
async function loadPropertyValuations(propertyId) {
    const tbody = document.getElementById('valuation-table-body');

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${VALUATIONS_API_BASE_URL}/api/realestate/valuations/${propertyId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch valuations');
        const valuations = await response.json();

        if (valuations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-white-50 py-4">
                        No valuation history yet
                    </td>
                </tr>
            `;
            return;
        }

        // Sort by date descending
        valuations.sort((a, b) => new Date(b.valuation_date) - new Date(a.valuation_date));

        tbody.innerHTML = valuations.map(val => {
            const date = new Date(val.valuation_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            const value = `₹${(val.value / 100000).toFixed(2)}L`;
            const source = val.source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const isCurrent = val.source === 'current';

            return `
                <tr>
                    <td class="text-white">${date}</td>
                    <td class="text-white fw-medium">${value}</td>
                    <td class="text-white-50">${source}</td>
                    <td>
                        ${isCurrent ?
                    '<span class="badge bg-success-subtle text-success">Current</span>' :
                    `<button class="btn btn-sm btn-outline-danger" onclick="deleteValuation('${val.id}')">×</button>`
                }
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading valuations:', error);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Failed to load valuations</td></tr>';
    }
}

/**
 * Open valuation modal for current property in detail view
 */
function openValuationModalForProperty() {
    if (!currentPropertyForDetail) return;
    openValuationModal(currentPropertyForDetail.id, currentPropertyForDetail.name);
}

/**
 * Open valuation modal (reuse from original implementation)
 */
function openValuationModal(propertyId, propertyName) {
    document.getElementById('valuationPropertyId').value = propertyId;
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('valuationDate').setAttribute('max', today);
    document.getElementById('valuationForm').reset();
    const modal = new bootstrap.Modal(document.getElementById('addValuationModal'));
    modal.show();
}

/**
 * Save valuation (modified to refresh detail view)
 */
async function saveValuation() {
    const propertyId = document.getElementById('valuationPropertyId').value;
    const date = document.getElementById('valuationDate').value;
    const value = document.getElementById('valuationValue').value;
    const source = document.querySelector('input[name="valuationSource"]:checked').value;
    const notes = document.getElementById('valuationNotes').value;

    if (!propertyId || !date || !value) {
        alert('Please fill all required fields');
        return;
    }

    if (parseFloat(value) <= 0) {
        alert('Value must be greater than zero');
        return;
    }

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${VALUATIONS_API_BASE_URL}/api/realestate/valuations/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                property_id: propertyId,
                valuation_date: date,
                value: parseFloat(value),
                source: source,
                notes: notes || null
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to save valuation');
        }

        alert('Valuation added successfully!');
        bootstrap.Modal.getInstance(document.getElementById('addValuationModal')).hide();

        // Reload valuation table if in detail view
        if (currentPropertyForDetail) {
            await loadPropertyValuations(propertyId);
        }

    } catch (error) {
        console.error('Error saving valuation:', error);
        alert(error.message);
    }
}

/**
 * Delete valuation
 */
async function deleteValuation(valuationId) {
    if (!confirm('Are you sure you want to delete this valuation?')) return;

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${VALUATIONS_API_BASE_URL}/api/realestate/valuations/${valuationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to delete valuation');

        alert('Valuation deleted successfully!');

        // Reload if in detail view
        if (currentPropertyForDetail) {
            await loadPropertyValuations(currentPropertyForDetail.id);
        }

    } catch (error) {
        console.error('Error deleting valuation:', error);
        alert(error.message);
    }
}


// ==========================================
// DOCUMENT UPLOAD HANDLERS
// ==========================================

function openUploadDocumentModal() {
    if (!currentPropertyForDetail) {
        console.error('No property selected for upload');
        return;
    }

    const modal = document.getElementById('upload-document-modal');
    if (modal) {
        // Reset form
        const form = document.getElementById('uploadDocumentForm');
        if (form) form.reset();

        // Reset file name display
        const fileNameDisplay = document.getElementById('fileName');
        if (fileNameDisplay) fileNameDisplay.textContent = '';

        modal.classList.remove('hidden');
        modal.style.display = 'block';
    }
}

function closeUploadDocumentModal() {
    const modal = document.getElementById('upload-document-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';

        // Reset form
        const form = document.getElementById('uploadDocumentForm');
        if (form) form.reset();

        const fileNameDisplay = document.getElementById('fileName');
        if (fileNameDisplay) fileNameDisplay.textContent = '';
    }
}

async function submitUploadDocument(event) {
    event.preventDefault();

    if (!currentPropertyForDetail) {
        alert('No property selected context found.');
        return;
    }

    const fileInput = document.getElementById('docFile');
    const docTypeInput = document.getElementById('docType');
    const descriptionInput = document.getElementById('docDescription');

    const file = fileInput.files[0];
    const docType = docTypeInput.value;
    const description = descriptionInput ? descriptionInput.value : '';

    if (!file) {
        alert('Please select a file.');
        return;
    }
    if (!docType) {
        alert('Please select a document type.');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('property_id', currentPropertyForDetail.id);
        formData.append('document_type', docType);
        formData.append('description', description); // Sending description even if backend might not use it yet

        const token = localStorage.getItem('access_token');
        const response = await fetch(`${VALUATIONS_API_BASE_URL}/api/realestate/documents/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            // Success
            closeUploadDocumentModal();
            // Refresh documents list
            loadPropertyDocuments(currentPropertyForDetail.id);
        } else {
            const errorData = await response.json();
            alert(`Upload failed: ${errorData.detail || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error uploading document:', error);
        alert('An error occurred while uploading. Please try again.');
    }
}

function updateFileName(input) {
    const fileNameDisplay = document.getElementById('fileName');
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileNameDisplay.textContent = `${file.name} (${fileSizeMB} MB)`;
    } else {
        fileNameDisplay.textContent = '';
    }
}

// Auto-initialize when Valuation section becomes visible
function initValuationsModule() {
    console.log('[Valuations] Setting up initialization...');
    const valuationSection = document.getElementById('realestate-section-valuation');

    if (!valuationSection) {
        // Maybe it's called 'valuation-section' in dashboard.html? 
        // Based on browser subagent findings, the ID mismatch was potential, but v=4 used 'realestate-section-valuation'.
        // If the browser subagent said it worked manually, then the ID *is* correct (or at least finding it works).
        // Wait, the browser subagent in Step 1398 said: "The version v=4 correctly uses the ID `realestate-section-valuation`".
        console.error('[Valuations] Section not found!');
        return;
    }

    let hasInitialized = false;

    function checkAndInitialize() {
        // Check if section is visible
        const isVisible = window.getComputedStyle(valuationSection).display !== 'none';

        if (isVisible && !hasInitialized) {
            console.log('[Valuations] Section visible, initializing folders');
            hasInitialized = true;
            initializePropertyFolders();
        } else if (!isVisible) {
            hasInitialized = false;
        }
    }

    // Check immediately
    checkAndInitialize();

    // Watch for changes
    const observer = new MutationObserver(checkAndInitialize);
    observer.observe(valuationSection, { attributes: true, attributeFilter: ['style', 'class'] });

    // Fallback interval check
    setInterval(checkAndInitialize, 500);
}

// Ensure init runs even if script loads after DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initValuationsModule);
} else {
    initValuationsModule();
}

// Expose globally
window.initializePropertyFolders = initializePropertyFolders;
window.filterPropertiesByStatus = filterPropertiesByStatus;
window.openPropertyDetail = openPropertyDetail;
window.closePropertyDetail = closePropertyDetail;
window.openUploadDocumentModal = openUploadDocumentModal;
window.closeUploadDocumentModal = closeUploadDocumentModal;
window.submitUploadDocument = submitUploadDocument;
window.updateFileName = updateFileName;
window.deleteDocument = deleteDocument;
window.viewDocument = viewDocument;
window.closeDocumentPreview = closeDocumentPreview;
window.downloadCurrentDocument = downloadCurrentDocument;
