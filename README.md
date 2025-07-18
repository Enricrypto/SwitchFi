Here’s your README with a **Table of Contents** and some common GitHub badges you can customize later (like license and build status). I also added placeholders for screenshots if you want to include visuals.

````markdown
# Uniswap V2 Model

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

---

## Table of Contents

- [Overview](#overview)
- [Contracts](#contracts)
  - [Pair.sol Contract](#pairsol-contract)
  - [Factory.sol Contract](#factorysol-contract)
  - [Router.sol Contract](#routersol-contract)
- [Add Liquidity Flow](#add-liquidity-flow)
- [Remove Liquidity Flow](#remove-liquidity-flow)
- [Multi-hop Swap Flow](#multi-hop-swap-flow)
- [Screenshots](#screenshots)
- [License](#license)

---

## Overview

This project implements core components inspired by the Uniswap V2 decentralized exchange model, including Pair, Factory, and Router contracts that enable liquidity management, token swaps, and pool creation.

---

## Contracts

### Pair.sol Contract
- Manages liquidity for two ERC20 tokens.
- Tracks reserves and enforces the constant product invariant \(x \times y = k\).
- Handles adding/removing liquidity.
- Allows token swaps between the two tokens.

#### Example Swap Flow
A user wants to swap 100 DAI for USDC:

```plaintext
1. User calls the Router: router.swapExactTokensForTokens(...)
2. Router transfers 100 DAI to the Pair contract.
3. Router calls pair.swap(0, amountOutUSDC, to) on the Pair contract.
4. Pair executes the swap.
````

---

### Factory.sol Contract

* Creates pairs of any two ERC20 tokens (sorted by address to avoid duplicates).
* Keeps track of all pairs in a mapping keyed by the token addresses.
* Deploys new Pair contracts using the `create2` opcode.
* Emits an event when a new pair is created.

#### Why use `create2`?

* Deploys contracts with deterministic addresses based on:

  * Deployer’s address (Factory contract)
  * Contract bytecode
  * A salt (unique value)
* Predictable pair addresses allow:

  * Prevention of duplicate pairs
  * Clients and frontends to compute pair addresses before creation
  * Improved security and UX

---

### Router.sol Contract

* Facilitates token swaps between any two ERC20 tokens.
* Routes swaps via direct pairs if they exist.
* Handles liquidity adding/removing (focus on swaps currently).
* Uses Factory contract to find pairs.
* Computes output amounts using the constant product formula.
* Transfers tokens correctly between user, router, and pairs.

#### Swap TokenForToken Flow

```plaintext
1. User calls Router with input token, output token, and amount.
2. Router finds the pair from Factory.
3. Router transfers amountIn of input token from user to the Pair contract.
4. Router calls Pair's swap() specifying amountOut and output token.
5. Pair executes the swap, sending output tokens to user.
6. Router returns the amount out.
```

---

## Add Liquidity Flow

### 1. User Inputs on Frontend

* Selects amount of Token A to add.
* Sets slippage tolerance (e.g., 1%).

### 2. Frontend Fetches Pool Reserves (On-Chain)

```javascript
const [reserve0, reserve1] = await pairContract.getReserves();
const token0 = await pairContract.token0();

let reserveA, reserveB;
if (tokenA.toLowerCase() === token0.toLowerCase()) {
  reserveA = reserve0;
  reserveB = reserve1;
} else {
  reserveA = reserve1;
  reserveB = reserve0;
}
```

### 3. Calculate Required Token B Amount

```javascript
function quote(amountA, reserveA, reserveB) {
  return (amountA * reserveB) / reserveA;
}

const amountBDesired = quote(amountADesired, reserveA, reserveB);
```

### 4. Calculate Minimum Amounts for Slippage Protection

```javascript
const amountAMin = amountADesired * (1 - slippagePercent);
const amountBMin = amountBDesired * (1 - slippagePercent);
```

### 5. Frontend Calls `addLiquidity()` on Router Contract

```javascript
await routerContract.addLiquidity(
  tokenA,
  tokenB,
  amountADesired,
  amountBDesired,
  amountAMin,
  amountBMin,
  userAddress
);
```

---

## Remove Liquidity Flow

### 1. Get User’s LP Token Balance

```javascript
const lpBalance = await pairContract.balanceOf(userAddress);
```

### 2. User Selects Amount to Remove (e.g., 50%)

```javascript
const liquidity = lpBalance.mul(50).div(100); // 50%
```

### 3. Fetch Pool State (Reserves + Total Supply)

```javascript
const [reserve0, reserve1] = await pairContract.getReserves();
const totalSupply = await pairContract.totalSupply();
```

### 4. Normalize Reserves to Token A and Token B

```javascript
const token0 = await pairContract.token0();

const [reserveA, reserveB] = 
  tokenA.toLowerCase() === token0.toLowerCase()
    ? [reserve0, reserve1]
    : [reserve1, reserve0];
```

### 5. Estimate Tokens User Will Receive

```javascript
const amountA = liquidity.mul(reserveA).div(totalSupply);
const amountB = liquidity.mul(reserveB).div(totalSupply);
```

### 6. Apply Slippage Tolerance

```javascript
const amountAMin = amountA.mul(100 - slippageTolerance * 100).div(100);
const amountBMin = amountB.mul(100 - slippageTolerance * 100).div(100);
```

### 7. Approve LP Token Spending

```javascript
await pairContract.approve(routerAddress, liquidity);
```

### 8. Call `removeLiquidity()` on Router Contract

```javascript
await routerContract.removeLiquidity(
  tokenA,
  tokenB,
  liquidity,
  amountAMin,
  amountBMin,
  userAddress
);
```

---

## Multi-hop Swap Flow

### 1. Frontend Interaction

* Input Token: DAI
* Output Token: WETH
* Input Amount: 100 DAI
* Slippage Tolerance: 0.5%
* Swap Route: DAI → USDC → WETH

### 2. Frontend Router Logic

```javascript
const path = [DAI, USDC, WETH];
const amountOut = await router.getAmountsOut(amountIn, path);
const minAmountOut = amountOut * (1 - slippage / 100);
await DAI.approve(routerAddress, amountIn);
```

### 3. User Confirms Swap

```javascript
await router.multiHopSwap(amountIn, minAmountOut, path);
```

### 4. On-Chain Execution

* Router iterates through the swap path.
* Calls `swap` on each Pair contract.
* Sends final output token to the user.
* Emits `MultiSwap(...)` event.

### 5. User Sees Confirmation

* Frontend shows confirmation with the received amount.
* Provides transaction link (e.g., to Etherscan).

---

## Screenshots

<img width="471" height="726" alt="Screenshot 2025-07-18 at 21 35 18" src="https://github.com/user-attachments/assets/7634c4aa-ecba-4ebb-8cab-1ea945b82b52" />
<img width="471" height="728" alt="Screenshot 2025-07-18 at 21 35 30" src="https://github.com/user-attachments/assets/4d69d7eb-c945-4187-8d63-cd48684a47e9" />
<img width="472" height="726" alt="Screenshot 2025-07-18 at 21 35 44" src="https://github.com/user-attachments/assets/37b0775e-37d5-41e7-a32f-fc3ba12570b8" />

---

# Part 1: Contract Deployment

## 1. Deploy the Factory Contract ✔️  
This contract manages creation and storage of all Pools. It includes functions to:  
- Create a new pool  
- Query all existing pools  

## 2. Deploy Test Token Contracts (Factory Tokens) ⏳  
- Basic ERC20 contracts (e.g., TokenA, TokenB, TokenC)  
- Tokens simulate liquidity and enable swapping  
- Include minting functions for testing purposes  

---

# Part 2: Full Project Scope

### Frontend Stack: Next.js + TailwindCSS + wagmi + viem

We will build 4 main pages:

### 1. Create a Pool (Start Here)  
**Features:**  
- Select two tokens from a list (Token A and Token B)  
- Enter initial amounts to create the pool ✔️  
- Button to create the pool by calling the Factory contract ✔️  
- Interface to mint token balances to your wallet (connect wallet and mint TokenA, TokenB, etc) ✔️  

### 2. All Pools Page  
**Features:**  
- List all available pools from the Factory contract ✔️  
Each pool includes buttons to:  
- Add Liquidity: Deposit tokens into the pool  
- Remove Liquidity: Withdraw tokens from the pool  

### 3. Pool Detail Page  
**Features:**  
- View pool info: tokens, reserves, volume ✔️  
- Show user balances for each token in the pool  
- Swap interface:  
  - Enter input amount  
  - Calculate expected output amount (simulation)  
  - Execute the swap  

### 4. Router Page  
**Priority:** Last  
**Features:**  
- Select a token pair  
- Enter input amount  
- Show user’s balance  
- Calculate expected output amount using possible routes  
- Automatically execute the best swap route

---

# Create Pool Page - Checklist

## 1. Token Selection
- Dropdowns to select Token A and Token B ✔️  
- Prevent selecting the same token for both ✔️  
- Display token icons and symbols in the dropdown (optional, user-friendly)  

## 2. Pool Existence Check
- Check if a pool already exists for the selected token pair ✔️  
- Show a warning message if the pool exists  
- Disable or prevent pool creation if pool exists ✔️  

## 3. Create Pool Action
- Button to trigger pool creation ✔️  
- Show spinner or status message while transaction is pending ✔️  
- Handle transaction errors (user rejection, on-chain errors) ✔️  

## 4. Post-Creation Feedback
- Show transaction hash after submission  
- Show toast/message when transaction is confirmed ✔️  
- Redirect to `/pool/[poolAddress]` page after confirmation ✔️  

## 5. User Feedback
- Show appropriate toast messages for:  
  - Wallet not connected ✔️  
  - Same token selected  
  - Pool already exists  
  - Transaction errors  
  - Success  

## 6. Token Minting Panel (Optional)
- UI to mint test tokens (if working on testnet/local dev) ⚠️  
- Token balance display (optional but helpful)  

## 7. Styling & UX
- Responsive design  
- Clear and clean error messages  
- Smooth transitions or status indicators  

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

```


