# Empire of Bits Token Vesting Contract


![image](https://github.com/user-attachments/assets/d041a893-79e6-46cc-9a9f-3a9672c38240)


## Overview

The Empire of Bits Token Vesting Contract is a Solana-based smart contract that enables controlled token distribution through a customizable vesting schedule. This contract allows the Empire of Bits game ecosystem to distribute tokens to team members, investors, and community participants with predefined vesting parameters.

**Token Address:** [aNELVtAqonRbb3WZ4DMLp44tsEwS7LA41r6yjbTr9Yx](https://explorer.solana.com/address/aNELVtAqonRbb3WZ4DMLp44tsEwS7LA41r6yjbTr9Yx?cluster=devnet) (Devnet)

## Features

- **Customizable Vesting Parameters**: Configure start time, cliff period, end time, and token amount
- **Beneficiary Management**: Assign tokens to specific wallet addresses
- **Cliff Period Support**: Lock tokens until the cliff period ends
- **Linear Vesting**: Gradual token release between cliff and end time
- **Admin Controls**: Ability to modify or revoke vesting schedules if needed
- **On-chain Verification**: All vesting data stored transparently on the Solana blockchain

## Use Cases

### Team Token Allocation
Distribute tokens to team members with vesting periods to ensure long-term commitment to the project. For example, allocate 100,000 tokens to a developer that vest over 2 years with a 6-month cliff.

### Investor Distribution
Provide investors with tokens that vest according to investment agreements, ensuring alignment with the project's long-term success.

### Community Rewards
Distribute tokens to community members, players, and contributors with appropriate vesting schedules based on their contributions to the Empire of Bits ecosystem.

### Partner Integrations
Allocate tokens to strategic partners with custom vesting schedules to cement long-term partnerships within the gaming ecosystem.

## How It Works

1. **Create Vesting Schedule**: Admin creates a vesting schedule specifying:
   - Beneficiary wallet address
   - Token amount to be vested
   - Start timestamp
   - Cliff period duration
   - End timestamp

2. **Cliff Period**: Tokens remain locked until the cliff period ends

3. **Linear Vesting**: After the cliff period, tokens are gradually unlocked linearly until the end time

4. **Token Claiming**: Beneficiaries can claim their vested tokens at any time after the cliff period

## Technical Implementation

The vesting contract is implemented as a Solana Program using the Anchor framework. It maintains the following state for each vesting schedule:

- Beneficiary public key
- Token mint address (Empire of Bits token)
- Start timestamp (in seconds)
- Cliff timestamp (in seconds)
- End timestamp (in seconds)
- Total token amount
- Claimed token amount
