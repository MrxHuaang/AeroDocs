/**
 * Project Page Controller
 * Main entry point for the project view page
 * Uses modular services for business logic
 * 
 * Angular equivalent: ProjectComponent
 */
(function() {
    'use strict';

    // ========================================
    // DOM ELEMENTS
    // ========================================
    const DOM = {
        // Checklist
        checklistContainer: document.getElementById('checklist-container'),
        projectNameBreadcrumb: document.getElementById('project-name-breadcrumb'),
        checklistSummary: document.getElementById('checklist-summary'),
        
        // Chat
        chatMessagesContainer: document.getElementById('chat-messages'),
        chatForm: document.getElementById('chat-form'),
        chatInput: document.getElementById('chat-input'),
        aiThinkingIndicator: document.getElementById('ai-thinking-indicator'),
        
        // Buttons
        exportReportBtn: document.getElementById('export-report-btn'),
        exportChatBtn: document.getElementById('export-chat-btn'),
        clearChatBtn: document.getElementById('clear-chat-btn')
    };

    // ========================================
    // SERVICES INITIALIZATION
    // ========================================
    let storageService, chatService, checklistService, exportService, projectsService;
    let projectId = null;
    let projectInfo = null;
    let draggedElement = null;

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    function getProjectId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    async function getProjectInfoFromFirebase(id) {
        if (projectsService) {
            return await projectsService.getProject(id);
        }
        // Fallback to mockProjects
        return window.mockProjects?.find(p => p.id === id) || null;
    }

    // ========================================
    // UI RENDERING - CHAT
    // ========================================
    function scrollChatToBottom() {
        DOM.chatMessagesContainer.scrollTop = DOM.chatMessagesContainer.scrollHeight;
    }

    function renderMessage(message, scroll = true) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `message ${message.sender}-message`;
        
        if (message.sender === 'ai' && typeof marked !== 'undefined') {
            messageWrapper.innerHTML = marked.parse(message.text);
        } else {
            messageWrapper.textContent = message.text;
        }
        
        DOM.chatMessagesContainer.appendChild(messageWrapper);
        if (scroll) scrollChatToBottom();
    }

    function renderChatHistory(messages) {
        DOM.chatMessagesContainer.innerHTML = '';
        messages.forEach(msg => renderMessage(msg, false));
        scrollChatToBottom();
    }

    // ========================================
    // UI RENDERING - CHECKLIST
    // ========================================
    function renderChecklistSummary(stats) {
        DOM.checklistSummary.innerHTML = `
            <span class="stat-present">${stats.present} present</span> / 
            <span class="stat-missing">${stats.missing} missing</span>
            <span class="stat-percentage">(${stats.percentage}% complete)</span>
        `;
    }

    function handleFileAction(action, item) {
        switch(action) {
            case 'download':
                window.showToast(`Downloading ${item.name}...`, 'info');
                break;
            case 'share':
                window.showToast(`Opening share options for ${item.name}...`, 'info');
                break;
            case 'annotate':
                window.showToast(`Opening annotation editor for ${item.name}...`, 'info');
                break;
        }
    }

    function createChecklistItemElement(item, parentList = null) {
        const li = document.createElement('li');
        li.className = 'checklist-item';
        li.dataset.name = item.name;

        const isParent = item.children && item.children.length > 0;
        const isFile = item.type === 'File';
        
        const statusIcon = item.status === 'Present' 
            ? `<svg class="status-icon present" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>`
            : `<svg class="status-icon missing" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        
        const toggleIcon = isParent 
            ? `<svg class="toggle-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>` 
            : '<span class="toggle-icon" style="width: 16px;"></span>';

        const fileActionsHtml = isFile ? `
            <div class="file-actions">
                <button class="file-action-btn" title="Download" data-action="download">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                </button>
                <button class="file-action-btn" title="Share" data-action="share">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                </button>
                <button class="file-action-btn" title="Add Annotation" data-action="annotate">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <span class="file-action-btn drag-handle" title="Drag to reorder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="5" r="1"></circle>
                        <circle cx="9" cy="12" r="1"></circle>
                        <circle cx="9" cy="19" r="1"></circle>
                        <circle cx="15" cy="5" r="1"></circle>
                        <circle cx="15" cy="12" r="1"></circle>
                        <circle cx="15" cy="19" r="1"></circle>
                    </svg>
                </span>
            </div>
        ` : '';

        const itemHeader = document.createElement('div');
        itemHeader.className = 'item-header' + (isFile ? ' file-item' : '');
        if (isFile) itemHeader.draggable = true;
        
        itemHeader.innerHTML = `
            ${toggleIcon}
            ${statusIcon}
            <span class="item-name">${item.name}</span>
            ${fileActionsHtml}
        `;

        // File action handlers
        if (isFile) {
            itemHeader.querySelectorAll('.file-action-btn[data-action]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleFileAction(btn.dataset.action, item);
                });
            });
            setupDragAndDrop(itemHeader, li, parentList);
        }

        // Details panel
        const itemDetails = document.createElement('div');
        itemDetails.className = 'item-details';
        itemDetails.innerHTML = `
            <dl class="detail-grid">
                <dt>Component</dt><dd>${item.type || 'N/A'}</dd>
                <dt>ICAO Ref</dt><dd>${item.icaoRef || 'N/A'}</dd>
                <dt>Status</dt><dd>${item.status}</dd>
                <dt>Observation</dt><dd>${item.status === 'Missing' ? 'Missing documentation detected.' : 'No discrepancies detected.'}</dd>
            </dl>
        `;
        
        li.appendChild(itemHeader);
        li.appendChild(itemDetails);

        itemHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            itemDetails.classList.toggle('visible');
        });

        // Children
        if (isParent) {
            const childrenContainer = document.createElement('ul');
            childrenContainer.className = 'item-children';
            item.children.forEach(child => {
                childrenContainer.appendChild(createChecklistItemElement(child, childrenContainer));
            });
            li.appendChild(childrenContainer);
            
            itemHeader.addEventListener('click', () => {
                childrenContainer.classList.toggle('expanded');
                itemHeader.querySelector('.toggle-icon').classList.toggle('expanded');
            });
        }
        
        return li;
    }

    function setupDragAndDrop(itemHeader, li, parentList) {
        itemHeader.addEventListener('dragstart', (e) => {
            draggedElement = li;
            li.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        itemHeader.addEventListener('dragend', () => {
            li.classList.remove('dragging');
            draggedElement = null;
        });

        itemHeader.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (draggedElement && draggedElement !== li) {
                const rect = li.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                li.classList.toggle('drag-above', e.clientY < midY);
                li.classList.toggle('drag-below', e.clientY >= midY);
            }
        });

        itemHeader.addEventListener('dragleave', () => {
            li.classList.remove('drag-above', 'drag-below');
        });

        itemHeader.addEventListener('drop', (e) => {
            e.preventDefault();
            li.classList.remove('drag-above', 'drag-below');
            if (draggedElement && draggedElement !== li && parentList) {
                const items = Array.from(parentList.children);
                const draggedIndex = items.indexOf(draggedElement);
                const targetIndex = items.indexOf(li);
                
                if (draggedIndex < targetIndex) {
                    parentList.insertBefore(draggedElement, li.nextSibling);
                } else {
                    parentList.insertBefore(draggedElement, li);
                }
                window.showToast('File reordered', 'success');
            }
        });
    }

    function renderChecklist(checklistData) {
        DOM.checklistContainer.innerHTML = '';
        
        if (!checklistData) {
            DOM.checklistContainer.innerHTML = '<p>Could not load checklist data.</p>';
            return;
        }
        
        const rootUl = document.createElement('ul');
        rootUl.appendChild(createChecklistItemElement(checklistData, rootUl));
        DOM.checklistContainer.appendChild(rootUl);
    }

    // ========================================
    // EVENT HANDLERS
    // ========================================
    async function handleChatSubmit(e) {
        e.preventDefault();
        const userInput = DOM.chatInput.value.trim();
        
        if (userInput) {
            DOM.chatInput.value = '';
            await chatService.sendMessage(
                userInput, 
                projectInfo?.type || 'aircraft',
                projectInfo?.serialNumber || ''
            );
        }
    }

    function handleExportChat() {
        const projectName = projectInfo?.name || 'Project';
        const result = exportService.exportChatHistory(chatService, projectId, projectName);
        window.showToast(result.message, result.success ? 'success' : 'error');
    }

    function handleExportReport() {
        const projectName = projectInfo?.name || 'Project';
        const result = exportService.exportChecklistReport(checklistService, projectId, projectName);
        window.showToast(result.message, result.success ? 'success' : 'error');
    }

    function handleClearChat() {
        chatService.clearHistory();
        DOM.chatMessagesContainer.innerHTML = '';
        const greeting = chatService.createInitialGreeting();
        renderMessage(greeting);
        window.showToast('Chat history cleared', 'success');
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    function initializeServices() {
        storageService = new StorageService();
        checklistService = new ChecklistService();
        exportService = new ExportService();
        chatService = new ChatService(storageService, projectId);
        
        // Setup chat callbacks
        chatService.onMessageReceived = (msg) => renderMessage(msg);
        chatService.onLoadingChange = (loading) => {
            DOM.aiThinkingIndicator.style.display = loading ? 'flex' : 'none';
            if (loading) scrollChatToBottom();
        };
        chatService.onError = (msg) => window.showToast(msg, 'error');
    }

    async function initializePage() {
        projectId = getProjectId();
        
        if (!projectId) {
            window.location.href = '2_dashboard.html';
            return;
        }
        
        // Initialize Firebase
        if (window.firebaseService) {
            window.firebaseService.initialize();
            projectsService = new ProjectsService(window.firebaseService);
            console.log('Firebase initialized for project page');
        }
        
        // Load project info from Firebase
        projectInfo = await getProjectInfoFromFirebase(projectId);
        
        if (!projectInfo) {
            // Project not found, create basic info from ID
            const parts = projectId.split('_');
            projectInfo = {
                id: projectId,
                name: `Project ${parts[0] || projectId}`,
                type: parts[1] || 'aircraft',
                serialNumber: parts[0] || projectId
            };
        }
        
        // Update page title
        DOM.projectNameBreadcrumb.textContent = projectInfo?.name || 'Project Details';
        document.title = `${projectInfo?.name || 'Project'} - AeroDocs`;
        
        // Initialize services
        initializeServices();
        
        // Load checklist (still using mock data for now)
        const checklistData = window.mockChecklistData;
        const stats = checklistService.load(checklistData);
        renderChecklistSummary(stats);
        renderChecklist(checklistData);
        
        // Load chat history
        const history = chatService.loadHistory();
        if (history.length === 0) {
            const greeting = chatService.createInitialGreeting();
            chatService.conversation.push(greeting);
            chatService.saveHistory();
            renderMessage(greeting);
        } else {
            renderChatHistory(history);
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================
    DOM.exportChatBtn.addEventListener('click', handleExportChat);
    DOM.clearChatBtn.addEventListener('click', handleClearChat);
    DOM.exportReportBtn.addEventListener('click', handleExportReport);
    DOM.chatForm.addEventListener('submit', handleChatSubmit);

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', initializePage);

})();
