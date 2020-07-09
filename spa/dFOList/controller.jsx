var DFOListController = function (view) {
    var context = this;
    context.view = view;

    context.blockSearchSize = 40000;
    context.dfoDeployedEvent = "DFODeployed(address_indexed,address)";
    context.newDfoDeployedEvent = "DFODeployed(address_indexed,address_indexed,address,address)";

    context.loadList = async function loadList(refreshBalances) {
        context.alreadyLoaded = {};
        (context.running = true) && context.loadEvents();
        refreshBalances && context.refreshBalances();
    };

    context.loadEvents = async function loadEvents(topics, toBlock, lastBlockNumber) {
        if (!context.running || toBlock === window.getNetworkElement("deploySearchStart")) {
            delete context.running;
            return context.view.forceUpdate();
        }
        lastBlockNumber = lastBlockNumber || await web3.eth.getBlockNumber();
        toBlock = toBlock || lastBlockNumber;
        var fromBlock = toBlock - context.blockSearchSize;
        var startBlock = window.getNetworkElement("deploySearchStart");
        fromBlock = fromBlock > startBlock ? startBlock : toBlock;
        var newEventLogs = await context.getLogs(fromBlock, toBlock, context.newDfoDeployedEvent);
        var oldEventLogs = await context.getLogs(fromBlock, toBlock, context.dfoDeployedEvent);
        (newEventLogs.length > 0 || oldEventLogs.length > 0) && setTimeout(() => {
            try {
                context.view.forceUpdate();
            } catch (e) {
            }
        });
        setTimeout(() => context.loadEvents(topics, fromBlock, lastBlockNumber));
    }

    context.getLogs = async function getLogs(fromBlock, toBlock, event) {
        var logs = await window.getDFOLogs({
            address: window.dfoHub.dFO.options.allAddresses,
            event,
            fromBlock: '' + fromBlock,
            toBlock: '' + toBlock
        });
        for (var log of logs) {
            if(context.alreadyLoaded[log.data[0].toLowerCase()]) {
                continue;
            }
            context.alreadyLoaded[log.data[0].toLowerCase()] = true;
            var key = log.blockNumber + '_' + log.id;
            !window.list[key] && (window.list[key] = {
                key,
                startBlock: log.blockNumber,
                dFO: await window.loadDFO(log.data[0])
            });
        }
        return logs;
    };

    context.getLatestSearchBlock = function getLatestSearchBlock() {
        return (window.list && Object.keys(window.list).length > 0 && Math.max(...Object.keys(window.list).map(it => parseInt(it.split('_')[0])))) || window.getNetworkElement('deploySearchStart');
    };

    context.updateInfo = async function updateInfo(element) {
        if (!element || element.updating) {
            return;
        }
        element.updating = true;

        var votingTokenAddress;
        var stateHolderAddress;
        var functionalitiesManagerAddress;
        element.walletAddress = element.dFO.options.address;

        try {
            var delegates = await window.blockchainCall(element.dFO.methods.getDelegates);
            votingTokenAddress = delegates[0];
            stateHolderAddress = delegates[2];
            functionalitiesManagerAddress = delegates[4];
            element.walletAddress = delegates[5];
        } catch(e) {
            votingTokenAddress = await window.blockchainCall(element.dFO.methods.getToken);
            stateHolderAddress = await window.blockchainCall(element.dFO.methods.getStateHolderAddress);
            functionalitiesManagerAddress = await window.blockchainCall(element.dFO.methods.getMVDFunctionalitiesManagerAddress);
        }

        element.token = window.newContract(window.context.votingTokenAbi, votingTokenAddress);
        element.name = await window.blockchainCall(element.token.methods.name);
        element.symbol = await window.blockchainCall(element.token.methods.symbol);
        element.totalSupply = await window.blockchainCall(element.token.methods.totalSupply);
        element.decimals = await window.blockchainCall(element.token.methods.decimals);
        element.stateHolder = window.newContract(window.context.stateHolderAbi, stateHolderAddress);
        element.functionalitiesManager = window.newContract(window.context.functionalitiesManagerAbi, functionalitiesManagerAddress);
        element.functionalitiesAmount = parseInt(await window.blockchainCall(element.functionalitiesManager.methods.getFunctionalitiesAmount));
        element.lastUpdate = element.startBlock;
        context.refreshBalances(element);
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
            element.votesHardCap = '0'
            try {
                element.votesHardCap = window.web3.eth.abi.decodeParameter("uint256" , await window.blockchainCall(element.dFO.methods.read, 'getVotesHardCap', '0x'));
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

    context.refreshBalances = async function refreshBalances(element, silent) {
        if(!element) {
            return;
        }
        var ethereumPrice = await window.getEthereumPrice();
        element.balanceOf = await window.blockchainCall(element.token.methods.balanceOf, window.dfoHub.walletAddress);
        element.communityTokens = await window.blockchainCall(element.token.methods.balanceOf, element.walletAddress);
        element.communityTokensDollar = '0';
        element.walletETH = await window.web3.eth.getBalance(element.walletAddress);
        element.walletETHDollar = parseFloat(window.fromDecimals(element.walletETH, 18, true)) * ethereumPrice;
        element.walletBUIDL = await window.blockchainCall(window.dfoHub.token.methods.balanceOf, element.walletAddress);
        element.walletBUIDLDollar = '0';
        element.walletUSDC = '0';
        element.walletUSDCDollar = '0';
        try {
            element.walletUSDC = await window.blockchainCall(window.newContract(window.context.votingTokenAbi, window.getNetworkElement("usdcTokenAddress")).methods.balanceOf, element.walletAddress);
            element.walletUSDCDollar = window.fromDecimals((await window.blockchainCall(window.uniSwapV2Router.methods.getAmountsOut, window.toDecimals('1', 6), [window.getNetworkElement("usdcTokenAddress"), window.wethAddress]))[1], 18, true);
            element.walletUSDCDollar = parseFloat(window.fromDecimals(element.walletUSDC, 6, true)) * parseFloat(element.walletUSDCDollar) * ethereumPrice;
            element.communityTokensDollar = window.fromDecimals((await window.blockchainCall(window.uniSwapV2Router.methods.getAmountsOut, window.toDecimals('1', element.decimals), [element.token.options.address, window.wethAddress]))[1], 18, true);
            element.communityTokensDollar = parseFloat(window.fromDecimals(element.communityTokens, 18, true)) * element.communityTokensDollar * ethereumPrice;
            element.walletBUIDLDollar = window.fromDecimals((await window.blockchainCall(window.uniSwapV2Router.methods.getAmountsOut, window.toDecimals('1', window.dfoHub.decimals), [window.dfoHub.token.options.address, window.wethAddress]))[1], 18, true);
            element.walletBUIDLDollar = parseFloat(window.fromDecimals(element.walletBUIDL, 18, true)) * element.walletBUIDLDollar * ethereumPrice;
        } catch(e) {
        }
        element.walletCumulativeDollar = element.communityTokensDollar + element.walletETHDollar + element.walletUSDCDollar;
        element !== window.dfoHub && (element.walletCumulativeDollar += element.walletBUIDLDollar);
        element.walletCumulativeDollar && (element.walletCumulativeDollar = window.formatMoney(element.walletCumulativeDollar));
        element.walletUSDCDollar && (element.walletUSDCDollar = window.formatMoney(element.walletUSDCDollar));
        element.communityTokensDollar && (element.communityTokensDollar = window.formatMoney(element.communityTokensDollar));
        element.walletETHDollar && (element.walletETHDollar = window.formatMoney(element.walletETHDollar));
        element.walletBUIDLDollar && (element.walletBUIDLDollar = window.formatMoney(element.walletBUIDLDollar));
        element.myBalanceOf = window.walletAddress ? await window.blockchainCall(element.token.methods.balanceOf, window.walletAddress) : '0';
        if(silent === true) {
            return;
        }
        context.view.forceUpdate();
        setTimeout(function () {
            var keys = Object.keys(window.list);
            keys.map(async function (key, i) {
                if (element.key === key) {
                    return;
                }
                var e = window.list[key];
                if (!e.token) {
                    return;
                }
                e.myBalanceOf = window.walletAddress ? await window.blockchainCall(e.token.methods.balanceOf, window.walletAddress) : '0';
                i === keys.length - 1 && context.view.forceUpdate();
            });
        });
    };
};