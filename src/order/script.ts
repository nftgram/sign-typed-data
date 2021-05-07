import { Order, OrderForm } from "./domain"
import { createTypeData, getAccount, signTypedData } from "../sign"
import { client } from "../script"

const orderTypes = {
	AssetType: [
		{ name: 'assetClass', type: 'bytes4' },
		{ name: 'data', type: 'bytes' },
	],
	Asset: [
		{ name: 'assetType', type: 'AssetType' },
		{ name: 'value', type: 'uint256' },
	],
	Order: [
		{ name: 'maker', type: 'address' },
		{ name: 'makeAsset', type: 'Asset' },
		{ name: 'taker', type: 'address' },
		{ name: 'takeAsset', type: 'Asset' },
		{ name: 'salt', type: 'uint256' },
		{ name: 'start', type: 'uint256' },
		{ name: 'end', type: 'uint256' },
		{ name: 'dataType', type: 'bytes4' },
		{ name: 'data', type: 'bytes' },
	],
}

async function signOrderMessage(
	order: Order,
	account: string,
	chainId: number,
	verifyingContract: string,
) {
	const data = createTypeData(
		{
			name: "Exchange",
			version: "2",
			chainId,
			verifyingContract,
		},
		"Order",
		order,
		orderTypes,
	)
	console.log("signing", data)
	return signTypedData(account, data)
}

async function prepareOrderMessage(form: Omit<OrderForm, "signature">): Promise<Order> {
	const res = await client.post<Order>("/protocol/v0.1/ethereum/order/encoder/order", form)
	return res.data
}

function createOrder(
	maker: string, contract: string, tokenId: string, price: string,
): Omit<OrderForm, "signature"> {
	return {
		type: "RARIBLE_V2",
		maker: maker,
		make: {
			"assetType": {
				"assetClass": "ERC721",
				"contract": contract,
				"tokenId": tokenId,
			},
			"value": "1",
		},
		take: {
			"assetType": {
				"assetClass": "ETH",
			},
			"value": price,
		},
		data: {
			"dataType": "RARIBLE_V2_DATA_V1",
			"payouts": [],
			"originFees": [],
		},
		salt: `${random(1, 10000)}`,
	}
}

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min

async function putOrder(order: OrderForm) {
	const res = await client.post("/protocol/v0.1/ethereum/order/orders", order)
	return res.data
}

async function signOrderForm(form: Omit<OrderForm, "signature">): Promise<OrderForm> {
	const order = await prepareOrderMessage(form)
	const signature = await signOrderMessage(
		order,
		order.maker,
		4,
		"0x1e1B6E13F0eB4C570628589e3c088BC92aD4dB45",
	)
	return { ...form, signature }
}

export async function createAndSignOrder(contract: string, tokenId: string, price: string) {
	const maker = await getAccount()
	return signAndPut(createOrder(maker, contract, tokenId, price))
}

async function signAndPut(notSignedOrderForm: Omit<OrderForm, "signature">) {
	const signed = await signOrderForm(notSignedOrderForm)
	return putOrder(signed)
}
