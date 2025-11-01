export interface AppError {
    code: string;
    message: string;
    details?: string;
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
        message: string, 
        details?: string, 
        context?: Record<string, any>
    ): AppError {
        const error: AppError = {
            code,
            message,
            details,
            timestamp: new Date().toISOString(),
            context
        };
        
        this.logError(error);
        return error;
    }

    static handleApiError(error: any, context?: string): AppError {
        let code = 'UNKNOWN_ERROR';
        let message = 'An unexpected error occurred';
        let details = error?.message || 'No additional details available';

        if (error?.response?.status) {
            code = `HTTP_${error.response.status}`;
            message = `Request failed with status ${error.response.status}`;
        } else if (error?.code) {
            code = error.code;
            message = error.message || message;
        } else if (error?.message) {
            message = error.message;
        }

        return this.createError(code, message, details, { 
            originalError: error,
            context 
        });
    }

    static handleSolanaError(error: any, operation?: string): AppError {
        let code = 'SOLANA_ERROR';
        let message = 'Solana operation failed';
        let details = error?.message || 'No additional details available';

        if (error?.message?.includes('User rejected')) {
            code = 'USER_REJECTED';
            message = 'Transaction was rejected by user';
        } else if (error?.message?.includes('Insufficient funds')) {
            code = 'INSUFFICIENT_FUNDS';
            message = 'Insufficient funds for transaction';
        } else if (error?.message?.includes('Account not found')) {
            code = 'ACCOUNT_NOT_FOUND';
            message = 'Account not found';
        } else if (error?.message?.includes('Invalid account')) {
            code = 'INVALID_ACCOUNT';
            message = 'Invalid account provided';
        }

        return this.createError(code, message, details, { 
            operation,
            originalError: error 
        });
    }

    static handleValidationError(field: string, value: any, rule: string): AppError {
        return this.createError(
            'VALIDATION_ERROR',
            `Validation failed for ${field}`,
            `Value "${value}" does not meet requirement: ${rule}`,
            { field, value, rule }
        );
    }

    static handleEncryptionError(error: any, operation: 'encrypt' | 'decrypt'): AppError {
        return this.createError(
            'ENCRYPTION_ERROR',
            `Failed to ${operation} data`,
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

export function getUserFriendlyMessage(error: AppError): string {
    const friendlyMessages: Record<string, string> = {
        [ErrorCodes.USER_REJECTED]: 'Transaction was cancelled. Please try again.',
        [ErrorCodes.INSUFFICIENT_FUNDS]: 'You don\'t have enough SOL to complete this transaction.',
        [ErrorCodes.ACCOUNT_NOT_FOUND]: 'The account you\'re trying to use doesn\'t exist.',
        [ErrorCodes.WALLET_NOT_CONNECTED]: 'Please connect your wallet to continue.',
        [ErrorCodes.HTTP_429]: 'Too many requests. Please wait a moment and try again.',
        [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again.',
        [ErrorCodes.ENCRYPTION_ERROR]: 'Failed to process secure data. Please try again.',
        [ErrorCodes.PROGRAM_NOT_INITIALIZED]: 'Program instance is not initialized. Please reconnect your wallet.',
    };
    
    return friendlyMessages[error.code] || error.message;
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error &&
        'timestamp' in error
    );
}

/**
 * Type guard to check if an error is an Error object
 */
export function isError(error: unknown): error is Error {
    return error instanceof Error;
}

/**
 * Safely access error properties
 */
export function getErrorMessage(error: unknown): string {
    if (isAppError(error)) {
        return error.message;
    }
    if (isError(error)) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
}
