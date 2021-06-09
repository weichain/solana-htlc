use crate::error::InstructionError;
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
  account_info::{next_account_info, AccountInfo},
  msg,
  program_error::ProgramError,
};

#[derive(Debug)]
pub enum Instructions {
  SayHello,
  SayGoodbye,
  TransferLamports,
  ParseData,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct State {
  pub text: String,
}

impl Instructions {
  pub fn unpack(input: &[u8], accounts: &[AccountInfo]) -> Result<Self, ProgramError> {
    use InstructionError::NotExistingCase;

    let (&tag, rest) = input.split_first().ok_or(NotExistingCase)?;

    msg!("account {:?}", accounts);

    msg!("tag {:?}", tag);
    msg!("rest {:?}", rest);

    Ok(match tag {
      0 => {
        msg!("say hello");
        Self::SayHello
      }
      1 => {
        msg!("say goodbye");
        Self::SayGoodbye
      }
      2 => {
        msg!("transfer lamports");

        let in_tracking_account = &accounts[0];
        let program_account = &accounts[1];

        msg!("in tracking account, {:?}", in_tracking_account);
        msg!("program account, {:?}", program_account);

        **in_tracking_account.try_borrow_mut_lamports()? -= 1000000000;
        **program_account.try_borrow_mut_lamports()? += 1000000000;

        Self::TransferLamports
      }
      3 => {
        let parsed_data = State::try_from_slice(rest);

        msg!("parsedData {:?}", parsed_data);

        let account_info_iter = &mut accounts.iter();
        let sender = next_account_info(account_info_iter)?;
        let second_account = next_account_info(account_info_iter)?;

        msg!("second_account {:?}", second_account);

        let data = &mut second_account.data.borrow_mut();

        data[..rest.len()].copy_from_slice(&rest);

        Self::ParseData
      }

      _ => return Err(InstructionError::NotExistingCase.into()),
    })
  }
}
