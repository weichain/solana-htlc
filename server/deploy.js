const { fs } = require('mz');
const path = require('path');
const solanaWeb3 = require('@solana/web3.js');

// for more info check here: https://jamesbachini.com/solana-tutorial/#deploying-a-contract-with-nodejs

const soPath =
  path.resolve('../') +
  '/hello_world/solana-playground/dist/program/helloworld.so';

module.exports = async (connection, signer) => {
  const program = await fs.readFile(soPath);
  const programAccount = new solanaWeb3.Account();

  await solanaWeb3.BpfLoader.load(
    connection,
    signer,
    programAccount,
    program,
    solanaWeb3.BPF_LOADER_PROGRAM_ID
  );

  return {
    programId: programAccount.publicKey
  };
};
