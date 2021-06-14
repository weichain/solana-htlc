use crate::error::InstructionError;

use borsh::{BorshDeserialize, BorshSerialize};
use hex::decode;
use sha2::{Digest, Sha256};
use solana_program::{
  account_info::{next_account_info, AccountInfo},
  program_error::ProgramError,
  sysvar::{clock::Clock, Sysvar},
};

#[derive(Debug)]
pub enum Instruction {
  Init,
  Claim,
  Refund,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Init {
  pub instruction: u8,
  pub buyer: String,
  pub seller: String,
  pub secret_hash: String,
  pub expiration: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Claim {
  pub instruction: u8,
  pub secret: String,
}

impl Instruction {
  pub fn unpack(input: &[u8], accounts: &[AccountInfo]) -> Result<Self, ProgramError> {
    use InstructionError::NotExistingCase;

    let (&instruction, rest) = input.split_first().ok_or(NotExistingCase)?;

    Ok(match instruction {
      0 => {
        let storage_data = Init::try_from_slice(input)?;
        if storage_data.secret_hash.len() < 64 {
          return Err(InstructionError::InvalidSecret.into());
        }
        let account_info_iter = &mut accounts.iter();
        let sender = next_account_info(account_info_iter)?;
        let storage_account = next_account_info(account_info_iter)?;

        let data = &mut &mut storage_account.data.borrow_mut();

        data[..input.len()].copy_from_slice(&input);

        Self::Init
      }
      1 => {
        let account_info_iter = &mut accounts.iter();
        let recipient = next_account_info(account_info_iter)?;
        let storage_account = next_account_info(account_info_iter)?;

        let input_data = Claim::try_from_slice(input)?;
        let storage_data = Init::try_from_slice(&storage_account.data.borrow())?;

        let mut hasher = Sha256::default();
        let message: Vec<u8> = decode(input_data.secret).expect("Invalid Hex String");

        hasher.update(&message);

        let secret_hash: String = format!("{:x}", hasher.finalize());

        if storage_data.secret_hash != secret_hash {
          return Err(InstructionError::InvalidSecret.into());
        }

        let lamports = storage_account.lamports();

        **storage_account.try_borrow_mut_lamports()? -= lamports;
        **recipient.try_borrow_mut_lamports()? += lamports;

        Self::Claim
      }
      2 => {
        let account_info_iter = &mut accounts.iter();
        let signer = next_account_info(account_info_iter)?;
        let storage_account = next_account_info(account_info_iter)?;
        let seller = next_account_info(account_info_iter)?;
        let storage_data = Init::try_from_slice(&storage_account.data.borrow())?;

        let clock = Clock::get()?;

        if (clock.unix_timestamp as u64) < storage_data.expiration {
          return Err(InstructionError::SwapNotExpired.into());
        }

        let lamports = storage_account.lamports();

        **storage_account.try_borrow_mut_lamports()? -= lamports;
        **seller.try_borrow_mut_lamports()? += lamports;

        Self::Refund
      }

      _ => return Err(InstructionError::NotExistingCase.into()),
    })
  }
}
