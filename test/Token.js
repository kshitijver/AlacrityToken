var Token = artifacts.require("./AlacrityToken.sol");

contract("AlacrityToken", function(accounts){

	var tokenInstance;

	it("sets the total supply on deployment", function(){
		return Token.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(supply){
			assert.equal(supply.toNumber(),1000000,"sets the total supply correctly");

		});
	});
})