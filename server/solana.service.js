const solanaWeb3 = require('@solana/web3.js')
const fs = require('mz/fs')
const path = require('path')
const BufferLayout = require('buffer-layout')
const borsh = require('borsh')

const {
  Template,
  initBuffer,
  initSchema,
  claimBuffer,
  refundBuffer
} = require('./layouts')
const deploy = require('./deploy')
const instructions = require('./instructions')

const RPC_URL_DEV_NET = 'https://api.devnet.solana.com'

;(async () => {
  const filePath = path.join(
    path.resolve(__dirname, '../dist/program') + '/helloworld-keypair.json'
  )

  const keypairString = await fs.readFile(filePath, { encoding: 'utf8' })
  const keypairBuffer = Buffer.from(JSON.parse(keypairString))

  account = new solanaWeb3.Account(keypairBuffer)

  programId = new solanaWeb3.PublicKey(account.publicKey)

  console.log(programId.toString())
})()

const connection = new solanaWeb3.Connection(RPC_URL_DEV_NET, 'confirmed')
const LAMPORTS_PER_SOL = 1000000000

const generateKeypair = async () => {
  const keypair = new solanaWeb3.Keypair()

  await connection.requestAirdrop(keypair.publicKey, 2 * LAMPORTS_PER_SOL)

  return keypair
}

const getBalance = async publicKey => await connection.getBalance(publicKey)

const sendTransaction = async (signer, recepient) => {
  const transfer = solanaWeb3.SystemProgram.transfer({
    fromPubkey: signer.publicKey,
    toPubkey: recepient,
    lamports: LAMPORTS_PER_SOL
  })

  const transaction = new solanaWeb3.Transaction({ signatures: [signer] })

  transaction.add(transfer)

  const tx = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [signer]
  )

  return tx
}

const sendLamportsAndData = async signer => {
  const data = _serializeData()
  const newAccount = solanaWeb3.Keypair.generate()

  const transactionInstruction = new solanaWeb3.TransactionInstruction({
    keys: [
      { pubkey: signer.publicKey, isSigner: true, isWritable: true },
      { pubkey: newAccount.publicKey, isSigner: false, isWritable: true }
    ],
    programId,
    data
  })

  const accountInstruction = _generateProgramAccount(signer, data, newAccount)

  const transaction = new solanaWeb3.Transaction({ signatures: [signer] })

  transaction.add(transactionInstruction)
  transaction.add(accountInstruction)

  const resp = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [signer, newAccount]
  )

  return resp
}

const withdrawFromContractAccount = async signer => {
  const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')])

  const data = Buffer.alloc(1)

  dataLayout.encode(
    {
      instruction: 2
    },
    data
  )

  const accounts = await connection.getProgramAccounts(programId)

  const publicKey = new solanaWeb3.PublicKey(accounts[0].pubkey)

  const transactionInstruction = new solanaWeb3.TransactionInstruction({
    keys: [
      { pubkey: publicKey, isSigner: false, isWritable: true },
      { pubkey: signer.publicKey, isSigner: true, isWritable: true }
    ],
    programId,
    data
  })

  const transaction = new solanaWeb3.Transaction({ signatures: [signer] })

  transaction.add(transactionInstruction)

  const tx = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [signer]
  )

  console.log(tx)

  return tx
}

const sendData = async signer => {
  const { data, dataLayout } = _serializeSimpleData()

  const transactionInstruction = new solanaWeb3.TransactionInstruction({
    keys: [
      { pubkey: signer.publicKey, isSigner: true, isWritable: true },
      { pubkey: newAccount.publicKey, isSigner: false, isWritable: true }
    ],
    programId,
    data: Buffer.from(data)
  })

  const transaction = new solanaWeb3.Transaction({ signatures: [signer] })

  transaction.add(accountInstruction).add(transactionInstruction)

  const tx = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [signer, newAccount]
  )

  console.log(tx)

  return tx
}

const readAccountData = async () => {
  const [firstAccount] = await connection.getProgramAccounts(programId)

  const accountInfo = await connection.getAccountInfo(firstAccount.pubkey)

  return borsh.deserialize(initSchema, Template, accountInfo.data)
}

const calculateLamportsForSpace = async space =>
  await connection.getMinimumBalanceForRentExemption(space)

const init2 = async signer => {
  const appAccount = new solanaWeb3.Account()

  // Here we need to sum Lamports which are payed to store data +
  // Lamports which are locked in the contract
  const systemAccountInstruction = instructions.createStorageAccountInstruction(
    signer,
    appAccount,
    LAMPORTS_PER_SOL,
    initBuffer.length,
    programId
  )

  const transactionInstruction = instructions.createTransactionInstruction(
    signer,
    appAccount,
    programId,
    initBuffer
  )

  const transaction = new solanaWeb3.Transaction({ signatures: [signer] })
    .add(systemAccountInstruction)
    .add(transactionInstruction)

  const tx = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [signer, appAccount]
  )

  console.log(tx)

  return tx
}

const init = async signer => {
  const { programId } = await deploy(connection, signer)

  const lamports = await calculateLamportsForSpace(initBuffer.length)

  const appAccount = new solanaWeb3.Account()

  // Here we need to sum Lamports which are payed to store data +
  // Lamports which are locked in the contract
  const systemAccountInstruction = instructions.createStorageAccountInstruction(
    signer,
    appAccount,
    lamports,
    initBuffer.length,
    programId
  )

  const transactionInstruction = instructions.createTransactionInstruction(
    signer,
    appAccount,
    programId,
    initBuffer
  )

  const transaction = new solanaWeb3.Transaction({ signatures: [signer] })
    .add(systemAccountInstruction)
    .add(transactionInstruction)

  const tx = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [signer, appAccount]
  )

  console.log(tx)

  return tx
}

const withdraw = async (signer, programAddress) => {
  const programId = new solanaWeb3.PublicKey(programAddress)

  const [[firstAccount], { buyer }] = await Promise.all([
    connection.getProgramAccounts(programId),
    readAccountData()
  ])

  console.log('first', firstAccount)
  console.log('buy', buyer)

  const appAccount = new solanaWeb3.PublicKey(firstAccount.pubkey)
  const buyerAccount = new solanaWeb3.PublicKey(buyer)

  const transactionInstruction = instructions.getMoney(
    signer,
    appAccount,
    buyerAccount,
    programId,
    claimBuffer
  )

  const transaction = new solanaWeb3.Transaction({ signatures: [signer] }).add(
    transactionInstruction
  )

  const tx = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [signer]
  )

  console.log(tx)

  return tx
}

const refund = async (signer, programAddress) => {
  const programId = new solanaWeb3.PublicKey(programAddress)

  const [[firstAccount], { seller }] = await Promise.all([
    connection.getProgramAccounts(programId),
    readAccountData()
  ])

  const appAccount = new solanaWeb3.PublicKey(firstAccount.pubkey)
  const sellerAccount = new solanaWeb3.PublicKey(seller)

  const transactionInstruction = instructions.getMoney(
    signer,
    appAccount,
    sellerAccount,
    programId,
    refundBuffer
  )

  const transaction = new solanaWeb3.Transaction({ signatures: [signer] }).add(
    transactionInstruction
  )

  const tx = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [signer]
  )

  console.log(tx)

  return tx
}

module.exports = {
  generateKeypair,
  getBalance,
  sendTransaction,
  sendLamportsAndData,
  withdrawFromContractAccount,
  sendData,
  readAccountData,
  init,
  init2,
  withdraw,
  refund
}
