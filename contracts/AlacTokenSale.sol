pragma solidity >=0.4.22 <0.9.0;

import "./AlacrityToken.sol";

contract AlacTokenSale{

	address admin;
	AlacrityToken public tokenContract;
	uint256 public tokenPrice;
	uint256 public tokensSold;

	// Sell Event
	event Sell(
		address _buyer,
		uint256 _amount
	);

	constructor (AlacrityToken _tokenContract,uint256 _tokenPrice) {
		
		admin = msg.sender;
		tokenContract = _tokenContract;
		tokenPrice = _tokenPrice;
	}

	//multiply
	function multiply(uint x, uint y) internal pure returns (uint z){
		require(y == 0 || (z = x * y) / y == x);
	}

	// Buy tokens
	function buyTokens(uint256 _numberOfTokens) public payable {

		
		require(msg.value == multiply(_numberOfTokens,tokenPrice));

		require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
		// Require that a transaction is successful
		require(tokenContract.transfer(msg.sender,_numberOfTokens));
		
		tokensSold += _numberOfTokens;
		emit Sell(msg.sender,_numberOfTokens);
	}
}