var TokenSale = artifacts.require("./AlacTokenSale.sol");

contract("AlacTokenSale", function(accounts){
	var tokenSaleInstance;

	it("initializes the contract with the correct values", function(){
		return TokenSale.deployed().then(function(instance){
			tokenSaleInstance = instance;
			return tokenSaleInstance.address;
		}).then(function(address){
			assert.notEqual(address, 0x0, "has contract address");
			return tokenSaleInstance.tokenContract();
		}).then(function(address){
			assert.notEqual(address, 0x0, "has token contract address");
		});
	});
});