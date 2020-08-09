var SequentialOps = React.createClass({
    requiredScripts: [
        'spa/loaderMini.jsx'
    ],
    go(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var target = this.goButton;
        if ($(target).hasClass('disabled')) {
            return;
        }
        $(target).addClass('disabled');
        this.advancedButton && $(this.cancelButton).addClass('disabled');
        this.advancedButton && $(this.advancedButton).addClass('disabled');
        var _this = this;
        for (var i in _this.children) {
            var child = _this.children[i];
            delete child.loading;
            delete child.ko;
        }

        var index = this.getIndex();
        var current = _this.children[index];
        current.loading = true;
        _this.emit('message');
        _this.forceUpdate(function () {
            var onStart = function() {
                _this.unsubscribe('transaction/start', onStart);
                current.transacting = true;
                _this.forceUpdate();
            };
            _this.subscribe('transaction/start', onStart);
            var include = $(_this.list.children('li.child-' + index)[0]).children().find('input.include[type="checkbox"]')[0];
            include && (include.disabled = true);
            var transactionHash = $('input.transactionHash[type="text"][data-i="' + index + '"]')[0];
            transactionHash && (transactionHash.disabled = true);
            current.transactionHash = current.bypass === true ? undefined : current.transactionHash;
            (current.transactionHash ? window.web3.eth.getTransactionReceipt(current.transactionHash).then(transaction => current.onTransaction(_this.ctx, transaction)) : current.call(_this.ctx, current.bypass)).then(function () {
                delete current.loading;
                delete current.transacting;
                target && $(target).removeClass('disabled');
                _this.cancelButton && $(_this.cancelButton).removeClass('disabled');
                _this.advancedButton && $(_this.advancedButton).removeClass('disabled');
                current.ok = true;
                _this.forceUpdate(function () {
                    _this.props.onCallback && _this.props.onCallback(index, index === _this.children.length - 1);
                });
            }).catch(function (e) {
                delete current.loading;
                delete current.transacting;
                include && (include.disabled = false);
                transactionHash && (transactionHash.disabled = false);
                target && $(target).removeClass('disabled');
                _this.cancelButton && $(_this.cancelButton).removeClass('disabled');
                _this.advancedButton && $(_this.advancedButton).removeClass('disabled');
                current.ko = (e.message || e) !== 'stopped' && (e.message || e).toLowerCase().indexOf("user denied") === -1;
                current.ko && _this.emit('message', e.message || e, 'error');
                _this.forceUpdate();
            });
        });
    },
    stop(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.emit('transaction/stop');
        this.cancelButton && $(this.cancelButton).removeClass('disabled');
        this.advancedButton && $(this.advancedButton).removeClass('disabled');
        var index = this.getIndex();
        index = isNaN(index) ? this.children.length - 1 : index;
        delete this.children[index].loading;
        delete this.children[index].transacting;
        this.forceUpdate();
    },
    onCancel(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if ($(this.cancelButton).hasClass('disabled')) {
            return;
        };
        this.emit('message');
        this.emit('loader/toggle', false);
    },
    onBypassChange(e) {
        this.children[e.currentTarget.dataset.i].bypass = !e.currentTarget.checked;
        var transactionHash = $('input.transactionHash[type="text"][data-i="' + e.currentTarget.dataset.i + '"]')[0];
        transactionHash && (transactionHash.disabled = !e.currentTarget.checked);
        transactionHash && (transactionHash.value = '');
        transactionHash && delete this.children[e.currentTarget.dataset.i].transactionHash;
    },
    onTransactionHash(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.children[e.currentTarget.dataset.i].transactionHash = e.currentTarget.value;
    },
    getIndex() {
        var index;
        for (var i in this.children) {
            var child = this.children[i];
            if (!child.ok) {
                index = i;
                break;
            }
        }
        return parseInt(index);
    },
    toggleAdvanced(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if($(e.currentTarget).hasClass('disabled')) {
            return;
        }
        var _this = this;
        this.setState({advanced: !(this.state && this.state.advanced)}, function() {
            if(this.state.advanced) {
                return;
            }
            for(var i = 0; i < _this.children.length; i++) {
                var child = _this.children[i];
                if(!child.ok) {
                    delete child.transactionHash;
                }
            }
        });
    },
    render() {
        var _this = this;
        var element = undefined;
        var editor = undefined;
        if (_this.props.initialContext) {
            element = _this.props.initialContext.element;
            delete _this.props.initialContext.element;
            editor = _this.props.initialContext.editor;
            delete _this.props.initialContext.editor;
        }
        _this.ctx = _this.ctx || (_this.props.initialContext ? JSON.parse(JSON.stringify(_this.props.initialContext)) : {});
        element && (_this.ctx.element = element);
        element && _this.props.initialContext && (_this.props.initialContext.element = element);
        editor && (_this.ctx.editor = editor);
        editor && _this.props.initialContext && (_this.props.initialContext.editor = editor);
        _this.children = _this.children || _this.props.children;
        var index = this.getIndex();
        index = isNaN(index) ? _this.children.length - 1 : index;
        var actionName = _this.children[index].actionName || (index == 0 ? 'Start' : index === _this.children.length - 1 ? 'Finish' : 'Next');
        return (<div>
            <aside>Before leaving this page, make all the transactions listed. Otherwise the entire operation will not be completed successfully</aside>
            {_this.ctx.title && <h3>{_this.ctx.title}</h3>}
            <ol ref={ref => _this.list = $(ref)}>
                {_this.children.map((it, i) => <li key={i} className={'child-' + i}>
                    <label>
                        {it.bypassable && <input type="checkbox" className="include" ref={ref => ref && (ref.checked = !it.bypass)} disabled={it.ok} data-i={i} onChange={this.onBypassChange}/>}
                        <p><b>{it.name}</b></p>
                        {it.onTransaction && ((this.state && this.state.advanced && !it.ok) || (it.ok && it.transactionHash)) && [
                            <p><b>{'\u00a0'}or{'\u00a0'}</b></p>,
                            <input type="text" className="transactionHash" ref={ref => ref && (ref.value = it.transactionHash || '')} disabled={it.ok} data-i={i} placeholder="Place a already-done Txn Hash" onKeyUp={this.onTransactionHash} onChange={this.onTransactionHash}/>
                        ]}
                        <span className={it.loading ? "loaderMinimino" : ""}>
                            {it.ok && <span>&#9989;</span>}
                            {it.ko && <span>&#9940;</span>}
                        </span>
                        {it.loading && it.transacting && <span>{'\u00a0'}<a href="javascript:;" className="LinkVisualButton" onClick={this.stop}>Stop</a></span>}
                        {it.description && <span className="Pistombrillo">{it.description}</span>}
                    </label>
                </li>)}
            </ol>
            {(_this.props.hideGoButton + '') !== 'true' && <div className="LetsGoPika">
                {(_this.props.showCancelButton + '') === 'true' && <a href="javascript:;" ref={ref => this.cancelButton = ref} onClick={this.onCancel}>Cancel</a>}
                <a href="javascript:;" className={"LinkVisualButtonB" + (this.state && this.state.advanced ? " Edited" : "")} onClick={this.toggleAdvanced} ref={ref => this.advancedButton = ref}>Recovery</a>
                <a href="javascript:;" className="LinkVisualButtonB" ref={ref => this.goButton = ref} onClick={this.go}>{actionName}</a>
            </div>}
        </div>);
    }
});