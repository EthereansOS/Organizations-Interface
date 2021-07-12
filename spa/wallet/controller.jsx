var WalletController = function (view) {
    var context = this;
    context.view = view;

    context.pairCreatedTopic = window.web3.utils.sha3('PairCreated(address,address,address,uint256)');

    context.transferTopic = window.web3.utils.sha3('Transfer(address,address,uint256)');

    context.loadWallets = async function loadWallets() {
        context.view.setState({ tokens: null, cumulativeAmountDollar: null, tokenAmounts: null, loading: true });
        try {
            var tokensList = await window.loadOffChainWallets();
            var tokens = [{
                i: 0,
                address: window.voidEthereumAddress,
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: '18',
                logo: "assets/img/eth-logo.png"
            }];
            Object.values(tokensList).forEach(tokenArray => {
                tokenArray.forEach(it => {
                    try {
                        it.i = tokens.length;
                        tokens.push(it);
                    } catch (e) {
                    }
                });
            });
            context.view.setState({ tokens });
        } catch (e) {
            await window.loadWallets(context.view.props.element, tokens => context.view.setState({ tokens }));
        }
        context.view.state.tokens && context.view.setState({
            tokenAmounts: context.view.state.tokens.map(it => {
                return {
                    i: it.i,
                    amount: '0',
                    amountDollars: 0
                };
            })
        });
        context.view.state.tokens && context.calculateAmounts();
    };

    context.calculateAmounts = async function calculateAmounts() {
        var cumulativeAmountDollar = 0;
        var tokens = (context.view.state && context.view.state.tokens) || [];
        var tokenAmounts = (context.view.state && context.view.state.tokenAmounts) || [];
        var ethereumPrice = await window.getEthereumPrice();
        if (!context.view.mounted) {
            return;
        }
        try {
            tokenAmounts[0].amount = await window.web3.eth.getBalance(context.view.props.element.walletAddress);
            if (!context.view.mounted) {
                return;
            }
        } catch (e) {
            tokenAmounts[0].amount = '0'
        }
        cumulativeAmountDollar += tokenAmounts[0].amountDollars = ethereumPrice * parseFloat(window.fromDecimals(tokenAmounts[0].amount, 18, true));
        var allAddresses = tokens.filter(it => it !== true && it !== false).map(it => window.web3.utils.toChecksumAddress(it.address));
        var addresses = window.toSubArrays(allAddresses);
        for (var address of addresses) {
            var logs = await window.getLogs({
                address,
                topics: [
                    context.transferTopic,
                    [],
                    window.web3.eth.abi.encodeParameter("address", context.view.props.element.walletAddress)
                ],
                fromBlock: context.view.props.element.startBlock,
                toBlock: 'latest'
            });
            if (!context.view.mounted) {
                return;
            }
            var onlyUnique = function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            };
            var involvedAddresses = logs.map(it => window.web3.utils.toChecksumAddress(it.address)).filter(onlyUnique);
            for (var involvedAddress of involvedAddresses) {
                if (!context.view.mounted) {
                    return;
                }
                var token = tokens.filter(it => it !== true && it !== false && window.web3.utils.toChecksumAddress(it.address) === involvedAddress)[0];
                var tokenAmount = tokenAmounts[token.i];
                try {
                    tokenAmount.amount = token.address === window.voidEthereumAddress ? await window.web3.eth.getBalance(context.view.props.element.walletAddress) : await window.blockchainCall(token.token.methods.balanceOf, context.view.props.element.walletAddress);
                    if (!context.view.mounted) {
                        return;
                    }
                    tokenAmount.amountDollars = token.address === window.voidEthereumAddress ? '1' : window.fromDecimals((await window.blockchainCall(window.uniswapV2Router.methods.getAmountsOut, window.toDecimals('1', token.decimals), [token.address, window.wethAddress]))[1], 18, true);
                    if (!context.view.mounted) {
                        return;
                    }
                    tokenAmount.amountDollars = parseFloat(window.fromDecimals(tokenAmount.amount, token.decimals, true)) * parseFloat(tokenAmount.amountDollars) * ethereumPrice;
                } catch (e) {
                }
                cumulativeAmountDollar += tokenAmount.amountDollars;
                context.view.setState({ cumulativeAmountDollar, tokenAmounts });
            }
        }
        context.view.setState({ cumulativeAmountDollar, tokenAmounts, loading: false });
    };
};