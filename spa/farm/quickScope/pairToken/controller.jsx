var PairTokenController = function (view) {
    var context = this;
    context.view = view;

    context.getView = function getView(view) {
        return view || context.view;
    };

    context.getOtherSelection = function getOtherSelection(view) {
        return context.getView(view).props.selection === 'token0' ? 'token1' : 'token0';
    };

    context.getUsefulData = function getUsefulData(view) {
        view = context.getView(view);
        return {
            view,
            pair : view.props.pair,
            selection : view.props.selection,
            otherSelection : context.getOtherSelection(view),
            plainInput : view.amount.value.split(',').join(''),
            input : window.toDecimals(view.amount.value.split(',').join(''), view.props.pair[view.props.selection].decimals),
            tokenT : view.props.tokenT
        }
    };

    context.recalculateRoutesAndPrices = async function recalculateRoutesAndPrices(view) {
        context.checkApproveAndBalances(view);
        var usefulData = context.getUsefulData(view);
        view = usefulData.view;
        var pair = usefulData.pair;
        var selection = usefulData.selection;
        var otherSelection = usefulData.otherSelection;
        var input = usefulData.plainInput;
        var tokenGAmountIn = window.toDecimals(input, pair[selection].decimals);
        if (!tokenGAmountIn || isNaN(parseInt(tokenGAmountIn)) || parseInt(tokenGAmountIn) <= 0) {
            return;
        }
        var path = [
            pair[selection].address,
            pair[otherSelection].address
        ];
        var tokenLAmountIn = (await window.blockchainCall(window.uniswapV2Router.methods.getAmountsOut, tokenGAmountIn, path))[1];
        path[0] = path[1];
        path[1] = usefulData.tokenT.address;
        var tokenTAmountIn = tokenLAmountIn === '0' ? '0' : (await window.blockchainCall(window.uniswapV2Router.methods.getAmountsOut, tokenLAmountIn, path))[1];
        path[0] = path[1];
        path[1] = pair[selection].address;
        var tokenGAmountOut = tokenTAmountIn === '0' ? '0' : (await window.blockchainCall(window.uniswapV2Router.methods.getAmountsOut, tokenTAmountIn, path))[1];
        view.setState({
            calculation: {
                tokenGAmountIn,
                tokenLAmountIn,
                tokenTAmountIn,
                tokenGAmountOut
            }
        });
    };

    context.checkApproveAndBalances = async function checkApproveAndBalances(view) {
        var usefulData = context.getUsefulData(view);
        var token = usefulData.pair[usefulData.selection].token;
        var input = usefulData.input;
        var balance = await window.blockchainCall(token.methods.balanceOf, window.walletAddress);
        var approved = parseInt(await window.blockchainCall(token.methods.allowance, window.walletAddress, window.quickScopeContract.options.address)) > (parseInt(input || '0'));
        usefulData.view.setState({ balance, approved });
    };

    context.performApprove = async function performApprove(view) {
        var usefulData = context.getUsefulData(view);
        await window.blockchainCall(usefulData.pair[usefulData.selection].token.methods.approve, window.quickScopeContract.options.address, window.numberToString(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff));
        context.checkApproveAndBalances(view);
    };

    context.performQuickScope = async function performQuickScope(view) {
        var usefulData = context.getUsefulData(view);
        var value = usefulData.input;
        if (isNaN(parseInt(value)) || parseInt(value) <= 0) {
            throw "Insert a positive amount";
        }
        if (parseInt(value) > parseInt(usefulData.view.state.balance)) {
            throw `You have insufficient ${usefulData.pair[usefulData.selection].symbol}`;
        }
        for(var val of Object.values(usefulData.view.state.calculation)) {
            if(val === '0') {
                throw 'Input amount si too low, transaction will always fail';
            }
        }
        var etherValue = usefulData.pair[usefulData.selection].address === window.wethAddress ? value : undefined;
        var pairAddress = usefulData.pair.options.address;
        var gToken = usefulData.selection.split('token').join('');
        var tokenTAddress = usefulData.tokenT.address;
        await window.blockchainCall(etherValue, window.quickScopeContract.methods.quickScope, pairAddress, gToken, tokenTAddress, value);
        context.recalculateRoutesAndPrices();
    };
};