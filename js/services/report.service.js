/**
 * Report Service
 * Generates professional PDF reports for project validation status
 * Uses jsPDF and AutoTable
 */

class ReportService {
    constructor() {
        this.logoUrl = 'favicon.png'; // Use favicon as logo for now
    }

    /**
     * Generate and download validation report
     * Corporate Aviation Design (Navy Blue/Gray)
     * @param {Object} project - Project details
     * @param {Object} validationData - Validation results from ValidationService
     */
    /**
     * Generate and download validation report
     * Corporate Aviation Design (Navy Blue/Gray)
     * @param {Object} project - Project details
     * @param {Object} validationData - Validation results from ValidationService
     * @param {Array} docs - Full document structure (optional but needed for details)
     */
    async generateValidationReport(project, validationData, docs) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // --- PROFESSIONAL NEUTRAL PALETTE ---
        const colors = {
            text: [33, 37, 41],          // Nearly Black
            secondary: [108, 117, 125],  // Medium Gray
            accent: [222, 226, 230],     // Light Gray lines
            success: [25, 135, 84],      // Green (kept for positive validation)
            warning: [255, 193, 7],      // Amber (kept for middle state)
            critical: [52, 58, 64],      // Neutral Dark Gray (instead of Red)
            highlight: [108, 117, 125]   // Neutral Medium Gray (instead of Orange)
        };

