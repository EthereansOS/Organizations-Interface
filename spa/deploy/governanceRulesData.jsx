var GovernanceRulesData = React.createClass({
    requiredScripts: [
        'spa/okBoomer.jsx'
    ],
    getData() {
        var _this = this;
        var data = window.getData(this.domRoot);
        var errors = [];
        (isNaN(data.surveyLength) || data.surveyLength <= 0) && errors.push("Survey Length must be a number greater than 0");
        (isNaN(data.emergencySurveyLength) || data.emergencySurveyLength <= 0) && errors.push("Emergency Survey Length must be a number greater than 0");
        var availableSupply = parseFloat(window.fromDecimals(this.props.allData.availableSupply, 18).split(',').join(''));
        var calculateAvailableSupplyBasedField = function calculateAvailableSupplyBasedField(data, availableSupply, errors, fieldName, label, bypassCheck) {
            if(!data[fieldName + 'Check'] && !bypassCheck) {
                return;
            }
            var value = parseFloat(data[fieldName].split(',').join(''));
            var minCheck = bypassCheck ? value < 0 : value <= 0;
            (isNaN(value) || minCheck || value > availableSupply) && errors.push(`${label || _this[fieldName + 'Label'].innerHTML.split(':').join('')} must be a valid, positive number ${bypassCheck ? 'between 0 and' : 'less than'} ${window.formatMoney(availableSupply)}`);
        };
        calculateAvailableSupplyBasedField(data, availableSupply, errors, 'emergencySurveyStaking', undefined, true);
        calculateAvailableSupplyBasedField(data, availableSupply, errors, 'surveyQuorum');
        calculateAvailableSupplyBasedField(data, availableSupply, errors, 'surveyMaxCap');
        calculateAvailableSupplyBasedField(data, availableSupply, errors, 'surveyMinStake');
        calculateAvailableSupplyBasedField(data, availableSupply, errors, 'surveyCommunityStake');
        calculateAvailableSupplyBasedField(data, availableSupply, errors, 'surveySingleReward');
        if (errors.length > 0) {
            throw errors;
        }
        return data;
    },
    renderSurveyLength() {
        return this.renderInput("InsertSurveyLength", "", "surveyLength", "Survey Length", "", "number", "Blocks", false, "Every survey has a length expressed in Blocks. Here you can set the duration of Surveys for this DFO.");
    },
    renderSurveyEmergencyLength() {
        return this.renderInput("InsertSurveyEmergencyLength", "", "emergencySurveyLength", "Emergency Length", "", "number", "Blocks", false, "Emergency Proposals are designed as a Faster Proposal System for bug fixing. To ensure that users have economic disincentives to use it to fraud the community, we advise setting a High Penalty Fee, because if the Proposal Fails, the Proposer will lose it.");
    },
    renderSurveyEmergencyPenalty() {
        return this.renderInput("InsertSurveyEmergencyPenalty", "", "emergencySurveyStaking", "Penalty Fee", "", "text", this.props.allData.tokenSymbol, true, "The Fee that Emergency Proposal Issuer must stake to propose it and lost if the Proposal fails.");
    },
    renderSurveyQuorum() {
        return this.renderInput("InsertSurveyQuorum", "SurveyQuorumYN", "surveyQuorum", "Survey Quorum", "SurveyQuorumHow", "text", this.props.allData.tokenSymbol, true, "The Quorum is minimum token Staken by voters in a survey to reach the success status.");
    },
    renderSurveyMaxCap() {
        return this.renderInput("InsertSurveyQuorum", "SurveyQuorumYN", "surveyMaxCap", "Max Cap", "SurveyQuorumHow", "text", this.props.allData.tokenSymbol, true, "Reaching the Max Cap, the proposal passes independently from the Survey Lenght.");
    },
    renderSurveyMinStake() {
        return this.renderInput("InsertSurveyQuorum", "SurveyQuorumYN", "surveyMinStake", "Min Staking", "", "text", this.props.allData.tokenSymbol + " to Propose Updates", true, "The minimum of Token Staked needed to create a new Proposal.");
    },
    renderSurveyCommunityStake() {
        return this.renderInput("InsertSurveyQuorum", "SurveyQuorumYN", "surveyCommunityStake", "DFO Locked Supply", "", "text", this.props.allData.tokenSymbol, true, "The amount of Voting Tokens locked in the DFO wallet (For Fixed Inflation, Liquidity Staking, Rewards and other Community Features).");
    },
    renderSurveySingleReward() {
        return this.renderInput("InsertSurveyQuorum", "SurveyQuorumYN", "surveySingleReward", "Activity Reward", "", "text", this.props.allData.tokenSymbol + " of staked tokens", true, "The amount of Voting Tokens set as a reward to the issuer for every Accepted Proposal paid automatically by the DFO Wallet.");
    },
    onCheck(e) {
        var fieldName = e.currentTarget.dataset.id;
        var inputType = e.currentTarget.dataset.type;
        this[fieldName].value = e.currentTarget.checked ? '0' : '';
        e.target.checked && inputType === 'text' && (this[fieldName].value += '.00');
        this[fieldName].disabled = !e.target.checked;
        this.calculatePercentage({currentTarget: this[fieldName]});
        e.target.checked && this[fieldName].focus();
    },
    inputRef(ref, fieldName, checkBoxClassName, percentage) {
        this[fieldName] = ref;
        if(!ref) {
            return;
        }
        var allData = this.props.allData || {};
        ref.disabled = !checkBoxClassName ? false : !allData[fieldName + 'Check'];
        ref.value = allData[fieldName] || '';
        percentage && (ref.onkeyup = this.calculatePercentage)
    },
    percentageRef(ref, fieldName) {
        this[fieldName + 'Percentage'] = ref;
        if(!ref) {
            return;
        }
        this.calculatePercentage({
            currentTarget : {
                id: fieldName,
                value : (this.props && this.props.allData && this.props.allData[fieldName]) || ''
            }
        });
    },
    calculatePercentage(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this[e.currentTarget.id + "Percentage"].innerHTML = '';
        var value = e.currentTarget.value.split(',').join('').trim();
        if(value === '') {
            return;
        }
        var value = parseFloat(value);
        value = isNaN(value) ? 0 : value;
        value = (value * 100) / parseFloat(window.fromDecimals(this.props.allData.availableSupply, 18).split(',').join(''));
        value = window.formatMoney(value);
        this[e.currentTarget.id + "Percentage"].innerHTML = `(${value}% of total ${this.props.allData.tokenSymbol} supply)`;
    },
    renderInput(containerClass, checkBoxClassName, fieldName, label, inputClassName, inputType, postFixedText, percentage, description) {
        var _this = this;
        return (<div className={containerClass + " GovernSelectorPage"}>
            {checkBoxClassName && <input className={checkBoxClassName} id={fieldName + "Check"} data-id={fieldName} data-type={inputType || 'text'} type="checkbox" onChange={this.onCheck}/>}
            <label htmlFor={fieldName} ref={ref => _this[fieldName + "Label"] = ref}>{label}:</label>
            <input id={fieldName} className={inputClassName || "GigiImputabene"} ref={ref => _this.inputRef(ref, fieldName, checkBoxClassName, percentage)} type={inputType || "text"} placeholder="Amount" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" min="0"/>
            {postFixedText && <span>{postFixedText}</span>}
            {percentage && <span ref={ref => this.percentageRef(ref, fieldName)}/>}
            <p className="OkBoomer">{description} <div className="BoomerTriangle"/></p>
        </div>);
    },
    renderSuite(sectionName) {
        var result = [<p className="WOWDescription">{sectionName}</p>];
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                result.push(this['render' + arguments[i].firstLetterToUpperCase()]());
            }
        }
        return result;
    },
    renderBasicSuite() {
        return this.renderSuite("Basic Governance Rules", "surveyLength", "surveyMinStake", "surveyCommunityStake");
    },
    renderAdvancedSuite() {
        return this.renderSuite("Advanced Governance Rules", "surveyQuorum", "surveyMaxCap", "surveySingleReward");
    },
    renderEmergencySuite() {
        return this.renderSuite("Emergency Governance Rules", "surveyEmergencyLength", "surveyEmergencyPenalty");
    },
    render() {
        return (<section>
            <p>
                <span>3 of 3 | Governance</span>
                <br />
                Its time to choose the Governance Rules! All Governance Rules can be changed anytime via proposals.
            </p>
            <section className="DFOGovernanceSelector">
                <ul className="DFOGovernanceType">
                    <section className="DeployNewWhat">
                        {this.renderBasicSuite()}
                        {this.renderAdvancedSuite()}
                        {this.renderEmergencySuite()}
                    </section>
                </ul>
            </section>
        </section>);
    }
});