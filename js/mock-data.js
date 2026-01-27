// mock-data.js - Centralized mock data for the application

/**
 * Mock data for the projects dashboard.
 * IMPORTANT: This array is intentionally empty.
 * Projects should only come from Firebase.
 * Do not add test projects here for production use.
 */
window.mockProjects = [];



/**
 * Mock data for the hierarchical ICAO checklist.
 * This structure is mandatory and represents a single project's details.
 * In a real application, this would come from an API like /api/projects/{id}/checklist
 */
window.mockChecklistData = {
    name: 'AIRCRAFT VH-ABC',
    type: 'Aircraft',
    icaoRef: '8.3.1',
    status: 'Present',
    children: [
        { name: 'A. Valid Certificates', type: 'Folder', status: 'Present', icaoRef: '8.3.2', children: [] },
        { name: 'B. Certified Maintenance Status Summaries', type: 'Folder', status: 'Present', icaoRef: '8.3.3', children: [] },
        { name: 'C. Aircraft Maintenance Records', type: 'Folder', status: 'Present', icaoRef: '8.3.4', children: [] },
        { name: 'D. Configuration Status', type: 'Folder', status: 'Present', icaoRef: '8.3.5', children: [] },
        { name: 'E. Aircraft Manufacturer Records', type: 'Folder', status: 'Present', icaoRef: '8.3.6', children: [] },
        { 
            name: 'F. ENGINE #1 [SN: 12345-XYZ]', 
            type: 'Engine',
            status: 'Missing',
            icaoRef: '8.3.7',
            children: (function() {
                const folders = [];
                // PDF file names for different folder types
                const pdfNames = {
                    1: ['Engine_Maintenance_Log.pdf', 'Initial_Inspection_Report.pdf'],
                    3: ['Overhaul_Certificate.pdf', 'Parts_Replacement_Record.pdf'],
                    4: ['Service_Bulletin_Compliance.pdf', 'Airworthiness_Directive.pdf'],
                    5: ['Shop_Visit_Report.pdf'],
                    7: ['Life_Limited_Parts_Status.pdf', 'Component_History.pdf'],
                    8: ['Test_Cell_Run_Report.pdf', 'Performance_Data.pdf'],
                    10: ['Modification_Status.pdf'],
                    12: ['Last_Shop_Visit_Summary.pdf', 'Workscope_Document.pdf'],
                    14: ['Oil_Analysis_Report.pdf'],
                    16: ['Engine_Build_Record.pdf', 'Assembly_Documentation.pdf'],
                    18: ['Borescope_Inspection.pdf', 'Visual_Inspection_Report.pdf'],
                    20: ['Trend_Monitoring_Data.pdf'],
                    22: ['Engine_Logbook_Extract.pdf', 'Time_Cycles_Summary.pdf']
                };
                for (let i = 1; i <= 22; i++) {
                    const num = i.toString().padStart(3, '0');
                    // Some folders are missing, most are present
                    const status = (i === 2 || i === 15) ? 'Missing' : 'Present';
                    // Add PDF children for some folders, empty for others
                    const pdfChildren = pdfNames[i] ? pdfNames[i].map(pdfName => ({
                        name: pdfName,
                        type: 'PDF',
                        status: 'Present',
                        icaoRef: `8.3.7.${i}`
                    })) : [];
                    folders.push({
                        name: `F ${num}`,
                        type: 'Folder',
                        status: status,
                        icaoRef: `8.3.7.${i}`,
                        children: pdfChildren
                    });
                }
                return folders;
            })()
        },
        { 
            name: 'F. ENGINE #2 [SN: 67890-ABC]', 
            type: 'Engine',
            status: 'Present',
            icaoRef: '8.3.7',
            children: (function() {
                const folders = [];
                // PDF file names for different folder types
                const pdfNames = {
                    1: ['Engine_Maintenance_Log.pdf', 'Initial_Inspection_Report.pdf'],
                    2: ['Time_Since_Overhaul.pdf', 'Cycle_Count_Record.pdf'],
                    4: ['Service_Bulletin_Compliance.pdf'],
                    6: ['LLP_Tracking_Sheet.pdf', 'Parts_Status.pdf'],
                    8: ['Test_Cell_Run_Report.pdf', 'Performance_Data.pdf'],
                    9: ['Modification_History.pdf'],
                    11: ['Oil_Consumption_Log.pdf', 'Fluid_Analysis.pdf'],
                    13: ['Shop_Visit_Report.pdf'],
                    15: ['Borescope_Images.pdf', 'Inspection_Findings.pdf'],
                    17: ['Engine_Build_Record.pdf'],
                    19: ['Trend_Monitoring_Data.pdf', 'EGT_Margin_Report.pdf'],
                    21: ['Certification_Documents.pdf', 'Release_Certificate.pdf']
                };
                for (let i = 1; i <= 22; i++) {
                    const num = i.toString().padStart(3, '0');
                    // Add PDF children for some folders, empty for others
                    const pdfChildren = pdfNames[i] ? pdfNames[i].map(pdfName => ({
                        name: pdfName,
                        type: 'PDF',
                        status: 'Present',
                        icaoRef: `8.3.7.${i}`
                    })) : [];
                    folders.push({
                        name: `F ${num}`,
                        type: 'Folder',
                        status: 'Present',
                        icaoRef: `8.3.7.${i}`,
                        children: pdfChildren
                    });
                }
                return folders;
            })()
        },
        { name: 'G. APU', type: 'APU', status: 'Present', icaoRef: '8.3.8', children: [] },
        { name: 'H. Component Records', type: 'Folder', status: 'Present', icaoRef: '8.3.9', children: [] },
        { 
            name: 'I. NOSE LANDING GEAR [SN: NLG-001]', 
            type: 'Landing Gear',
            status: 'Present',
            icaoRef: '8.3.10',
            children: (function() {
                const files = [];
                for (let i = 1; i <= 5; i++) {
                    const num = i.toString().padStart(3, '0');
                    files.push({
                        name: `I ${num}`,
                        type: 'File',
                        status: 'Present',
                        icaoRef: `8.3.10.${i}`
                    });
                }
                return files;
            })()
        },
        { 
            name: 'I. LEFT MAIN LANDING GEAR [SN: LMG-002]', 
            type: 'Landing Gear',
            status: 'Present',
            icaoRef: '8.3.10',
            children: [
                { name: 'I 001', type: 'File', status: 'Present', icaoRef: '8.3.10.1' },
                { name: 'I 002', type: 'File', status: 'Present', icaoRef: '8.3.10.2' },
                { name: 'I 003', type: 'File', status: 'Present', icaoRef: '8.3.10.3' },
                { name: 'I 004', type: 'File', status: 'Present', icaoRef: '8.3.10.4' },
                { name: 'I 005', type: 'File', status: 'Present', icaoRef: '8.3.10.5' }
            ]
        },
        { 
            name: 'I. RIGHT MAIN LANDING GEAR [SN: RMG-003]', 
            type: 'Landing Gear',
            status: 'Missing',
            icaoRef: '8.3.10',
            children: [
                { name: 'I 001', type: 'File', status: 'Missing', icaoRef: '8.3.10.1' },
                { name: 'I 002', type: 'File', status: 'Missing', icaoRef: '8.3.10.2' },
                { name: 'I 003', type: 'File', status: 'Missing', icaoRef: '8.3.10.3' },
                { name: 'I 004', type: 'File', status: 'Missing', icaoRef: '8.3.10.4' },
                { name: 'I 005', type: 'File', status: 'Missing', icaoRef: '8.3.10.5' }
            ]
        },
        { name: 'J. Manuals', type: 'Folder', status: 'Present', icaoRef: '8.3.11', children: [] },
        { 
            name: 'K. Additional Documents', 
            type: 'Folder',
            status: 'Present',
            icaoRef: '8.3.12',
            children: (function() {
                const files = [];
                for (let i = 1; i <= 9; i++) {
                    const num = i.toString().padStart(3, '0');
                    files.push({
                        name: `K ${num}`,
                        type: 'File',
                        status: 'Present',
                        icaoRef: `8.3.12.${i}`
                    });
                }
                return files;
            })()
        },
    ]
};

