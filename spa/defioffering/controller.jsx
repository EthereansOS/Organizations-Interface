var DeFiOfferingController = function (view) {
    var context = this;
    context.view = view;

    context.loadFixedInflationData = async function loadFixedInflationData() {
        var fixedInflationData = {};
        var uniSwapV2Factory = window.newContract(window.context.uniSwapV2FactoryAbi, window.context.uniSwapV2FactoryAddress);
        var wethAddress = window.web3.utils.toChecksumAddress(await window.blockchainCall(window.newContract(window.context.uniSwapV2RouterAbi, window.context.uniSwapV2RouterAddress).methods.WETH));
        try {
            fixedInflationData.blockLimit = parseInt(await window.blockchainCall(context.view.props.element.stateHolder.methods.getUint256, 'fairInflation.blockLimit'));
            fixedInflationData.swapCouples = [];
            var length = parseInt(await window.blockchainCall(context.view.props.element.stateHolder.methods.getUint256, 'fairInflation.swapCouples.length'));
            for(var i = 0 ; i < length; i++) {
                var swapCouple = {
                    from : window.web3.utils.toChecksumAddress(await window.blockchainCall(context.view.props.element.stateHolder.methods.getAddress, `fairInflation.swapCouples[${i}].from`)),
                    to : window.web3.utils.toChecksumAddress(await window.blockchainCall(context.view.props.element.stateHolder.methods.getAddress, `fairInflation.swapCouples[${i}].to`)),
                    amount : await window.blockchainCall(context.view.props.element.stateHolder.methods.getUint256, `fairInflation.swapCouples[${i}].amount`)
                };
                swapCouple.pairAddress = await window.blockchainCall(uniSwapV2Factory.methods.getPair, swapCouple.from, swapCouple.to);
                swapCouple.from = {
                    address : swapCouple.from,
                    token : window.newContract(window.context.votingTokenAbi, swapCouple.from),
                    logo : await window.loadLogo(swapCouple.from === wethAddress ? window.voidEthereumAddress : swapCouple.from)
                };
                swapCouple.from.decimals = swapCouple.from.address === wethAddress ? 18 : await window.blockchainCall(swapCouple.from.token.methods.decimals);
                swapCouple.from.name = swapCouple.from.address === wethAddress ? 'Ethereum' : await window.blockchainCall(swapCouple.from.token.methods.name);
                swapCouple.from.symbol = swapCouple.from.address === wethAddress ? 'ETH' : await window.blockchainCall(swapCouple.from.token.methods.symbol);
                swapCouple.to = {
                    address : swapCouple.to,
                    token : window.newContract(window.context.votingTokenAbi, swapCouple.to),
                    logo : await window.loadLogo(swapCouple.to === wethAddress ? window.voidEthereumAddress : swapCouple.to)
                };
                swapCouple.to.decimals = swapCouple.to.address === wethAddress ? 18 : await window.blockchainCall(swapCouple.to.token.methods.decimals);
                swapCouple.to.name = swapCouple.to.address === wethAddress ? 'Ethereum' : await window.blockchainCall(swapCouple.to.token.methods.name);
                swapCouple.to.symbol = swapCouple.to.address === wethAddress ? 'ETH' : await window.blockchainCall(swapCouple.to.token.methods.symbol);
                fixedInflationData.swapCouples.push(swapCouple);
            }
        } catch(e) {
            console.error(e);
        }
        context.view.setState({fixedInflationData});
    };
};