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
		});
	});

	it("approves tokens for delegated transfers", function(){
		return Token.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1],100);
		}).then(function(success){
			assert.equal(success,true,"it returns true value");
			return tokenInstance.approve(accounts[1],100,{from:accounts[0]});
		}).then(function(receipt){
			assert.equal(receipt.logs.length,1,"triggers one event");
			assert.equal(receipt.logs[0].event,"Approval","ha to be an approval event");
			assert.equal(receipt.logs[0].args._owner,accounts[0],"logs the account the tokens are authorized by");
			assert.equal(receipt.logs[0].args._spender,accounts[1],"logs the account the tokens are authorized to");
			assert.equal(receipt.logs[0].args._value,100,"checks the transfer amount");
			return tokenInstance.allowance(accounts[0],accounts[1]);
		}).then(function(allowance){
			assert.equal(allowance.toNumber(),100,"spender account has been approved by the owner");
		});
	});

	it("handles delegated token transfer",function(){
		return Token.deployed().then(function(instance){
			tokenInstance = instance;
			fromAccount = accounts[2];
			toAccount = accounts[3];
			spendingAccount = accounts[4];
			// Transfer some tokens to fromAccount
			return tokenInstance.transfer(fromAccount,100,{from:accounts[0]});
		}).then(function(receipt){
			// Approve spendingAccount to spend 10 tokens from fromAccount
			return tokenInstance.approve(spendingAccount,10,{from:fromAccount});
		}).then(function(receipt){
			//Try transferring something larger than the sender's balance
			return tokenInstance.transferFrom(fromAccount,toAccount,9999,{from:spendingAccount});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, "cannot transfer amount larger than balance");
			// Try transferring something larger than the allowed amount
			return tokenInstance.transferFrom(fromAccount,toAccount,15,{from:spendingAccount});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, "cannot transfer amount larger than approved amount");
			return tokenInstance.transferFrom.call(fromAccount,toAccount,10,{from:spendingAccount});
		}).then(function(success){
			assert.equal(success,true);
			return tokenInstance.transferFrom(fromAccount,toAccount,10,{from:spendingAccount});
		}).then(function(receipt){
			assert.equal(receipt.logs.length,1,"triggers one event");
			assert.equal(receipt.logs[0].event,"Transfer","has to be 'Transfer' event");
			assert.equal(receipt.logs[0].args._from,fromAccount,"Logs the  account the tokens are transfered from");
			assert.equal(receipt.logs[0].args._to,toAccount,"Logs the  account the tokens are transfered to");
			assert.equal(receipt.logs[0].args._value,10,"Logs the transfer amount");
			return tokenInstance.balanceOf(fromAccount);
		}).then(function(balance) {
			assert.equal(balance.toNumber(),90,"balance was deducted from 'fromAccount'");
			return tokenInstance.balanceOf(toAccount);
		}).then(function(balance){
			assert.equal(balance.toNumber(),10,"updates the balance of 'toAccount'");
			return tokenInstance.allowance(fromAccount,spendingAccount);
		}).then(function(allowance){
			assert.equal(allowance.toNumber(),0,"decrements the allowance by _value");
		});
	})
});