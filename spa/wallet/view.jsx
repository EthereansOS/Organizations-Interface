var Wallet = React.createClass({
    requiredScripts: [
        'spa/loaderMinimino.jsx',
        'assets/scripts/uniswapOps.js'
    ],
    requiredModules: [
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
        this.setState({ swapProposal: null, poolProposal: null, transferProposal: null }, function () {
            if (!address || !type || oldAddress === address) {
                return;
            }
            var state = {};
            state[type + 'Proposal'] = address;
            _this.setState(state);
        });
    },
    renderSwapProposal(element) {
        return(<section className="BravPicciot">
            <p>Propose to swap:</p>
            <label>
                <input ref={ref => this.amount = ref} type="text" placeholder="0.0" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$"/>
                <span>{element.symbol}</span>
            </label>
            <label>
            <p>for:</p>
                <TokenPicker ref={ref => this.tokenPicker = ref} tokenAddress={element.address}/>
            </label>
            <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB LinkVisualButtonBIGGA" onClick={() => this.controller.swap(this.amount.value, element.address, this.tokenPicker.state && this.tokenPicker.state.selected && this.tokenPicker.state.selected.address)}>Swap</a>
        </section>);
    },
    /*renderPoolProposal(element) {
        return(<section className="BravPicciot">
            <p>Propose to swap:</p>
            <section>
                <label>
                    Amount:
                    <input ref={ref => this.firstAmount = ref} type="number" />
                </label>
            </section>
            <section>
                <label>
                    Token:
                    <TokenPicker ref={ref => this.tokenPicker = ref} tokenAddress={element.address} />
                </label>
            </section>
            <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB" onClick={() => window.addToPool(this, element.address, this.tokenPicker.state && this.tokenPicker.state.selected && this.tokenPicker.state.selected.address, this.firstAmount.value)}>Add to Pool</a>
        </section>);
    },*/
    renderTransferProposal(element) {
        return (<section className="BravPicciot">
            <p>Propose to Transfer:</p>
            <section>
                <label>
                    <input ref={ref => this.amount = ref} type="text" placeholder="Ammount" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" />
                    <span>{element.symbol}</span>
                </label>
            </section>
            <section>
                <label>
                    <span>To:</span>
                    <input className="MarioTorginiProposal" ref={ref => this.to = ref} type="text" placeholder="Address"/>
                </label>
            </section>
            <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB LinkVisualButtonBIGGA" onClick={() => window.transfer(this, element.address, this.amount.value, this.to.value)}>Transfer</a>
        </section>);
    },
    render() {
        var _this = this;
        return (
            <section className="DFOOverview">
                <ul className="DFOHosting">
                    <section className="HostingCategoryTitle">
                        <h2>{_this.props.element.name} Balances {(!_this.state || _this.state.cumulativeAmountDollar === undefined || _this.state.cumulativeAmountDollar === null) ? <LoaderMinimino /> : <span>(Tracked: ${window.formatMoney(_this.state.cumulativeAmountDollar)})</span>} <a className="LinkVisualButton LinkVisualEthscan" target="_blank" href={window.getNetworkElement("etherscanURL") + "tokenHoldings?a=" + _this.props.element.walletAddress}>&#128142; Etherscan</a></h2>
                    </section>
                    {(!_this.state || !_this.state.tokens) && <LoaderMinimino />}
                    {_this.state && _this.state.tokens && _this.state.tokens.map(it => it.amount !== '0' && <li key={it.address} className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <section className="DFOWalletBalanceSingleT">
                                <img src={it.logo}></img>
                                <h3>{it.symbol} {it.amountDollars === undefined ? <LoaderMinimino /> : !it.amountDollars ? undefined : <span className="DFOLabelTitleInfosmall"> (${window.formatMoney(it.amountDollars)})</span>}</h3>
                            </section>
                            {it.amount !== undefined && <h5 className="DFOLabelTitleInfoM"><b>{window.fromDecimals(it.amount, it.decimals)}</b></h5>}
                            {it.amount === undefined && <LoaderMinimino />}
                            <br />
                            {_this.props.edit && <a href="javascript:;" data-address={it.address} data-type='swap' onClick={_this.toggleProposal} className={"LinkVisualButton LinkVisualPropose LinkVisualButtonB" + (_this.state && _this.state.swapProposal === it.address ? 'EditDFOYo Editing' : '')}>Swap</a>}
                            {/*{_this.props.edit && <a href="javascript:;" data-address={it.address} data-type='pool' onClick={_this.toggleProposal} className={"LinkVisualButton LinkVisualPropose LinkVisualButtonB" + (_this.state && _this.state.poolProposal === it.address ? 'EditDFOYo Editing' : '')}>Pool Proposal</a>}*/}
                            {_this.props.edit && <a href="javascript:;" data-address={it.address} data-type='transfer' onClick={_this.toggleProposal} className={"LinkVisualButton LinkVisualPropose LinkVisualButtonB" + (_this.state && _this.state.transferProposal === it.address ? 'EditDFOYo Editing' : '')}>Transfer</a>}
                            {_this.state && _this.state.swapProposal === it.address && _this.renderSwapProposal(it)}
                            {_this.state && _this.state.poolProposal === it.address && _this.renderPoolProposal(it)}
                            {_this.state && _this.state.transferProposal === it.address && _this.renderTransferProposal(it)}
                        </section>
                    </li>)}
                </ul>
            </section>
        );
    }
});