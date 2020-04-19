var DeployController = function (view) {
    var context = this;
    context.view = view;

    context.retrieveCurrentStepData = async function retrieveCurrentStepData(e, silent) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        context.view.emit('message');
        try {
            var data = (context.view.currentElement.getData && context.view.currentElement.getData()) || {};
            data.then && (data = await data);
            return context.view.data[context.view.state.step] = data || {};
        } catch (exception) {
            if(silent) {
                return;
            }
            context.view.emit('message', exception, 'error');
        }
    };

    context.getData = async function getData(e, silent) {
        if(!(await context.retrieveCurrentStepData(e, silent))) {
            return;
        }
        var data = {};
        context.view.data.map(it => it && Object.keys(it).map(key => data[key] = it[key]));
        return data;
    };

    context.next = async function next(e) {
        var data = await context.getData(e);
        if (context.view.state.step === context.view.steps.length || !data) {
            return;
        }
        context.view.setState({ allData: data, step: ++context.view.state.step });
    };

    context.back = async function back(e) {
        if (context.view.state.step === 0) {
            return;
        }
        await context.retrieveCurrentStepData(e, true);
        context.view.setState({ step: --context.view.state.step });
    };
};