var ProposalsController = function (view) {
    var context = this;
    context.view = view;

    context.proposalTopic = window.web3.utils.sha3('Proposal(address)');
    context.proposalCheckedTopic = window.web3.utils.sha3('ProposalCheck(address)');
    context.proposalSetTopic = window.web3.utils.sha3('ProposalSet(address,bool)');
    context.blockLimit = 40000;

    context.updateBalance = async function updateBalance() {
        context.view.setState({myBalance: !window.walletAddress ? '0' : await window.blockchainCall(context.view.props.element.token.methods.balanceOf, window.walletAddress)});
    };

    context.loadSurveys = async function loadSurveys(element, surveys, terminatedSurveys, myBalance, currentBlock, toBlock) {
        if(!context.view || !context.view.mountDate) {
            return;
        }
        var mountedDate = context.view.mountDate;
        if(!element) {
            context.loading = true;
            context.view.setState({surveys: null, terminatedSurveys: null});
        }
        element = element || context.view.props.element;
        if(element !== context.view.props.element) {
            return;
        }
        if(!myBalance || !currentBlock) {
            myBalance = myBalance || !window.walletAddress ? '0' : await window.blockchainCall(element.token.methods.balanceOf, window.walletAddress);
            if(!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                return;
            }
            currentBlock = currentBlock || parseInt(await window.web3.eth.getBlockNumber());
            if(!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                return;
            }
            context.view.setState({myBalance, currentBlock});
        }
        surveys = surveys || {};
        terminatedSurveys = terminatedSurveys || {};
        toBlock = toBlock || currentBlock;
        if (toBlock <= element.startBlock) {
            delete context.loading;
            return context.view.setState({surveys, terminatedSurveys});
        }
        try {
            var fromBlock = toBlock - context.blockLimit;
            fromBlock = fromBlock < element.startBlock ? element.startBlock : fromBlock;
            var list = await window.getLogs({
                address: element.dFO.options.allAddresses,
                topics: [
                    context.proposalTopic
                ],
                fromBlock: fromBlock,
                toBlock: toBlock
            });
            if(!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                return;
            }
            for (var i = list.length - 1; i >= 0; i--) {
                await context.loadSurvey(element, list[i], currentBlock, surveys, terminatedSurveys, mountedDate);
                if(!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                    return;
                }
                context.view.setState({
                    surveys: context.loading && (!surveys || Object.keys(surveys).length === 0) ? null : surveys, 
                    terminatedSurveys: context.loading && (!terminatedSurveys || Object.keys(terminatedSurveys).length === 0) ? null : terminatedSurveys
                });
            }
            return context.loadSurveys(element, surveys, terminatedSurveys, myBalance, currentBlock, fromBlock);
        } catch (e) {
            context.view.emit('message', e.message || e, "error");
        }
    };

    context.loadSurvey = async function loadSurvey(element, logData, currentBlock, surveys, terminatedSurveys, mountedDate) {
        try {
            if(!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                return;
            }
            var address = window.web3.eth.abi.decodeParameter('address', logData.data);
            if(!address || address === window.voidEthereumAddress) {
                return;
            }
            var key = logData.blockNumber + '_' + logData.id;
            var survey = surveys[key] || terminatedSurveys[key] || {};
            delete surveys[key];
            delete terminatedSurveys[key];
            survey.key = key;
            survey.id = logData.id;
            survey.raisedBy = logData.address.toLowerCase();
            survey.address = address;
            survey.startBlock = logData.blockNumber;
            var set = await window.getLogs({
                address: element.dFO.options.allAddresses,
                topics: [
                    context.proposalSetTopic,
                    window.web3.eth.abi.encodeParameter('address', survey.address)
                ],
                fromBlock: element.startBlock,
                toBlock: currentBlock
            });
            if(!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                return;
            }
            survey.terminated = (survey.checkedTimes = set.length) > 0;
            set.length > 0 && (survey.terminationData = set[0]);
            var checkedTimes = await window.getLogs({
                address: element.dFO.options.allAddresses,
                topics: [
                    context.proposalCheckedTopic,
                    window.web3.eth.abi.encodeParameter('address', survey.address)
                ],
                fromBlock: element.startBlock,
                toBlock: currentBlock
            });
            if(!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                return;
            }
            survey.checkedTimes = checkedTimes.length;
            checkedTimes.length > 0 && (survey.lastCheckedBlock = checkedTimes[checkedTimes.length - 1].blockNumber);
            !survey.checkedTimes && survey.terminated && (survey.checkedTimes = 1);
            return (survey.checkedTimes ? terminatedSurveys : surveys)[key] = survey;
        } catch (e) {
            console.error(e);
        }
    };
};