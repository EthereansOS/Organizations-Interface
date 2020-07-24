var WalletController = function (view) {
    var context = this;
    context.view = view;

    context.loadWallets = async function loadWallets() {
        window.preloadedTokens = window.preloadedTokens || await window.AJAXRequest('data/walletData.json');
        var network = window.context.ethereumNetwork[window.networkId];
        var tokens = JSON.parse(JSON.stringify(window.preloadedTokens["tokens" + (network || "")]));
        for(var i = 0; i < tokens.length; i++) {
            var token = window.newContract(window.context.votingTokenAbi, tokens[i]);
            tokens[i] = {
                token,
                address : window.web3.utils.toChecksumAddress(tokens[i]),
                name : await window.blockchainCall(token.methods.name),
                symbol : await window.blockchainCall(token.methods.symbol),
                decimals : await window.blockchainCall(token.methods.decimals),
            };
        }
        context.view.props.element !== window.dfoHub && tokens.unshift({
            token : window.dfoHub.token,
            address : window.web3.utils.toChecksumAddress(window.dfoHub.token.options.address),
            name : window.dfoHub.name,
            symbol : window.dfoHub.symbol,
            decimals : window.dfoHub.decimals
        });
        tokens.unshift({
            token : window.newContract(window.context.votingTokenAbi, window.voidEthereumAddress),
            address: window.voidEthereumAddress,
            name: "Ethereum",
            symbol: "ETH",
            decimals: 18
        });
        tokens.unshift({
            token : context.view.props.element.token,
            address : window.web3.utils.toChecksumAddress(context.view.props.element.token.options.address),
            name : context.view.props.element.name,
            symbol : context.view.props.element.symbol,
            decimals : context.view.props.element.decimals,
        });
        context.view.setState({tokens});
        Object.values(window.list).forEach(it => {
            it !== window.dfoHub && it !== context.view.props.element && tokens.push({
                token : it.token,
                address : window.web3.utils.toChecksumAddress(it.token.options.address),
                name: it.name,
                symbol: it.symbol,
                decimals: it.decimals
            });
        });
        context.view.setState({tokens});
        context.calculateAmounts();
    };

    context.calculateAmounts = async function calculateAmounts() {
        var cumulativeAmountDollar = 0;
        var tokens = context.view.state.tokens;
        var ethereumPrice = await window.getEthereumPrice();
        for(var i = 0 ; i < tokens.length; i++) {
            var token = tokens[i];
            token.amount = '0';
            token.amountDollars = 0;
            try {
                token.amount = token.address === window.voidEthereumAddress ? await window.web3.eth.getBalance(context.view.props.element.walletAddress) : await window.blockchainCall(token.token.methods.balanceOf, context.view.props.element.walletAddress);
                token.amountDollars = token.address === window.voidEthereumAddress ? '1' : window.fromDecimals((await window.blockchainCall(window.uniSwapV2Router.methods.getAmountsOut, window.toDecimals('1', token.decimals), [token.address, window.wethAddress]))[1], 18, true);
                token.amountDollars = parseFloat(window.fromDecimals(token.amount, token.decimals, true)) * parseFloat(token.amountDollars) * ethereumPrice;
            } catch(e) {
            }
            cumulativeAmountDollar += token.amountDollars;
            tokens[i] = token;
            context.view.setState({tokens});
        }
        context.view.setState({cumulativeAmountDollar, tokens});
    };
};