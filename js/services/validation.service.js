/**
 * Validation Service
 * Calculates documentation compliance status according to IATA standards
 * 
 * Status Levels:
 * - COMPLETED: 100% complete, no critical missing
 * - INCOMPLETE: 50-99% complete, no critical missing
 * - NON_COMPLIANT: <50% OR critical documents missing
 */
class ValidationService {
    constructor() {
        this.catalog = window.IATA_DOCUMENT_CATALOG;
    }

    /**
     * Get the compliance status for a section based on uploaded documents
     * @param {string} sectionCode - Section code (A-K)
     * @param {Object} uploadedDocs - Documents uploaded for this section (from Firebase)
     * @param {string} projectType - 'aircraft' or 'engine'
     * @returns {Object} { status, percentage, present, missing, criticalMissing, total }
     */
    getSectionStatus(sectionCode, uploadedDocs, projectType = 'aircraft') {
        const section = this.catalog.sections[sectionCode];
        if (!section) {
            return this._createEmptyResult();
        }

        // Check if section applies to this project type
        if (!section.requiredFor.includes(projectType.toLowerCase())) {
            return {
                status: 'NOT_APPLICABLE',
                percentage: 100,
                present: 0,
                missing: 0,
                criticalMissing: [],
                total: 0,
                applicable: false
            };
        }

        const requiredDocs = section.documents;
        const presentCodes = this._extractPresentCodes(uploadedDocs, sectionCode);
        
        let presentCount = 0;
        let missingCount = 0;
        const criticalMissing = [];

        requiredDocs.forEach(doc => {
            const isPresent = presentCodes.includes(doc.code);
            
            if (isPresent) {
                presentCount++;
            } else {
                missingCount++;
                if (doc.critical) {
                    criticalMissing.push(doc.code);
                }
            }
        });

        const total = requiredDocs.length;
        const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;
        
        // Determine status
        let status;
        if (criticalMissing.length > 0) {
            status = this.catalog.STATUS.NON_COMPLIANT;
        } else if (percentage < 50) {
            status = this.catalog.STATUS.NON_COMPLIANT;
        } else if (percentage === 100) {
            status = this.catalog.STATUS.COMPLETED;
        } else {
            status = this.catalog.STATUS.INCOMPLETE;
        }

        return {
            status,
            percentage,
            present: presentCount,
            missing: missingCount,
            criticalMissing,
            total,
            applicable: true
        };
    }

    /**
     * Get detailed document status for a section (for UI display)
     * @param {string} sectionCode 
     * @param {Object} uploadedDocs 
     * @returns {Array} List of documents with status
     */
    getSectionDetails(sectionCode, uploadedDocs) {
        const section = this.catalog.sections[sectionCode];
        if (!section) return [];
        
        const presentCodes = this._extractPresentCodes(uploadedDocs, sectionCode);
        
        return section.documents.map(doc => {
            const isPresent = presentCodes.includes(doc.code);
            return {
                code: doc.code,
                name: doc.name,
                critical: doc.critical || false,
                isPresent: isPresent,
                status: isPresent ? 'PRESENT' : (doc.critical ? 'CRITICAL_MISSING' : 'MISSING')
            };
        });
    }

    /**
     * Get overall project compliance status
     * @param {Object} allDocs - All documents from Firebase (organized by section)
     * @param {string} projectType - 'aircraft' or 'engine'
     * @returns {Object} Overall compliance summary
     */
    getProjectStatus(allDocs, projectType = 'aircraft') {
        const sections = this.catalog.getSectionsForType(projectType);
        const sectionResults = {};
        
        let totalPresent = 0;
        let totalMissing = 0;
        let totalDocs = 0;
        let allCriticalMissing = [];
        let completedSections = 0;
        let incompleteSections = 0;
        let nonCompliantSections = 0;

        Object.keys(sections).forEach(sectionCode => {
            const sectionDocs = this._getSectionDocs(allDocs, sectionCode);
            const result = this.getSectionStatus(sectionCode, sectionDocs, projectType);
            
            sectionResults[sectionCode] = result;
            
            if (result.applicable) {
                totalPresent += result.present;
                totalMissing += result.missing;
                totalDocs += result.total;
                allCriticalMissing = allCriticalMissing.concat(result.criticalMissing);
                
                switch (result.status) {
                    case this.catalog.STATUS.COMPLETED:
                        completedSections++;
                        break;
                    case this.catalog.STATUS.INCOMPLETE:
                        incompleteSections++;
                        break;
                    case this.catalog.STATUS.NON_COMPLIANT:
                        nonCompliantSections++;
                        break;
                }
            }
        });

        const overallPercentage = totalDocs > 0 ? Math.round((totalPresent / totalDocs) * 100) : 0;
        
        // Determine overall status
        let overallStatus;
        if (allCriticalMissing.length > 0 || nonCompliantSections > 0) {
            overallStatus = this.catalog.STATUS.NON_COMPLIANT;
        } else if (overallPercentage === 100) {
            overallStatus = this.catalog.STATUS.COMPLETED;
        } else {
            overallStatus = this.catalog.STATUS.INCOMPLETE;
        }

        return {
            status: overallStatus,
            percentage: overallPercentage,
            totalPresent,
            totalMissing,
            totalDocs,
            criticalMissing: allCriticalMissing,
            sections: sectionResults,
            sectionCounts: {
                completed: completedSections,
                incomplete: incompleteSections,
                nonCompliant: nonCompliantSections,
                total: Object.keys(sections).length
            }
        };
    }

