var DeFiOffering = React.createClass({
    requiredScripts: [
        'spa/loaderMini.jsx',
        'spa/okBoomer.jsx',
        'spa/loaderMinimino.jsx',
        'spa/defioffering/fixedInflation/view.jsx',
        'spa/defioffering/staking/view.jsx'
    ],
    componentDidMount() {
        this.controller.loadFixedInflationData();
        this.controller.loadStakingData();
    },
    render() {
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        return (<section className="DFOOverview">
            {React.createElement(StakingView, props)}
            {React.createElement(FixedInflationView, props)}
        </section>);
    }
});