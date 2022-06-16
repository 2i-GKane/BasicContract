const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

//Fetch contract bytecode and interface (description of functions)
const { interface, bytecode } = require('../compile.js');

//Create instance of web3 and supply it with the local test net
const web3 = new Web3(ganache.provider());

let accounts;
let contract;

beforeEach(async () => {
    //Contracts are deployed via user transaction
    //fetch all generated accounts from web3
    accounts = await web3.eth.getAccounts();

    //Deploy the contract (provide fresh copy):
    /* 
        - Web3 requires the interface so it knows all info regarding functions
        - The actual deployment requires the bytecode (compiled contract) and the arguments (const params)
        - The send function tells the blockchain who's deploying the contract and how much gas they're
         willing to spend
    */
    contract = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: ['Initial Message']})
        .send({ from: accounts[0], gas: '999999'});

    //console.log(contract);
})

/*
    Every action on the blockchain has some form of delay associated with it, 
    this is why async functions must be used when waiting for a response.
*/

describe('Contract Tests', () => {
    it('Deploys contract to local net', () => {
        /*
            The options propery contains various properties like our interface we provided,
            additional info (constructor arguments provided),
            and the contract's address.

        */
        assert.ok(contract.options.address);
    })

    it('Checks initial message is valid', async () => {
        /*
            Another thing the returned contract object contains is the methods object,
            this object contains a list of all the methods which the contract contains.
        */

        const initalMsg = await contract.methods.message().call();
        assert.equal(initalMsg, "Initial Message");
    })

    it('Checks contract manager address correct', async () => {
        //The manager address should be equal to that of accounts[0], since that's what
        //the contract was deployed with
        const managerAddress = await contract.methods.manager().call();
        assert.equal(managerAddress, accounts[0]);
    })

    it('Checks new message can be set', async () => {
        //When modifying data stored in a smart contract, a transaction needs made.
        await contract.methods.setMessage('Hello World!').send({from: accounts[0]});

        const newMsg = await contract.methods.message().call();
        assert.equal(newMsg, "Hello World!")
    })

    it('Checks that new message can be set using restriced', async () => {
        //Since the first account deployed the contract, and is the manager,
        //msg should successfully update
        await contract.methods.setRestrictedMsg('Restricted Message').send({from: accounts[0]});

        const newMsg = await contract.methods.message().call();
        assert.equal(newMsg, "Restricted Message");
    })

    it('Checks that restriction prevents unauthorised use', async () => {
        //Sending from 2nd account in array shouldn't work, message will remain the same
        await contract.methods.setRestrictedMsg('Restricted Message').send({from: accounts[1]});

        const newMsg = await contract.methods.message().call();
        assert.equal(newMsg, "Initial Message");
    })
})