        // --- Helper: Clean Section Header ---
        const addSectionHeader = (text, y) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...colors.text);
            doc.text(text.toUpperCase(), 14, y);
            
            // Thin elegant line
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);
            doc.line(14, y + 2, 196, y + 2);
        };

        // --- Helper: Key-Value Pair ---
        const addField = (label, value, x, y) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...colors.secondary);
            doc.text(label.toUpperCase(), x, y);
            
            doc.setFont('helvetica', 'normal'); // Keep it clean/light
            doc.setFontSize(10);
            doc.setTextColor(...colors.text);
            doc.text(String(value), x, y + 5);
        };

        // ==========================================
        // HEADER (Clean & White)
        // ==========================================
        
        // Logo logic could go here, for now just text
        
        // Report Title - Left Aligned
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(...colors.text);
        doc.text('IATA VALIDATION REPORT', 14, 20);
        
        // Date - Right Aligned
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...colors.secondary);
        const dateStr = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
        doc.text(dateStr.toUpperCase(), 196, 20, { align: 'right' });

        // Divider
        doc.setDrawColor(0);
        doc.setLineWidth(0.5); // Thicker top line
        doc.line(14, 25, 196, 25);

        // ==========================================
        // EXECUTIVE SUMMARY & PROJECT INFO
        // ==========================================
        
        let startY = 40;
        
        // --- Project Details ---
        addField('Project Name', project.name, 14, startY);
        addField('Model', project.model || 'N/A', 14, startY + 12);
        addField('MSN', project.msn || 'N/A', 60, startY + 12);
        
        // --- Status Box (Minimalist Outline) ---
        const boxX = 120;
        const boxY = startY - 2;
        const boxWidth = 76;
        
        // Get status
        let statusColor = colors.secondary;
        let statusLabel = 'UNKNOWN';
        
        if (validationData.status === 'COMPLETED') { 
            statusColor = colors.success; 
            statusLabel = 'COMPLIANT';
        } else if (validationData.status === 'INCOMPLETE') { 
            statusColor = colors.secondary; // Keep incomplete gray/neutral
            statusLabel = 'INCOMPLETE';
        } else if (validationData.status === 'NON_COMPLIANT') { 
            statusColor = colors.critical; 
            statusLabel = 'NON-COMPLIANT';
        }

        // Label
        doc.setFontSize(8);
        doc.setTextColor(...colors.secondary);
        doc.text('OVERALL STATUS', boxX, boxY + 2);
        
        // Status Text
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...statusColor);
        doc.text(statusLabel, boxX, boxY + 8);
        
        // Simple Progress Line
        const progressY = boxY + 15;
        const maxBarWidth = 76;
        
        // Background Line
        doc.setDrawColor(230);
        doc.setLineWidth(1);
        doc.line(boxX, progressY, boxX + maxBarWidth, progressY);
        
        // Progress Line
        if (validationData.percentage > 0) {
            const currentWidth = (maxBarWidth * validationData.percentage) / 100;
            doc.setDrawColor(...statusColor);
            doc.setLineWidth(1);
            doc.line(boxX, progressY, boxX + currentWidth, progressY);
        }
        
        // Pct Text
        doc.setFontSize(9);
        doc.setTextColor(...colors.text);
        doc.text(`${validationData.percentage}% Completion`, boxX, progressY + 5);


        // ==========================================
        // STATUS DEFINITIONS (Metadata)
        // ==========================================
        const metaY = startY + 25;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.secondary);
        doc.text('STATUS DEFINITIONS:', 14, metaY);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        // Legend Items (Vertical Stack for better fit)
        const legendItems = [
            { label: 'COMPLIANT', desc: 'All mandatory docs present.', color: colors.success },
            { label: 'INCOMPLETE', desc: 'Missing non-critical docs.', color: colors.secondary },
            { label: 'NON-COMPLIANT', desc: 'Critical mandatory docs missing.', color: colors.critical }
        ];
        
        let legendX = 14;
        let legendY = metaY + 4;

        legendItems.forEach(item => {
            // Color Dot
            doc.setFillColor(...item.color);
            doc.circle(legendX + 1, legendY, 1.5, 'F');
            
            // Label
            doc.setTextColor(...colors.text);
            doc.setFont('helvetica', 'bold');
            doc.text(item.label, legendX + 4, legendY + 1);
            
            // Desc
            const labelWidth = doc.getTextWidth(item.label);
            doc.setTextColor(...colors.secondary);
            doc.setFont('helvetica', 'normal');
            doc.text(`- ${item.desc}`, legendX + 4 + labelWidth + 2, legendY + 1);
            
            // Move to next line for better spacing/no overflow
            legendY += 5; 
        });


        // ==========================================
        // CRITICAL ALERTS (Minimalist)
        // ==========================================
        
        // Push down content start to account for vertical legend
        let contentStartY = startY + 50;

        if (validationData.criticalMissing.length > 0) {
            const alertY = contentStartY;
            
            // Clean/Neutral Box
            doc.setFillColor(250, 250, 250); // Almost White
            doc.setDrawColor(200, 200, 200); // Subtle Border
            doc.roundedRect(14, alertY, 182, 14, 1, 1, 'FD'); 

            // Icon background (Circle) - Neutral Gray
            doc.setFillColor(...colors.secondary);
            doc.circle(20, alertY + 7, 3, 'F');
            
            // Icon Text (!)
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('!', 19.2, alertY + 8.2);

            // Title
            doc.setTextColor(...colors.text);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('ATTENTION REQUIRED', 26, alertY + 5);            
            // Description
            doc.setFont('helvetica', 'normal');
            doc.text(`${validationData.criticalMissing.length} mandatory documents are pending review.`, 26, alertY + 10);
            
            contentStartY += 22;
        }

        // ==========================================
        // TABLE (Clean, No fill headers)
        // ==========================================
        
        const tableData = Object.entries(validationData.sections).map(([code, data]) => {
            if (!data.applicable) return null;
            const info = window.validationService.getSectionInfo(code);
            
            let rowStatus = 'PENDING';
            if (data.criticalMissing.length > 0) rowStatus = 'FAIL';
            else if (data.status === 'COMPLETED') rowStatus = 'OK';
            else if (data.status === 'INCOMPLETE') rowStatus = 'INC';
            else if (data.status === 'NON_COMPLIANT') rowStatus = 'NC';
            
            return [
                code,
                info.name,
                `${data.percentage}%`,
                `${data.present}/${data.total}`,
                rowStatus
            ];
        }).filter(Boolean);

        doc.autoTable({
            startY: contentStartY,
            head: [['CODE', 'SECTION', 'PROGRESS', 'DOCS', 'STATUS']],
            body: tableData,
            theme: 'plain',
            
            // Minimalist Styles
            styles: {
                font: 'helvetica',
                fontSize: 9,
                cellPadding: 6,
                lineColor: 230,
                lineWidth: 0, // No borders inside usually looks cleaner, or bottom border only
            },
            
            // Header: Bold, Black, Border Bottom only
            headStyles: { 
                fillColor: false,
                textColor: colors.text,
                fontStyle: 'bold',
                fontSize: 6,
                lineWidth: { bottom: 0.1 },
                lineColor: [0, 0, 0]
            },
            
            // Body
            bodyStyles: {
                textColor: colors.text,
                lineWidth: { bottom: 0.1 },
                lineColor: 240
            },
            
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 15 },
                1: { cellWidth: 'auto' },
                2: { halign: 'right', cellWidth: 25 },
                3: { halign: 'right', cellWidth: 20 },
                4: { halign: 'right', fontStyle: 'bold', cellWidth: 20 }
            },
            
            didParseCell: function(data) {
                if (data.section === 'body' && data.column.index === 4) {
                    const text = data.cell.raw;
                    if (text === 'OK') {
                        data.cell.styles.textColor = colors.success;
                        data.cell.styles.fontStyle = 'bold';
                    }
                    else if (text === 'FAIL' || text === 'NC') {
                        // Use Critical color but maybe regular font to be less aggressive, or just bold
                        data.cell.styles.textColor = colors.critical; 
                        data.cell.styles.fontStyle = 'bold';
                    }
                    else {
                        data.cell.styles.textColor = colors.secondary;
                    }
                }
            }
        });

        // ==========================================
        // CRITICAL MISSING LIST
        // ==========================================
        
        // ==========================================
        // CRITICAL MISSING LIST (Table)
        // ==========================================
        
        if (validationData.criticalMissing.length > 0) {
            let finalY = doc.lastAutoTable.finalY + 15;
            
            // Check for page break space (need ~40 units for header + 1 row)
            if (finalY > 250) {
                doc.addPage();
                finalY = 20;
            }
            
            addSectionHeader('Missing Critical Documents', finalY);
            
            const missingTableData = validationData.criticalMissing.map(code => {
                const info = window.validationService.getDocumentInfo(code);
                return [code, info ? info.name : 'Unknown', 'MISSING'];
            });

            doc.autoTable({
                startY: finalY + 5,
                head: [['CODE', 'DOCUMENT NAME', 'STATUS']],
                body: missingTableData,
                theme: 'plain',
                styles: {
                    font: 'helvetica',
                    fontSize: 9,
                    cellPadding: 4,
                    lineColor: 230,
                    lineWidth: { bottom: 0.1 }
                },
                headStyles: { 
                    fillColor: false,
                    textColor: colors.text,
                    fontStyle: 'bold',
                    fontSize: 8,
                    lineWidth: { bottom: 0.5 }, // Thicker border for sub-table
                    lineColor: [0, 0, 0]
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 25, textColor: colors.critical },
                    1: { cellWidth: 'auto' },
                    2: { fontStyle: 'bold', textColor: colors.critical, cellWidth: 30, halign: 'right' }
                }
            });
        }

        // ==========================================
        // DETAILED COMPLIANCE REPORT (NEW)
        // ==========================================
        
        // Only if we have the full docs structure and validation service
        if (docs && window.validationService) {
            doc.addPage();
            addSectionHeader('Detailed Compliance Report', 20);
            
            let currentY = 30;

            // Iterate through sections
            const sections = Object.entries(validationData.sections);
            
            for (const [code, sectionData] of sections) {
                if (!sectionData.applicable) continue;
                
                const sectionInfo = window.validationService.getSectionInfo(code);
                
                // Check if we need a new page for the section header
                if (currentY > 250) {
                    doc.addPage();
                    currentY = 20;
                }

                // Section Header
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor(...colors.text);
                doc.text(`${code} - ${sectionInfo.name}`, 14, currentY);
                
                // Section Progress
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(...colors.secondary);
                doc.text(`Progress: ${sectionData.percentage}% (${sectionData.present}/${sectionData.total} docs)`, 196, currentY, { align: 'right' });

                // Get detailed docs for this section
                // We use the validation service helper to get the list with status
                const sectionDocs = window.validationService.getSectionDetails(code, docs);
                
                // Prepare table data
                const docTableData = sectionDocs.map(d => {
                    let statusLabel = 'MISSING';
                    if (d.isPresent) statusLabel = 'UPLOADED';
                    else if (d.critical) statusLabel = 'CRITICAL MISSING';
                    
                    return [
                        d.code,
                        d.name,
                        d.critical ? 'Mandatory' : 'Optional',
                        statusLabel
                    ];
                });

                doc.autoTable({
                    startY: currentY + 5,
                    head: [['CODE', 'DOCUMENT', 'REQ', 'STATUS']],
                    body: docTableData,
                    theme: 'plain',
                    styles: {
                        font: 'helvetica',
                        fontSize: 8,
                        cellPadding: 3,
                        lineColor: 240,
                        lineWidth: { bottom: 0.1 }
                    },
                    headStyles: { 
                        fillColor: [248, 249, 250],
                        textColor: colors.secondary,
                        fontStyle: 'bold',
                        fontSize: 7
                    },
                    columnStyles: {
                        0: { cellWidth: 25, fontStyle: 'bold' },
                        1: { cellWidth: 'auto' },
                        2: { cellWidth: 20 },
                        3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
                    },
                    didParseCell: function(data) {
                        if (data.section === 'body' && data.column.index === 3) {
                            const text = data.cell.raw;
                            if (text === 'UPLOADED') {
                                data.cell.styles.textColor = colors.success;
                            } else if (text === 'CRITICAL MISSING') {
                                data.cell.styles.textColor = colors.critical;
                            } else {
                                data.cell.styles.textColor = [200, 100, 100]; // Soft red/pink for normal missing
                            }
                        }
                    }
                });
                
                currentY = doc.lastAutoTable.finalY + 15;
            }
        }

        // ==========================================
        // FOOTER (Minimal)
        // ==========================================
        
        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            doc.setFontSize(8);
            doc.setTextColor(...colors.secondary);
            doc.text(`Page ${i} of ${pageCount}`, 196, 285, { align: 'right' });
            doc.text('Confidential - Generated by AeroDocs', 14, 285);
        }

        doc.save(`IATA_Report_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
    }


    async generateChatReport(project, chatHistory) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const colors = {
            text: [33, 37, 41],         // Almost Black
            secondary: [108, 117, 125], // Gray
            line: [233, 236, 239],      // Light line
            aiBg: [248, 249, 250],      // Very light gray
            userBg: [255, 255, 255]     // White
        };
        
        // ==========================================
        // HEADER (Clean)
        // ==========================================
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(...colors.text);
        doc.text('AI CONSULTATION LOG', 14, 20);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...colors.secondary);
        const dateStr = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
        doc.text(dateStr, 196, 20, { align: 'right' });

        // Divider
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(14, 25, 196, 25);
        
        // Project Context
        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.text(`PROJECT: ${project.name}`, 14, 32);
        
        // ==========================================
        // CHAT HISTORY
        // ==========================================
        let y = 45;
        
        // Simple separator
        doc.setDrawColor(...colors.line);
        doc.setLineWidth(0.1);
        doc.line(14, 36, 196, 36);
        
        if (!chatHistory || chatHistory.length === 0) {
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(...colors.secondary);
            doc.text('No conversation history available.', 14, y);
        } else {
            chatHistory.forEach(msg => {
                const isAI = msg.sender === 'ai';
                const senderName = isAI ? 'AERODOCS AI' : 'USER';
                
                // Content prep
                // Content prep & Markdown Rendering
                doc.setFontSize(9);
                const maxWidth = 180;
                
                // Helper to render markdown lines
                const renderMarkdownLine = (text, startX, startY) => {
                    let currentY = startY;
                    const lines = text.split('\n');
                    
                    lines.forEach(line => {
                        let lineText = line.trim();
                        if (!lineText) {
                            currentY += 4; // Paragraph spacing
                            return;
                        }
                        
                        let isHeader = false;
                        let isList = false;
                        let indent = 0;
                        
                        // Detect Header (###)
                        if (lineText.startsWith('###')) {
                            isHeader = true;
                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(10); // Slightly larger
                            doc.setTextColor(...colors.text);
                            lineText = lineText.replace(/^#+\s*/, '');
                            currentY += 2;
                        } 
                        // Detect List (* or -)
                        else if (lineText.startsWith('* ') || lineText.startsWith('- ')) {
                            isList = true;
                            doc.setFont('helvetica', 'normal');
                            doc.setFontSize(9);
                            doc.setTextColor(...colors.text);
                            lineText = lineText.replace(/^[\*\-]\s*/, '');
                            indent = 6;
                            
                            // Draw bullet
                            doc.circle(startX + 2, currentY - 1, 1, 'F');
                        }
                        else {
                            doc.setFont('helvetica', 'normal');
                            doc.setFontSize(9);
                            doc.setTextColor(...colors.text);
                        }
                        
                        // Clean bold markers (**) for now to remove raw syntax "bad look"
                        // Implementing full inline bold with wrapping is complex; 
                        // stripping symbols is the safest immediate improvement.
                        lineText = lineText.replace(/\*\*/g, '');
                        
                        const wrappedLines = doc.splitTextToSize(lineText, maxWidth - indent);
                        
                        wrappedLines.forEach(wLine => {
                            // Check Page Break within message
                            if (currentY > 275) {
                                doc.addPage();
                                currentY = 20;
                            }
                            doc.text(wLine, startX + indent, currentY);
                            currentY += 5; // Line height
                        });
                        
                        if (isHeader) currentY += 2; // Extra space after header
                    });
                    
                    return currentY; // Return new Y
                };
                
                // Calculate height first (rough approx or dry run? Dry run is safer but slower)
                // For this MVP, we'll output directly and handle page breaks inline.
                // NOTE: To draw specific backgrounds per message, we need height. 
                // Let's simplify: Draw simpler separation instead of block rects if height is dynamic.
                // OR: First pass to calculate height.
                
                // --- Pass 1: Calculate Height ---
                // We'll just estimate height based on split text to assume background box
                const plainText = msg.text.replace(/###/g, '').replace(/\*\*/g, ''); 
                const approxLines = doc.splitTextToSize(plainText, maxWidth).length;
                // Add explicit newlines count
                const newLinesCount = (msg.text.match(/\n/g) || []).length;
                const blockHeight = ((approxLines + newLinesCount) * 5) + 12;

                // Page Break Check (Block start)
                if (y + blockHeight > 275) {
                    doc.addPage();
                    y = 20;
                }
                
                // Block bg for AI only
                if (isAI) {
                    doc.setFillColor(...colors.aiBg);
                    doc.rect(14, y, 182, blockHeight, 'F');
                }
                
                // Sender Label
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.setTextColor(...colors.secondary);
                doc.text(senderName, 18, y + 6);
                
                // Render Markdown
                const finalY = renderMarkdownLine(msg.text, 18, y + 11);
                
                // Thin separator
                doc.setDrawColor(...colors.line);
                doc.line(14, finalY + 2, 196, finalY + 2);
                
                y = finalY + 7;
            });
        }
        
        // footer
        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(...colors.secondary);
            doc.text(`Page ${i}`, 196, 285, { align: 'right' });
        }

        doc.save(`AI_Chat_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
    }
}

// Export instance
window.reportService = new ReportService();
