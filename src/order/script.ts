
import Web3 from "web3";
import 'regenerator-runtime/runtime'
import axios from "axios"
import { createTypeData, signTypedData } from "./sign";
import { AssetType, EncodedAsset, OrderNotSigned } from "./domain";

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
  order: OrderNotSigned,
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

async function getEncodedAssetData(asset: AssetType) {
  const res = await client.post<EncodedAsset>("protocol/ethereum/order/indexer/v0.1/encoder/assetType", asset)
  return res.data
}

async function getEncoderData(originFees: any[] = []) {
  const res = await client.post<EncodedAsset>("protocol/ethereum/order/indexer/v0.1/encoder/data", {
    "@type": "V1",
    beneficiary: "0x0000000000000000000000000000000000000000",
    originFees
  })
  return res.data
}

async function createTestOrder(maker: string, taker: string): Promise<OrderNotSigned> {
  return {
    maker: maker,
    make: {
      type: await getEncodedAssetData({
        "@type": "ERC721",
        token: "0x25646B08D9796CedA5FB8CE0105a51820740C049",
        tokenId: "53721905486644660545161939638297855196812841812707644157952069735379309525090"
      }),
      value: "1"
    },
    take: {
      type: await getEncodedAssetData({
        "@type": "ETH",
      }),
      value: "10000000000000000"
    },
    start: "0",
    end: "0",
    salt: "0x0000000000000000000000000000000000000000000000000000000000000001",
    taker,
    ...(await getEncoderData())
  }
}
async function testSign() {
  const taker = "0x0000000000000000000000000000000000000000"
  const [maker] = await web3.eth.getAccounts();
  return signOrderMessage(
    web3,
    await createTestOrder(maker, taker),
    maker,
    4,
    "0x43162023C187662684abAF0b211dCCB96fa4eD8a"
  );
}

document.getElementById("connect")?.addEventListener("click", (e) => {
  e.preventDefault()
  provider.enable();
})

document.getElementById("sign")?.addEventListener("click", (e) => {
  e.preventDefault()
  testSign().then(x => console.log("SENT", x)).catch(err => console.dir("ERROR", err))
})