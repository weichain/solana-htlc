const { fs } = require('mz')
const path = require('path')
const solanaWeb3 = require('@solana/web3.js')
const program = require('./bytecode')

module.exports = async (connection, signer) => {
  const programAccount = new solanaWeb3.Keypair()

  await solanaWeb3.BpfLoader.load(
    connection,
    signer,
    programAccount,
    program,
    solanaWeb3.BPF_LOADER_PROGRAM_ID
  )

  return {
    programId: programAccount.publicKey
  }
}
