var Wallet = React.createClass({
    requiredScripts: [
        'spa/loaderMinimino.jsx',
        'assets/scripts/uniswapOps.js'
    ],
    requiredModules: [
        'spa/tokenPicker'
    ],
    componentDidMount() {
        if(this.called) {
            return;
        }
        this.called = true;
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
            var state = {
                tos: []
            };
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
            <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB LinkVisualButtonBIGGA" onClick={() => window.swap(this, this.amount.value, element.address, this.tokenPicker.state && this.tokenPicker.state.selected && this.tokenPicker.state.selected.address)}>Swap</a>
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
    addTos(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.emit('message');
        var address = this.to.value;
        if(!window.isEthereumAddress(address)) {
            return this.emit('message', 'You must insert a valid ethereum address', 'error');
        }
        var amount = window.formatMoney(this.amount.value.split(',').join(''));
        if(parseFloat(amount.split(',').join('')) <= 0) {
            return this.emit('message', 'Amount must be greater than zero', 'error');
        }
        var tos = (this.state && this.state.tos) || [];
        tos.push({
            address,
            amount
        });
        var _this = this;
        _this.setState({tos}, function() {
            _this.amount.value = '';
            _this.to.value = '';
        });
    },
    deleteTo(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var i = parseInt(e.currentTarget.dataset.index);
        var deleted = this.state.tos[i];
        this.state.tos.splice(i, 1);
        var _this = this;
        _this.setState({tos : this.state.tos}, function() {
            _this.amount.value = deleted.amount;
            _this.to.value = deleted.address;
        });
    },
    transfer(e, element) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var amounts = [];
        var sendTos = [];
        this.emit('message');
        if(this.state.tos.length === 0) {
            return this.emit('message', 'You Must insert at least a recipient', 'error');
        }
        this.state.tos.forEach(it => {
            amounts.push(it.amount);
            sendTos.push(it.address);
        });
        window.transfer(this, element.address, amounts, sendTos);
    },
    renderTransferProposal(element) {
        var _this = this;
        return (<section className="BravPicciot">
            <p>Propose to Transfer:</p>
            <section>
                <label>
                    <input ref={ref => this.amount = ref} type="text" placeholder="Amount" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" />
                    <span>{element.symbol}</span>
                </label>
            </section>
            <section>
                <label>
                    <span>To:</span>
                    <input className="MarioTorginiProposal" ref={ref => this.to = ref} type="text" placeholder="Address"/>
                </label>
            </section>
            <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonG LinkVisualButtonBIGGA" onClick={this.addTos}>Add</a>
            {this.state && this.state.tos && <section>
                {this.state.tos.map((it, i) => <section className="DFOHostingTag" key={it.address + "_" + it.amount}>
                    <a className="ChiudiQuella ChiudiQuellaGigi" href="javascript:;" data-index={i} onClick={_this.deleteTo}>X</a>
                    <p>Send <b>{it.amount}</b> {element.symbol}</p>
                    <p>to <aside className="LuiQuelloLi">{it.address}</aside></p>
                </section>)}
            </section>}
            <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB LinkVisualButtonBIGGA" onClick={e => this.transfer(e, element)}>Transfer</a>
            {false && <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB LinkVisualButtonBIGGA" onClick={() => window.transfer(this, element.address, this.amount.value, this.to.value)}>Transfer</a>}
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
                    {_this.state && _this.state.tokenAmounts && _this.state.tokens && _this.state.tokens.map(it => _this.state.tokenAmounts[it.i].amount !== undefined && _this.state.tokenAmounts[it.i].amount !== '0' && <li key={it.address} className="TheDappInfo1 TheDappInfoY TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <section className="DFOWalletBalanceSingleT">
                                <img src={it.logo}></img>
                                <h3>{it.symbol} {_this.state.tokenAmounts[it.i].amountDollars === undefined ? <LoaderMinimino /> : !_this.state.tokenAmounts[it.i].amountDollars ? undefined : <span className="DFOLabelTitleInfosmall"> (${window.formatMoney(_this.state.tokenAmounts[it.i].amountDollars)})</span>}</h3>
                            </section>
                            {_this.state.tokenAmounts[it.i].amount !== undefined && <h5 className="DFOLabelTitleInfoM"><b>{window.fromDecimals(_this.state.tokenAmounts[it.i].amount, it.decimals)}</b></h5>}
                            {_this.state.tokenAmounts[it.i].amount === undefined && <LoaderMinimino />}
                            <br />
                            {_this.props.edit && <a href="javascript:;" data-address={it.address} data-type='swap' onClick={_this.toggleProposal} className={"LinkVisualButton LinkVisualPropose LinkVisualButtonB" + (_this.state && _this.state.swapProposal === it.address ? 'EditDFOYo Editing' : '')}>Swap</a>}
                            {/*{_this.props.edit && <a href="javascript:;" data-address={it.address} data-type='pool' onClick={_this.toggleProposal} className={"LinkVisualButton LinkVisualPropose LinkVisualButtonB" + (_this.state && _this.state.poolProposal === it.address ? 'EditDFOYo Editing' : '')}>Pool Proposal</a>}*/}
                            {_this.props.edit && <a href="javascript:;" data-address={it.address} data-type='transfer' onClick={_this.toggleProposal} className={"LinkVisualButton LinkVisualPropose LinkVisualButtonB" + (_this.state && _this.state.transferProposal === it.address ? 'EditDFOYo Editing' : '')}>Transfer</a>}
                            {_this.state && _this.state.swapProposal === it.address && _this.renderSwapProposal(it)}
                            {_this.state && _this.state.poolProposal === it.address && _this.renderPoolProposal(it)}
                            {_this.state && _this.state.transferProposal === it.address && _this.renderTransferProposal(it)}
                        </section>
                    </li>)}
                    {this.state && this.state.loading && <section>
                        <br/>
                        <LoaderMinimino/>
                    </section>}
                </ul>
            </section>
        );
    }
});