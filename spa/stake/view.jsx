var Stake = React.createClass({
    requiredScripts: [
        'spa/loader.jsx',
        'spa/bigLoader.jsx'
    ],
    requiredModules: [
        'spa/stakingInfo'
    ],
    getDefaultSubscriptions() {
        return {
            'ethereum/ping': this.componentDidMount
        };
    },
    getInitialState() {
        return {
            approveFirst: true,
            approveSecond: true
        }
    },
    onTier(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        $($(e.currentTarget).parent()).children('a').each(function () {
            $(this).removeClass('SelectedDutrationStake');
        });
        $(e.currentTarget).addClass("SelectedDutrationStake");
        this.controller.calculateReward(parseInt(e.currentTarget.dataset.tier));
    },
    changeSecond(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var split = e.currentTarget.value.split("_");
        this.logo.src = this.props.stakingData.pairs[split[0]].logo
        this.controller.calculateOther("firstAmount", parseInt(this.pool.value.split('_')[0]), this.domRoot.children().find('.TimetoStake.SelectedDutrationStake')[0].dataset.tier);
        this.controller.calculateApprove(parseInt(this.pool.value.split('_')[0]));
    },
    max(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.controller.max(e.currentTarget.dataset.target, parseInt(this.pool.value.split('_')[0]), this.domRoot.children().find('.TimetoStake.SelectedDutrationStake')[0].dataset.tier);
    },
    onChangeAmount(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        var currentTarget = e.currentTarget;
        _this.changeTimeout && clearTimeout(_this.changeTimeout);
        _this.changeTimeout = setTimeout(function () {
            _this.controller.calculateOther(currentTarget.dataset.target, parseInt(_this.pool.value.split('_')[0]), _this.domRoot.children().find('.TimetoStake.SelectedDutrationStake')[0].dataset.tier);
        }, window.context.inputChangeTimeout || 300);
    },
    approve(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if (!$(e.currentTarget).hasClass('active')) {
            return;
        }
        this.controller.approve(e.currentTarget.dataset.target);
    },
    stake(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if (!$(e.currentTarget).hasClass('active')) {
            return;
        }
        this.controller.stake(parseInt(this.pool.value.split('_')[0]), this.domRoot.children().find('.TimetoStake.SelectedDutrationStake')[0].dataset.tier);
    },
    componentDidMount() {
        window.walletAddress && this.controller.calculateApprove(parseInt(this.pool.value.split('_')[0]));
    },
    firstTier(section) {
        $(section).children('.SelectedDutrationStake').length === 0 && $($(section).children()[0]).addClass('SelectedDutrationStake');
    },
    render() {
        var _this = this;
        return (<section className="StakeBigBoss" style={{"position" : 'fixed'}}>
            <section className="boxAYOR">
            </section>
            {this.state && this.state.staked && <section className="boxAYORT">
                <section className="boxAYORTTEXT">
                    <h2>&#127881; &#129385; Staked! &#129385; &#127881;</h2>
                    <p>You have succesfully staked <b>{this.state.staked.amount}</b> {this.props.element.symbol} for <b>{this.state.staked.period}!</b> Check the <a href="javascript:;" onClick={() => this.emit('view/change', 'Status')}>Status</a> page to manage your Staking Position. </p>
                </section>
            </section>}
            <section className="switchBox">
                <h3>&#129412; + &#9203; + &#129385; = &#127873;</h3>
                <section className="switchTools">
                    <a data-target="firstAmount" href="javascript:;" className="switchAll" onClick={this.max}>Max</a>
                    <input ref={ref => this.firstAmount = ref} type="text" placeholder="0.00" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" data-target="firstAmount" onChange={this.onChangeAmount}/>
                    <aside className="switchLink" target="_blank">{this.props.element.symbol}</aside>
                    <img src={this.props.element.logo}/>
                </section>
                <section className="switchTools switchTools2">
                    {false && <a data-target="secondAmount" href="javascript:;" className="switchAll" onClick={this.max}>Max</a>}
                    <input className="ETHUSDBLOW" ref={ref => this.secondAmount = ref} type="text" placeholder="0.00" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" data-target="secondAmount" onChange={this.onChangeAmount} disabled/>
                    <select ref={ref => this.pool = ref} className="switchLink" target="_blank" onChange={this.changeSecond}>
                        {this.props.stakingData.pairs.map((it, i) => <option key={it.address} data-index={i} value={i + "_" + it.symbol}>{it.symbol}</option>)}
                    </select>
                    <img ref={ref => this.logo = ref} src={this.props.stakingData.pairs[0].logo}/>
                </section>
                <h3>&#9203; Duration</h3>
                <section className="switchTools" ref={this.firstTier}>
                    {this.props.stakingData.tiers.map((it, i) => <a key={it.tierKey} data-tier={i} className="TimetoStake" href="javascript:;" onClick={this.onTier}>{it.tierKey !== 'Custom' ? it.tierKey : `For ${it.blockNumber} blocks`}</a>)}
                </section>
                <h3>&#127873; Total Reward</h3>
                <section className="switchTools">
                    <span ref={ref => this.reward = ref} className="switchFinal">{window.formatMoney(0)}</span>
                    <aside className="switchLink">{this.props.element.symbol}</aside>
                    <img src={this.props.element.logo}/>
                </section>
                <h3 className="switchWeek">Weekly</h3>
                <section className="switchTools switchToolsWeek">
                    <span ref={ref => this.splittedReward = ref} className="switchFinal">{window.formatMoney(0)}</span>
                    <aside className="switchLink">{this.props.element.symbol}</aside>
                    <img src={this.props.element.logo}/>
                </section>
                <section className="switchActions">
                    {window.walletAddress && (this.state.approveFirst || !this.state.approveSecond) && <a data-target="mine" href="javascript:;" className={"switchAction" + (this.state.approveFirst ? " active" : "")} onClick={this.approve}>Approve {this.props.element.symbol}</a>}
                    {window.walletAddress && !this.state.approveFirst && this.state.approveSecond && <a data-target="other" href="javascript:;" className="switchAction active" onClick={this.approve}>Approve {this.state.approveSecond}</a>}
                    {window.walletAddress && <a href="javascript:;" className={"switchAction" + (!this.state.approveFirst && !this.state.approveSecond ? " active" : "")} onClick={this.stake}>Stake</a>}
                    {!window.walletAddress && <a href="javascript:;" onClick={() => window.ethereum.enable().then(() => window.getAddress()).then(() => _this.emit('ethereum/ping'))} className="switchAction active">Connect</a>}
                </section>
                <p>By Staking {this.props.element.symbol} you'll earn from the Uniswap V2 Trading fees + the Staking Reward. Staking {this.props.element.symbol} you're adding liquidity to Uniswap V2 and you'll recevie Pool Tokens.</p>
                <p>Disclamer: Staking {this.props.element.symbol} is an irreversible action, you'll be able to redeem your locked Uniswap V2 tokens only after the selected locking period. Do it at your own risk</p>
            </section>
            <section>
                <section className="statusBox">
                    <h2>Your Positions</h2>
                    {!window.walletAddress && <a href="javascript:;" onClick={() => window.ethereum.enable().then(() => window.getAddress()).then(() => _this.emit('ethereum/ping')).then(_this.controller.load)} className="switchAction active">Connect your Wallet</a>}
                    {window.walletAddress && (!this.state || this.state.loadingPosition) && <Loader />}
                    {window.walletAddress && (!this.state || !this.state.loadingPosition) && this.state && this.state.stakingPositions && this.state.stakingPositions.map(it => <section className="statusYou">
                        <section className="statusPosition">
                            <h3>{it.poolAmountFromDecimals}</h3>
                            <h6 className="statusUni">&#129412; <a href="">Uniswap-V2</a></h6>
                            <h6><b>{this.props.stakingData.pairs[it.poolPosition].symbol}-{this.props.element.symbol}</b></h6>
                        </section>
                        <section className="statusPosition">
                            <h5>{window.fromDecimals(it.reward, window.props.element.decimals)} <img src={this.props.element.logo}></img></h5>
                            <h6>Locked Reward</h6>
                            <h5><b>{window.fromDecimals(it.cumulativeReward, window.props.element.decimals)}</b> <img src={this.props.element.logo}></img></h5>
                            <h6>&#127873; Redeemable</h6>
                            <a className={it.cumulativeReward !== '0' && !it.canWithdraw ? "ActiveRedeem" : "NoRedeem"} href="javascript:;" onClick={e => this.controller.redeem(e, it.tier, it.position)}>Redeem</a>
                        </section>
                        <section className="statusPosition">
                            <h4>for <b>{it.tier === 0 ? "3 Months" : it.tier === 1 ? "6 Months" : it.tier === 2 ? "9 Months" : "1 Year"}</b></h4>
                            <h5>&#9203; <a target="_Bloank" href={window.getNetworkElement("etherscanURL") + "block/countdown/" + it.endBlock}>{it.endBlock}</a></h5>
                            <h6>Position End Block</h6>
                            <a className={it.canWithdraw ? "ActiveRedeem" : "NoRedeem"} href="javascript:;" onClick={e => this.controller.withdraw(e, it.tier, it.position)}>Withdraw Position</a>
                        </section>
                    </section>)}
                    {(!this.state || !this.state.loadingPosition) && this.state && this.state.stakingPositions && this.state.stakingPositions.length === 0 && <h3>There are no opened staking positions for you right now</h3>}
                </section>
                <section className="statusBox">
                    <h2>&#129385; Status:</h2>
                    <section className="statusAll">
                        {this.props.stakingData.tiers.map((it, i) => <StakingInfo tier={i} title={it.tierKey} stake={_this.props.stakingData.stakingManager} element={_this.props.element}/>)}
                    </section>
                </section>
            </section>
        </section>);
    }
});