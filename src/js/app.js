App = {
	account: '0x0',
	web3Provider: null,
	contracts: {},
	loading: false,
	tokenPrice: 0,
	tokensSold: 0,
	tokensAvailable: 750000,

	init: function() {
		return App.initWeb3();
	},

	initWeb3: function(){
		if(typeof web3 !== 'undefined'){
			//If a web3 instance is already provided by Meta Mask.
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(web3.currentProvider);
		}
		else{
			//Specify default instance if no web3 instance provided
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
			web3 = new Web3(App.web3Provider);
		}
		return App.initContracts();
	},

	initContracts : function (){
		$.getJSON("AlacTokenSale.json", function(alacTokenSale){
			App.contracts.AlacTokenSale = TruffleContract(alacTokenSale);
			App.contracts.AlacTokenSale.setProvider(App.web3Provider);
			App.contracts.AlacTokenSale.deployed().then(function(alacTokenSale){
				console.log("Token sale address, " ,alacTokenSale.address);
			});
		}).done(function(){
			$.getJSON("AlacrityToken.json", function(alacToken){
				App.contracts.AlacrityToken = TruffleContract(alacToken);
				App.contracts.AlacrityToken.setProvider(App.web3Provider);
				App.contracts.AlacrityToken.deployed().then(function(alacToken){
					console.log("Token address, ",alacToken.address);
				});
				App.listenForEvents();
				return App.render();
			});
		});

	},

	// Listen for events emitted from the contract
	listenForEvents: function(){
		App.contracts.AlacTokenSale.deployed().then(function(instance){
			instance.Sell({},{
				fromBlock: 0,
				toBlock: 'latest',
			}).watch(function(error,event){
				console.log("Sell event triggered", event);
				App.render();
			});
		});
	},

	render: function(){

		if(App.loading){
			return;
		}
		App.loading = true;

		var loader = $('#loader');
		var content = $('#content');

		loader.show();
		content.hide();
		// Load account data
		web3.eth.getCoinbase(function(err,account){
			if(err === null){
				App.account = account;
				$("#accountAddress").html("Your Account: " +account);
			}
		})

		App.contracts.AlacTokenSale.deployed().then(function(instance){
			alacTokenSaleInstance = instance;
			return alacTokenSaleInstance.tokenPrice();
		}).then(function(tokenPrice){
			App.tokenPrice = tokenPrice;
			$('.token-price').html(web3.fromWei(App.tokenPrice , "ether").toNumber());
			return alacTokenSaleInstance.tokensSold();
		}).then(function(tokensSold){
			App.tokensSold = tokensSold.toNumber();
			$('.tokens-sold').html(App.tokensSold);
			$('.tokens-available').html(App.tokensAvailable);

			var progressPercent = (App.tokensSold/App.tokensAvailable) * 100;
			$('#progress').css('width',progressPercent + '%');

			//Load token contract

			App.contracts.AlacrityToken.deployed().then(function(instance){
				alacTokenInstance = instance;
				return alacTokenInstance.balanceOf(App.account);
			}).then(function(bal){
				console.log(bal.toNumber());
				$('.dapp-balance').html(bal.toNumber());

				App.loading = false;
				loader.hide();
				content.show();
			});
		});

	},

	buyTokens: function(){
		console.log('buy tokens triggered');
		event.preventDefault;
		$('#content').hide();
		$('#loader').show();

		var numberOfTokens = $('#numberofTokens').val();
		App.contracts.AlacTokenSale.deployed().then(function(i){;
			return i.buyTokens(numberOfTokens, {from : App.account,
				value : numberOfTokens * App.tokenPrice,
				gas : 500000
			});
		}).then(function(result){
			console.log('tokens bought');
			$('form').trigger('reset') // reset number of tokens in form-input

			//Wait for Sell Event

		})
	}
	
}

$(function() {
	$(window).load(function(){
		App.init();
	});
});