import { Horizon } from '@stellar/stellar-sdk';
const server = new Horizon.Server("https://horizon.stellar.org");
async function run() {
  const accountId = "GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD";
  const r = await server.accounts().sponsor(accountId).limit(1).call();
  console.log(r.records);
}
run();
