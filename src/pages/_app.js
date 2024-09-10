import '../app/globals.css'
import Head from 'next/head';
import Script from 'next/script'

function MyApp({ Component, pageProps }) {

  return (
    <>
      <Script>
      console.log("Hello from the Global sccript section!");
      </Script>  
      {/*<!-- Google tag (gtag.js) --> */}
      <Script async src="https://www.googletagmanager.com/gtag/js?id=G-752HBSK679" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-752HBSK679');
        `}
      </Script>            
    <Head>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
    />
  
    </Head>    
    <Component {...pageProps} />
    </>
  );
}

export default MyApp
