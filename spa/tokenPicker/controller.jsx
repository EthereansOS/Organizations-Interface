var TokenPickerController = function (view) {
    var context = this;
    context.view = view;

    context.pairCreatedTopic = window.web3.utils.sha3('PairCreated(address,address,address,uint256)');

    context.loadUniswapPairs = async function loadUniswapPairs(view, address) {
        view.address = address;
        view.setState({ uniswapPairs: null, selected: null });
        var wethAddress = await window.blockchainCall(window.newContract(window.context.uniSwapV2RouterAbi, window.context.uniSwapV2RouterAddress).methods.WETH);
        if (address !== view.address) {
            return;
        }
        if (address === window.voidEthereumAddress) {
            view.address = address = wethAddress;
        }
        var myToken = window.web3.eth.abi.encodeParameter('address', address);
        var logs = await window.getLogs({
            address: window.context.uniSwapV2FactoryAddress,
            fromBlock: '0',
            topics: [
                context.pairCreatedTopic,
                [myToken]
            ]
        });
        if (address !== view.address) {
            return;
        }
        var uniswapPairs = [];
        for (var log of logs) {
            for (var topic of log.topics) {
                if (topic === context.pairCreatedTopic || topic.toLowerCase() === myToken.toLowerCase()) {
                    continue;
                }
                var addr = window.web3.utils.toChecksumAddress(window.web3.eth.abi.decodeParameter('address', topic));
                var token = window.newContract(window.context.votingTokenAbi, addr);
                uniswapPairs.push({
                    address: addr,
                    token,
                    name: addr === wethAddress ? 'Ethereum' : await window.blockchainCall(token.methods.name),
                    symbol: addr === wethAddress ? 'ETH' : await window.blockchainCall(token.methods.symbol),
                    decimals: addr === wethAddress ? '18' : await window.blockchainCall(token.methods.decimals),
                    logo: await window.loadLogo(addr === wethAddress ? window.voidEthereumAddress : addr)
                });
                if (address !== view.address) {
                    return;
                }
                view.enqueue(() => view.setState({ uniswapPairs }));
            }
        }
    };
};