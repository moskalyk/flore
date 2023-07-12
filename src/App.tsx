import React from 'react';
import logo from './logo.svg';
import './App.css';
import img0 from './imgs/0.png'
import img1 from './imgs/1.png'
import img2 from './imgs/2.png'
import img3 from './imgs/3.png'
import img4 from './imgs/4.png'
import img5 from './imgs/5.png'
import img6 from './imgs/6.png'
import img7 from './imgs/7.png'
import img8 from './imgs/8.png'
import img9 from './imgs/9.png'
import { sequence } from '0xsequence'

function Shop(props: any){
  return(
    <>
      <p className='degrees'>{props.temperature}°C</p>
      <p className='title' style={{color: 'white'}}>flore</p>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <div className='container'>
        {props.imgs.map((img: any, i: any) => {
          if(i==9) return <img className='black-square' />
          else return <div className="flower" onClick={() => {props.setSelectedNFT(img); props.setPrice(Math.floor(props.prices[i]*props.temperature))}}>
            <img src={img} /><p className='price'>{Math.floor(props.prices[i]*props.temperature)} $TEN</p></div>
        })}
      </div>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <div className='checkout-button' onClick={() => props.selectedNFT ? props.connect() : null }>
          <img src={props.selectedNFT} className='checkout-lil-nft'/>
          <span style={{color: 'white', padding: '20px', margin: 'auto', fontFamily: 'Orbitron'}}>{` > checkout`}</span>
        </div>
        <br/>
      <p className='signature' style={{color: 'cyan'}}>{props.signature}</p>
      <br/>
    </>
  )
}

function Stepper(props: any){
  return(
    <>
      <p className='degrees'>{props.temperature}°C → {props.price} $TEN</p>
      <img src={props.selectedNFT} className='checkout-big-nft'/>
      <p className='title' style={{color: 'white'}}>checkout</p>
    </>
  )
}

function App() {
  const [imgs, setImags] = React.useState([img0, img1, img2, img3, img4, img5, img6, img7, img8, img8, img9 ] )
  const [temperature, setTemperature] = React.useState(0)
  const [prices, setPrices] = React.useState([11, 22, 33, 44, 55, 66, 77, 88, 99, 222, 111])
  const [selectedNFT, setSelectedNFT] = React.useState('')
  const [loggedIn, setLoggedIn] = React.useState(false)
  const [email, setEmail]= React.useState<any>(null)
  const [address, setAddress] =React.useState<any>(null)
  const [price, setPrice] = React.useState<any>(0)
  const [signature, setSignature] = React.useState<any>(null)

  const getPrices = async () => {

    const res = await fetch('http://localhost:8000/ip')
    const json = (await res.json())
    setTemperature(json.celcius)
    setSignature(json.sig)
  }
  React.useEffect(() => {
    getPrices()
  }, [])

  const connect = async () => {
    const wallet = sequence.getWallet()
    const connectDetails = await wallet.connect({
      networkId: 80001,
      app: 'flore',
      authorize: true,
      askForEmail: true,
      settings: {
        theme: 'dark'
      }
    })

    if(connectDetails.connected) {
      console.log(connectDetails)
      setLoggedIn(true)
      setEmail(connectDetails.session!.accountAddress!)
      setAddress(connectDetails.session!.accountAddress!)
    }
  }

  sequence.initWallet('mumbai')
  return (
    <div className="App">
      <br/>
      {
          !loggedIn 
        ? 
          <Shop
            connect={connect}
            temperature={temperature}
            prices={prices}
            setSelectedNFT={setSelectedNFT}
            setPrice={setPrice}
            imgs={imgs}
            selectedNFT={selectedNFT}
            signature={signature}
          />
        : 
          <Stepper
            temperature={temperature}
            selectedNFT={selectedNFT}
            price={price}
          />
      }
    </div>
  );
}

export default App;
