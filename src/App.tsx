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

function App() {
  const [imgs, setImags] = React.useState([img0, img1, img2, img3, img4, img5, img6, img7, img8, img8, img9 ] )
  const [temperature, setTemperature] = React.useState(0)
  const [prices, setPrices] = React.useState([11, 22, 33, 44, 55, 66, 77, 88, 99, 222, 111] )
  const [selectedNFT, setSelectedNFT] = React.useState('')
  const getPrices = async () => {
    setTimeout(() => {
      setTemperature(21.2)
    }, 1000)
  }
  React.useEffect(() => {
    getPrices()
  }, [])
  return (
    <div className="App">
      <br/>
      <span className='App-logo'>X</span><p className='degrees'>{temperature}°C</p>
      <p className='title' style={{color: 'white'}}>flore</p>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <div className='container'>
        {imgs.map((img, i) => {
          if(i==9) return <img className='black-square' />
          else return <div className="flower" onClick={() => setSelectedNFT(img)}>
            <img src={img} /><p className='price'>{Math.floor(prices[i]*temperature)} $TEN</p></div>
        })}
      </div>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <div className='checkout-button'>
          <img src={selectedNFT} className='checkout-lil-nft'/>
          <span style={{color: 'white', padding: '20px', margin: 'auto', fontFamily: 'Orbitron'}}>{` > checkout`}</span>
        </div>
        <br/>
    </div>
  );
}

export default App;
