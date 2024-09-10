import Head from "next/head";
import { useEffect, useState } from 'react';
import styles from "../styles/Home.module.css";
import Hero from '../components/HeroAILabs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {

  return (
    <div className={styles.container}>
      <Head>
        <title>AI Labs</title>
 
      </Head>

      <Hero />  
  
    </div>
  );
}