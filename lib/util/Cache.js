"use strict"

/**
 * Simple cache implementation for storing key-value pairs
 * @class Cache
 */
class Cache {

    /**
     * Create a new Cache instance
     * @param {Object} [cache={}] - Initial cache object
     */
    constructor(cache) {
        this.cache = cache || {};
    }

    /**
     * Set a value in the cache
     * @param {string} key - Cache key
     * @param {*} value - Value to store
     */
    set(key, value) {
        this.cache[key] = value;
    }

    /**
     * Get a value from the cache
     * @param {string} key - Cache key
     * @returns {*} The cached value or undefined if not found
     */
    get(key) {
        return this.cache[key];
    }
}

export default Cache;