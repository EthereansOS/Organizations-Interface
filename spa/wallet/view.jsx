var Wallet = React.createClass({
    requiredModules: [
        'spa/editor'
    ],
    requiredScripts: [
        'spa/loader.jsx',
        'spa/loaderMini.jsx',
        'spa/okBoomer.jsx',
        'spa/loaderMinimino'
    ],
    uploadFile(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var file = e.currentTarget.files[0];
        var _this = this;
        var reader = new FileReader();
        reader.addEventListener("load", function () {
            _this.indexValue.value = reader.result;
        }, false);
        reader.readAsDataURL(file);
    },
    changeElementInfo(e) {
        if (!e) {
            return;
        }
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var data = window.getData($($(e.currentTarget).parent()).parent());
        this.controller[this.state.change + 'Change'](data);
    },
    componentDidMount() {
        this.controller.loadWallets();
    },
    renderChangeButton(name) {
        var _this = this;
        if (!_this.props.edit) {
            return;
        }
        return (<a className={"LinkVisualButton LinkVisualButtonB" + (_this.state && _this.state.change === name ? " Editing" : "")} href="javascript:;" onClick={() => _this.setState({ change: _this.state && _this.state.change === name ? null : name })}>Change</a>);
    },
    renderChanger(args) {
        var _this = this;
        if (!_this.props.edit || !_this.state || !_this.state.change) {
            return;
        }
        for (var i in args) {
            var name = args[i];
            if (_this.state.change === name) {
                var method = _this['render' + name.substring(0, 1).toUpperCase() + name.substring(1) + 'Changer'];
                return (<section className="DFOFunctionIndexIcon">
                    {method && method()}
                    <aside>
                        <a href="javascript:;" className="LinkVisualButton LinkVisualButtonB" onClick={_this.changeElementInfo}>Propose</a>
                    </aside>
                </section>);
            }
        }
    },
    renderDefaultChanger(text, label, id, defaultValue) {
        return (
            <ul>
                <li>
                    <p ref={ref => ref && (ref.innerHTML = text)}>{text}</p>
                </li>
                <li>
                    <section>
                        <label htmlFor={id} ref={ref => ref && (ref.innerHTML = label)}>{label}</label>
                        <input className="DFOFunctionIndexIconText" id={id} type="number" min="0" ref={ref => ref && (ref.value = defaultValue)} />
                    </section>
                </li>
            </ul>
        );
    },
    render() {
        var _this = this;
        return (
            <section className="DFOOverview">
                <ul className="DFOHosting">
                    <section className="HostingCategoryTitle">
                        <h2>{_this.props.element.name} Balances {(!_this.state || _this.state.cumulativeAmountDollar === undefined || _this.state.cumulativeAmountDollar === null) ? <LoaderMinimino/> : <span>(Tracked: ${window.formatMoney(_this.state.cumulativeAmountDollar)})</span>} <a className="LinkVisualButton LinkVisualEthscan" target="_blank" href={window.getNetworkElement("etherscanURL") + "tokenHoldings?a=" + _this.props.element.walletAddress}>&#128142; Etherscan</a></h2>
                    </section>
                    {(!_this.state || !_this.state.tokens) && <LoaderMinimino/>}
                    {_this.state && _this.state.tokens && _this.state.tokens.map(it => it.amount !== 0 && <li key={it.address} className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <section className="DFOWalletBalanceSingleT">
                                <img src={it.address === window.voidEthereumAddress ? 'assets/img/eth-logo.png' : it.token === window.dfoHub.token ? 'assets/img/buidlv2-logo.png' : window.context.trustwalletImgURLTemplate.format(window.web3.utils.toChecksumAddress(it.address))}></img>
                                <h3>{it.symbol} {it.amountDollars === undefined ? <LoaderMinimino/> : !it.amountDollars ? undefined : <span className="DFOLabelTitleInfosmall"> (${window.formatMoney(it.amountDollars)})</span>}</h3>
                            </section>
                            {it.amount !== undefined && <h5 className="DFOLabelTitleInfoM"><b>{window.fromDecimals(it.amount, it.decimals)}</b></h5>}
                            {it.amount === undefined && <LoaderMinimino/>}
                            <br/>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Swap Proposal</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Pool Proposal</a>
                        </section>
                    </li>)}
                </ul>
            </section>
        );
    }
});