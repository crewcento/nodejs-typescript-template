import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair, clusterApiUrl, SystemProgram } from "@solana/web3.js";
// import idl from "./idl.json";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

const testUser1 = Keypair.fromSecretKey(bs58.decode("3YJCxzAmeMZ1gy8RABpvoQbwHiuXNgTCQcK1LjxTwtTdZ28XvheNq1XaJ36Zm1gPVwT4tpGQeTdh73fzjUuKgQXj"));

// Use testUser1 as the wallet for player actions
const userWallet = {
  publicKey: testUser1.publicKey,
  signTransaction: async (tx: anchor.web3.Transaction) => {
    tx.partialSign(testUser1);
    return tx;
  },
  signAllTransactions: async (txs: anchor.web3.Transaction[]) => {
    txs.forEach((tx) => tx.partialSign(testUser1));
    return txs;
  },
};

export function getOwnerWallet() {
  const secretKeyString = process.env.MASTER_KEYPAIR;

  if (secretKeyString) {
    const secretKeyArray = secretKeyString.split(",").map((num) => parseInt(num.trim(), 10));
    const secretKeyUint8Array = Uint8Array.from(secretKeyArray);
    const owner = Keypair.fromSecretKey(secretKeyUint8Array);

    return {
      publicKey: owner.publicKey,
      signTransaction: async (tx: anchor.web3.Transaction) => {
        tx.partialSign(owner);
        return tx;
      },
      signAllTransactions: async (txs: anchor.web3.Transaction[]) => {
        txs.forEach((tx) => tx.partialSign(owner));
        return txs;
      },
    };
  } else {
    throw new Error("MASTER_KEYPAIR not found.");
  }
}
