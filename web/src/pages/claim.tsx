import type { NextPage } from "next";
import Head from "next/head";
import { ClaimView } from "views/claim";

const Claim: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Dropsome</title>
        <meta
          name="description"
          content="Claim Your Drop"
        />
      </Head>
      <ClaimView />
    </div>
  );
};

export default Claim;
