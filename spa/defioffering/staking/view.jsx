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
            'stake/close': () => this.setState({ stakeToShow: null })
        };
    },
    showStake(e, stakeToShow) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.setState({ stakeToShow });
    },
    stopStake(e, element) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        window.stopStake(this, element.stakingManager.options.address);
    },
    render() {
        var _this = this;
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        if (props.stakeToShow) {
            return React.createElement(Stake, {
                element: props.element,
                stakingData: props.stakeToShow
            });
        }
        return (<ul className="DFOHosting">
            <section className="HostingCategoryTitle">
                <h2>Liquidity Staking</h2>
                {this.props.edit && <a href="javascript:;" onClick={() => _this.setState({ edit: !(_this.state && _this.state.edit) })} className={"LinkVisualButton LinkVisualPropose LinkVisualButtonB" + (_this.state && _this.state.edit ? 'EditDFOYo Editing' : '')}>{_this.state && _this.state.edit ? 'Close' : 'New'}</a>}
            </section>
            {(!this.state || !this.state.edit) && (!this.props || !this.props.stakingData) && <LoaderMinimino />}
            {(!this.state || !this.state.edit) && this.props && this.props.stakingData && this.props.stakingData.length === 0 && <h4>No Staking data <a href="javascript:;" onClick={() => _this.emit('edit/toggle', true, () => _this.setState({ edit: true }))} className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Create</a></h4>}
            {(!this.state || !this.state.edit) && this.props && this.props.stakingData && this.props.stakingData.map(element => {
                var lis = [];
                lis.push(...element.tiers.map(it => <li key={it.blockNumber} className="TheDappInfoAll TheDappInfoSub KingJulianAlwaysWatchingYou">
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
                            {element.pairs.map(pair => <a key={pair.address} href={window.getNetworkElement('etherscanURL') + 'token/' + pair.address} target="_blank" className="DFOHostingTag">
                                <img src={pair.logo}/>
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
                            <a onClick={e => this.showStake(e, element)} className="LinkVisualButton LinkVisualUni LinkVisualPropose">&#129412; Stake Manager</a>
                            <a href="javascript:;" onClick={e => this.stopStake(e, element)} className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Stop</a>
                        </section>
                    </section>
                </li>));
                return lis;
            })}
            {this.props && this.props.edit && this.state && this.state.edit && React.createElement(StakingEdit, props)}
        </ul>);
    }
});