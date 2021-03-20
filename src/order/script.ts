
import Web3 from "web3";
import 'regenerator-runtime/runtime'
import { createTypeData, signTypedData } from "./sign";

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
  order: any,
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

const createTestOrder = (maker: string) => ({
  maker: maker,
  make: {
    type: {
      token: "0x25646B08D9796CedA5FB8CE0105a51820740C049",
      tokenId:
        "53721905486644660545161939638297855196812841812707644157952069735379309525090",
      "@type": "ERC721"
    },
    value: 1
  },
  take: {
    type: { "@type": "ETH" },
    value: "500000000000000000"
  },
  salt: 1,
  data: {
    beneficiary: "0x0000000000000000000000000000000000000000",
    originFees: [],
    "@type": "V1"
  }
});
async function testSign() {
  const [maker] = await web3.eth.getAccounts();
  return signOrderMessage(
    web3,
    createTestOrder(maker),
    maker,
    4,
    "0x43162023C187662684abAF0b211dCCB96fa4eD8a"
  );
}

testSign().then(console.log).catch(console.log);

document.getElementById("connect")?.addEventListener("click", (e) => {
  e.preventDefault()
  provider.enable();
})

document.getElementById("dotests")?.addEventListener("click", (e) => {
  e.preventDefault()
  testSign()
})