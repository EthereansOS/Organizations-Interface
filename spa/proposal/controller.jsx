var ProposalController = function (view) {
    var context = this;
    context.view = view;

    context.proposalTopic = window.web3.utils.sha3('Proposal(address)');
    context.proposalSetTopic = window.web3.utils.sha3('ProposalSet(address,bool)');
    context.transferTopic = window.web3.utils.sha3('Transfer(address,address,uint256)');

    context.loadSurvey = async function loadSurvey() {
        var element = context.view.props.element;
        if (!context.view || !context.view.mountDate || element !== context.view.props.element) {
            return;
        }
        var mountedDate = context.view.mountDate;
        var survey = {};
        Object.keys(context.view.state.survey).forEach(key => survey[key] = context.view.state.survey[key]);
        try {

            if (!survey.contract) {
                survey.contract = window.newContract(window.context.propsalAbi, survey.address);
                survey.contract.data = survey;
                var data = await window.blockchainCall(survey.contract.methods.toJSON);
                if (!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                    return;
                }
                data = JSON.parse(data.split('"returnAbiParametersArray":,').join('"returnAbiParametersArray":[],'));
                Object.keys(data).forEach(key => survey[key] = data[key]);
            }

            survey.surveyEnd = survey.endBlock <= (context.view.props.currentBlock + 1);

            var allVotes = await window.blockchainCall(survey.contract.methods.getVotes);
            if (!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                return;
            }
            survey.accepted = window.web3.utils.toBN(allVotes[0]).toString();
            survey.refused = window.web3.utils.toBN(allVotes[1]).toString();
            survey.allVotes = window.web3.utils.toBN(allVotes[0]).add(window.web3.utils.toBN(allVotes[1])).toString();

            var myVotes = !window.walletAddress ? ['0', '0'] : await window.blockchainCall(survey.contract.methods.getVote, window.walletAddress);
            if (!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                return;
            }
            survey.myAccepts = window.web3.utils.toBN(myVotes[0]).toString();
            survey.myRefuses = window.web3.utils.toBN(myVotes[1]).toString();
            survey.myVotes = window.web3.utils.toBN(myVotes[0]).add(window.web3.utils.toBN(myVotes[1])).toString();

            if (!survey.surveyEnd || !survey.terminationData) {
                survey.leading = false;
                try {
                    survey.leading = await window.blockchainCall(element.dFO.methods.read, 'checkSurveyResult', window.web3.eth.abi.encodeParameter('address', survey.address));
                    if (!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                        return;
                    }
                    survey.leading = window.web3.eth.abi.decodeParameter('bool', survey.leading);
                } catch (e) { }
            }
            if (survey.checkedTimes > 0) {
                survey.terminationData && (survey.terminationTransactionHash = survey.terminationData.transactionHash);
                survey.terminationData && (survey.result = window.web3.eth.abi.decodeParameter('bool', survey.terminationData.data));
                survey.terminationData && (survey.resultBlock = survey.terminationData.blockNumber);
                if (survey.withdrawed === undefined && parseInt(survey.myVotes) > 0) {
                    survey.withdrawed = true;
                    if(window.walletAddress && survey.raisedBy === element.dFO.options.address.toLowerCase()) {
                        var transfer = await window.getLogs({
                            address: element.token.options.address,
                            topics: [
                                context.transferTopic,
                                window.web3.eth.abi.encodeParameter('address', survey.address),
                                window.web3.eth.abi.encodeParameter('address', window.walletAddress)
                            ],
                            fromBlock: survey.startBlock
                        });
                        if (!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                            return;
                        }
                        survey.withdrawed = transfer.length > 0;
                    }
                }
            }

            context.view.setState({ survey });

            if ((survey.codeName || !survey.replaces) && !survey.code) {
                try {
                    survey.code = await window.loadContent(survey.sourceLocationId, survey.sourceLocation);
                } catch (ex) {
                }
                if (!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                    return;
                }
                survey.description = window.extractHTMLDescription(survey.code, true);
                context.view.setState({ survey });
            }

            if (survey.replaces && !survey.replacesCode) {
                var sourceLocationId = survey.replacedCodeSourceLocationId;
                var sourceLocation = survey.replacedCodeSourceLocation;
                if (!survey.terminated) {
                    var functionalityData = await window.blockchainCall(window.dfoHub.functionalitiesManager.methods.getFunctionalityData, 'deployDFO');
                    if (!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                        return;
                    }
                    sourceLocation = functionalityData[3];
                    sourceLocationId = functionalityData[4];
                }
                try {
                    survey.replacesCode = await window.loadContent(sourceLocationId, sourceLocation);
                } catch (ex) {
                }
                if (!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                    return;
                }
                survey.description = window.extractHTMLDescription(survey.code, true);
            }

            if(!survey.compareErrors) {
                survey.compareErrors = await window.searchForCodeErrors(survey.location, survey.code, survey.codeName, survey.methodSignature, survey.replaces, true);
                if (!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                    return;
                }
                context.view.setState({ survey });
                survey.compareErrors = await window.searchForCodeErrors(survey.location, survey.code, survey.codeName, survey.methodSignature, survey.replaces);
                if (!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                    return;
                }
                context.view.setState({ survey });
            }
        } catch (e) {
            console.error(e);
        }
    };

    context.updateErrors = async function updateErrors(data, name) {
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
            if (survey.codeName && survey.replaces) {
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
                    } catch (e) {
                        try {
                            logs = window.web3.eth.abi.decodeParameters(["uint256", "address", "address", "bool", "string", "bool", "bool", "address", "uint256"], logs[2].data)[7];
                        } catch (ex) {
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
        context.view.emit('element/update', context.view.props.element);
        context.loadSurvey();
        context.view.emit('surveys/refresh');
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
            context.loadSurvey();
            context.view.emit('surveys/refresh');
            context.view.emit('balances/refresh', context.view.props.element);
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
            context.view.emit('element/update', context.view.props.element);
            context.loadSurvey();
            context.view.emit('surveys/refresh');
            context.view.emit('balances/refresh', context.view.props.element);
        } catch (e) {
            context.view.emit('message', e.message || e, 'error');
        }
        loader.remove();
        target.show();
    };
};