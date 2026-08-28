export interface AppError {
    code: string;
    params?: Record<string, unknown>;
    details?: string;   // English diagnostic — console/telemetry ONLY, never rendered
    timestamp: string;
    context?: Record<string, any>;
}

export class ErrorHandler {
    private static logError(error: AppError): void {
        if (process.env.NODE_ENV === 'development') {
            console.error('Application Error:', error);
        }

        if (process.env.NODE_ENV === 'production') {
            // TODO: Implement production logging
            console.error('Production Error:', error);
        }
    }

    static createError(
        code: string,
        params?: Record<string, unknown>,
        details?: string,
        context?: Record<string, any>
    ): AppError {
        const error: AppError = {
            code,
            params,
            details,
            timestamp: new Date().toISOString(),
            context
        };

        this.logError(error);
        return error;
    }

    static handleApiError(error: any, context?: string): AppError {
        let code = 'UNKNOWN_ERROR';
        let params: Record<string, unknown> | undefined;
        const details = error?.message || 'No additional details available';

        if (error?.response?.status) {
            code = `HTTP_${error.response.status}`;
            params = { status: error.response.status };
        } else if (error?.code) {
            code = error.code;
        }

        return this.createError(code, params, details, {
            originalError: error,
            context
        });
    }

    static handleSolanaError(error: any, operation?: string): AppError {
        let code = 'SOLANA_ERROR';
        const details = error?.message || 'No additional details available';

        if (error?.message?.includes('User rejected')) {
            code = 'USER_REJECTED';
        } else if (error?.message?.includes('Insufficient funds')) {
            code = 'INSUFFICIENT_FUNDS';
        } else if (error?.message?.includes('Account not found')) {
            code = 'ACCOUNT_NOT_FOUND';
        } else if (error?.message?.includes('Invalid account')) {
            code = 'INVALID_ACCOUNT';
        }

        return this.createError(code, undefined, details, {
            operation,
            originalError: error
        });
    }

    static handleValidationError(field: string, value: any, rule: string): AppError {
        return this.createError(
            'VALIDATION_ERROR',
            { field, rule },
            `Value "${value}" does not meet requirement: ${rule}`,
            { field, value, rule }
        );
    }

    static handleEncryptionError(error: any, operation: 'encrypt' | 'decrypt'): AppError {
        return this.createError(
            'ENCRYPTION_ERROR',
            { operation },
            error?.message || 'Encryption/decryption operation failed',
            { operation, originalError: error }
        );
    }
}

export enum ErrorCodes {
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',

    SOLANA_ERROR = 'SOLANA_ERROR',
    USER_REJECTED = 'USER_REJECTED',
    INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
    ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
    INVALID_ACCOUNT = 'INVALID_ACCOUNT',

    HTTP_400 = 'HTTP_400',
    HTTP_401 = 'HTTP_401',
    HTTP_403 = 'HTTP_403',
    HTTP_404 = 'HTTP_404',
    HTTP_429 = 'HTTP_429',
    HTTP_500 = 'HTTP_500',

    ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',

    WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
    WALLET_CONNECTION_FAILED = 'WALLET_CONNECTION_FAILED',
    PROGRAM_NOT_INITIALIZED = 'PROGRAM_NOT_INITIALIZED',
}

export function isRetryableError(error: AppError): boolean {
    const retryableCodes = [
        ErrorCodes.NETWORK_ERROR,
        ErrorCodes.HTTP_500,
        ErrorCodes.SOLANA_ERROR
    ];

    return retryableCodes.includes(error.code as ErrorCodes);
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'timestamp' in error
    );
}

