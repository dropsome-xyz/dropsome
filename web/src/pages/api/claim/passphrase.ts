import type { NextApiRequest, NextApiResponse } from "next"
import { checkClient, disableCaching } from "utils/apiHandlerHelpers";
import { decryptMnemonic } from "utils/encryption";
import { checkRateLimit, passphraseLimiter } from "utils/rateLimiter";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    disableCaching(res);

    if (!checkRateLimit(req, res, passphraseLimiter)) {
        return;
    }

    checkClient(req, res);

    if (req.method === "POST") {
        const encryptedMnemonic: string = req.body.encryptedMnemonic;

        const decryptedPhrase = decryptMnemonic(encryptedMnemonic);

        res.status(200).json({ passphrase: decryptedPhrase });
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
