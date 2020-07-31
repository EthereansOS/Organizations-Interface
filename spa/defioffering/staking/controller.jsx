var StakingManagerController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData() {
        if (!context.view.stakeManager) {
            var json = await window.blockchainCall(context.view.props.element.stateHolder.methods.toJSON);
            json = JSON.parse(json.endsWith(',]') ? (json.substring(0, json.lastIndexOf(',]')) + ']') : json);
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
                context.view.stakeManager = window.newContract(window.context.StakeAbi, split[split.length - 1]);
                break;
            }
        }
        if(!context.view.stakeManager) {
            return;
        }
        context.loadStakeManagerData();
    };

    context.loadStakeManagerData = async function loadStakeManagerData() {
        var rawTiers = await window.blockchainCall(context.view.stakeManager.methods.tierData);
        var pools = await window.blockchainCall(context.view.stakeManager.methods.tokens);
        var startBlock = await window.blockchainCall(context.view.stakeManager.methods.startBlock);
        var wethAddress = window.web3.utils.toChecksumAddress(await window.blockchainCall(window.newContract(window.context.uniSwapV2RouterAbi, window.context.uniSwapV2RouterAddress).methods.WETH));
        var pairs = await window.loadTokenInfos(pools, wethAddress);
        for(var i in pairs) {
            pairs[i].amount = await window.blockchainCall(context.view.stakeManager.methods.totalPoolAmount, i);
        }
        var tiers = [];
        for(var i = 0; i < rawTiers[0].length; i++) {
            var tier = {
                blockNumber : rawTiers[0][i],
                percentage : 100 * parseFloat(rawTiers[1][i]) / parseFloat(rawTiers[2][i]),
                splitTranches : rawTiers[3][i],
                time : window.calculateTimeTier(rawTiers[0][i])
            };
            var stakingInfo = await window.blockchainCall(context.view.stakeManager.methods.getStakingInfo, i);
            tier.minCap = stakingInfo[0];
            tier.hardCap = stakingInfo[1];
            tier.remainingToStake = stakingInfo[2];
            tier.staked = window.web3.utils.toBN(tier.hardCap).sub(window.web3.utils.toBN(tier.remainingToStake)).toString()
            tiers.push(tier);
        }
        context.view.setState({pairs, startBlock, tiers});
    };
};