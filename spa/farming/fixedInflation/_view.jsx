var _FixedInflationView = React.createClass({
    requiredScripts : [
        'spa/loaderMinimino.jsx',
        'spa/farming/fixedInflation/edit.jsx'
    ],
    calculateTimeTier() {
        if(!this.props || !this.props.fixedInflationData || !this.props.fixedInflationData.blockLimit) {
            return '';
        }
        return window.calculateTimeTier(this.props.fixedInflationData.blockLimit);
    },
    runFixedInflation(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        this.emit('message');
        window.blockchainCall(this.props.element.dFO.methods.submit, 'fixedInflation', '0x').then(() => _this.emit('fixedInflation/refresh')).catch(e => _this.emit('message', e.message || e, 'error'));
    },
    render() {
        var timeTier = this.calculateTimeTier();
        var _this = this;
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        return (<ul className="DFOHosting DFOHostingBBBB">
            <section className="HostingCategoryTitle">
                <h2>Fixed Inflation</h2>
                {this.props.edit && <a href="javascript:;" onClick={() => _this.setState({edit : !(_this.state && _this.state.edit)})} className={"LinkVisualButton LinkVisualPropose LinkVisualButtonB" + (_this.state && _this.state.edit ? 'EditDFOYo Editing' : '')}>Edit</a>}
            </section>
            {(!this.state || !this.state.edit) && (!this.props || !this.props.fixedInflationData) && <LoaderMinimino/>}
            {(!this.state || !this.state.edit) && this.props && this.props.fixedInflationData && this.props.fixedInflationData.swapCouples.length === 0 && <h4>No Fixed inflation data <a href="javascript:;" onClick={() => _this.emit('edit/toggle', true, () => _this.setState({edit: true}))} className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Create</a></h4>}
            {(!this.state || !this.state.edit) && this.props && this.props.fixedInflationData && this.props.fixedInflationData.swapCouples && this.props.fixedInflationData.swapCouples.length > 0 && this.props.fixedInflationData.swapCouples.map(it => <li className="TheDappInfo1 TheDappInfoYY TheDappInfoSub">
                <section className="DFOTitleSection">
                    <span className="DFOLabelTitleInfosmall">{timeTier}</span>
                    <h5 className="DFOHostingTitle"><img src={it.from.logo}/><b>{window.fromDecimals(it.amount, it.from.decimals)} {it.from.symbol}</b> for <img src={it.to.logo}/>{it.to.symbol}</h5>
                    <span className="DFOLabelTitleInfosmall">&#129412; <b>V2</b> <a href={`${window.getNetworkElement('etherscanURL')}address/${it.pairAddress}`} target="_blank">{window.shortenWord(it.pairAddress, 16)}</a></span>
                    {this.props.fixedInflationData && this.props.fixedInflationData.nextBlock && <span>Next Block: <a href={window.getNetworkElement("etherscanURL") + "block/countdown/" + this.props.fixedInflationData.nextBlock} target="_blank">#{this.props.fixedInflationData.nextBlock}</a></span>}
                    {this.props.fixedInflationData && this.props.fixedInflationData.canRun && <a href="javascript:;" className="LinkVisualButton LinkVisualButtonB" onClick={this.runFixedInflation}>Execute</a>}
                </section>
            </li>)}
            {this.props && this.props.edit && this.state && this.state.edit && React.createElement(FixedInflationEdit, props)}
        </ul>);
    }
});