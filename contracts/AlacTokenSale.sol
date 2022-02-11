pragma solidity >=0.4.22 <0.9.0;

import "./AlacrityToken.sol";

contract AlacTokenSale{

	address admin;
	AlacrityToken public tokenContract;
	uint256 public tokenPrice;

	constructor (AlacrityToken _tokenContract,uint256 _tokenPrice) public {
		
		admin = msg.sender;
		tokenContract = _tokenContract;
		tokenPrice = _tokenPrice;
	}
}