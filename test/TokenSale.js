var TokenSale = artifacts.require("./AlacTokenSale.sol");
var Token = artifacts.require("./AlacrityToken.sol");

contract("AlacTokenSale", function(accounts){
	var tokenSaleInstance;
	var tokenInstance;
	var admin = accounts[0];
	var buyer = accounts[1];
	var numberOfTokens;
	var tokensAvailable = 750000;
	var tokenPrice = 1000000000000000;
	// 0.001 ether.
	// In wei - Smallest subdivision of Ether.

	it("initializes the contract with the correct values", function(){
		return TokenSale.deployed().then(function(instance){
			tokenSaleInstance = instance;
			return tokenSaleInstance.address;
		}).then(function(address){
			assert.notEqual(address, 0x0, "has contract address");
			return tokenSaleInstance.tokenContract();
		}).then(function(address){
			assert.notEqual(address, 0x0, "has token contract address");
			return tokenSaleInstance.tokenPrice();
		}).then(function(price){
			assert.equal(price,tokenPrice,"token price is correct");
		});
	});

	it("tests token buying" , function(){
		return Token.deployed().then(function(instance){
			//Grab token instance
			tokenInstance = instance;
			return TokenSale.deployed();
		}).then(function(instance){
			// Then grab the token sale instance
			tokenSaleInstance = instance;
			// Provision 75% of all tokens to the token sale
			return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from : admin});
		}).then(function(receipt){
			numberOfTokens = 10;
			return tokenSaleInstance.buyTokens(numberOfTokens, { from : buyer , value : numberOfTokens*tokenPrice});
		}).then(function(receipt){
			assert.equal(receipt.logs.length,1,"triggers one event");
			assert.equal(receipt.logs[0].event,"Sell","has to be the 'Sell' event");
			assert.equal(receipt.logs[0].args._amount,numberOfTokens,"checks if the numberOfTokens is correct");
			assert.equal(receipt.logs[0].args._buyer,buyer,"checks if the buyer is correct");
			return tokenSaleInstance.tokensSold();
		}).then(function(tokensSold){
			assert.equal(tokensSold, numberOfTokens, "increments the number of tokens sold");
			return tokenInstance.balanceOf(buyer);
		}).then(function(balance){
			assert.equal(balance.toNumber(),numberOfTokens,"increments the balance of the buyer");
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function(balance){
			assert.equal(balance.toNumber(),tokensAvailable-numberOfTokens,"decrements number  of tokens in contract");
			// Try to buy tokens different from the price.
			return tokenSaleInstance.buyTokens(numberOfTokens,{from:buyer,value:1});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, "Reverts if the value is different from the price of tokens");
			return tokenSaleInstance.buyTokens(800000,{from:buyer,value:numberOfTokens*tokenPrice});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, "Reverts if contract does not has the required number of tokens");
		});
	});


	it("ends token sale", function(){
		return Token.deployed().then(function(instance){
			tokenInstance = instance;
			return TokenSale.deployed();
		}).then(function(instance){
			tokenSaleInstance = instance;
			// Try to end sale by account other than the admin
			return tokenSaleInstance.endSale({from : buyer});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, "only admin can end token sale");
			return tokenSaleInstance.endSale({from:admin});
		}).then(function(receipt){
			return tokenInstance.balanceOf(admin);
		}).then(function(balance){
            assert.equal(balance.toNumber(),999990, 'return all unsold token to admin')
            // Check that the contract has no balance
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance){
        	assert.equal(balance.toNumber(),0,"Balance has been reset");
        });
	});
});