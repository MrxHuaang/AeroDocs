/**
 * Projects Service
 * Handles project CRUD operations with Firebase Firestore
 * 
 * Angular equivalent: @Injectable() ProjectsService
 */
class ProjectsService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
        this.collectionName = 'proyectos';
        this.projects = [];
        this.loading = false;
        
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
        const data = doc.data ? doc.data() : doc;
        const docId = doc.id || '';
        
        // Extract type and serial from document ID (e.g., "577178_aircraft")
        let type = 'aircraft';
        let serialNumber = docId;
        
        if (docId.includes('_')) {
            const parts = docId.split('_');
            serialNumber = parts[0];
            type = parts[1]?.toLowerCase() || 'aircraft';
        }
        
        // Generate a readable name
        const typeLabel = type === 'aircraft' ? 'Aircraft MSN' : 'Engine ESN';
        const name = data.name || `${typeLabel} ${serialNumber}`;
        
        return {
            id: docId,
            name: name,
            type: type,
            serialNumber: serialNumber,
            status: data.status || 'PROCESSING',
            tags: data.tags || [],
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            lastUpdated: data.lastUpdated || 'Unknown',
            objectName: data.objectName || null,
            // Additional metadata
            docsCount: data.docsCount || 0
        };
    }

    /**
     * Load all projects from Firestore
     */
    async loadProjects() {
        this.setLoading(true);
        
        try {
            const db = this.firebaseService.getFirestore();
            if (!db) {
                throw new Error('Firestore not initialized');
            }

            const snapshot = await db.collection(this.collectionName).get();
            
            this.projects = [];
            snapshot.forEach(doc => {
                const project = this.parseProject(doc);
                this.projects.push(project);
            });

            // Sort by createdAt descending (newest first)
            this.projects.sort((a, b) => b.createdAt - a.createdAt);

            console.log(`Loaded ${this.projects.length} projects from Firestore`);
            
            this.setLoading(false);
            
            if (this.onProjectsLoaded) {
                this.onProjectsLoaded(this.projects);
            }

            return this.projects;

        } catch (error) {
            console.error('Error loading projects:', error);
            this.setLoading(false);
            
            if (this.onError) {
                this.onError('Error loading projects from database');
            }
            
            return [];
        }
    }

    /**
     * Get a single project by ID
     */
    async getProject(projectId) {
        try {
            const db = this.firebaseService.getFirestore();
            const doc = await db.collection(this.collectionName).doc(projectId).get();
            
            if (doc.exists) {
                return this.parseProject(doc);
            }
            
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
            
            const projectDoc = {
                name: projectData.name,
                type: projectData.type,
                serialNumber: projectData.serialNumber,
                status: 'PROCESSING',
                tags: projectData.tags || [],
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
                p.serialNumber.includes(query)
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
