import idl from "../idl/dropsome.json";

export const IDL_OBJECT = JSON.parse(JSON.stringify(idl));

/**
 * Retrieves the API token used for frontend origin verification.
 * 
 * **Security Note**: This token is intentionally PUBLIC (exposed in the browser via NEXT_PUBLIC_
 * environment variable) and should NOT be treated as a secure secret. It can be extracted from
 * the frontend by any user inspecting the application.
 * 
 * **Purpose**: This token acts as a basic barrier to reduce unwanted API calls from sources
 * other than our frontend. It follows the defense-in-depth principle: no single security measure
 * is perfect, but multiple layers of barriers collectively increase the difficulty of abuse.
 * 
 * **What it IS**: A lightweight origin verification mechanism
 * **What it is NOT**: A secure authentication secret or access control mechanism
 * 
 * @returns The API token string, or an empty string if not configured
 */
export const getApiToken = (): string => {
    const token = process.env.NEXT_PUBLIC_X_API_TOKEN;
    if (!token) {
        console.warn("NEXT_PUBLIC_X_API_TOKEN is not defined");
        return "";
    }
    return token;
};

export const getBaseUrl = (): string => {
    const url = process.env.NEXT_PUBLIC_BASE_URL;
    if (!url) {
        console.warn("NEXT_PUBLIC_BASE_URL is not defined");
        return "";
    }
    return url;
};


