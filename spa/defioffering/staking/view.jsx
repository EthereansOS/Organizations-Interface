var StakingView = React.createClass({
    requiredScripts: [
        'spa/loaderMinimino.jsx',
        'spa/defioffering/staking/edit.jsx'
    ],
    requiredModules: [
        'spa/stake'
    ],
    getDefaultSubscriptions() {
        return {
            'stake/close' : () => this.setState({fullscreen : null})
        };
    },
    showStake(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.setState({fullscreen : true});
    },
    stopStake(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        window.stopStake(this, this.props.stakingData.stakingManager.options.address);
    },
    render() {
        var _this = this;
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        if(props.fullscreen) {
            return React.createElement(Stake, props);
        }
        return (<ul className="DFOHosting">
            <section className="HostingCategoryTitle">
                <h2>Liquidity Staking</h2>
                {this.props.edit && <a href="javascript:;" onClick={() => _this.setState({ edit: !(_this.state && _this.state.edit) })} className={"LinkVisualButton LinkVisualPropose LinkVisualButtonB" + (_this.state && _this.state.edit ? 'EditDFOYo Editing' : '')}>Edit</a>}
            </section>
            {(!this.state || !this.state.edit) && (!this.props || !this.props.stakingData) && <LoaderMinimino />}
            {(!this.state || !this.state.edit) && this.props && this.props.stakingData && this.props.stakingData.tiers.length === 0 && <h4>No Staking data <a href="javascript:;" onClick={() => _this.emit('edit/toggle', true, () => _this.setState({ edit: true }))} className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Create</a></h4>}
            {(!this.state || !this.state.edit) && this.props && this.props.stakingData && this.props.stakingData.tiers && this.props.stakingData.tiers.length > 0 && this.props.stakingData.tiers.map(it => <li key={it.blockNumber} className="TheDappInfoAll TheDappInfoSub KingJulianAlwaysWatchingYou">
                <section className="TheDappInfo1">
                    <section className="DFOTitleSection">
                        <h5 className="DFOHostingTitle"><img src={_this.props.element.logo}></img><b>{_this.props.element.symbol}</b> for ~{it.tierKey}</h5>
                        <h5 className="DFOHostingTitle">Reward: <b className='DFOHostingTitleG'>{window.formatMoney(it.percentage)}%</b></h5>
                        <p className="DFOHostingTitle">Distribution: <b>Weekly</b></p>
                        <p className="DFOHostingTitle">Total Lock: <b>{it.blockNumber}</b> Blocks</p>
                        <p className="DFOLabelTitleInfosmall">DEX: &#129412; V2 </p>
                    </section>
                </section>
                <section className="TheDappInfo1">
                    <section className="DFOTitleSection">
                        <h5 className="DFOHostingTitle"><b>Pairs:</b></h5>
                        {_this.props && _this.props.stakingData && _this.props.stakingData.pairs && _this.props.stakingData.pairs.map(pair => <a key={pair.address} href={window.getNetworkElement('etherscanURL') + 'token/' + pair.address} target="_blank" className="DFOHostingTag">
                            <img src={pair.logo}></img>
                            {pair.symbol}
                        </a>)}
                    </section>
                </section>
                <section className="TheDappInfo1">
                    <section className="DFOTitleSection">
                        <span className="DFOHostingTitleS">Staked:</span>
                        <h5 className="DFOHostingTitle"><b>{window.fromDecimals(it.staked, _this.props.element.decimals)}</b></h5>
                        <span className="DFOHostingTitleS DFOHostingTitleG">Available:</span>
                        <h5 className="DFOHostingTitle DFOHostingTitleG"><b>{window.fromDecimals(it.remainingToStake, _this.props.element.decimals)}</b></h5>
                        <a onClick={this.showStake} className="LinkVisualButton LinkVisualUni LinkVisualPropose">&#129412; Stake Manager</a>
                        <a href="javascript:;" onClick={this.stopStake} className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Stop</a>
                    </section>
                </section>
            </li>)}
            {this.props && this.props.edit && this.state && this.state.edit && React.createElement(StakingEdit, props)}
        </ul>);
    }
});