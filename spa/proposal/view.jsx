var Proposal = React.createClass({
    requiredModules: [
        'spa/editor'
    ],
    requiredScripts: [
        'spa/loaderMinimino.jsx'
    ],
    getInitialState() {
        return {
            survey: this.props.survey
        }
    },
    switchRef(ref) {
        this.switch = ref;
        var _this = this;
        _this.switch && (_this.switch.onchange = function (e) {
            e && e.preventDefault(true) && e.stopPropagation(true);
            _this.switchFrom.innerHTML = '&#99' + (_this.switch.value === 'Refuse' ? '89' : '40') + ';';
        });
    },
    componentDidMount() {
        this.mountDate = new Date().getTime() + "_" + Math.random();
        this.controller.loadSurvey();
    },
    componentWillUnmount() {
        delete this.mountDate;
    },
    interact(e, survey) {
        this.emit('message', '');
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var target = $(e.currentTarget);
        var loader = $('<section class="loaderMinimino"/>').insertAfter(target.hide());
        var name = target.html();
        var parentSection = target.parents('section');
        var value = undefined;
        var type = undefined;
        var replaceSituation = function replaceSituation() {
            loader.remove();
            target.show();
            return true;
        };
        try {
            if (parentSection.children('input').length > 0) {
                value = parseFloat(parentSection.children('input').val());
                type = parentSection.children('select').val();
                if (isNaN(value) || value <= 0) {
                    return replaceSituation() && this.emit('message', 'Insert a valid amount greater than zero to proceed', 'error');
                }
            }
        } catch (e) {
        }
        var _this = this;
        this.controller.interact(survey, name, type, window.toDecimals(value, this.props.element.decimals)).then(replaceSituation).catch(e => replaceSituation() && _this.emit('message', e.message || e, "error"));
    },
    renderTerminated(percAccepted, percRefused) {
        var _this = this;
        var it = _this.state.survey;
        var rendered = [<section className="ProposalPool">
            <h6>{(it.result || it.leading) && <span>&#9989; Accepted</span>} {!it.result && !it.leading && <span>&#9940; Refused</span>}</h6>
            <p>{!it.resultBlock && "Last Checked "}Block: <a href={window.getNetworkElement('etherscanURL') + 'block/' + (it.resultBlock || it.lastCheckedBlock)} target="_blank">{(it.resultBlock || it.lastCheckedBlock)}</a></p>
            <p>Total Votes: {window.fromDecimals(it.allVotes, _this.props.element.decimals)} {_this.props.element.symbol}</p>
            {!it.withdrawed && <p className="AllRed">To Withdraw: {window.fromDecimals(it.myVotes, _this.props.element.decimals)} {_this.props.element.symbol}</p>}
            <section>
                {(it.surveyEnd || it.hardCapReached) && !it.terminationData && <section className="MutoStai">
                    <p>Sometime Web 3 providers can't estimate correctly the Max Gas needed for complex transactions. Finalizing a Proposal, you execute the code in the EVM, be sure to add the right Max Gas required for its execution. Do it at your own risk. <a href="https://blockgeeks.com/guides/ethereum-gas/">More</a></p>
                    <WalletEnablerButton className="LinkVisualButton LinkVisualButtonB ProposalPoolWithdraw" onClick={e => _this.controller.finalize(e, it)}>Finalize</WalletEnablerButton>
                </section>}
                {it.terminationData && !it.withdrawed && parseInt(it.myVotes) > 0 && <WalletEnablerButton className="LinkVisualButton ProposalPoolWithdraw" onClick={e => _this.controller.withdraw(e, it)}>Withdraw</WalletEnablerButton>}
                <a className={"LinkVisualButton" + (_this.props.toggle === ('info_' + it.key) ? ' Editing' : '')} href="javascript:;" onClick={() => _this.emit('toggle', _this.props.toggle === ('info_' + it.key) ? null : ('info_' + it.key))}>Info</a>
                {(it.code || it.replacesCode) && <a className={"LinkVisualButton" + (_this.props.toggle === ('code_' + it.key) ? ' Editing' : '')} href="javascript:;" onClick={() => _this.controller.tryLoadDiff().then(() => _this.emit('toggle', _this.props.toggle === ('code_' + it.key) ? null : ('code_' + it.key)))}>Code</a>}
            </section>
            <a className="LinkVisualStandard" href={window.getNetworkElement('etherscanURL') + 'address/' + it.address} target="_blank">Proposal</a>
            <a className="LinkVisualStandard" href={window.getNetworkElement('etherscanURL') + 'address/' + it.location} target="_blank">Contract</a>
        </section>];
        _this.props.toggle === ('info_' + it.key) && rendered.push(<section className="ProposalVote">
            <section className="ProposalVoteINFO">
                <section className="ProposalVoteToken">
                    <h6>Results by Token:</h6>
                    <section className="ProposalPoolReview">
                        <section className="ProposalPoolReviewEm">
                            <p>&#9989;</p>
                        </section>
                        <section className="ProposalPoolReviewPercentage">
                            <p className="ProposalPoolReviewPercentageY" style={{ "width": percAccepted }}>{percAccepted}</p>
                        </section>
                    </section>
                    <p>{window.fromDecimals(it.accepted, _this.props.element.decimals)} {_this.props.element.symbol}</p>
                    <section className="ProposalPoolReview">
                        <section className="ProposalPoolReviewEm">
                            <p>&#9940;</p>
                        </section>
                        <section className="ProposalPoolReviewPercentage">
                            <p className="ProposalPoolReviewPercentageN" style={{ "width": percRefused }}>{percRefused}</p>
                        </section>
                    </section>
                    <p>{window.fromDecimals(it.refused, _this.props.element.decimals)} {_this.props.element.symbol}</p>
                </section>
            </section>
        </section>);
        return rendered;
    },
    renderRunning(percAccepted, percRefused) {
        var _this = this;
        var it = _this.state.survey;
        var rendered = [<section className="ProposalAction ProposalPool">
            <p>Leading: {it.leading && <span>&#9989;</span>}{!it.leading && <span>&#9940;</span>}</p>
            <p>End Block:<a target="_blank" href={window.getNetworkElement('etherscanURL') + 'block/' + it.endBlock}>{it.endBlock}</a></p>
            {!it.surveyEnd && <WalletEnablerButton className={"LinkVisualButton LinkVisualButtonB" + (_this.state && _this.state.toggle === ('vote_' + it.key) ? ' Editing' : '')} onClick={() => _this.emit('toggle', _this.props.toggle === ('vote_' + it.key) ? null : ('vote_' + it.key))}>Vote</WalletEnablerButton>}
            {(it.code || it.replacesCode) && <a className={"LinkVisualButton" + (_this.props.toggle === ('code_' + it.key) ? ' Editing' : '')} href="javascript:;" onClick={() => _this.controller.tryLoadDiff().then(() => _this.emit('toggle', _this.props.toggle === ('code_' + it.key) ? null : ('code_' + it.key)))}>Code</a>}
            <br/>
            <br/>
            <a className="LinkVisualStandard" href={window.getNetworkElement('etherscanURL') + 'address/' + it.address} target="_blank">Proposal</a>
            <a className="LinkVisualStandard" href={window.getNetworkElement('etherscanURL') + 'address/' + it.location} target="_blank">Contract</a>
            {it.surveyEnd && !it.terminated && <section className="MutoStai">
            <p>Sometime Web 3 providers can't estimate correctly the Max Gas needed for complex transactions. Finalizing a Proposal, you execute the code in the EVM, be sure to add the right Max Gas required for its execution. Do it at your own risk. <a href="https://blockgeeks.com/guides/ethereum-gas/">More</a></p>
                <WalletEnablerButton className="LinkVisualButton LinkVisualButtonB ProposalPoolWithdraw" onClick={e => _this.controller.finalize(e, it)}>Finalize</WalletEnablerButton>
            </section>}
        </section>];
        _this.props.toggle === 'vote_' + it.key && rendered.push(<section className="ProposalVote">
            <section className="ProposalVoteINFO">
                <section className="ProposalVoteToken">
                    <h6>Status by Token:</h6>
                    <section className="ProposalPoolReview">
                        <section className="ProposalPoolReviewEm">
                            <p>&#9989;</p>
                        </section>
                        <section className="ProposalPoolReviewPercentage">
                            <p className="ProposalPoolReviewPercentageY" style={{ "width": percAccepted }}>{percAccepted}</p>
                        </section>
                    </section>
                    <p>{window.fromDecimals(it.accepted, _this.props.element.decimals)} {_this.props.element.symbol}</p>
                    <section className="ProposalPoolReview">
                        <section className="ProposalPoolReviewEm">
                            <p>&#9940;</p>
                        </section>
                        <section className="ProposalPoolReviewPercentage">
                            <p className="ProposalPoolReviewPercentageN" style={{ "width": percRefused }}>{percRefused}</p>
                        </section>
                    </section>
                    <p>{window.fromDecimals(it.refused, _this.props.element.decimals)} {_this.props.element.symbol}</p>
                </section>
                <section className="ProposalVoteBalances">
                    <h6>Available Balance</h6>
                    <p>{window.fromDecimals(it.myBalance, _this.props.element.decimals)} {_this.props.element.symbol}</p>
                    <h6>Staked Balance</h6>
                    <p>&#9989; | {window.fromDecimals(it.myAccepts, _this.props.element.decimals)} {_this.props.element.symbol}</p>
                    <p>&#9940; | {window.fromDecimals(it.myRefuses, _this.props.element.decimals)} {_this.props.element.symbol}</p>
                </section>
            </section>
            <section className="ProposalVoteVoting">
                <section className="ProposalVoteVotingNew">
                    <p>Vote to</p>
                    <select>
                        <option value="Accept">&#9989; Accept</option>
                        <option value="Refuse">&#9940; Refuse</option>
                    </select>
                    <input type="number" min="1" placeholder="Amount" />
                    <a className="LinkVisualButton" href="javascript:;" onClick={e => _this.interact(e, it)}>Vote</a>
                </section>
                <section className="ProposalVoteVotingExit">
                    <p>Withdraw From</p>
                    <select>
                        <option value="Accept">&#9989;</option>
                        <option value="Refuse">&#9940;</option>
                    </select>
                    <input type="number" min="1" placeholder="Amount" />
                    <a className="LinkVisualButton" href="javascript:;" onClick={e => _this.interact(e, it)}>Withdraw</a>
                </section>
                <section className="ProposalVoteVotingExit">
                    <a className="LinkVisualButton" href="javascript:;" onClick={e => _this.interact(e, it)}>Withdraw All</a>
                </section>
                <section className="ProposalVoteVotingExit">
                    <p>Switch To</p>
                    <select ref={_this.switchRef}>
                        <option value="Accept">&#9989;</option>
                        <option value="Refuse">&#9940;</option>
                    </select>
                    <p>from <span ref={ref => _this.switchFrom = ref}>&#9940;</span></p>
                    <input type="number" min="1" placeholder="Amount" />
                    <a className="LinkVisualButton" href="javascript:;" onClick={e => _this.interact(e, it)}>Switch</a>
                </section>
            </section>
        </section>);
        return rendered;
    },
    render() {
        if (!this.state.survey.hasOwnProperty('codeName')) {
            return <span style={{ "display": "none" }} />
        }

        var _this = this;
        var it = _this.state.survey;
        var description = it.description || "";
        var length = description.length > window.descriptionWordLimit ? window.descriptionWordLimit : description.length;
        var more = _this.props.toggle === 'more_' + it.key;
        var percAccepted = ((parseInt(it.accepted) / it.allVotes) * 100);
        percAccepted = (isNaN(percAccepted) ? 0 : percAccepted) + '%';
        var percRefused = ((parseInt(it.refused) / it.allVotes) * 100);
        percRefused = (isNaN(percRefused) ? 0 : percRefused) + '%';
        var rendered = [
        <section className="ProposalBio">
            <h5>{it.emergency && <span>&#x1F6A8;{'\u00a0'}</span>}{it.compareErrors === undefined && <LoaderMinimino />}{it.compareErrors && it.compareErrors.length > 0 && <span title={((it.compareErrors[0].indexOf('data not available') !== -1 ? '' : 'There are some problems in this proposal:\n') + (it.compareErrors.join(';\n').trim()))}>&#9763;&#65039;</span>} {!it.codeName ? !it.replaces ? "One Time" : "Kill" : it.replaces ? "Edit" : "Add New"}{(it.codeName || it.replaces) && [<span> | </span>, <span>{it.codeName || it.replaces}</span>]}</h5>
            <p>
                <span ref={ref => ref && (ref.innerHTML = description.substring(0, more ? description.length : length))} />
                {!more && length < description.length && ['... ', <a href="javascript:;" onClick={() => _this.emit('toggle', 'more_' + it.key)}>More</a>]}
                {more && length < description.length && [' ', <a href="javascript:;" onClick={() => _this.emit('toggle', null)}>Less</a>]}
            </p>
        </section>];
        rendered.push((it.checkedTimes > 0 ? this.renderTerminated : this.renderRunning)(percAccepted, percRefused));
        _this.props.toggle === 'code_' + it.key && rendered.push(
        <section className="AllViewCode">
            <section className="AllViewCodeEditor">
                <Editor className="AllViewCode" firstCode={it.replacesCode || it.code} secondCode={(it.replacesCode && it.code) || undefined} />
            </section>
        </section>);
        return rendered;
    }
});