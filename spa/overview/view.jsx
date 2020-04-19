var Overview = React.createClass({
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
    renderIndexChanger() {
        return (
            <ul>
                <li>
                    <p>DFOs Indexes are designed to work in two layers, the "Distributed Layer" and the "Decentralized Layer". The Distributed Layer  is a version of the Front-End deployed via IPFS or Swarn, for fast and free updates. The Decentralized Layer is a version of the Front-End via On-Chain files, expensive, but critical to make a DFO Censorship Resistant. The ENS automatically redirect users to the Distributed Layer and if it's Censored to the Decentralized Layer.</p>
                </li>
                <li>
                    <section>
                        <a href={this.props.element.link ? "javascript:;" : undefined} className={!this.props.element.link ? undefined : "LinkVisualButton" + (this.state && this.state.indexShow === 'link' ? ' Editing' : "")} onClick={() => this.props.element.link && this.setState({ indexShow: this.state && this.state.indexShow === 'link' ? null : 'link' })}>Code</a>
                        <input id="linkCheck" type="checkbox" className="DFOFunctionIndexIconSelector" onChange={e => { this.linkValue.value = this.props.element.link; this.linkValue.disabled = !e.currentTarget.checked }} />
                        <label htmlFor="linkCheck">Distributed Layer</label>
                        <input className="DFOFunctionIndexIconText" id="link" type="text" placeholder="Link IPFS Swarm" ref={ref => (this.linkValue = ref) && (ref.value = this.props.element.link || '')} disabled />
                    </section>
                    <section>
                        <a href={this.props.element.index ? 'javascript:;' : undefined} className={!this.props.element.index ? undefined : "LinkVisualButton" + (this.state && this.state.indexShow === 'index' ? ' Editing' : "")} onClick={() => this.props.element.index && this.props.element.index !== '0' && this.setState({ indexShow: this.state && this.state.indexShow === 'index' ? null : 'index' })}>Code</a>
                        <input type="hidden" id="index" ref={ref => (this.indexValue = ref) && (ref.value = this.props.element.index)} />
                        <input id="indexCheck" type="checkbox" className="DFOFunctionIndexIconSelector" onChange={e => { this.indexValue.value = this.props.element.index; this.indexFile.value = ''; this.indexFile.disabled = !e.currentTarget.checked }} />
                        <label htmlFor="indexCheck">Decentralized Layer</label>
                        <input className="DFOFunctionIndexIconUpload" id="indexFile" type="file" accept=".html,.htm" ref={ref => this.indexFile = ref} disabled onChange={this.uploadFile} />
                    </section>
                </li>
                {this.state && this.state.indexShow && <section>
                    {this.state.indexShow === 'index' && <Editor lang="html" readonly="true" first={this.state.indexShow === 'index' ? this.props.element.index : undefined} />}
                    {this.state.indexShow === 'link' && <Editor lang="html" readonly="true" link={this.state.indexShow === 'link' ? this.props.element.link : undefined} />}
                </section>}
            </ul>
        );
    },
    renderSurveySingleRewardChanger() {
        return this.renderDefaultChanger("The amount of Voting Tokens set as a single reward for every Accepted Proposal.", "Dev Incentives", "surveySingleReward", window.fromDecimals(this.props.element.surveySingleReward, this.props.element.decimals));
    },
    renderProposalLengthChanger() {
        return this.renderDefaultChanger("Every survey has a length expressed in Blocks. Here you can set the duration of Surveys for this DFO.", "Proposal Length", "proposalLength", this.props.element.blocks);
    },
    renderEmergencyLengthChanger() {
        return this.renderDefaultChanger("The length in Blocks for Emergency Surveys.", "Emergency Length", "minimumBlockNumberForEmergencySurvey", this.props.element.minimumBlockNumberForEmergencySurvey);
    },
    renderEmergencyPenaltyChanger() {
        return this.renderDefaultChanger("The Fee that Emergency Proposal Issuer must stake to propose it and lost if the Proposal fails.", "Emergency Penalty", "emergencySurveyStaking", window.fromDecimals(this.props.element.emergencySurveyStaking, this.props.element.decimals));
    },
    renderQuorumChanger() {
        return this.renderDefaultChanger("The Quorum is minimum token Staken by voters in a survey to reach the success status.", "Quorum", "quorum", window.fromDecimals(this.props.element.quorum, this.props.element.decimals));
    },
    renderProposalStakeChanger() {
        return this.renderDefaultChanger("The minimum of Token Stacked needed to create a new Proposal.", "Proposal Stake", "minimumStaking", window.fromDecimals(this.props.element.minimumStaking, this.props.element.decimals));
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
                    <li>
                        <section className="DFOTitleSection">
                            <AsyncValue>
                                {_this.props.element.ens !== undefined && <a className="LinkVisualStandard" target="_blank" href={"https://" + ((_this.props.element.ens && (_this.props.element.ens.toLowerCase() + '.')) || '') + "dfohub.eth?ensd=" + ((_this.props.element.ens && (_this.props.element.ens.toLowerCase() + '.')) || '') + "dfohub.eth"}>{(_this.props.element.ens && (_this.props.element.ens.toLowerCase() + '.')) || ''}dfohub.eth</a>}
                            </AsyncValue>
                        </section>
                        <h5 className="DFOHostingTitle">&#128302; ENS</h5>
                        <OkBoomer okBoomer={_this.props.okBoomer}>A perpetual unique Web3-Based Name Service to reach this Application</OkBoomer>
                    </li>
                    <li>
                        <section className="DFOTitleSection">
                            <AsyncValue>
                                {<a className="LinkVisualStandard" href="javascript:;" onClick={() => (_this.props.element.link || _this.props.element.index) && this.setState({ change: this.state && this.state.change === 'showCode' ? null : 'showCode' })}>Code</a>}
                            </AsyncValue>
                            {_this.renderChangeButton('index')}
                        </section>
                        <h5 className="DFOHostingTitle">&#128242; Index</h5>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The Front-End code of the Application</OkBoomer>
                    </li>
                    <li>
                        <section className="DFOTitleSection">
                            <a className="LinkVisualStandard" href="javascript:;" onClick={() => _this.emit('section/change', 'Functions')}>
                                <AsyncValue>
                                    {_this.props.element.functionalitiesAmount}
                                </AsyncValue>
                            </a>
                        </section>
                        <h5 className="DFOHostingTitle DFOHostingTitle2">&#128736; Functions</h5>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The number of Back-End Functions of this Application</OkBoomer>
                    </li>
                </ul>
                {_this.renderChanger(['index'])}
                {this.state && this.state.change === 'showCode' && <section className="IndexShowCode">
                    <section className="IndexShowCodeEditorBox">
                        <h5>Distributed Layer</h5>
                        <Editor lang="html" readonly="true" link={_this.props.element.link} firstCode={_this.props.element.link ? undefined : "Distributed Index is actually unset"} />
                    </section>
                    <section className="IndexShowCodeEditorBox">
                        <h5>Decentralized Layer</h5>
                        <Editor lang="html" readonly="true" first={_this.props.element.index} firstCode={_this.props.element.index ? undefined : "Decentralized Index is actually unset"} />
                    </section>
                </section>}
                <ul className="DFOHosting">
                    <li>
                        <section className="DFOTitleSection">
                            <AsyncValue>
                                {_this.props.element.symbol && <a className="LinkVisualStandard" href={window.getNetworkElement("etherscanURL") + 'token/' + _this.props.element.token.options.address} target="_blank">{_this.props.element.symbol}</a>}
                            </AsyncValue>
                        </section>
                        <h5 className="DFOHostingTitle DFOHostingTitle2">&#128587; Voting Token</h5>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The number of Back-End Functions of this Application</OkBoomer>
                    </li>
                    <li>
                        <section className="DFOTitleSection">
                            <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.totalSupply && <a className="LinkVisualStandard" href={window.getNetworkElement("etherscanURL") + 'token/tokenholderchart/' + _this.props.element.token.options.address} target="_blank">{window.fromDecimals(_this.props.element.totalSupply, _this.props.element.decimals)} <aside className="DFOOverviewPerch">{_this.props.element.symbol}</aside></a>}
                            </AsyncValue>
                        </section>
                        <h5 className="DFOHostingTitle DFOHostingTitle2">&#x1F4B0; Supply</h5>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The Existing Voting Token Total Supply of this DFO</OkBoomer>
                    </li>
                    <li>
                        <section className="DFOTitleSection">
                            <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.totalSupply && _this.props.element.communityTokens && <span>{window.fromDecimals(_this.props.element.communityTokens, _this.props.element.decimals)} <aside className="DFOOverviewPerch">{_this.props.element.symbol} ({window.tokenPercentage(_this.props.element.communityTokens, _this.props.element.totalSupply)})</aside></span>}
                            </AsyncValue>
                        </section>
                        <h5 className="DFOHostingTitle DFOHostingTitle2">&#x1F468;&#x200D;&#x1F468;&#x200D;&#x1F467;&#x200D;&#x1F467; Community Supply</h5>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The Supply of Voting Tokens Held by this DFO's Community Wallet</OkBoomer>
                    </li>
                </ul>
                <ul className="DFOHosting">
                    <li>
                        <section className="DFOTitleSection">
                            <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.totalSupply && _this.props.element.surveySingleReward && <span>{window.fromDecimals(_this.props.element.surveySingleReward, _this.props.element.decimals)} <aside className="DFOOverviewPerch">{_this.props.element.symbol}</aside></span>}
                            </AsyncValue>
                            {_this.renderChangeButton('surveySingleReward')}
                        </section>
                        <h5 className="DFOHostingTitle">&#x1F468;&#x1F3FB;&#x200D;&#x1F4BB; Dev Incentives</h5>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The number of Voting Tokens as a reward for every single Successful Proposal to the Issuer</OkBoomer>
                    </li>
                    <li>
                        <section className="DFOTitleSection">
                            <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.totalSupply && _this.props.element.quorum && <span>{window.fromDecimals(_this.props.element.quorum, _this.props.element.decimals)} <aside className="DFOOverviewPerch">{_this.props.element.symbol} ({window.tokenPercentage(_this.props.element.quorum, _this.props.element.totalSupply)})</aside></span>}
                            </AsyncValue>
                            {_this.renderChangeButton('quorum')}
                        </section>
                        <h5 className="DFOHostingTitle">&#127984; Quorum</h5>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The minimum number of Voters to win a Proposal in therms of percentage of Voting Tokens Staked and the Total Supply</OkBoomer>
                    </li>
                    <li>
                        <section className="DFOTitleSection">
                            {_this.props.element.blocks === undefined && <LoaderMinimino />}
                            {_this.props.element.blocks !== undefined && <span>{_this.props.element.blocks} <aside>Blocks</aside></span>}
                            {_this.renderChangeButton('proposalLength')}
                        </section>
                        <h5 className="DFOHostingTitle">&#x23F0; Proposal Length</h5>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The number of Blocks from the beginning to the end of a Proposal</OkBoomer>
                    </li>
                </ul>
                {_this.renderChanger(['surveySingleReward', 'quorum', 'proposalLength'])}
                <ul className="DFOHosting">
                    <li>
                        <section className="DFOTitleSection">
                            <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.totalSupply && _this.props.element.minimumStaking !== undefined && <span>{window.fromDecimals(_this.props.element.minimumStaking, _this.props.element.decimals)} <aside className="DFOOverviewPerch">{_this.props.element.symbol} ({window.tokenPercentage(_this.props.element.minimumStaking, _this.props.element.totalSupply)})</aside></span>}
                            </AsyncValue>
                            {_this.renderChangeButton('proposalStake')}
                        </section>
                        <h5 className="DFOHostingTitle">&#x1F3EF; Proposal Stake</h5>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The minimum of Voting Tokens Staked to create a Proposal</OkBoomer>
                    </li>
                    <li>
                        <section className="DFOTitleSection">
                            {_this.props.element.minimumBlockNumberForEmergencySurvey === undefined && <LoaderMinimino />}
                            {_this.props.element.minimumBlockNumberForEmergencySurvey !== undefined && <span>{_this.props.element.minimumBlockNumberForEmergencySurvey} <aside>Blocks</aside></span>}
                            {_this.renderChangeButton('emergencyLength')}
                        </section>
                        <h5 className="DFOHostingTitle">&#x1F6A8; Emergency Length</h5>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The number of Blocks from the beginning to the end of an Emergency Proposal</OkBoomer>
                    </li>
                    <li>
                        <section className="DFOTitleSection">
                            <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.totalSupply && _this.props.element.emergencySurveyStaking && <span>{window.fromDecimals(_this.props.element.emergencySurveyStaking, _this.props.element.decimals)} <aside className="DFOOverviewPerch">{_this.props.element.symbol} ({window.tokenPercentage(_this.props.element.emergencySurveyStaking, _this.props.element.totalSupply)})</aside></span>}
                            </AsyncValue>
                            {_this.renderChangeButton('emergencyPenalty')}
                        </section>
                        <h5 className="DFOHostingTitle">&#x2696;&#xFE0F; Emergency Penalty</h5>
                        <OkBoomer okBoomer={_this.props.okBoomer}>The minimum of Voting Tokens Staked to create an Emergency Proposal. If the proposal Fail All Staked Tokens will be liquidated</OkBoomer>
                    </li>
                </ul>
                {_this.renderChanger(['proposalStake', 'emergencyLength', 'emergencyPenalty'])}
            </section>
        );
    }
});