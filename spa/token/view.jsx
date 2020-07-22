var Token = React.createClass({
    requiredModules: [
        'spa/editor'
    ],
    requiredScripts: [
        'spa/loaderMini.jsx',
        'spa/okBoomer.jsx',
        'spa/loaderMinimino'
    ],
    uploadFile(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var file = e.currentTarget.files[0];
        var _this = this;
        var reader = new FileReader();
        reader.addEventListener("load", function () {
            _this.indexValue.value = reader.result;
        }, false);
        reader.readAsDataURL(file);
    },
    changeElementInfo(e) {
        if (!e) {
            return;
        }
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var data = window.getData($($(e.currentTarget).parent()).parent());
        this.controller[this.state.change + 'Change'](data);
    },
    componentDidMount() {
        var _this = this;
        window.blockchainCall(_this.props.element.dFO.methods.read, 'getMinimumBlockNumberForSurvey', '0x').then(blocks => {
            _this.props.element.blocks = window.web3.eth.abi.decodeParameters(['uint256'], blocks)[0];
            _this.forceUpdate();
        });
    },
    renderChangeButton(name) {
        var _this = this;
        if (!_this.props.edit) {
            return;
        }
        return (<a className={"LinkVisualButton LinkVisualButtonB" + (_this.state && _this.state.change === name ? " Editing" : "")} href="javascript:;" onClick={() => _this.setState({ change: _this.state && _this.state.change === name ? null : name })}>Change</a>);
    },
    renderChanger(args) {
        var _this = this;
        if (!_this.props.edit || !_this.state || !_this.state.change) {
            return;
        }
        for (var i in args) {
            var name = args[i];
            if (_this.state.change === name) {
                var method = _this['render' + name.substring(0, 1).toUpperCase() + name.substring(1) + 'Changer'];
                return (<section className="DFOFunctionIndexIcon">
                    {method && method()}
                    <aside>
                        <a href="javascript:;" className="LinkVisualButton LinkVisualButtonB" onClick={_this.changeElementInfo}>Propose</a>
                    </aside>
                </section>);
            }
        }
    },
    renderDefaultChanger(text, label, id, defaultValue) {
        return (
            <ul>
                <li>
                    <p ref={ref => ref && (ref.innerHTML = text)}>{text}</p>
                </li>
                <li>
                    <section>
                        <label htmlFor={id} ref={ref => ref && (ref.innerHTML = label)}>{label}</label>
                        <input className="DFOFunctionIndexIconText" id={id} type="number" min="0" ref={ref => ref && (ref.value = defaultValue)} />
                    </section>
                </li>
            </ul>
        );
    },
    render() {
        var _this = this;
        return (
            <section className="DFOOverview">
                <ul className="DFOHosting">
                    <section className="HostingCategoryTitle">
                        <h2>Voting Token</h2>
                    </section>
                    <li className="TheDappInfo05">
                        <section className="DFOTitleSection">
                        <h5 className="DFOHostingTitle">Ticker:</h5>
                            <AsyncValue>
                                {_this.props.element.symbol && <p className="DFOLabelTitleInfo"><a className="LinkVisualStandard" href={window.getNetworkElement("etherscanURL") + 'token/' + _this.props.element.token.options.address} target="_blank">{_this.props.element.symbol}</a></p>}
                            </AsyncValue>
                        </section>
                        <section className="DFOTitleSection">
                        </section>
                        {/*<section className="DFOTitleSection">
                            <a href={window.context.uniSwapInfoURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Info</a>
                            {"\u00a0"}
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                        </section> */}
                    </li>
                    <li className="TheDappInfo1">
                    <section className="DFOTitleSection">
                        <h5 className="DFOHostingTitle">Existing Supply:  </h5>
                        <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.totalSupply && <p className="DFOLabelTitleInfo"><a className="LinkVisualStandard" href={window.getNetworkElement("etherscanURL") + 'token/tokenholderchart/' + _this.props.element.token.options.address} target="_blank">{window.fromDecimals(_this.props.element.totalSupply, _this.props.element.decimals)}</a></p>}
                        </AsyncValue>
                        <h5 className="DFOHostingTitle">DFO Wallet Supply: </h5>
                            <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.totalSupply && <p className="DFOLabelTitleInfo"> <a className="LinkVisualStandard" href={window.getNetworkElement("etherscanURL") + 'token/tokenholderchart/' + _this.props.element.token.options.address} target="_blank">{window.fromDecimals(_this.props.element.totalSupply, _this.props.element.decimals)}</a></p>}
                            </AsyncValue>
                    </section>
                    </li>
                    <li className="TheDappInfo05">
                        <section className="DFOTitleSection">
                        <h5 className="DFOHostingTitle">Power:</h5>
                            <AsyncValue>
                                +1
                            </AsyncValue>
                        </section>
                        <section className="DFOTitleSection">
                        </section>
                    </li>
                </ul>
                <ul className="DFOHosting">
                <section className="HostingCategoryTitle">
                    <h2>DEX Liquidity</h2>
                </section>
                <li className="TheDappInfo2">
                        <h5 className="DFOHostingTitle">&#127984; Regular Proposals: <a className={"EditDFOYoYO" + (_this.dfoElement && _this.dfoElement.state && _this.dfoElement.state.okBoomer ? ' Editing' : '')} href="javascript:;" onClick={() => _this.emit('okBommer/toggle')}>i</a></h5>
                        <section className="DFOTitleSection">
                            {_this.props.element.blocks === undefined && <LoaderMinimino />}
                            {_this.props.element.blocks !== undefined && <p className="DFOLabelTitleInfo">Length: <b>{_this.props.element.blocks}</b><aside> Blocks </aside> {_this.renderChangeButton('proposalLength')}</p>}
                        </section>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The duration of a Proposal</OkBoomer>
                        <section className="DFOTitleSection">
                            <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.totalSupply && _this.props.element.quorum !== undefined && <p className="DFOLabelTitleInfo">Quorum: <b>{window.tokenPercentage(_this.props.element.quorum, _this.props.element.totalSupply)}</b><aside><b> ({window.fromDecimals(_this.props.element.quorum, _this.props.element.decimals)}</b> {_this.props.element.symbol})</aside> {_this.renderChangeButton('quorum')}</p>}
                            </AsyncValue>
                        </section>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The minimum number of Voting Tokens staked by voters to reach the a positive result.</OkBoomer>
                        <section className="DFOTitleSection">
                            <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.totalSupply && _this.props.element.minimumStaking !== undefined && <p className="DFOLabelTitleInfo">Generation Stake: <b>{window.tokenPercentage(_this.props.element.minimumStaking, _this.props.element.totalSupply)}</b><aside><b> ({window.fromDecimals(_this.props.element.minimumStaking, _this.props.element.decimals)}</b> {_this.props.element.symbol})</aside> {_this.renderChangeButton('proposalStake')}</p>}
                            </AsyncValue>
                        </section>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The minimum number of Voting Tokens staked to create a Proposal.</OkBoomer>
                        <section className="DFOTitleSection">
                            <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.totalSupply && _this.props.element.votesHardCap !== undefined && <p className="DFOLabelTitleInfo">Hard Cap: <b>{window.tokenPercentage(_this.props.element.votesHardCap, _this.props.element.totalSupply)}</b><aside><b> ({window.fromDecimals(_this.props.element.votesHardCap, _this.props.element.decimals)}</b> {_this.props.element.symbol})</aside> {_this.renderChangeButton('votesHardCap')}</p>}
                            </AsyncValue>
                        </section>
                        <OkBoomer okBoomer={_this.props.okBoomer}>If a proposal reaches a fixed number of voting tokens (example the 90% of the total Token supply) for “Approve” or “Disapprove” it, the proposal automatically ends, independently from the duration rule.</OkBoomer>
                    </li>
                    <li className="TheDappInfo2">
                        <h5 className="DFOHostingTitle">&#x1F6A8; Emergency Proposals: <a className={"EditDFOYoYO" + (_this.dfoElement && _this.dfoElement.state && _this.dfoElement.state.okBoomer ? ' Editing' : '')} href="javascript:;" onClick={() => _this.emit('okBommer/toggle')}>i</a></h5>
                        <section className="DFOTitleSection">
                            {_this.props.element.minimumBlockNumberForEmergencySurvey === undefined && <LoaderMinimino />}
                            {_this.props.element.minimumBlockNumberForEmergencySurvey !== undefined && <p className="DFOLabelTitleInfo">{_this.renderChangeButton('emergencyLength')} Length: <b>{_this.props.element.minimumBlockNumberForEmergencySurvey}</b> <aside>Blocks</aside></p>}
                        </section>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The duration of an Emergency Proposal</OkBoomer>
                        <section className="DFOTitleSection">
                            <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.totalSupply && _this.props.element.emergencySurveyStaking && <p className="DFOLabelTitleInfo">{_this.renderChangeButton('emergencyPenalty')} Penalty fee: <b>{window.tokenPercentage(_this.props.element.emergencySurveyStaking, _this.props.element.totalSupply)}</b><aside> (<b>{window.fromDecimals(_this.props.element.emergencySurveyStaking, _this.props.element.decimals)}</b> {_this.props.element.symbol})</aside></p>}
                            </AsyncValue>
                        </section>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The Fee that Emergency Proposal Issuer must stake to propose it. This stake will be lost if the Proposal fails.</OkBoomer>
                    </li>
                    {_this.renderChanger(['proposalStake', 'emergencyLength', 'emergencyPenalty','quorum', 'proposalLength', 'votesHardCap'])}
                </ul>
                <ul className="DFOHosting">
                <section className="HostingCategoryTitle">
                    <h2>{_this.props.element.name} Wallet</h2>
                </section>
                    <li className="TheDappInfo3">
                        <h5 className="DFOHostingTitle">&#129518; Assets:</h5>
                        {parseFloat(_this.props.element.walletCumulativeDollar) > 0 && <h6>Tot Tracked: ${_this.props.element.walletCumulativeDollar}</h6>}
                        <section className="DFOTitleSection">
                            <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.totalSupply && _this.props.element.communityTokens && <p className="DFOLabelTitleInfo"><b>{window.tokenPercentage(_this.props.element.communityTokens, _this.props.element.totalSupply)}</b><aside> (<b>{window.fromDecimals(_this.props.element.communityTokens, _this.props.element.decimals)}</b> {_this.props.element.symbol})</aside>{parseFloat(_this.props.element.communityTokensDollar) > 0 && <span className="USDVALUE"> ${_this.props.element.communityTokensDollar}</span>}</p>}
                            </AsyncValue>
                        </section>
                        <section className="DFOTitleSection">
                            <p className="DFOLabelTitleInfo"><b>{window.fromDecimals(_this.props.element.walletETH, 18)}</b><aside> ETH</aside>{parseFloat(_this.props.element.walletETHDollar) > 0 && <span className="USDVALUE"> ${_this.props.element.walletETHDollar}</span>}</p>
                        </section>
                        <section className="DFOTitleSection">
                            <p className="DFOLabelTitleInfo"><b>{window.fromDecimals(_this.props.element.walletUSDC, 6)}</b><aside> USDC</aside>{parseFloat(_this.props.element.walletUSDCDollar) > 0 && <span className="USDVALUE"> ${_this.props.element.walletUSDCDollar}</span>}</p>
                        </section>
                        {_this.props.element !== window.dfoHub && <section className="DFOTitleSection">
                            <p className="DFOLabelTitleInfo"><b>{window.fromDecimals(_this.props.element.walletBUIDL, window.dfoHub.decimals)}</b><aside> BUIDL</aside>{parseFloat(_this.props.element.walletBUIDLDollar) > 0 && <span className="USDVALUE"> ${_this.props.element.walletBUIDLDollar}</span>}</p>
                        </section>}
                    </li>
                    <li className="TheDappInfo3">
                        <h5 className="DFOHostingTitle">&#x1F468;&#x1F3FB;&#x200D;&#x1F4BB; Rewards: <a className={"EditDFOYoYO" + (_this.dfoElement && _this.dfoElement.state && _this.dfoElement.state.okBoomer ? ' Editing' : '')} href="javascript:;" onClick={() => _this.emit('okBommer/toggle')}>i</a></h5>
                        <section className="DFOTitleSection">
                            <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.totalSupply && _this.props.element.surveySingleReward !== undefined && <p className="DFOLabelTitleInfo"> Proposal: <b>{window.fromDecimals(_this.props.element.surveySingleReward, _this.props.element.decimals)}</b> <aside className="DFOOverviewPerch">{_this.props.element.symbol}</aside> {_this.renderChangeButton('surveySingleReward')}</p>}
                            </AsyncValue>
                        </section>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The number of Voting Tokens as a reward to the issuer for every single Successful Proposal.</OkBoomer>
                    </li>
                    <li className="TheDappInfo05">
                        <h5 className="DFOHostingTitle">&#129302; Core:</h5>
                        <section className="DFOTitleSection">
                            <a className="LinkVisualButton" target="_blank" href={window.getNetworkElement("etherscanURL") + "address/" + _this.props.element.dFO.options.address}>Etherscan</a>
                        </section>
                        <h5 className="DFOHostingTitle">&#x1F468;&#x1F3FB;&#x200D;&#x1F4BB; Wallet:</h5>
                        <section className="DFOTitleSection">
                            <a className="LinkVisualButton" target="_blank" href={window.getNetworkElement("etherscanURL") + "tokenHoldings?a=" + _this.props.element.walletAddress}>Etherscan</a>
                        </section>
                    </li>
                    {_this.renderChanger(['surveySingleReward'])}
                </ul>
            </section>
        );
    }
});