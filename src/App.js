import React, { useEffect, useState } from "react";
import { ethers } from 'ethers'
import './App.css';
import abi from './utils/WavePortal.json'

const App = () => {
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS
  const CONTRACT_ABI = abi.abi

  const [currentAccount, setCurrentAccount] = useState(null)
  const [allWaves, setAllWaves] = useState([])

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!")
      } else {
        console.log("We have the ethereum object", ethereum)
      }

      // Check for authorization to access user's wallet
      const accounts = await ethereum.request({ method: "eth_accounts" })

      if (accounts.length > 0) {
        const account = accounts[0]
        console.log("Found an authorized account:", account)
        setCurrentAccount(account)
        getAllWaves()
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert("Get MetaMask!")
        return
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" })

      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

        // How many waves are there currently?
        let count = await wavePortalContract.getTotalWaves()
        console.log("Retrieved total wave count...", count.toNumber())

        // Execute wave from smart contract
        const waveTxn = await wavePortalContract.wave("This is a static message")
        console.log("Mining...", waveTxn.hash)

        await waveTxn.wait()
        console.log("Mined -- ", waveTxn.hash)

        // How many waves are there now?
        count = await wavePortalContract.getTotalWaves()
        console.log("Retrieved total wave count...", count.toNumber())
      } else {
        console.log("Ethereum object doesn't exist")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

        const waves = await wavePortalContract.getAllWaves()

        let wavesCleaned = []
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          })
        })

        setAllWaves(wavesCleaned)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          Hey there!
        </div>

        <div className="bio">
          I am Lee! Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at me
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
