/**
 * Checklist Service
 * Handles ICAO checklist operations and data management
 * 
 * Angular equivalent: @Injectable() ChecklistService
 */
class ChecklistService {
    constructor() {
        this.stats = { present: 0, missing: 0 };
        this.checklistData = null;
    }

    /**
     * Count checklist items recursively
     */
    countItems(item) {
        if (item.type === 'File') {
            if (item.status === 'Present') this.stats.present++;
            else if (item.status === 'Missing') this.stats.missing++;
        }
        if (item.children) {
            item.children.forEach(child => this.countItems(child));
        }
    }

    /**
     * Load checklist data
     */
    load(checklistData) {
        this.checklistData = checklistData;
        this.stats = { present: 0, missing: 0 };
        
        if (checklistData) {
            this.countItems(checklistData);
        }
        
        return this.stats;
    }

    /**
     * Get completion percentage
     */
    getCompletionPercentage() {
        const total = this.stats.present + this.stats.missing;
        return total > 0 ? Math.round((this.stats.present / total) * 100) : 0;
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            ...this.stats,
            total: this.stats.present + this.stats.missing,
            percentage: this.getCompletionPercentage()
        };
    }

    /**
     * Get missing items recursively
     */
    getMissingItems(item = null, results = []) {
        const data = item || this.checklistData;
        
        if (data.status === 'Missing' && data.type === 'File') {
            results.push({
                name: data.name,
                icaoRef: data.icaoRef || 'N/A'
            });
        }
        
        if (data.children) {
            data.children.forEach(child => this.getMissingItems(child, results));
        }
        
        return results;
    }

    /**
     * Generate report data
     */
    generateReport(projectName = 'Project') {
        const stats = this.getStats();
        const missingItems = this.getMissingItems();
        
        let report = `ICAO CHECKLIST REPORT\n`;
        report += `${'='.repeat(50)}\n\n`;
        report += `Project: ${projectName}\n`;
        report += `Generated: ${new Date().toLocaleString()}\n\n`;
        
        report += `SUMMARY\n${'-'.repeat(30)}\n`;
        report += `Documents Present: ${stats.present}\n`;
        report += `Documents Missing: ${stats.missing}\n`;
        report += `Total: ${stats.total}\n`;
        report += `Completion: ${stats.percentage}%\n\n`;
        
        report += `DETAILS\n${'-'.repeat(30)}\n\n`;
        this.addItemToReport(this.checklistData, 0, (line) => { report += line; });
        
        report += `\nMISSING DOCUMENTS\n${'-'.repeat(30)}\n`;
        missingItems.forEach(item => {
            report += `• ${item.name} (${item.icaoRef})\n`;
        });
        
        return report;
    }

    /**
     * Add item to report recursively (helper)
     */
    addItemToReport(item, indent = 0, appendFn) {
        const prefix = '  '.repeat(indent);
        const statusSymbol = item.status === 'Present' ? '✓' : '✗';
        appendFn(`${prefix}${statusSymbol} ${item.name}\n`);
        appendFn(`${prefix}  Type: ${item.type || 'N/A'} | ICAO Ref: ${item.icaoRef || 'N/A'}\n`);
        
        if (item.children && item.children.length > 0) {
            item.children.forEach(child => this.addItemToReport(child, indent + 1, appendFn));
        }
    }

    /**
     * Get checklist data
     */
    getData() {
        return this.checklistData;
    }
}

// Export for use in other modules
window.ChecklistService = ChecklistService;
