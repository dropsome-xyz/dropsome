import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC } from 'react';
import { ContextProvider } from '../contexts/ContextProvider';
import { AppBar } from '../components/AppBar';
import { ContentContainer } from '../components/ContentContainer';
import { Footer } from '../components/Footer';
import Notifications from '../components/Notification';
import { DrawerProvider } from 'components/DrawerProvider';
require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Dropsome</title>
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Dropsome" />
        <meta property="og:title" content="Dropsome — Kickstart someone's crypto journey" />
        <meta
          property="og:description"
          content="Create a SOL drop for a friend without a wallet yet. Share a secure claim link and onboard them to Solana in seconds."
        />
        <meta
          property="og:image"
          content={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/media-image.png`}
        />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_BASE_URL} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dropsome — Kickstart someone's crypto journey" />
        <meta
          name="twitter:description"
          content="Create a SOL drop for a friend without a wallet yet. Share a secure claim link and onboard them to Solana in seconds."
        />
        <meta
          name="twitter:image"
          content={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/media-image.png`}
        />
      </Head>

      <ContextProvider>
        <DrawerProvider>
          <div className="flex flex-col h-screen overflow-hidden">
            <Notifications />
            <AppBar />
            <ContentContainer>
              <div className="min-h-full flex flex-col">
                <div className="flex-1">
                  <Component {...pageProps} />
                </div>
                <Footer />
              </div>
            </ContentContainer>
          </div>
        </DrawerProvider>
      </ContextProvider>
    </>
  );
};

export default App;
