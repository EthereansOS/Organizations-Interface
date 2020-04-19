var DFOListController = function (view) {
    var context = this;
    context.view = view;

    context.blockSearchSize = 40000;
    context.dfoDeployedEvent = "DFODeployed(address_indexed,address)";

    context.loadList = async function loadList(refreshBalances) {
        (context.running = true) && context.loadEvents();
        refreshBalances && context.refreshBalances();
    };

    context.loadEvents = async function loadEvents(topics, fromBlock, lastBlockNumber) {
        if (!context.running || (lastBlockNumber && lastBlockNumber === fromBlock)) {
            delete context.running;
            return context.view.forceUpdate();
        }
        fromBlock = fromBlock || context.getLatestSearchBlock();
        lastBlockNumber = lastBlockNumber || await web3.eth.getBlockNumber();
        var toBlock = fromBlock + context.blockSearchSize;
        toBlock = toBlock > lastBlockNumber ? lastBlockNumber : toBlock;
        var logs = await window.getDFOLogs({
            address: window.dfoHub.dFO.options.allAddresses,
            event: context.dfoDeployedEvent,
            fromBlock: '' + fromBlock,
            toBlock: '' + toBlock
        });
        for (var i in logs) {
            var log = logs[i];
            var key = log.blockNumber + '_' + log.id;
            !window.list[key] && (window.list[key] = {
                key,
                startBlock: log.blockNumber,
                dFO: await window.loadDFO(log.data[0])
            });
        }
        logs.length > 0 && setTimeout(() => {
            try {
                context.view.forceUpdate();
            } catch (e) {
            }
        });
        setTimeout(() => context.loadEvents(topics, toBlock, lastBlockNumber));
    }

    context.getLatestSearchBlock = function getLatestSearchBlock() {
        return (window.list && Object.keys(window.list).length > 0 && Math.max(...Object.keys(window.list).map(it => parseInt(it.split('_')[0])))) || window.getNetworkElement('deploySearchStart');
    };

    context.updateInfo = async function updateInfo(element) {
        if (!element || element.updating) {
            return;
        }
        element.updating = true;

        element.token = window.newContract(window.context.votingTokenAbi, await window.blockchainCall(element.dFO.methods.getToken));
        element !== window.dfoHub && (element.stateHolder = window.newContract(window.context.stateHolderAbi, await window.blockchainCall(element.dFO.methods.getStateHolderAddress)));
        element.name = await window.blockchainCall(element.token.methods.name);
        element.symbol = await window.blockchainCall(element.token.methods.symbol);
        element.totalSupply = await window.blockchainCall(element.token.methods.totalSupply);
        element.decimals = await window.blockchainCall(element.token.methods.decimals);
        element.functionalitiesAmount = parseInt(await window.blockchainCall(element.dFO.methods.getFunctionalitiesAmount));
        element.lastUpdate = element.startBlock;
        element.balanceOf = await window.blockchainCall(element.token.methods.balanceOf, window.getNetworkElement('dfoAddress'));
        element.communityTokens = await window.blockchainCall(element.token.methods.balanceOf, element.dFO.options.address);
        element.myBalanceOf = !window.walletAddress ? 0 : await window.blockchainCall(element.token.methods.balanceOf, window.walletAddress);
        element.minimumBlockNumberForEmergencySurvey = '0';
        element.emergencySurveyStaking = '0';

        setTimeout(async function () {
            try {
                element.minimumBlockNumberForEmergencySurvey = window.web3.eth.abi.decodeParameter("uint256" , await window.blockchainCall(element.dFO.methods.read, 'getMinimumBlockNumberForEmergencySurvey', '0x')) || '0';
                element.emergencySurveyStaking = window.web3.eth.abi.decodeParameter("uint256" , await window.blockchainCall(element.dFO.methods.read, 'getEmergencySurveyStaking', '0x')) || '0';
            } catch(e) {
            }
            element.minimumStaking = parseInt(await window.blockchainCall(element.stateHolder.methods.getUint256, 'minimumStaking'));
            element.surveySingleReward = await window.blockchainCall(element.stateHolder.methods.getUint256, 'surveySingleReward');
            element.quorum = await window.blockchainCall(element.stateHolder.methods.getUint256, 'quorum');

            element.icon = window.makeBlockie(element.dFO.options.address);
            element.link = await window.blockchainCall(element.stateHolder.methods.getString, 'link');
            element.index = await window.blockchainCall(element.stateHolder.methods.getUint256, 'index');
            element.index = element.index !== '0' ? element.index : window.defaultDFOIndex;
            element !== window.dfoHub && (element.ens = await window.blockchainCall(window.dfoHubENSResolver.methods.subdomain, element.dFO.options.originalAddress));
            element.ens = element.ens || '';
            try {
                context && context.view && setTimeout(function() {
                    context.view.forceUpdate();
                });
            } catch (e) {
            }
        }, 300);
        return element;
    };

    context.refreshBalances = async function refreshBalances(element) {
        element && (element.balanceOf = await window.blockchainCall(element.token.methods.balanceOf, window.getNetworkElement('dfoAddress')));
        element && (element.communityTokens = await window.blockchainCall(element.token.methods.balanceOf, element.dFO.options.address));
        window.walletAddress && element && (element.myBalanceOf = await window.blockchainCall(element.token.methods.balanceOf, window.walletAddress));
        element && context.view.forceUpdate();
        setTimeout(function () {
            var keys = Object.keys(window.list);
            keys.map(async function (key, i) {
                if (element && element.key === key) {
                    return;
                }
                var e = window.list[key];
                if (!e.token) {
                    return;
                }
                e.myBalanceOf = await window.blockchainCall(e.token.methods.balanceOf, window.walletAddress);
                i === keys.length - 1 && context.view.forceUpdate();
            });
        });
    };
};