var WalletController = function (view) {
    var context = this;
    context.view = view;

    context.pairCreatedTopic = window.web3.utils.sha3('PairCreated(address,address,address,uint256)');

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
                decimals : await window.blockchainCall(token.methods.decimals)
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
            decimals : context.view.props.element.decimals
        });
        context.view.setState({tokens});
        Object.values(window.list).forEach(it => {
            var address = window.web3.utils.toChecksumAddress(it.token.options.address);
            if((it === window.dfoHub || it === context.view.props.element)) {
                return;
            }
            var entry = {
                token : it.token,
                address,
                name: it.name,
                symbol: it.symbol,
                decimals: it.decimals
            };
            it !== window.dfoHub && it !== context.view.props.element && tokens.push(entry);
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
            token.logo = await context.loadLogo(token.address);
            tokens[i] = token;
            context.view.setState({tokens});
        }
        context.view.setState({cumulativeAmountDollar, tokens});
    };

    context.loadLogo = async function loadLogo(address) {
        address = window.web3.utils.toChecksumAddress(address);
        var logo = address === window.voidEthereumAddress ? 'assets/img/eth-logo.png' : address.toLowerCase() === window.dfoHub.token.options.address.toLowerCase() ? 'assets/img/buidlv2-logo.png' : window.context.trustwalletImgURLTemplate.format(address);
        try {
            await window.AJAXRequest(logo);
        } catch(e) {
            logo = 'assets/img/default-logo.png';
        }
        return logo;
    };

    context.swap = async function swap(amount, from, to) {
        from && (from = window.web3.utils.toChecksumAddress(from));
        to && (to = window.web3.utils.toChecksumAddress(to));
        if(!to) {
            return context.view.emit('message', 'You must specifiy a token', 'error');
        }
        if(parseFloat(amount) <= 0) {
            return context.view.emit('message', 'You must specifiy an amount greater than 0', 'error');
        }
        var wethAddress = await window.blockchainCall(window.newContract(window.context.uniSwapV2RouterAbi, window.context.uniSwapV2RouterAddress).methods.WETH);
        if(from.toLowerCase() === wethAddress.toLowerCase() || from === window.voidEthereumAddress) {
            from = undefined;
        }
        if(to.toLowerCase() === wethAddress.toLowerCase() || to === window.voidEthereumAddress) {
            to = undefined;
        }
        var amountNormal = amount;
        var decimals = !from ? 18 : parseInt(await window.blockchainCall(window.newContract(window.context.votingTokenAbi, from).methods.decimals));
        amount = window.toDecimals((amount + '').split(',').join(''), decimals);
        if(parseInt(amount) > parseInt(await (!from ? window.web3.eth.getBalance(context.view.props.element.walletAddress) : window.blockchainCall(window.newContract(window.context.votingTokenAbi, from).methods.balanceOf, context.view.props.element.walletAddress)))) {
            return context.view.emit('message', 'Insufficient amount to swap', 'error');
        }
        var postFixedLines = `
interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

interface IMVDProxy {
    function getMVDWalletAddress() external view returns(address);
    function transfer(address receiver, uint256 value, address token) external;
}

interface IUniswapV2Router {
    function WETH() external pure returns (address);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts);
}
`.toLines();
        var prefixedLines = (from ? '' : `
receive() external payable {
}
`).toLines();
        var lines = `
IMVDProxy proxy = IMVDProxy(msg.sender);
proxy.transfer(address(this), ${amount}, ${from ? from : `address(0)`});
address dfoWalletAddress = proxy.getMVDWalletAddress();
IUniswapV2Router uniswapV2Router = IUniswapV2Router(${window.web3.utils.toChecksumAddress(window.context.uniSwapV2RouterAddress)});
address[] memory path = new address[](2);
path[0] = ${from ? from : `uniswapV2Router.WETH()`};
path[1] = ${to ? to : `uniswapV2Router.WETH()`};
${!from ? null : `IERC20(${from}).approve(${window.web3.utils.toChecksumAddress(window.context.uniSwapV2RouterAddress)}, ${amount});`}
uint[] memory result = uniswapV2Router.swapExact${from ? 'Tokens' : 'ETH'}For${to ? 'Tokens' : 'ETH'}${from ? '' : `{value: ${amount}}`}(${from ? `${amount}, ` : ''}uniswapV2Router.getAmountsOut(${amount}, path)[1], path, dfoWalletAddress, block.timestamp + 1000);
if(${amount} > result[0]) {
    ${from ? `IERC20(${from}).transfer(dfoWalletAddress, ` : `payable(dfoWalletAddress).transfer(`}${amount} - result[0]);
}
`.toLines();
        var descriptions = [`Swapping ${amountNormal} ${from ? await window.blockchainCall(window.newContract(window.context.votingTokenAbi, from).methods.symbol) : 'ETH'} for ${to ? await window.blockchainCall(window.newContract(window.context.votingTokenAbi, to).methods.symbol) : 'ETH'}`];
        window.sendGeneratedProposal(context.view.props.element, {
            title: descriptions[0],
            functionalityName: '',
            functionalityMethodSignature: 'callOneTime(address)',
            functionalitySubmitable: false,
            functionalityReplace: '',
            functionalityOutputParameters: '[]',
        }, window.context.oneTimeProposalTemplate, lines, descriptions, undefined, prefixedLines, postFixedLines);
    };

    window.addToPool = context.addToPool = async function addToPool(firstToken, secondToken, firstAmount, secondAmount) {
        firstToken === window.voidEthereumAddress && (firstToken = undefined);
        secondToken === window.voidEthereumAddress && (secondToken = undefined);
        var wethAddress = await window.blockchainCall(window.newContract(window.context.uniSwapV2RouterAbi, window.context.uniSwapV2RouterAddress).methods.WETH);
        firstToken = window.web3.utils.toChecksumAddress(firstToken || wethAddress);
        secondToken = window.web3.utils.toChecksumAddress(secondToken || wethAddress);
        var amount = firstAmount;
        var amountNormal = amount;
        var decimals = !firstToken ? 18 : parseInt(await window.blockchainCall(window.newContract(window.context.votingTokenAbi, firstToken).methods.decimals));
        amount = window.toDecimals((amount + '').split(',').join(''), decimals);
        if(parseInt(amount) > parseInt(await (!firstToken ? window.web3.eth.getBalance(context.view.props.element.walletAddress) : window.blockchainCall(window.newContract(window.context.votingTokenAbi, firstToken).methods.balanceOf, context.view.props.element.walletAddress)))) {
            return context.view.emit('message', 'Insufficient amount to add to pool', 'error');
        }
        var selectedSolidityVersion = Object.entries((await window.SolidityUtilities.getCompilers()).releases)[0];
        var discussion =  `https://${context.view.props.element.ens ? `${context.view.props.element.ens}.` : ''}dfohub.eth?ensd=${context.view.props.element.ens ? `${context.view.props.element.ens}.` : ''}dfohub.eth`;
        var title = `Adding to Pool ${amountNormal} ${firstToken ? await window.blockchainCall(window.newContract(window.context.votingTokenAbi, firstToken).methods.symbol) : 'ETH'} for ${secondToken ? await window.blockchainCall(window.newContract(window.context.votingTokenAbi, secondToken).methods.symbol) : 'ETH'}`;
        var sourceCode = (await window.AJAXRequest('data/AddToPoolTemplate.sol')).format(
            discussion,
            title,
            selectedSolidityVersion[0],
            window.web3.utils.toChecksumAddress(window.context.uniSwapV2FactoryAddress),
            window.web3.utils.toChecksumAddress(window.context.uniSwapV2RouterAddress),
            window.web3.utils.toChecksumAddress(firstToken),
            window.web3.utils.toChecksumAddress(secondToken),
            amount,
            secondAmount || '0'
        );
        window.showProposalLoader({
            element : context.view.props.element,
            contractName: 'AddToPoolProposal',
            selectedSolidityVersion : selectedSolidityVersion[1],
            title,
            functionalityName: '',
            functionalityMethodSignature: 'callOneTime(address)',
            functionalitySubmitable: false,
            functionalityReplace: '',
            functionalityOutputParameters: '[]',
            sourceCode
        });
    };
};