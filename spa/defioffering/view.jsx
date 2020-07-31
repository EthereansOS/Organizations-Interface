var DeFiOffering = React.createClass({
    requiredScripts: [
        'spa/loaderMini.jsx',
        'spa/okBoomer.jsx',
        'spa/loaderMinimino.jsx',
        'spa/defioffering/fixedInflation/view.jsx'
    ],
    requiredModules : [
        'spa/defioffering/staking'
    ],
    componentDidMount() {
        this.controller.loadFixedInflationData();
    },
    render() {
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        return (<section className="DFOOverview">
            {React.createElement(StakingManager, props)}
            {(!this.state || !this.state.fixedInflationEdit) && React.createElement(FixedInflationView, props)}
        </section>);
    }
});