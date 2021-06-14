pub mod error;
pub mod instruction;

use crate::instruction::Instruction;
use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, pubkey::Pubkey,
};

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey, // Public key of the account the hello world program was loaded into
    accounts: &[AccountInfo], // The account to say hello to
    _instruction_data: &[u8], // Ignored, all helloworld instructions are hellos
) -> ProgramResult {
    let instruction = Instruction::unpack(_instruction_data, accounts)?;

    match instruction {
        Instruction::Init => {}
        Instruction::Claim => {}
        Instruction::Refund => {}
    }

    Ok(())
}
