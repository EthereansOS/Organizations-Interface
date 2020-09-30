var StakingInfo = React.createClass({
    requiredScripts: [
        'spa/loader.jsx',
        'spa/bigLoader.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            'ethereum/ping' : this.componentDidMount
        };
    },
    componentDidMount() {
        this.controller.load(this, this.props.tier);
    },
    render() {
        if (!this.state || this.state.loading) {
            return (<Loader />);
        }
        return (<section className="statusTier">
            <h3>{this.props.title}</h3>
            <h4 className="TierStaked"><b>{window.fromDecimals(this.state.minCap, this.props.element.decimals)}</b> <img src={window.formatLink(this.props.element.logo || this.props.element.logoURI)}></img></h4>
            <h6 className="TierStaked">Min Stake</h6>
            <h4 className="TierStaked">{window.fromDecimals(this.state.staked, this.props.element.decimals)} <img src={window.formatLink(this.props.element.logo || this.props.element.logoURI)}></img></h4>
            <h6 className="TierStaked">Staked</h6>
            <h4 className="TierFree"><b>{window.fromDecimals(this.state.available, this.props.element.decimals)}</b> <img src={window.formatLink(this.props.element.logo || this.props.element.logoURI)}></img></h4>
            <h6 className="TierFree">Available</h6>
        </section>);
    }
});