import { sleep } from "./index";
import * as anchor from "@coral-xyz/anchor";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { findPDAs } from "../helper";

export async function initializeAdmin(owner: Keypair, program: anchor.Program<anchor.Idl>) {
  const { adminAccountPDA } = await findPDAs(owner.publicKey, 0);

  const adminAccountData = await program.account.adminAccount.fetch(adminAccountPDA);
  if (adminAccountData) {
    console.log("Admin already initialized.");
    return;
  }

  console.log("Initializing Admin...");
  await program.methods
    .initializeAdmin()
    .accounts({
      adminAccount: adminAccountPDA,
      admin: owner.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([owner])
    .rpc();
  console.log("Admin Initialized at", adminAccountPDA.toString());
}

export const initializeGame = async (owner: Keypair, program: anchor.Program<anchor.Idl>, gameCount: number) => {
  const { adminAccountPDA, gameAccountPDA, playersAccountPDA } = await findPDAs(owner.publicKey, gameCount);

  // Here we use owner's public key as fee_account for simplicity
  const feeAccount = owner.publicKey;

  console.log("Initializing Game...");
  await program.methods
    .initializeGame(feeAccount)
    .accounts({
      adminAccount: adminAccountPDA,
      playersAccount: playersAccountPDA,
      game: gameAccountPDA,
      admin: owner.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([owner])
    .rpc();

  console.log("Game Initialized at", gameAccountPDA.toString());
};
