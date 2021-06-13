import { createTypeData, getAccount, signTypedData } from "../sign"
import { ERC1155Types, ERC721Types, LazyMint } from "./domain"
import { client } from "../script"
import { Part } from "../domain"

async function generateTokenId(type: "ERC721" | "ERC1155", minter: string): Promise<string> {
	console.log("generating tokenId for", getAddress(type), minter)
	const res = await client.get(`/protocol/v0.1/ethereum/nft/collections/${getAddress(type)}/generate_token_id?minter=${minter}`)
	return res.data.tokenId
}

async function putLazyMint(form: LazyMint) {
	const res = await client.post("/protocol/v0.1/ethereum/nft/mints", form)
	return res.data
}

export async function signAndPutLazyMint(form: Omit<LazyMint, "signatures">): Promise<any> {
	const signed = await signLazyMint(form)
	return putLazyMint(signed)
}

async function signLazyMint(form: Omit<LazyMint, "signatures">): Promise<LazyMint> {
	const signature = await signLazyMintMessage(
		form,
		form.creators[0].account,
		4,
		getAddress(form["@type"])
	);
	return { ...form, signatures: [signature] } as any
}

function getAddress(type: "ERC721" | "ERC1155"): string {
	return type === "ERC721" ? "0x6ede7f3c26975aad32a475e1021d8f6f39c89d82" : "0x1AF7A7555263F275433c6Bb0b8FdCD231F89B1D7"
}

async function signLazyMintMessage(
	form: Omit<LazyMint, "signatures">,
	account: string,
	chainId: number,
	verifyingContract: string
) {
	const typeName = form["@type"] === "ERC721" ? "Mint721" : "Mint1155"
	const data = createTypeData(
		{
			name: typeName,
			version: "1",
			chainId,
			verifyingContract
		},
		typeName,
		{ ...form, tokenURI: form.uri },
		form["@type"] === "ERC721" ? ERC721Types : ERC1155Types
	);
	console.log("signing", data)
	return signTypedData(account, data);
}

export async function createTestLazyMint(): Promise<Omit<LazyMint, "signatures">> {
	const creator = await getAccount()
	const tokenId = await generateTokenId("ERC721", creator)
	const queryString = window.location.search
	const urlParams = new URLSearchParams(queryString)
	const uri = await urlParams.get('ipfs')
	const royalty = await urlParams.get('royalty')
	var royalties:Part[] = []
	if (!royalty) {
		royalties = []
	} else {
		royalties = [{ account: creator, value: royalty }]
	}
	if (!uri) {
		throw "No IPFS in params";
	}
	return {
		"@type": "ERC721",
		contract: getAddress("ERC721"),
		tokenId: tokenId,
		uri: uri,
		creators: [{ account: creator, value: "10000" }],
		royalties: royalties,
	}
}

export async function testSignAndCreateLazyMint(): Promise<any> {
	const form = await createTestLazyMint()
	return await signAndPutLazyMint(form)
}
