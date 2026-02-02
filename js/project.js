/**
 * Project Page Controller
 * Main entry point for the project view page
 * Uses modular services for business logic
 * 
 * Angular equivalent: ProjectComponent
 */
(function() {
    'use strict';

    // Debug logging for URL parsing (can be removed in production)
    console.log('[Project] Loading page with URL:', window.location.href);

    // ========================================
    // DOM ELEMENTS
    // ========================================
    const DOM = {
        // Checklist
        checklistContainer: document.getElementById('checklist-container'),
        projectNameBreadcrumb: document.getElementById('project-name-breadcrumb'),
        checklistSummary: document.getElementById('checklist-summary'),
        checklistProgressFill: document.getElementById('checklist-progress-fill'),
        checklistProgressText: document.getElementById('checklist-progress-text'),
        checklistSearch: document.getElementById('checklist-search'),
        filterAll: document.getElementById('filter-all'),
        filterPresent: document.getElementById('filter-present'),
        filterMissing: document.getElementById('filter-missing'),
        expandAllBtn: document.getElementById('expand-all-btn'),
        collapseAllBtn: document.getElementById('collapse-all-btn'),
        
        // Chat
        chatMessagesContainer: document.getElementById('chat-messages'),
        chatForm: document.getElementById('chat-form'),
        chatInput: document.getElementById('chat-input'),
        aiThinkingIndicator: document.getElementById('ai-thinking-indicator'),
        aiThinkingText: document.getElementById('ai-thinking-text'),
        
        // Buttons
        exportReportBtn: document.getElementById('export-report-btn'),
        exportChatBtn: document.getElementById('export-chat-btn'),
        clearChatBtn: document.getElementById('clear-chat-btn')
    };

    // Current filter state
    let currentFilter = 'all';
    let currentSearchTerm = '';

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
        // First try to get ID from hash (format: #id=xxx)
        const hash = window.location.hash;
        if (hash) {
            if (hash.startsWith('#id=')) {
                const id = hash.substring(4);
                console.log('[Project] Got ID from hash:', id);
                return id;
            }
            // Try URLSearchParams format
            const hashParams = new URLSearchParams(hash.substring(1));
            const hashId = hashParams.get('id');
            if (hashId) {
                console.log('[Project] Got ID from hash params:', hashId);
                return hashId;
            }
        }
        
        // Fallback to query params (in case someone uses ?id=xxx directly)
        const params = new URLSearchParams(window.location.search);
        const queryId = params.get('id');
        if (queryId) {
            console.log('[Project] Got ID from query params:', queryId);
            return queryId;
        }
        
        console.log('[Project] No ID found in URL');
        return null;
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
    function scrollChatToBottom(instant = false) {
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
            // Small delay to ensure content is rendered
            setTimeout(() => {
                if (instant) {
                    // Instant scroll without animation
                    DOM.chatMessagesContainer.scrollTop = DOM.chatMessagesContainer.scrollHeight;
                } else {
                    // Smooth scroll with animation
                    DOM.chatMessagesContainer.scrollTo({
                        top: DOM.chatMessagesContainer.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }, 50);
        });
    }

    // Force scroll to bottom (used on page load)
    function forceScrollToBottom() {
        // Multiple attempts to ensure scroll works after content is fully loaded
        const scrollToEnd = () => {
            if (DOM.chatMessagesContainer) {
                DOM.chatMessagesContainer.scrollTop = DOM.chatMessagesContainer.scrollHeight;
            }
        };
        
        // Immediate scroll
        scrollToEnd();
        
        // Multiple delayed scrolls to handle async content loading
        setTimeout(scrollToEnd, 100);
        setTimeout(scrollToEnd, 300);
        setTimeout(scrollToEnd, 500);
        setTimeout(scrollToEnd, 800);
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
        // Force scroll to bottom after loading history
        forceScrollToBottom();
    }

    // ========================================
    // UI RENDERING - CHECKLIST
    // ========================================
    
    // SVG Icons by type
    const TYPE_ICONS = {
        Aircraft: `<svg class="type-icon type-aircraft" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
        Engine: `<svg class="type-icon type-engine" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
        Folder: `<svg class="type-icon type-folder" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
        PDF: `<svg class="type-icon type-pdf" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
        File: `<svg class="type-icon type-file" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`,
        'Landing Gear': `<svg class="type-icon type-landing-gear" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="20" r="2"/><path d="M12 2v14"/><path d="m17 7-5 5-5-5"/></svg>`,
        APU: `<svg class="type-icon type-apu" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/><line x1="11" y1="6" x2="11" y2="18"/></svg>`
    };

    function getTypeIcon(type) {
        return TYPE_ICONS[type] || TYPE_ICONS.Folder;
    }

    function renderChecklistSummary(stats) {
        // Update text summary
        DOM.checklistSummary.innerHTML = `
            <span class="stat-present">${stats.present} present</span>
            <span class="stat-missing">${stats.missing} missing</span>
        `;
        
        // Update progress bar
        if (DOM.checklistProgressFill) {
            DOM.checklistProgressFill.style.width = `${stats.percentage}%`;
        }
        if (DOM.checklistProgressText) {
            DOM.checklistProgressText.textContent = `${stats.percentage}%`;
        }
    }

    // ========================================
    // UI RENDERING - DOCS (from proyectos_lista.docs)
    // ========================================
    function normalizeConfidence(value) {
        const v = String(value || '').trim().toUpperCase();
        if (v === 'ALTA' || v === 'MEDIA' || v === 'BAJA') return v;
        return 'MEDIA';
    }

    function getConfidenceBadgeClass(confidence) {
        const c = normalizeConfidence(confidence);
        if (c === 'ALTA') return 'confidence-alta';
        if (c === 'BAJA') return 'confidence-baja';
        return 'confidence-media';
    }

    function isPlainObject(value) {
        return !!value && typeof value === 'object' && !Array.isArray(value);
    }

    function isEmptyPlainObject(value) {
        return isPlainObject(value) && Object.keys(value).length === 0;
    }

    function countDocsByConfidence(docs) {
        const counts = { ALTA: 0, MEDIA: 0, BAJA: 0 };
        if (!isPlainObject(docs)) return counts;

        Object.values(docs).forEach((codesObj) => {
            if (!isPlainObject(codesObj)) return;
            Object.values(codesObj).forEach((docList) => {
                if (!Array.isArray(docList)) return;
                docList.forEach((doc) => {
                    const c = normalizeConfidence(doc?.confidence);
                    counts[c] = (counts[c] || 0) + 1;
                });
            });
        });

        return counts;
    }

    function renderDocsSummaryFromCounts(counts) {
        DOM.checklistSummary.innerHTML = `
            <span class="stat-present">${counts.ALTA} ALTA</span> / 
            <span class="stat-media">${counts.MEDIA} MEDIA</span> /
            <span class="stat-missing">${counts.BAJA} BAJA</span>
        `;
    }

    function renderLeftPanelMessage(message) {
        DOM.checklistSummary.innerHTML = '';
        DOM.checklistContainer.innerHTML = `
            <ul>
                <li class="checklist-item empty-folder-message">
                    <div class="item-header empty-message">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-tertiary); margin-right: 8px;">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                            <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                        <span style="color: var(--text-tertiary); font-style: italic;">${message}</span>
                    </div>
                </li>
            </ul>
        `;
    }

    function buildDocsNodes(docs) {
        if (!isPlainObject(docs)) return [];

        return Object.keys(docs)
            .sort()
            .map((categoryKey) => {
                const codesObj = docs[categoryKey];
                const codeNodes = isPlainObject(codesObj)
                    ? Object.keys(codesObj)
                        .sort()
                        .map((codeKey) => {
                            const docList = codesObj[codeKey];
                            const docNodes = Array.isArray(docList)
                                ? docList.map((d) => {
                                    const code = String(d?.code || codeKey || '').trim();
                                    const name = String(d?.name || '').trim();
                                    const displayName = name ? `${code} - ${name}` : code;
                                    return {
                                        type: 'doc',
                                        code,
                                        name,
                                        confidence: normalizeConfidence(d?.confidence),
                                        displayName
                                    };
                                })
                                : [];

                            return {
                                type: 'folder',
                                name: codeKey,
                                children: docNodes
                            };
                        })
                    : [];

                return {
                    type: 'folder',
                    name: categoryKey,
                    children: codeNodes
                };
            });
    }

    function createDocsNodeElement(node) {
        const li = document.createElement('li');
        li.className = 'checklist-item';

        const isFolder = node.type === 'folder';
        const isParent = isFolder && Array.isArray(node.children) && node.children.length > 0;

        // Add data attributes for filtering
        const label = isFolder ? String(node.name || '') : String(node.displayName || '');
        li.dataset.name = label;
        
        // Map confidence to status for filter compatibility
        // ALTA = present (high confidence = document found)
        // MEDIA = present (medium confidence = document found)
        // BAJA = missing (low confidence = likely not found)
        if (!isFolder && node.confidence) {
            const confidence = normalizeConfidence(node.confidence);
            li.dataset.status = confidence === 'BAJA' ? 'missing' : 'present';
            li.dataset.confidence = confidence.toLowerCase();
        } else {
            li.dataset.status = 'present';
        }

        const toggleIcon = isFolder
            ? `<svg class="toggle-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`
            : '<span class="toggle-icon" style="width: 16px;"></span>';

        // Keep alignment with checklist rows (toggle + status icon slots)
        const statusSpacer = '<span style="width: 16px; height: 16px; display: inline-block; flex-shrink: 0;"></span>';

        const badgeHtml = !isFolder
            ? `<span class="confidence-badge ${getConfidenceBadgeClass(node.confidence)}">${normalizeConfidence(node.confidence)}</span>`
            : '';

        const itemHeader = document.createElement('div');
        itemHeader.className = 'item-header';
        itemHeader.innerHTML = `
            ${toggleIcon}
            ${statusSpacer}
            <span class="item-name">${label}</span>
            ${badgeHtml}
        `;

        li.appendChild(itemHeader);

        if (isFolder) {
            const childrenContainer = document.createElement('ul');
            childrenContainer.className = 'item-children';

            (node.children || []).forEach((child) => {
                childrenContainer.appendChild(createDocsNodeElement(child));
            });

            li.appendChild(childrenContainer);

            itemHeader.addEventListener('click', () => {
                childrenContainer.classList.toggle('expanded');
                const icon = itemHeader.querySelector('.toggle-icon');
                if (icon) icon.classList.toggle('expanded');
            });
        }

        return li;
    }

    function renderDocsTreeFromNodes(nodes) {
        DOM.checklistContainer.innerHTML = '';
        const rootUl = document.createElement('ul');
        nodes.forEach((n) => rootUl.appendChild(createDocsNodeElement(n)));
        DOM.checklistContainer.appendChild(rootUl);
    }

    function buildPseudoChecklistFromDocsNodes(projectName, nodes) {
        const toChecklistNode = (n) => {
            if (n.type === 'doc') {
                return { name: n.displayName, type: 'File', status: 'Present', icaoRef: null };
            }
            return {
                name: n.name,
                type: 'Folder',
                status: 'Present',
                icaoRef: null,
                children: Array.isArray(n.children) ? n.children.map(toChecklistNode) : []
            };
        };

        return {
            name: projectName || 'Project',
            type: 'Folder',
            status: 'Present',
            icaoRef: null,
            children: Array.isArray(nodes) ? nodes.map(toChecklistNode) : []
        };
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

    // Count missing items in children
    function countMissingChildren(item) {
        if (!item.children || item.children.length === 0) {
            return item.status === 'Missing' ? 1 : 0;
        }
        let count = 0;
        for (const child of item.children) {
            if (child.status === 'Missing') count++;
            count += countMissingChildren(child);
        }
        return count;
    }

    function createChecklistItemElement(item, parentList = null, isTopLevel = false) {
        const li = document.createElement('li');
        li.className = 'checklist-item';
        if (isTopLevel) {
            li.classList.add('section-card');
        }
        li.dataset.name = item.name;
        li.dataset.status = item.status.toLowerCase();
        li.dataset.type = item.type || 'Folder';

        // Check if this is an F 00X folder (expandable with PDF files)
        const isFFolder = item.type === 'Folder' && /^F \d{3}$/.test(item.name);
        const isParent = item.children && item.children.length > 0;
        const isFile = item.type === 'File';
        const isPDF = item.type === 'PDF';
        
        // Count missing children
        const missingCount = countMissingChildren(item);
        if (missingCount > 0 && isParent) {
            li.classList.add('has-missing');
        }
        
        const statusIcon = item.status === 'Present' 
            ? `<svg class="status-icon present" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>`
            : `<svg class="status-icon missing" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        
        // Get type icon
        const typeIcon = getTypeIcon(item.type);
        
        // Show toggle icon for parents with children OR F 00X folders (even if empty)
        const toggleIcon = (isParent || isFFolder)
            ? `<svg class="toggle-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>` 
            : '<span class="toggle-icon" style="width: 16px;"></span>';

        const fileActionsHtml = (isFile || isPDF) ? `
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
        itemHeader.className = 'item-header' + ((isFile || isPDF) ? ' file-item' : '');
        if (missingCount > 0 && isParent) {
            itemHeader.dataset.missingCount = missingCount;
        }
        if (isFile || isPDF) {
            itemHeader.draggable = true;
        }
        itemHeader.innerHTML = `
            ${toggleIcon}
            ${typeIcon}
            ${statusIcon}
            <span class="item-name">${item.name}</span>
            ${fileActionsHtml}
        `;

        // Add click handlers for file actions
        if (isFile || isPDF) {
            const actionBtns = itemHeader.querySelectorAll('.file-action-btn[data-action]');
            actionBtns.forEach(btn => {
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

        // If parent with children, create children container
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
        // If F 00X folder without children, show "no files" message
        else if (isFFolder && (!item.children || item.children.length === 0)) {
            const childrenContainer = document.createElement('ul');
            childrenContainer.className = 'item-children';
            
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'checklist-item empty-folder-message';
            emptyMessage.innerHTML = `
                <div class="item-header empty-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-tertiary); margin-right: 8px;">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                    <span style="color: var(--text-tertiary); font-style: italic;">No hay archivos disponibles</span>
                </div>
            `;
            childrenContainer.appendChild(emptyMessage);
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
        // Pass true for isTopLevel for the root item
        rootUl.appendChild(createChecklistItemElement(checklistData, rootUl, true));
        DOM.checklistContainer.appendChild(rootUl);
    }

    // ========================================
    // SEARCH & FILTER FUNCTIONS
    // ========================================
    function handleSearch(searchTerm) {
        currentSearchTerm = searchTerm.toLowerCase().trim();
        applyFilters();
    }

    function handleFilter(filterType) {
        currentFilter = filterType;
        
        // Update active state on filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.filter === filterType);
        });
        
        applyFilters();
    }

    function applyFilters() {
        const allItems = DOM.checklistContainer.querySelectorAll('.checklist-item');
        
        allItems.forEach(item => {
            const name = (item.dataset.name || '').toLowerCase();
            const status = item.dataset.status;
            
            let visible = true;
            
            // Apply search filter
            if (currentSearchTerm && !name.includes(currentSearchTerm)) {
                visible = false;
            }
            
            // Apply status filter
            if (currentFilter === 'present' && status !== 'present') {
                visible = false;
            } else if (currentFilter === 'missing' && status !== 'missing') {
                visible = false;
            }
            
            item.classList.toggle('hidden', !visible);
            
            // Highlight search term in visible items
            const nameSpan = item.querySelector(':scope > .item-header > .item-name');
            if (nameSpan && currentSearchTerm && visible) {
                const originalText = item.dataset.name;
                const regex = new RegExp(`(${escapeRegExp(currentSearchTerm)})`, 'gi');
                nameSpan.innerHTML = originalText.replace(regex, '<span class="search-highlight">$1</span>');
            } else if (nameSpan) {
                nameSpan.textContent = item.dataset.name;
            }
        });
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function expandAll() {
        const allChildren = DOM.checklistContainer.querySelectorAll('.item-children');
        const allToggles = DOM.checklistContainer.querySelectorAll('.toggle-icon');
        
        allChildren.forEach(child => child.classList.add('expanded'));
        allToggles.forEach(toggle => toggle.classList.add('expanded'));
        
        window.showToast('All sections expanded', 'info');
    }

    function collapseAll() {
        const allChildren = DOM.checklistContainer.querySelectorAll('.item-children');
        const allToggles = DOM.checklistContainer.querySelectorAll('.toggle-icon');
        
        allChildren.forEach(child => child.classList.remove('expanded'));
        allToggles.forEach(toggle => toggle.classList.remove('expanded'));
        
        window.showToast('All sections collapsed', 'info');
    }

    // ========================================
    // EVENT HANDLERS
    // ========================================
    async function handleChatSubmit(e) {
        e.preventDefault();
        const userInput = DOM.chatInput.value.trim();
        
        if (userInput) {
            DOM.chatInput.value = '';
            
            // Ensure we have valid type and serialNumber from Firestore
            // type is always a string, serialNumber is always a number
            const projectType = projectInfo?.type || 'aircraft';
            const projectSerial = projectInfo?.serialNumber || '';
            
            // Convert serialNumber to string for the webhook (it's a number in Firestore)
            const projectSerialString = String(projectSerial);
            
            console.log('[Project] Sending chat message with:', { type: projectType, serie: projectSerialString });
            
            await chatService.sendMessage(
                userInput, 
                projectType,
                projectSerialString
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
        chatService.onMessageReceived = (msg) => {
            renderMessage(msg);
            // Extra scroll after AI message renders
            scrollChatToBottom();
        };
        chatService.onLoadingChange = (loading) => {
            DOM.aiThinkingIndicator.style.display = loading ? 'flex' : 'none';
            // Always scroll when loading state changes
            scrollChatToBottom(true); // instant scroll
        };
        chatService.onLoadingTextChange = (text) => {
            if (DOM.aiThinkingText) {
                DOM.aiThinkingText.textContent = text;
            }
            // Scroll when loading text changes too
            scrollChatToBottom(true);
        };
        chatService.onError = (msg) => window.showToast(msg, 'error');
    }

    async function initializePage() {
        projectId = getProjectId();
        
        console.log('[Project] Initializing page with projectId:', projectId);
        console.log('[Project] Current URL:', window.location.href);
        
        if (!projectId) {
            console.warn('[Project] No project ID found in URL, redirecting to dashboard');
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
        
        console.log('[Project] Loaded projectInfo from Firestore:', {
            id: projectInfo?.id,
            name: projectInfo?.name,
            type: projectInfo?.type,
            serialNumber: projectInfo?.serialNumber
        });
        
        if (!projectInfo) {
            // Project not found, create basic info from ID
            const parts = projectId.split('_');
            const serialNumberFromId = parts[0] ? parseInt(parts[0], 10) || parts[0] : projectId;
            projectInfo = {
                id: projectId,
                name: `Project ${parts[0] || projectId}`,
                type: parts[1] || 'aircraft',
                serialNumber: serialNumberFromId // Keep as number if possible
            };
            console.warn('[Project] Project not found in Firestore, using fallback data:', projectInfo);
        }
        
        // Update page title
        DOM.projectNameBreadcrumb.textContent = projectInfo?.name || 'Project Details';
        document.title = `${projectInfo?.name || 'Project'} - AeroDocs`;
        
        // Initialize services
        initializeServices();
        
        // Left panel: render from proyectos_lista.docs when available
        const docs = projectInfo?.docs;
        if (docs === null || docs === undefined) {
            renderLeftPanelMessage('Está en procesamiento');
            checklistService.load(null);
        } else if (isEmptyPlainObject(docs)) {
            renderLeftPanelMessage('No hay documentos');
            checklistService.load(buildPseudoChecklistFromDocsNodes(projectInfo?.name, []));
        } else {
            const nodes = buildDocsNodes(docs);
            const counts = countDocsByConfidence(docs);
            renderDocsSummaryFromCounts(counts);
            renderDocsTreeFromNodes(nodes);
            checklistService.load(buildPseudoChecklistFromDocsNodes(projectInfo?.name, nodes));
        }
        
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
    
    // Checklist controls
    if (DOM.checklistSearch) {
        DOM.checklistSearch.addEventListener('input', (e) => handleSearch(e.target.value));
    }
    
    if (DOM.filterAll) {
        DOM.filterAll.addEventListener('click', () => handleFilter('all'));
    }
    if (DOM.filterPresent) {
        DOM.filterPresent.addEventListener('click', () => handleFilter('present'));
    }
    if (DOM.filterMissing) {
        DOM.filterMissing.addEventListener('click', () => handleFilter('missing'));
    }
    
    if (DOM.expandAllBtn) {
        DOM.expandAllBtn.addEventListener('click', expandAll);
    }
    if (DOM.collapseAllBtn) {
        DOM.collapseAllBtn.addEventListener('click', collapseAll);
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', initializePage);

})();
