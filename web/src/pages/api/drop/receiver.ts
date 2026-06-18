import { PublicKey } from "@solana/web3.js";
import { createReceiverWallet } from "../../../utils/wallet";
import type { NextApiRequest, NextApiResponse } from "next"
import { encryptMnemonic } from "../../../utils/encryption";
import { checkClient, disableCaching } from "../../../utils/apiHandlerHelpers";

export type ResponseData = {
    address: PublicKey,
    encryptedMnemonic: string,
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    disableCaching(res);

    checkClient(req, res);

    if (req.method === "GET") {
        const { keypair: receiver, mnemonic } = await createReceiverWallet();

        const encryptedMnemonic: string = encryptMnemonic(mnemonic);

        res.status(200).json({ address: receiver.publicKey, encryptedMnemonic: encryptedMnemonic });
    } else {
        res.setHeader("Allow", ["GET"]);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
