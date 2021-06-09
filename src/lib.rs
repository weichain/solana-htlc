pub mod error;
pub mod instructions;

use crate::{error::InstructionError, instructions::Instructions};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    decode_error::DecodeError,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey, // Public key of the account the hello world program was loaded into
    accounts: &[AccountInfo], // The account to say hello to
    _instruction_data: &[u8], // Ignored, all helloworld instructions are hellos
) -> ProgramResult {
    msg!("data {:?}", _instruction_data);

    let instruction = Instructions::unpack(_instruction_data, accounts)?;

    match instruction {
        Instructions::SayHello => {}
        Instructions::SayGoodbye => {}
        Instructions::TransferLamports => {}
        Instructions::ParseData => {}
    }

    msg!("end");

    Ok(())
}
