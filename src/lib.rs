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
    _: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let instruction = Instruction::unpack(_instruction_data, accounts)?;

    match instruction {
        Instruction::Init => {}
        Instruction::Claim => {}
        Instruction::Refund => {}
    }

    Ok(())
}
