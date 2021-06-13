import Web3 from "web3"
import 'regenerator-runtime/runtime'
import axios from "axios"
import { testSignAndCreateLazyMint } from "./lazy-mint/script"
import { createAndSignOrder } from "./order/script"

const provider = (window as any).ethereum
export const web3 = new Web3(provider)

export const client = axios.create({
	baseURL: "https://api-staging.rarible.com",
})

// @ts-ignore
const contractInput: HTMLInputElement = document.getElementById("contract")
// @ts-ignore
const tokenIdInput: HTMLInputElement = document.getElementById("tokenId")
// @ts-ignore
const priceInput: HTMLInputElement = document.getElementById("price")

provider.enable().then(
	testSignAndCreateLazyMint()
	.then(x => {
		console.log("SENT", x)
		// @ts-ignore
		createAndSignOrder(x.contract, x.tokenId)
			.then(x => console.log("SENT", x))
			.catch(err => console.error("ERROR", err))
	})
	.catch(err => console.error("ERROR", err))
)
