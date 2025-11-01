interface RateLimitEntry {
    count: number;
    resetTime: number;
}

interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Maximum requests per window
}

class RateLimiter {
    private store: Map<string, RateLimitEntry> = new Map();
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
        this.config = config;
        // Clean up expired entries
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (entry.resetTime < now) {
                this.store.delete(key);
            }
        }
    }

    private getClientId(req: any): string {
        // Try to get IP from various headers
        const forwarded = req.headers['x-forwarded-for'];
        const realIp = req.headers['x-real-ip'];
        const cfConnectingIp = req.headers['cf-connecting-ip'];
        
        let ip = forwarded || realIp || cfConnectingIp || 'unknown';
        
        // Handle comma-separated IPs (from proxies)
        if (typeof ip === 'string' && ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }
        
        return ip;
    }

    isAllowed(req: any): { allowed: boolean; remaining: number; resetTime: number } {
        const clientId = this.getClientId(req);
        const now = Date.now();
        const windowStart = now - this.config.windowMs;

        const entry = this.store.get(clientId);
        
        if (!entry || entry.resetTime < now) {
            // Create new entry or reset expired one
            this.store.set(clientId, {
                count: 1,
                resetTime: now + this.config.windowMs
            });
            
            return {
                allowed: true,
                remaining: this.config.maxRequests - 1,
                resetTime: now + this.config.windowMs
            };
        }

        if (entry.count >= this.config.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: entry.resetTime
            };
        }

        entry.count++;
        this.store.set(clientId, entry);

        return {
            allowed: true,
            remaining: this.config.maxRequests - entry.count,
            resetTime: entry.resetTime
        };
    }
}

export const walletGenerationLimiter = new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10
});

export const passphraseLimiter = new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10
});

export const generalLimiter = new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 30
});

export function checkRateLimit(req: any, res: any, limiter: RateLimiter): boolean {
    const result = limiter.isAllowed(req);
    
    res.setHeader('X-RateLimit-Limit', limiter['config'].maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
    
    if (!result.allowed) {
        res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
        return false;
    }
    
    return true;
}
