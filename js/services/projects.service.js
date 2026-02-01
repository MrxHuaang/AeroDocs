/**
 * Projects Service
 * Handles project CRUD operations with Firebase Firestore
 * 
 * Angular equivalent: @Injectable() ProjectsService
 */
class ProjectsService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
        this.collectionName = 'proyectos_lista';
        this.projects = [];
        this.loading = false;
        this.unsubscribeProjects = null;
        this.realtimeActive = false;
        this._hasReceivedFirstSnapshot = false;
        
        // Callbacks for UI updates
        this.onProjectsLoaded = null;
        this.onError = null;
        this.onLoadingChange = null;
    }

    /**
     * Set loading state and notify
     */
    setLoading(loading) {
        this.loading = loading;
        if (this.onLoadingChange) {
            this.onLoadingChange(loading);
        }
    }

    /**
     * Parse Firestore document to project object
     */
    parseProject(doc) {
        //console.log('serie', doc.data().serie);
        //console.log('type', doc.data().type);
        const data = doc.data();
        const docId = doc.id || '';
        
        // Use type and serie directly from Firestore (schema: type, serie)
        // Fallback to extracting from document ID if not present
        let type = data.type;
        // Firestore uses 'serie' field, not 'serialNumber'
        // Convert to string and handle null/undefined
        let serialNumber = data.serie || '';
        
        // If not in Firestore or empty, try to extract from document ID (e.g., "577178_aircraft")
        if (!serialNumber) {
            console.log('no serial number');
            if (docId.includes('_')) {
                const parts = docId.split('_');
                serialNumber = parts[0] || docId;
                if (!type || (typeof type === 'string')) {
                    type = parts[1] || '';
                }
            } else {
                // Last resort: use docId as serialNumber
                serialNumber = docId;
            }
        }
        
        const name = data.name;

        // Prefer new schema field `estado` (processing/completed/failed/...)
        // Keep a legacy-friendly `status` (PROCESSING/COMPLETED/FAILED/...) for older UI code.
        let estado = data.estado || null;
        if (!estado && data.status) {
            const legacy = String(data.status).toUpperCase().trim();
            if (legacy === 'PROCESSING') estado = 'processing';
            else if (legacy === 'COMPLETED') estado = 'completed';
            else if (legacy === 'FAILED') estado = 'failed';
            else if (legacy === 'PENDING_REVIEW') estado = 'pending_review';
        }
        const estadoLower = String(estado || 'processing').toLowerCase().trim();
        let status = data.status || null;
        if (!status) {
            if (estadoLower === 'processing') status = 'PROCESSING';
            else if (estadoLower === 'completed' || estadoLower === 'completado') status = 'COMPLETED';
            else if (estadoLower === 'failed') status = 'FAILED';
            else if (estadoLower === 'pending_review' || estadoLower === 'pending review') status = 'PENDING_REVIEW';
            else status = 'PROCESSING';
        }
        
        // Handle tags: Firestore stores as string "tag1, tag2, tag3" or array
        let tags = data.tags || [];
        if (typeof tags === 'string') {
            tags = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
        }

        // Real-time processing counters (new)
        const toNumberOrNull = (v) => {
            if (v === null || v === undefined) return null;
            if (typeof v === 'number') return Number.isFinite(v) ? v : null;
            const parsed = parseInt(String(v), 10);
            return Number.isFinite(parsed) ? parsed : null;
        };
        const procesados = toNumberOrNull(data.procesados);
        const totalEsperados = toNumberOrNull(data.total_esperados);
        
        return {
            id: docId,
            name: name,
            type: type,
            serialNumber: serialNumber,
            status: status,
            estado: estado,
            tags: tags,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            lastUpdated: data.lastUpdated || 'Unknown',
            objectName: data.objectName || null,
            // Additional metadata
            docs: data.docs || null,
            docsCount: data.docsCount || 0,
            procesados: procesados ?? 0,
            totalEsperados: totalEsperados
        };
    }

    /**
     * Start real-time subscription to proyectos_lista
     * Keeps this.projects updated and triggers onProjectsLoaded on every change.
     */
    startRealtimeProjects() {
        if (this.realtimeActive && this.unsubscribeProjects) return;

        try {
            const db = this.firebaseService.getFirestore();
            if (!db) {
                console.warn('Firestore not initialized');
                if (this.onError) this.onError('Firebase no está disponible. Verifica tu conexión a internet.');
                return;
            }

            this.realtimeActive = true;
            this._hasReceivedFirstSnapshot = false;
            this.setLoading(true);

            console.log('[Projects] Starting realtime subscription...');
            this.unsubscribeProjects = db.collection(this.collectionName).onSnapshot(
                (snapshot) => {
                    this.projects = [];
                    snapshot.forEach((doc) => {
                        const project = this.parseProject(doc);
                        this.projects.push(project);
                    });

                    // Sort by createdAt descending (newest first)
                    this.projects.sort((a, b) => b.createdAt - a.createdAt);

                    if (!this._hasReceivedFirstSnapshot) {
                        this._hasReceivedFirstSnapshot = true;
                        this.setLoading(false);
                        console.log(`[Projects] Realtime initial load: ${this.projects.length} projects`);
                    }

                    if (this.onProjectsLoaded) {
                        this.onProjectsLoaded(this.projects);
                    }
                },
                (error) => {
                    console.error('Error in realtime subscription:', error);
                    this.setLoading(false);
                    if (this.onError) this.onError('Error al escuchar cambios en proyectos. Verifica tu conexión.');
                }
            );
        } catch (error) {
            console.error('Error starting realtime subscription:', error);
            this.setLoading(false);
            if (this.onError) this.onError('Error al iniciar tiempo real. Verifica tu conexión.');
        }
    }

    /**
     * Stop real-time subscription (optional cleanup).
     */
    stopRealtimeProjects() {
        try {
            if (this.unsubscribeProjects) this.unsubscribeProjects();
        } finally {
            this.unsubscribeProjects = null;
            this.realtimeActive = false;
            this._hasReceivedFirstSnapshot = false;
        }
    }

    /**
     * Load all projects from Firestore with timeout and fallback
     */
    async loadProjects() {
        this.setLoading(true);
        
        try {
            const db = this.firebaseService.getFirestore();
            if (!db) {
                console.warn('Firestore not initialized');
                this.setLoading(false);
                if (this.onError) {
                    this.onError('Firebase no está disponible. Verifica tu conexión a internet.');
                }
                return [];
            }

            // Create a timeout promise (15 seconds - increased for slow connections)
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Firebase timeout')), 15000);
            });

            console.log('[Projects] Loading projects from Firebase...');

            // Race between Firebase query and timeout
            const snapshot = await Promise.race([
                db.collection(this.collectionName).get(),
                timeoutPromise
            ]);
            
            this.projects = [];
            snapshot.forEach(doc => {
                const project = this.parseProject(doc);
                this.projects.push(project);
            });

            // Sort by createdAt descending (newest first)
            this.projects.sort((a, b) => b.createdAt - a.createdAt);

            console.log(`[Projects] Loaded ${this.projects.length} projects from Firestore`);
            
            this.setLoading(false);
            
            if (this.onProjectsLoaded) {
                this.onProjectsLoaded(this.projects);
            }

            return this.projects;

        } catch (error) {
            console.error('Error loading projects:', error);
            this.setLoading(false);
            
            // Show a user-friendly error message
            if (this.onError) {
                if (error.message === 'Firebase timeout') {
                    this.onError('Firebase tardó demasiado en responder. Verifica tu conexión a internet.');
                } else {
                    this.onError('Error al cargar proyectos. Verifica tu conexión.');
                }
            }
            
            return [];
        }
    }

    /**
     * Get a single project by ID with timeout
     */
    async getProject(projectId) {
        try {
            const db = this.firebaseService.getFirestore();
            if (!db) {
                console.warn('Firestore not initialized');
                return null;
            }

            // Create a timeout promise (15 seconds - consistent with loadProjects)
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Firebase timeout')), 15000);
            });

            console.log('[Projects] Loading project from Firebase:', projectId);

            // Race between Firebase query and timeout
            const doc = await Promise.race([
                db.collection(this.collectionName).doc(projectId).get(),
                timeoutPromise
            ]);
            
            if (doc.exists) {
                console.log('[Projects] Found project in Firebase');
                const parsedProject = this.parseProject(doc);
                console.log('[Projects] Parsed project data:', { 
                    id: parsedProject.id, 
                    type: parsedProject.type, 
                    serialNumber: parsedProject.serialNumber 
                });
                return parsedProject;
            }
            
            console.log('[Projects] Project not found in Firebase:', projectId);
            return null;
        } catch (error) {
            console.error('Error getting project:', error);
            return null;
        }
    }

    /**
     * Get project documents (subdocuments in 'docs' collection)
     */
    async getProjectDocs(projectId) {
        try {
            const db = this.firebaseService.getFirestore();
            const snapshot = await db
                .collection(this.collectionName)
                .doc(projectId)
                .collection('docs')
                .get();
            
            const docs = [];
            snapshot.forEach(doc => {
                docs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return docs;
        } catch (error) {
            console.error('Error getting project docs:', error);
            return [];
        }
    }

    /**
     * Create a new project
     */
    async createProject(projectData) {
        try {
            const db = this.firebaseService.getFirestore();
            
            // Generate document ID from type and serial
            const docId = `${projectData.serialNumber}_${projectData.type}`;
            
            // Convert tags array to string format for Firestore (schema: "tag1, tag2, tag3")
            let tagsValue = projectData.tags || [];
            if (Array.isArray(tagsValue)) {
                tagsValue = tagsValue.join(', ');
            }
            
            // Convert serialNumber to number if it's a valid number string
            // Firestore stores serie as number
            let serieValue = projectData.serialNumber;
            if (typeof serieValue === 'string') {
                const parsed = parseInt(serieValue, 10);
                serieValue = isNaN(parsed) ? serieValue : parsed;
            }
            
            const projectDoc = {
                name: projectData.name,
                type: projectData.type,
                serie: serieValue, // Firestore uses 'serie' field (as number)
                status: 'PROCESSING',
                tags: tagsValue, // Firestore stores tags as string
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdated: 'Just now',
                objectName: projectData.objectName || null
            };

            await db.collection(this.collectionName).doc(docId).set(projectDoc);
            
            console.log('Project created:', docId);
            return { success: true, id: docId };

        } catch (error) {
            console.error('Error creating project:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update project status
     */
    async updateProjectStatus(projectId, status) {
        try {
            const db = this.firebaseService.getFirestore();
            await db.collection(this.collectionName).doc(projectId).update({
                status: status,
                lastUpdated: 'Just now'
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error updating project:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete a project
     */
    async deleteProject(projectId) {
        try {
            const db = this.firebaseService.getFirestore();
            await db.collection(this.collectionName).doc(projectId).delete();
            
            // Remove from local cache
            this.projects = this.projects.filter(p => p.id !== projectId);
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting project:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get cached projects
     */
    getCachedProjects() {
        return this.projects;
    }

    /**
     * Filter and sort projects
     */
    filterProjects(options = {}) {
        let filtered = [...this.projects];
        
        // Search filter
        if (options.search) {
            const query = options.search.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(query) ||
                String(p.serialNumber || '').includes(query)
            );
        }
        
        // Tag filter
        if (options.tag) {
            filtered = filtered.filter(p => 
                p.tags && p.tags.includes(options.tag)
            );
        }
        
        // Favorites filter
        if (options.favorites && options.favoriteIds) {
            filtered = filtered.filter(p => 
                options.favoriteIds.includes(p.id)
            );
        }
        
        // Sort
        if (options.sort === 'oldest') {
            filtered.sort((a, b) => a.createdAt - b.createdAt);
        } else {
            filtered.sort((a, b) => b.createdAt - a.createdAt);
        }
        
        return filtered;
    }
}

// Export for use in other modules
window.ProjectsService = ProjectsService;
