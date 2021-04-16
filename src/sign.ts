export type TypedData = Array<Record<string, any>>;
const DOMAIN_TYPE: TypedData = [
  {
    type: "string",
    name: "name"
  },
  {
    type: "string",
    name: "version"
  },
  {
    type: "uint256",
    name: "chainId"
  },
  {
    type: "address",
    name: "verifyingContract"
  }
];

export type DomainData = {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
};

export function createTypeData(
  domainData: DomainData,
  primaryType: string,
  message: any,
  types: Record<string, TypedData>
) {
  return {
    types: Object.assign(
      {
        EIP712Domain: DOMAIN_TYPE
      },
      types
    ),
    domain: domainData,
    primaryType: primaryType,
    message: message
  };
}

export function signTypedData(web3: any, from: string, data: any) {
  const msgData = JSON.stringify(data);
  return new Promise<any>((resolve, reject) => {
    function cb(err: any, result: any) {
      if (err) return reject(err);
      if (result.error) return reject(result.error);
      const sig = result.result;
      const sig0 = sig.substring(2);
      const r = "0x" + sig0.substring(0, 64);
      const s = "0x" + sig0.substring(64, 128);
      const v = parseInt(sig0.substring(128, 130), 16);
      resolve({ data, sig, v, r, s });
    }

  return web3.currentProvider.sendAsync({
      method: "eth_signTypedData_v4",
      params: [from, msgData],
      from
    }, cb);
  })
}

