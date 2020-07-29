var TokenController = function (view) {
    var context = this;
    context.view = view;

    context.mint = async function mint(amounts, sendTos) {
        (sendTos = !sendTos ? [] : sendTos instanceof Array ? sendTos : [sendTos]);
        amounts = amounts instanceof Array ? amounts : [amounts];
        var amount = 0;
        for(var i = 0; i < sendTos.length; i++) {
            sendTos[i] = window.web3.utils.toChecksumAddress(sendTos[i]);
            if(amounts.length -1 < i) {
                amounts.push(amounts[0]);
            }
        }
        for(var i = 0; i < amounts.length; i++) {
            amount += parseFloat(amounts[i] = (amounts[i] + '').split(',').join(''));
            amounts[i] = window.toDecimals(amounts[i], 18); 
        }
        if(isNaN(amount) || amount <= 0) {
            return context.view.emit('message', 'You must specify a number greater 0 to proceed', 'error');
        }
        var amountWei = window.toDecimals(amount, 18);
        amount = window.formatMoney(amount);
        context.view.emit('message');
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
        var descriptions = [`Proposal to Mint ${amount} more ${context.view.props.element.symbol}${sendTos.length === 0 ? '' : ` and transfering them to selected addresses`}`];
        window.sendGeneratedProposal(context.view.props.element, {
            title: descriptions[0],
            functionalityName: '',
            functionalityMethodSignature: 'callOneTime(address)',
            functionalitySubmitable: false,
            functionalityReplace: '',
            functionalityOutputParameters: '[]',
        }, window.context.oneTimeProposalTemplate, lines, descriptions, undefined, undefined, postFixedLines);
    };

    context.burn = async function burn(amount, tokenAddress, mine) {
        if(isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return context.view.emit('message', 'You must specify a number greater 0 to proceed', 'error');
        }
        context.view.emit('message');
        var amountWei = window.toDecimals(amount, 18);
        amount = window.formatMoney(amount);
        tokenAddress = tokenAddress || context.view.props.element.token.options.address;
        mine = mine === true;
        var token = window.newContract(window.context.votingTokenAbi, tokenAddress);
        var balanceOf = await window.blockchainCall(token.methods.balanceOf, mine ? window.walletAddress : await window.blockchainCall(context.view.props.element.dFO.methods.getMVDWalletAddress));
        if(parseInt(amountWei) > parseInt(balanceOf)) {
            return context.view.emit('message', 'Specified amount to burn is greater than the total available balance', 'error');
        }
        await context['burn' + (mine ? 'Mine' : 'Proposal')](token, amountWei, amount);
    };

    context.burnMine = async function burnMine(token, amountWei) {
        try {
            await window.blockchainCall(token.methods.burn, amountWei);
        } catch(e) {
            return context.view.emit('message', e.message || e, 'error');
        }
    };

    context.burnProposal = async function burnProposal(token, amountWei, amount) {
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
        window.sendGeneratedProposal(context.view.props.element, {
            title: descriptions[0],
            functionalityName: '',
            functionalityMethodSignature: 'callOneTime(address)',
            functionalitySubmitable: false,
            functionalityReplace: '',
            functionalityOutputParameters: '[]',
        }, window.context.oneTimeProposalTemplate, lines, descriptions, undefined, undefined, postFixedLines);
    };

    context.transfer = async function transfer(tokenAddress, amounts, sendTos, tokenId, payload) {
        (sendTos = !sendTos ? [] : sendTos instanceof Array ? sendTos : [sendTos]);
        if(sendTos.length === 0) {
            return context.view.emit('message', 'You must specify at least a valid Ethereum address to proceed', 'error');
        }
        amounts = amounts instanceof Array ? amounts : [amounts];
        var amount = 0;
        for(var i = 0; i < sendTos.length; i++) {
            sendTos[i] = window.web3.utils.toChecksumAddress(sendTos[i]);
            if(amounts.length -1 < i) {
                amounts.push(amounts[0]);
            }
            amount += parseFloat(amounts[i] = (amounts[i] + '').split(',').join(''));
            amounts[i] = window.toDecimals(amounts[i], 18);
        }
        if(!tokenId && amount <= 0) {
            return context.view.emit('message', 'You must specify a number greater 0 to proceed', 'error');
        }
        var amountWei = window.toDecimals(amount, 18);
        amount = window.formatMoney(amount);
        tokenAddress = tokenAddress ? window.web3.utils.toChecksumAddress(tokenAddress) : tokenAddress;
        var symbol = 'ETH';
        try {
            tokenAddress && (symbol = await window.blockchainCall(window.newContract(window.context.votingTokenAbi, tokenAddress).methods.symbol));
        } catch(e) {
            symbol = 'NFT'
        }
        var walletAddress = await window.blockchainCall(context.view.props.element.dFO.methods.getMVDWalletAddress);
        var balanceOf = !tokenAddress ? await window.web3.eth.getBalance(walletAddress) : await window.blockchainCall(window.newContract(window.context.votingTokenAbi, tokenAddress).methods.balanceOf, walletAddress);
        if(!tokenId && parseInt(amountWei) > parseInt(balanceOf)) {
            return context.view.emit('message', 'Specified amount to burn is greater than the total available balance', 'error');
        }
        if(tokenId) {
            var erc721 = window.newContract(window.context.ERC721Abi, tokenAddress);
            if(context.view.props.element.walletAddress.toLowerCase() !== (await window.blockchainCall(erc721.methods.ownerOf, tokenId)).toLowerCase()) {
                return context.view.emit('message', 'Cannot transfer not-owned NFT', 'error');
            }
        }
        tokenAddress = tokenAddress || 'address(0)';
        context.view.emit('message');
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
        window.sendGeneratedProposal(context.view.props.element, {
            title: descriptions[0],
            functionalityName: '',
            functionalityMethodSignature: 'callOneTime(address)',
            functionalitySubmitable: false,
            functionalityReplace: '',
            functionalityOutputParameters: '[]',
        }, window.context.oneTimeProposalTemplate, lines, descriptions, undefined, undefined, postFixedLines);
    };
};