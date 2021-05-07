import { Part } from "../domain"

export type OrderAssetType = {
	assetClass: string
	data: string
}

export type OrderAsset = {
	assetType: OrderAssetType
	value: string
}

export type Order = {
	maker: string
	makeAsset: OrderAsset
	taker: string
	takeAsset: OrderAsset
	salt: string
	start: string
	end: string
	data: string
	dataType: string
}

export type AssetTypeForm = {
  "assetClass": "ETH"
} | {
  "assetClass": "ERC721"
  contract: string
  tokenId: string
} | {
  "assetClass": "ERC20"
	contract: string
  tokenId: string
} | {
	"assetClass": "ERC1155"
	contract: string
	tokenId: string
}

export type AssetForm = {
	assetType: AssetTypeForm
	value: string
}

export type OrderDataV1Form = {
	dataType: "RARIBLE_V2_DATA_V1",
	payouts: Part[],
	originFees: Part[]
}
export type OrderDataForm = OrderDataV1Form

export type OrderForm = {
	type: "RARIBLE_V1" | "RARIBLE_V2"
	maker: string,
	make: AssetForm,
	taker?: string,
	take: AssetForm,
	salt: string,
	start?: string,
	end?: string,
	data: OrderDataForm,
	signature: string
}
