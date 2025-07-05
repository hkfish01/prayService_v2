import type { AppProps } from "next/app";
import Navbar from "../components/Navbar";
import "../styles/globals.css";
import 'antd/dist/antd.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}