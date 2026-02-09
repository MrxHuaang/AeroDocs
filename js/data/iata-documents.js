/**
 * IATA Document Catalog
 * Based on "Guidance Material and Best Practices for Aircraft Leases - 4th Edition"
 *
 * Defines all required documents by section (A-K) for aircraft/engine redelivery
 */

window.IATA_DOCUMENT_CATALOG = {
  // Status constants
  STATUS: {
    COMPLETED: "COMPLETED", // 100% completo, sin críticos faltantes
    INCOMPLETE: "INCOMPLETE", // 50-99% completo, sin críticos faltantes
    NON_COMPLIANT: "NON_COMPLIANT", // <50% o faltan críticos
  },

  // Confidence mapping to compliance
  CONFIDENCE_TO_STATUS: {
    ALTA: "present", // High confidence = document found
    MEDIA: "present", // Medium confidence = document found (needs review)
    BAJA: "missing", // Low confidence = likely not found
  },

  // Section definitions with required documents
  sections: {
    A: {
      code: "A",
      name: "Current Certificates",
      fullName: "Valid Certificates",
      description: "Airworthiness certificates, registration, and licenses",
      requiredFor: ["aircraft"],
      documents: [
        { code: "A001", name: "Certificate of Airworthiness", critical: true },
        { code: "A002", name: "Certificate of Registration", critical: true },
        {
          code: "A003",
          name: "Certificate of Airworthiness for Export",
          critical: false,
        },
        { code: "A004", name: "Noise Certificate", critical: false },
        { code: "A005", name: "Radio Station License", critical: false },
        { code: "A006", name: "De-Registration Confirmation", critical: false },
        { code: "A007", name: "Burn Certification", critical: false },
      ],
    },
    B: {
      code: "B",
      name: "Maintenance Summaries",
      fullName: "Certified Maintenance Status Summaries",
      description: "Status of directives, bulletins, modifications, and parts",
      requiredFor: ["aircraft"],
      documents: [
        {
          code: "B001",
          name: "Airframe Check/Inspection History",
          critical: false,
        },
        {
          code: "B002",
          name: "Total Time in Service (Hours/Cycles)",
          critical: false,
        },
        { code: "B003", name: "Aircraft Flight Time Report", critical: false },
        {
          code: "B004",
          name: "Airworthiness Directives Status",
          critical: false,
        },
        { code: "B005", name: "Service Bulletins Status", critical: false },
        { code: "B006", name: "Modifications/STCs Listing", critical: false },
        {
          code: "B007",
          name: "Maintenance Program Compliance",
          critical: false,
        },
        { code: "B008", name: "Life Limited Parts Status", critical: false },
        { code: "B009", name: "Structural Repairs Listing", critical: false },
        { code: "B010", name: "Corrosion Prevention Status", critical: false },
        { code: "B011", name: "Fuel Tank Safety Status", critical: false },
        { code: "B012", name: "EWIS Status", critical: false },
        { code: "B013", name: "CPCP/Aging Aircraft Status", critical: false },
        { code: "B014", name: "Out of Phase Items", critical: false },
        { code: "B015", name: "Deferred Defects (MEL/CDL)", critical: false },
        {
          code: "B016",
          name: "Incident/Accident Clearance Statement",
          critical: true,
        },
        { code: "B017", name: "Overhaul Status", critical: false },
        { code: "B018", name: "Component Removal History", critical: false },
        { code: "B019", name: "Reliability Data", critical: false },
        {
          code: "B020",
          name: "Operator Specific Modifications",
          critical: false,
        },
        { code: "B021", name: "Weight and Balance Report", critical: false },
        {
          code: "B022",
          name: "Interior Configuration Details",
          critical: false,
        },
        {
          code: "B023",
          name: "Compliance Summary Certificate",
          critical: false,
        },
      ],
    },
    C: {
      code: "C",
      name: "Maintenance Records",
      fullName: "Back-to-Birth Maintenance Records",
      description: "Technical logs, checks, and task cards",
      requiredFor: ["aircraft"],
      documents: [
        {
          code: "C001",
          name: "Technical Logs (últimos 3 años)",
          critical: false,
        },
        {
          code: "C002",
          name: "A-Checks (último ciclo completo)",
          critical: false,
        },
        {
          code: "C003",
          name: "C-Checks (último ciclo completo)",
          critical: false,
        },
        {
          code: "C004",
          name: "Major Structural Check Packages",
          critical: false,
        },
        {
          code: "C005",
          name: "CPCP/ISIP Maintenance Task Cards",
          critical: false,
        },
        {
          code: "C006",
          name: "Airworthiness Directives Files",
          critical: false,
        },
        { code: "C007", name: "Service Bulletins Files", critical: false },
        { code: "C008", name: "Repairs Documentation", critical: false },
        { code: "C009", name: "Modifications Documentation", critical: false },
        { code: "C010", name: "EO/STC Paperwork", critical: false },
        { code: "C011", name: "Non-Routine Task Cards", critical: false },
        { code: "C012", name: "Sampling Program Records", critical: false },
        {
          code: "C013",
          name: "Component Removal/Installation Records",
          critical: false,
        },
        { code: "C014", name: "Certification Authorization", critical: false },
      ],
    },
    D: {
      code: "D",
      name: "Configuration Status",
      fullName: "Configuration Status",
      description: "LOPA, galley diagrams, emergency equipment",
      requiredFor: ["aircraft"],
      documents: [
        {
          code: "D001",
          name: "LOPA (Layout of Passenger Accommodation)",
          critical: false,
        },
        { code: "D002", name: "Galley Drawings", critical: false },
        { code: "D003", name: "Emergency Equipment Layout", critical: false },
        { code: "D004", name: "Avionics Units Inventory", critical: false },
        { code: "D005", name: "Electrical Load Analysis", critical: false },
        { code: "D006", name: "MEL/CDL Summary", critical: false },
      ],
    },
    E: {
      code: "E",
      name: "Manufacturer Records",
      fullName: "Aircraft Manufacturer Records",
      description: "Original OEM manufacturing documents",
      requiredFor: ["aircraft"],
      documents: [
        { code: "E001", name: "Delivery Documentation Set", critical: false },
        { code: "E002", name: "Original Export Certificate", critical: false },
        { code: "E003", name: "Original CofA", critical: false },
        { code: "E004", name: "Aircraft Flight Test Report", critical: false },
        { code: "E005", name: "Component Fitted at Delivery", critical: false },
        {
          code: "E006",
          name: "Modification Status at Delivery",
          critical: false,
        },
        {
          code: "E007",
          name: "Weight and Balance at Delivery",
          critical: false,
        },
        {
          code: "E008",
          name: "Customer Acceptance Certificate",
          critical: false,
        },
        { code: "E009", name: "Repair/Alteration Reports", critical: false },
        { code: "E010", name: "FAA Form 337 (if applicable)", critical: false },
        {
          code: "E011",
          name: "EASA Form 123 (if applicable)",
          critical: false,
        },
        { code: "E012", name: "Manufacturer Service Letters", critical: false },
        { code: "E013", name: "Type Certificate Data Sheet", critical: false },
        { code: "E014", name: "Aircraft Specification", critical: false },
        { code: "E015", name: "Wiring Diagram Manual (WDM)", critical: false },
        {
          code: "E016",
          name: "Structural Repair Manual (SRM)",
          critical: false,
        },
        {
          code: "E017",
          name: "Illustrated Parts Catalog (IPC)",
          critical: false,
        },
        {
          code: "E018",
          name: "Aircraft Maintenance Manual (AMM)",
          critical: false,
        },
        {
          code: "E019",
          name: "Component Maintenance Manual (CMM)",
          critical: false,
        },
        { code: "E020", name: "Service Bulletins Index", critical: false },
      ],
    },
    F: {
      code: "F",
      name: "Engine Records",
      fullName: "Engine Records",
      description: "Complete documentation for each installed engine",
      requiredFor: ["aircraft", "engine"],
      perEngine: true, // Repeats for each engine
      documents: [
        {
          code: "F001",
          name: "Manufacturer Delivery Documents (EDS, Logbook)",
          critical: false,
        },
        {
          code: "F002",
          name: "Export Certificate at Manufacture",
          critical: false,
        },
        {
          code: "F003",
          name: "Total Time in Service Statement",
          critical: false,
        },
        {
          code: "F004",
          name: "Engine Cycles Since New (CSN)",
          critical: false,
        },
        {
          code: "F005",
          name: "Engine Airworthiness Directives Status",
          critical: false,
        },
        {
          code: "F006",
          name: "Service Bulletins Incorporated",
          critical: false,
        },
        {
          code: "F007",
          name: "Life Limited Parts (LLP) Listing",
          critical: true,
        },
        {
          code: "F008",
          name: "Back-to-Birth LLP Substantiation",
          critical: true,
        },
        { code: "F009", name: "Modifications/STCs Listing", critical: false },
        { code: "F010", name: "Repair History", critical: false },
        {
          code: "F011",
          name: "Shop Visit Reports (All Historical)",
          critical: false,
        },
        { code: "F012", name: "Last Shop Visit Workscope", critical: false },
        { code: "F013", name: "Test Cell Run Report", critical: false },
        { code: "F014", name: "Current Preservation Status", critical: false },
        { code: "F015", name: "QEC Configuration", critical: false },
        { code: "F016", name: "Thrust Reverser Records", critical: false },
        { code: "F017", name: "Engine Build Record", critical: false },
        { code: "F018", name: "Borescope Inspection Reports", critical: false },
        { code: "F019", name: "Trend Monitoring Data", critical: false },
        { code: "F020", name: "EGT Margin Report", critical: false },
        { code: "F021", name: "Oil Analysis Records", critical: false },
        { code: "F022", name: "Engine Logbook Extract", critical: false },
      ],
    },
    G: {
      code: "G",
      name: "APU",
      fullName: "Auxiliary Power Unit Records",
      description: "APU records (if applicable)",
      requiredFor: ["aircraft"],
      documents: [
        { code: "G001", name: "APU Delivery Documents", critical: false },
        { code: "G002", name: "APU Total Time/Cycles", critical: false },
        { code: "G003", name: "APU AD Status", critical: false },
        { code: "G004", name: "APU SB Status", critical: false },
        { code: "G005", name: "APU LLP Status", critical: false },
        { code: "G006", name: "APU Shop Visit History", critical: false },
        { code: "G007", name: "APU Current Condition", critical: false },
        { code: "G008", name: "APU Logbook", critical: false },
      ],
    },
    H: {
      code: "H",
      name: "Components",
      fullName: "Component Records",
      description: "Traceable component records",
      requiredFor: ["aircraft"],
      documents: [
        {
          code: "H001",
          name: "Serialized Component Inventory",
          critical: false,
        },
        {
          code: "H002",
          name: "Component Back-to-Birth Records",
          critical: false,
        },
      ],
    },
    I: {
      code: "I",
      name: "Landing Gear",
      fullName: "Landing Gear Records",
      description: "Documentation for each landing gear",
      requiredFor: ["aircraft"],
      documents: [
        {
          code: "I001",
          name: "Landing Gear Delivery Documents",
          critical: false,
        },
        { code: "I002", name: "LG Total Cycles/Landings", critical: false },
        { code: "I003", name: "LG Overhaul History", critical: false },
        { code: "I004", name: "LG AD/SB Status", critical: false },
        { code: "I005", name: "LG Life Limited Parts Status", critical: false },
      ],
    },
    J: {
      code: "J",
      name: "Manuals",
      fullName: "Manuals and Publications",
      description: "Technical and operation manuals",
      requiredFor: ["aircraft"],
      documents: [
        { code: "J001", name: "Aircraft Flight Manual (AFM)", critical: false },
        {
          code: "J002",
          name: "Aircraft Maintenance Manual (AMM)",
          critical: false,
        },
        {
          code: "J003",
          name: "Illustrated Parts Catalog (IPC)",
          critical: false,
        },
        { code: "J004", name: "Wiring Diagram Manual (WDM)", critical: false },
        {
          code: "J005",
          name: "Structural Repair Manual (SRM)",
          critical: false,
        },
        {
          code: "J006",
          name: "Component Maintenance Manual (CMM)",
          critical: false,
        },
        {
          code: "J007",
          name: "Engine Maintenance Manual (EMM)",
          critical: false,
        },
        { code: "J008", name: "Fault Isolation Manual (FIM)", critical: false },
        { code: "J009", name: "Troubleshooting Manual (TSM)", critical: false },
        {
          code: "J010",
          name: "Master Minimum Equipment List (MMEL)",
          critical: false,
        },
        {
          code: "J011",
          name: "Configuration Deviation List (CDL)",
          critical: false,
        },
        { code: "J012", name: "Weight and Balance Manual", critical: false },
        {
          code: "J013",
          name: "Non-Destructive Testing Manual",
          critical: false,
        },
        {
          code: "J014",
          name: "Corrosion Prevention Manual (CPCP)",
          critical: false,
        },
        { code: "J015", name: "Service Bulletin Index", critical: false },
        { code: "J016", name: "AD Index", critical: false },
        {
          code: "J017",
          name: "Maintenance Planning Document (MPD)",
          critical: false,
        },
        { code: "J018", name: "Tool and Equipment Manual", critical: false },
        { code: "J019", name: "Consumable Materials List", critical: false },
      ],
    },
    K: {
      code: "K",
      name: "Propellers",
      fullName: "Propeller Records",
      description: "Propeller records (if turboprop)",
      requiredFor: ["aircraft"],
      applicableTo: ["turboprop"],
      documents: [
        { code: "K001", name: "Propeller Delivery Documents", critical: false },
        { code: "K002", name: "Propeller Total Time/Cycles", critical: false },
        { code: "K003", name: "Propeller AD Status", critical: false },
        { code: "K004", name: "Propeller SB Status", critical: false },
        { code: "K005", name: "Propeller Overhaul History", critical: false },
        { code: "K006", name: "Blade Records", critical: false },
        { code: "K007", name: "Governor Records", critical: false },
        { code: "K008", name: "De-Ice System Records", critical: false },
        { code: "K009", name: "Propeller Logbook", critical: false },
      ],
    },
  },

  /**
   * Get sections applicable to a project type
   * @param {string} projectType - 'aircraft' or 'engine'
   * @returns {Object} Filtered sections
   */
  getSectionsForType(projectType) {
    const type = (projectType || "aircraft").toLowerCase();
    const result = {};

    Object.entries(this.sections).forEach(([key, section]) => {
      if (section.requiredFor.includes(type)) {
        result[key] = section;
      }
    });

    return result;
  },

  /**
   * Get all critical documents for a section
   * @param {string} sectionCode - Section code (A-K)
   * @returns {Array} Array of critical document codes
   */
  getCriticalDocuments(sectionCode) {
    const section = this.sections[sectionCode];
    if (!section) return [];

    return section.documents
      .filter((doc) => doc.critical)
      .map((doc) => doc.code);
  },

  /**
   * Check if a document code is critical
   * @param {string} docCode - Document code (e.g., 'F007')
   * @returns {boolean}
   */
  isCriticalDocument(docCode) {
    const sectionCode = docCode.charAt(0).toUpperCase();
    const section = this.sections[sectionCode];
    if (!section) return false;

    const doc = section.documents.find((d) => d.code === docCode);
    return doc ? doc.critical : false;
  },

  /**
   * Get document info by code
   * @param {string} docCode - Document code (e.g., 'A001')
   * @returns {Object|null} Document info
   */
  getDocumentInfo(docCode) {
    const sectionCode = docCode.charAt(0).toUpperCase();
    const section = this.sections[sectionCode];
    if (!section) return null;

    return section.documents.find((d) => d.code === docCode) || null;
  },

  /**
   * Get total required documents count for a section
   * @param {string} sectionCode - Section code
   * @returns {number}
   */
  getRequiredCount(sectionCode) {
    const section = this.sections[sectionCode];
    return section ? section.documents.length : 0;
  },
};
