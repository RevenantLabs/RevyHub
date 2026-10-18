import {Account,Keypair,TransactionBuilder,Operation,Asset,Networks} from "@stellar/stellar-sdk";import {Buffer} from "buffer";
const account=Keypair.fromRawEd25519Seed(Buffer.alloc(32,11)).publicKey();
export const envelope=new TransactionBuilder(new Account(account,"1"),{fee:"100",networkPassphrase:Networks.TESTNET}).addOperation(Operation.payment({destination:account,asset:Asset.native(),amount:"1"})).setTimeout(0).build().toXDR();
export const sample = {mode:"SHA-256",encoding:"UTF-8",value:"abc",network:"Testnet",passphrase:""};
