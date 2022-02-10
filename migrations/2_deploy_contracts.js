const AlacrityToken = artifacts.require("AlacrityToken");

module.exports = function (deployer) {
  deployer.deploy(AlacrityToken);
};