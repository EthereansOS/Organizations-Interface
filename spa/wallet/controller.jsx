var WalletController = function (view) {
    var context = this;
    context.view = view;

    context.pairCreatedTopic = window.web3.utils.sha3('PairCreated(address,address,address,uint256)');

    context.loadWallets = async function loadWallets() {
        try {
            var onTokesList = function(tokensList) {
                var tokens = [];
                Object.values(tokensList).forEach(it => tokens.push(...it));
                context.view.setState({tokens : tokens});
            };
            await window.loadOnChainWallets(context.view, onTokesList);
        } catch (e) {
            await window.loadWallets(context.view.props.element, tokens => context.view.setState({ tokens }));
        }
        context.calculateAmounts();
    };

    context.calculateAmounts = async function calculateAmounts() {
        var cumulativeAmountDollar = 0;
        var tokens = (context.view.state && context.view.state.tokens) || [];
        var ethereumPrice = await window.getEthereumPrice();
        if(!context.view.mounted) {
            return;
        }
        for (var i = 0; i < tokens.length; i++) {
            if(!context.view.mounted) {
                return;
            }
            var token = tokens[i];
            if(token === true || token === false) {
                continue;
            }
            token.amount = '0';
            token.amountDollars = 0;
            try {
                token.amount = token.address === window.voidEthereumAddress ? await window.web3.eth.getBalance(context.view.props.element.walletAddress) : await window.blockchainCall(token.token.methods.balanceOf, context.view.props.element.walletAddress);
                if(!context.view.mounted) {
                    return;
                }
                token.amountDollars = token.address === window.voidEthereumAddress ? '1' : window.fromDecimals((await window.blockchainCall(window.uniSwapV2Router.methods.getAmountsOut, window.toDecimals('1', token.decimals), [token.address, window.wethAddress]))[1], 18, true);
                if(!context.view.mounted) {
                    return;
                }
                token.amountDollars = parseFloat(window.fromDecimals(token.amount, token.decimals, true)) * parseFloat(token.amountDollars) * ethereumPrice;
            } catch (e) {
            }
            cumulativeAmountDollar += token.amountDollars;
            tokens[i] = token;
            context.view.setState({ tokens });
        }
        context.view.setState({ cumulativeAmountDollar, tokens });
    };
};