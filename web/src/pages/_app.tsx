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
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.dropsome.xyz').replace(/\/+$/, '');
  const imageUrl = `${baseUrl}/opengraph-image.jpg`;
  const logoUrl = `${baseUrl}/logo.svg`;

  return (
    <>
      <Head>
        <title>Dropsome</title>
        <link rel="canonical" href={baseUrl} />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Dropsome" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:logo" content={logoUrl} />
        <meta property="og:title" content="Dropsome — Kickstart someone's crypto journey" />
        <meta
          property="og:description"
          content="Create a SOL drop for a friend without a wallet yet. Share a secure claim link and onboard them to Solana in seconds."
        />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:alt" content="Dropsome — Kickstart someone's crypto journey" />
        <meta property="og:image:width" content="900" />
        <meta property="og:image:height" content="450" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:url" content={baseUrl} />
        <meta property="article:published_time" content="2025-11-01T17:39:45Z" />
        <meta name="author" content="Dropsome" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dropsome — Kickstart someone's crypto journey" />
        <meta
          name="twitter:description"
          content="Create a SOL drop for a friend without a wallet yet. Share a secure claim link and onboard them to Solana in seconds."
        />
        <meta name="twitter:image" content={imageUrl} />
        <meta
          name="twitter:image:alt"
          content="Dropsome — Kickstart someone's crypto journey"
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
