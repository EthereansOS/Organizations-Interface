var FixedInflationEdit = React.createClass({
    getInitialState() {
        return {
            swapCouples : (this.props && this.props.fixedInflationData && this.props.fixedInflationData.swapCouples && this.props.fixedInflationData.swapCouples.length > 0 && this.props.fixedInflationData.swapCouples) || [],
            blockLimit : (this.props && this.props.fixedInflationData && this.props.fixedInflationData.blockLimit) || 0
        };
    },
    deleteSwapCouple(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        
    },
    onBlockLimitChange(e) {
        this.setState({blockLimit: parseInt(e.currentTarget.dataset.value)});
    },
    render() {
        return (<ul className="DFOHosting">
            <h4>Block Limit</h4>
            <ul>
                {Object.entries(window.context.blockTiers).map(tier => <li key={tier[0]}>
                    <section>
                        {tier[0]}:
                            <ul>
                            {tier[1].map(it => <li key={it}>
                                <label>
                                    {it}
                                    {'\u00a0'}
                                    <input type="radio" data-value={it} name="blockLimit" onChange={this.onBlockLimitChange} ref={ref => ref && (ref.checked = this.state.blockLimit === it)}/>
                                </label>
                            </li>)}
                        </ul>
                    </section>
                </li>)}
            </ul>
            {this.props && this.props.fixedInflationData && this.props.fixedInflationData.swapCouples && this.props.fixedInflationData.swapCouples.length > 0 && this.props.fixedInflationData.swapCouples.map((it, i) => <li key={i} className="TheDappInfo1 TheDappInfoSub">
                <section className="DFOTitleSection">
                    <h5 className="DFOHostingTitle"><img src={it.from.logo} /><b>{window.fromDecimals(it.amount, it.from.decimals)} {it.from.symbol}</b> for <img src={it.to.logo} />{it.to.symbol}</h5>
                    <span className="DFOLabelTitleInfosmall">&#129412; <b>V2</b> <a href={`${window.getNetworkElement('etherscanURL')}address/${it.pairAddress}`} target="_blank">{window.shortenWord(it.pairAddress, 16)}</a></span>
                </section>
                <a href="javascript;" data-key={i} onClick={this.deleteSwapCouple}><h3>X</h3></a>
            </li>)}
        </ul>);
    }
});