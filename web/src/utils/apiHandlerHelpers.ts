import { NextApiRequest, NextApiResponse } from "next";

export function disableCaching(res: NextApiResponse) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("X-Robots-Tag", "noindex");
}

export function checkClient(req: NextApiRequest, res: NextApiResponse) {
    const referer = req.headers.referer;
    if (!referer) return res.status(403).json({ error: "Access is denied." });

    const host = new URL(referer).host.replace(/^www\./, "");
    if (host !== new URL(process.env.NEXT_PUBLIC_BASE_URL).host) {
        return res.status(403).json({ error: "Unacceptable origin." });
    }

    const apiToken = req.headers["x-api-token"];
    if (apiToken !== process.env.NEXT_PUBLIC_X_API_TOKEN) {
        return res.status(403).json({ error: "Invalid API token." });
    }
}