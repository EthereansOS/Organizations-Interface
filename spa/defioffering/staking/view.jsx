var StakingManager = React.createClass({
    componentDidMount() {
        this.controller.loadData();
    },
    render() {
        var _this = this;
        return (<ul className="DFOHosting">
        <section className="HostingCategoryTitle">
            <h2>Liquidity Staking</h2>
        </section>
        {(!this.state || !this.state.tiers) && <LoaderMinimino/>}
        {this.state && this.state.tiers && this.state.tiers.length === 0 && <p>No available tiers</p>}
        {this.state && this.state.tiers && this.state.tiers.map(it => <li key={it.blockNumber} className="TheDappInfoAll TheDappInfoSub">
            <section className="TheDappInfo1">
                <section className="DFOTitleSection">
                    <h5 className="DFOHostingTitle"><img src="assets/img/buidlv2-logo.png"></img><b>{_this.props.element.symbol}</b> for {it.time}</h5>
                    <h5 className="DFOHostingTitle">Reward: <b className='DFOHostingTitleG'>{window.formatMoney(it.percentage)}%</b></h5>
                    <p className="DFOHostingTitle">Distribution: <b>Weekly</b></p>
                    <p className="DFOLabelTitleInfosmall">DEX: &#129412; V2 </p>
                </section>
            </section>
            <section className="TheDappInfo1">
                <section className="DFOTitleSection">
                    <h5 className="DFOHostingTitle"><b>Pairs:</b></h5>
                    {this.state && this.state.pairs && this.state.pairs.map(pair => <a key={pair.address} href={window.getNetworkElement('etherscanURL') + 'token/' + pair.address} target="_blank" className="DFOHostingTag">
                        <img src={pair.logo}></img>
                        {pair.symbol}
                    </a>)}
                </section>
            </section>
            <section className="TheDappInfo1">
                <section className="DFOTitleSection">
                    <span className="DFOHostingTitleS">Staked:</span>
                    <h5 className="DFOHostingTitle"><b>{window.fromDecimals(it.staked, 18)}</b></h5>
                    <span className="DFOHostingTitleS DFOHostingTitleG">Available:</span>
                    <h5 className="DFOHostingTitle DFOHostingTitleG"><b>{window.fromDecimals(it.remainingToStake, 18)}</b></h5>
                    <a href={window.getNetworkElement('etherscanURL') + 'address/' + this.stakeManager.options.address} target="_blank" className="LinkVisualButton LinkVisualUni LinkVisualPropose">&#129412; Stake Manager</a>
                    <a href="javascript:;" target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Stop</a>
                </section>
            </section>
        </li>)}
    </ul>);
    }
});