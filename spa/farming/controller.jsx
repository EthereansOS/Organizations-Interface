var FarmingController = function (view) {
    var context = this;
    context.view = view;

    context.loadFixedInflationData = async function loadFixedInflationData() {
        context.view.setState({ fixedInflationData: null });
        var fixedInflationData = {};
        var dfoCore = {
            async loadDeployedFixedInflationContracts() {
            },
            deployedFixedInflationContracts: []
        }
        var json = await window.blockchainCall(context.view.props.element.stateHolder.methods.toJSON);
        json = JSON.parse(json.endsWith(',]') ? (json.substring(0, json.lastIndexOf(',]')) + ']') : json);
        var deployedFixedInflationContractsExtensions = json.map(it => it.name).filter(it => it.startsWith('fixedinflation.authorized.')).map(it => window.web3.utils.toChecksumAddress(it.split('fixedinflation.authorized.').join('')));
        for (var extensionAddress of deployedFixedInflationContractsExtensions) {
            var extension = window.newContract(window.context.FixedInflationExtensionABI, extensionAddress);
            var data = await window.blockchainCall(extension.methods.data);
            dfoCore.deployedFixedInflationContracts.push({ address: data[0] });
        }
        context.view.setState({ fixedInflationData, dfoCore });
    };

    context.loadFixedInflationDataOld = async function loadFixedInflationDataOld() {
        context.view.setState({ fixedInflationData: null });
        var fixedInflationData = {};
        var uniSwapV2Factory = window.newContract(window.context.uniSwapV2FactoryAbi, window.context.uniSwapV2FactoryAddress);
        try {
            fixedInflationData.blockLimit = parseInt(await window.blockchainCall(context.view.props.element.stateHolder.methods.getUint256, 'fixedInflation.blockLimit'));
            fixedInflationData.lastBlock = parseInt(await window.blockchainCall(context.view.props.element.stateHolder.methods.getUint256, 'fixedInflation.lastBlock'));
            fixedInflationData.nextBlock = fixedInflationData.blockLimit + fixedInflationData.lastBlock;
            var currentBlock = parseInt(await window.web3.eth.getBlockNumber());
            fixedInflationData.canRun = currentBlock >= fixedInflationData.nextBlock;
            fixedInflationData.swapCouples = [];
            var length = parseInt(await window.blockchainCall(context.view.props.element.stateHolder.methods.getUint256, 'fixedInflation.swapCouples.length'));
            var swapCouples = [];
            for (var i = 0; i < length; i++) {
                swapCouples.push(context.loadSwapCouple(uniSwapV2Factory, i));
            }
            fixedInflationData.swapCouples = await Promise.all(swapCouples);
        } catch (e) {
            console.error(e);
        }
        context.view.setState({ fixedInflationData });
    };

    context.loadSwapCouple = async function loadSwapCouple(uniSwapV2Factory, i) {
        var swapCouple = {
            from: window.web3.utils.toChecksumAddress(await window.blockchainCall(context.view.props.element.stateHolder.methods.getAddress, `fixedInflation.swapCouples[${i}].from`)),
            to: window.web3.utils.toChecksumAddress(await window.blockchainCall(context.view.props.element.stateHolder.methods.getAddress, `fixedInflation.swapCouples[${i}].to`)),
            amount: await window.blockchainCall(context.view.props.element.stateHolder.methods.getUint256, `fixedInflation.swapCouples[${i}].amount`)
        };
        swapCouple.pairAddress = await window.blockchainCall(uniSwapV2Factory.methods.getPair, swapCouple.from, swapCouple.to);
        swapCouple.from = {
            address: swapCouple.from,
            token: window.newContract(window.context.votingTokenAbi, swapCouple.from),
            logo: await window.loadLogo(swapCouple.from === window.wethAddress ? window.voidEthereumAddress : swapCouple.from)
        };
        swapCouple.from.decimals = swapCouple.from.address === window.wethAddress ? 18 : await window.blockchainCall(swapCouple.from.token.methods.decimals);
        swapCouple.from.name = swapCouple.from.address === window.wethAddress ? 'Ethereum' : await window.blockchainCall(swapCouple.from.token.methods.name);
        swapCouple.from.symbol = swapCouple.from.address === window.wethAddress ? 'ETH' : await window.blockchainCall(swapCouple.from.token.methods.symbol);
        swapCouple.to = {
            address: swapCouple.to,
            token: window.newContract(window.context.votingTokenAbi, swapCouple.to),
            logo: await window.loadLogo(swapCouple.to === window.wethAddress ? window.voidEthereumAddress : swapCouple.to)
        };
        swapCouple.to.decimals = swapCouple.to.address === window.wethAddress ? 18 : await window.blockchainCall(swapCouple.to.token.methods.decimals);
        swapCouple.to.name = swapCouple.to.address === window.wethAddress ? 'Ethereum' : await window.blockchainCall(swapCouple.to.token.methods.name);
        swapCouple.to.symbol = swapCouple.to.address === window.wethAddress ? 'ETH' : await window.blockchainCall(swapCouple.to.token.methods.symbol);
        return swapCouple;
    };

    context.loadStakingData = async function loadStakingData() {
        context.view.setState({ stakingData: null });
        context.view.setState(await window.loadStakingData(context.view.props.element, true));
    };

    context.loadOldStakingData = async function loadOldStakingData() {
        context.view.setState({ loadingOldStakingData: true });
        var data = await window.loadStakingData(context.view.props.element, false);
        data.loadingOldStakingData = null;
        data.oldStakingData = data.stakingData;
        delete data.stakingData;
        context.view.setState(data);
    };
};