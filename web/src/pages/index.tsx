import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { DropView } from "../views";
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

const Drop: NextPage = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <Head>
        <title>{t('pages.index.title')}</title>
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

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'drop', 'errors'])),
  },
});

export default Drop;
