import { Contract, Signer, Provider } from "ethers";
// @ts-ignore
const abi = require("../contractABI.json");

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xa56d021BD48a39ac0beC5Cd80b6Fc3EC817Ee479";
export const CONTRACT_ABI = abi;

export function getContract(signerOrProvider: Signer | Provider) {
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}