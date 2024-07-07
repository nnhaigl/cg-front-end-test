import Head from 'next/head';
import styles from '../styles/Home.module.css';
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { ethereum } from '../utils/constants';
import erc20abi from '../utils/erc20.abi.json';
import BigNumber from 'bignumber.js'; 
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';


export default function Home() {
  const [ethereumAccount, setEthereumAccount] = useState(null);
  const [ethereumBalances, setEtehereumBalances] = useState({});


  const [solanaAccount, setSolanaAccount] = useState(null);
  const [solanaBalances, setSolanaBalances] = useState({});

  const connectMetamask = () => {
    if (typeof window.ethereum !== 'undefined') {
      connectWallet();
      checkNetwork();
    }
  }

  const connectWallet = async () => {
    const web3 = new Web3(ethereum.rpc);
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setEthereumAccount(accounts[0]);
      //get ETH Balance
      const ethBalanceWei = await web3.eth.getBalance(accounts[0])
      const ethBalanceEth = web3.utils.fromWei(ethBalanceWei, 'ether');

      // get USDT balance
      const tokenContract = new web3.eth.Contract(erc20abi, ethereum.usdtContractAddress);
      const usdtBalanceWei = await tokenContract.methods.balanceOf(accounts[0]).call();
      const decimal = await tokenContract.methods.decimals().call(); 
      const usdtBalanceEth = new BigNumber(usdtBalanceWei).div(new BigNumber(10).pow(new BigNumber(parseInt(decimal)))).toNumber()
      setEtehereumBalances({ eth: ethBalanceEth, usdt: usdtBalanceEth });
    } catch (error) {
      console.error('Failed to connect wallet', error);
    }
  };

  const checkNetwork = async () => {
    const web3 = new Web3(window.ethereum);
    const chainId = await web3.eth.getChainId();
    if (chainId != 1) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: web3.utils.toHex(1) }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: web3.utils.toHex(1),
                rpcUrl: ethereum.rpc
              }],
            });
          } catch (addError) {
            console.error('Failed to add Ethereum mainnet', addError);
          }
        }
        console.error('Failed to switch to Ethereum mainnet', switchError);
      }
    }
  };

  const connectPhantomWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      const address = response.publicKey.toString()
      setSolanaAccount(address);
      const solBalance = await fetchSolBalance(address)
      console.log("solBalance", solBalance)
      setSolanaBalances({sol:solBalance})
    }
  };

  const fetchSolBalance = async (address) => {
    const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/45uB_ia-fH1niZNdvv4G1oBy4ecT8S8b', 'confirmed');
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9 // Convert balance from lamports to SOL
  };


  useEffect(() => {
  }, []);


  return (
    <div className={styles.container}>
      <Head>
        <title>Wallet connection</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className={styles.title}>
          Welcome to Wallet connection
        </h1>

        <p className={styles.description}>
          This page just a testing page for connecting with <code>Metamask on Ethereum</code> and <code>Phantom on Solana</code>
        </p>

        <div className={styles.grid}>

          <h2>Metamask</h2>
          <div className={styles.card}>
            {!ethereumAccount ? <button onClick={connectMetamask} className={styles.fullWidthButton}>Click to connect</button> :
              <div>
                <p>Wallet address: <code> <a href={`https://etherscan.io/address/${ethereumAccount}`} target="_blank">{ethereumAccount}</a></code></p>
                <p>ETH Balance: <code>{ethereumBalances['eth']||0}</code></p>
                <p>USDT Balance: <code>{ethereumBalances['usdt'] || 0}</code></p>
              </div>}
          </div>

          <h2>Phantom</h2>
          <div className={styles.card}>
            {!solanaAccount ? <button onClick={connectPhantomWallet} className={styles.fullWidthButton}>Click to connect</button> :
              <div>
                <p>Wallet address: <code> <a href={`https://etherscan.io/address/${ethereumAccount}`} target="_blank">{solanaAccount}</a></code></p>
                <p>SOL Balance: <code>{solanaBalances['sol'] || 0}</code></p>
              </div>}
          </div>
        </div>
      </main>

      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel" className={styles.logo} />
        </a>
      </footer>

      <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        footer img {
          margin-left: 0.5rem;
        }
        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family:
            Menlo,
            Monaco,
            Lucida Console,
            Liberation Mono,
            DejaVu Sans Mono,
            Bitstream Vera Sans Mono,
            Courier New,
            monospace;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            Segoe UI,
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            Fira Sans,
            Droid Sans,
            Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
