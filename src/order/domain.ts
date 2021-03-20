export type AssetType = {
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
	"type": "ERC1155"
	token: string
	tokenId: string
}

export type EncodedAsset = {
	type: string
	data: string
}

export type Asset = {
  type: EncodedAsset,
  value: string
}

export type OrderNotSigned = {
	maker: string
	make: Asset
	taker: string
	take: Asset
	salt: string
	start: string
	end: string
	data: string
	type: string
}