import type { NextPage } from "next";
import Head from "next/head";
import { ClaimView } from "../views/claim/index";

const Claim: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Claim your drop</title>
        <meta
          name="description"
          content="Claim your SOL drop. Follow the steps to set up a wallet and receive the SOL sent to you through Dropsome."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <ClaimView />
    </div>
  );
};

export default Claim;
