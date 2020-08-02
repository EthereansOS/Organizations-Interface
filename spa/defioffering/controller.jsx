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
                    logo: await window.loadLogo(swapCouple.from === wethAddress ? window.voidEthereumAddress : swapCouple.from)
                };
                swapCouple.from.decimals = swapCouple.from.address === wethAddress ? 18 : await window.blockchainCall(swapCouple.from.token.methods.decimals);
                swapCouple.from.name = swapCouple.from.address === wethAddress ? 'Ethereum' : await window.blockchainCall(swapCouple.from.token.methods.name);
                swapCouple.from.symbol = swapCouple.from.address === wethAddress ? 'ETH' : await window.blockchainCall(swapCouple.from.token.methods.symbol);
                swapCouple.to = {
                    address: swapCouple.to,
                    token: window.newContract(window.context.votingTokenAbi, swapCouple.to),
                    logo: await window.loadLogo(swapCouple.to === wethAddress ? window.voidEthereumAddress : swapCouple.to)
                };
                swapCouple.to.decimals = swapCouple.to.address === wethAddress ? 18 : await window.blockchainCall(swapCouple.to.token.methods.decimals);
                swapCouple.to.name = swapCouple.to.address === wethAddress ? 'Ethereum' : await window.blockchainCall(swapCouple.to.token.methods.name);
                swapCouple.to.symbol = swapCouple.to.address === wethAddress ? 'ETH' : await window.blockchainCall(swapCouple.to.token.methods.symbol);
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
        var stakingManager;
        for (var i in json) {
            var element = json[i];
            if (element.name.indexOf('staking.transfer.authorized.') === -1 && element.name.indexOf('authorizedtotransferforstaking_') === -1) {
                continue;
            }
            if (((await window.blockchainCall(context.view.props.element.stateHolder.methods.getBool, element.name)) + '') !== 'true') {
                continue;
            }
            var split = element.name.split('.');
            split.length === 1 && (split = element.name.split('_'));
            stakingManager = window.newContract(window.context.StakeAbi, split[split.length - 1]);
            break;
        }
        if (!stakingManager) {
            return context.view.setState({
                stakingData: {
                    stakingManager,
                    pairs : [],
                    tiers : [],
                    startBlock : 0,
                    blockTiers
                }
            });
        }
        var rawTiers = await window.blockchainCall(stakingManager.methods.tierData);
        var pools = await window.blockchainCall(stakingManager.methods.tokens);
        var startBlock = await window.blockchainCall(stakingManager.methods.startBlock);
        var wethAddress = window.web3.utils.toChecksumAddress(await window.blockchainCall(window.newContract(window.context.uniSwapV2RouterAbi, window.context.uniSwapV2RouterAddress).methods.WETH));
        var pairs = await window.loadTokenInfos(pools, wethAddress);
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
        context.view.setState({
            stakingData: {
                stakingManager,
                pairs,
                tiers,
                startBlock,
                blockTiers
            }
        });
    };
};