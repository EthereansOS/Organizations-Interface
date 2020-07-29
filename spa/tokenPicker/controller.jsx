var TokenPickerController = function (view) {
    var context = this;
    context.view = view;

    context.pairCreatedTopic = window.web3.utils.sha3('PairCreated(address,address,address,uint256)');

    context.loadUniswapPairs = async function loadUniswapPairs(view) {
        var address = view.props.tokenAddress;
        if(address === window.voidEthereumAddress) {
            address = await window.blockchainCall(window.newContract(window.context.uniSwapV2RouterAbi, window.context.uniSwapV2RouterAddress).methods.WETH);
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
        var uniswapPairs = [];
        for (var log of logs) {
            for (var topic of log.topics) {
                if (topic === context.pairCreatedTopic || topic.toLowerCase() === myToken.toLowerCase()) {
                    continue;
                }
                var address = window.web3.utils.toChecksumAddress(window.web3.eth.abi.decodeParameter('address', topic));
                var token = window.newContract(window.context.votingTokenAbi, address);
                uniswapPairs.push({
                    address,
                    token,
                    name: await window.blockchainCall(token.methods.name),
                    symbol: await window.blockchainCall(token.methods.symbol),
                    decimals: await window.blockchainCall(token.methods.decimals),
                    logo: await context.loadLogo(address)
                });
                view.setState({ uniswapPairs });
            }
        }
    };

    context.loadLogo = async function loadLogo(address) {
        address = window.web3.utils.toChecksumAddress(address);
        var logo = address === window.voidEthereumAddress ? 'assets/img/eth-logo.png' : address.toLowerCase() === window.dfoHub.token.options.address.toLowerCase() ? 'assets/img/buidlv2-logo.png' : window.context.trustwalletImgURLTemplate.format(address);
        try {
            await window.AJAXRequest(logo);
        } catch (e) {
            logo = 'assets/img/default-logo.png';
        }
        return logo;
    };
};