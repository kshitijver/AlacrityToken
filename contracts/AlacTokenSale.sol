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
		
		require(tokenContract.transfer(msg.sender,_numberOfTokens));
		
		tokensSold += _numberOfTokens;
		emit Sell(msg.sender,_numberOfTokens);
	}

	// Ending the Alac Token Sale
	function endSale() public {
		
		require(msg.sender == admin);
		require(tokenContract.transfer(admin,tokenContract.balanceOf(address(this))));

		selfdestruct(payable(address(this)));
	}
}