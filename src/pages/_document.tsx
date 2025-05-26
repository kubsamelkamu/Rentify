import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon.png" sizes="192x192" />
        <link rel="icon" href="/icons/icon.png" type="image/png" />
        <link rel="preload" href="/icons/icon.png" as="image" />
        <meta name="theme-color" content="#2E86AB" />
        <meta name="msapplication-TileColor" content="#2E86AB" />
        <meta name="msapplication-TileImage" content="/icons/icon.png" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
