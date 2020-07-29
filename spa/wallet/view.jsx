var Wallet = React.createClass({
    requiredScripts: [
        'spa/loaderMinimino.jsx',
    ],
    requiredModules : [
        'spa/tokenPicker'
    ],
    componentDidMount() {
        this.controller.loadWallets();
    },
    toggleProposal(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        var address = e && e.currentTarget.dataset.address;
        var type = e && e.currentTarget.dataset.type;
        var oldAddress = this.state && this.state[type + 'Proposal'];
        this.setState({swapProposal: null, poolProposal: null}, function() {
            if(!address || !type || oldAddress === address) {
                return;
            }
            var state = {};
            state[type + 'Proposal'] = address;
            _this.setState(state);
        });
    },
    renderSwapProposal(element) {
        return(<section>
            <h3>Swap Proposal</h3>
            <label>
                Amount:
                {'\u00a0'}
                <input ref={ref => this.amount = ref} type="number"/>
            </label>
            <label>
                Token:
                {'\u00a0'}
                <TokenPicker ref={ref => this.tokenPicker = ref} tokenAddress={element.address}/>
            </label>
            <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB" onClick={() => this.controller.swap(this.amount.value, element.address, this.tokenPicker.state && this.tokenPicker.state.selected && this.tokenPicker.state.selected.address)}>Swap</a>
        </section>);
    },
    renderPoolProposal(element) {
        return(<section>
            <h3>Pool Proposal</h3>
            <label>
                Amount:
                {'\u00a0'}
                <input ref={ref => this.firstAmount = ref} type="number"/>
            </label>
            <label>
                Token:
                {'\u00a0'}
                <TokenPicker ref={ref => this.tokenPicker = ref} tokenAddress={element.address}/>
            </label>
            <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB" onClick={() => this.controller.addToPool(element.address, this.tokenPicker.state && this.tokenPicker.state.selected && this.tokenPicker.state.selected.address, this.firstAmount.value)}>Add to Pool</a>
        </section>);
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
                    {_this.state && _this.state.tokens && _this.state.tokens.map(it => it.amount !== '0' && <li key={it.address} className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <section className="DFOWalletBalanceSingleT">
                                <img src={it.logo}></img>
                                <h3>{it.symbol} {it.amountDollars === undefined ? <LoaderMinimino/> : !it.amountDollars ? undefined : <span className="DFOLabelTitleInfosmall"> (${window.formatMoney(it.amountDollars)})</span>}</h3>
                            </section>
                            {it.amount !== undefined && <h5 className="DFOLabelTitleInfoM"><b>{window.fromDecimals(it.amount, it.decimals)}</b></h5>}
                            {it.amount === undefined && <LoaderMinimino/>}
                            <br/>
                            <a href="javascript:;" data-address={it.address} data-type='swap' onClick={this.toggleProposal} className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Swap Proposal</a>
                            <a href="javascript:;" data-address={it.address} data-type='pool' onClick={this.toggleProposal} className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Pool Proposal</a>
                            {_this.state && _this.state.swapProposal === it.address && this.renderSwapProposal(it)}
                            {_this.state && _this.state.poolProposal === it.address && this.renderPoolProposal(it)}
                        </section>
                    </li>)}
                </ul>
            </section>
        );
    }
});