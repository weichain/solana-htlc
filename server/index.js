const express = require('express');
const sha256 = require('crypto-js/sha256');
const hex = require('crypto-js/enc-hex');

const solana = require('./solana.service');

const app = express();
const router = express.Router();

app.listen(4000, () => 'Server is running on port 4000');

let firstKeyPair, secondKeyPair;

router.get('/generate-account', async (req, res) => {
  [firstKeyPair, secondKeyPair] = await Promise.all([
    solana.generateKeypair(),
    solana.generateKeypair()
  ]);

  res.send({
    firstPublicKey: firstKeyPair.publicKey.toString(),
    secondPublicKey: secondKeyPair.publicKey.toString()
  });
});

router.get('/account-balance', async (req, res) => {
  const firstBalance = await solana.getBalance(firstKeyPair.publicKey);
  const secondBalance = await solana.getBalance(secondKeyPair.publicKey);

  res.send({
    firstBalance: firstBalance.toString(),
    secondBalance: secondBalance.toString()
  });
});

router.get('/send-transaction', async (req, res) => {
  const tx = await solana.sendTransaction(
    firstKeyPair,
    secondKeyPair.publicKey
  );

  res.send({
    tx: `https://explorer.solana.com/tx/${tx}?cluster=devnet`
  });
});

router.get('/say-hello', async (req, res) => {
  const tx = await solana.sendLamportsAndData(firstKeyPair);

  res.send({
    tx: `https://explorer.solana.com/tx/${tx}?cluster=devnet`
  });
});

router.get('/contract-accounts', async (req, res) => {
  const tx = await solana.withdrawFromContractAccount(firstKeyPair);

  res.send({
    tx: `https://explorer.solana.com/tx/${tx}?cluster=devnet`
  });
});

router.get('/send-data', async (req, res) => {
  const tx = await solana.sendData(firstKeyPair);

  res.send({
    tx: `https://explorer.solana.com/tx/${tx}?cluster=devnet`
  });
});

router.get('/get-data', async (req, res, next) => {
  const data = await solana.readAccountData(next);

  res.send(data);
});

router.get('/init', async (req, res) => {
  const tx = await solana.init2(firstKeyPair);

  res.send({
    tx: `https://explorer.solana.com/tx/${tx}?cluster=devnet`
  });
});

router.get('/withdraw', async (req, res) => {
  const tx = await solana.withdraw(
    secondKeyPair,
    '5AcEJaqV4XhdBPdo19bMtBMwEzKhKd1pb8HRiKNvUeh9'
  );

  res.send({
    tx: `https://explorer.solana.com/tx/${tx}?cluster=devnet`
  });
});

router.get('/refund', async (req, res) => {
  const tx = await solana.refund(
    firstKeyPair,
    'CT2yxpy616ZmuXqKegyWVH68PTjTTmwHrz4CHHHtrsVD'
  );

  res.send({
    tx: `https://explorer.solana.com/tx/${tx}?cluster=devnet`
  });
});

app.use(router);
