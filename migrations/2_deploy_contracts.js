const AlacrityToken = artifacts.require("AlacrityToken");
const AlacTokenSale = artifacts.require("AlacTokenSale");

module.exports = function (deployer) {
  deployer.deploy(AlacrityToken, 1000000).then(function(){
    // Token price is 0.001 ether.
    var tokenPrice = 1000000000000000;
    return deployer.deploy(AlacTokenSale,AlacrityToken.address,tokenPrice);
  });
};