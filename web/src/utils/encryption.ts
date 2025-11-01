import * as crypto from "crypto";

export const encryptMnemonic = (mnemonic: string): string => {
    const keyString = process.env.ENCRYPTION_KEY;
    if (!keyString) {
        throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    
    const key = new Uint8Array(Buffer.from(keyString, 'base64'));
    if (key.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be exactly 44 base64 characters (32 bytes) for AES-256-CBC encryption');
    }
    
    const iv = new Uint8Array(crypto.randomBytes(16));
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(mnemonic, 'utf-8', 'base64');
    encrypted += cipher.final('base64');

    const result = Buffer.from(iv).toString('hex') + ':' + encrypted;
    return Buffer.from(result).toString('base64');
};

export const decryptMnemonic = (encryptedData: string): string => {
    const keyString = process.env.ENCRYPTION_KEY;
    if (!keyString) {
        throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    
    const key = new Uint8Array(Buffer.from(keyString, 'base64'));
    if (key.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be exactly 44 base64 characters (32 bytes) for AES-256-CBC encryption');
    }

    const data = Buffer.from(encryptedData, 'base64').toString('utf-8');
    const [ivHex, encrypted] = data.split(':');
    const iv = Uint8Array.from(Buffer.from(ivHex, 'hex'));

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encrypted, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
};