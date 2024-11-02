import { Injectable } from '@angular/core';

@Injectable()

export class CachingSystemService {
    // Default cache duration 2 hours (in milliseconds)
    private defaultDuration = 2 * 60 * 60 * 1000;

    constructor() {
        this.clearExpiredEntries();
    }

    // Save data to cache with a key and an optional duration
    set<T>(key: string, data: T, duration: number = this.defaultDuration): void {
        this.clearExpiredEntries();
        const cacheEntry = {
            data,
            expiration: Date.now() + duration
        };
        localStorage.setItem(key, JSON.stringify(cacheEntry));
    }


    // Retreives data from cache with a key
    get<T>(key: string): T | null {
        this.clearExpiredEntries();
        const cacheEntryString = localStorage.getItem(key);
        if (cacheEntryString) {
            const cacheEntry = JSON.parse(cacheEntryString);
            return cacheEntry.data as T;
        }
        return null;
    }

    // Clean up expired cache entries upon changes
    private clearExpiredEntries(): void {
        const now = Date.now();
        Object.keys(localStorage).forEach(key => {
            const cacheEntryString = localStorage.getItem(key);
            if (cacheEntryString) {
                const cacheEntry = JSON.parse(cacheEntryString);
                if (cacheEntry.expiration && now > cacheEntry.expiration) {
                    localStorage.removeItem(key);
                }
            }
        });
    }
}
