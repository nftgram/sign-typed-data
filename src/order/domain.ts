type FeeForm = {
	account: string
	value: string
}

export type OrderAssetType = {
	tp: string
	data: string
}

export type OrderAsset = {
	assetType: OrderAssetType
	amount: string
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
  "@type": "ETH"
} | {
  "@type": "ERC721"
  token: string
  tokenId: string
} | {
  "@type": "ERC20"
  token: string
  tokenId: string
} | {
	"@type": "ERC1155"
	token: string
	tokenId: string
} | {
	"@type": "ERC721_LAZY",
	token: string,
	tokenId: string,
	uri: string,
	creators: string[],
	royalties: FeeForm[],
	signatures: string[]
} | {
	"@type": "ERC1155_LAZY",
	token: string,
	tokenId: string,
	uri: string,
	supply: string,
	creators: string[],
	royalties: FeeForm[],
	signatures: string[]
}

export type AssetEncodedTypeForm = {
	type: string
	data: string
}

export type AssetForm = {
	type: AssetTypeForm
	value: string
}

export type OrderDataV1Form = {
	"@type": "V1",
	beneficiary?: string,
	originFees: FeeForm[]
}
export type OrderDataForm = OrderDataV1Form

export type OrderForm = {
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
