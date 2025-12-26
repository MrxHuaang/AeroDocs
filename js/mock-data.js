// mock-data.js - Centralized mock data for the application

/**
 * Mock data for the projects dashboard.
 * In a real application, this would come from an API endpoint like /api/projects
 */
window.mockProjects = [
    {
        id: 'proj-123',
        name: 'Engine ESN 1838432',
        type: 'engine',
        serialNumber: '1838432',
        tags: ['american-airlines'],
        status: 'COMPLETED',
        lastUpdated: '2 days ago',
        createdAt: new Date('2024-12-23T10:00:00')
    },
    {
        id: 'proj-456',
        name: 'Aircraft MSN 2341234',
        type: 'aircraft',
        serialNumber: '2341234',
        tags: ['latam-airlines'],
        status: 'PROCESSING',
        lastUpdated: '1 week ago',
        createdAt: new Date('2024-12-18T14:30:00')
    },
    {
        id: 'proj-789',
        name: 'Engine ESN 9876543',
        type: 'engine',
        serialNumber: '9876543',
        tags: ['united-airlines', 'delta-airlines'],
        status: 'PENDING_REVIEW',
        lastUpdated: '4 hours ago',
        createdAt: new Date('2024-12-25T08:00:00')
    },
    {
        id: 'proj-101',
        name: 'Aircraft MSN 5551234',
        type: 'aircraft',
        serialNumber: '5551234',
        tags: ['lufthansa'],
        status: 'FAILED',
        lastUpdated: '1 day ago',
        createdAt: new Date('2024-12-24T16:45:00')
    },
];



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
                const files = [];
                for (let i = 1; i <= 22; i++) {
                    const num = i.toString().padStart(3, '0');
                    // Some files are missing, most are present
                    const status = (i === 2 || i === 15) ? 'Missing' : 'Present';
                    files.push({
                        name: `F ${num}`,
                        type: 'File',
                        status: status,
                        icaoRef: `8.3.7.${i}`
                    });
                }
                return files;
            })()
        },
        { 
            name: 'F. ENGINE #2 [SN: 67890-ABC]', 
            type: 'Engine',
            status: 'Present',
            icaoRef: '8.3.7',
            children: (function() {
                const files = [];
                for (let i = 1; i <= 22; i++) {
                    const num = i.toString().padStart(3, '0');
                    files.push({
                        name: `F ${num}`,
                        type: 'File',
                        status: 'Present',
                        icaoRef: `8.3.7.${i}`
                    });
                }
                return files;
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

