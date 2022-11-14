import './App.css';
import Web3 from 'web3'
import vendingMachineContract from './blockchain/vending.js'
import { useState, useEffect } from 'react';

function App() {
  const [web3, setWeb3] = useState(null)
  const [account, setAccount] = useState(null)
  const [vmContract, setVmContract] = useState(null)
  const [inventory, setInventory] = useState('')
  const [myDonutCount, setMyDonutCount] = useState('Register first')
  const [buyCount, setBuyCount] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const connectWalletHandler = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const newWeb3 = new Web3(window.ethereum)
        setWeb3(newWeb3)

        const accounts = await newWeb3.eth.getAccounts()
        setAccount(accounts[0])

        const vm = vendingMachineContract(newWeb3)
        setVmContract(vm)
      } catch (error) {
        console.log(error.message)
      }
    } else {
      console.log('Please install MetaMask!')
    }
  }

  useEffect(() => {
    if (vmContract) getInventoryHandler()
    if (vmContract && account) getMyDonutCountHandler()
  }, [vmContract, account])

  const getInventoryHandler = async () => {
    const inventory = await vmContract.methods.getVendingMachineBalance().call()
    setInventory(inventory)
  }
  
  const getMyDonutCountHandler = async () => {
    const donutCount = await vmContract.methods.donutBalances(account).call()
    setMyDonutCount(donutCount)
  }

  const updateDonutCount = (event) => [
    setBuyCount(event.target.value)
  ]

  const buyDonutsHandler = async () => {
    try {
      await vmContract.methods.purchase(buyCount).send({
        from: account,
        value: web3.utils.toWei('0.0001', 'ether') * buyCount
      })
      setSuccessMessage(`Successfully bought ${buyCount} donuts!`)
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <>
      <h1>Vending machine app</h1>
      <nav className='navbar'>
        <div className="container">
          <div className="navbar-brand">
            <h1>Vending machine!</h1>
          </div>
          <div className="navbar-end">
            <button className="button is-primary" onClick={connectWalletHandler}>Connect Wallet</button>
          </div>
        </div>
      </nav>
      <section>
        <div className="container">
          <p>Vending machine inventory: {inventory}</p>
        </div>
      </section>
      <section>
        <div className="container">
          <p>My donuts: {myDonutCount}</p>
        </div>
      </section>
      <section>
        <div className="container">
          <div className="field">
            <label className="label">Buy donuts</label>
            <div className="control">
              <input type="text" className="input" placeholder="Enter amount ..." onChange={updateDonutCount} />
            </div>
            <button className="button is-primary" onClick={buyDonutsHandler}>Buy</button>
          </div>
        </div>
      </section>
      <section>
        <div className="container">
          <p>{successMessage}</p>
        </div>
      </section>
    </>
  );
}

export default App;
