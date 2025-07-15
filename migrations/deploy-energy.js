const EnergyCredits = artifacts.require("EnergyCredits");

module.exports = function (deployer) {
    deployer.deploy(EnergyCredits);
};
