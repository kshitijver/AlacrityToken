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

	// Approval Event
	event Approval(
		address indexed _owner,
		address indexed _spender,
		uint256 indexed _value
	);

	mapping(address => uint256) public balanceOf;
	mapping(address => mapping(address => uint256)) public allowance;

	constructor (uint256 _initialSupply) {
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

	// Delegated Transfer

	// Approve 
	function approve(address _spender,uint256 _value) public returns (bool success){

		require(msg.sender != _spender);
		require(msg.sender != address(0));
		require(_spender != address(0));

		allowance[msg.sender][_spender] = _value;

		// Trigger approval event
		emit Approval(msg.sender,_spender,_value);

		return true;
	}

	// Transfer From
	function transferFrom(address _from,address _to,uint256 _value) public returns (bool success){
		
		require(balanceOf[_from] >= _value);
		require(allowance[_from][msg.sender] >= _value);
		
		balanceOf[_from] -= _value;
		balanceOf[_to] += _value;
		
		allowance[_from][msg.sender] -= _value;

		// Trigger Transfer event
		emit Transfer(_from,_to,_value);
		
		return true;
	}
}