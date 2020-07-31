var WalletController = function (view) {
    var context = this;
    context.view = view;

    context.pairCreatedTopic = window.web3.utils.sha3('PairCreated(address,address,address,uint256)');

    context.loadWallets = async function loadWallets() {
        await window.loadWallets(context.view.props.element, tokens => context.view.setState({tokens}));
        context.calculateAmounts();
    };

    context.calculateAmounts = async function calculateAmounts() {
        var cumulativeAmountDollar = 0;
        var tokens = (context.view.state && context.view.state.tokens) || [];
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
            token.logo = await window.loadLogo(token.address);
            tokens[i] = token;
            context.view.setState({tokens});
        }
        context.view.setState({cumulativeAmountDollar, tokens});
    };
};