const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractPath = path.resolve(__dirname, 'contracts', 'Message.sol');
const contractSrc = fs.readFileSync(contractPath, 'utf8');

const compiledContract = solc.compile(contractSrc, 1);
//console.log(compiledContract);

module.exports = compiledContract.contracts[':Message'];