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

        var votingToken = "";
        var stateHolderAddress = "";
        var functionalitiesManagerAddress = "";

        try {
            votingToken = await window.blockchainCall(element.dFO.methods.getToken);
            stateHolderAddress = await window.blockchainCall(element.dFO.methods.getStateHolderAddress);
            functionalitiesManagerAddress = await window.blockchainCall(element.dFO.methods.getMVDFunctionalitiesManagerAddress);
        } catch(e) {
            var delegates = await window.blockchainCall(element.dFO.methods.getDelegates);
            votingToken = delegates[0];
            stateHolderAddress = delegates[2];
            functionalitiesManagerAddress = delegates[4];
        }

        element.token = window.newContract(window.context.votingTokenAbi, votingToken);
        element.stateHolder = window.newContract(window.context.stateHolderAbi, stateHolderAddress);
        element.functionalitiesManager = window.newContract(window.context.functionalitiesManagerAbi, functionalitiesManagerAddress);
        element.name = await window.blockchainCall(element.token.methods.name);
        element.symbol = await window.blockchainCall(element.token.methods.symbol);
        element.totalSupply = await window.blockchainCall(element.token.methods.totalSupply);
        element.decimals = await window.blockchainCall(element.token.methods.decimals);
        element.functionalitiesAmount = parseInt(await window.blockchainCall(element.functionalitiesManager.methods.getFunctionalitiesAmount));
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
            try {
                element.quorum = window.web3.eth.abi.decodeParameter("uint256" , await window.blockchainCall(element.dFO.methods.read, 'getQuorum', '0x'));
            } catch(e) {
                element.quorum = "0";
            }
            try {
                element.surveySingleReward = window.web3.eth.abi.decodeParameter("uint256" , await window.blockchainCall(element.dFO.methods.read, 'getSurveySingleReward', '0x'));
            } catch(e) {
                element.surveySingleReward = "0";
            }
            try {
                element.minimumStaking = window.web3.eth.abi.decodeParameter("uint256" , await window.blockchainCall(element.dFO.methods.read, 'getSurveyMinimumStaking', '0x'));
            } catch(e) {
                element.minimumStaking = "0";
            }
            element.icon = window.makeBlockie(element.dFO.options.address);
            try {
                element.link = window.web3.eth.abi.decodeParameter("string" , await window.blockchainCall(element.dFO.methods.read, 'getLink', '0x'));
            } catch(e) {
            }
            try {
                element.index = window.web3.eth.abi.decodeParameter("uint256" , await window.blockchainCall(element.dFO.methods.read, 'getIndex', '0x'));
            } catch(e) {
            }
            try {
                element !== window.dfoHub && (element.ens = await window.blockchainCall(window.dfoHubENSResolver.methods.subdomain, element.dFO.options.originalAddress));
            } catch(e) {
            }
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