var DeFiOffering = React.createClass({
    requiredScripts: [
        'spa/loaderMini.jsx',
        'spa/okBoomer.jsx',
        'spa/loaderMinimino.jsx',
        'spa/defioffering/fixedInflation/view.jsx',
        'spa/defioffering/staking/view.jsx',
        'spa/loaderMini.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            'staking/refresh': this.controller.loadStakingData,
            'fixedInflation/refresh': this.controller.loadFixedInflationData
        };
    },
    componentDidMount() {
        var _this = this;
        _this.setState({ cumulativeLoading: true }, function () {
            Promise.all([
                _this.controller.loadFixedInflationData(),
                _this.controller.loadStakingData()
            ]
            ).then(function() {
                _this.setState({cumulativeLoading : false})
            });
        });
    },
    render() {
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        return (<section className="DFOOverview">
            {(!this.state || this.state.cumulativeLoading) && [<br/>, <br/>, <LoaderMini/>]}
            {this.state && this.state.cumulativeLoading === false && React.createElement(StakingView, props)}
            {this.state && this.state.cumulativeLoading === false && React.createElement(FixedInflationView, props)}
        </section>);
    }
});