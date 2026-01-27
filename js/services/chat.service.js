/**
 * Chat Service
 * Handles chat functionality and n8n webhook integration
 * 
 * Angular equivalent: @Injectable() ChatService
 */
class ChatService {
    constructor(storageService, projectId) {
        this.storageService = storageService;
        this.projectId = projectId;
        this.conversation = [];
        this.webhookUrl = 'https://n8n.srv1026018.hstgr.cloud/webhook/2c2356a8-a5aa-4327-b8c7-7e9e51a8f5b1';
        
        // Callbacks for UI updates
        this.onMessageReceived = null;
        this.onError = null;
        this.onLoadingChange = null;
    }

    /**
     * Get the storage key for chat history
     */
    getChatStorageKey() {
        return `chat_${this.projectId}`;
    }

    /**
     * Load chat history from storage
     */
    loadHistory() {
        const saved = this.storageService.get(this.getChatStorageKey(), []);
        this.conversation = saved;
        return this.conversation;
    }

    /**
     * Save chat history to storage
     */
    saveHistory() {
        this.storageService.set(this.getChatStorageKey(), this.conversation);
    }

    /**
     * Clear chat history
     */
    clearHistory() {
        this.conversation = [];
        this.storageService.remove(this.getChatStorageKey());
        
        // Add initial greeting
        const initialMessage = this.createInitialGreeting();
        this.conversation.push(initialMessage);
        this.saveHistory();
        
        return initialMessage;
    }

    /**
     * Create initial greeting message
     */
    createInitialGreeting() {
        return {
            sender: 'ai',
            text: 'Hello! I am the AI Assistant for this project. How can I help you analyze these documents?'
        };
    }

    /**
     * Add a user message and get AI response
     */
    async sendMessage(userInput, projectType, serialNumber) {
        if (!userInput.trim()) return null;

        // Add user message
        const userMessage = { sender: 'user', text: userInput.trim() };
        this.conversation.push(userMessage);
        this.saveHistory();

        // Notify UI of user message
        if (this.onMessageReceived) {
            this.onMessageReceived(userMessage);
        }

        // Get AI response
        return await this.getAiResponse(userInput, projectType, serialNumber);
    }

    /**
     * Convert conversation to webhook format
     */
    convertHistorialForWebhook() {
        return this.conversation.map(msg => ({
            role: msg.sender === 'user' ? 'usuario' : 'model',
            parts: [msg.text]
        }));
    }

    /**
     * Call n8n webhook to get AI response
     */
    async getAiResponse(userInput, projectType, serialNumber) {
        if (this.onLoadingChange) {
            this.onLoadingChange(true);
        }

        const payload = {
            message: userInput,
            historial: this.convertHistorialForWebhook(),
            type: projectType === 'aircraft' ? 'Aircraft' : 'engine',
            serie: serialNumber || ''
        };

        console.log('Sending to n8n webhook:', payload);

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const aiText = data.output || 'Lo siento, no pude obtener una respuesta.';
            const aiMessage = { sender: 'ai', text: aiText };
            
            this.conversation.push(aiMessage);
            this.saveHistory();

            if (this.onLoadingChange) {
                this.onLoadingChange(false);
            }

            if (this.onMessageReceived) {
                this.onMessageReceived(aiMessage);
            }

            return aiMessage;

        } catch (error) {
            console.error('Error calling n8n webhook:', error);
            
            if (this.onLoadingChange) {
                this.onLoadingChange(false);
            }

            const errorMessage = {
                sender: 'ai',
                text: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.'
            };
            
            this.conversation.push(errorMessage);
            this.saveHistory();

            if (this.onError) {
                this.onError('Error al conectar con el asistente AI');
            }

            if (this.onMessageReceived) {
                this.onMessageReceived(errorMessage);
            }

            return errorMessage;
        }
    }

    /**
     * Export chat history as text file
     */
    exportAsText(projectName = 'Project') {
        if (this.conversation.length === 0) {
            return null;
        }

        let textContent = `Chat History - ${projectName}\n`;
        textContent += `Exported: ${new Date().toLocaleString()}\n`;
        textContent += '='.repeat(50) + '\n\n';
        
        this.conversation.forEach(msg => {
            const sender = msg.sender === 'ai' ? 'AI Assistant' : 'You';
            textContent += `[${sender}]\n${msg.text}\n\n`;
        });

        return textContent;
    }

    /**
     * Get conversation history
     */
    getHistory() {
        return this.conversation;
    }
}

// Export for use in other modules
window.ChatService = ChatService;
