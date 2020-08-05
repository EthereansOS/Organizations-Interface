var DeFiOfferingController = function (view) {
    var context = this;
    context.view = view;

    context.loadFixedInflationData = async function loadFixedInflationData() {
        var fixedInflationData = {};
        var uniSwapV2Factory = window.newContract(window.context.uniSwapV2FactoryAbi, window.context.uniSwapV2FactoryAddress);
        try {
            fixedInflationData.blockLimit = parseInt(await window.blockchainCall(context.view.props.element.stateHolder.methods.getUint256, 'fairInflation.blockLimit'));
            fixedInflationData.lastBlock = parseInt(await window.blockchainCall(context.view.props.element.stateHolder.methods.getUint256, 'fairInflation.lastBlock'));
            var currentBlock = parseInt(await window.web3.eth.getBlockNumber());
            fixedInflationData.canRun = (fixedInflationData.blockLimit + fixedInflationData.lastBlock) >= currentBlock;
            fixedInflationData.swapCouples = [];
            var length = parseInt(await window.blockchainCall(context.view.props.element.stateHolder.methods.getUint256, 'fairInflation.swapCouples.length'));
            for (var i = 0; i < length; i++) {
                var swapCouple = {
                    from: window.web3.utils.toChecksumAddress(await window.blockchainCall(context.view.props.element.stateHolder.methods.getAddress, `fairInflation.swapCouples[${i}].from`)),
                    to: window.web3.utils.toChecksumAddress(await window.blockchainCall(context.view.props.element.stateHolder.methods.getAddress, `fairInflation.swapCouples[${i}].to`)),
                    amount: await window.blockchainCall(context.view.props.element.stateHolder.methods.getUint256, `fairInflation.swapCouples[${i}].amount`)
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
                fixedInflationData.swapCouples.push(swapCouple);
            }
        } catch (e) {
            console.error(e);
        }
        context.view.setState({ fixedInflationData });
    };

    context.loadStakingData = async function loadStakingData() {
        context.view.setState({ stakingData: null });
        var blockTiers = {};
        Object.keys(window.context.blockTiers).splice(2, Object.keys(window.context.blockTiers).length).forEach(it => blockTiers[it] = window.context.blockTiers[it]);
        var json = await window.blockchainCall(context.view.props.element.stateHolder.methods.toJSON);
        json = JSON.parse(json.endsWith(',]') ? (json.substring(0, json.lastIndexOf(',]')) + ']') : json);
        var stakingData = [];
        for (var i in json) {
            var element = json[i];
            if (element.name.indexOf('staking.transfer.authorized.') === -1 && element.name.indexOf('authorizedtotransferforstaking_') === -1) {
                continue;
            }
            var split = element.name.split('.');
            split.length === 1 && (split = element.name.split('_'));
            var stakingManager = window.newContract(window.context.StakeAbi, split[split.length - 1]);
            stakingData.push(await context.setStakingManagerData(stakingManager, blockTiers));
        }
        context.view.setState({stakingData, blockTiers});
    };

    context.setStakingManagerData = async function setStakingManagerData(stakingManager, blockTiers) {
        var stakingManagerData = {
            stakingManager,
            blockTiers
        };
        var rawTiers = await window.blockchainCall(stakingManager.methods.tierData);
        var pools = await window.blockchainCall(stakingManager.methods.tokens);
        stakingManagerData.startBlock = await window.blockchainCall(stakingManager.methods.startBlock);
        var pairs = await window.loadTokenInfos(pools, window.wethAddress);
        for (var i in pairs) {
            pairs[i].amount = await window.blockchainCall(stakingManager.methods.totalPoolAmount, i);
        }
        var tiers = [];
        for (var i = 0; i < rawTiers[0].length; i++) {
            var tier = {
                blockNumber: rawTiers[0][i],
                percentage: 100 * parseFloat(rawTiers[1][i]) / parseFloat(rawTiers[2][i]),
                rewardSplitTranche: rawTiers[3][i],
                time: window.calculateTimeTier(rawTiers[0][i]),
                tierKey: window.getTierKey(rawTiers[0][i])
            };
            var stakingInfo = await window.blockchainCall(stakingManager.methods.getStakingInfo, i);
            tier.minCap = stakingInfo[0];
            tier.hardCap = stakingInfo[1];
            tier.remainingToStake = stakingInfo[2];
            tier.staked = window.web3.utils.toBN(tier.hardCap).sub(window.web3.utils.toBN(tier.remainingToStake)).toString()
            tiers.push(tier);
        }
        stakingManagerData.pairs = pairs;
        stakingManagerData.tiers = tiers;
        return stakingManagerData;
    };
};