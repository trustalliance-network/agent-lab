import {Roboto, Oswald} from "next/font/google"
import Head from "next/head";

import { Rye } from "next/font/google";
const rye = Rye({ subsets: ['latin'], weight: ['400'] })

const menuItems = [
  {title: 'Get GHG Credential', icon: 'ghg.png'},
]
const submenuItems = [
  {title: 'Browse Products'},
  {title: 'Contact Us'},
  {title: 'Terms and Conditions'},
  {title: 'Improvements'},
  {title: 'FAQ'},
]
function MenuItem({ title, icon }) {
  return (
    <div className="h-9 flex items-center px-6 text-[#40b0f1] uppercase text-md font-medium tracking-tight	gap-2">
      <img src={`/${icon}`} alt="" className="w-6"/> {title}
    </div>
  )
}

export default function DashboardLayout({children}) {
  return (
    <main className={`min-h-screen font-sans flex flex-col ${rye.className} `}>
      <Head>
        <link rel="shortcut icon" type="image/x-icon" media="all" href="/favicon.png"/>
        <title>MyBovine | Home</title>
      </Head>
      <header className="h-16 bg-[#2b3544]">
        <div className="w-72 h-full bg-white text-white justify-center flex">
          <img src="/logo.png" alt=""/>
        </div>
      </header>
      <div className="h-full flex-grow flex">
        <div className="w-72 bg-white border-r border-r-[rgba(0,0,0,.08)] flex-shrink-0">
          <div className={`h-14 border-b border flex items-center text-sm px-6 ${rye.className}`}>
            You are logged in
          </div>
          <div className={`py-4 ${rye.className} border-b-2`}>
            {menuItems.map((item, i) => (
              <MenuItem key={i} {...item}/>
            ))}
          </div>
        </div>
        <div className="bg-[#efeff4] flex-grow">
          {children}
        </div>
      </div>
    </main>
  )
}