    /**
     * Extract present document codes from Firebase docs structure
     * @param {Object} uploadedDocs - Documents from Firebase
     * @param {string} sectionCode - Section code to filter
     * @returns {Array} Array of document codes that are present
     */
    _extractPresentCodes(uploadedDocs, sectionCode) {
        const presentCodes = [];
        
        if (!uploadedDocs || typeof uploadedDocs !== 'object') {
            return presentCodes;
        }

        // Firebase structure: { sectionCode: { docCode: [{ code, name, confidence }] } }
        const sectionDocs = uploadedDocs[sectionCode] || uploadedDocs;
        
        if (typeof sectionDocs !== 'object') {
            return presentCodes;
        }

        Object.entries(sectionDocs).forEach(([codeKey, docList]) => {
            if (Array.isArray(docList)) {
                docList.forEach(doc => {
                    // Only count as present if confidence is not BAJA
                    const confidence = this._normalizeConfidence(doc?.confidence);
                    if (confidence !== 'BAJA') {
                        const code = doc?.code || codeKey;
                        if (!presentCodes.includes(code)) {
                            presentCodes.push(code);
                        }
                    }
                });
            } else if (typeof docList === 'object' && docList !== null) {
                // Handle nested structure
                const code = docList.code || codeKey;
                const confidence = this._normalizeConfidence(docList.confidence);
                if (confidence !== 'BAJA' && !presentCodes.includes(code)) {
                    presentCodes.push(code);
                }
            }
        });

        return presentCodes;
    }

    /**
     * Get section docs from overall docs structure
     */
    _getSectionDocs(allDocs, sectionCode) {
        if (!allDocs || typeof allDocs !== 'object') {
            return {};
        }
        return allDocs[sectionCode] || {};
    }

    /**
     * Normalize confidence value
     */
    _normalizeConfidence(value) {
        const v = String(value || '').trim().toUpperCase();
        if (v === 'ALTA' || v === 'MEDIA' || v === 'BAJA') {
            return v;
        }
        return 'MEDIA';
    }

    /**
     * Create empty result for invalid section
     */
    _createEmptyResult() {
        return {
            status: this.catalog.STATUS.NON_COMPLIANT,
            percentage: 0,
            present: 0,
            missing: 0,
            criticalMissing: [],
            total: 0,
            applicable: true
        };
    }

    /**
     * Get status display info (label, color class, icon)
     * @param {string} status - Status code
     * @returns {Object} Display info
     */
    getStatusDisplay(status) {
        switch (status) {
            case this.catalog.STATUS.COMPLETED:
                return {
                    label: 'Completed',
                    cssClass: 'status-completed',
                    icon: '✓',
                    color: '#22c55e'
                };
            case this.catalog.STATUS.INCOMPLETE:
                return {
                    label: 'Incomplete',
                    cssClass: 'status-incomplete',
                    icon: '⚠',
                    color: '#f59e0b'
                };
            case this.catalog.STATUS.NON_COMPLIANT:
                return {
                    label: 'Non-Compliant',
                    cssClass: 'status-non-compliant',
                    icon: '✗',
                    color: '#ef4444'
                };
            case 'NOT_APPLICABLE':
                return {
                    label: 'N/A',
                    cssClass: 'status-na',
                    icon: '—',
                    color: '#6b7280'
                };
            default:
                return {
                    label: 'Unknown',
                    cssClass: 'status-unknown',
                    icon: '?',
                    color: '#6b7280'
                };
        }
    }

    /**
     * Check if document is critical
     */
    isCritical(docCode) {
        return this.catalog.isCriticalDocument(docCode);
    }

    /**
     * Get document info
     */
    getDocumentInfo(docCode) {
        return this.catalog.getDocumentInfo(docCode);
    }

    /**
     * Get section info
     */
    getSectionInfo(sectionCode) {
        return this.catalog.sections[sectionCode] || null;
    }

    /**
     * Get all sections for a project type
     */
    getSectionsForType(projectType) {
        return this.catalog.getSectionsForType(projectType);
    }
}

// Export singleton instance
window.ValidationService = ValidationService;
window.validationService = new ValidationService();
