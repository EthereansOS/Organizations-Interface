var FixedInflationEdit = React.createClass({
    getInitialState() {
        var state = {
            swapCouples : [],
            blockLimit: (this.props && this.props.fixedInflationData && this.props.fixedInflationData.blockLimit) || Object.values(window.context.blockTiers)[0].averages[1]
        };
        this.props && this.props.fixedInflationData && this.props.fixedInflationData.swapCouples && this.props.fixedInflationData.swapCouples.forEach(it => state.swapCouples.push(it));
        return state;
    },
    deleteSwapCouple(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var i = parseInt(e.currentTarget.dataset.key);
        var deleted = this.state.swapCouples[i];
        this.state.swapCouples.splice(i, 1);
        var _this = this;
        this.setState({ swapCouples: this.state.swapCouples }, function () {
            _this.swapCoupleAmount.value = window.fromDecimals(deleted.amount, deleted.from.decimals);
            _this.tokenPickerA.setState({ selected: deleted.from }, function () {
                window.loadUniswapPairs(_this.tokenPickerB, deleted.from.address);
                _this.tokenPickerB.setState({ selected: deleted.to });
                _this.tokenPickerBLabel.style.display = 'block';
            });
        });
    },
    onTierChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var blockLimit = window.context.blockTiers[e.currentTarget.value].averages[1];
        this.setState({ blockLimit, tier: e.currentTarget.value });
    },
    onBlockLimitChange(e) {
        this.setState({ blockLimit: parseInt(e.currentTarget.dataset.value) });
    },
    addSwapCouple(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.emit('message');
        var from = this.tokenPickerA.state && this.tokenPickerA.state.selected;
        if (!from) {
            return this.emit('message', 'You must select a source token', 'error');
        }
        var to = this.tokenPickerB.state && this.tokenPickerB.state.selected;
        if (!to) {
            return this.emit('message', 'You must select a destination token', 'error');
        }
        var amount = this.swapCoupleAmount.value.split(',').join('');
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return this.emit('message', 'You must insert a valid positive amount', 'error');
        }
        amount = window.toDecimals(amount, from.decimals);
        var swapCouples = (this.state && this.state.swapCouples) || [];
        var _this = this;
        swapCouples.push({
            from,
            to,
            amount
        });
        this.setState({ swapCouples }, function () {
            _this.swapCoupleAmount.value = '';
            _this.tokenPickerA.setState({ selected: null }, function () {
                _this.tokenPickerB.setState({ selected: null });
                _this.tokenPickerBLabel.style.display = 'none';
            });
        });
    },
    proposeNewFixedInflation(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.emit('message');
        var blockLimit = parseInt((this.customBlockLimit && this.customBlockLimit.value) || (this.state && this.state.blockLimit))
        if (isNaN(blockLimit) || blockLimit <= 0) {
            return this.emit('message', 'You must choose a block limit', 'error');
        }
        var swapCouples = (this.state && this.state.swapCouples) || [];
        if (swapCouples.length === 0) {
            return this.emit('message', 'You must insert at least a swap couple', 'error');
        }
        var fixedInflation = {
            blockLimit: this.state.blockLimit,
            swapCouples: swapCouples.map(it => {
                return {
                    from: it.from.address,
                    to: it.to.address,
                    amount: it.amount
                };
            })
        };
        window.fixedInflation(this, fixedInflation);
    },
    render() {
        var _this = this;
        return (<section>
            <section className="TheDappInfo05">
                <section className="BravPicciot">
                <h5>Inflate:</h5>
                <select onChange={this.onTierChange}>
                    {Object.keys(window.context.blockTiers).map(it => <option key={it} value={it}>{it}</option>)}
                    <option value="Custom">Custom</option>
                </select>
                {(!this.state || this.state.tier !== 'Custom') && <ul>
                    <p>Blocks:</p>
                    {window.context.blockTiers[(this.state && this.state.tier) || Object.keys(window.context.blockTiers)[0]].averages.map(it => <li key={it}>
                        <label>
                        <input className="AMeMoPiach" type="radio" data-value={it} name="blockLimit" onChange={this.onBlockLimitChange} ref={ref => ref && (ref.checked = this.state.blockLimit === it)} />
                        <span><b>{it}</b></span>
                        </label>
                    </li>)}
                </ul>}
                {this.state && this.state.tier === 'Custom' && <section>
                    <label>
                        <p>Value:</p>
                        <input type="number" min="1" placeholder="Custom block number..." ref={ref => this.customBlockLimit = ref}/>
                    </label>
                </section>}
                </section>
            </section>
            <section className="TheDappInfo1">
                <section className="BravPicciot">
                    <h5>Add pair:</h5>
                    <label>
                        <input ref={ref => this.swapCoupleAmount = ref} type="text" placeholder="Amount" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" />
                    </label>
                    <label>
                        <p>From:</p>
                        <TokenPicker ref={ref => this.tokenPickerA = ref} element={this.props.element} onChange={token => (this.tokenPickerBLabel.style.display = token ? 'block' : 'none') && window.loadUniswapPairs(_this.tokenPickerB, token.address)} />
                    </label>
                    <label ref={ref => (this.tokenPickerBLabel = ref) && (ref.style.display = this.tokenPickerA && this.tokenPickerA.state && this.tokenPickerA.state.selected ? 'block' : 'none')}>
                        <p>To:</p>
                        <TokenPicker ref={ref => this.tokenPickerB = ref} />
                    </label>
                    <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonG LinkVisualButtonBIGGA" onClick={this.addSwapCouple}>Add Pair</a>
                </section>
            </section>
            <ul className="TheDappInfo1">
                {this.state.swapCouples.map((it, i) => <li key={i} className="TheDappInfo1 TheDappInfoSub">
                    <section className="DFOTitleSection">
                        <h5 className="DFOHostingTitle TorginiOpenCode"><img src={it.from.logo} /><b>{window.fromDecimals(it.amount, it.from.decimals)} {it.from.symbol}</b> for <img src={it.to.logo} />{it.to.symbol}</h5>
                        <a href="javascript;" data-key={i} onClick={this.deleteSwapCouple}><aside className="ChiudiQuella">X</aside></a>
                    </section>
                </li>)}
            </ul>
            <section className="TheDappInfo1">
            <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB LinkVisualButtonBIGGAMaNNTROP" onClick={this.proposeNewFixedInflation}>Propose new Fixed Inflation</a>
            </section>
        </section>);
    }
});