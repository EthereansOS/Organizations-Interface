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
        if(!data.emergencySurveyStaking || isNaN(data.emergencySurveyStaking) || data.emergencySurveyStaking < 0) {
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
            functionalityReplace: (data.quorum === 0 || context.view.props.element.quorum) ? 'getQuorum' : '',
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
            functionalityReplace: (data.minimumStaking === 0 || context.view.props.element.minimumStaking) ? 'getSurveyMinimumStaking' : '',
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
            functionalityReplace: (data.surveySingleReward === 0 || context.view.props.element.surveySingleReward) ? 'getSurveySingleReward' : '',
            functionalityOutputParameters: data.surveySingleReward ? '["uint256"]' : '',
        }, template, undefined, descriptions, updates);
    };
};