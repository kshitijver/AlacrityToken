var Token = artifacts.require("./AlacrityToken.sol");

contract("AlacrityToken", function(accounts){

	var tokenInstance;

	it("initializes the contract with the correct values", function(){
		return Token.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name){
			assert.equal(name, "AlacToken", "gives the correct name");
			return tokenInstance.symbol();
		}).then(function(symbol){
			assert.equal(symbol, "Alac", "gives the right symbol");
			return tokenInstance.standard();
		}).then(function(standard){
			assert.equal(standard,"Alac Token v1.0","has the correct standard");
		});
	});

	it("sets the initial supply on deployment", function(){
		return Token.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(supply){
			assert.equal(supply.toNumber(),1000000,"sets the total supply correctly");
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance){
			assert.equal(adminBalance.toNumber(), 1000000, "allocated the initial supply of tokens to the admin");
		});
	});

	it("transfers token ownership",function(){
		return Token.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.transfer.call(accounts[1],99999999999999);
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, "error message must have revert");
			return tokenInstance.transfer(accounts[1],250000,{from:accounts[0]});
		}).then(function(receipt){
			assert.equal(receipt.logs.length,1,"triggers one event");
			assert.equal(receipt.logs[0].event,"Transfer","has to be a transfer event");
			assert.equal(receipt.logs[0].args._from,accounts[0],"correct sender account");
			assert.equal(receipt.logs[0].args._to,accounts[1],"correct receiving account");
			assert.equal(receipt.logs[0].args._value,250000,"correct value transfered");
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance){
			assert.equal(balance.toNumber(),250000,"adds the transfered tokens to the receiving account");
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance){
			assert.equal(balance.toNumber(),750000,"balance of sending account goes down by the correct amount");
		})
	})
});