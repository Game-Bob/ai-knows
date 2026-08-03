import { createSign } from 'node:crypto';

export interface GscCredentials {
    clientEmail: string;
    privateKey: string;
}

export class GscAuthService {
    private credentials: GscCredentials;

    constructor(credentials: GscCredentials) {
        this.credentials = credentials;
    }

    async getAccessToken(): Promise<string> {
        if (!this.credentials.clientEmail || !this.credentials.privateKey) {
            return '';
        }
        const jwt = this.generateJwt();
        return this.fetchToken(jwt);
    }

    private generateJwt(): string {
        const now = Math.floor(Date.now() / 1000);
        const header = { alg: 'RS256', typ: 'JWT' };
        const payload = {
            iss: this.credentials.clientEmail,
            scope: 'https://www.googleapis.com/auth/webmasters.readonly',
            aud: 'https://oauth2.googleapis.com/token',
            exp: now + 3600,
            iat: now
        };

        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
        const signatureInput = `${encodedHeader}.${encodedPayload}`;

        const signer = createSign('RSA-SHA256');
        signer.update(signatureInput);
        const privateKey = this.credentials.privateKey.replace(/\\n/g, '\n');
        const signature = signer.sign(privateKey, 'base64url');

        return `${signatureInput}.${signature}`;
    }

    private async fetchToken(jwt: string): Promise<string> {
        const body = new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        });

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString()
        });

        if (!response.ok) {
            return '';
        }

        const data = (await response.json()) as { access_token?: string };
        return data.access_token ?? '';
    }

    private base64UrlEncode(str: string): string {
        return Buffer.from(str)
            .toString('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }
}
