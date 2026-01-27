/**
 * Storage Service
 * Handles all localStorage operations
 * 
 * Angular equivalent: @Injectable() StorageService
 */
class StorageService {
    constructor(prefix = 'aerodocs') {
        this.prefix = prefix;
    }

    /**
     * Get the storage key with prefix
     */
    getKey(key) {
        return `${this.prefix}_${key}`;
    }

    /**
     * Get item from localStorage
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.getKey(key));
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error(`Error reading from localStorage [${key}]:`, e);
            return defaultValue;
        }
    }

    /**
     * Set item in localStorage
     */
    set(key, value) {
        try {
            localStorage.setItem(this.getKey(key), JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`Error writing to localStorage [${key}]:`, e);
            return false;
        }
    }

    /**
     * Remove item from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(this.getKey(key));
            return true;
        } catch (e) {
            console.error(`Error removing from localStorage [${key}]:`, e);
            return false;
        }
    }

    /**
     * Clear all items with this prefix
     */
    clear() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
}

// Export for use in other modules
window.StorageService = StorageService;
