var QuickScopeController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData(view) {
        view = view || context.view;
        view.setState({list : null, options : null});
        window.quickScopeContract = window.newContract(window.context.QuickScopeABI, window.getNetworkElement("quickScopeAddress"));
        window.wethToken = await window.loadTokenInfos(window.wethAddress);
        var programmableEquities = (await window.AJAXRequest(window.context.programmableEquitiesURL)).tokens;
        window.logos = window.logos || {};
        programmableEquities.forEach(it => window.logos[window.web3.utils.toChecksumAddress(it.address)] = it.logoURI);
        if(!view.mounted) {
            return;
        }
        programmableEquities = programmableEquities.filter(it => it.chainId === window.networkId);
        var addressesForLog = programmableEquities.map(it => window.web3.eth.abi.encodeParameter('address', it.address));
        var start = 0;
        var addressesList = [];
        while(start < addressesForLog.length) {
            var length = start + 20;
            length = length > addressesForLog.length ? addressesForLog.length : length;
            addressesList.push(addressesForLog.slice(start, length));
            start = length;
        }
        var list = {};
        for(var addresses of addressesList) {
            for(var subList of addressesList) {
                var uniswapPairs = await context.loadUniswapPairs(addresses, undefined, subList);
                if(!view.mounted) {
                    return;
                }
                uniswapPairs.forEach(it => list[it.key] = it);
            }
        }
        list = Object.values(list);
        var options = {};
        list.forEach(it => {
            options[it.token0.address] = {
                token: it.token0,
                selected: true
            }
            options[it.token1.address] = {
                token: it.token1,
                selected: true
            }
        })
        view.setState({list, options});
    };

    context.loadUniswapPairs = async function loadUniswapPairs(token, indexes, others) {
        window.pairCreatedTopic = window.pairCreatedTopic || window.web3.utils.sha3('PairCreated(address,address,address,uint256)');
        var myToken = token;
        var address = undefined;
        if(!(token instanceof Array)) {
            address = window.web3.utils.toChecksumAddress(token.address);
            if (address === window.voidEthereumAddress) {
                address = window.wethAddress;
            }
            var myToken = window.web3.eth.abi.encodeParameter('address', address);
        }
        var myTokenForLog = myToken instanceof Array ? myToken : [myToken]
        var topics = [
            window.pairCreatedTopic, myTokenForLog
        ]
        others && topics.push(others);
        var logs = await window.getLogs({
            address: window.context.uniSwapV2FactoryAddress,
            fromBlock: '0',
            topics,
        }); 
        logs.push(...(await window.getLogs({
            address: window.context.uniSwapV2FactoryAddress,
            fromBlock: '0',
            topics: [
                window.pairCreatedTopic, others || [],
                myTokenForLog
            ]
        })));
        var uniswapPairs = [];
        var alreadyAdded = {};
        for (var log of logs) {
            for (var topic of log.topics) {
                if (!(myToken instanceof Array) && (topic === window.pairCreatedTopic || topic.toLowerCase() === myToken.toLowerCase())) {
                    continue;
                }
                var pairTokenAddress = window.web3.utils.toChecksumAddress(window.web3.eth.abi.decodeParameters(['address', 'uint256'], log.data)[0]);
                if (alreadyAdded[pairTokenAddress]) {
                    continue;
                }
                alreadyAdded[pairTokenAddress] = true;
                var pairToken = window.newContract(window.context.uniSwapV2PairAbi, pairTokenAddress);
                var token0 = window.web3.utils.toChecksumAddress(await window.blockchainCall(pairToken.methods.token0));
                var token1 = window.web3.utils.toChecksumAddress(await window.blockchainCall(pairToken.methods.token1));
                pairToken.token0 = token0 === address ? token : await window.loadTokenInfos(token0, undefined, indexes ? true : false);
                pairToken.token1 = token1 === address ? token : await window.loadTokenInfos(token1, undefined, indexes ? true : false);
                pairToken.key = `${token0}_${token1}-${token1}_${token0}`;
                indexes && (indexes[pairToken.key] = pairToken);
                uniswapPairs.push(pairToken);
            }
        }
        return uniswapPairs;
    };
};