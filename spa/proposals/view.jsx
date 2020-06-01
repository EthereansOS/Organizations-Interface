var Proposals = React.createClass({
    requiredModules: [
        'spa/editor'
    ],
    requiredScripts: [
        'spa/loaderMini.jsx',
        'spa/loaderMinimino.jsx'
    ],
    switchRef(ref) {
        this.switch = ref;
        var _this = this;
        _this.switch && (_this.switch.onchange = function (e) {
            e && e.preventDefault(true) && e.stopPropagation(true);
            _this.switchFrom.innerHTML = '&#99' + (_this.switch.value === 'Refuse' ? '89' : '40') + ';';
        });
    },
    componentDidMount() {
        this.controller.loadSurveys();
    },
    componentWillUnmount() {
        delete this.controller.loading;
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
    sortSurveys(surveys) {
        var list = [];
        var ordered = {};
        Object.keys(surveys).map(it => {
            var data = surveys[it];
            if (!ordered[data.endBlock]) {
                ordered[data.endBlock] = [];
            }
            ordered[data.endBlock].push(data);
        });
        Object.keys(ordered).sort().map(it => {
            var data = ordered[it];
            for (var i in data) {
                list.unshift(data[i]);
            }
        });
        return list;
    },
    newProposal(e) {
        e && ((e.preventDefault && e.preventDefault(true)), (e.stopPropagation && e.stopPropagation(true)));
        var props = {};
        props[e.currentTarget.innerHTML.split(' ').join('').firstLetterToLowerCase()] = true;
        this.emit('section/change', 'New Proposal', props);
    },
    render() {
        var _this = this;
        return (
            <section className="ProposalsIndex">
                <section className="ProposalsActiveIndex">
                    <h4>Active Proposals</h4>
                    {_this.state && _this.state.surveys && Object.keys(_this.state.surveys).length === 0 && <span>No active proposals right now</span>}
                    <ul>
                        {_this.state && _this.state.surveys && _this.sortSurveys(_this.state.surveys).map(it => {
                            var description = it.description || "";
                            var length = description.length > window.descriptionWordLimit ? window.descriptionWordLimit : description.length;
                            var more = _this.state && _this.state.more === it.id;
                            var percAccepted = ((parseInt(it.accepted) / it.allVotes) * 100);
                            percAccepted = (isNaN(percAccepted) ? 0 : percAccepted) + '%';
                            var percRefused = ((parseInt(it.refused) / it.allVotes) * 100);
                            percRefused = (isNaN(percRefused) ? 0 : percRefused) + '%';
                            return (<li key={it.id}>
                                <section className="ProposalBio">
                                    <h5>{it.emergency && <span>&#x1F6A8;{'\u00a0'}</span>}{it.compareErrors === undefined && <LoaderMinimino />}{it.compareErrors && it.compareErrors.length > 0 && <span title={('There are some problems in this proposal:\n' + (it.compareErrors.join(';\n').trim()))}>&#9763;&#65039;</span>} {!it.codeName ? !it.replaces ? "One Time" : "Kill" : it.replaces ? "Edit" : "Add New"}{(it.codeName || it.replaces) && [<span> | </span>, <span>{it.codeName || it.replaces}</span>]}</h5>
                                    <p>
                                        <span ref={ref => ref && (ref.innerHTML = description.substring(0, more ? description.length : length))} />
                                        {!more && length < description.length && ['... ', <a href="javascript:;" onClick={() => _this.setState({ more: it.id })}>More</a>]}
                                        {more && length < description.length && [' ', <a href="javascript:;" onClick={() => _this.setState({ more: null })}>Less</a>]}
                                    </p>
                                </section>
                                <section className="ProposalAction">
                                    <p>Leading: {it.leading && <span>&#9989;</span>}{!it.leading && <span>&#9940;</span>}</p>
                                    <p>End Block:<a target="_blank" href={window.getNetworkElement('etherscanURL') + 'block/' + it.endBlock}>{it.endBlock}</a></p>
                                    {!it.surveyEnd && <WalletEnablerButton className={"LinkVisualButton LinkVisualButtonB" + (_this.state && _this.state.opened === ('vote_' + it.id) ? ' Editing' : '')} onClick={() => _this.setState({ opened: _this.state && _this.state.opened === ('vote_' + it.id) ? null : ('vote_' + it.id) })}>Vote</WalletEnablerButton>}
                                    {it.surveyEnd && !it.terminated && <WalletEnablerButton className="LinkVisualButton LinkVisualButtonB ProposalPoolWithdraw" onClick={e => _this.controller.finalize(e, it)}>Finalize</WalletEnablerButton>}
                                    {(it.code || it.replacesCode) && <a className={"LinkVisualButton" + (_this.state && _this.state.opened === ('code_' + it.id) ? ' Editing' : '')} href="javascript:;" onClick={() => _this.setState({ opened: _this.state && _this.state.opened === ('code_' + it.id) ? null : ('code_' + it.id) })}>Code</a>}
                                    <a className="LinkVisualStandard" href={window.getNetworkElement('etherscanURL') + 'address/' + it.location} target="_blank">Contract</a>
                                </section>
                                {_this.state && _this.state.opened === ('vote_' + it.id) && <section className="ProposalVote">
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
                                        {false && <section className="ProposalVoteToken">
                                            <h6>Status by Wallets:</h6>
                                            <section className="ProposalPoolReview">
                                                <section className="ProposalPoolReviewEm">
                                                    <p>&#9989;</p>
                                                </section>
                                                <section className="ProposalPoolReviewPercentage">
                                                    <p className="ProposalPoolReviewPercentageY">30%</p>
                                                </section>
                                            </section>
                                            <p>900</p>
                                            <section className="ProposalPoolReview">
                                                <section className="ProposalPoolReviewEm">
                                                    <p>&#9940;</p>
                                                </section>
                                                <section className="ProposalPoolReviewPercentage">
                                                    <p className="ProposalPoolReviewPercentageN">70%</p>
                                                </section>
                                            </section>
                                            <p>500</p>
                                        </section>}
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
                                </section>}
                                {_this.state && _this.state.opened === ('code_' + it.id) && <section className="AllViewCode">
                                    <section className="AllViewCodeEditor">
                                        <Editor className="AllViewCode" firstCode={it.replacesCode || it.code} secondCode={(it.replacesCode && it.code) || undefined} />
                                    </section>
                                </section>}
                            </li>)
                        })}
                    </ul>
                    {(!_this.state || !_this.state.surveys || !_this.controller || _this.controller.loading) && <LoaderMini message="Loading Active Proposals" />}
                </section>
                <section className="ProposalsOldIndex">
                    <h4>Proposals History</h4>
                    {_this.state && _this.state.terminatedSurveys && Object.keys(_this.state.terminatedSurveys).length === 0 && <span>No Proposal History right now</span>}
                    <ul>
                        {_this.state && _this.state.terminatedSurveys && _this.sortSurveys(_this.state.terminatedSurveys).map(it => {
                            var description = it.description || "";
                            var length = description.length > window.descriptionWordLimit ? window.descriptionWordLimit : description.length;
                            var more = _this.state && _this.state.more === it.id;
                            var percAccepted = ((parseInt(it.accepted) / it.allVotes) * 100);
                            percAccepted = (isNaN(percAccepted) ? 0 : percAccepted) + '%';
                            var percRefused = ((parseInt(it.refused) / it.allVotes) * 100);
                            percRefused = (isNaN(percRefused) ? 0 : percRefused) + '%';
                            return (<li key={it.id}>
                                <section className="ProposalBio">
                                    <h5>{it.emergency && <span>&#x1F6A8;{'\u00a0'}</span>}{it.compareErrors === undefined && <LoaderMinimino />}{it.compareErrors && it.compareErrors.length > 0 && <span title={('There are some problems in this proposal:\n' + (it.compareErrors.join(';\n').trim()))}>&#9763;&#65039;</span>} {!it.codeName ? !it.replaces ? "One Time" : "Kill" : it.replaces ? "Edit" : "Add New"}{(it.codeName || it.replaces) && [<span> | </span>, <span>{it.codeName || it.replaces}</span>]}</h5>
                                    <p>
                                        <span ref={ref => ref && (ref.innerHTML = description.substring(0, more ? description.length : length))} />
                                        {!more && length < description.length && ['... ', <a href="javascript:;" onClick={() => _this.setState({ more: it.id })}>More</a>]}
                                        {more && length < description.length && [' ', <a href="javascript:;" onClick={() => _this.setState({ more: null })}>Less</a>]}
                                    </p>
                                </section>
                                <section className="ProposalPool">
                                    <h6>{it.result && <span>&#9989; Accepted</span>} {!it.result && <span>&#9940; Refused</span>}</h6>
                                    <p>Block: <a href={window.getNetworkElement('etherscanURL') + 'block/' + it.resultBlock} target="_blank">{it.resultBlock}</a></p>
                                    <p>Total Votes: {window.fromDecimals(it.allVotes, _this.props.element.decimals)} {_this.props.element.symbol}</p>
                                    <section>
                                        {!it.withdrawed && <WalletEnablerButton className="LinkVisualButton ProposalPoolWithdraw" onClick={e => _this.controller.withdraw(e, it)}>Withdraw</WalletEnablerButton>}
                                        <a className={"LinkVisualButton" + (_this.state && _this.state.opened === ('info_' + it.id) ? ' Editing' : '')} href="javascript:;" onClick={() => _this.setState({ opened: _this.state && _this.state.opened === ('info_' + it.id) ? null : ('info_' + it.id) })}>Info</a>
                                        {(it.code || it.replacesCode) && <a className={"LinkVisualButton" + (_this.state && _this.state.opened === ('code_' + it.id) ? ' Editing' : '')} href="javascript:;" onClick={() => _this.setState({ opened: _this.state && _this.state.opened === ('code_' + it.id) ? null : ('code_' + it.id) })}>Code</a>}
                                    </section>
                                    <a className="LinkVisualStandard" href={window.getNetworkElement('etherscanURL') + 'address/' + it.address} target="_blank">Proposal</a>
                                    <a className="LinkVisualStandard" href={window.getNetworkElement('etherscanURL') + 'address/' + it.location} target="_blank">Contract</a>
                                </section>
                                {_this.state && _this.state.opened === ('info_' + it.id) &&
                                    <section className="ProposalVote">
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
                                            {false && <section className="ProposalVoteToken">
                                                <h6>Results by Wallets:</h6>
                                                <section className="ProposalPoolReview">
                                                    <section className="ProposalPoolReviewEm">
                                                        <p>&#9989;</p>
                                                    </section>
                                                    <section className="ProposalPoolReviewPercentage">
                                                        <p className="ProposalPoolReviewPercentageY">30%</p>
                                                    </section>
                                                </section>
                                                <p>900</p>
                                                <section className="ProposalPoolReview">
                                                    <section className="ProposalPoolReviewEm">
                                                        <p>&#9940;</p>
                                                    </section>
                                                    <section className="ProposalPoolReviewPercentage">
                                                        <p className="ProposalPoolReviewPercentageN">70%</p>
                                                    </section>
                                                </section>
                                                <p>500</p>
                                            </section>}
                                        </section>
                                    </section>}
                                {_this.state && _this.state.opened === ('code_' + it.id) && <section className="AllViewCode">
                                    <section className="AllViewCodeEditor">
                                        <Editor className="AllViewCode" firstCode={it.replacesCode || it.code} secondCode={(it.replacesCode && it.code) || undefined} />
                                    </section>
                                </section>}
                            </li>)
                        })}
                    </ul>
                    {(!_this.state || !_this.state.terminatedSurveys || !_this.controller || _this.controller.loading) && <LoaderMini message="Loading Proposals History" />}
                </section>
            </section>
        );
    }
});