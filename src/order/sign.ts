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
  message: string,
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
  return web3.currentProvider.sendAsync(
    {
      method: "eth_signTypedData_v3",
      params: [from, msgData],
      from
    },
    function (err: any, result: any) {
      if (err) {
        return console.dir(err);
      } else {
        console.log("1231", result);
      }
    }
  );
}
