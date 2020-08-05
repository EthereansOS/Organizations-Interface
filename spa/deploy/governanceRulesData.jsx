var GovernanceRulesData = React.createClass({
    requiredScripts: [
        'spa/okBoomer.jsx'
    ],
    getData() {
        var _this = this;
        var data = window.getData(this.domRoot);
        data.governanceRules = (this.state && this.state.element) || this.props.allData.governanceRules;
        data.governanceRulesText = this.state && this.state.governanceRulesText;
        data.surveyQuorum = parseFloat(data.surveyQuorumCheck ? this.surveyQuorum.dataset.value : undefined);
        var errors = [];
        if (!data.governanceRules) {
            throw ['You must choose one of te proposed governance rules to continue'];
        }
        var errors = [];
        (isNaN(data.surveyLength) || data.surveyLength < 1) && errors.push('Survey Length must be greater than or equal to 1');
        (isNaN(data.emergencySurveyLength) || data.emergencySurveyLength < 1) && errors.push('Emergency Survey Length must be greater than or equal to 1');
        (isNaN(data.emergencySurveyStaking) || data.emergencySurveyStaking < 0 || data.emergencySurveyStaking > parseFloat(_this.props.allData.tokenTotalSupply)) && errors.push('Emergency Survey Penalty must be a number between 0 and ' + _this.props.allData.tokenTotalSupply);
        data.surveyQuorumCheck && (isNaN(data.surveyQuorum) || data.surveyQuorum < 0 || data.surveyQuorum > parseFloat(_this.props.allData.tokenTotalSupply)) && errors.push('Survey quorum must be a number between 0 and ' + _this.props.allData.tokenTotalSupply);
        data.governanceRules === 'HodlersDriven' && (isNaN(data.surveyMinStake) || data.surveyMinStake < 0 || parseFloat(data.surveyMinStake) > parseFloat(_this.props.allData.tokenTotalSupply)) && errors.push('Survey minimum stake must be a number between 0 and ' + _this.props.allData.tokenTotalSupply);
        data.governanceRules === 'CommunityDriven' && (isNaN(data.surveyCommunityStake) || data.surveyCommunityStake < 0 || parseFloat(data.surveyCommunityStake) > _this.props.allData.availableSupply) && errors.push('Survey Community reward must be a number between 0 and ' + _this.props.allData.availableSupply);
        data.governanceRules === 'CommunityDriven' && (isNaN(data.surveySingleReward) || data.surveySingleReward < 0 || parseFloat(data.surveySingleReward) > parseFloat(_this.props.allData.tokenTotalSupply)) && errors.push('Survey single reward must be a number between 0 and ' + _this.props.allData.tokenTotalSupply);
        if (errors.length > 0) {
            throw errors;
        }
        return data;
    },
    onClick(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.sectionChange($(e.currentTarget).children('h6').html());
    },
    sectionChange(governanceRulesText, props) {
        this.domRoot.children().find('li').each((i, elem) => {
            var $elem = $(elem).removeClass('selected');
            $elem.children('a').children('h6').html() === governanceRulesText && $elem.addClass('selected');
        });
        var _this = this;
        var element = governanceRulesText.split(' ').join('');
        _this.setState({ element, governanceRulesText, props: props || null });
    },
    onQuorumChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var surveyQuorumPercentage = parseFloat(this.surveyQuorumPercentage.value);
        if (surveyQuorumPercentage < 0) {
            surveyQuorumPercentage = 0;
            this.surveyQuorumPercentage.value = surveyQuorumPercentage;
        }
        if (surveyQuorumPercentage > 100) {
            surveyQuorumPercentage = 100;
            this.surveyQuorumPercentage.value = surveyQuorumPercentage;
        }
        this.surveyQuorum.innerHTML = '';
        if (isNaN(surveyQuorumPercentage)) {
            return;
        }
        var result = parseInt(this.props.allData.totalSupplyWei) * (surveyQuorumPercentage * 100) / 10000;
        result = window.fromDecimals(result, 18);
        this.surveyQuorum.dataset.value = result;
        this.surveyQuorum.innerHTML = result;
    },
    renderSurveyLength() {
        return (
            <div className="InsertSurveyLength GovernSelectorPage">
                <label htmlFor="surveyLength">Survey Length:</label>
                <input className="GigiImputabene" autocomplete="off" id="surveyLength" type="number" />
                <span>Blocks</span>
                <p className="OkBoomer">Every survey has a length expressed in Blocks. Here you can set the duration of Surveys for this DFO.<div className="BoomerTriangle"></div></p>
            </div>
        );
    },
    renderSurveyQuorum() {
        return (
            <div className="InsertSurveyQuorum GovernSelectorPage">
                <input className="SurveyQuorumYN" id="surveyQuorumCheck" type="checkbox" onChange={e => {
                    this.surveyQuorumPercentage.value = '';
                    this.surveyQuorum.innerHTML = 0;
                    this.surveyQuorumPercentage.disabled = !e.target.checked;
                }} />
                <label htmlFor="surveyQuorumCheck">Survey Quorum:</label>
                <input className="SurveyQuorumHow" ref={ref => (this.surveyQuorumPercentage = ref) && (ref.disabled = !this.props.allData.surveyQuorumCheck)} autocomplete="off" type="number" min="0" max="100" onChange={this.onQuorumChange}/>
                <span>{'\u00a0'}%{'\u00a0'}<span data-value={window.numberToString(this.props.allData.surveyQuorum)} ref={ref => (this.surveyQuorum = ref) && (ref.innerHTML = window.numberToString(this.props.allData.surveyQuorum))}>0</span>{'\u00a0'}{this.props.allData.tokenSymbol}</span>
                <p className="OkBoomer">The Quorum is minimum token Staken by voters in a survey to reach the success status.<div className="BoomerTriangle"></div></p>
            </div>
        );
    },
    renderSurveyMaxCap() {
        return (
            <div className="InsertSurveyQuorum GovernSelectorPage">
                <input className="SurveyQuorumYN" id="surveyMaxCapCheck" type="checkbox" onChange={e => {
                    this.surveyQuorumPercentage.value = '';
                    this.surveyQuorum.innerHTML = 0;
                    this.surveyQuorumPercentage.disabled = !e.target.checked;
                }} />
                <label htmlFor="surveyQuorumCheck">Survey Max Cap:</label>
                <input className="SurveyQuorumHow" ref={ref => (this.surveyQuorumPercentage = ref) && (ref.disabled = !this.props.allData.surveyQuorumCheck)} autocomplete="off" type="number" min="0" max="100" onChange={this.onQuorumChange}/>
                <span>{'\u00a0'}%{'\u00a0'}<span data-value={window.numberToString(this.props.allData.surveyQuorum)} ref={ref => (this.surveyQuorum = ref) && (ref.innerHTML = window.numberToString(this.props.allData.surveyQuorum))}>0</span>{'\u00a0'}{this.props.allData.tokenSymbol}</span>
                <p className="OkBoomer">Reaching the Max Cap, the proposal passes independently from the Servey Lenght.<div className="BoomerTriangle"></div></p>
            </div>
        );
    },
    renderSurveyMinStake() {
        return (
            <div className="InsertSurveyQuorum GovernSelectorPage">
            <input className="SurveyQuorumYN" id="surveyMaxcapCheck" type="checkbox" onChange={e => {
                this.surveyMaxcapPercentage.value = '';
                this.surveyMaxcap.innerHTML = 0;
                this.surveyMaxcapPercentage.disabled = !e.target.checked;
            }} />
                <label htmlFor="surveyMinStake GovernSelectorPage">Min Staking:</label>
                <input autocomplete="off" id="surveyMinStake" className="GigiImputabene" type="number" min="1" max={this.props.allData.tokenTotalSupply}/>
                <span>to Propose Updates</span>
                <p className="OkBoomer">The minimum of Token Stacked needed to create a new Proposal.<div className="BoomerTriangle"></div></p>
            </div>
        );
    },
    renderSurveyEmergencyLength() {
        return (
            <div className="InsertSurveyEmergencyLength GovernSelectorPage">
                <label htmlFor="emergencySurveyLength">Emergency Length:</label>
                <input autocomplete="off" id="emergencySurveyLength" type="number" min="1" />
                <span>Blocks</span>
                <p className="OkBoomer">Emergency Proposals are designed as a Faster Proposal System for bug fixing. To ensure that users have economic disincentives to use it to fraud the community, we advise setting a High Penalty Fee, because if the Proposal Fails, the Proposer will lose it.<div className="BoomerTriangle"></div></p>
            </div>
        );
    },
    renderSurveyEmergencyPenalty() {
        return (
            <div className="InsertSurveyEmergencyPenalty GovernSelectorPage">
                <label htmlFor="emergencySurveyStaking">Penalty Fee:</label>
                <input autocomplete="off" id="emergencySurveyStaking" type="number" min="1" max={this.props.allData.tokenTotalSupply}/>
                <span></span>
                <p className="OkBoomer">The Fee that Emergency Proposal Issuer must stake to propose it and lost if the Proposal fails. <div className="BoomerTriangle"></div></p>
            </div>
        );
    },
    renderSurveyCommunityStake() {
        return (
            <div className="InsertSurveyQuorum GovernSelectorPage">
            <input className="SurveyQuorumYN" id="surveyMaxcapCheck" type="checkbox" onChange={e => {
                this.surveyMaxcapPercentage.value = '';
                this.surveyMaxcap.innerHTML = 0;
                this.surveyMaxcapPercentage.disabled = !e.target.checked;
            }} />
                <label htmlFor="surveyCommunityStake">DFO Locked Supply:</label>
                <input autocomplete="off" className="GigiImputabene" id="surveyCommunityStake" type="number" min="1" max={this.props.allData.tokenTotalSupply}/>
                <span></span>
                <p className="OkBoomer">The amount of Voting Tokens locked in the DFO wallet (For Fixed Inflation, Liquidity Staking, Rewards and other Community Features).<div className="BoomerTriangle"></div></p>
            </div>
        );
    },
    renderSurveySingleReward() {
        return (
            <div className="InsertSurveyQuorum GovernSelectorPage">
            <input className="SurveyQuorumYN" id="surveyMaxcapCheck" type="checkbox" onChange={e => {
                this.surveyMaxcapPercentage.value = '';
                this.surveyMaxcap.innerHTML = 0;
                this.surveyMaxcapPercentage.disabled = !e.target.checked;
            }} />
                <label htmlFor="surveySingleReward">Activity Reward:</label>
                <input autocomplete="off" id="surveySingleReward" className="GigiImputabene" type="number" min="1" max={this.props.allData.tokenTotalSupply}/>
                <span>of Staked Tokens</span>
                <p className="OkBoomer">The amount of Voting Tokens set as a reward to the issuer for every Accepted Proposal paid automatically by the DFO Wallet.<div className="BoomerTriangle"></div></p>
            </div>
        );
    },
    /*renderOpenBasic() {
        return (
            <section className="DeployNewWhat">
                {this.renderSurveyLength()}
                {this.renderSurveyQuorum()}
                {this.renderEmergencySuite()}
            </section>
        );
    },
    renderHodlersDriven() {
        return (
            <section className="DeployNewWhat">
                {this.renderSurveyLength()}
                {this.renderSurveyQuorum()}
                {this.renderSurveyMinStake()}
                {this.renderEmergencySuite()}
            </section>
        );
    },
    renderCommunityDriven() {
        return (
            <section className="DeployNewWhat">
                {this.renderSurveyLength()}
                {this.renderSurveyQuorum()}
                {this.renderSurveyCommunityStake()}
                {this.renderSurveySingleReward()}
                {this.renderEmergencySuite()}
            </section>
        );
    },*/

    renderBasicSuite() {
        return ([
            <p className="WOWDescription">Basic Governance Rules</p>,
            this.renderSurveyLength(),
            this.renderSurveyMinStake(),
            this.renderSurveyCommunityStake()
        ]);
    },
    renderAdvancedSuite() {
        return ([
            <p className="WOWDescription">Advanced Governance Rules</p>,
                this.renderSurveyQuorum(),
                this.renderSurveyMaxCap(),
                this.renderSurveySingleReward()
        ]);
    },
    renderEmergencySuite() {
        return ([
            <p className="WOWDescription">Emergency Governance Rules</p>,
            this.renderSurveyEmergencyLength(),
            this.renderSurveyEmergencyPenalty()
        ]);
    },
    render() {
        var element = (this.state && this.state.element) || this.props.allData.governanceRules;
        return (
            <section>
                <p>
                    <span>3 of 3 | Governance</span>
                    <br/>
                    Its time to choose the Governance Rules! All Governance Rules can be changed anytime via proposals.
                </p>
                <section className="DFOGovernanceSelector">
                    <ul className="DFOGovernanceType">
                        {/*<li className={element === "OpenBasic" ? "selected" : undefined}>
                            <a href="javascript:;" onClick={this.onClick}>
                                <h6>Open Basic</h6>
                                <p>Anyone can propose updates. Voting Token Holders can vote by staking their tokens.</p>
                            </a>
                            <span className="SelectedTriangle"></span>
                        </li>
                        <li className={element === "HodlersDriven" ? "selected" : undefined}>
                            <a href="javascript:;" onClick={this.onClick}>
                                <h6>Hodlers Driven</h6>
                                <p>Only Voting Tokens Holders can propose updates.</p>
                            </a>
                            <span className="SelectedTriangle"></span>
                        </li>
                        <li className={element === "CommunityDriven" ? "selected" : undefined}>
                            <a href="javascript:;" onClick={this.onClick}>
                                <h6>Community Driven</h6>
                                <p>Open Basic, but with a fixed number of Token Staked to reward the community to BUIDL the project.</p>
                            </a>
                            <span className="SelectedTriangle"></span>
                        </li>*/}
                        <section className="DeployNewWhat">
                            {this.renderBasicSuite()}
                            {this.renderAdvancedSuite()}
                            {this.renderEmergencySuite()}
                        </section>

                    </ul>
                    {element && this['render' + element]()}
                </section>
            </section>);
    }
});