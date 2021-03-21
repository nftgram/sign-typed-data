import Web3 from "web3"
import 'regenerator-runtime/runtime'
import axios from "axios"
import { createTypeData, signTypedData } from "./sign"
import { AssetEncodedTypeForm, AssetTypeForm, Order, OrderDataForm, OrderForm } from "./domain"

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

async function prepareOrderMessage(form: Omit<OrderForm, "signature">): Promise<Order> {
  const encodedMakeType = await getEncodedAssetData(form.make.type)
  const encodedTakeType = await getEncodedAssetData(form.take.type)
  const encodedData = await getEncoderData(form.data)
  return {
    maker: form.maker,
    makeAsset: {
      assetType: {
        tp: encodedMakeType.type,
        data: encodedMakeType.data
      },
      amount: form.make.value
    },
    taker: form.taker || "0x0000000000000000000000000000000000000000",
    takeAsset: {
      assetType: {
        tp: encodedTakeType.type,
        data: encodedTakeType.data
      },
      amount: form.take.value
    },
    start: form.start || "0",
    end: form.end || "0",
    data: encodedData.data,
    dataType: encodedData.type,
    salt: form.salt,
  }
}

function createTestOrder(
  maker: string
): Omit<OrderForm, "signature"> {
  return {
    maker: maker,
    make: {
      "type": {
        "@type": "ERC721",
        "token": "0x509fd4cdaa29be7b1fad251d8ea0fca2ca91eb60",
        "tokenId": "0x0000000000000000000000000000000000000000000000000000000000000013"
      },
      "value": "1"
    },
    take: {
      "type": {
        "@type": "ETH"
      },
      "value": "10000000000000000"
    },
    data:  {
      "@type": "V1",
      "beneficiary": "0x0000000000000000000000000000000000000000",
      "originFees": []
    },
    salt: "0x0000000000000000000000000000000000000000000000000000000000000001",
  }
}

async function putOrder(order: OrderForm) {
  const res = await client.put("/protocol/ethereum/order/indexer/v0.1/orders", order)
  return res.data
}

async function signOrderForm(form: Omit<OrderForm, "signature">): Promise<OrderForm> {
  const order = await prepareOrderMessage(form)
  const signature = await signOrderMessage(
    web3,
    order,
    order.maker,
    4,
    "0x43162023C187662684abAF0b211dCCB96fa4eD8a"
  );
  return { ...form, signature }
}

async function testSign() {
  const [maker] = await web3.eth.getAccounts();
  return signAndPut(createTestOrder(maker))
}

async function signAndPut(notSignedOrderForm: Omit<OrderForm, "signature">) {
  const signed = await signOrderForm(notSignedOrderForm)
  return putOrder(signed)
}

document.getElementById("connect")?.addEventListener("click", (e) => {
  e.preventDefault()
  provider.enable();
})

document.getElementById("sign")?.addEventListener("click", (e) => {
  e.preventDefault()
  testSign().then(x => console.log("SENT", x)).catch(err => console.dir("ERROR", err))
})
