var WalletEnablerButton = React.createClass({
    getDefaultSubscriptions() {
        return {
            'ethereum/ping': this.forceUpdate
        };
    },
    onClick(e) {
        var event = e;
        var target = e.target;
        var _this = this;
        if(window.walletAddress) {
            return _this.props.onClick && _this.props.onClick.apply(_this.domRoot.parent().findReactComponent(), [e]);
        }
        window.ethereum.enable().then(() => {
            event.target = target;
            try {
                var unlock = !_this.props.onUnlock ? _this.props.onClick : _this.props.onUnlock === 'false' ? undefined : _this.props.onUnlock;
                unlock = unlock && unlock.apply(_this.domRoot.parent().findReactComponent(), [e]);
                if(unlock && unlock.then) {
                    return unlock.then(() => _this.forceUpdate()).catch(console.error);
                }
                if(!unlock) {
                    try {
                        event && event.preventDefault(true) && event.stopPropagation(true);
                    } catch(e) {
                    }
                }
            } catch(e) {
                console.error(e);
            }
            _this.forceUpdate();
        }).catch(() => {});
    },
    render() {
        var _this = this;
        if(!window.walletAddress || !this.props.childOnly) {
            var a = <a ref={ref => this.props.ref && this.props.ref(ref)} className={(!window.walletAddress && this.props.inactiveClassName) || this.props.className} onClick={this.onClick} href="javascript:;" type="button">
                {(!window.walletAddress && this.props.inactiveText) || this.props.children}
            </a>;
            a.props = a.props || {};
            Object.keys(this.props).forEach(key => {
                if(key.indexOf('data-') === 0) {
                    a.props[key] = _this.props[key];
                }
            });
            return (a);
        }
        return this.props.children;
    }
});