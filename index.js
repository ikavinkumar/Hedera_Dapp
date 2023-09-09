require("dotenv").config();
const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction } = require("@hashgraph/sdk");

async function main() {
  const client = Client.forTestnet();

  const myAccountId = process.env.MY_ACCOUNT_ID;
  const myPrivateKey = process.env.MY_PRIVATE_KEY;

  client.setOperator(myAccountId, myPrivateKey);

  // Create a new key pair for the new account
  const newAccountPrivateKey = PrivateKey.generate();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  // Create a new account with an initial balance of 1,000 tinybar
  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);

  const getReceipt = await newAccount.getReceipt(client);
  const newAccountId = getReceipt.accountId;

  console.log("New account ID is: " + newAccountId);

  // Transfer 500 tinybar from your account to the new account
  const transferResult = await new TransferTransaction()
    .addHbarTransfer(myAccountId, Hbar.fromTinybars(-500))
    .addHbarTransfer(newAccountId, Hbar.fromTinybars(500))
    .execute(client);

  const transferStatus = (await transferResult.getReceipt(client)).status;

  if (transferStatus.toString() === "SUCCESS") {
    console.log("Transfer successful!");
  } else {
    console.error("Transfer failed with status: " + transferStatus.toString());
  }

  // Check the new account's balance
  const accountBalance = await new AccountBalanceQuery()
    .setAccountId(newAccountId)
    .execute(client);

  console.log("New account balance: " + accountBalance.hbars.toTinybars() + " tinybar");
}

main();
