
import Web3 from "web3";
import 'regenerator-runtime/runtime'
import axios from "axios"
import { createTypeData, signTypedData } from "./sign";
import { AssetEncodedTypeForm, AssetTypeForm, Order, OrderDataForm, OrderForm } from "./domain";

const orderTypes = {
  AssetType: [
    { name: "tp", type: "bytes4" },
    { name: "data", type: "bytes" }
  ],
  Asset: [
    { name: "assetType", type: "AssetType" },
    { name: "amount", type: "uint256" }
  ],
  Order: [
    { name: "maker", type: "address" },
    { name: "makeAsset", type: "Asset" },
    { name: "taker", type: "address" },
    { name: "takeAsset", type: "Asset" },
    { name: "salt", type: "uint256" },
    { name: "start", type: "uint256" },
    { name: "end", type: "uint256" },
    { name: "dataType", type: "bytes4" },
    { name: "data", type: "bytes" }
  ]
};

async function signOrderMessage(
  web3: Web3,
  order: Order,
  account: string,
  chainId: number,
  verifyingContract: string
) {
  const data = createTypeData(
    {
      name: "Exchange",
      version: "2",
      chainId,
      verifyingContract
    },
    "Order",
    order,
    orderTypes
  );
  return (await signTypedData(web3, account, data)).sig;
}

const provider = (window as any).ethereum;
const web3 = new Web3(provider);

const client = axios.create({
	baseURL: "https://api-staging.rarible.com"
})

async function getEncodedAssetData(asset: AssetTypeForm) {
  const res = await client.post<AssetEncodedTypeForm>("protocol/ethereum/order/indexer/v0.1/encoder/assetType", asset)
  return res.data
}

async function getEncoderData(data: OrderDataForm) {
  const res = await client.post<AssetEncodedTypeForm>("protocol/ethereum/order/indexer/v0.1/encoder/data", data)
  return res.data
}

function createTestOrder(
  take: AssetEncodedTypeForm,
  make: AssetEncodedTypeForm,
  data: AssetEncodedTypeForm,
  maker: string, 
  taker: string
): Order {
  return {
    maker: maker,
    makeAsset: {
      assetType: {
        tp: make.type,
        data: make.data
      },
      amount: "1"
    },
    taker,
    takeAsset: {
      assetType: {
        tp: take.type,
        data: take.data
      },
      amount: "10000000000000000"
    },
    start: "0",
    end: "0",
    data: data.data,
    dataType: data.type,
    salt: "0x0000000000000000000000000000000000000000000000000000000000000001",
  }
}

async function putOrder(order: OrderForm) {
  const res = await client.put("/protocol/ethereum/order/indexer/v0.1/orders", order)
  return res.data
}

async function testSign() {
  const taker = "0x0000000000000000000000000000000000000000"
  const [maker] = await web3.eth.getAccounts();
  const makeForm = {
    "@type": "ERC721",
    token: "0x25646B08D9796CedA5FB8CE0105a51820740C049",
    tokenId: "53721905486644660545161939638297855196812841812707644157952069735379309525090"
  } as const
  const make = await getEncodedAssetData(makeForm)
  const takeForm = {
    "@type": "ETH",
  } as const
  const take = await getEncodedAssetData(takeForm)
  const dataForm = {
    "@type":"V1",
    beneficiary:"0x0000000000000000000000000000000000000000",
    originFees: []
  }
  const data = await getEncoderData(dataForm)
  const order = createTestOrder(take, make, data, maker, taker)
  const signature = await signOrderMessage(
    web3,
    order,
    maker,
    4,
    "0x43162023C187662684abAF0b211dCCB96fa4eD8a"
  );

  return putOrder({
    maker,
    make:{
        type:makeForm,
        value: order.makeAsset.amount
      },
    take: {
      type:takeForm,
      value: order.takeAsset.amount
    },
    taker,
    start: order.start,
    end: order.end,
    salt: order.salt,
    data: dataForm,
    signature
  })
}

document.getElementById("connect")?.addEventListener("click", (e) => {
  e.preventDefault()
  provider.enable();
})

document.getElementById("sign")?.addEventListener("click", (e) => {
  e.preventDefault()
  testSign().then(x => console.log("SENT", x)).catch(err => console.dir("ERROR", err))
})