var DeFiOffering = React.createClass({
    requiredScripts: [
        'spa/loaderMini.jsx',
        'spa/okBoomer.jsx',
        'spa/loaderMinimino.jsx',
        'spa/defioffering/fixedInflation/view.jsx'
    ],
    componentDidMount() {
        this.controller.loadFixedInflationData();
    },
    render() {
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        return (<section className="DFOOverview">
            <ul className="DFOHosting">
                <section className="HostingCategoryTitle">
                    <h2>Liquidity Staking</h2>
                </section>
                <li className="TheDappInfoAll TheDappInfoSub">
                    <section className="TheDappInfo1">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle"><img src="assets/img/buidlv2-logo.png"></img><b>buidl</b> for 1 Year</h5>
                            <h5 className="DFOHostingTitle">Reward: <b className='DFOHostingTitleG'>50%</b></h5>
                            <p className="DFOHostingTitle">Distribution: <b>Weekly</b></p>
                            <p className="DFOLabelTitleInfosmall">DEX: &#129412; V2 </p>
                        </section>
                    </section>
                    <section className="TheDappInfo1">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle"><b>Pairs:</b></h5>
                            <a className="DFOHostingTag"><img src="assets/img/buidlv2-logo.png"></img>ETH</a>
                            <a className="DFOHostingTag"><img src="assets/img/buidlv2-logo.png"></img>WBTC</a>
                            <a className="DFOHostingTag"><img src="assets/img/buidlv2-logo.png"></img>USDC</a>
                            <a className="DFOHostingTag"><img src="assets/img/buidlv2-logo.png"></img>ARTE</a>
                            <a className="DFOHostingTag"><img src="assets/img/buidlv2-logo.png"></img>USDT</a>
                        </section>
                    </section>
                    <section className="TheDappInfo1">
                        <section className="DFOTitleSection">
                            <span className="DFOHostingTitleS">Staked:</span>
                            <h5 className="DFOHostingTitle"><b>5,200</b></h5>
                            <span className="DFOHostingTitleS DFOHostingTitleG">Available:</span>
                            <h5 className="DFOHostingTitle DFOHostingTitleG"><b>15,200</b></h5>
                            <a href="javascript;" className="LinkVisualButton LinkVisualUni LinkVisualPropose">&#129412; Stake Manager</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Stop</a>
                        </section>
                    </section>
                </li>
            </ul>
            {(!this.state || !this.state.fixedInflationEdit) && React.createElement(FixedInflationView, props)}
        </section>);
    }
});