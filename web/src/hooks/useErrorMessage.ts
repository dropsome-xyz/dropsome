import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppError } from '../utils/errorHandler';

/**
 * `AppError.code` is a stable machine identifier (SCREAMING_SNAKE) meant for
 * logs and telemetry; the catalogue keys are camelCase. The two are mapped here
 * rather than by making the code double as a translation key, so renaming a
 * catalogue entry can never change the code that gets logged.
 */
const MESSAGE_KEY_BY_CODE: Record<string, string> = {
    UNKNOWN_ERROR: 'unexpected',
    NETWORK_ERROR: 'networkError',
    VALIDATION_ERROR: 'validation',
    SOLANA_ERROR: 'solanaError',
    USER_REJECTED: 'userRejected',
    INSUFFICIENT_FUNDS: 'insufficientFunds',
    ACCOUNT_NOT_FOUND: 'accountNotFound',
    INVALID_ACCOUNT: 'invalidAccount',
    HTTP_400: 'http400',
    HTTP_401: 'http401',
    HTTP_403: 'http403',
    HTTP_404: 'http404',
    HTTP_429: 'tooManyRequests',
    HTTP_500: 'http500',
    ENCRYPTION_ERROR: 'encryption',
    WALLET_NOT_CONNECTED: 'walletNotConnected',
    WALLET_CONNECTION_FAILED: 'walletConnectionFailed',
    PROGRAM_NOT_INITIALIZED: 'programNotInitialized',
};

/**
 * Resolves an AppError's code to a localized message in the active language.
 *
 * Unknown codes fall back to `errors.unexpected`, which is also the
 * `defaultValue` safety net, so a missing catalogue entry renders the generic
 * localized string instead of a raw key. The returned function is
 * reference-stable so it can go in useCallback dependency arrays.
 */
export function useErrorMessage() {
    const { t } = useTranslation('errors');
    return useCallback(
        (error: AppError) =>
            t(MESSAGE_KEY_BY_CODE[error.code] ?? 'unexpected', {
                defaultValue: t('unexpected'),
                ...(error.params ?? {}),
            }),
        [t]
    );
}
