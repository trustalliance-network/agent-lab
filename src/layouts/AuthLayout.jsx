import Head from "next/head";

export default function AuthLayout({children}) {
  return (
    <main className={`min-h-screen font-sans`}>
      <Head>
        <link rel="shortcut icon" type="image/x-icon" media="all" href="/favicon.png"/>
        <title>MyBovine | Login</title>
      </Head>
      {children}
    </main>
  )
}
