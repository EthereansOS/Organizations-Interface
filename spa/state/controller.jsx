var StateController = function (view) {
    var context = this;
    context.view = view;

    context.load = function load() {
        context.view.setState({stateElements: null, stateElementsAmount: null}, async function() {
            var stateElements = [];
            context.view.setState({stateElements, stateElementsAmount: parseInt(await window.blockchainCall(context.view.props.element.stateHolder.methods.getStateSize))});
            for(var i = 0; i < context.view.state.stateElementsAmount; i++) {
                var element = await window.blockchainCall(context.view.props.element.stateHolder.methods.getState, i);
                try {
                    element.value = element.dataType === 'bytes' || element.dataType === 'address' ? element.value : window.web3.eth.abi.decodeParameter(element.dataType, element.value);
                } catch(e) {
                    element.value = element.dataType !== 'string' ? element.value : window.web3.utils.toUtf8(element.value);
                }
                stateElements.push(element);
                context.view.setState({stateElements});
            }
        });
    };

    context.saveStateElement = async function saveStateElement(element, value, cumulative) {
        if(value === undefined || value === null || value === '') {
            throw "You must insert a valid value for " + element.name;
        }
        if(element.value === value) {
            return;
        }
        if(element.dataType === 'address' && !window.isEthereumAddress(value)) {
            throw "Value for " + element.name + " must be a valid Ethereum address";
        }
        if(element.dataType === 'uint256' && (isNaN(parseInt(value)) || parseInt(value) < 0)) {
            throw "Value for " + element.name + " must be a valid number greater or equal to 0";
        }
        value = element.dataType !== 'bool' ?  value : (value + '') === 'true';
        var quotes = element.dataType === 'string' ? '"' : "";
        var line = "holder.set" + (element.dataType.firstLetterToUpperCase()) + '("' + element.name + '", '  + quotes + value + quotes + ');';
        var description = "Changing " + element.name + " value from " + element.value + " to " + value;
        if(cumulative) {
            return {
                line,
                description
            }
        }
        window.sendOneTimeProposal(context.view.props.element, {title: "Proposal for " + description.firstLetterToLowerCase()}, window.context.oneTimeProposalTemplate, [line], [description]);
    };

    context.clearStateElement = async function clearStateElement(element, cumulative) {
        var line = 'holder.clear("' + element.name + '");';
        var description = "Clearing " + element.name + " value";
        if(cumulative === true) {
            return {
                line,
                description
            }
        }
        window.sendOneTimeProposal(context.view.props.element, {title: "Proposal for " + description.firstLetterToLowerCase()}, window.context.oneTimeProposalTemplate, [line], [description]);
    };

    context.changeAll = async function changeAll(elements) {
        var errors = [];
        var lines = [];
        var descriptions = [];
        for(var i in elements) {
            var element = elements[i];
            try {
                var data = await (element.clear ? context.clearStateElement(element.stateElement, true) : context.saveStateElement(element.stateElement, element.value, true));
                if(data) {
                    lines.push(data.line);
                    descriptions.push(data.description);
                }
            } catch(e) {
                errors.push(e.message || e);
            }
        }
        if(errors.length > 0) {
            throw errors.join('\n').trim();
        }
        if(lines.length === 0) {
            return;
        }
        window.sendOneTimeProposal(context.view.props.element, {title: descriptions.length > 1 ? "StateHolder change" : ("Proposal for " + descriptions[0].firstLetterToLowerCase())}, window.context.oneTimeProposalTemplate, lines, descriptions);
    };

    context.addNew = async function addNew(name, dataType, value) {
        if(value === undefined || value === null || value === '') {
            return;
        }
        name = name ? name.trim() : name;
        if(!name) {
            throw "Name is mandatory";
        }

        for(var i in context.view.state.stateElements) {
            if(name === context.view.state.stateElements[i].name) {
                throw name + " is already used for another state name";
            }
        }
        if(dataType === 'address' && !window.isEthereumAddress(value)) {
            throw "Value for " + name + " must be a valid Ethereum address";
        }
        if(dataType === 'uint256' && (isNaN(parseInt(value)) || parseInt(value) < 0)) {
            throw "Value for " + name + " must be a valid number greater or equal to 0";
        }
        value = dataType !== 'bool' ?  value : (value + '') === 'true';
        var quotes = dataType === 'string' ? '"' : "";
        var line = "holder.set" + (dataType.firstLetterToUpperCase()) + '("' + name + '", '  + quotes + value + quotes + ');';
        var description = "Setting " + name + " using value " + value;
        window.sendOneTimeProposal(context.view.props.element, {title: "Proposal for " + description.firstLetterToLowerCase()}, window.context.oneTimeProposalTemplate, [line], [description]);
    };
};