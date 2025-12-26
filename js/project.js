// project.js - Logic for the individual project view page

(function() {
    'use strict';

    // ========================================
    // DOM ELEMENTS
    // ========================================
    const checklistContainer = document.getElementById('checklist-container');
    const projectNameBreadcrumb = document.getElementById('project-name-breadcrumb');
    const checklistSummary = document.getElementById('checklist-summary');
    
    const chatMessagesContainer = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const aiThinkingIndicator = document.getElementById('ai-thinking-indicator');
    
    const exportReportBtn = document.getElementById('export-report-btn');
    const exportChatBtn = document.getElementById('export-chat-btn');
    const clearChatBtn = document.getElementById('clear-chat-btn');

    // ========================================
    // STATE
    // ========================================
    let conversation = [];
    let projectId = null;
    let checklistStats = { present: 0, missing: 0 };
    let draggedElement = null;

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    function getProjectId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    function getChatStorageKey() {
        return `aerodocs_chat_${projectId}`;
    }

    function loadChatHistory() {
        const saved = localStorage.getItem(getChatStorageKey());
        if (saved) {
            try {
                conversation = JSON.parse(saved);
                conversation.forEach(msg => renderMessage(msg, false));
            } catch (e) {
                console.error('Failed to load chat history:', e);
            }
        }
    }

    function saveChatHistory() {
        localStorage.setItem(getChatStorageKey(), JSON.stringify(conversation));
    }

    function clearChatHistory() {
        conversation = [];
        localStorage.removeItem(getChatStorageKey());
        chatMessagesContainer.innerHTML = '';
        // Add initial greeting
        const initialMessage = { sender: 'ai', text: 'Hello! I am the AI Assistant for this project. How can I help you analyze these documents?' };
        conversation.push(initialMessage);
        renderMessage(initialMessage);
        saveChatHistory();
        window.showToast('Chat history cleared', 'success');
    }

    // ========================================
    // FILE ACTION HANDLERS
    // ========================================
    function handleFileAction(action, item) {
        switch(action) {
            case 'download':
                window.showToast(`Downloading ${item.name}...`, 'info');
                console.log('Download file:', item);
                break;
            case 'share':
                window.showToast(`Opening share options for ${item.name}...`, 'info');
                console.log('Share file:', item);
                break;
            case 'annotate':
                window.showToast(`Opening annotation editor for ${item.name}...`, 'info');
                console.log('Annotate file:', item);
                break;
            default:
                console.warn('Unknown action:', action);
        }
    }

    // ========================================
    // CHECKLIST RENDERING
    // ========================================
    function countChecklistItems(item) {
        if (item.type === 'File') {
            if (item.status === 'Present') checklistStats.present++;
            else if (item.status === 'Missing') checklistStats.missing++;
        }
        if (item.children) {
            item.children.forEach(child => countChecklistItems(child));
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
        if (isFile) {
            itemHeader.draggable = true;
        }
        itemHeader.innerHTML = `
            ${toggleIcon}
            ${statusIcon}
            <span class="item-name">${item.name}</span>
            ${fileActionsHtml}
        `;

        // Add click handlers for file actions
        if (isFile) {
            const actionBtns = itemHeader.querySelectorAll('.file-action-btn[data-action]');
            actionBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleFileAction(btn.dataset.action, item);
                });
            });

            // Drag and drop
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
                    if (e.clientY < midY) {
                        li.classList.add('drag-above');
                        li.classList.remove('drag-below');
                    } else {
                        li.classList.add('drag-below');
                        li.classList.remove('drag-above');
                    }
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

        // Details (Accordion Content)
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

        // Event listener for expanding details
        itemHeader.addEventListener('click', (e) => {
            e.stopPropagation(); 
            itemDetails.classList.toggle('visible');
        });

        // If parent, create children
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

    function loadChecklist(id) {
        const projectData = window.mockChecklistData;
        const projectInfo = window.mockProjects.find(p => p.id === id);
        
        if (projectData) {
            projectNameBreadcrumb.textContent = projectInfo ? projectInfo.name : 'Project Details';
            document.title = `${projectInfo ? projectInfo.name : 'Project'} - AeroDocs`;
            
            // Count stats
            checklistStats = { present: 0, missing: 0 };
            countChecklistItems(projectData);
            
            const total = checklistStats.present + checklistStats.missing;
            const percentage = total > 0 ? Math.round((checklistStats.present / total) * 100) : 0;
            checklistSummary.innerHTML = `
                <span class="stat-present">${checklistStats.present} present</span> / 
                <span class="stat-missing">${checklistStats.missing} missing</span>
                <span class="stat-percentage">(${percentage}% complete)</span>
            `;
            
            const rootUl = document.createElement('ul');
            rootUl.appendChild(createChecklistItemElement(projectData, rootUl));
            checklistContainer.appendChild(rootUl);
        } else {
            checklistContainer.innerHTML = '<p>Could not load checklist data.</p>';
        }
    }

    // ========================================
    // EXPORT FUNCTIONS
    // ========================================
    function exportChatHistory() {
        if (conversation.length === 0) {
            window.showToast('No chat history to export', 'error');
            return;
        }

        const projectInfo = window.mockProjects.find(p => p.id === projectId);
        const projectName = projectInfo ? projectInfo.name : 'Project';
        
        let textContent = `Chat History - ${projectName}\n`;
        textContent += `Exported: ${new Date().toLocaleString()}\n`;
        textContent += '='.repeat(50) + '\n\n';
        
        conversation.forEach(msg => {
            const sender = msg.sender === 'ai' ? 'AI Assistant' : 'You';
            textContent += `[${sender}]\n${msg.text}\n\n`;
        });

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-history-${projectId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        window.showToast('Chat history exported', 'success');
    }

    function exportChecklistReport() {
        const projectData = window.mockChecklistData;
        const projectInfo = window.mockProjects.find(p => p.id === projectId);
        const projectName = projectInfo ? projectInfo.name : 'Project';

        let report = `ICAO CHECKLIST REPORT\n`;
        report += `${'='.repeat(50)}\n\n`;
        report += `Project: ${projectName}\n`;
        report += `Generated: ${new Date().toLocaleString()}\n\n`;
        
        report += `SUMMARY\n${'-'.repeat(30)}\n`;
        report += `Documents Present: ${checklistStats.present}\n`;
        report += `Documents Missing: ${checklistStats.missing}\n`;
        report += `Total: ${checklistStats.present + checklistStats.missing}\n`;
        report += `Completion: ${Math.round((checklistStats.present / (checklistStats.present + checklistStats.missing)) * 100)}%\n\n`;
        
        report += `DETAILS\n${'-'.repeat(30)}\n\n`;
        
        function addItemToReport(item, indent = 0) {
            const prefix = '  '.repeat(indent);
            const statusSymbol = item.status === 'Present' ? '✓' : '✗';
            report += `${prefix}${statusSymbol} ${item.name}\n`;
            report += `${prefix}  Type: ${item.type || 'N/A'} | ICAO Ref: ${item.icaoRef || 'N/A'}\n`;
            
            if (item.children && item.children.length > 0) {
                item.children.forEach(child => addItemToReport(child, indent + 1));
            }
        }
        
        addItemToReport(projectData);
        
        // Missing items section
        report += `\nMISSING DOCUMENTS\n${'-'.repeat(30)}\n`;
        function listMissingItems(item) {
            if (item.status === 'Missing' && item.type === 'File') {
                report += `• ${item.name} (${item.icaoRef || 'N/A'})\n`;
            }
            if (item.children) {
                item.children.forEach(child => listMissingItems(child));
            }
        }
        listMissingItems(projectData);

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `checklist-report-${projectId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        window.showToast('Report exported successfully', 'success');
    }

    // ========================================
    // CHATBOT LOGIC
    // ========================================
    function scrollChatToBottom() {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    function renderMessage(message, scroll = true) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `message ${message.sender}-message`;
        messageWrapper.textContent = message.text;
        chatMessagesContainer.appendChild(messageWrapper);
        if (scroll) scrollChatToBottom();
    }
    
    function getAiResponse(userInput) {
        aiThinkingIndicator.style.display = 'flex';
        scrollChatToBottom();
        
        setTimeout(() => {
            aiThinkingIndicator.style.display = 'none';

            let aiText = "I'm a demo assistant. I can only provide pre-programmed responses.";
            if (userInput.toLowerCase().includes('status')) {
                aiText = `The overall project status shows ${checklistStats.present} present documents and ${checklistStats.missing} missing. The completion rate is ${Math.round((checklistStats.present / (checklistStats.present + checklistStats.missing)) * 100)}%.`;
            } else if (userInput.toLowerCase().includes('missing')) {
                aiText = `There are ${checklistStats.missing} missing documents in this project. You can export a detailed report using the Export Report button in the header.`;
            } else if (userInput.toLowerCase().includes('engine')) {
                aiText = "I've detected 2 missing files for ENGINE #1 [SN: 12345-XYZ]: 'File F 002' and 'File F 015'.";
            } else if (userInput.toLowerCase().includes('help')) {
                aiText = "I can help you with:\n• Project status overview\n• Missing document details\n• Engine information\n• Checklist navigation\n\nTry asking about 'status', 'missing documents', or 'engine' details.";
            }

            const aiMessage = { sender: 'ai', text: aiText };
            conversation.push(aiMessage);
            saveChatHistory();
            renderMessage(aiMessage);

        }, 1500 + Math.random() * 1000);
    }

    function handleChatSubmit(e) {
        e.preventDefault();
        const userInput = chatInput.value.trim();

        if (userInput) {
            const userMessage = { sender: 'user', text: userInput };
            conversation.push(userMessage);
            saveChatHistory();
            renderMessage(userMessage);
            
            chatInput.value = '';
            getAiResponse(userInput);
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================
    exportChatBtn.addEventListener('click', exportChatHistory);
    clearChatBtn.addEventListener('click', clearChatHistory);
    exportReportBtn.addEventListener('click', exportChecklistReport);
    chatForm.addEventListener('submit', handleChatSubmit);

    // ========================================
    // INITIAL LOAD
    // ========================================
    document.addEventListener('DOMContentLoaded', () => {
        projectId = getProjectId();
        if (!projectId) {
            window.location.href = '2_dashboard.html';
            return;
        }

        loadChecklist(projectId);
        loadChatHistory();
        
        // If no chat history, show initial greeting
        if (conversation.length === 0) {
            const initialMessage = { sender: 'ai', text: 'Hello! I am the AI Assistant for this project. How can I help you analyze these documents?' };
            conversation.push(initialMessage);
            renderMessage(initialMessage);
            saveChatHistory();
        }
    });

})();

