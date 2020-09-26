var PairChooserController = function (view) {
    var context = this;
    context.view = view;

    context.retrieveTokenT = function retrieveTokenT() {
        return new Promise(async function(ok) {
            var tokenT = (context.view.state && context.view.state.tokenT) || context.view.props.tokenT || window.wethToken;
            context.view.setState({tokenT}, function() {
                ok(tokenT);
            });
        });
    };

    context.setPair = async function setPair(token0, token1, selection) {
        context.view.setState({ pair: null });
        if (!token0 || !token1) {
            return;
        }
        var pairTokenAddress = await window.blockchainCall(window.uniswapV2Factory.methods.getPair, token0, token1);
        var pairToken = await window.newContract(window.context.uniSwapV2PairAbi, pairTokenAddress);
        token0 = window.web3.utils.toChecksumAddress(await window.blockchainCall(pairToken.methods.token0));
        token1 = window.web3.utils.toChecksumAddress(await window.blockchainCall(pairToken.methods.token1));
        token0 = await window.loadTokenInfos(token0);
        token1 = await window.loadTokenInfos(token1);
        context.view.setState({
            pair: {
                pairToken,
                token0,
                token1
            },
            selection: selection || context.view.state.selection || "token0"
        }, context.recalculateRoutesAndPrices);
    };

    context.recalculateRoutesAndPrices = async function recalculateRoutesAndPrices(pair, selection, tokenGAmountIn) {
        if(!pair) {
            context.checkApproveAndBalances();
            var input = context.view.amount.value.split(',').join('');
            context.recalculateRoutesAndPrices(context.view.state.pair, 'token0', window.toDecimals(input, context.view.state.pair.token0.decimals));
            return context.recalculateRoutesAndPrices(context.view.state.pair, 'token1', window.toDecimals(input, context.view.state.pair.token1.decimals));
        }
        if(!tokenGAmountIn || isNaN(parseInt(tokenGAmountIn)) || parseInt(tokenGAmountIn) <= 0) {
            return;
        }
        var path = [
            pair[selection].address,
            pair[selection === 'token0' ? 'token1' : 'token0'].address
        ];
        var tokenLAmountIn = (await window.blockchainCall(window.uniswapV2Router.methods.getAmountsOut, tokenGAmountIn, path))[1];
        path[0] = path[1];
        path[1] = (await context.retrieveTokenT()).address;
        var tokenTAmountIn = (await window.blockchainCall(window.uniswapV2Router.methods.getAmountsOut, tokenLAmountIn, path))[1];
        path[0] = path[1];
        path[1] = pair[selection].address;
        var tokenGAmountOut = (await window.blockchainCall(window.uniswapV2Router.methods.getAmountsOut, tokenTAmountIn, path))[1];
        var calculation = (context.view.state && context.view.state.calculation) || {};
        calculation[selection] = {
            tokenGAmountIn,
            tokenLAmountIn,
            tokenTAmountIn,
            tokenGAmountOut
        };
        context.view.setState({ calculation });
    };

    context.checkApproveAndBalances = async function checkApproveAndBalances(token, input) {
        token = token || context.view.state.pair[context.view.state.selection].token;
        input = input || window.toDecimals(context.view.amount.value.split(',').join(''), context.view.state.pair[context.view.state.selection].decimals);
        var balance = await window.blockchainCall(token.methods.balanceOf, window.walletAddress);
        var approved = parseInt(await window.blockchainCall(token.methods.allowance, window.walletAddress, window.campContract.options.address)) > (parseInt(input || '0'));
        context.view.setState({balance, approved});
    };

    context.performApprove = async function performApprove() {
        await window.blockchainCall(context.view.state.pair[context.view.state.selection].token.methods.approve, window.campContract.options.address, window.numberToString(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff));
        context.checkApproveAndBalances(context.view.state.pair[context.view.state.selection].token);
    };

    context.performCamp = async function performCamp() {
        var value = window.toDecimals(context.view.amount.value.split(',').join(''), context.view.state.pair[context.view.state.selection].decimals);
        if(isNaN(parseInt(value)) || parseInt(value) <= 0) {
            throw "Insert a positive amount";
        }
        if(parseInt(value) > parseInt(context.view.state.balance)) {
            throw `You have insufficient ${context.view.state.pair[context.view.state.selection].symbol}`;
        }
        var etherValue =  context.view.state.pair[context.view.state.selection].address === window.wethAddress ? value : undefined;
        var pairAddress = context.view.state.pair.pairToken.options.address;
        var gToken = context.view.state.selection.split('token').join('');
        var tokenTAddress = (await context.retrieveTokenT()).address;
        await window.blockchainCall(etherValue, window.campContract.methods.camp, pairAddress, gToken, tokenTAddress, value);
        context.recalculateRoutesAndPrices();
    };
};