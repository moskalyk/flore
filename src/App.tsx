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
        <RadioGroup size='lg' gap='10' flexDirection="row" value="resident" onValueChange={(value: any) => {props.setName(value)}}name="network" options={[{'label': "resident", value: 'resident'},{'label': "occupant", value: 'occupant'},]}/>
      </BoxSS>
      <br/>
      <br/>
      <Input placeholder="street" onValueChange={(value: any) => {}}/>
      <br/>
      <Input placeholder="postal code" onValueChange={(value: any) => {}}/>
      <br/>
      <Input placeholder="province" onValueChange={(value: any) => {}}/>
      <br/>
      <Input placeholder="city" onValueChange={(value: any) => {}}/>
      <br/>
      <br/>
      <ButtonSS label="Submit" onClick={() => {
        props.handleNext()
      }}/>
    </>
  )
}

function Checkout(props: any) {
  const submitTransaction = async () => {
      const flower1155ContractAddress = '0xc42ae8452f5057212a7c313589df6c9b83660aa3'
      const tenContractAddress = '0xA1767A6C3dE0c07712bAcD48423D5Aad74081237'
  
      const wallet = await sequence.getWallet()
  
      // Craft your transaction
      const erc20Interface = new ethers.utils.Interface([
        'function approve(address spender, uint256 amount) public returns (bool)'
      ])
      
      // TODO: do an allowance ., check
      const data20 = erc20Interface.encodeFunctionData(
        'approve', [flower1155ContractAddress, "100000000000000000000"]
      )
  
      // Craft your transaction
      const erc721Interface = new ethers.utils.Interface([
        'function claim(address address_, uint price, uint type_, uint blockNumber, uint celcius, bytes memory weatherProof) public'
      ])
      
      // TODO: do a price request
      const data = erc721Interface.encodeFunctionData(
        'claim', [destinationAddress, price, props.selectedNFTID, blockNumber, celcius, proofSignature]
      )
  
      const txn1 = {
        to: tenContractAddress,
        data: data20
      }
  
      const txn2 = {
        to: flower1155ContractAddress,
        data: data
      }
  
      const signer = wallet.getSigner()
  
      const res = await signer.sendTransactionBatch([txn1, txn2])
      console.log(res)
      props.handleNext()
  }

  return(
    <>
      <p style={{fontFamily:'Orbitron'}}>you will be asked to sign multiple transactions, <br/><br/>to approve and submit redemption</p>
      <br/>
      <br/>
      <ButtonSS label="Submit Transaction" onClick={() => submitTransaction() }/>
    </>
  )
}

function HorizontalLinearStepper(props: any) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());
  const [panel, setPanel] = React.useState(null)

  const [street, setStreet] = React.useState(null)
  const [city, setCity] = React.useState(null)
  const [postal, setPostal] = React.useState(null)
  const [province, setProvince] = React.useState(null)

  const Compass = (activeStep: any, connectors: any, connect: any, address: any, handleNext: any) => {
    let navigator;
      switch(activeStep){
        // case 0:
        //   navigator = <Approve genesisAccountAddress={props.address} connectors={connectors} connect={connect} handleNext={handleNext}/>
        //   break;
        case 0:
          navigator = <Postal network={'polygon'} handleNext={handleNext}/>
          break;
        default:
          navigator = <Checkout genesisAccountAddress={props.address} network={'mumbai'} handleNext={handleNext}/>
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
      <p className='degrees'>{props.temperature}°C → {props.price} $TEN</p>
      <br/>
      <br/>
      <img src={props.selectedNFT} className='checkout-big-nft'/>
      <br/>
      <br/>
      <br/>
      <div style={{margin: 'auto'}}>
        <HorizontalLinearStepper/>
      </div>
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
    // const wallet = sequence.getWallet()
    // const connectDetails = await wallet.connect({
    //   networkId: 80001,
    //   app: 'flore',
    //   authorize: true,
    //   askForEmail: true,
    //   settings: {
    //     theme: 'dark'
    //   }
    // })

    // if(connectDetails.connected) {
    //   console.log(connectDetails)
    //   setLoggedIn(true)
    //   setEmail(connectDetails.session!.accountAddress!)
    //   setAddress(connectDetails.session!.accountAddress!)
    // }
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
            setPrice={setPrice}
            imgs={imgs}
            selectedNFT={selectedNFT}
            signature={signature}
          />
        : 
          <CheckoutStepper
            temperature={temperature}
            selectedNFT={selectedNFT}
            price={price}
          />
      }
    </div>
  );
}

export default App;
