use num_derive::FromPrimitive;
use solana_program::{decode_error::DecodeError, program_error::ProgramError};
use thiserror::Error;

#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum InstructionError {
    #[error("Not Existing Case")]
    NotExistingCase,
    #[error("Invalid Secret")]
    InvalidSecret,
    #[error("Swap is not expired")]
    SwapNotExpired,
}

impl From<InstructionError> for ProgramError {
    fn from(e: InstructionError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl<T> DecodeError<T> for InstructionError {
    fn type_of() -> &'static str {
        "InstructionError"
    }
}
