var IndexController = function (view) {
    var context = this;
    context.view = view;

    context.tryLoadDFO = async function tryLoadDFO(dFOAddress) {
        if (!isEthereumAddress(dFOAddress)) {
            throw "Insert a valid DFO Address";
        }
        var dFO = window.newContract(window.context.proxyAbi, dFOAddress);
        if (await window.blockchainCall(dFO.methods.getFunctionalitiesAmount) === 0) {
            return "This Address is not a DFO";
        }
        return dFO;
    }
};