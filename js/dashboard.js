// dashboard.js - Logic for the project dashboard page

(function() {
    'use strict';

    // ========================================
    // DOM ELEMENTS
    // ========================================
    const projectsGrid = document.getElementById('projects-grid');
    const createProjectBtn = document.getElementById('create-project-btn');
    const modal = document.getElementById('create-project-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const projectForm = document.getElementById('create-project-form');
    const projectNameInput = document.getElementById('project-name');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadProgressContainer = document.getElementById('upload-progress-container');
    const fileNameDisplay = document.getElementById('file-name-display');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const submitProjectBtn = document.getElementById('submit-project-btn');
    const processingLoader = document.getElementById('processing-loader');

    // Form elements
    const projectTypeSelect = document.getElementById('project-type');
    const esnGroup = document.getElementById('esn-group');
    const msnGroup = document.getElementById('msn-group');
    const esnInput = document.getElementById('esn-number');
    const msnInput = document.getElementById('msn-number');
    const tagsInputContainer = document.getElementById('tags-input-container');
    const tagsInput = document.getElementById('tags-input');

    // Filter elements
    const searchInput = document.getElementById('search-input');
    const filterTag = document.getElementById('filter-tag');
    const sortOrder = document.getElementById('sort-order');
    const filterFavorites = document.getElementById('filter-favorites');

    // Notification elements
    const notificationBtn = document.getElementById('notification-btn');
    const notificationPanel = document.getElementById('notification-panel');
    const notificationBadge = document.getElementById('notification-badge');
    const notificationList = document.getElementById('notification-list');
    const clearNotificationsBtn = document.getElementById('clear-notifications-btn');

    // Stats elements
    const statTotal = document.getElementById('stat-total');
    const statCompleted = document.getElementById('stat-completed');
    const statProcessing = document.getElementById('stat-processing');
    const statPending = document.getElementById('stat-pending');
    const statFailed = document.getElementById('stat-failed');

    // Delete modal elements
    const deleteModal = document.getElementById('delete-modal');
    const deleteModalBackdrop = document.getElementById('delete-modal-backdrop');
    const deleteProjectName = document.getElementById('delete-project-name');
    const closeDeleteModalBtn = document.getElementById('close-delete-modal-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    // Edit modal elements
    const editModal = document.getElementById('edit-modal');
    const editModalBackdrop = document.getElementById('edit-modal-backdrop');
    const editProjectIdInput = document.getElementById('edit-project-id');
    const editProjectStatus = document.getElementById('edit-project-status');
    const editTagsInputContainer = document.getElementById('edit-tags-input-container');
    const editTagsInput = document.getElementById('edit-tags-input');
    const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const saveEditBtn = document.getElementById('save-edit-btn');

    // ========================================
    // STATE
    // ========================================
    let uploadedFile = null;
    let isUploading = false;
    let isUploadComplete = false;
    let selectedTags = [];
    let editSelectedTags = [];
    let projectToDelete = null;
    let showOnlyFavorites = false;
    let searchQuery = '';

    // Load favorites from localStorage
    let favorites = JSON.parse(localStorage.getItem('aerodocs_favorites') || '[]');
    
    // Load notifications from localStorage
    let notifications = JSON.parse(localStorage.getItem('aerodocs_notifications') || '[]');

    // Available tags
    let availableTags = [
        'American Airlines', 'LATAM Airlines', 'United Airlines',
        'Delta Airlines', 'Lufthansa', 'Emirates', 'British Airways', 'Air France'
    ];

    // Firebase services
    let projectsService = null;

    // ========================================
    // N8N WEBHOOK CONFIGURATION
    // ========================================
    const N8N_FILE_WEBHOOK_URL = 'https://n8n.srv1026018.hstgr.cloud/webhook/849ca1f9-a9b5-4630-b533-42b770a8e9b0';

    /**
     * Calls the n8n webhook to process the uploaded file
     * @param {string} objectName - The file name in Google Cloud Storage
     * @param {string} proyecto - Project name (e.g., "aircraft MSN 577178")
     * @param {string} type - Project type ("engine" or "Aircraft")
     * @param {string} serie - Serial number
     * @param {string} tags - Comma-separated tags
     * @returns {Promise} - Resolves with webhook response
     */
    async function callN8nFileWebhook(objectName, proyecto, type, serie, tags) {
        const payload = {
            object_name: objectName,
            proyecto: proyecto,
            type: type === 'aircraft' ? 'aircraft' : 'engine',
            serie: serie,
            tags: tags
        };

        console.log('Calling n8n file webhook:', payload);

        try {
            const response = await fetch(N8N_FILE_WEBHOOK_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log('n8n webhook response:', data);

            if (data.code === 202) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || 'Error processing file' };
            }
        } catch (error) {
            console.error('Error calling n8n file webhook:', error);
            return { success: false, message: 'Connection error' };
        }
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    function getStatusClass(estado) {
        if (!estado) return 'status-processing';
        const estadoLower = estado.toLowerCase();
        if (estadoLower === 'completado') {
            return 'status-completed';
        }
        return 'status-processing';
    }

    function getStatusLabel(estado) {
        if (!estado) return 'Processing';
        const estadoLower = estado.toLowerCase();
        if (estadoLower === 'completado') {
            return 'Completed';
        }
        // Capitalize first letter and keep rest
        return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
    }

    function tagToDisplayName(tag) {
        return tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function displayNameToTag(name) {
        return name.toLowerCase().replace(/\s+/g, '-');
    }

    function isFavorite(projectId) {
        return favorites.includes(projectId);
    }

    function toggleFavorite(projectId) {
        if (isFavorite(projectId)) {
            favorites = favorites.filter(id => id !== projectId);
        } else {
            favorites.push(projectId);
        }
        localStorage.setItem('aerodocs_favorites', JSON.stringify(favorites));
    }

    // ========================================
    // NOTIFICATIONS SYSTEM
    // ========================================
    function addNotification(title, projectId = null) {
        const notification = {
            id: Date.now(),
            title: title,
            projectId: projectId,
            time: new Date().toISOString(),
            read: false
        };
        notifications.unshift(notification);
        localStorage.setItem('aerodocs_notifications', JSON.stringify(notifications));
        updateNotificationUI();
    }

    function clearNotifications() {
        notifications = [];
        localStorage.setItem('aerodocs_notifications', JSON.stringify(notifications));
        updateNotificationUI();
    }

    function updateNotificationUI() {
        const unreadCount = notifications.filter(n => !n.read).length;
        
        if (unreadCount > 0) {
            notificationBadge.style.display = 'flex';
            notificationBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        } else {
            notificationBadge.style.display = 'none';
        }

        if (notifications.length === 0) {
            notificationList.innerHTML = '<p class="no-notifications">No notifications</p>';
        } else {
            notificationList.innerHTML = notifications.slice(0, 10).map(n => `
                <div class="notification-item" data-id="${n.id}">
                    <div class="notif-title">${n.title}</div>
                    <div class="notif-time">${formatTimeAgo(n.time)}</div>
                </div>
            `).join('');
        }
    }

    function formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    }

    // ========================================
    // STATISTICS
    // ========================================
    function updateStats() {
        // Use ProjectsService cache if available, otherwise fallback to mockProjects
        const projects = projectsService 
            ? projectsService.getCachedProjects() 
            : (window.mockProjects || []);
            
        const total = projects.length;
        const completed = projects.filter(p => p.status === 'COMPLETED').length;
        const processing = projects.filter(p => p.status === 'PROCESSING').length;
        const pending = projects.filter(p => p.status === 'PENDING_REVIEW').length;
        const failed = projects.filter(p => p.status === 'FAILED').length;

        if (statTotal) statTotal.textContent = total;
        if (statCompleted) statCompleted.textContent = completed;
        if (statProcessing) statProcessing.textContent = processing;
        if (statPending) statPending.textContent = pending;
        if (statFailed) statFailed.textContent = failed;
    }

    // ========================================
    // PROJECT CARD RENDERING
    // ========================================
    function renderProjectCard(project) {
        if (!project || !project.name) return;
        
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.projectId = project.id;
        
        // Use estado field instead of status
        const estado = project.estado || null;
        const statusClass = getStatusClass(estado);
        const statusLabel = getStatusLabel(estado);
        
        // Ensure tags is always an array (Firebase may return object or string)
        let tags = project.tags || [];
        if (!Array.isArray(tags)) {
            tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [];
        }
        const tagDisplayNames = tags.map(tag => tagToDisplayName(tag));
        const isFav = isFavorite(project.id);
        
        const tagsHtml = tagDisplayNames.length > 0 
            ? `<div class="project-card-tags">${tagDisplayNames.map(tag => `<span class="project-tag">${tag}</span>`).join('')}</div>`
            : '';

        card.innerHTML = `
            <div class="project-card-header">
                <h3>${project.name}</h3>
                <div class="project-card-actions">
                    <button class="card-action-btn favorite-btn ${isFav ? 'active' : ''}" title="Add to favorites" data-id="${project.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </button>
                    <button class="card-action-btn edit-btn" title="Edit project" data-id="${project.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="card-action-btn delete-btn" title="Delete project" data-id="${project.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            ${tagsHtml}
            <div class="project-card-footer">
                <span class="status-badge ${statusClass}">${statusLabel}</span>
                <span>Updated ${project.lastUpdated || 'Unknown'}</span>
            </div>
        `;

        // Click on card body navigates to project
        // Use hash (#) instead of query params (?) because npx serve strips query params
        card.addEventListener('click', (e) => {
            // Prevent default behavior to avoid any page reload
            e.preventDefault();
            
            if (!e.target.closest('.project-card-actions')) {
                console.log('[Dashboard] Navigating to project:', project.id);
                window.location.href = `3_project.html#id=${project.id}`;
            }
        });

        // Favorite button
        card.querySelector('.favorite-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(project.id);
            loadProjects();
        });

        // Edit button
        card.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(project);
        });

        // Delete button
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openDeleteModal(project);
        });

        projectsGrid.appendChild(card);
    }

    // ========================================
    // FILTERING & SORTING
    // ========================================
    function getFilteredAndSortedProjects() {
        // Use ProjectsService for filtering if available, otherwise fallback to mockProjects
        const projects = projectsService 
            ? projectsService.filterProjects({
                search: searchQuery,
                tag: filterTag.value,
                favorites: showOnlyFavorites,
                favoriteIds: favorites,
                sort: sortOrder.value
            })
            : [...(window.mockProjects || [])];
        
        return projects;
    }

    async function loadProjects() {
        projectsGrid.innerHTML = '<p class="loading-projects">Loading projects...</p>';
        
        // Load from Firebase if service is available
        if (projectsService) {
            await projectsService.loadProjects();
        }
        
        projectsGrid.innerHTML = '';
        const filteredProjects = getFilteredAndSortedProjects();
        
        if (filteredProjects.length === 0) {
            projectsGrid.innerHTML = '<p class="no-projects">No projects found matching the selected filters.</p>';
            return;
        }
        
        filteredProjects.forEach(renderProjectCard);
        updateStats();
    }

    // ========================================
    // DELETE MODAL
    // ========================================
    function openDeleteModal(project) {
        projectToDelete = project;
        deleteProjectName.textContent = project.name;
        deleteModal.classList.add('visible');
        deleteModalBackdrop.classList.add('visible');
    }

    function closeDeleteModal() {
        projectToDelete = null;
        deleteModal.classList.remove('visible');
        deleteModalBackdrop.classList.remove('visible');
    }

    function confirmDelete() {
        if (projectToDelete) {
            const index = window.mockProjects.findIndex(p => p.id === projectToDelete.id);
            if (index > -1) {
                window.mockProjects.splice(index, 1);
                addNotification(`Project "${projectToDelete.name}" was deleted`);
                window.showToast('Project deleted successfully', 'success');
            }
            closeDeleteModal();
            loadProjects();
        }
    }

    // ========================================
    // EDIT MODAL
    // ========================================
    function openEditModal(project) {
        editProjectIdInput.value = project.id;
        editProjectStatus.value = project.status;
        editSelectedTags = (project.tags || []).map(tag => tagToDisplayName(tag));
        renderEditTags();
        editModal.classList.add('visible');
        editModalBackdrop.classList.add('visible');
    }

    function closeEditModal() {
        editModal.classList.remove('visible');
        editModalBackdrop.classList.remove('visible');
        editSelectedTags = [];
    }

    function saveEdit() {
        const projectId = editProjectIdInput.value;
        const newStatus = editProjectStatus.value;
        const project = window.mockProjects.find(p => p.id === projectId);
        
        if (project) {
            const oldStatus = project.status;
            project.status = newStatus;
            project.tags = editSelectedTags.map(tag => displayNameToTag(tag));
            project.lastUpdated = 'Just now';
            
            if (oldStatus !== newStatus) {
                addNotification(`"${project.name}" status changed to ${getStatusLabel(newStatus)}`, projectId);
            }
            
            window.showToast('Project updated successfully', 'success');
            closeEditModal();
            loadProjects();
        }
    }

    function renderEditTags() {
        const existingTags = editTagsInputContainer.querySelectorAll('.tag-item');
        existingTags.forEach(tag => tag.remove());
        
        editSelectedTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-item';
            tagElement.innerHTML = `
                ${tag}
                <span class="remove-tag" data-tag="${tag}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </span>
            `;
            editTagsInputContainer.insertBefore(tagElement, editTagsInput);
        });
    }

    // ========================================
    // CREATE PROJECT MODAL
    // ========================================
    function toggleModal(show) {
        if (show) {
            resetModalState();
            modal.classList.add('visible');
            modalBackdrop.classList.add('visible');
            document.body.style.overflow = 'hidden';
        } else {
            resetModalState();
            modal.classList.remove('visible');
            modalBackdrop.classList.remove('visible');
            document.body.style.overflow = '';
        }
    }
    
    function resetModalState() {
        projectForm.style.display = 'block';
        processingLoader.style.display = 'none';
        projectForm.reset();
        uploadedFile = null;
        selectedTags = [];
        esnGroup.style.display = 'none';
        msnGroup.style.display = 'none';
        projectNameInput.value = '';
        renderSelectedTags();
        isUploading = false;
        isUploadComplete = false;
        dropZone.querySelector('p').textContent = 'Drag & drop a .zip or .rar file here, or click to select';
        uploadProgressContainer.style.display = 'none';
        progressBarFill.style.width = '0%';
        submitProjectBtn.disabled = true;
    }

    function updateProjectName() {
        const type = projectTypeSelect.value;
        const serial = type === 'engine' ? esnInput.value.trim() : msnInput.value.trim();
        
        if (type && serial) {
            const prefix = type === 'engine' ? 'Engine ESN' : 'Aircraft MSN';
            projectNameInput.value = `${prefix} ${serial}`;
        } else {
            projectNameInput.value = '';
        }
        updateSubmitButtonState();
    }

    function handleProjectTypeChange() {
        const type = projectTypeSelect.value;
        esnGroup.style.display = type === 'engine' ? 'block' : 'none';
        msnGroup.style.display = type === 'aircraft' ? 'block' : 'none';
        if (type === 'engine') msnInput.value = '';
        else if (type === 'aircraft') esnInput.value = '';
        updateProjectName();
    }

    // ========================================
    // TAGS FUNCTIONALITY
    // ========================================
    function renderSelectedTags() {
        const existingTags = tagsInputContainer.querySelectorAll('.tag-item');
        existingTags.forEach(tag => tag.remove());
        
        selectedTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-item';
            tagElement.innerHTML = `
                ${tag}
                <span class="remove-tag" data-tag="${tag}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </span>
            `;
            tagsInputContainer.insertBefore(tagElement, tagsInput);
        });
        tagsInput.placeholder = selectedTags.length === 0 ? 'Type to add tags...' : '';
    }

    function addTag(tag, container = 'create') {
        const normalizedTag = tag.trim();
        const targetArray = container === 'create' ? selectedTags : editSelectedTags;
        
        if (normalizedTag && !targetArray.includes(normalizedTag)) {
            targetArray.push(normalizedTag);
            if (!availableTags.includes(normalizedTag)) {
                availableTags.push(normalizedTag);
            }
            if (container === 'create') {
                renderSelectedTags();
                tagsInput.value = '';
            } else {
                renderEditTags();
                editTagsInput.value = '';
            }
            hideSuggestions(container);
        }
    }

    function removeTag(tag, container = 'create') {
        if (container === 'create') {
            selectedTags = selectedTags.filter(t => t !== tag);
            renderSelectedTags();
        } else {
            editSelectedTags = editSelectedTags.filter(t => t !== tag);
            renderEditTags();
        }
    }

    function showSuggestions(query, container = 'create') {
        hideSuggestions(container);
        if (!query) return;
        
        const targetArray = container === 'create' ? selectedTags : editSelectedTags;
        const targetContainer = container === 'create' ? tagsInputContainer : editTagsInputContainer;
        
        const suggestions = availableTags.filter(tag => 
            tag.toLowerCase().includes(query.toLowerCase()) && !targetArray.includes(tag)
        );
        
        if (suggestions.length === 0 && query.length > 1) {
            const suggestionsDiv = document.createElement('div');
            suggestionsDiv.className = 'tag-suggestions';
            suggestionsDiv.innerHTML = `<div class="tag-suggestion-item create-new" data-tag="${query}">+ Create "${query}"</div>`;
            targetContainer.appendChild(suggestionsDiv);
        } else if (suggestions.length > 0) {
            const suggestionsDiv = document.createElement('div');
            suggestionsDiv.className = 'tag-suggestions';
            
            suggestions.slice(0, 5).forEach(tag => {
                suggestionsDiv.innerHTML += `<div class="tag-suggestion-item" data-tag="${tag}">${tag}</div>`;
            });
            
            if (!suggestions.some(s => s.toLowerCase() === query.toLowerCase())) {
                suggestionsDiv.innerHTML += `<div class="tag-suggestion-item create-new" data-tag="${query}">+ Create "${query}"</div>`;
            }
            
            targetContainer.appendChild(suggestionsDiv);
        }
        
        const suggestionItems = targetContainer.querySelectorAll('.tag-suggestion-item');
        suggestionItems.forEach(item => {
            item.addEventListener('click', () => addTag(item.dataset.tag, container));
        });
    }

    function hideSuggestions(container = 'create') {
        const targetContainer = container === 'create' ? tagsInputContainer : editTagsInputContainer;
        const suggestions = targetContainer.querySelector('.tag-suggestions');
        if (suggestions) suggestions.remove();
    }

    // ========================================
    // FILE UPLOAD
    // ========================================
    function handleFile(file) {
        if (!file) return;
        const allowedTypes = ['.zip', '.rar'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
        if (!allowedTypes.includes(fileExtension)) {
            window.showToast('Invalid file type. Please upload a .zip or .rar file.', 'error');
            return;
        }
        uploadedFile = file;
        dropZone.querySelector('p').textContent = `File selected: ${file.name}`;
        isUploadComplete = false;
        simulateUpload(file.name);
    }
    
    function simulateUpload(fileName) {
        isUploading = true;
        submitProjectBtn.disabled = true;
        uploadProgressContainer.style.display = 'block';
        fileNameDisplay.textContent = `Uploading ${fileName}...`;
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            progressBarFill.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(interval);
                fileNameDisplay.textContent = `Upload complete: ${fileName}`;
                isUploading = false;
                isUploadComplete = true;
                updateSubmitButtonState();
            }
        }, 100);
    }

    function updateSubmitButtonState() {
        const type = projectTypeSelect.value;
        const hasSerialNumber = type === 'engine' 
            ? esnInput.value.trim() !== '' 
            : type === 'aircraft' ? msnInput.value.trim() !== '' : false;
        
        submitProjectBtn.disabled = !(type && hasSerialNumber && uploadedFile && isUploadComplete && !isUploading);
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const type = projectTypeSelect.value;
        const serialNumber = type === 'engine' ? esnInput.value.trim() : msnInput.value.trim();
        const projectName = projectNameInput.value.trim();
        
        if (!type || !serialNumber) {
            window.showToast('Please fill all required fields', 'error');
            return;
        }
        
        if (!isUploadComplete || isUploading) {
            window.showToast('Please wait for the file upload to complete', 'error');
            return;
        }
        
        const tagValues = selectedTags.map(tag => displayNameToTag(tag));
        
        // Show processing state
        projectForm.style.display = 'none';
        processingLoader.style.display = 'flex';
        submitProjectBtn.disabled = true;
        
        // Generate object_name with timestamp (like the example: 1769279686358-prueba_real_files.zip)
        const timestamp = Date.now();
        const objectName = `${timestamp}-${uploadedFile.name}`;
        
        // Prepare tags as comma-separated string
        const tagsString = selectedTags.join(', ');
        
        // Call n8n webhook to process the file
        const webhookResult = await callN8nFileWebhook(
            objectName,
            projectName,
            type,
            serialNumber,
            tagsString
        );
        
        if (webhookResult.success) {
            const newProject = {
                id: `proj-${timestamp}`,
                name: projectName,
                type: type,
                serialNumber: serialNumber,
                tags: tagValues,
                status: 'PROCESSING',
                lastUpdated: 'Just now',
                createdAt: new Date(),
                objectName: objectName // Store the object name for reference
            };
            
            window.mockProjects.unshift(newProject);
            addNotification(`New project "${projectName}" created and processing started`, newProject.id);
            toggleModal(false);
            loadProjects();
            window.showToast('Project created successfully! Processing started.', 'success');
        } else {
            // Reset form to allow retry
            projectForm.style.display = 'block';
            processingLoader.style.display = 'none';
            submitProjectBtn.disabled = false;
            window.showToast(`Error: ${webhookResult.message}`, 'error');
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================
    
    // Modal controls
    createProjectBtn.addEventListener('click', () => toggleModal(true));
    closeModalBtn.addEventListener('click', () => toggleModal(false));
    cancelModalBtn.addEventListener('click', () => toggleModal(false));
    modalBackdrop.addEventListener('click', () => toggleModal(false));

    // Delete modal
    closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    deleteModalBackdrop.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', confirmDelete);

    // Edit modal
    closeEditModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    editModalBackdrop.addEventListener('click', closeEditModal);
    saveEditBtn.addEventListener('click', saveEdit);

    // Notifications
    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationPanel.classList.toggle('visible');
        // Mark all as read
        notifications.forEach(n => n.read = true);
        localStorage.setItem('aerodocs_notifications', JSON.stringify(notifications));
        updateNotificationUI();
    });
    clearNotificationsBtn.addEventListener('click', clearNotifications);
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-wrapper')) {
            notificationPanel.classList.remove('visible');
        }
    });

    // Project type change
    projectTypeSelect.addEventListener('change', handleProjectTypeChange);
    esnInput.addEventListener('input', updateProjectName);
    msnInput.addEventListener('input', updateProjectName);

    // Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        loadProjects();
    });

    // Favorites filter
    filterFavorites.addEventListener('click', () => {
        showOnlyFavorites = !showOnlyFavorites;
        filterFavorites.classList.toggle('active', showOnlyFavorites);
        loadProjects();
    });

    // Tags input (create modal)
    tagsInput.addEventListener('input', (e) => showSuggestions(e.target.value, 'create'));
    tagsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (tagsInput.value.trim()) addTag(tagsInput.value.trim(), 'create');
        } else if (e.key === 'Backspace' && !tagsInput.value && selectedTags.length > 0) {
            removeTag(selectedTags[selectedTags.length - 1], 'create');
        }
    });
    tagsInput.addEventListener('blur', () => setTimeout(() => hideSuggestions('create'), 200));
    tagsInputContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-tag');
        if (removeBtn) removeTag(removeBtn.dataset.tag, 'create');
        if (e.target === tagsInputContainer || e.target.classList.contains('tag-item')) tagsInput.focus();
    });

    // Tags input (edit modal)
    editTagsInput.addEventListener('input', (e) => showSuggestions(e.target.value, 'edit'));
    editTagsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (editTagsInput.value.trim()) addTag(editTagsInput.value.trim(), 'edit');
        } else if (e.key === 'Backspace' && !editTagsInput.value && editSelectedTags.length > 0) {
            removeTag(editSelectedTags[editSelectedTags.length - 1], 'edit');
        }
    });
    editTagsInput.addEventListener('blur', () => setTimeout(() => hideSuggestions('edit'), 200));
    editTagsInputContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-tag');
        if (removeBtn) removeTag(removeBtn.dataset.tag, 'edit');
        if (e.target === editTagsInputContainer || e.target.classList.contains('tag-item')) editTagsInput.focus();
    });

    // Filter/sort changes
    filterTag.addEventListener('change', loadProjects);
    sortOrder.addEventListener('change', loadProjects);

    // Drag and Drop
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); handleFile(e.dataTransfer.files[0]); });
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

    // Form submit
    projectForm.addEventListener('submit', handleFormSubmit);

    // ========================================
    // INITIAL LOAD
    // ========================================
    document.addEventListener('DOMContentLoaded', async () => {
        // Initialize Firebase
        if (window.firebaseService) {
            window.firebaseService.initialize();
            projectsService = new ProjectsService(window.firebaseService);
            console.log('Firebase and ProjectsService initialized');
        } else {
            console.warn('Firebase service not available, using mock data');
        }
        
        await loadProjects();
        updateStats();
        updateNotificationUI();
    });

})();

