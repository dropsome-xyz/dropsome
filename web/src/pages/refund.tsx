import type { NextPage } from "next";
import Head from "next/head";
import { RefundView } from "../views/refund/index";

const Refund: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Refund your drop</title>
        <meta
          name="description"
          content="Recover an unclaimed drop"
        />
        <meta name="robots" content="index, follow" />
      </Head>
      <RefundView />
    </div>
  );
};

export default Refund;
