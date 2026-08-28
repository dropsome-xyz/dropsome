import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { RefundView } from "../views/refund/index";
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

const Refund: NextPage = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <Head>
        <title>{t('pages.refund.title')}</title>
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

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'refund', 'errors'])),
  },
});

export default Refund;
