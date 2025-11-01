import type { NextPage } from "next";
import Head from "next/head";
import { DropView } from "../views";

const Drop: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Dropsome</title>
        <meta
          name="description"
          content="Drop Some Funds"
        />
      </Head>
      <DropView />
    </div>
  );
};

export default Drop;
