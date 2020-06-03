var StateController = function (view) {
    var context = this;
    context.view = view;

    context.load = function load() {
        context.view.setState({stateElements: null, stateElementsAmount: null}, async function() {
            var stateElements = [];
            context.view.setState({stateElements, stateElementsAmount: parseInt(await window.blockchainCall(context.view.props.element.stateHolder.methods.getStateSize))});
            var json = await window.blockchainCall(context.view.props.element.stateHolder.methods.toJSON);
            json = JSON.parse(json.endsWith(',]') ? (json.substring(0, json.lastIndexOf(',]')) + ']') : json);
            for(var i in json) {
                var element = json[i];
                var methodName = 'get' + element.type.substring(0, 1).toUpperCase() + element.type.substring(1);
                element.value = await window.blockchainCall(context.view.props.element.stateHolder.methods[methodName], element.name);
                stateElements.push(element);
                context.view.setState({stateElements});
            }
        });
    };

    context.proposeStateElement = async function proposeStateElement(element, value, cumulative) {
        if(value === undefined || value === null || value === '') {
            throw "You must insert a valid value for " + element.name;
        }
        if(element.value === value) {
            return;
        }
        if(element.type === 'address' && !window.isEthereumAddress(value)) {
            throw "Value for " + element.name + " must be a valid Ethereum address";
        }
        if(element.type === 'uint256' && (isNaN(parseInt(value)) || parseInt(value) < 0)) {
            throw "Value for " + element.name + " must be a valid number greater or equal to 0";
        }
        value = element.type !== 'bool' ?  value : (value + '') === 'true';
        var quotes = element.type === 'string' ? '"' : "";
        var line = "holder.set" + (element.type.firstLetterToUpperCase()) + '("' + element.name + '", '  + quotes + value + quotes + ');';
        var description = "Changing " + element.name + " value from " + element.value + " to " + value;
        if(cumulative) {
            return {
                line,
                description
            }
        }
        window.sendGeneratedProposal(context.view.props.element, {title: "Proposal for " + description.firstLetterToLowerCase()}, window.context.stateHolderProposalTemplate, [line], [description]);
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
        window.sendGeneratedProposal(context.view.props.element, {title: "Proposal for " + description.firstLetterToLowerCase()}, window.context.stateHolderProposalTemplate, [line], [description]);
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
        window.sendGeneratedProposal(context.view.props.element, {title: descriptions.length > 1 ? "StateHolder change" : ("Proposal for " + descriptions[0].firstLetterToLowerCase())}, window.context.stateHolderProposalTemplate, lines, descriptions);
    };

    context.addNew = async function addNew(name, type, value) {
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
        if(type === 'address' && !window.isEthereumAddress(value)) {
            throw "Value for " + name + " must be a valid Ethereum address";
        }
        if(type === 'uint256' && (isNaN(parseInt(value)) || parseInt(value) < 0)) {
            throw "Value for " + name + " must be a valid number greater or equal to 0";
        }
        value = type !== 'bool' ?  value : (value + '') === 'true';
        var quotes = type === 'string' ? '"' : '';
        var line = "holder.set" + (type.firstLetterToUpperCase()) + '("' + name + '", '  + quotes + value + quotes + ');';
        var description = "Setting " + name + " using value " + value;
        window.sendGeneratedProposal(context.view.props.element, {title: "Proposal for " + description.firstLetterToLowerCase()}, window.context.stateHolderProposalTemplate, [line], [description]);
    };
};