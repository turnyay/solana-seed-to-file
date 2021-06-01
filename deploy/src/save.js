import fs from 'mz/fs';
import {url, urlTls} from './util/url';
import dotenv from 'dotenv';
import {mnemonicToSeed, getAccountFromSeed} from './util/wallet';

import {
  Connection
} from '@solana/web3.js';

/**
 * Connection to the network
 */
let connection;

/**
 * Account to save file for
 */
let account;

/**
 * Establish a connection to the cluster
 */
export async function establishConnection() {
  connection = new Connection(url, 'recent');
  const version = await connection.getVersion();
  console.log('Connection to cluster established:', url, version);
}

async function setAccount() {
    let mnemonic = process.env.ACCOUNT_SEED != undefined ?
           process.env.ACCOUNT_SEED :
           "";
    let derivationPath = process.env.DERIVATION_PATH != undefined ?
          process.env.DERIVATION_PATH :
          "bip44Change";
    let seed = await mnemonicToSeed(mnemonic);
    account = getAccountFromSeed(Buffer.from(seed, 'hex'), 0, derivationPath);

    console.log("Using account", account.publicKey.toBase58());
}

async function saveFile() {
    let data = Uint8Array.from(account.secretKey).toString();
    fs.writeFileSync("keypair.json", "[" + data + "]");
}

async function main() {
    try {

        dotenv.config()

        await establishConnection();

        await setAccount();

        await saveFile();

    } catch (err) {
        console.log(err);
    }
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .then(() => process.exit());
