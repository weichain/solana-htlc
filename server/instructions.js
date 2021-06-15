const solanaWeb3 = require('@solana/web3.js');

const createStorageAccountInstruction = (
  signer,
  appAccount,
  lamports,
  space,
  programId
) => {
  const appPubkey = appAccount.publicKey;

  return new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.createAccount({
      fromPubkey: signer.publicKey,
      newAccountPubkey: appPubkey,
      lamports,
      space,
      programId
    })
  );
};

const createTransactionInstruction = (signer, appAccount, programId, data) => {
  const appAccountPubkey = appAccount.publicKey || appAccount;

  return new solanaWeb3.TransactionInstruction({
    keys: [
      { pubkey: signer.publicKey, isSigner: true, isWritable: true },
      { pubkey: appAccountPubkey, isSigner: false, isWritable: true }
    ],
    programId,
    data
  });
};

const getMoney = (signer, appAccount, seller, programId, data) => {
  const appAccountPubkey = appAccount.publicKey || appAccount;

  return new solanaWeb3.TransactionInstruction({
    keys: [
      { pubkey: signer.publicKey, isSigner: true, isWritable: true },
      { pubkey: appAccountPubkey, isSigner: false, isWritable: true },
      { pubkey: seller, isSigner: false, isWritable: true }
    ],
    programId,
    data
  });
};

module.exports = {
  createStorageAccountInstruction,
  createTransactionInstruction,
  getMoney
};
