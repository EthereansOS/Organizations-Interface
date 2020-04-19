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
        if (data.link !== context.view.props.element.link && !new RegExp(window.urlRegex).test(data.link)) {
            return context.view.emit('message', 'Inserted link is not a valid URL', 'error');
        }
        window.sendOneTimeProposal(context.view.props.element, {
            title: 'Change Index',
            index: data.index,
            link: data.link,
            sequentialOps: [{
                name: data.index !== context.view.props.element.index && context.view.props.element.index ? 'Publishing new Index code' : 'Generating Smart Contract proposal',
                async call(data) {
                    var lines = [];
                    var descriptions = [];
                    if (data.link !== data.element.link) {
                        if (data.link) {
                            var text = 'Setting Link to ' + data.link;
                            data.element.link && (text = 'Changing ipfs from ' + context.view.props.element.link + ' to ' + data.link);
                            descriptions.push(text);
                            lines.push('holder.setString("link", "' + data.link + '");');
                        } else {
                            descriptions.push('Clearing Link');
                            lines.push('holder.clear("link");');
                        }
                    }
                    if (data.index !== data.element.index) {
                        if (data.index) {
                            data.index = isNaN(data.index) ? await window.mint(data.index, undefined, true) : data.index;
                            var text = 'Setting index to ' + data.index;
                            data.element.index && (text = 'Changing index from ' + data.element.index + ' to ' + data.index);
                            descriptions.push(text);
                            lines.push('holder.setUint256("index", ' + data.index + ');');
                        } else {
                            descriptions.push('Clearing index');
                            lines.push('holder.clear("index");');
                        }
                    }
                    var generatedAndCompiledContract = await window.generateAndCompileContract(window.context.oneTimeProposalTemplate, lines, descriptions);
                    data.sourceCode = generatedAndCompiledContract.sourceCode;
                    data.selectedContract = generatedAndCompiledContract.selectedContract;
                }
            }]
        });
    };

    context.surveySingleRewardChange = function surveySingleRewardChange(data) {
        data.surveySingleReward = window.toDecimals(data.surveySingleReward, context.view.props.element.decimals);
        if(data.surveySingleReward === parseInt(context.view.props.element.surveySingleReward)) {
            return;
        }
        if(isNaN(data.surveySingleReward) || data.surveySingleReward < 0) {
            return context.view.emit('message', 'You must specify a number greater than or equal to 0 to proceed', 'error');
        }
        if(data.surveySingleReward > parseInt(context.view.props.element.totalSupply)) {
            return context.view.emit('message', 'Specified amount exceedes Total Voting Token Supply', 'error');
        }
        var lines = ['holder.setUint256("surveySingleReward", ' + window.numberToString(data.surveySingleReward) + ');'];
        var descriptions = ['Setting Dev Incentives to ' + window.fromDecimals(data.surveySingleReward, context.view.props.element.decimals) + ' Voting Tokens'];
        if(data.surveySingleReward === 0) {
            lines = ['holder.clear("surveySingleReward");'];
            descriptions = ['Clearing Dev Incentives'];
        }
        window.sendOneTimeProposal(context.view.props.element, {title: 'Updating Dev Incentives'}, window.context.oneTimeProposalTemplate, lines, descriptions);
    };

    context.proposalLengthChange = function proposalLengthChange(data) {
        if(data.proposalLength === parseInt(context.view.props.element.blocks)) {
            return;
        }
        if(!data.proposalLength || isNaN(data.proposalLength) || data.proposalLength < 1) {
            return context.view.emit('message', 'You must specify a number greater than 0 to proceed', 'error');
        }
        var template = JSON.parse(JSON.stringify(window.context.uint256ProposalTemplate).split('call()').join('getMinimumBlockNumberForSurvey()').split('value').join(data.proposalLength));
        window.sendOneTimeProposal(context.view.props.element, {
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
        var template = JSON.parse(JSON.stringify(window.context.uint256ProposalTemplate).split('call()').join('getMinimumBlockNumberForEmergencySurvey()').split('value').join(data.minimumBlockNumberForEmergencySurvey));
        window.sendOneTimeProposal(context.view.props.element, {
            title: 'Updating Emergency Proposal Length',
            functionalityName: 'getMinimumBlockNumberForEmergencySurvey',
            functionalitySubmitable: false,
            functionalityMethodSignature: 'getMinimumBlockNumberForEmergencySurvey()',
            functionalityReplace: 'getMinimumBlockNumberForEmergencySurvey',
            functionalityOutputParameters: '["uint256"]',
        }, template, undefined, ['Emergency Survey Length'], ['Emergency Survey Length updated to ' + data.minimumBlockNumberForEmergencySurvey + ' blocks']);
    };

    context.emergencyPenaltyChange = function emergencyPenaltyChange(data) {
        data.emergencySurveyStaking = window.toDecimals(data.emergencySurveyStaking, context.view.props.element.decimals);
        if(data.emergencySurveyStaking === parseInt(context.view.props.element.emergencySurveyStaking)) {
            return;
        }
        if(!data.emergencySurveyStaking || isNaN(data.emergencySurveyStaking) || data.emergencySurveyStaking < 1) {
            return context.view.emit('message', 'You must specify a number greater than 0 to proceed', 'error');
        }
        if(data.emergencySurveyStaking > parseInt(context.view.props.element.totalSupply)) {
            return context.view.emit('message', 'Specified amount exceedes Total Voting Token Supply', 'error');
        }
        var template = JSON.parse(JSON.stringify(window.context.uint256ProposalTemplate).split('call()').join('getEmergencySurveyStaking()').split('value').join(window.numberToString(data.emergencySurveyStaking)));
        window.sendOneTimeProposal(context.view.props.element, {
            title: 'Updating Emergency Proposal Stake',
            functionalityName: 'getEmergencySurveyStaking',
            functionalitySubmitable: false,
            functionalityMethodSignature: 'getEmergencySurveyStaking()',
            functionalityReplace: 'getEmergencySurveyStaking',
            functionalityOutputParameters: '["uint256"]',
        }, template, undefined, ['Emergency Survey Staking'], ['Emergency Survey Staking updated to ' + window.fromDecimals(data.emergencySurveyStaking, context.view.props.element.decimals) + ' Voting Tokens']);
    };

    context.quorumChange = function quorumChange(data) {
        data.quorum = window.toDecimals(data.quorum, context.view.props.element.decimals);
        if(data.quorum === parseInt(context.view.props.element.quorum)) {
            return;
        }
        if(isNaN(data.quorum) || data.quorum < 0) {
            return context.view.emit('message', 'You must specify a number greater than or equal to 0 to proceed', 'error');
        }
        if(data.quorum > parseInt(context.view.props.element.totalSupply)) {
            return context.view.emit('message', 'Specified amount exceedes Total Voting Token Supply', 'error');
        }
        var lines = ['holder.setUint256("quorum", ' + window.numberToString(data.quorum) + ');'];
        var descriptions = ['Setting quorum to ' + window.fromDecimals(data.quorum, context.view.props.element.decimals) + ' Voting Tokens'];
        if(data.quorum === 0) {
            lines = ['holder.clear("quorum");'];
            descriptions = ['Clearing quorum'];
        }
        window.sendOneTimeProposal(context.view.props.element, {title: 'Updating Quorum Value'}, window.context.oneTimeProposalTemplate, lines, descriptions);
    };

    context.proposalStakeChange = function proposalStakeChange(data) {
        data.minimumStaking = window.toDecimals(data.minimumStaking, context.view.props.element.decimals);
        if(data.minimumStaking === parseInt(context.view.props.element.minimumStaking)) {
            return;
        }
        if(isNaN(data.minimumStaking) || data.minimumStaking < 0) {
            return context.view.emit('message', 'You must specify a number greater than or equal to 0 to proceed', 'error');
        }
        if(data.minimumStaking > parseInt(context.view.props.element.totalSupply)) {
            return context.view.emit('message', 'Specified amount exceedes Total Voting Token Supply', 'error');
        }
        var lines = ['holder.setUint256("minimumStaking", ' + window.numberToString(data.minimumStaking) + ');'];
        var descriptions = ['Setting Proposal Stake to ' + window.fromDecimals(data.minimumStaking, context.view.props.element.decimals) + ' Voting Tokens'];
        if(data.minimumStaking === 0) {
            lines = ['holder.clear("minimumStaking");'];
            descriptions = ['Clearing Proposal Stake'];
        }
        window.sendOneTimeProposal(context.view.props.element, undefined, window.context.oneTimeProposalTemplate, lines, descriptions);
    };
};