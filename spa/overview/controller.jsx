var OverviewController = function (view) {
    var context = this;
    context.view = view;

    context.indexChange = function indexChange(data) {
        data.index = data.index || 0;
        data.link = data.link || "";

        if (!data.indexFile && !data.link) {
            return context.view.emit('message', 'You must specify an index or a Link to proceed', 'error');
        }
        if(data.index === context.view.props.element.index && data.link === context.view.props.element.link) {
            return;
        }
        if(data.linkCheck) {
            context.changeDistributed(data);
        }
        if(data.indexCheck) {
            context.changeDecentralized(data);
        }
    };

    context.changeDistributed = function changeDistributed(data) {
        if (data.link !== context.view.props.element.link && !new RegExp(window.urlRegex).test(data.link)) {
            return context.view.emit('message', 'Inserted link is not a valid URL', 'error');
        }
        var descriptions = ['DFO Hub - Utilities - Get Distributed Index', 'This functionality provides the link page which locates the DFO'];
        var updates = ['Setting Distributed Index value to ' + data.link];
        !context.view.props.element.link && descriptions.push(updates[0]);
        if(!data.link) {
            updates = ['Clearing Distributed Index'];
        }
        var template = !data.link ? undefined : JSON.parse(JSON.stringify(window.context.simpleValueProposalTemplate).split('type').join('string memory').split('value').join('\\\"' + data.link + '\\\"'));
        window.sendGeneratedProposal(context.view.props.element, {
            title: updates[0],
            functionalityName: data.link ? 'getLink' : '',
            functionalityMethodSignature: data.link ? 'getValue()' : '',
            functionalitySubmitable: false,
            functionalityReplace: (data.link && context.view.props.element.link) ? 'getLink' : '',
            functionalityOutputParameters: data.link ? '["string"]' : '',
        }, template, undefined, descriptions, updates);
    };

    context.changeDecentralized = function changeDecentralized(data) {
        var descriptions = ['DFO Hub - Utilities - Get Decentralized Index', 'This functionality provides the Base64 index containing the Decentralized Index page representing this DFO'];
        var updates = ['Setting Decentralized Index value'];
        if(!data.index) {
            updates = ['Clearing Decentralized Index'];
        }
        var template = !data.index ? undefined : JSON.parse(JSON.stringify(window.context.simpleValueProposalTemplate).split('type').join('uint256'));
        var split = isNaN(data.index) ? window.split(data.index) : undefined;
        window.sendGeneratedProposal(context.view.props.element, {
            title: updates[0],
            functionalityName: data.index ? 'getIndex' : '',
            functionalityMethodSignature: data.index ? 'getValue()' : '',
            functionalitySubmitable: false,
            functionalityReplace: (!data.index || context.view.props.element.index) ? 'getIndex' : '',
            functionalityOutputParameters: data.index ? '["uint256"]' : '',
            sequentialOps: split && [{
                name: 'Minting Index page (' + split.length + ' Txns)',
                async call(data) {
                    data.index = await window.mint(split);
                    data.updates = ['Setting Decentralized Index value to ' + data.index];
                    !context.view.props.element.index && descriptions.push(updates[0]);
                    data.template = JSON.parse(JSON.stringify(data.template).split('value').join(window.numberToString(data.index)));
                }
            }]
        }, template, undefined, descriptions, updates);
    };

    context.proposalLengthChange = function proposalLengthChange(data) {
        if(data.proposalLength === parseInt(context.view.props.element.blocks)) {
            return;
        }
        if(!data.proposalLength || isNaN(data.proposalLength) || data.proposalLength < 1) {
            return context.view.emit('message', 'You must specify a number greater than 0 to proceed', 'error');
        }
        var template = JSON.parse(JSON.stringify(window.context.simpleValueProposalTemplate).split('getValue()').join('getMinimumBlockNumberForSurvey()').split('type').join('uint256').split('value').join(data.proposalLength));
        window.sendGeneratedProposal(context.view.props.element, {
            title: 'Updating Proposal Length',
            functionalityName: 'getMinimumBlockNumberForSurvey',
            functionalitySubmitable: false,
            functionalityMethodSignature: 'getMinimumBlockNumberForSurvey()',
            functionalityReplace: 'getMinimumBlockNumberForSurvey',
            functionalityOutputParameters: '["uint256"]',
        }, template, undefined, ['Survey Length'], ['Survey Length updated to ' + data.proposalLength + ' blocks']);
    };

    context.emergencyLengthChange = function emergencyLengthChange(data) {
        if(data.minimumBlockNumberForEmergencySurvey === parseInt(context.view.props.element.minimumBlockNumberForEmergencySurvey)) {
            return;
        }
        if(!data.minimumBlockNumberForEmergencySurvey || isNaN(data.minimumBlockNumberForEmergencySurvey) || data.minimumBlockNumberForEmergencySurvey < 1) {
            return context.view.emit('message', 'You must specify a number greater than 0 to proceed', 'error');
        }
        var template = JSON.parse(JSON.stringify(window.context.simpleValueProposalTemplate).split('getValue()').join('getMinimumBlockNumberForEmergencySurvey()').split('type').join('uint256').split('value').join(data.minimumBlockNumberForEmergencySurvey));
        window.sendGeneratedProposal(context.view.props.element, {
            title: 'Updating Emergency Proposal Length',
            functionalityName: 'getMinimumBlockNumberForEmergencySurvey',
            functionalitySubmitable: false,
            functionalityMethodSignature: 'getMinimumBlockNumberForEmergencySurvey()',
            functionalityReplace: 'getMinimumBlockNumberForEmergencySurvey',
            functionalityOutputParameters: '["uint256"]',
        }, template, undefined, ['Emergency Survey Length'], ['Emergency Survey Length updated to ' + data.minimumBlockNumberForEmergencySurvey + ' blocks']);
    };

    context.emergencyPenaltyChange = function emergencyPenaltyChange(data) {
        var emergencySurveyStakingString = window.toDecimals(data.emergencySurveyStaking, context.view.props.element.decimals);
        data.emergencySurveyStaking = parseInt(emergencySurveyStakingString);
        if(data.emergencySurveyStaking === parseInt(context.view.props.element.emergencySurveyStaking)) {
            return;
        }
        if(isNaN(data.emergencySurveyStaking) || data.emergencySurveyStaking < 0) {
            return context.view.emit('message', 'You must specify a number greater or equal to 0 to proceed', 'error');
        }
        if(data.emergencySurveyStaking > parseInt(context.view.props.element.totalSupply)) {
            return context.view.emit('message', 'Specified amount exceedes Total Voting Token Supply', 'error');
        }
        var template = JSON.parse(JSON.stringify(window.context.simpleValueProposalTemplate).split('getValue()').join('getEmergencySurveyStaking()').split('type').join('uint256').split('value').join(emergencySurveyStakingString));
        window.sendGeneratedProposal(context.view.props.element, {
            title: 'Updating Emergency Proposal Stake',
            functionalityName: 'getEmergencySurveyStaking',
            functionalitySubmitable: false,
            functionalityMethodSignature: 'getEmergencySurveyStaking()',
            functionalityReplace: 'getEmergencySurveyStaking',
            functionalityOutputParameters: '["uint256"]',
        }, template, undefined, ['Emergency Survey Staking'], ['Emergency Survey Staking updated to ' + window.fromDecimals(data.emergencySurveyStaking, context.view.props.element.decimals) + ' Voting Tokens']);
    };

    context.quorumChange = async function quorumChange(data) {
        var originalQuorum = window.numberToString(data.quorum);
        var quorumString = window.toDecimals(data.quorum, context.view.props.element.decimals);
        data.quorum = parseInt(quorumString);
        if(data.quorum === parseInt(context.view.props.element.quorum)) {
            return;
        }
        if(isNaN(data.quorum) || data.quorum < 0) {
            return context.view.emit('message', 'You must specify a number greater than or equal to 0 to proceed', 'error');
        }
        if(data.quorum > parseInt(context.view.props.element.totalSupply)) {
            return context.view.emit('message', 'Specified amount exceedes Total Voting Token Supply', 'error');
        }
        var descriptions = ['DFO Hub - Utilities - Get Quorum', 'This functionality returns the quorum value needed to accept a Survey'];
        var updates = ['Setting quorum value to ' + originalQuorum + ' ' + context.view.props.element.symbol];
        !context.view.props.element.quorum && descriptions.push(updates[0]);
        if(data.quorum === 0) {
            updates = ['Clearing quorum'];
        }
        var template = !data.quorum ? undefined : JSON.parse(JSON.stringify(window.context.simpleValueProposalTemplate).split('type').join('uint256').split('value').join(quorumString));
        window.sendGeneratedProposal(context.view.props.element, {
            title: updates[0],
            functionalityName: data.quorum ? 'getQuorum' : '',
            functionalityMethodSignature: data.quorum ? 'getValue()' : '',
            functionalitySubmitable: false,
            functionalityReplace: (data.quorum === 0 || parseInt(context.view.props.element.quorum)) ? 'getQuorum' : '',
            functionalityOutputParameters: data.quorum ? '["uint256"]' : '',
        }, template, undefined, descriptions, updates);
    };

    context.proposalStakeChange = function proposalStakeChange(data) {
        var originalMinimumStaking = window.numberToString(data.minimumStaking);
        var minimumStakingString = window.toDecimals(data.minimumStaking, context.view.props.element.decimals);
        data.minimumStaking = parseInt(minimumStakingString);
        if(data.minimumStaking === parseInt(context.view.props.element.minimumStaking)) {
            return;
        }
        if(isNaN(data.minimumStaking) || data.minimumStaking < 0) {
            return context.view.emit('message', 'You must specify a number greater than or equal to 0 to proceed', 'error');
        }
        if(data.minimumStaking > parseInt(context.view.props.element.totalSupply)) {
            return context.view.emit('message', 'Specified amount exceedes Total Voting Token Supply', 'error');
        }
        var descriptions = ['DFO Hub - Utilities - Get Proposal Stake', 'This functionality provides the amount of voting tokens needed to be staked to make a new proposal'];
        var updates = ['Setting Proposal Stake value to ' + originalMinimumStaking + ' ' + context.view.props.element.symbol];
        !context.view.props.element.minimumStaking && descriptions.push(updates[0]);
        if(data.minimumStaking === 0) {
            updates = ['Clearing Proposal Stake'];
        }
        var template = !data.minimumStaking ? undefined : JSON.parse(JSON.stringify(window.context.simpleValueProposalTemplate).split('type').join('uint256').split('value').join(minimumStakingString));
        window.sendGeneratedProposal(context.view.props.element, {
            title: updates[0],
            functionalityName: data.minimumStaking ? 'getSurveyMinimumStaking' : '',
            functionalityMethodSignature: data.minimumStaking ? 'getValue()' : '',
            functionalitySubmitable: false,
            functionalityReplace: (data.minimumStaking === 0 || parseInt(context.view.props.element.minimumStaking)) ? 'getSurveyMinimumStaking' : '',
            functionalityOutputParameters: data.minimumStaking ? '["uint256"]' : '',
        }, template, undefined, descriptions, updates);
    };

    context.surveySingleRewardChange = function surveySingleRewardChange(data) {
        var originalSurveySingleReward = window.numberToString(data.surveySingleReward);
        var surveySingleRewardString = window.toDecimals(data.surveySingleReward, context.view.props.element.decimals);
        data.surveySingleReward = parseInt(surveySingleRewardString);
        if(data.surveySingleReward === parseInt(context.view.props.element.surveySingleReward)) {
            return;
        }
        if(isNaN(data.surveySingleReward) || data.surveySingleReward < 0) {
            return context.view.emit('message', 'You must specify a number greater than or equal to 0 to proceed', 'error');
        }
        if(data.surveySingleReward > parseInt(context.view.props.element.totalSupply)) {
            return context.view.emit('message', 'Specified amount exceedes Total Voting Token Supply', 'error');
        }
        var descriptions = ['DFO Hub - Utilities - Get Dev Incentives', 'This functionality provides the amount of voting tokens needed to be staked to make a new proposal'];
        var updates = ['Setting Dev Incentives value to ' + originalSurveySingleReward + ' ' + context.view.props.element.symbol];
        !context.view.props.element.surveySingleReward && descriptions.push(updates[0]);
        if(data.surveySingleReward === 0) {
            updates = ['Clearing Dev Incentives'];
        }
        var template = !data.surveySingleReward ? undefined : JSON.parse(JSON.stringify(window.context.simpleValueProposalTemplate).split('type').join('uint256').split('value').join(surveySingleRewardString));
        window.sendGeneratedProposal(context.view.props.element, {
            title: updates[0],
            functionalityName: data.surveySingleReward ? 'getSurveySingleReward' : '',
            functionalityMethodSignature: data.surveySingleReward ? 'getValue()' : '',
            functionalitySubmitable: false,
            functionalityReplace: (data.surveySingleReward === 0 || parseInt(context.view.props.element.surveySingleReward)) ? 'getSurveySingleReward' : '',
            functionalityOutputParameters: data.surveySingleReward ? '["uint256"]' : '',
        }, template, undefined, descriptions, updates);
    };

    context.votesHardCapChange = function votesHardCapChange(data) {
        var originalVotesHardCap = window.numberToString(data.votesHardCap);
        var votesHardCapString = window.toDecimals(data.votesHardCap, context.view.props.element.decimals);
        data.votesHardCap = parseInt(votesHardCapString);
        if(data.votesHardCap === parseInt(context.view.props.element.votesHardCap)) {
            return;
        }
        if(isNaN(data.votesHardCap) || data.votesHardCap < 0) {
            return context.view.emit('message', 'You must specify a number greater than or equal to 0 to proceed', 'error');
        }
        if(data.votesHardCap > parseInt(context.view.props.element.totalSupply)) {
            return context.view.emit('message', 'Specified amount exceedes Total Voting Token Supply', 'error');
        }
        var descriptions = ['DFO Hub - Utilities - Get Votes Hard Cap', 'If a proposal reaches a fixed number of voting tokens (example the 90% of the total Token supply) for "Approve" or "Disapprove" it, the proposal automatically ends, independently from the duration rule.'];
        var updates = ['Setting Votes Hard Cap value to ' + originalVotesHardCap + ' ' + context.view.props.element.symbol];
        !context.view.props.element.votesHardCap && descriptions.push(updates[0]);
        if(data.votesHardCap === 0) {
            updates = ['Clearing Votes Hard Cap'];
        }
        var template = !data.votesHardCap ? undefined : JSON.parse(JSON.stringify(window.context.simpleValueProposalTemplate).split('getValue()').join('getVotesHardCap()').split('type').join('uint256').split('value').join(votesHardCapString));
        window.sendGeneratedProposal(context.view.props.element, {
            title: updates[0],
            functionalityName: data.votesHardCap ? 'getVotesHardCap' : '',
            functionalityMethodSignature: data.votesHardCap ? 'getVotesHardCap()' : '',
            functionalitySubmitable: false,
            functionalityReplace: (data.votesHardCap === 0 || parseInt(context.view.props.element.votesHardCap)) ? 'getVotesHardCap' : '',
            functionalityOutputParameters: data.votesHardCap ? '["uint256"]' : '',
        }, template, undefined, descriptions, updates);
    };

    context.votesHardCapChange = function votesHardCapChange(data) {
        var originalVotesHardCap = window.numberToString(data.votesHardCap);
        var votesHardCapString = window.toDecimals(data.votesHardCap, context.view.props.element.decimals);
        data.votesHardCap = parseInt(votesHardCapString);
        if(data.votesHardCap === parseInt(context.view.props.element.votesHardCap)) {
            return;
        }
        if(isNaN(data.votesHardCap) || data.votesHardCap < 0) {
            return context.view.emit('message', 'You must specify a number greater than or equal to 0 to proceed', 'error');
        }
        if(data.votesHardCap > parseInt(context.view.props.element.totalSupply)) {
            return context.view.emit('message', 'Specified amount exceedes Total Voting Token Supply', 'error');
        }
        var descriptions = ['DFO Hub - Utilities - Get Votes Hard Cap', 'If a proposal reaches a fixed number of voting tokens (example the 90% of the total Token supply) for "Approve" or "Disapprove" it, the proposal automatically ends, independently from the duration rule.'];
        var updates = ['Setting Votes Hard Cap value to ' + originalVotesHardCap + ' ' + context.view.props.element.symbol];
        !context.view.props.element.votesHardCap && descriptions.push(updates[0]);
        if(data.votesHardCap === 0) {
            updates = ['Clearing Votes Hard Cap'];
        }
        var template = !data.votesHardCap ? undefined : JSON.parse(JSON.stringify(window.context.simpleValueProposalTemplate).split('getValue()').join('getVotesHardCap()').split('type').join('uint256').split('value').join(votesHardCapString));
        window.sendGeneratedProposal(context.view.props.element, {
            title: updates[0],
            functionalityName: data.votesHardCap ? 'getVotesHardCap' : '',
            functionalityMethodSignature: data.votesHardCap ? 'getVotesHardCap()' : '',
            functionalitySubmitable: false,
            functionalityReplace: (data.votesHardCap === 0 || parseInt(context.view.props.element.votesHardCap)) ? 'getVotesHardCap' : '',
            functionalityOutputParameters: data.votesHardCap ? '["uint256"]' : '',
        }, template, undefined, descriptions, updates);
    };

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
        if(amount <= 0) {
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
        var descriptions = [`Minting ${amount} more ${context.view.props.element.symbol}${sendTos.length === 0 ? '' : ` and transfering them to selected addresses`}`];
        window.sendGeneratedProposal(context.view.props.element, {
            title: descriptions[0],
            functionalityName: '',
            functionalityMethodSignature: 'callOneTime(address)',
            functionalitySubmitable: false,
            functionalityReplace: '',
            functionalityOutputParameters: '[]',
        }, window.context.oneTimeProposalTemplate, lines, descriptions, undefined, undefined, postFixedLines);
    };

    context.burn = async function burn(tokenAddress, amount, mine) {
        if(parseFloat(amount) <= 0) {
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
        var descriptions = [`Burning ${amount} ${await window.blockchainCall(token.methods.symbol)}`];
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

    context.fairInflation = async function fairInflation(fairInflation) {
        var transfers = {};
        for(var i = 0; i < fairInflation.swapCouples.length; i++){
            fairInflation.swapCouples[i].from = window.web3.utils.toChecksumAddress(fairInflation.swapCouples[i].from);
            fairInflation.swapCouples[i].to = window.web3.utils.toChecksumAddress(fairInflation.swapCouples[i].to);
            fairInflation.swapCouples[i].amount = window.toDecimals((fairInflation.swapCouples[i].amount + '').split(',').join(''), 18);
            transfers[fairInflation.swapCouples[i].from] = transfers[fairInflation.swapCouples[i].from] || {amount : '0'};
            transfers[fairInflation.swapCouples[i].from].amount = window.web3.utils.toBN(transfers[fairInflation.swapCouples[i].from].amount).add(window.web3.utils.toBN(fairInflation.swapCouples[i].amount)).toString();
        }
        var selectedSolidityVersion = Object.entries((await window.SolidityUtilities.getCompilers()).releases)[0];
        var functionalityReplace = '';
        (await window.loadFunctionalityNames(context.view.props.element)).forEach(it => functionalityReplace = functionalityReplace || (it === 'fairInflation' ? 'fairInflation' : ''));
        var title = ((functionalityReplace ? 'Replace' : 'New') + ' Fair Inflation');
        var sourceCode = `
/* Discussion:
 * https://${context.view.props.element.ens ? `${context.view.props.element.ens}.` : ''}dfohub.eth?ensd=${context.view.props.element.ens ? `${context.view.props.element.ens}.` : ''}dfohub.eth
 */
/* Description:
 * ${title}
 */
${!functionalityReplace ? null : `/* Update:
 * New code
 */`}
pragma solidity ^${selectedSolidityVersion[0]};

contract FairInflationFunctionality {

    function onStart(address, address) public {
        IMVDProxy proxy = IMVDProxy(msg.sender);
        IStateHolder stateHolder = IStateHolder(proxy.getStateHolderAddress());
        stateHolder.setAddress("fairInflation.uniswapV2RouterAddress", ${fairInflation.uniswapV2RouterAddress});
        stateHolder.setUint256("fairInflation.blockLimit", ${fairInflation.blockLimit});
${!fairInflation.lastBlock ? 'null' : `        stateHolder.setUint256("fairInflation.lastBlock", ${fairInflation.lastBlock});`}
        ${Object.entries(transfers).map((values, i) =>`
        stateHolder.setAddress("fairInflation.transfers[${i}].tokenAddress", ${values[0]});
        stateHolder.setUint256("fairInflation.transfers[${i}].amount", ${values[1].amount});
`.trim()).join('\n').trim()}
        stateHolder.setUint256("fairInflation.transfers.length", ${Object.keys(transfers).length});
        ${fairInflation.swapCouples.map((it, i) => `
        stateHolder.setAddress("fairInflation.swapCouples[${i}].from", ${it.from});
        stateHolder.setAddress("fairInflation.swapCouples[${i}].to", ${it.to});
        stateHolder.setUint256("fairInflation.swapCouples[${i}].amount", ${it.amount});
`.trim()).join('\n').trim()}
        stateHolder.setUint256("fairInflation.swapCouples.length", ${fairInflation.swapCouples.length});
    }

    function onStop(address) public {
        IStateHolder stateHolder = IStateHolder(IMVDProxy(msg.sender).getStateHolderAddress());
        stateHolder.clear("fairInflation.uniswapV2RouterAddress");
        stateHolder.clear("fairInflation.blockLimit");
        stateHolder.clear("fairInflation.lastBlock");
        (, bytes memory lengthBytes) = stateHolder.clear("fairInflation.transfers.length");
        uint256 length = _toUint256(lengthBytes);
        string memory iString = "0";
        uint256 i = 0;
        for(i = 0; i < length; i++) {
            stateHolder.clear(string(abi.encodePacked("fairInflation.transfers[", iString = _toString(i), "].tokenAddress")));
            stateHolder.clear(string(abi.encodePacked("fairInflation.transfers[", iString, "].amount")));
        }
        (, lengthBytes) = stateHolder.clear("fairInflation.swapCouples.length");
        length = _toUint256(lengthBytes);
        iString = "0";
        for(i = 0; i < length; i++) {
            stateHolder.clear(string(abi.encodePacked("fairInflation.swapCouples[", iString = _toString(i), "].from")));
            stateHolder.clear(string(abi.encodePacked("fairInflation.swapCouples[", iString, "].to")));
            stateHolder.clear(string(abi.encodePacked("fairInflation.swapCouples[", iString, "].amount")));
        }
    }

    receive() external payable {
    }

    function fairInflation() public {
        IMVDProxy proxy = IMVDProxy(msg.sender);
        IStateHolder stateHolder = IStateHolder(proxy.getStateHolderAddress());

        require(block.number >= (stateHolder.setUint256("fairInflation.lastBlock", block.number) + stateHolder.getUint256("fairInflation.blockLimit")), "Too early to call fairInflation again!");

        IUniswapV2Router uniswapV2Router = IUniswapV2Router(stateHolder.getAddress("fairInflation.uniswapV2RouterAddress"));
        address wethAddress = uniswapV2Router.WETH();
        address dfoWalletAddress = proxy.getMVDWalletAddress();

        uint256 length = stateHolder.getUint256("fairInflation.transfers.length");
        string memory iString = "0";
        uint256 i = 0;
        for(i = 0; i < length; i++) {
            address tokenAddress = stateHolder.getAddress(string(abi.encodePacked("fairInflation.transfers[", iString = _toString(i), "].tokenAddress")));
            proxy.transfer(address(this), stateHolder.getUint256(string(abi.encodePacked("fairInflation.transfers[", iString, "].amount"))), tokenAddress != wethAddress ? tokenAddress : address(0));
        }

        length = stateHolder.getUint256("fairInflation.swapCouples.length");
        for(i = 0; i < length; i++) {
            _swap(stateHolder, uniswapV2Router, dfoWalletAddress, wethAddress, _toString(i));
        }
    }

    function _swap(IStateHolder stateHolder, IUniswapV2Router uniswapV2Router, address dfoWalletAddress, address wethAddress, string memory iString) private {
        address fromAddress = stateHolder.getAddress(string(abi.encodePacked("fairInflation.swapCouples[", iString, "].from")));
        if(fromAddress == address(0)) {
            return;
        }
        uint256 amount = stateHolder.getUint256(string(abi.encodePacked("fairInflation.swapCouples[", iString, "].amount")));
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
        path[1] = stateHolder.getAddress(string(abi.encodePacked("fairInflation.swapCouples[", iString, "].to")));
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
            element : context.view.props.element,
            sourceCode,
            contractName: 'FairInflationFunctionality',
            selectedSolidityVersion : selectedSolidityVersion[1],
            title,
            functionalityName: 'fairInflation',
            functionalityMethodSignature: 'fairInflation()',
            functionalitySubmitable: true,
            functionalityReplace,
            functionalityOutputParameters: '[]',
        });
    };

    context.stake = async function stake(startBlock, pools, tiers, stakingContractAddress) {
        var selectedSolidityVersion = Object.entries((await window.SolidityUtilities.getCompilers()).releases)[0];
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
            it.minCap = window.toDecimals(it.minCap, 18);
            it.hardCap = window.toDecimals(it.hardCap, 18);
        });
        var dFOStakeSourceCode = (await window.AJAXRequest('data/StakingContractTemplate.sol')).format(selectedSolidityVersion[0], window.web3.utils.toChecksumAddress(window.context.uniSwapV2FactoryAddress), window.web3.utils.toChecksumAddress(window.context.uniSwapV2RouterAddress));
        var functionalityReplace = '';
        (await window.loadFunctionalityNames(context.view.props.element)).forEach(it => functionalityReplace = functionalityReplace || (it === 'stakingTransfer' ? 'stakingTransfer' : ''));
        var title = ((functionalityReplace ? 'Replace' : 'New') + ' Staking Transfer Functionality');
        var getSourceCode = function getSourceCode(contract) {
            contract = window.web3.utils.toChecksumAddress(contract);
            return `
/* Discussion:
 * https://${context.view.props.element.ens ? `${context.view.props.element.ens}.` : ''}dfohub.eth?ensd=${context.view.props.element.ens ? `${context.view.props.element.ens}.` : ''}dfohub.eth
 */
/* Description:
 * ${title}
 */
${!functionalityReplace ? null : `/* Update:
 * New code
 */`}
pragma solidity ^${selectedSolidityVersion[0]};

contract StakingTransferFunctionality {

    function onStart(address, address) public {
        IMVDProxy proxy = IMVDProxy(msg.sender);
        IStateHolder stateHolder = IStateHolder(proxy.getStateHolderAddress());
        stateHolder.setBool(_toStateHolderKey("staking.transfer.authorized", _toString(${contract})), true);
        ${tiers.map((it, i) => `
        stateHolder.setUint256("staking.tiers[${i}].minCap", ${it.minCap});
        stateHolder.setUint256("staking.tiers[${i}].hardCap", ${it.hardCap});
`).join('\n').trim()}
        stateHolder.setUint256("staking.tiers.length", ${tiers.length});
    }

    function onStop(address) public {
        IStateHolder stateHolder = IStateHolder(IMVDProxy(msg.sender).getStateHolderAddress());
        stateHolder.clear(_toStateHolderKey("staking.transfer.authorized", _toString(${contract})));
        ${tiers.map((it, i) => `
        stateHolder.clear("staking.tiers[${i}].minCap");
        stateHolder.clear("staking.tiers[${i}].hardCap");
`).join('\n').trim()}
        stateHolder.clear("staking.tiers.length");
    }

    function stakingTransfer(address sender, uint256, uint256 value, address receiver) public {
        IMVDProxy proxy = IMVDProxy(msg.sender);

        require(IStateHolder(proxy.getStateHolderAddress()).getBool(_toStateHolderKey("staking.transfer.authorized", _toString(sender))), "Unauthorized action!");

        proxy.transfer(receiver, value, proxy.getToken());
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
        }
        window.showProposalLoader({
            element : context.view.props.element,
            contractName: 'StakingTransferFunctionality',
            selectedSolidityVersion : selectedSolidityVersion[1],
            title,
            functionalityName: 'stakingTransfer',
            functionalityMethodSignature: 'stakingTransfer(address,uint256,uint256,address)',
            functionalityNeedsSender : true,
            functionalitySubmitable: true,
            functionalityReplace,
            functionalityOutputParameters: '[]',
            stakingContractAddress,
            sourceCode : 'placeHolder',
            sequentialOps : [{
                name : 'Deploying Staking Contract',
                async call(data) {
                    var stakingContract = (await window.SolidityUtilities.compile(dFOStakeSourceCode, data.selectedSolidityVersion)).optimized.DFOStake;
                    var args = [
                        stakingContract.abi,
                        stakingContract.bytecode,
                        startBlock,
                        context.view.props.element.doubleProxyAddress,
                        pools,
                        timeWindows,
                        rewardMultipliers,
                        rewardDividers,
                        rewardSplitTranches
                    ];
                    data.sourceCode = getSourceCode(data.stakingContractAddress || (await window.createContract.apply(window, args)).options.address);
                    console.log(dFOStakeSourceCode);
                    console.log(data.sourceCode);
                }
            }]
        });
    };
};