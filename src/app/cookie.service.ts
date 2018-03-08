import { Injectable } from '@angular/core';

@Injectable()
export class CookieService {
    /**
     * Helper method to update cookies
     * @param key
     * @param value
     * @param expiration Expiration time defined in days (default: 30), if set to 0 a session cookie is created
     */
    updateCookie(key: string, value: string | null, expiration: number = 30): void {
        let cookieDeclaration = `${key}=${value}; path=/; secure`;

        if (expiration !== 0) {
            const date = new Date();
            date.setTime(date.getTime() + (expiration * 24 * 60 * 60 * 1000));
            cookieDeclaration += `; expires=${date.toUTCString()}`;
        }

        document.cookie = cookieDeclaration;
    }

    /**
     * @param key the desired key to be found
     * @returns value of the desired key, or null if not found
     */
    readCookie(key: string): string {
        const cookies = document.cookie.split('; ');
        let value = '';

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].split('=');
            if (cookie[0] === key) {
                value = cookie[1];
                break;
            }
        }

        return value;
    }
}
