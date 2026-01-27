/**
 * Export Service
 * Handles file exports (chat, reports, etc.)
 * 
 * Angular equivalent: @Injectable() ExportService
 */
class ExportService {
    constructor() {
        // Configuration
        this.config = {
            defaultFilename: 'export',
            defaultExtension: 'txt'
        };
    }

    /**
     * Download text content as a file
     */
    downloadAsTextFile(content, filename, extension = 'txt') {
        if (!content) {
            console.warn('No content to export');
            return false;
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${extension}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        return true;
    }

    /**
     * Download JSON content as a file
     */
    downloadAsJsonFile(data, filename) {
        const content = JSON.stringify(data, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        return true;
    }

    /**
     * Export chat history
     */
    exportChatHistory(chatService, projectId, projectName) {
        const content = chatService.exportAsText(projectName);
        
        if (!content) {
            return { success: false, message: 'No chat history to export' };
        }
        
        const success = this.downloadAsTextFile(content, `chat-history-${projectId}`);
        return { 
            success, 
            message: success ? 'Chat history exported' : 'Failed to export chat history' 
        };
    }

    /**
     * Export checklist report
     */
    exportChecklistReport(checklistService, projectId, projectName) {
        const report = checklistService.generateReport(projectName);
        
        if (!report) {
            return { success: false, message: 'No checklist data to export' };
        }
        
        const success = this.downloadAsTextFile(report, `checklist-report-${projectId}`);
        return { 
            success, 
            message: success ? 'Report exported successfully' : 'Failed to export report' 
        };
    }
}

// Export for use in other modules
window.ExportService = ExportService;
