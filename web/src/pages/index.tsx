import type { NextPage } from "next";
import Head from "next/head";
import { DropView } from "../views";

const Drop: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Send SOL to someone without a wallet</title>
        <meta
          name="description"
          content="Send SOL to someone without a wallet. Dropsome creates a secure claim link so they can set up a wallet and claim it when ready."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <DropView />
    </div>
  );
};

export default Drop;
