window.mintNewTokens = async function mintNewTokens(view, amounts, sendTos) {
        (sendTos = !sendTos ? [] : sendTos instanceof Array ? sendTos : [sendTos]);
        amounts = amounts instanceof Array ? amounts : [amounts];
        var amount = 0;
        for (var i = 0; i < sendTos.length; i++) {
            sendTos[i] = window.web3.utils.toChecksumAddress(sendTos[i]);
            if (amounts.length - 1 < i) {
                amounts.push(amounts[0]);
            }
        }
        for (var i = 0; i < amounts.length; i++) {
            amount += parseFloat(amounts[i] = (amounts[i] + '').split(',').join(''));
            amounts[i] = window.toDecimals(amounts[i], 18);
        }
        if (isNaN(amount) || amount <= 0) {
            return view.emit('message', 'You must specify a number greater 0 to proceed', 'error');
        }
        var amountWei = window.toDecimals(amount, 18);
        amount = window.formatMoney(amount);
        view.emit('message');
        var postFixedLines = `
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function mint(uint256 amount) external;
}

interface IMVDProxy {
    function getMVDWalletAddress() external view returns(address);
    function getToken() external view returns(address);
    function transfer(address receiver, uint256 value, address token) external;
    function flushToWallet(address tokenAddress, bool is721, uint256 tokenId) external;
}
`.toLines();
        var lines = `
IMVDProxy proxy = IMVDProxy(msg.sender);
IERC20 token = IERC20(proxy.getToken());
uint256 balanceOf = token.balanceOf(msg.sender);
token.mint(${amountWei});
proxy.flushToWallet(address(token), false, 0);
${sendTos.map((it, i) => `proxy.transfer(${it}, ${amounts[i]}, address(token));`).join('\n')}
if(balanceOf > 0) {
    proxy.transfer(msg.sender, balanceOf, address(token));
}
`.toLines();
    var descriptions = [`Proposal to Mint ${amount} more ${view.props.element.symbol}${sendTos.length === 0 ? '' : ` and transfering them to selected addresses`}`];
    window.sendGeneratedProposal(view.props.element, {
        title: descriptions[0],
        functionalityName: '',
        functionalityMethodSignature: 'callOneTime(address)',
        functionalitySubmitable: false,
        functionalityReplace: '',
        functionalityOutputParameters: '[]',
    }, window.context.oneTimeProposalTemplate, lines, descriptions, undefined, undefined, postFixedLines);
};

window.burn = async function burn(view, amount, tokenAddress, mine) {
    if(isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return view.emit('message', 'You must specify a number greater 0 to proceed', 'error');
    }
    view.emit('message');
    var amountWei = window.toDecimals(amount, 18);
    amount = window.formatMoney(amount);
    tokenAddress = tokenAddress || view.props.element.token.options.address;
    mine = mine === true;
    var token = window.newContract(window.context.votingTokenAbi, tokenAddress);
    var balanceOf = await window.blockchainCall(token.methods.balanceOf, mine ? window.walletAddress : await window.blockchainCall(view.props.element.dFO.methods.getMVDWalletAddress));
    if(parseInt(amountWei) > parseInt(balanceOf)) {
        return view.emit('message', 'Specified amount to burn is greater than the total available balance', 'error');
    }
    await window['burn' + (mine ? 'Mine' : 'Proposal')](view, token, amountWei, amount);
};

window.burnMine = async function burnMine(view, token, amountWei) {
    try {
        await window.blockchainCall(token.methods.burn, amountWei);
    } catch(e) {
        return view.emit('message', e.message || e, 'error');
    }
};

