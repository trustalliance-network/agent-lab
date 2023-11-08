import AuthLayout from "@/layouts/AuthLayout";
import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import Head from "next/head";
import { v4 } from 'uuid';
import { Rye } from "next/font/google";

const rye = Rye({ subsets: ['latin'], weight: ['400'] })

export default function Home() {

  const [session, setSession] = useState(null);

  useEffect(() => {
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) {
      setSession(sessionId);
    }
  }, []);

  return (
    <AuthLayout>
      <Head>
        <title>Sign In to MyBovine</title>
      </Head>
      <div className="flex h-screen flex-row">
        <div className="flex-grow bg-cover grayscale" style={{ backgroundImage: 'url(/cows.jpg)' }}><></></div>

        <div className="flex-shrink-0 w-[500px] pl-12 pr-[150px]">
          <div className="pt-20 mb-12 h-48 flex items-center">
            <img src="/logo.png" alt="" className="h-full w-auto"/>
          </div>

          <div className="text-sm mb-10">
            <h3 className={`text-3xl mb-6 font-semibold ${rye.className}`}>MyBovine</h3>
            <LoginForm />
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');

  useEffect(() => {
    const email = router.query.email;
    if (email) {
      setEmail(email.trim().replace(" ", "+"));
    }
  }, [router.query]);

  function onEmailChange(evt) {
    setEmail(evt.target.value);
  }

  function handleFormSubmit(evt) {
    evt.preventDefault();

    const uuid = v4()
    // set session ID in localstorage for later
    localStorage.setItem('session_id', uuid);
    localStorage.setItem('session', JSON.stringify({
      id: uuid,
      email,
      created_at: new Date().toISOString(),
      state: 'none',
    }));

    router.push('/dashboard');
  }

  return (
    <form className="space-y-4 md:space-y-6" onSubmit={handleFormSubmit}>
      <div>
        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
        <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required=""/>
      </div>
      <div>
        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
        <input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required=""/>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required=""/>
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">Remember me</label>
          </div>
        </div>
        <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
      </div>
      <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Sign in</button>
      <p className="text-sm font-light text-gray-500 dark:text-gray-400">
        Don’t have an account yet? <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
      </p>
    </form>
  )
}
