require('dotenv').config()
import { ethers, utils } from "ethers";
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import fetch from 'cross-fetch'

const _addresses = [process.env.account_0, process.env.account_1]
const _state = [1,2,3,4]

const pkey = process.env.pkey!
var wallet = new ethers.Wallet(pkey);

const PORT = process.env.PORT || 5000
const app = express();

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:8084'],
};
  
app.use(cors(corsOptions));
app.use(bodyParser.json())

const providers: any = {
    SEQUENCE_RPC: process.env.SEQUENCE_RPC,
    ALCHEMY_RPC: process.env.ALCHEMY_RPC,
    QUICKNODE_RPC: process.env.QUICKNODE_RPC,
    POLYGON_RPC: process.env.POLYGON_RPC,
    ANKR_RPC: process.env.ANKR_RPC
}

app.post('/sig', async (req: any, res: any) => {
    try{
        const result = await fetch('http://137.220.54.108:8000/api/rpc/latest')
        const provider_url = (await result.json()).provider
        const provider = new ethers.providers.JsonRpcProvider(providers[provider_url])
        const blockNumber = await provider.getBlockNumber()
        console.log(req.body.celcius)
        const hash = utils.solidityKeccak256(['uint', 'uint'], [req.body.celcius, blockNumber])
        var signature = await wallet.signMessage(ethers.utils.arrayify(hash))
        res.send({sig: signature, block: blockNumber, status: 200})
    }catch(e){
        console.log(e)
        res.send({msg: JSON.stringify(e), status: 500})
    }
})

app.listen(PORT, async () => {
    console.log(`listening on port: ${PORT}`)
})