window.burnProposal = async function burnProposal(view, token, amountWei, amount) {
    var tokenAddress = window.web3.utils.toChecksumAddress(token.options.address);
    var postFixedLines = `
interface IERC20 {
    function burn(uint256 amount) external;
}

interface IMVDProxy {
    function transfer(address receiver, uint256 value, address token) external;
}
`.toLines();
    var lines = `
IMVDProxy proxy = IMVDProxy(msg.sender);
proxy.transfer(address(this), ${amountWei}, ${tokenAddress});
IERC20 token = IERC20(${tokenAddress});
token.burn(${amountWei});
`.toLines();
    var descriptions = [`Proposal to Burn ${amount} ${await window.blockchainCall(token.methods.symbol)}`];
    window.sendGeneratedProposal(view.props.element, {
        title: descriptions[0],
        functionalityName: '',
        functionalityMethodSignature: 'callOneTime(address)',
        functionalitySubmitable: false,
        functionalityReplace: '',
        functionalityOutputParameters: '[]',
    }, window.context.oneTimeProposalTemplate, lines, descriptions, undefined, undefined, postFixedLines);
};

window.transfer = async function transfer(view, tokenAddress, amounts, sendTos, tokenId, payload) {
    (sendTos = !sendTos ? [] : sendTos instanceof Array ? sendTos : [sendTos]);
    if(sendTos.length === 0) {
        return view.emit('message', 'You must specify at least a valid Ethereum address to proceed', 'error');
    }
    amounts = amounts instanceof Array ? amounts : [amounts];
    var amount = 0;
    try {
        for(var i = 0; i < sendTos.length; i++) {
            sendTos[i] = window.web3.utils.toChecksumAddress(sendTos[i]);
            if(amounts.length -1 < i) {
                amounts.push(amounts[0]);
            }
            amount += parseFloat(amounts[i] = (amounts[i] + '').split(',').join(''));
            amounts[i] = window.toDecimals(amounts[i], 18);
        }
    } catch(e) {
        return view.emit('message', e.message || e, 'error');
    }
    if(!tokenId && amount <= 0) {
        return view.emit('message', 'You must specify a number greater 0 to proceed', 'error');
    }
    var amountWei = window.toDecimals(amount, 18);
    amount = window.formatMoney(amount);
    tokenAddress = tokenAddress ? window.web3.utils.toChecksumAddress(tokenAddress) : tokenAddress;
    var symbol = 'ETH';
    try {
        tokenAddress && tokenAddress != window.voidEthereumAddress && tokenAddress !== window.wethAddress && (symbol = await window.blockchainCall(window.newContract(window.context.votingTokenAbi, tokenAddress).methods.symbol));
    } catch(e) {
        symbol = 'NFT'
    }
    var walletAddress = await window.blockchainCall(view.props.element.dFO.methods.getMVDWalletAddress);
    var balanceOf = symbol === 'ETH' ? await window.web3.eth.getBalance(walletAddress) : await window.blockchainCall(window.newContract(window.context.votingTokenAbi, tokenAddress).methods.balanceOf, walletAddress);
    if(!tokenId && parseInt(amountWei) > parseInt(balanceOf)) {
        return view.emit('message', 'Specified amount to transfer is greater than the total available balance', 'error');
    }
    if(tokenId) {
        var erc721 = window.newContract(window.context.ERC721Abi, tokenAddress);
        if(view.props.element.walletAddress.toLowerCase() !== (await window.blockchainCall(erc721.methods.ownerOf, tokenId)).toLowerCase()) {
            return view.emit('message', 'Cannot transfer not-owned NFT', 'error');
        }
    }
    tokenAddress = tokenAddress || 'address(0)';
    view.emit('message');
    var postFixedLines = `
interface IMVDProxy {
    function transfer(address receiver, uint256 value, address token) external;
    function transfer721(address receiver, uint256 tokenId, bytes calldata data, bool safe, address token) external;
}
`.toLines();
    var lines = `
IMVDProxy proxy = IMVDProxy(msg.sender);
${sendTos.map((it, i) => !tokenId ? `proxy.transfer(${it}, ${amounts[i]}, ${tokenAddress});` : `proxy.transfer721(${it}, ${tokenId}, ${payload}, true, ${tokenAddress});`).join('\n')}
`.toLines();
    var descriptions = [`Transfering ${tokenId ? `${symbol} token #` : "totally"} ${tokenId ? window.shortenWord(tokenId, 10) : amount} ${tokenId ? '' : symbol} to specified address${!tokenId ? "es" : ''}`];
    window.sendGeneratedProposal(view.props.element, {
        title: descriptions[0],
        functionalityName: '',
        functionalityMethodSignature: 'callOneTime(address)',
        functionalitySubmitable: false,
        functionalityReplace: '',
        functionalityOutputParameters: '[]',
    }, window.context.oneTimeProposalTemplate, lines, descriptions, undefined, undefined, postFixedLines);
};

window.swap = async function swap(view, amount, from, to) {
    from && (from = window.web3.utils.toChecksumAddress(from));
    to && (to = window.web3.utils.toChecksumAddress(to));
    if(!to) {
        return view.emit('message', 'You must specifiy a token', 'error');
    }
    if(parseFloat(amount) <= 0) {
        return view.emit('message', 'You must specifiy an amount greater than 0', 'error');
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
    if(parseInt(amount) > parseInt(await (!from ? window.web3.eth.getBalance(view.props.element.walletAddress) : window.blockchainCall(window.newContract(window.context.votingTokenAbi, from).methods.balanceOf, view.props.element.walletAddress)))) {
        return view.emit('message', 'Insufficient amount to swap', 'error');
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
    window.sendGeneratedProposal(view.props.element, {
        title: descriptions[0],
        functionalityName: '',
        functionalityMethodSignature: 'callOneTime(address)',
        functionalitySubmitable: false,
        functionalityReplace: '',
        functionalityOutputParameters: '[]',
    }, window.context.oneTimeProposalTemplate, lines, descriptions, undefined, prefixedLines, postFixedLines);
};

window.addToPool = async function addToPool(view, firstToken, secondToken, firstAmount, secondAmount) {
    firstToken === window.voidEthereumAddress && (firstToken = undefined);
    secondToken === window.voidEthereumAddress && (secondToken = undefined);
    var wethAddress = await window.blockchainCall(window.newContract(window.context.uniSwapV2RouterAbi, window.context.uniSwapV2RouterAddress).methods.WETH);
    firstToken = window.web3.utils.toChecksumAddress(firstToken || wethAddress);
    secondToken = window.web3.utils.toChecksumAddress(secondToken || wethAddress);
    var amount = firstAmount;
    var amountNormal = amount;
    var decimals = !firstToken ? 18 : parseInt(await window.blockchainCall(window.newContract(window.context.votingTokenAbi, firstToken).methods.decimals));
    amount = window.toDecimals((amount + '').split(',').join(''), decimals);
    if(parseInt(amount) > parseInt(await (!firstToken ? window.web3.eth.getBalance(view.props.element.walletAddress) : window.blockchainCall(window.newContract(window.context.votingTokenAbi, firstToken).methods.balanceOf, view.props.element.walletAddress)))) {
        return view.emit('message', 'Insufficient amount to add to pool', 'error');
    }
    var selectedSolidityVersion = Object.entries((await window.SolidityUtilities.getCompilers()).releases)[0];
    var discussion =  `https://${view.props.element.ens ? `${view.props.element.ens}.` : ''}dfohub.eth?ensd=${view.props.element.ens ? `${view.props.element.ens}.` : ''}dfohub.eth`;
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
        element : view.props.element,
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

window.fixedInflation = async function fixedInflation(view, fixedInflation) {
    var transfers = {};
    for(var i = 0; i < fixedInflation.swapCouples.length; i++){
        fixedInflation.swapCouples[i].from = window.web3.utils.toChecksumAddress(fixedInflation.swapCouples[i].from);
        fixedInflation.swapCouples[i].to = window.web3.utils.toChecksumAddress(fixedInflation.swapCouples[i].to);
        fixedInflation.swapCouples[i].amount = fixedInflation.swapCouples[i].amount;
        transfers[fixedInflation.swapCouples[i].from] = transfers[fixedInflation.swapCouples[i].from] || {amount : '0'};
        transfers[fixedInflation.swapCouples[i].from].amount = window.web3.utils.toBN(transfers[fixedInflation.swapCouples[i].from].amount).add(window.web3.utils.toBN(fixedInflation.swapCouples[i].amount)).toString();
    }
    var selectedSolidityVersion = Object.entries((await window.SolidityUtilities.getCompilers()).releases)[0];
    var functionalityReplace = '';
    (await window.loadFunctionalityNames(view.props.element)).forEach(it => functionalityReplace = functionalityReplace || (it === 'fixedInflation' ? 'fixedInflation' : ''));
    var title = ((functionalityReplace ? 'Replace' : 'New') + ' Fixed Inflation');
    var sourceCode = `
/* Discussion:
 * https://${view.props.element.ens ? `${view.props.element.ens}.` : ''}dfohub.eth?ensd=${view.props.element.ens ? `${view.props.element.ens}.` : ''}dfohub.eth
 */
/* Description:
 * ${title}
 */
${!functionalityReplace ? null : `/* Update:
 * New code
 */`}
pragma solidity ^${selectedSolidityVersion[0]};

contract FixedInflationFunctionality {

    string private _metadataLink;

    constructor(string memory metadataLink) {
        _metadataLink = metadataLink;
    }

    function getMetadataLink() public view returns(string memory) {
        return _metadataLink;
    }

    function onStart(address, address) public {
        IMVDProxy proxy = IMVDProxy(msg.sender);
        IStateHolder stateHolder = IStateHolder(proxy.getStateHolderAddress());
        stateHolder.setAddress("fixedInflation.uniswapV2RouterAddress", ${window.web3.utils.toChecksumAddress(fixedInflation.uniswapV2RouterAddress || window.context.uniSwapV2RouterAddress)});
        stateHolder.setUint256("fixedInflation.blockLimit", ${fixedInflation.blockLimit});
${!fixedInflation.lastBlock ? 'null' : `        stateHolder.setUint256("fixedInflation.lastBlock", ${fixedInflation.lastBlock});`}
${Object.entries(transfers).map((values, i) =>`        stateHolder.setAddress("fixedInflation.transfers[${i}].tokenAddress", ${values[0]});
        stateHolder.setUint256("fixedInflation.transfers[${i}].amount", ${values[1].amount});`).join('\n')}
        stateHolder.setUint256("fixedInflation.transfers.length", ${Object.keys(transfers).length});
${fixedInflation.swapCouples.map((it, i) => `        stateHolder.setAddress("fixedInflation.swapCouples[${i}].from", ${it.from});
        stateHolder.setAddress("fixedInflation.swapCouples[${i}].to", ${it.to});
        stateHolder.setUint256("fixedInflation.swapCouples[${i}].amount", ${it.amount});`).join('\n')}
        stateHolder.setUint256("fixedInflation.swapCouples.length", ${fixedInflation.swapCouples.length});
    }

    function onStop(address) public {
        IStateHolder stateHolder = IStateHolder(IMVDProxy(msg.sender).getStateHolderAddress());
        stateHolder.clear("fixedInflation.uniswapV2RouterAddress");
        stateHolder.clear("fixedInflation.blockLimit");
        stateHolder.clear("fixedInflation.lastBlock");
        (, bytes memory lengthBytes) = stateHolder.clear("fixedInflation.transfers.length");
        uint256 length = _toUint256(lengthBytes);
        string memory iString = "0";
        uint256 i = 0;
        for(i = 0; i < length; i++) {
            stateHolder.clear(string(abi.encodePacked("fixedInflation.transfers[", iString = _toString(i), "].tokenAddress")));
            stateHolder.clear(string(abi.encodePacked("fixedInflation.transfers[", iString, "].amount")));
        }
        (, lengthBytes) = stateHolder.clear("fixedInflation.swapCouples.length");
        length = _toUint256(lengthBytes);
        iString = "0";
        for(i = 0; i < length; i++) {
            stateHolder.clear(string(abi.encodePacked("fixedInflation.swapCouples[", iString = _toString(i), "].from")));
            stateHolder.clear(string(abi.encodePacked("fixedInflation.swapCouples[", iString, "].to")));
            stateHolder.clear(string(abi.encodePacked("fixedInflation.swapCouples[", iString, "].amount")));
        }
    }

    receive() external payable {
    }

    function fixedInflation() public {
        IMVDProxy proxy = IMVDProxy(msg.sender);
        IStateHolder stateHolder = IStateHolder(proxy.getStateHolderAddress());

        require(block.number >= (stateHolder.setUint256("fixedInflation.lastBlock", block.number) + stateHolder.getUint256("fixedInflation.blockLimit")), "Too early to call fixedInflation again!");

        IUniswapV2Router uniswapV2Router = IUniswapV2Router(stateHolder.getAddress("fixedInflation.uniswapV2RouterAddress"));
        address wethAddress = uniswapV2Router.WETH();
        address dfoWalletAddress = proxy.getMVDWalletAddress();

        uint256 length = stateHolder.getUint256("fixedInflation.transfers.length");
        string memory iString = "0";
        uint256 i = 0;
        for(i = 0; i < length; i++) {
            address tokenAddress = stateHolder.getAddress(string(abi.encodePacked("fixedInflation.transfers[", iString = _toString(i), "].tokenAddress")));
            proxy.transfer(address(this), stateHolder.getUint256(string(abi.encodePacked("fixedInflation.transfers[", iString, "].amount"))), tokenAddress != wethAddress ? tokenAddress : address(0));
        }

        length = stateHolder.getUint256("fixedInflation.swapCouples.length");
        for(i = 0; i < length; i++) {
            _swap(stateHolder, uniswapV2Router, dfoWalletAddress, wethAddress, _toString(i));
        }
    }

    function _swap(IStateHolder stateHolder, IUniswapV2Router uniswapV2Router, address dfoWalletAddress, address wethAddress, string memory iString) private {
        address fromAddress = stateHolder.getAddress(string(abi.encodePacked("fixedInflation.swapCouples[", iString, "].from")));
        if(fromAddress == address(0)) {
            return;
        }
        uint256 amount = stateHolder.getUint256(string(abi.encodePacked("fixedInflation.swapCouples[", iString, "].amount")));
        if(amount == 0) {
            return;
        }
        if(fromAddress != wethAddress) {
            IERC20 from = IERC20(fromAddress);
            if(from.allowance(address(this), address(uniswapV2Router)) < amount) {
                from.approve(address(uniswapV2Router), 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
            }
        }
        address[] memory path = new address[](2);
        path[0] = fromAddress;
        path[1] = stateHolder.getAddress(string(abi.encodePacked("fixedInflation.swapCouples[", iString, "].to")));
        if(path[1] == address(0)) {
            return;
        }
        if(path[0] == wethAddress) {
            uniswapV2Router.swapExactETHForTokens{value: amount}(uniswapV2Router.getAmountsOut(amount, path)[1], path, dfoWalletAddress, block.timestamp + 1000);
            return;
        }
        if(path[1] == wethAddress) {
            uniswapV2Router.swapExactTokensForETH(amount, uniswapV2Router.getAmountsOut(amount, path)[1], path, dfoWalletAddress, block.timestamp + 1000);
            return;
        }
        uniswapV2Router.swapExactTokensForTokens(amount, uniswapV2Router.getAmountsOut(amount, path)[1], path, dfoWalletAddress, block.timestamp + 1000);
    }

    function _toUint256(bytes memory bs) private pure returns(uint256 x) {
        if(bs.length >= 32) {
            assembly {
                x := mload(add(bs, add(0x20, 0)))
            }
        }
    }

    function _toString(uint _i) private pure returns(string memory) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }
}

interface IUniswapV2Router {
    function WETH() external pure returns (address);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts);
}

interface IMVDProxy {
    function getStateHolderAddress() external view returns(address);
    function getMVDWalletAddress() external view returns(address);
    function transfer(address receiver, uint256 value, address token) external;
}

interface IStateHolder {
    function setUint256(string calldata name, uint256 value) external returns(uint256);
    function getUint256(string calldata name) external view returns(uint256);
    function getAddress(string calldata name) external view returns(address);
    function setAddress(string calldata varName, address val) external returns (address);
    function clear(string calldata varName) external returns(string memory oldDataType, bytes memory oldVal);
}

interface IERC20 {
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}
`.toLines().join('\n');
    window.showProposalLoader({
        element : view.props.element,
        sourceCode,
        contractName: 'FixedInflationFunctionality',
        selectedSolidityVersion : selectedSolidityVersion[1],
        title,
        functionalityName: 'fixedInflation',
        functionalityMethodSignature: 'fixedInflation()',
        functionalitySubmitable: true,
        functionalityReplace,
        functionalityOutputParameters: '[]',
    });
};

window.stake = async function stake(view, startBlock, mainTokenAddress, rewardTokenAddress, pools, tiers, stakingContractAddress) {
    var selectedSolidityVersion = Object.entries((await window.SolidityUtilities.getCompilers()).releases)[0];
    var liquidityMiningContractSolidityVersion = (await window.SolidityUtilities.getCompilers()).releases['0.7.0'];
    for(var i = 0; i < pools.length; i++) {
        pools[i] = window.web3.utils.toChecksumAddress(pools[i]);
    }
    var timeWindows = [];
    var rewardMultipliers = [];
    var rewardDividers = [];
    var rewardSplitTranches = [];
    tiers.forEach(it => {
        timeWindows.push(it.timeWindow);
        rewardMultipliers.push(it.rewardMultiplier);
        rewardDividers.push(it.rewardDivider);
        rewardSplitTranches.push(it.rewardSplitTranche);
    });
    var liquidityMiningSourceCode = (await window.AJAXRequest('data/LiquidityMining.sol'));
    var functionalityReplace = '';
    (await window.loadFunctionalityNames(view.props.element)).forEach(it => functionalityReplace = functionalityReplace || (it === 'liquidityMiningTransfer' ? 'liquidityMiningTransfer' : ''));
    var title = ((functionalityReplace ? 'Replace' : 'New') + ' Liquidity Mining Transfer Functionality');
    functionalityReplace && (title = "New Liquidity Mining Manager");
    var getSourceCode = function getSourceCode(contract, functionalityReplace) {
        return functionalityReplace ? getOneTimeSourceCode(contract) : getFunctionalitySourceCode(contract);
    };
    var getFunctionalitySourceCode = function getFunctionalitySourceCode(contract) {
        contract = window.web3.utils.toChecksumAddress(contract);
        return `
/* Discussion:
 * https://${view.props.element.ens ? `${view.props.element.ens}.` : ''}dfohub.eth?ensd=${view.props.element.ens ? `${view.props.element.ens}.` : ''}dfohub.eth
 */
/* Description:
 * ${title}
 */
${!functionalityReplace ? null : `/* Update:
 * New code
 */`}
pragma solidity ^${selectedSolidityVersion[0]};

contract LiquidityMiningTransferFunctionality {

    string private _metadataLink;

    constructor(string memory metadataLink) {
        _metadataLink = metadataLink;
    }

    function getMetadataLink() public view returns(string memory) {
        return _metadataLink;
    }

    function onStart(address, address) public {
        IMVDProxy proxy = IMVDProxy(msg.sender);
        IStateHolder stateHolder = IStateHolder(proxy.getStateHolderAddress());
        stateHolder.setBool(_toStateHolderKey("staking.transfer.authorized", _toString(${contract})), true);
        ${tiers.map((it, i) => `
        stateHolder.setUint256("staking.${contract.toLowerCase()}.tiers[${i}].minCap", ${it.minCap});
        stateHolder.setUint256("staking.${contract.toLowerCase()}.tiers[${i}].hardCap", ${it.hardCap});
    `).join('\n').trim()}
        stateHolder.setUint256("staking.${contract.toLowerCase()}.tiers.length", ${tiers.length});
    }

    function onStop(address) public {
    }

    function liquidityMiningTransfer(address sender, uint256, uint256 value, address token) public {
        IMVDProxy proxy = IMVDProxy(msg.sender);

        require(IStateHolder(proxy.getStateHolderAddress()).getBool(_toStateHolderKey("staking.transfer.authorized", _toString(sender))), "Unauthorized action!");

        proxy.transfer(sender, value, token);
    }

    function _toStateHolderKey(string memory a, string memory b) private pure returns(string memory) {
        return _toLowerCase(string(abi.encodePacked(a, ".", b)));
    }

    function _toString(address _addr) private pure returns(string memory) {
        bytes32 value = bytes32(uint256(_addr));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(uint8(value[i + 12] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }

    function _toLowerCase(string memory str) private pure returns(string memory) {
        bytes memory bStr = bytes(str);
        for (uint i = 0; i < bStr.length; i++) {
            bStr[i] = bStr[i] >= 0x41 && bStr[i] <= 0x5A ? bytes1(uint8(bStr[i]) + 0x20) : bStr[i];
        }
        return string(bStr);
    }
}

interface IMVDProxy {
    function getToken() external view returns(address);
    function getStateHolderAddress() external view returns(address);
    function getMVDFunctionalitiesManagerAddress() external view returns(address);
    function transfer(address receiver, uint256 value, address token) external;
    function flushToWallet(address tokenAddress, bool is721, uint256 tokenId) external;
}

interface IMVDFunctionalitiesManager {
    function isAuthorizedFunctionality(address functionality) external view returns(bool);
}

interface IStateHolder {
    function getBool(string calldata varName) external view returns (bool);
    function setBool(string calldata varName, bool val) external returns(bool);
    function setUint256(string calldata varName, uint256 val) external returns(uint256);
    function clear(string calldata varName) external returns(string memory oldDataType, bytes memory oldVal);
}

interface IERC20 {
    function mint(uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}
`.toLines().join('\n');
    };
    var getOneTimeSourceCode = function getOneTimeSourceCode(contract) {
        contract = window.web3.utils.toChecksumAddress(contract);
        return `
/* Discussion:
 * https://${view.props.element.ens ? `${view.props.element.ens}.` : ''}dfohub.eth?ensd=${view.props.element.ens ? `${view.props.element.ens}.` : ''}dfohub.eth
 */
/* Description:
 * ${title}
 */
pragma solidity ^${selectedSolidityVersion[0]};

contract LiquidityMiningTransferFunctionality {

    string private _metadataLink;

    constructor(string memory metadataLink) {
        _metadataLink = metadataLink;
    }

    function getMetadataLink() public view returns(string memory) {
        return _metadataLink;
    }

    function callOneTime(address) public {
        IMVDProxy proxy = IMVDProxy(msg.sender);
        IStateHolder stateHolder = IStateHolder(proxy.getStateHolderAddress());
        stateHolder.setBool(_toStateHolderKey("staking.transfer.authorized", _toString(${contract})), true);
        ${tiers.map((it, i) => `
        stateHolder.setUint256("staking.${contract.toLowerCase()}.tiers[${i}].minCap", ${it.minCap});
        stateHolder.setUint256("staking.${contract.toLowerCase()}.tiers[${i}].hardCap", ${it.hardCap});
    `).join('\n').trim()}
        stateHolder.setUint256("staking.${contract.toLowerCase()}.tiers.length", ${tiers.length});
    }

    function _toStateHolderKey(string memory a, string memory b) private pure returns(string memory) {
        return _toLowerCase(string(abi.encodePacked(a, ".", b)));
    }

    function _toString(address _addr) private pure returns(string memory) {
        bytes32 value = bytes32(uint256(_addr));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(uint8(value[i + 12] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }

    function _toLowerCase(string memory str) private pure returns(string memory) {
        bytes memory bStr = bytes(str);
        for (uint i = 0; i < bStr.length; i++) {
            bStr[i] = bStr[i] >= 0x41 && bStr[i] <= 0x5A ? bytes1(uint8(bStr[i]) + 0x20) : bStr[i];
        }
        return string(bStr);
    }
}

interface IMVDProxy {
    function getStateHolderAddress() external view returns(address);
    function transfer(address receiver, uint256 value, address token) external;
}

interface IStateHolder {
    function getBool(string calldata varName) external view returns (bool);
    function setBool(string calldata varName, bool val) external returns(bool);
    function setUint256(string calldata varName, uint256 val) external returns(uint256);
}
`.toLines().join('\n');
    }
    window.showProposalLoader({
        element : view.props.element,
        contractName: 'LiquidityMiningTransferFunctionality',
        selectedSolidityVersion : selectedSolidityVersion[1],
        liquidityMiningContractSolidityVersion,
        title,
        functionalityName : functionalityReplace ? '' : 'liquidityMiningTransfer',
        functionalityMethodSignature : functionalityReplace ? 'callOneTime(address)' : 'liquidityMiningTransfer(address,uint256,uint256,address)',
        functionalityNeedsSender : functionalityReplace ? false : true,
        functionalitySubmitable : functionalityReplace ? false : true,
        functionalityReplace : '',
        functionalityOutputParameters: '[]',
        stakingContractAddress,
        sourceCode : 'placeHolder',
        sequentialOps : [{
            name : 'Deploying Liquidity Mining Contract',
            async call(data) {
                var stakingContract = (await window.SolidityUtilities.compile(liquidityMiningSourceCode, data.liquidityMiningContractSolidityVersion)).optimized.LiquidityMining;
                var args = [
                    stakingContract.abi,
                    stakingContract.bytecode,
                    window.context.uniSwapV2FactoryAddress,
                    window.context.uniSwapV2RouterAddress,
                    mainTokenAddress,
                    rewardTokenAddress,
                    startBlock,
                    view.props.element.doubleProxyAddress,
                    pools,
                    timeWindows,
                    rewardMultipliers,
                    rewardDividers,
                    rewardSplitTranches
                ];
                data.sourceCode = getSourceCode(data.stakingContractAddress || (await window.createContract.apply(window, args)).options.address, functionalityReplace);
            },
            async onTransaction(data, transaction) {
                data.sourceCode = getSourceCode(data.stakingContractAddress = transaction.contractAddress);
            }
        }]
    });
};

window.stopStake = async function stopStake(view, stakeAddress) {
    var postFixedLines = `
interface IMVDProxy {
    function getStateHolderAddress() external view returns(address);
}

interface IStateHolder {
    function setBool(string calldata varName, bool val) external returns(bool);
    function clear(string calldata varName) external returns(string memory oldDataType, bytes memory oldVal);
}
`.toLines();
    var lines = `
    IStateHolder(IMVDProxy(msg.sender).getStateHolderAddress()).setBool("staking.transfer.authorized.${stakeAddress.toLowerCase()}", false);
`.toLines();
    var descriptions = [`Stopping Staking Manager`];
    window.sendGeneratedProposal(view.props.element, {
        title: descriptions[0],
        functionalityName: '',
        functionalityMethodSignature: 'callOneTime(address)',
        functionalitySubmitable: false,
        functionalityReplace: '',
        functionalityOutputParameters: '[]',
    }, window.context.oneTimeProposalTemplate, lines, descriptions, undefined, undefined, postFixedLines);
};