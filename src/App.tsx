import React, { useState } from 'react';
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
import { ethers } from 'ethers'

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Button from '@mui/material/Button';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';

import { 
  Box as BoxSS,
  TextInput as Input,
  Button as ButtonSS,
  MoonIcon,
  Spinner,
  RadioGroup,
  useTheme } from '@0xsequence/design-system'

const steps = ['Register Postal Address', 'Checkout with Item'];

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
          else return <div className="flower" onClick={() => {props.setSelectedNFTID(i);props.setSelectedNFT(img); props.setPrice(Math.floor(props.prices[i]*props.temperature))}}>
            <img src={img} /><p className='price'>_ {Math.floor(props.prices[i]*props.temperature)}</p></div>
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

let count = 0;

function Approve(props: any) {
  return(
    <>
      <ButtonSS label="Approve Tokens"/>
    </>
  )
}

function Postal(props: any) {
  return(
    <>
      <p style={{fontFamily:'Orbitron', color: 'red'}}>⚠ for DEMO only, nothing gets shipped<br/><br/></p>
      <br/>
      <br/>
      <BoxSS justifyContent={'center'}>
        <RadioGroup size='lg' gap='10' flexDirection="row" value={props.name} onValueChange={(value: any) => {props.setName(value)}}name="network" options={[{'label': "resident", value: 'resident'},{'label': "occupant", value: 'occupant'},]}/>
      </BoxSS>
      <br/>
      <br/>
      <Input placeholder="street" onChange={(value: any) => {console.log(value);props.setStreet(value.target.value)}}/>
      <br/>
      <Input placeholder="postal code" onChange={(value: any) => {props.setPostal(value.target.value)}}/>
      <br/>
      <Input placeholder="province" onChange={(value: any) => {props.setProvince(value.target.value)}}/>
      <br/>
      <Input placeholder="city" onChange={(value: any) => {props.setCity(value.target.value)}}/>
      <br/>
      <br/>
      <ButtonSS label="Submit" onClick={() => {
        props.handleNext()
      }}/>
    </>
  )
}

function Checkout(props: any) {
  const [destinationAddress, setDestinationAddress] = React.useState<any>(null)
  const [gift, setGift] = useState<any>('normal')
  const [error, setError] = useState<any>(false)

  React.useEffect(() => {
    setDestinationAddress(props.address)
  })
  const submitTransaction = async () => {
      const flore1155ContractAddress = '0xcc33AD129FA66c4688436b77e4a4eEd2c90D86ee'
      const tenContractAddress = '0xdd0d8fee45c2d1ad1d39efcb494c8a1db4fde5b7'
  
      const wallet = await sequence.getWallet()
  
      // Craft your transaction
      const erc20Interface = new ethers.utils.Interface([
        'function approve(address spender, uint256 amount) public returns (bool)'
      ])
      
      // TODO: do an allowance ., check
      const data20 = erc20Interface.encodeFunctionData(
        'approve', [flore1155ContractAddress, "100000000000000000000"]
      )
  
      // Craft your transaction
      const erc721Interface = new ethers.utils.Interface([
        'function arrangeFlower(address _address, uint price, uint tokenID, uint blockNumber, uint celcius, bytes memory weatherProof) public'
      ])
      
      // TODO: do a price request
      // const res = await fetch('http://localhost:8000/price')

      const res = await fetch("http://localhost:8000/price", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ 
        address: props.address,
        id: props.selectedNFTID
      })
    })

      const json = await res.json()
      console.log(json)
      // json.price = 0
      // json.sig ="0x"
      console.log([destinationAddress, json.price, props.selectedNFTID, json.block, json.celcius, json.sig])

      const data = erc721Interface.encodeFunctionData(
        'arrangeFlower', [destinationAddress, json.price, props.selectedNFTID, json.block, json.celcius, json.sig]
      )
  
      const txn1 = {
        to: tenContractAddress,
        data: data20
      }
  
      const txn2 = {
        to: flore1155ContractAddress,
        data: data
      }
  
      const signer = wallet.getSigner()
  
      // TODO: 
      // const txRes = await signer.sendTransactionBatch([txn1, txn2])
      // console.log(txRes)

      let hash;
    
      // TODO: make request to backend with postal payload and hash
      const postal = {
        wallet: destinationAddress,
        tokenId: props.selectedNFTID,
        name: props.name,
        street: props.street,
        city: props.city,
        provice: props.province,
        postal: props.postal,
        hash: hash
      }

      console.log(postal)

      // fetch()
      const res1 = await fetch("http://localhost:8000/order", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ 
        address: props.address,
        id: props.selectedNFTID,
        price: json.price,
        tokenID: props.selectedNFTID,
        name: props.name,
        street: props.street,
        city: props.city,
        provice: props.province,
        postal: props.postal,
      })
    })

    console.log(res1)

    if(res1.status == 404){
      setError(true)
    } else {
      props.handleNext()
    }
  }

  return(
    <>
      <p style={{fontFamily:'Orbitron'}}>you will be asked to sign multiple transactions, <br/><br/>to approve and submit collection</p>
      <br/>
      <BoxSS justifyContent={'center'}>
        <RadioGroup size='lg' gap='10' flexDirection="row" value={gift} onValueChange={(value: any) => {setGift(value)}}name="network" options={[{'label': "normal", value: 'normal'},{'label': "gift", value: 'gift'},]}/>
      </BoxSS>
      <br/>
      { gift != 'normal' ? <Input placeholder="gift address" label="testing" onValueChange={(value: any) => {setDestinationAddress(value.target.value)}}/> : null }
      <br/>
      <ButtonSS label="Submit Transaction" onClick={() => submitTransaction() }/>
      <br/>
      <br/>
      {error ? <p style={{fontFamily:'Orbitron', color: 'red'}}>something went wrong in the transaction <br/><br/></p> : null }
    </>
  )
}

