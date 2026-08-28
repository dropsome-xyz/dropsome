import Document, { DocumentContext, Head, Html, Main, NextScript } from "next/document";

type MyDocumentProps = { locale?: string };

class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps, locale: ctx.locale };
  }

  render() {
    const { locale } = this.props;
    return (
      <Html lang={locale ?? 'en'} data-color-scheme="dark">
        <Head>
          <meta name="color-scheme" content="dark" />
          <meta name="theme-color" media="(prefers-color-scheme: light)" content="#000817" />
          <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000817" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Tektur:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
