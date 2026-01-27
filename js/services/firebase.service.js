/**
 * Firebase Service
 * Handles Firebase initialization and Firestore operations
 * 
 * Angular equivalent: @Injectable() FirebaseService
 */
class FirebaseService {
    constructor() {
        this.app = null;
        this.db = null;
        this.initialized = false;
        
        // Firebase configuration
        this.config = {
            apiKey: "AIzaSyA3MClHsDA-jRionSTfV1xn3FJ7S4OuMvY",
            authDomain: "avia-3346f.firebaseapp.com",
            projectId: "avia-3346f",
            storageBucket: "avia-3346f.firebasestorage.app",
            messagingSenderId: "241933341388",
            appId: "1:241933341388:web:d95f9d120a02bbf7efa869",
            measurementId: "G-PY2XK9X94G"
        };
    }

    /**
     * Initialize Firebase
     * Must be called after Firebase SDK is loaded
     */
    initialize() {
        if (this.initialized) return;
        
        try {
            // Check if Firebase is loaded
            if (typeof firebase === 'undefined') {
                console.error('Firebase SDK not loaded');
                return false;
            }

            // Initialize Firebase app
            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(this.config);
            } else {
                this.app = firebase.apps[0];
            }

            // Get Firestore instance
            this.db = firebase.firestore();
            this.initialized = true;
            
            console.log('Firebase initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            return false;
        }
    }

    /**
     * Get Firestore instance
     */
    getFirestore() {
        if (!this.initialized) {
            this.initialize();
        }
        return this.db;
    }

    /**
     * Get a collection reference
     */
    collection(collectionName) {
        return this.getFirestore().collection(collectionName);
    }

    /**
     * Get a document reference
     */
    doc(collectionName, docId) {
        return this.getFirestore().collection(collectionName).doc(docId);
    }

    /**
     * Check if Firebase is initialized
     */
    isInitialized() {
        return this.initialized;
    }
}

// Create singleton instance
window.firebaseService = new FirebaseService();
