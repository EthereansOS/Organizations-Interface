var State = React.createClass({
    componentDidMount() {
        this.controller.load();
    },
    extractData(parent) {
        parent = $($(parent).parent());
        var value = parent.children().find('input');
        if (value.length > 1) {
            value = parent.children().find('input[type="radio"]:checked');
        }
        value = value.val();
        return {
            stateElement: this.state.stateElements[parent[0].dataset.i],
            value,
            clear: this.state.changeAll && (parent.children().find('.Editing').length > 0 || parent.children('.Editing').length > 0)
        }
    },
    changeStateElement(e) {
        (e && e.preventDefault && e.preventDefault(true)), (e && e.stopPropagation && e.stopPropagation(true));
        var _this = this;
        if (_this.state.changeAll) {
            return $(e.currentTarget).toggleClass('Editing');
        }
        var data = _this.extractData($($(e.currentTarget).parent()));
        _this.controller[e.currentTarget.innerHTML.toLowerCase() + 'StateElement'](data.stateElement, data.value).then(() => _this.setState({ change: null })).catch(error => _this.emit('message', error.message || error, 'error'));
    },
    changeAll(e) {
        (e && e.preventDefault && e.preventDefault(true)), (e && e.stopPropagation && e.stopPropagation(true));
        var _this = this;
        var stateElements = [];
        $(e.currentTarget).parent().children().find('li').each((i, elem) => stateElements.push(_this.extractData(elem.children[0])));
        _this.controller.changeAll(stateElements).then(() => _this.setState({ changeAll: _this.state && _this.state.changeAll ? null : true, change: null })).catch(error => _this.emit('message', error.message || error, 'error'));
    },
    onTypeChange(e) {
        (e && e.preventDefault && e.preventDefault(true)), (e && e.stopPropagation && e.stopPropagation(true));
        this.addNewInput && this.onInputRef(this.addNewInput[0]);
        this.addNewRadio && this.onRadioRef(this.addNewRadio[0]);
    },
    onInputRef(ref) {
        this.addNewInput = $(ref).show().attr('type', 'text');

        if (!ref || !this.addNewType) {
            return;
        }

        if (this.addNewType.value === 'bool') {
            return this.addNewInput.hide();
        }
        this.addNewType.value === 'uint256' && this.addNewInput.attr('type', 'number');
        this.addNewType.value === 'uint256' && this.addNewInput.attr('min', '0');
    },
    onRadioRef(ref) {
        this.addNewRadio = $(ref).show();
        if (!ref || !this.addNewType || this.addNewType.value !== 'bool') {
            return this.addNewRadio.hide();
        }
    },
    addNew(e) {
        (e && e.preventDefault && e.preventDefault(true)), (e && e.stopPropagation && e.stopPropagation(true));
        var _this = this;
        var name = this.addNewName.value;
        var type = this.addNewType.value;
        var inputValue = this.addNewInput.val();
        var checkedValue = this.addNewRadio.children().find('input[type="radio"]:checked').val() === 'true';
        this.controller.addNew(name, type, type === 'bool' ? checkedValue : inputValue).catch(error => _this.emit('message', error.message || error, 'error'));
    },
    renderStateElement(it, i) {
        var _this = this;
        return (<section className="DFOSingleState" data-i={i}>
            <div className="DFOSingleStateTN">
                <h5 className="DFOSingleStateN">{it.name}</h5>
                <aside className="DFOSingleStateT">&#128190; {it.type}</aside>
            </div>
            {_this.props.edit && (!_this.state || !_this.state.changeAll) && <a className={"LinkVisualButton LinkVisualButtonB" + (_this.state && _this.state.change === it.name ? " Editing" : "")} href="javascript:;" onClick={() => _this.setState({ change: _this.state && _this.state.change === it.name ? null : it.name })}>Change</a>}
            <h6 className="DFOSingleStateV">
                {(!_this.props.edit || !_this.state || (_this.state.change !== it.name && !_this.state.changeAll)) && (it.type !== 'address' ? <span>{it.value === true ? 'true' : it.value === false ? 'false' : it.value}</span> : <a href={window.getNetworkElement("etherscanURL") + "address/" + it.value} target="_blank">{it.value}</a>)}
                {_this.props.edit && _this.state && (_this.state.change === it.name || _this.state.changeAll) && it.type !== 'bool' && <input type={it.type === 'uint256' ? 'number' : 'text'} min="0" ref={ref => ref && (ref.value = it.value)} />}
                {_this.props.edit && _this.state && (_this.state.change === it.name || _this.state.changeAll) && it.type === 'bool' && <form>
                    <label>
                        <input name={it.name} type="radio" value="true" ref={ref => ref && (ref.checked = it.value === ref.value)} />
                        true
                    </label>
                    <label>
                        <input name={it.name} type="radio" value="false" ref={ref => ref && (ref.checked = it.value === ref.value)} />
                        false
                    </label>
                </form>}
                {_this.props.edit && (!_this.state || !_this.state.changeAll) && _this.state && _this.state.change === it.name && <a className="LinkVisualButton LinkVisualButtonB" href="javascript:;" onClick={_this.changeStateElement}>Propose</a>}
                {_this.props.edit && _this.state && (_this.state.change === it.name || _this.state.changeAll) && <a className="LinkVisualButton LinkVisualButtonB" href="javascript:;" onClick={_this.changeStateElement}>Clear</a>}
            </h6>
        </section>);
    },
    render() {
        var _this = this;
        return (
            <section className="DFOOverview">
                {_this.state && _this.state.stateElements && <ul className="DFOStateList">
                    {_this.state.stateElements.map((it, i) => <li key={it.name}>
                        {_this.renderStateElement(it, i)}
                    </li>
                    )}
                </ul>}
                {_this.state && _this.state.stateElementsAmount === 0 && <h2>This DFO does not contain any State Element</h2>}
                {/*_this.props.edit && <a className={"LinkVisualButton LinkVisualButtonB" + (_this.state && _this.state.changeAll ? " Editing" : "")} href="javascript:;" onClick={() => _this.setState({ changeAll: _this.state && _this.state.changeAll ? null : true, change: null })}>Change All</a>}
                {_this.props.edit && _this.state && _this.state.changeAll && <a className="LinkVisualButton LinkVisualButtonB" href="javascript:;" onClick={_this.changeAll}>Propose All</a>}
                {_this.props.edit && (!_this.state || (!_this.state.changeAll && !_this.state.change)) && <section>
                    <input ref={ref => _this.addNewName = ref} type="text" placeholder="Name" />
                    <select onChange={_this.onTypeChange} ref={ref => _this.addNewType = ref}>
                        {window.context.stateHolderTypes.map(it => <option key={it}>{it}</option>)}
                    </select>
                    <form ref={_this.onRadioRef}>
                        <label>
                            <input name="addNew" type="radio" value="true" />
                            true
                        </label>
                        <label>
                            <input name="addNew" type="radio" value="false" />
                            false
                        </label>
                    </form>
                    <input ref={_this.onInputRef} />
                    <a className="LinkVisualButton LinkVisualButtonB" href="javascript:;" onClick={_this.addNew}>Add New</a>
                </section>*/}
                {_this.state && _this.state.unsupportedRnDVersion && <h2>This R&D version is no longer supported because it is lower than 0.1.</h2>}
                {(!_this.state || !_this.state.stateElements || _this.state.stateElements.length !== _this.state.stateElementsAmount) && (!_this.state || !_this.state.unsupportedRnDVersion) && <LoaderMini message="Loading Elements" />}
            </section>
        );
    }
});