var FunctionsController = function (view) {
    var context = this;
    context.view = view;

    context.loadFunctionalities = function loadFunctionalities() {
        var element = context.view.props.element;
        if(!context.view || !context.view.mountDate) {
            return;
        }
        var mountedDate = context.view.mountDate;
        var loop = async function loop(functionalityName) {
            var functionality = context.view.state.functionalities[functionalityName] = JSON.parse(await window.blockchainCall(context.view.props.element.functionalitiesManager.methods.functionalityToJSON, functionalityName));
            if(!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                return;
            }
            functionality.inputParameters = [];
            try {
                functionality.inputParameters = functionality.methodSignature.split(functionality.methodSignature.substring(0, functionality.methodSignature.indexOf('(') + 1)).join('').split(')').join('');
                functionality.inputParameters = functionality.inputParameters ? functionality.inputParameters.split(',') : [];
            } catch (e) {}
            try {
                functionality.code = functionality.code || await window.loadContent(functionality.sourceLocationId, functionality.sourceLocation);
                if(!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                    return;
                }
            } catch (e) {}
            functionality.description = window.extractHTMLDescription(functionality.code);
            functionality.compareErrors = await window.searchForCodeErrors(functionality.location, functionality.code, functionality.codeName, functionality.methodSignature, functionality.replaces, true);
            functionality.compareErrors && functionality.compareErrors.length > 0 && console.log(functionality.name, functionality.compareErrors.join(' - '));
            if(!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                return;
            }
            context.view.setState({functionalities: context.view.state.functionalities});
            setTimeout(async function() {
                if(!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                    return;
                }
                functionality.compareErrors = await window.searchForCodeErrors(functionality.location, functionality.code, functionality.codeName, functionality.methodSignature, functionality.replaces, true);
                functionality.compareErrors && functionality.compareErrors.length > 0 && console.log(functionality.name, functionality.compareErrors.join(' - '));
                if(!context.view || context.view.mountDate !== mountedDate || element !== context.view.props.element) {
                    return;
                }
                context.view.setState({functionalities: context.view.state.functionalities});
            }, 300);
        };
        context.view.state.functionalityNames.forEach(loop);
    };

    context.call = async function call(type, codeName, inputParameters, args, returnAbiParametersArray, needsSender) {
        inputParameters && needsSender && type !== 'read' && args.unshift(0);
        inputParameters && needsSender && args.unshift(window.voidEthereumAddress);
        inputParameters && (args = window.web3.eth.abi.encodeParameters(inputParameters, args));
        var data = await window.blockchainCall(context.view.props.element.dFO.methods[type], codeName, args);
        return type === 'read' ? context.stringifyParameters(window.web3.eth.abi.decodeParameters(returnAbiParametersArray, data)) : '';
    }

    context.stringifyParameters = function stringifyParameters(response) {
        var r = [];
        var l = parseInt(response.__length__);
        for (var i = 0; i < l; i++) {
            r.push(response[i + '']);
        }
        return JSON.stringify(r);
    };

    context.deleteFunction = async function deleteFunction(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var proposals = [{
            name: 'Publishing Proposal...',
            async call(data) {
                data.transaction = await window.blockchainCall(
                    data.element.dFO.methods.newProposal,
                    "",
                    data.emergency || false,
                    window.voidEthereumAddress,
                    0,
                    window.voidEthereumAddress,
                    false,
                    "",
                    "",
                    false,
                    false,
                    data.codeName
                );
                if (!data.element.minimumStaking) {
                    context.view.emit('loader/toggle', false);
                    context.view.emit('message', 'Proposal Sent!', 'info');
                    context.view.emit('section/change', 'Proposals');
                }
            }
        }];
        context.view.props.element.minimumStaking && proposals.push({
            name: 'Sending Initial ' + window.fromDecimals(context.view.props.element.minimumStaking, context.view.props.element.decimals) + ' ' + context.view.props.element.symbol + ' for Staking',
            async call(data) {
                await window.blockchainCall(data.element.token.methods.transfer, data.transaction.events.Proposal.returnValues.proposal, window.numberToString(data.element.minimumStaking));
                context.view.emit('loader/toggle', false);
                context.view.emit('message', 'Proposal Sent!', 'info');
                context.view.emit('section/change', 'Proposals');
            }
        });
        return context.view.emit('loader/toggle', true, proposals, {
            title: 'Propose to delete Functionalty "' + e.currentTarget.dataset.codename + '"',
            element: context.view.props.element,
            codeName: e.currentTarget.dataset.codename
        });
    }
};