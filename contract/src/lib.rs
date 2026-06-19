#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum LoanStatus {
    Requested,
    Funded,
    Repaid,
    Defaulted,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Loan {
    pub borrower: Address,
    pub lender: Option<Address>,
    pub token: Address,
    pub amount: i128,
    pub amount_repaid: i128,
    pub interest_rate: u32,
    pub status: LoanStatus,
}

#[contracttype]
pub enum DataKey {
    Loan(u64),
    LoanCount,
}

#[contract]
pub struct UndercollateralizedLending;

#[contractimpl]
impl UndercollateralizedLending {
    pub fn request_loan(
        env: Env,
        borrower: Address,
        token: Address,
        amount: i128,
        interest_rate: u32,
    ) -> u64 {
        borrower.require_auth();
        assert!(amount > 0, "Loan amount must be greater than zero");

        let mut loan_count: u64 = env.storage().persistent().get(&DataKey::LoanCount).unwrap_or(0);
        loan_count += 1;

        let loan = Loan {
            borrower,
            lender: None,
            token,
            amount,
            amount_repaid: 0,
            interest_rate,
            status: LoanStatus::Requested,
        };

        env.storage().persistent().set(&DataKey::Loan(loan_count), &loan);
        env.storage().persistent().set(&DataKey::LoanCount, &loan_count);

        loan_count
    }

    pub fn fund_loan(env: Env, lender: Address, loan_id: u64) {
        lender.require_auth();

        let mut loan: Loan = env
            .storage()
            .persistent()
            .get(&DataKey::Loan(loan_id))
            .expect("Loan does not exist");

        assert!(loan.status == LoanStatus::Requested, "Loan is not in requested state");

        let token_client = token::Client::new(&env, &loan.token);
        token_client.transfer(&lender, &loan.borrower, &loan.amount);

        loan.lender = Some(lender);
        loan.status = LoanStatus::Funded;
        env.storage().persistent().set(&DataKey::Loan(loan_id), &loan);
    }

    pub fn repay_loan(env: Env, borrower: Address, loan_id: u64, payment_amount: i128) {
        borrower.require_auth();

        let mut loan: Loan = env
            .storage()
            .persistent()
            .get(&DataKey::Loan(loan_id))
            .expect("Loan does not exist");

        assert!(loan.status == LoanStatus::Funded, "Loan is not active");
        assert!(payment_amount > 0, "Payment must be greater than zero");

        let lender = loan.lender.clone().expect("Lender not found");

        let interest = (loan.amount * loan.interest_rate as i128) / 10000;
        let total_due = loan.amount + interest;
        let remaining_balance = total_due - loan.amount_repaid;

        let actual_payment = if payment_amount > remaining_balance {
            remaining_balance
        } else {
            payment_amount
        };

        let token_client = token::Client::new(&env, &loan.token);
        token_client.transfer(&borrower, &lender, &actual_payment);

        loan.amount_repaid += actual_payment;

        if loan.amount_repaid >= total_due {
            loan.status = LoanStatus::Repaid;
        }

        env.storage().persistent().set(&DataKey::Loan(loan_id), &loan);
    }
}
