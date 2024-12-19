import { getLatestGameIndexFromAdminAccount, getMasterKeypair, welcome } from "./helper";
import { sleep } from "./lib";
import * as anchor from "@coral-xyz/anchor";
import idl from "./data/idl.json";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { getOwnerWallet } from "./lib/wallets";
import { GAME_PROGRAM_ID } from "./const";
import { initializeAdmin, initializeGame } from "./lib/transactions";

console.log(welcome());

// Owner keypair (admin)
const ownerKeypair = getMasterKeypair();

// Owner wallet (admin)
const ownerWallet = getOwnerWallet();

// Set up connection and provider
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const provider = new anchor.AnchorProvider(connection, ownerWallet as any, {
  preflightCommitment: "confirmed",
});

const program = new anchor.Program(idl as anchor.Idl, GAME_PROGRAM_ID, provider);

async function transactions(): Promise<void> {
  try {
    await initializeAdmin(ownerKeypair, program);
    const lastGameIndex = await getLatestGameIndexFromAdminAccount(ownerKeypair.publicKey, program);

    await sleep(2000);
    await initializeGame(ownerKeypair, program, lastGameIndex);
  } catch (error) {
    console.log(error);
  }
}

async function runTransactions(interval: number): Promise<void> {
  await transactions();
  setInterval(async () => {
    await transactions();
  }, interval);
}

runTransactions(30000);
