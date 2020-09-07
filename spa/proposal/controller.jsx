var ProposalController = function (view) {
    var context = this;
    context.view = view;

    context.transferTopic = window.web3.utils.sha3('Transfer(address,address,uint256)');
    context.functionalitySetTopic = window.web3.utils.sha3('FunctionalitySet(string,address,string,address,uint256,address,bool,string,bool,bool,address)');

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
                    survey.hardCapReached = await window.blockchainCall(survey.contract.methods.isVotesHardCapReached);
                } catch (e) { }
            }
            if (survey.checkedTimes > 0) {
                survey.terminationData && (survey.terminationTransactionHash = survey.terminationData.transactionHash);
                survey.terminationData && (survey.result = window.web3.eth.abi.decodeParameter('bool', survey.terminationData.data));
                survey.terminationData && (survey.resultBlock = survey.terminationData.blockNumber);
                if (survey.withdrawed === undefined && parseInt(survey.myVotes) > 0) {
                    survey.withdrawed = true;
                    if (window.walletAddress && survey.raisedBy === element.dFO.options.address.toLowerCase()) {
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
                    if(survey.codeName !== 'getEmergencySurveyStaking' && survey.sourceLocationId === 0) {
                        delete survey.code;
                    }
                } catch (ex) {
                }
                if (!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                    return;
                }
                survey.description = window.extractHTMLDescription(survey.code, true);
                context.view.setState({ survey });
            }

            if (!survey.compareErrors) {
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

    context.tryLoadDiff = async function tryLoadDiff() {

        var element = context.view.props.element;
        if (!context.view || !context.view.mountDate || element !== context.view.props.element) {
            return;
        }
        var mountedDate = context.view.mountDate;
        var survey = {};
        Object.keys(context.view.state.survey).forEach(key => survey[key] = context.view.state.survey[key]);
        if (!survey.replaces || survey.replacesCode !== undefined) {
            return;
        }
        try {
            var sourceLocationId = survey.replacedCodeSourceLocationId;
            var sourceLocation = survey.replacedCodeSourceLocation;
            if (!survey.terminated) {
                var functionalityData = await window.blockchainCall(context.view.props.element.functionalitiesManager.methods.getFunctionalityData, survey.replaces);
                if (!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                    return;
                }
                sourceLocation = functionalityData[3];
                sourceLocationId = functionalityData[4];
            } else {
                var transactionReceipt = await window.web3.eth.getTransactionReceipt(survey.terminationTransactionHash);
                if (!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                    return;
                }
                for(var log of transactionReceipt.logs) {
                    if(log.topics[0].toLowerCase() !== context.functionalitySetTopic.toLowerCase()) {
                        continue;
                    }
                    var data = window.web3.eth.abi.decodeParameters(["string", "string", "address", "uint256", "bool", "string", "bool", "bool"], log.data);
                    sourceLocation = data[2];
                    sourceLocationId = data[3];
                    break;
                }
            }
            try {
                survey.replacesCode = await window.loadContent(sourceLocationId, sourceLocation);
            } catch (ex) {
                survey.replacesCode = null;
            }
            if (!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                return;
            }
            context.view.setState({ survey });
        } catch (e) {
            console.error(e);
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