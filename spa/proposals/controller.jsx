var ProposalsController = function (view) {
    var context = this;
    context.view = view;

    context.proposalTopic = window.web3.utils.sha3('Proposal(address)');
    context.proposalSetTopic = window.web3.utils.sha3('ProposalSet(address,bool)');
    context.transferTopic = window.web3.utils.sha3('Transfer(address,address,uint256)');
    context.blockLimit = 40000;

    context.loadSurveys = async function loadSurveys(refresh) {
        if (context.loading) {
            return;
        }
        context.loading = !refresh;
        var dfo = context.view.props.element.dFO.options.address;
        var currentBlock = parseInt(await window.web3.eth.getBlockNumber());
        var toBlock = currentBlock;
        var myBalance = !window.walletAddress ? 0 : await window.blockchainCall(context.view.props.element.token.methods.balanceOf, window.walletAddress);
        var surveys = refresh ? context.view.state && context.view.state.surveys : null;
        var terminatedSurveys = refresh ? context.view.state && context.view.state.terminatedSurveys : null;
        var loop = async function () {
            try {
                if (!context.loading || dfo !== context.view.props.element.dFO.options.address) {
                    delete context.loading;
                    return context.view.setState({ surveys: null, terminatedSurveys: null }, context.loadSurveys);
                }
                var fromBlock = toBlock - context.blockLimit;
                fromBlock = fromBlock < context.view.props.element.startBlock ? context.view.props.element.startBlock : fromBlock;
                if (toBlock === context.view.props.element.startBlock) {
                    delete context.loading;
                    return context.view.setState({ surveys: surveys || {}, terminatedSurveys: terminatedSurveys || {} }, context.updateErrors);
                }
                var list = await window.getLogs({
                    address: context.view.props.element.dFO.options.allAddresses,
                    topics: [
                        context.proposalTopic
                    ],
                    fromBlock: fromBlock,
                    toBlock: toBlock
                });
                if (!context.loading || dfo !== context.view.props.element.dFO.options.address) {
                    delete context.loading;
                    return context.view.setState({ surveys: null, terminatedSurveys: null }, context.loadSurveys);
                }
                for (var i = list.length - 1; i >= 0; i--) {
                    var survey = await context.loadSurvey(list[i], currentBlock, myBalance);
                    var copy = (surveys = surveys || {})[survey.id] || (terminatedSurveys = terminatedSurveys || {})[survey.id] || {};
                    Object.keys(copy).forEach(key => survey[key] = survey[key] || copy[key]);
                    if (!context.loading || dfo !== context.view.props.element.dFO.options.address) {
                        delete context.loading;
                        return context.view.setState({ surveys: null, terminatedSurveys: null }, context.loadSurveys);
                    }
                    if (!survey) {
                        continue;
                    }
                    var set = await window.getLogs({
                        address: context.view.props.element.dFO.options.allAddresses,
                        topics: [
                            context.proposalSetTopic,
                            window.web3.eth.abi.encodeParameter('address', survey.address)
                        ],
                        fromBlock: context.view.props.element.startBlock,
                        toBlock: currentBlock
                    });
                    if (!context.loading || dfo !== context.view.props.element.dFO.options.address) {
                        delete context.loading;
                        return context.view.setState({ surveys: null, terminatedSurveys: null }, context.loadSurveys);
                    }
                    (set.length === 0 ? (surveys = surveys || {}) : (terminatedSurveys = terminatedSurveys || {}))[survey.id] = survey;
                    set.length > 0 && (survey.terminationTransactionHash = set[0].transactionHash);
                    set.length > 0 && surveys && refresh && delete surveys[survey.id];
                    set.length > 0 && (terminatedSurveys[survey.id].result = window.web3.eth.abi.decodeParameter('bool', set[0].data));
                    set.length > 0 && (terminatedSurveys[survey.id].resultBlock = set[0].blockNumber);
                    set.length > 0 && (terminatedSurveys[survey.id].withdrawed = survey.raisedBy === context.view.props.element.dFO.options.address.toLowerCase() ? parseInt(survey.myVotes) === 0 : true);
                    if (set.length > 0 && survey.myVotes > 0 && window.walletAddress && survey.raisedBy === context.view.props.element.dFO.options.address.toLowerCase()) {
                        var transfer = await window.getLogs({
                            address: context.view.props.element.token.options.address,
                            topics: [[
                                context.transferTopic,
                                window.web3.eth.abi.encodeParameter('address', survey.address),
                                window.web3.eth.abi.encodeParameter('address', window.walletAddress)
                            ]],
                            fromBlock: set[0].blockNumber
                        });
                        transfer.length > 0 && (terminatedSurveys[survey.id].withdrawed = true);
                    }
                    if (!context.loading || dfo !== context.view.props.element.dFO.options.address) {
                        delete context.loading;
                        return context.view.setState({ surveys: null, terminatedSurveys: null }, context.loadSurveys);
                    }
                    if (surveys && surveys[survey.id] && survey.raisedBy !== context.view.props.element.dFO.options.address.toLowerCase()) {
                        delete surveys[survey.id];
                    }
                    survey && Object.keys(survey).length === 0 && (survey = null);
                    terminatedSurveys && Object.keys(terminatedSurveys).length === 0 && (terminatedSurveys = null);
                    context.view.setState({ surveys, terminatedSurveys }, context.updateErrors);
                }
                toBlock = fromBlock;
                setTimeout(loop);
            } catch (e) {
                context.view.emit('message', e.message || e, "error");
            }
        };
        setTimeout(loop);
    };

    context.loadSurvey = async function loadSurvey(survey, currentBlock, myBalance) {
        try {
            var address = window.web3.eth.abi.decodeParameter('address', survey.data);
            if(!address || address === window.voidEthereumAddress) {
                return;
            }
            var contract = window.newContract(window.context.propsalAbi, address);
            var data = await window.blockchainCall(contract.methods.toJSON);
            data = JSON.parse(data.split('"returnAbiParametersArray":,').join('"returnAbiParametersArray":[],'));
            contract.data = data;
            data.id = survey.id;
            data.raisedBy = survey.address.toLowerCase();
            data.contract = contract;
            data.address = address;
            data.startBlock = survey.blockNumber;
            try {
                data.code = (!data.codeName && data.replaces) ? undefined : data.code || await window.loadContent(data.sourceLocationId, data.sourceLocation);
            } catch (ex) {
            }
            data.description = window.extractHTMLDescription(data.code, true);
            data.allVotes = await window.blockchainCall(contract.methods.getVotes);
            data.accepted = data.allVotes[0];
            data.refused = data.allVotes[1];
            data.allVotes = window.web3.utils.toBN(data.allVotes[0]).add(window.web3.utils.toBN(data.allVotes[1]));
            data.surveyEnd = data.endBlock <= (currentBlock + 1);
            data.myVotes = !window.walletAddress ? [0, 0] : await window.blockchainCall(contract.methods.getVote, window.walletAddress);
            data.myAccepts = data.myVotes[0];
            data.myRefuses = data.myVotes[1];
            data.myVotes = window.web3.utils.toBN(data.myVotes[0]).add(window.web3.utils.toBN(data.myVotes[1]));
            data.myBalance = myBalance;
            data.leading = false;
            try {
                data.leading = await window.blockchainCall(context.view.props.element.dFO.methods.read, 'checkSurveyResult', window.web3.eth.abi.encodeParameter('address', data.address));
                data.leading = window.web3.eth.abi.decodeParameter('bool', data.leading);
            } catch(e) {}
            return data;
        } catch (e) {
            console.error(e);
        }
    };

    context.updateErrors = async function updateErrors(data, name) {
        if (!context.loading) {
            return;
        }
        if (data === undefined) {
            await context.updateErrors((context.view.state && context.view.state.surveys) || null, "surveys");
            return context.updateErrors((context.view.state && context.view.state.terminatedSurveys) || null, "terminatedSurveys");
        }
        if (data === null) {
            return;
        }
        var state = {};
        state[name] = data;
        var keys = Object.keys(data);
        for (var i in keys) {
            var survey = data[keys[i]];
            if (survey.replacesCode || (survey.codeName && !survey.replaces) || (!survey.codeName && !survey.replaces && survey.compareErrors)) {
                if (!survey.compareErrors) {
                    survey.compareErrors = [];
                    context.view.setState(state);
                }
                continue;
            }
            if (survey.compareErrors) {
                continue;
            }
            survey.compareErrors = [];
            if(survey.codeName && survey.replaces) {
                await window.loadFunctionalities(context.view.props.element, undefined, true);
                for (var z in context.view.props.element.functionalities) {
                    var functionality = context.view.props.element.functionalities[z];
                    if (survey.replaces === functionality.codeName) {
                        survey.replacesCode = functionality.code;
                        break;
                    }
                }
            }
            if (survey.terminationTransactionHash) {
                var logs;
                try {
                    logs = (await window.web3.eth.getTransactionReceipt(survey.terminationTransactionHash)).logs;
                    if (!logs || logs.length < 2) {
                        continue;
                    }
                    try {
                        logs = window.web3.eth.abi.decodeParameters(["uint256", "address", "address", "bool", "string", "bool", "bool", "address", "uint256"], logs[1].data)[7];
                    } catch(e) {
                        try {
                            logs = window.web3.eth.abi.decodeParameters(["uint256", "address", "address", "bool", "string", "bool", "bool", "address", "uint256"], logs[2].data)[7];
                        } catch(ex) {
                            logs = survey.address;
                        }
                    }
                } catch (e) {
                    logs = undefined;
                }
                if (!logs || logs === window.voidEthereumAddress) {
                    continue;
                }
                var proposal = window.newContract(window.context.propsalAbi, logs);
                if (!proposal.data) {
                    proposal.data = await window.blockchainCall(proposal.methods.toJSON);
                    proposal.data = JSON.parse(proposal.data.split('"returnAbiParametersArray":,').join('"returnAbiParametersArray":[],'));
                }
                try {
                    proposal.data.code = (!proposal.data.codeName && proposal.data.replaces) ? undefined : proposal.data.code || await window.loadContent(proposal.data.sourceLocationId, proposal.data.sourceLocation);
                } catch (ex) {
                }
                survey.replacesCode = survey.replaces ? proposal.data.code : undefined;
            }
            survey.compareErrors = await window.searchForCodeErrors(survey.location, survey.code, survey.codeName, survey.methodSignature, survey.replaces);
            survey.code === survey.replacesCode && (delete survey.replacesCode);
            context.view.setState(state);
        }
    };

    context.interact = async function interact(survey, name, type, amount) {
        var method = survey.contract.methods[name === 'Withdraw All' ? 'retireAll' : name === 'Vote' ? type.toLowerCase() : (name.toLowerCase().split('switch').join('moveTo').split('withdraw').join('retire') + type)];
        context.view.emit('message', 'Performing ' + name + '...');
        if (name === 'Withdraw All') {
            await window.blockchainCall(method);
        } else {
            await window.blockchainCall(method, amount);
        }
        context.view.emit('message', 'Operation completed!');
        context.loadSurveys(true);
        context.view.emit('balances/refresh', context.view.props.element);
    };

    context.finalize = async function finalize(e, survey) {
        try {
            var target = $(e.currentTarget);
            var loader = $('<section class="loaderMinimino"/>').insertAfter(target.hide());
            context.view.emit('message', 'Finalizing Survey...');
            await window.blockchainCall(survey.contract.methods.terminate);
            context.view.emit('message', 'Survey Finalized! Enjoy Your Brand new Functionality! &#128526;');
            context.view.emit('element/update', context.view.props.element);
            context.loadSurveys(true);
        } catch (e) {
            context.view.emit('message', e.message || e, 'error');
        }
        loader.remove();
        target.show();
    };

    context.withdraw = async function withraw(e, survey) {
        try {
            var target = $(e.currentTarget);
            var loader = $('<section class="loaderMinimino"/>').insertAfter(target.hide());
            context.view.emit('message', 'Withdrawing...');
            await window.blockchainCall(survey.contract.methods.withdraw);
            context.view.emit('message', 'Operation completed!');
            context.loadSurveys(true);
            context.view.emit('balances/refresh', context.view.props.element);
        } catch (e) {
            context.view.emit('message', e.message || e, 'error');
        }
        loader.remove();
        target.show();
    };
};