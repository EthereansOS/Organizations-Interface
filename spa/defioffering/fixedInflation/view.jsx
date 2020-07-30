var FixedInflationView = React.createClass({
    requiredScripts : [
        'spa/loaderMinimino.jsx',
        'spa/defioffering/fixedInflation/edit.jsx'
    ],
    calculateTimeTier() {
        if(!this.props || !this.props.fixedInflationData || !this.props.fixedInflationData.blockLimit) {
            return '';
        }
        var blockLimit = this.props.fixedInflationData.blockLimit;
        var tiers = Object.entries(window.context.blockTiers);
        for(var tier of tiers) {
            var steps = tier[1];
            if(blockLimit >= steps[0] && blockLimit <= steps[2]) {
                return `~${tier[0].firstLetterToUpperCase()} (${blockLimit} blocks)`;
            }
        }
        return `${blockLimit} blocks`;
    },
    render() {
        var timeTier = this.calculateTimeTier();
        var _this = this;
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        return (<ul className="DFOHosting">
            <section className="HostingCategoryTitle">
                <h2>Fixed Inflation</h2>
                {_this.props.edit && <a href="javascript:;" onClick={() => _this.setState({editing : !(_this.state && _this.state.editing)})} className={"LinkVisualButton LinkVisualPropose LinkVisualButtonB" + (_this.state && _this.state.editing ? 'EditDFOYo Editing' : '')}>Edit</a>}
            </section>
            {(!this.state || !this.state.editing) && (!this.props || !this.props.fixedInflationData) && <LoaderMinimino/>}
            {(!this.state || !this.state.editing) && this.props && this.props.fixedInflationData && Object.keys(this.props.fixedInflationData).length === 0 && <h4>No Fixed inflation data <a href="javascript:;" onClick={() => _this.setState({editing : !(_this.state && _this.state.editing)})} className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Create</a></h4>}
            {(!this.state || !this.state.editing) && this.props && this.props.fixedInflationData && this.props.fixedInflationData.swapCouples && this.props.fixedInflationData.swapCouples.length > 0 && this.props.fixedInflationData.swapCouples.map(it => <li className="TheDappInfo1 TheDappInfoSub">
                <section className="DFOTitleSection">
                    <span className="DFOLabelTitleInfosmall">{timeTier}</span>
                    <h5 className="DFOHostingTitle"><img src={it.from.logo}/><b>{window.fromDecimals(it.amount, it.from.decimals)} {it.from.symbol}</b> for <img src={it.to.logo}/>{it.to.symbol}</h5>
                    <span className="DFOLabelTitleInfosmall">&#129412; <b>V2</b> <a href={`${window.getNetworkElement('etherscanURL')}address/${it.pairAddress}`} target="_blank">{window.shortenWord(it.pairAddress, 16)}</a></span>
                </section>
            </li>)}
            {this.state && this.state.editing && React.createElement(FixedInflationEdit, props)}
        </ul>);
    }
});