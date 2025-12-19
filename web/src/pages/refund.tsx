import type { NextPage } from "next";
import Head from "next/head";
import { RefundView } from "views/refund";

const Refund: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Dropsome</title>
        <meta
          name="description"
          content="Refund Your Drop"
        />
        <meta name="robots" content="index, follow" />
      </Head>
      <RefundView />
    </div>
  );
};

export default Refund;
