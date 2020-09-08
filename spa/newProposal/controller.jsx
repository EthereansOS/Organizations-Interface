var NewProposalController = function(view) {
    var context = this;
    context.view = view;

    context.publish = function propose() {
        var data = context.checkData();
        data.functionalitySourceId = context.view.editor.contentTokenValue;
        data.functionalityAddress = context.view.editor.functionalityAddressValue;
        data.editor = context.view.editor;
        data.element = context.view.props.element;
        data.title = "New Proposal";
        window.showProposalLoader(data);
    };

    context.checkData = function checkData() {
        context.view.emit('message', '');
        var messages = [];
        var data = window.getData(context.view.domRoot);
        try {
            data.sourceCode = context.view.editor.editor.getValue().trim();
        } catch(e) {
        }
        try {
            data.functionalityMethodSignature = data.functionalityMethodSignature.split('_');
            data.functionalityMethodSignature.splice(0, 1);
            data.functionalityOutputParameters = data.functionalityMethodSignature.splice(data.functionalityMethodSignature.length - 1, 1)[0];
            data.functionalityMethodSignature = data.functionalityMethodSignature.join('_');
        } catch(e) {
        }

        data.selectedContract = context.view.selectedContract;

        var mandatoryFunctionalityProposalConstraints = data.functionalityMethodSignature && window.checkMandatoryFunctionalityProposalConstraints(data.selectedContract.abi, data.functionalityMethodSignature === 'callOneTime(address)');
        mandatoryFunctionalityProposalConstraints && messages.push(...mandatoryFunctionalityProposalConstraints);
        !data.functionalityReplace && !data.functionalityName && data.functionalityMethodSignature !== 'callOneTime(address)' && messages.push('Functionality name is mandatory');
        data.functionalityName && !data.selectedContract && messages.push('You need to insert a valid SmartCotract code and choose a method.');
        data.selectedContract && data.selectedContract.bytecode === '0x' && messages.push('You need to insert a valid SmartCotract code and choose a method.');
        (data.functionalityName || (!data.functionalityName && !data.functionalityReplace)) && !data.functionalityDescription && messages.push('Description is mandatory');
        (data.functionalityName || (!data.functionalityName && !data.functionalityReplace)) && !new RegExp(window.urlRegex).test(data.functionalityLink) && messages.push('Link must be a mandatory URL');
        data.functionalityName && data.functionalityReplace && !data.functionalityDescriptionUpdate && messages.push('Update description is mandatory');

        try {
            data.constructorArguments = window.getData(context.view.constructorArguments, true);
        } catch(e) {
            messages.push('Constructor arguments are mandatory');
        }

        if(messages.length > 0) {
            throw messages.join('\n');
        }

        return data;
    };

    context.loadStandardTemplate = async function loadStandardTemplate() {
        var compilers = await window.SolidityUtilities.getCompilers();
        var release = Object.keys(compilers.releases)[0];
        var template = await window.AJAXRequest('data/MicroserviceTemplate.sol');
        template = template.format(release);
        try {
            context.view.editor.editor.setValue(template);
        } catch(e) {
        }
    };
};