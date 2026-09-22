export const DEFAULT_CUSTOM_RPC_URL = 'http://localhost:8899';

export function isValidRpcUrl(value: string): boolean {
    try {
        const url = new URL(value.trim());
        return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname);
    } catch {
        return false;
    }
}

export function getSafeRpcUrl(value: string): string {
    const trimmedValue = value.trim();
    return isValidRpcUrl(trimmedValue) ? trimmedValue : DEFAULT_CUSTOM_RPC_URL;
}
