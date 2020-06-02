var SequentialOps = React.createClass({
    requiredScripts: [
        'spa/loaderMini.jsx'
    ],
    go(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var target = this.goButton;
        if($(target).hasClass('disabled')) {
            return;
        }
        $(target).addClass('disabled');
        $(this.cancelButton).addClass('disabled');
        var _this = this;
        for(var i in _this.children) {
            var child = _this.children[i];
            delete child.loading;
            delete child.ko;
        }
        var index;
        for(var i in _this.children) {
            var child = _this.children[i];
            if(!child.ok) {
                index = i;
                break;
            }
        }
        index = parseInt(index);
        if(isNaN(index)) {
            return;
        }

        var current = _this.children[index];
        current.loading = true;
        _this.emit('message');
        _this.forceUpdate(function() {
            delete current.loading;
            current.call(_this.ctx).then(function() {
                target && $(target).removeClass('disabled');
                _this.cancelButton && $(_this.cancelButton).removeClass('disabled');
                current.ok = true;
                _this.forceUpdate(function() {
                    (_this.props.auto + '') === 'true' && _this.go();
                    _this.props.onCallback && _this.props.onCallback(index, index === _this.children.length - 1);
                });
            }).catch(function(e) {
                target && $(target).removeClass('disabled');
                _this.cancelButton && $(_this.cancelButton).removeClass('disabled');
                current.ko = true;
                _this.emit('message', e, 'error');
                _this.forceUpdate();
            });
        });
    },
    componentDidMount() {
        (this.props.start + '') === 'true' && this.go();
    },
    onCancel(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if($(this.cancelButton).hasClass('disabled')) {
            return;
        };
        this.emit('message');
        this.emit('loader/toggle', false);
    },
    render() {
        var _this = this;
        var element = undefined;
        var editor = undefined;
        if(_this.props.initialContext) {
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
        return(<div>
            <aside>Before leaving this page, make all the transactions listed. Otherwise the DFO will not be created successfully</aside>
            {_this.ctx.title && <h3>{_this.ctx.title}</h3>}
            <ol>
                {_this.children.map((it, i) => <li key={i}>
                        <p>{it.name}</p>
                        <span className={it.loading ? "loaderMinimino" : ""}>
                            {it.ok && <span>&#9989;</span>}
                            {it.ko && <span>&#9940;</span>}
                        </span>
                </li>)}
            </ol>
            {(_this.props.hideGoButton + '') !== 'true' && <div className="LetsGoPika">
            {(_this.props.showCancelButton + '') === 'true' && <a href="javascript:;" ref={ref => this.cancelButton = ref} onClick={this.onCancel}>Cancel</a>}
                <a href="javascript:;" className="LinkVisualButtonB" ref={ref => this.goButton = ref} onClick={this.go}>Deploy</a>
            </div>}
        </div>);
    }
});