import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { ClaimView } from "../views/claim/index";
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

const Claim: NextPage = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <Head>
        <title>{t('pages.claim.title')}</title>
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

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'claim', 'errors'])),
  },
});

export default Claim;
