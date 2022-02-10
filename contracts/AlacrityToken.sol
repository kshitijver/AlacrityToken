pragma solidity >=0.4.22 <0.9.0;

contract AlacrityToken {

	string public name = "AlacToken";
	string public symbol = "Alac";
	string public standard = "Alac Token v1.0";
	uint256 public totalSupply;

	// Transfer Event
	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value
	);

	mapping(address => uint256) public balanceOf;

	constructor (uint256 _initialSupply) public {
		// Allocate the initial supply
		balanceOf[msg.sender] = _initialSupply;
		totalSupply = _initialSupply;
	}

	// Transfer tokens
	function transfer(address _to, uint256 _value) public returns (bool success){

		require(balanceOf[msg.sender] >= _value);
		
		// Add tokens to the receiving account
		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;

		// Trigger transfer event
		emit Transfer(msg.sender,_to,_value);

		return true;
	}
}