function HorizontalLinearStepper(props: any) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());
  const [panel, setPanel] = React.useState(null)
  const [name, setName] = useState<any>('resident')

  const [street, setStreet] = React.useState(null)
  const [city, setCity] = React.useState(null)
  const [postal, setPostal] = React.useState(null)
  const [province, setProvince] = React.useState(null)

  React.useEffect(() => {

  }, [street, city, postal, province])

  const Compass = (activeStep: any, connectors: any, connect: any, address: any, handleNext: any) => {
    let navigator;
      switch(activeStep){
        // case 0:
        //   navigator = <Approve genesisAccountAddress={props.address} connectors={connectors} connect={connect} handleNext={handleNext}/>
        //   break;
        case 0:
          navigator = <Postal name={name} setName={setName} setStreet={setStreet} setCity={setCity} setPostal={setPostal} setProvince={setProvince} handleNext={handleNext}/>
          break;
        default:
          navigator = <Checkout selectedNFTID={props.selectedNFTID} name={name} street={street} city={city} postal={postal} province={province} address={props.address} handleNext={handleNext}/>
      }
    return(
      <>
      <br/>
      <br/>
      <br/>
      <br/>
        {
          navigator
        }
      </>
    )
  }
  const isStepOptional = (step: number) => {
    return step === 4;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
    count = 0;
    props.disconnect()
  };

  return (
    <Box sx={{ width: '50%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <React.Fragment>
            <br/>
            <br/>
            <p style={{fontFamily: 'Orbitron'}}>Transaction Successful.</p>
            <br/>
            <br/>
          {/* <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box> */}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {Compass(activeStep, props.connectors, props.connect, props.address, handleNext)}
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            {/* <Box sx={{ flex: '1 1 auto' }} />
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}
            {activeStep === steps.length - 1 ? <Button onClick={handleNext}>
              {'Finish'}
            </Button> : null} */}
            
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}

function CheckoutStepper(props: any){
  return(
    <>
      <br/>
      <p className='degrees'>{props.temperature}°C → _{props.price}</p>
      <p className='warning' style={{color: 'blue'}}>⚠ warning: final price may fluctuate</p>
      <br/>
      <br/>
      <img src={props.selectedNFT} className='checkout-big-nft'/>
      <br/>
      
      <br/>
      <br/>
      <div style={{margin: 'auto'}}>
        <HorizontalLinearStepper selectedNFTID={props.selectedNFTID} address={props.address}/>
      </div>
    </>
  )
}

function App() {
  const [imgs, setImags] = React.useState([img0, img1, img2, img3, img4, img5, img6, img7, img8, img8, img9 ] )
  const [temperature, setTemperature] = React.useState(0)
  const [prices, setPrices] = React.useState([11, 22, 33, 44, 55, 66, 77, 88, 99, 222, 111])
  const [selectedNFT, setSelectedNFT] = React.useState<any>('')
  const [selectedNFTID, setSelectedNFTID] = React.useState<any>('')

  const [loggedIn, setLoggedIn] = React.useState(false)
  const [email, setEmail]= React.useState<any>(null)
  const [address, setAddress] =React.useState<any>(null)
  const [price, setPrice] = React.useState<any>(0)
  const [signature, setSignature] = React.useState<any>(null)
  const {theme, setTheme} = useTheme()

  setTheme('dark')

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
      networkId: 5,
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
    setLoggedIn(true)

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
            setSelectedNFTID={setSelectedNFTID}
            setPrice={setPrice}
            imgs={imgs}
            selectedNFT={selectedNFT}
            selectedNFTID={selectedNFTID}
            signature={signature}
          />
        : 
          <CheckoutStepper
            temperature={temperature}
            selectedNFT={selectedNFT}
            selectedNFTID={selectedNFTID}
            price={price}
            address={address}
          />
      }
    </div>
  );
}

export default App;
