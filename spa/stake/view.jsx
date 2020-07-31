var Stake = React.createClass({
    requiredScripts: [
        'spa/loader.jsx',
        'spa/bigLoader.jsx'
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
        this.logo.src = "assets/img/" + split[1] + "-logo.png";
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
    render() {
        var _this = this;
        return (<section className="StakeBigBoss">
            <section className="boxAYOR">
            </section>
            {this.state && this.state.staked && <section className="boxAYORT">
                <section className="boxAYORTTEXT">
                    <h2>&#127881; &#129385; Staked! &#129385; &#127881;</h2>
                    <p>You have succesfully staked <b>{this.state.staked.amount}</b> buidl for <b>{this.state.staked.period}!</b> Check the <a href="javascript:;" onClick={() => this.emit('view/change', 'Status')}>Status</a> page to manage your Staking Position. </p>
                </section>
            </section>}
            <section className="switchBox">
                <h3>&#129412; + &#9203; + &#129385; = &#127873;</h3>
                <section className="switchTools">
                    <a data-target="firstAmount" href="javascript:;" className="switchAll" onClick={this.max}>Max</a>
                    <input ref={ref => this.firstAmount = ref} type="text" placeholder="0.0" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" data-target="firstAmount" onChange={this.onChangeAmount} />
                    <aside className="switchLink" target="_blank">buidl</aside>
                    <img src="assets/img/buidl-logo.png" />
                </section>
                <section className="switchTools switchTools2">
                    {false && <a data-target="secondAmount" href="javascript:;" className="switchAll" onClick={this.max}>Max</a>}
                    <input className="ETHUSDBLOW" ref={ref => this.secondAmount = ref} type="text" placeholder="0.0" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" data-target="secondAmount" onChange={this.onChangeAmount} disabled />
                    <select ref={ref => this.pool = ref} className="switchLink" target="_blank" onChange={this.changeSecond}>
                        <option value="0_eth" selected>eth</option>
                        <option value="1_usdc">usdc</option>
                    </select>
                    <img ref={ref => this.logo = ref} src="assets/img/eth-logo.png" />
                </section>
                <h3>&#9203; Duration</h3>
                <section className="switchTools">
                    <a data-tier="0" className="TimetoStake" href="javascript:;" onClick={this.onTier}>3 Month</a>
                    <a data-tier="1" className="TimetoStake SelectedDutrationStake" href="javascript:;" onClick={this.onTier}>6 Months</a>
                    <a data-tier="2" className="TimetoStake" href="javascript:;" onClick={this.onTier}>9 Months</a>
                    <a data-tier="3" className="TimetoStake" href="javascript:;" onClick={this.onTier}>1 Year</a>
                </section>
                <h3>&#127873; Total Reward</h3>
                <section className="switchTools">
                    <span ref={ref => this.reward = ref} className="switchFinal">0</span>
                    <aside className="switchLink" >buidl</aside>
                    <img src="/assets/img/buidl-logo.png"></img>
                </section>
                <h3 className="switchWeek">Weekly</h3>
                <section className="switchTools switchToolsWeek">
                    <span ref={ref => this.splittedReward = ref} className="switchFinal">0</span>
                    <aside className="switchLink" >buidl</aside>
                    <img src="/assets/img/buidl-logo.png"></img>
                </section>
                <section className="switchActions">
                    {window.walletAddress && (this.state.approveFirst || !this.state.approveSecond) && <a data-target="buidl" href="javascript:;" className={"switchAction" + (this.state.approveFirst ? " active" : "")} onClick={this.approve}>Approve buidl</a>}
                    {window.walletAddress && !this.state.approveFirst && this.state.approveSecond && <a data-target="usdc" href="javascript:;" className="switchAction active" onClick={this.approve}>Approve usdc</a>}
                    {window.walletAddress && <a href="javascript:;" className={"switchAction" + (!this.state.approveFirst && !this.state.approveSecond ? " active" : "")} onClick={this.stake}>Stake</a>}
                    {!window.walletAddress && <a href="javascript:;" onClick={() => window.ethereum.enable().then(() => window.getAddress()).then(() => _this.emit('ethereum/ping'))} className="switchAction active">Connect</a>}
                </section>
                <p>By Staking buidl you'll earn from the Uniswap V2 Trading fees + the Staking Reward. Staking buidl you're adding liquidity to Uniswap V2 and you'll recevie Pool Tokens.</p>
                <p>Disclamer: Staking buidl is an irreversible action, you'll be able to redeem your locked Uniswap V2 tokens only after the selected locking period. Do it at your own risk</p>
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
                            <h6><b>{it.poolPosition === '0' ? "ETH" : "USDC"}-buidl</b></h6>
                        </section>
                        <section className="statusPosition">
                            <h5>{window.fromDecimals(it.reward, 18)} <img src="/assets/img/buidl-logo.png"></img></h5>
                            <h6>Locked Reward</h6>
                            <h5><b>{window.fromDecimals(it.cumulativeReward, 18)}</b> <img src="/assets/img/buidl-logo.png"></img></h5>
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
                        <StakingInfo tier="0" title="3 Months" />
                        <StakingInfo tier="1" title="6 Months" />
                        <StakingInfo tier="2" title="9 Months" />
                        <StakingInfo tier="3" title="1 Year" />
                    </section>
                </section>
            </section>
        </section>);
    }
});