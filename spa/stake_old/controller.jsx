var StakeOldController = function (view) {
    var context = this;
    context.view = view;

    context.slippage = new UniswapFraction(window.context.slippageNumerator, window.context.slippageDenominator);

    context.calculateBalance = async function calculateBalance(i) {
        var firstBalance = await window.blockchainCall(context.view.props.stakingData.mainToken.token.methods.balanceOf, window.walletAddress);
        var secondBalance = (await context.getSecondTokenData(i === undefined ? context.pool.value.split('_')[0] : i)).balance;
        context.view.setState({firstBalance, secondBalance});
    }

    context.calculateApprove = async function calculateApprove(i) {
        var buidlBalance = parseInt(await window.blockchainCall(context.view.props.stakingData.mainToken.token.methods.balanceOf, window.walletAddress));
        var buidlAllowance = parseInt(await window.blockchainCall(context.view.props.stakingData.mainToken.token.methods.allowance, window.walletAddress, context.view.props.stakingData.stakingManager.options.address));
        var approveFirst = buidlAllowance === 0 || buidlAllowance < buidlBalance;
        var approveSecond = false;
        var pool = context.view.props.stakingData.pairs[i];
        if(pool.symbol !== 'ETH') {
            var secondBalance =  parseInt((await context.getSecondTokenData(i)).balance);
            var secondAllowance = parseInt(await window.blockchainCall(pool.token.methods.allowance, window.walletAddress, context.view.props.stakingData.stakingManager.options.address));
            approveSecond = (secondAllowance === 0 || secondAllowance < secondBalance) ? pool.symbol : false;
        }
        context.view.setState({approveFirst, approveSecond});
        context.calculateBalance(i);
        var rewardBalance = parseInt(await window.blockchainCall(context.view.props.stakingData.rewardToken.token.methods.balanceOf, window.walletAddress));
        var rewardAllowance = parseInt(await window.blockchainCall(context.view.props.stakingData.rewardToken.token.methods.allowance, window.walletAddress, context.view.props.stakingData.stakingManager.options.address));
        context.view.setState({rewardApproved : rewardAllowance >= rewardBalance});
    };

    context.approve = async function approve(target) {
        context.view.setState({loadingStake : false, loadingApprove: true});
        try {
            var token = target === 'reward' ? context.view.props.stakingData.rewardToken.token : target === 'mine' ? context.view.props.stakingData.mainToken.token : context.view.props.stakingData.pairs[context.view.pool.value.split('_')[0]].token;
            await window.blockchainCall(token.methods.approve, context.view.props.stakingData.stakingManager.options.address, await window.blockchainCall(token.methods.totalSupply));
            context.calculateApprove(parseInt(context.view.pool.value.split('_')[0]));
        } catch(e) {
        }
        context.view.setState({loadingStake : false, loadingApprove: false});
    };

    context.max = async function max(target, i, tier) {
        var buidlBalance = await window.blockchainCall(context.view.props.stakingData.mainToken.token.methods.balanceOf, window.walletAddress);
        if(target === 'firstAmount') {
            var tierData = (await window.blockchainCall(context.view.props.stakingData.stakingManager.methods.getStakingInfo, tier))[1];
            parseInt(buidlBalance) > parseInt(tierData) && (buidlBalance = tierData);
        }
        buidlBalance = new UniswapFraction(buidlBalance, 1).divide(10 ** 18).toSignificant(6);
        var secondBalance = new UniswapFraction((await context.getSecondTokenData(i = i || 0)).balance, 1).divide(10 ** i === 1 ? 6 : 18).toSignificant(6);
        context.view[target].value = (target === 'firstAmount' ? buidlBalance : secondBalance);
        target === 'firstAmount' && context.calculateReward(tier);
        context.calculateOther(target, i, tier);
    };

    context.changeSecond = async function changeSecond(target, i , tier) {
        var token = context.view.props.stakingData.pairs[i];
        var uniswapV2Pair = await window.blockchainCall(window.uniswapV2Factory.methods.getPair, context.view.props.stakingData.mainToken.address, token.address);
        var secondHasPair = uniswapV2Pair !== window.voidEthereumAddress;
        context.view.setState({secondHasPair});
        secondHasPair && context.calculateOther(target, i, tier);
    };

    context.calculateOther = async function calculateOther(target, i, tier) {
        if(!context.view.state.secondHasPair) {
            var value = new UniswapFraction(window.toDecimals(context.view[target === 'firstAmount' ? 'secondAmount' : 'firstAmount'].value.split(',').join(''), (target === 'firstAmount' ? context.view.props.stakingData.pairs[i] : context.view.props.stakingData.mainToken).decimals));
            target === "firstAmount" && context.calculateReward(tier);
            return value;
        }
        var reserves = await context.calculateReserves((await context.getSecondTokenData(i, true)).token, i);
        var value = reserves[target === 'firstAmount' ? 'secondPerBuidl' : 'buidlPerSecond'].multiply(window.toDecimals(context.view[target].value.split(',').join('') || '0', i === 1 ? context.view.props.stakingData.pairs[i].decimals : context.view.props.stakingData.mainToken.decimals));
        value = new UniswapFraction(value.toSignificant(100).split('.')[0]);
        var otherVal = (target !== 'firstAmount' ? value : value.divide(10 ** context.view.props.stakingData.pairs[i].decimals)).toSignificant(6);
        context.view[target === 'firstAmount' ? 'secondAmount' : 'firstAmount'].value = window.formatMoney(otherVal, otherVal.split('.')[1] && otherVal.split('.')[1].length);
        target === "firstAmount" && context.calculateReward(tier);
        return value;
    };

    context.calculateReserves = async function calculateReserves(secondToken, i) {
        var pair = window.newContract(window.context.uniSwapV2PairAbi, await window.blockchainCall(window.uniswapV2Factory.methods.getPair, context.view.props.stakingData.mainToken.address, secondToken.options.address));
        var buidlPosition  = (await window.blockchainCall(pair.methods.token0)).toLowerCase() === context.view.props.stakingData.mainToken.address.toLowerCase() ? 0 : 1;
        var otherPosition = buidlPosition == 0 ? 1 : 0;
        var reserves = await window.blockchainCall(pair.methods.getReserves);
        var firstDecimals = parseInt(await window.blockchainCall(context.view.props.stakingData.mainToken.token.methods.decimals));
        var secondDecimals = i === 0 ? 18 : parseInt(await window.blockchainCall(secondToken.methods.decimals));
        if(firstDecimals > secondDecimals) {
            var x = firstDecimals - secondDecimals;
            var result = new UniswapFraction(reserves[buidlPosition], 1).divide(10 ** x).toSignificant(6);
            while(result.indexOf('.') !== -1) {
                x--;
                result = new UniswapFraction(reserves[buidlPosition], 1).divide(10 ** x).toSignificant(6);
            }
            reserves[buidlPosition] = result;
        }
        var buidlPerSecond = new UniswapFraction(reserves[buidlPosition], reserves[otherPosition]);
        var secondPerBuidl = new UniswapFraction(reserves[otherPosition], reserves[buidlPosition]);
        return {
            buidlPerSecond,
            secondPerBuidl
        };
    };

    context.calculateReward = function calculateReward(tier) {
        setTimeout(async function() {
            try {
                var tierData = await context.getTierData();
                tierData = [tierData[1][tier], tierData[2][tier], tierData[3][tier]];
                var value = window.web3.utils.toBN(window.toDecimals(context.view.firstAmount.value.split(',').join(''), 18)).mul(window.web3.utils.toBN(tierData[0])).div(window.web3.utils.toBN(tierData[1])).toString();
                context.view.reward.innerText = window.formatMoney(window.fromDecimals(value, context.view.props.stakingData.mainToken.decimals, true), 18);
                var splittedValue = window.web3.utils.toBN(value).div(window.web3.utils.toBN(tierData[2]));
                context.view.splittedReward.innerText = window.formatMoney(window.fromDecimals(splittedValue, context.view.props.stakingData.mainToken.decimals, true), 18);
            } catch(e) {
            }
        });
    };

    context.getSecondTokenData = async function getSecondTokenData(i, tokenOnly) {
        var pool = context.view.props.stakingData.pairs[i];
        var data = {
            token : pool.token,
            balance : tokenOnly === true ? '0' : await (pool.symbol === 'ETH' ? window.web3.eth.getBalance(window.walletAddress) : window.blockchainCall(pool.token.methods.balanceOf, window.walletAddress))
        };
        if(isNaN(parseInt(data.balance))) {
            data.balance = '0';
        }
        return data;
    };

    context.getTierData = async function getTierData() {
        try {
            if(!context.view.tierData) {
                context.view.tierData = await window.blockchainCall(context.view.props.stakingData.stakingManager.methods.tierData);
            }
            return JSON.parse(JSON.stringify(context.view.tierData));
        } catch(e) {
            return [];
        }
    };

    context.stake = async function stake(pool, tier) {
        var firstAmount = window.toDecimals(context.view.firstAmount.value.split(',').join(''), context.view.props.stakingData.mainToken.decimals);
        var stakingInfo = await window.blockchainCall(context.view.props.stakingData.stakingManager.methods.getStakingInfo, tier);
        var buidlBalance = await window.blockchainCall(context.view.props.stakingData.mainToken.token.methods.balanceOf, window.walletAddress);
        if(parseInt(firstAmount) < parseInt(stakingInfo[0])) {
            return alert("Amount to stake is less than the current min cap");
        }
        if(parseInt(firstAmount) > parseInt(stakingInfo[2])) {
            return alert("Amount to stake must be less than the current remaining one");
        }
        if(parseInt(firstAmount) > parseInt(buidlBalance)) {
            return alert(`You don't have enough ${context.view.props.stakingData.mainToken.symbol} balance to stake!`);
        }
        context.view.setState({staked: null, loadingStake : true, loadingApprove: false});
        firstAmount = new UniswapFraction(firstAmount, 1);
        var secondAmount = await context.calculateOther('firstAmount', pool, tier);
        var firstAmountMin = firstAmount.subtract(firstAmount.multiply(context.slippage)).toSignificant(100).split('.')[0];
        var secondAmountMin = secondAmount.subtract(secondAmount.multiply(context.slippage)).toSignificant(100).split('.')[0];
        firstAmount = firstAmount.toSignificant(100).split('.')[0];
        secondAmount = secondAmount.toSignificant(100).split('.')[0];
        if(parseInt(secondAmount) > parseInt(await context.getSecondTokenData(pool)).balance) {
            return alert("You don't have enough " + (context.view.props.stakingData.pairs[pool].symbol) + " balance to stake!");
        }
        var otherTokenAddress = window.web3.utils.toChecksumAddress((await window.blockchainCall(context.view.props.stakingData.stakingManager.methods.tokens))[pool]);
        var eth = otherTokenAddress === window.wethAddress ? secondAmount : undefined;
        var value = otherTokenAddress === window.wethAddress ? '0' : secondAmount;
        try {
            await window.blockchainCall(eth, context.view.props.stakingData.stakingManager.methods.stake, tier, pool + '', firstAmount, firstAmountMin, value, secondAmountMin);
            context.view.setState({staked: {
                amount : context.view.firstAmount.value,
                period : context.view.props.stakingData.tiers[tier].tierKey
            }}, function() {
                context.view.emit('ethereum/ping');
                context.view.emit('staking/refresh');
            });
        } catch(e) {
            (e.message || e).toLowerCase().indexOf('user denied') === -1 && alert(e.message || e);
        }
        context.view.setState({loadingStake : false, loadingApprove: false});
    };

    context.load = async function load() {
        if(!window.walletAddress) {
            return;
        }
        context.view.setState({loadingPosition : true});
        context.view.pool && await context.changeSecond("firstAmount", parseInt(context.view.pool.value.split('_')[0]), context.view.domRoot.children().find('.TimetoStake.SelectedDutrationStake')[0].dataset.tier);
        await context.calculateApprove(parseInt(!context.view.pool ? 0 : context.view.pool.value.split('_')[0]));
        var currentBlock = await window.web3.eth.getBlockNumber();
        var stakingPositions = [];
        for(var tier = 0; tier < context.view.props.stakingData.tiers.length; tier++) {
            var length = parseInt(await window.blockchainCall(context.view.props.stakingData.stakingManager.methods.length, tier));
            for(var i = 0; i < length; i++) {
                var rawStakingInfoData = await window.blockchainCall(context.view.props.stakingData.stakingManager.methods.stakeInfo, tier, i);
                if(window.walletAddress.toLowerCase() !== rawStakingInfoData[0].toLowerCase()) {
                    continue;
                }
                var stakingInfo = {
                    position: i,
                    tier,
                    sender : rawStakingInfoData[0],
                    poolPosition : rawStakingInfoData[1],
                    firstAmount : rawStakingInfoData[2],
                    secondAmount : rawStakingInfoData[3],
                    poolAmount : rawStakingInfoData[4],
                    reward : rawStakingInfoData[5],
                    endBlock : rawStakingInfoData[6],
                    partialRewardBlockTimes : rawStakingInfoData[7],
                    splittedReward : rawStakingInfoData[8],
                    cumulativeReward : '0'
                };
                stakingInfo.poolAmountFromDecimals = new UniswapFraction(stakingInfo.poolAmount, 1).divide(10 ** 18).toSignificant(6);
                stakingInfo.canWithdraw = currentBlock >= parseInt(stakingInfo.endBlock);
                for(var blockTime of stakingInfo.partialRewardBlockTimes) {
                    if(blockTime === '0') {
                        continue;
                    }
                    stakingInfo.nextPartialReward = stakingInfo.nextPartialReward || blockTime;
                    if(currentBlock < parseInt(blockTime)) {
                        continue;
                    }
                    stakingInfo.cumulativeReward = window.web3.utils.toBN(stakingInfo.cumulativeReward).add(window.web3.utils.toBN(stakingInfo.splittedReward)).toString();
                }
                stakingInfo.cumulativeReward = parseInt(stakingInfo.cumulativeReward) > parseInt(stakingInfo.reward) ? stakingInfo.reward : stakingInfo.cumulativeReward;
                await context.loadUniswapPoolAmounts(stakingInfo);
                stakingPositions.push(stakingInfo);
            }
        }
        context.view.setState({loadingPosition : false, stakingPositions});
    };

    context.loadUniswapPoolAmounts = async function loadUniswapPoolAmounts(stakingInfo) {
        var otherTokenAddress = context.view.props.stakingData.pairs[stakingInfo.poolPosition].address;
        var pool = window.newContract(window.context.uniSwapV2PairAbi, await window.blockchainCall(window.uniswapV2Factory.methods.getPair, otherTokenAddress, context.view.props.stakingData.mainToken.address));
        var token0 = await window.blockchainCall(pool.methods.token0);
        var reserves = await window.blockchainCall(pool.methods.getReserves);
        var totalSupply = await window.blockchainCall(pool.methods.totalSupply);
        var percentage = parseInt(stakingInfo.poolAmount) / parseInt(totalSupply);
        var reserve0 = window.numberToString(parseInt(reserves[0]) * percentage).split(',').join('').split('.')[0];
        var reserve1 = window.numberToString(parseInt(reserves[1]) * percentage).split(',').join('').split('.')[0];
        if(token0 === context.view.props.stakingData.mainToken.address) {
            stakingInfo.myBalance = reserve0;
            stakingInfo.otherBalance = reserve1;
        } else {
            stakingInfo.myBalance = reserve1;
            stakingInfo.otherBalance = reserve0;
        }
    };

    context.redeem = async function redeem(e, tier, position) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if($(e.currentTarget).hasClass('NoRedeem')) {
            return;
        }
        await window.blockchainCall(context.view.props.stakingData.stakingManager.methods.partialReward, tier, position);
        context.load();
    }

    context.withdraw = async function withdraw(e, tier, position) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if($(e.currentTarget).hasClass('NoRedeem')) {
            return;
        }
        await window.blockchainCall(context.view.props.stakingData.stakingManager.methods.withdraw, tier, position);
        context.load();
    }

    context.unlock = async function unlock(e, tier, position) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if($(e.currentTarget).hasClass('UnlockButtonDisabled')) {
            return;
        }
        context.view.setState({unlocking : true});
        try {
            await window.blockchainCall(context.view.props.stakingData.stakingManager.methods.unlock, tier, position);
            context.load();
        } catch(e) {
            if((e.message || e).toLowerCase().indexOf('user denied') === -1) {
                alert(`Transaction fail (${e.message || e}), maybe an old version of the Liquidity Mining Contract`);
            }
        }
        context.view.setState({unlocking : false});
    }
};