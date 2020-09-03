var Functions = React.createClass({
    requiredModules: [
        'spa/editor'
    ],
    requiredScripts: [
        'spa/loaderMini.jsx'
    ],
    getInitialState() {
        return {
            functionalities: {},
            functionalityNames: []
        };
    },
    change(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var target = e.target;
        var _this = this;
        var change = function change() {
            if(!_this.state.functionalities[target.dataset.codename].sourceLocationId === undefined) {
                return setTimeout(change, 100);
            }
            _this.emit('section/change', 'New Proposal', { codeName: target.dataset.codename, sourceLocation: _this.state.functionalities[target.dataset.codename].sourceLocation, sourceLocationId: _this.state.functionalities[target.dataset.codename].sourceLocationId, delete: target.dataset.delete });
        }
        change();
    },
    componentDidMount() {
        var _this = this;
        _this.mountDate = new Date().getTime() + "_" + Math.random();
        try {
            window.loadFunctionalityNames(_this.props.element).then(functionalityNames => _this.setState({functionalityNames: _this.props.element.functionalityNames = functionalityNames}, _this.controller.loadFunctionalities)).catch(e => window.loadFunctionalities(_this.props.element, () => _this.setState({functionalityNames: _this.props.element.functionalityNames, functionalities: _this.props.element.functionalities})).then(() => _this.forceUpdate()));
        } catch(e) {
            window.loadFunctionalities(_this.props.element, () => _this.setState({functionalities: _this.props.element.functionalities})).then(() => _this.forceUpdate());
        }
    },
    componentWillUnmount() {
        delete this.mountDate;
    },
    onClick(e, element) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var type = $(e.target).hasClass('RwWrite') ? 'submit' : 'read';
        var args = [];
        var _this = this;
        if (this[element.codeName + 'Input']) {
            this[element.codeName + 'Input'].children().each((i, elem) => {
                var $element = $($(elem).children()[0]);
                var val = $element.val();
                $element.is('input[type="number"]') && (val = parseInt(val));
                $element.is('select') && (val = val === 'true');
                val !== undefined && args.push(val);
            });
        }
        var _this = this;
        var r = (_this.state && _this.state.response) || [];
        delete r[element.codeName];
        this.emit('message');
        _this.setState({ response: r }, function () {
            _this.controller.call(type, element.codeName, element.inputParameters, args, element.returnAbiParametersArray, element.needsSender).then(r => {
                var response = ((_this.state && _this.state.response) || {});
                response[element.codeName] = r;
                _this.setState({ response });
            }).catch(e => _this.emit('message', e.message || e, "error"));
        });
    },
    renderInput(element) {
        if (element.isInternal || !element.methodSignature) {
            return;
        }
        return (<ul ref={ref => element.inputParameters && element.inputParameters.length > 0 && (this[element.codeName + 'Input'] = $(ref))}>
            {element.inputParameters.map((it, i) => (!element.needsSender || i > (element.submitable ? 1 : 0)) && <li key={it.codeName}>
                {(it === 'bytes32' || it === 'address' || it === 'string' || it.indexOf('uint') == 0) && <input type={it.indexOf('uint') == 0 ? "number" : "text"} min="0" placeholder={it === 'address' ? "address" : ""}></input>}
                {it === 'bool' && <select>
                    <option value="false" selected>false</option>
                    <option value="true">true</option>
                </select>}
            </li>)}
        </ul>);
    },
    render() {
        var _this = this;
        return (
            <section className="DFOOverview">
                {_this.state.functionalityNames && <ul className="DFOFunctionList">
                    {Object.keys(_this.state.functionalities).map(key => {
                        var it = _this.state.functionalities[key];
                        if(!it) {
                            return null;
                        }
                        var length = 0;
                        var more = true;
                        it.description = it.description || (it.methodSignature || it.code ? 'Loading Description...' : 'No description available');
                        try {
                            length = it.description.length > window.descriptionWordLimit ? window.descriptionWordLimit : it.description.length;
                            more = this.state && this.state.more === it.codeName;
                        } catch (e) {
                        }
                        return (
                            <li key={it.codeName}>
                                <section className="DFOFunctionEmoji">
                                    {it.compareErrors === undefined && <LoaderMinimino />}
                                    {it.compareErrors && <h4 title={(!it.compareErrors || it.compareErrors.length === 0) ? '' : ('There are some problems in this functionality:\n' + (it.compareErrors.join(';\n').trim()))} ref={ref => ref && (ref.innerHTML = (!it.compareErrors || it.compareErrors.length === 0) ? '&#128736;&#65039;' : '&#9763;&#65039;')}></h4>}
                                </section>
                                <section className="DFOFunctionTitle">
                                    <h5>{it.codeName}</h5>
                                </section>
                                <section className="DFOFunctionDescription">
                                    {it.description && <p>
                                        <span ref={ref => ref && (ref.innerHTML = it.description.substring(0, more ? it.description.length : length))} />
                                        {!more && length < it.description.length && ['... ', <a href="javascript:;" onClick={() => this.setState({ more: it.codeName })}>More</a>]}
                                        {more && length < it.description.length && [' ', <a href="javascript:;" onClick={() => this.setState({ more: null })}>Less</a>]}
                                    </p>}
                                </section>
                                <section className="DFOBtnViewSection">
                                    <section className="DFOFxTools">
                                        {it.code && <a className={"LinkVisualButton" + (this.state && this.state.opened === ('code_' + it.codeName) ? ' Editing' : '')} href="javascript:;" onClick={() => _this.setState({ opened: _this.state && _this.state.opened === ('code_' + it.codeName) ? null : ('code_' + it.codeName) })}>Code</a>}
                                        {it.methodSignature && <a className={"LinkVisualButton" + (this.state && this.state.opened === ('query_' + it.codeName) ? ' Editing' : '')} href="javascript:;" onClick={() => _this.setState({ opened: _this.state && _this.state.opened === ('query_' + it.codeName) ? null : ('query_' + it.codeName) })}>Query</a>}
                                    </section>
                                    {it.methodSignature && _this.props.edit && <section className="DFOFxTools">
                                        <a className="LinkVisualButton LinkVisualButtonB" href="javascript:;" data-codename={it.codeName} onClick={this.change}>Change</a>
                                        {it.codeName !== 'getMinimumBlockNumberForSurvey' && it.codeName !== 'getMinimumBlockNumberForEmergencySurvey' && it.codeName !== 'getEmergencySurveyStaking' && it.codeName !== 'checkSurveyResult' && <a className="LinkVisualButton LinkVisualButtonB" href="javascript:;" data-codename={it.codeName} onClick={this.controller.deleteFunction}>Delete</a>}
                                    </section>}
                                    {it.location && <a className="LinkVisualClassic" href={window.getNetworkElement('etherscanURL') + 'address/' + it.location} target="_blank">Contract</a>}
                                </section>
                                {this.state && this.state.opened === ('code_' + it.codeName) && <section className="DFOFunctionQuery">
                                    <Editor firstCode={it.code} />
                                </section>}
                                {this.state && this.state.opened === ('query_' + it.codeName) && <section className="DFOFunctionQuery">
                                    <section className="DFOFunctionQueryFX">
                                        <section className="DFOFunctionMethod">
                                            <h6>{it.methodSignature}</h6>
                                        </section>
                                        <section className="DFOBtnReadSection">
                                            {this.renderInput(it)}
                                            {!it.isInternal && it.submitable && <a className="LinkVisualButton RwWrite" onClick={e => _this.onClick(e, it)}>Submit</a>}
                                            {!it.isInternal && !it.submitable && <a className="LinkVisualButton RwRead" onClick={e => _this.onClick(e, it)}>Read</a>}
                                            {it.isInternal && <span className="RwIntern">Internal</span>}
                                        </section>
                                        {_this.state && _this.state.response && _this.state.response[it.codeName] && <section className="DFOBtnResultSection">
                                            <h6>{_this.state.response[it.codeName]}</h6>
                                        </section>}
                                    </section>
                                </section>}
                            </li>);
                    })}
                </ul>}
                {((!_this.state.functionalityNames || _this.state.functionalityNames.length === 0) && (!this.props.element.functionalities || Object.keys(this.props.element.functionalities).length !== this.props.element.functionalitiesAmount)) && <LoaderMini message="Loading Functionalities" />}
            </section>
        );
    }
});