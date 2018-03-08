import { Injectable } from '@angular/core';

import { CookieService } from './cookie.service';
import { WindowRef } from './window-reference';

@Injectable()
export class LocalStorageService {
    private window: any;
    private isSupported: boolean;

    constructor(
        private cookieService: CookieService,
        private windowRef: WindowRef,
    ) {
        this.window = windowRef.nativeWindow;
        this.discoverSupport();
    }

    setItem<T>(key: string, item: T): void {
        const serializedValue = JSON.stringify(item);
        if (this.isSupported) {
            this.window.localStorage.setItem(key, serializedValue);
        } else {
            this.cookieService.updateCookie(key, serializedValue);
        }
    }

    removeItem(key: string): void {
        if (this.isSupported) {
            this.window.localStorage.removeItem(key);
        } else {
            this.cookieService.updateCookie(key, null, -1);
        }
    }

    getItem<T>(key: string): T | null {
        let value: string;
        if (this.isSupported) {
            value = this.window.localStorage.getItem(key);
        } else {
            value = this.cookieService.readCookie(key);
        }

        return value ? JSON.parse(value) as T : null;
    }

    private discoverSupport(): void {
        /* Primarily because of iOS private browsing mode, where localStorage
        * exists but throws QuotaExceeded errors if you were to put something
        * into localStorage
        * Capability test from (modernizer) https://gist.github.com/paulirish/5558557
        */
        const capabilityDummy = 'web-storage_capability-test-key';

        try {
            localStorage.setItem(capabilityDummy, capabilityDummy);
            localStorage.removeItem(capabilityDummy);
            this.isSupported = true;
        } catch (e) {
            this.isSupported = false;
        }
    }
}
