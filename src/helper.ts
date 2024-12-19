import { Keypair, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { GAME_PROGRAM_ID } from "./const";

export const welcome = () => {
  return "----[Welcome Mini App Manager]----";
};

export function getMasterKeypair() {
  if (process.env.MASTER_KEYPAIR) {
    const secretKeyArray = process.env.MASTER_KEYPAIR.split(",").map((num) => parseInt(num.trim(), 10));
    const secretKeyUint8Array = Uint8Array.from(secretKeyArray);

    return Keypair.fromSecretKey(secretKeyUint8Array);
  } else {
    throw new Error("MASTER_KEYPAIR not found");
  }
}

export async function findPDAs(adminPubkey: PublicKey, gameCount: number) {
  const [adminAccountPDA] = PublicKey.findProgramAddressSync([Buffer.from("admin"), adminPubkey.toBuffer()], GAME_PROGRAM_ID);
  const [gameAccountPDA] = PublicKey.findProgramAddressSync([Buffer.from("game"), adminPubkey.toBuffer(), new anchor.BN(gameCount).toArrayLike(Buffer, "le", 8)], GAME_PROGRAM_ID);
  const [playersAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("players"), adminPubkey.toBuffer(), new anchor.BN(gameCount).toArrayLike(Buffer, "le", 8)],
    GAME_PROGRAM_ID
  );

  return { adminAccountPDA, gameAccountPDA, playersAccountPDA };
}

export const getLatestGameIndexFromAdminAccount = async (adminPubkey: PublicKey, program: anchor.Program<anchor.Idl>) => {
  const [adminAccount] = PublicKey.findProgramAddressSync([Buffer.from("admin"), adminPubkey.toBuffer()], GAME_PROGRAM_ID);

  const adminAccountData = await program.account.adminAccount.fetch(adminAccount);
  // console.log("Admin account:", adminAccount, BigInt(adminAccountData.gameCount as bigint).toString());

  return Number(adminAccountData.gameCount);
};
