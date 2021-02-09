var StakeOld = React.createClass({
    requiredScripts: [
        'spa/loader.jsx',
        'spa/bigLoader.jsx',
        'spa/ghostLoader.jsx',
        'spa/loaderMini.jsx'
    ],
    requiredModules: [
        'spa/stakingInfo'
    ],
    getDefaultSubscriptions() {
        return {
            'ethereum/ping': this.controller.load
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
        this.logo.src = window.formatLink(this.props.stakingData.pairs[split[0]].logo);
        this.controller.changeSecond("firstAmount", parseInt(this.pool.value.split('_')[0]), this.domRoot.children().find('.TimetoStake.SelectedDutrationStake')[0].dataset.tier);
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
        if(!$(e.currentTarget).hasClass('active') || this.state.loadingStake || this.state.loadingApprove) {
            return;
        }
        this.controller.approve(e.currentTarget.dataset.target);
    },
    stake(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if(!$(e.currentTarget).hasClass('active') || this.state.loadingStake || this.state.loadingApprove) {
            return;
        }
        this.controller.stake(parseInt(this.pool.value.split('_')[0]), this.domRoot.children().find('.TimetoStake.SelectedDutrationStake')[0].dataset.tier);
    },
    componentDidMount() {
        window.history.pushState({}, '', window.getLink() + '?staking=' + this.props.stakingData.stakingManager.options.address);
        this.controller.load();
    },
    firstTier(section) {
        $(section).children('.SelectedDutrationStake').length === 0 && $($(section).children()[0]).addClass('SelectedDutrationStake');
    },
    getTierKey(position) {
        var tier = this.props.stakingData.tiers[position];
        return tier.tierKey === 'Custom' ? `${tier.blockNumber} blocks` : tier.tierKey;
    },
    close(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        window.history.pushState({}, '', window.getLink());
        this.emit('stake/close');
    },
    render() {
        var _this = this;
        return (<section className="StakeBigBoss STAKEALL" style={{"position" : 'fixed'}}>
            <a className="NoStakeBro" href="javascript:;" onClick={this.close}>Close</a>
            {this.state && this.state.staked && <section className="boxAYORT">
                <section className="boxAYORTTEXT">
                    <h2>&#127881; &#129385; Staked! &#129385; &#127881;</h2>
                    <p>You have succesfully staked <b>{this.state.staked.amount}</b> {this.props.stakingData.mainToken.symbol} for <b>{this.state.staked.period}!</b> Check the <a href="javascript:;" onClick={() => this.emit('view/change', 'Status')}>Status</a> page to manage your Staking Position. </p>
                </section>
            </section>}
            {this.props.stakingData.active && <section className="switchBox">
                <h3>Stake</h3>
                <section className="switchTools">
                    <a data-target="firstAmount" href="javascript:;" className="switchAll" onClick={this.max}>Max</a>
                    <input ref={ref => this.firstAmount = ref} type="text" placeholder="0.00" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" data-target="firstAmount" onChange={this.onChangeAmount}/>
                    <aside className="switchLink" target="_blank">{this.props.stakingData.mainToken.symbol}</aside>
                    <img src={window.formatLink(this.props.stakingData.mainToken.logo || this.props.stakingData.mainToken.logoURI)}/>
                    {this.state && this.state.firstBalance && [<br/>,<br/>,
                    <section className="BalanceLabel">
                        <span>Balance:</span>
                        <span>{window.fromDecimals(this.state.firstBalance, this.props.stakingData.mainToken.decimals)}</span>
                        <span>{this.props.stakingData.mainToken.symbol}</span>
                    </section>]}
                </section>
                <section className="switchTools switchTools2">
                    {!this.state.secondHasPair && <a data-target="secondAmount" href="javascript:;" className="switchAll" onClick={this.max}>Max</a>}
                    <input className="ETHUSDBLOW" ref={ref => this.secondAmount = ref} type="text" placeholder="0.00" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" data-target="secondAmount" disabled={this.state.secondHasPair}/>
                    <select ref={ref => this.pool = ref} className="switchLink" target="_blank" onChange={this.changeSecond}>
                        {this.props.stakingData.pairs.map((it, i) => <option key={it.address} data-index={i} value={i + "_" + it.symbol}>{it.symbol}</option>)}
                    </select>
                    <img ref={ref => this.logo = ref} src={window.formatLink(this.props.stakingData.pairs[0].logo)}/>
                    {this.state && this.state.secondBalance && this.pool && [<br/>,<br/>,
                    <section className="BalanceLabel">
                        <span>Balance:</span>
                        <span>{window.fromDecimals(this.state.secondBalance, this.props.stakingData.pairs[this.pool.value.split('_')[0]].decimals)}</span>
                        <span>{this.props.stakingData.pairs[this.pool.value.split('_')[0]].symbol}</span>
                    </section>]}
                </section>
                {!this.state.secondHasPair && <h3>You are the first putting liquidity in this pair!</h3>}
                <h3>&#9203; Duration</h3>
                <section className="switchTools" ref={this.firstTier}>
                    {this.props.stakingData.tiers.map((it, i) => <a key={it.tierKey} data-tier={i} className="TimetoStake" href="javascript:;" onClick={this.onTier}>{it.tierKey !== 'Custom' ? it.tierKey : `For ${it.blockNumber} blocks`}</a>)}
                </section>
                <h3>&#127873; Total Reward</h3>
                <section className="switchTools">
                    <span ref={ref => this.reward = ref} className="switchFinal">{window.formatMoney(0)}</span>
                    <aside className="switchLink">{this.props.stakingData.rewardToken.symbol}</aside>
                    <img src={window.formatLink(this.props.stakingData.rewardToken.logo || this.props.stakingData.rewardToken.logoURI)}/>
                </section>
                <h3 className="switchWeek">Weekly</h3>
                <section className="switchTools switchToolsWeek">
                    <span ref={ref => this.splittedReward = ref} className="switchFinal">{window.formatMoney(0)}</span>
                    <aside className="switchLink">{this.props.stakingData.rewardToken.symbol}</aside>
                    <img src={window.formatLink(this.props.stakingData.rewardToken.logo || this.props.stakingData.rewardToken.logoURI)}/>
                </section>
                <section className="switchActions">
                    {window.walletAddress && (this.state.approveFirst || !this.state.approveSecond) && <a data-target="mine" href="javascript:;" className={"switchAction" + (this.state.approveFirst ? " active" : "")} onClick={this.approve}>{this.state.loadingApprove && <GhostLoader/>}{!this.state.loadingApprove && ("Approve " + this.props.stakingData.mainToken.symbol)}</a>}
                    {window.walletAddress && !this.state.approveFirst && this.state.approveSecond && <a data-target="other" href="javascript:;" className="switchAction active" onClick={this.approve}>{this.state.loadingApprove && <GhostLoader/>}{!this.state.loadingApprove && ("Approve " + this.state.approveSecond)}</a>}
                    {window.walletAddress && <a href="javascript:;" className={"switchAction" + (!this.state.approveFirst && !this.state.approveSecond ? " active" : "")} onClick={this.stake}>{this.state.loadingStake && <GhostLoader/>}{!this.state.loadingStake && "Stake"}</a>}
                    {!window.walletAddress && <a href="javascript:;" onClick={() => window.ethereum.enable().then(() => window.getAddress()).then(() => _this.emit('ethereum/ping'))} className="switchAction active">Connect</a>}
                </section>
                <p>By Staking {this.props.stakingData.mainToken.symbol} you'll earn from the Uniswap V2 Trading fees + the Staking Reward. Staking {this.props.stakingData.mainToken.symbol} you're adding liquidity to Uniswap V2 and you'll recevie Pool Tokens.</p>
                <p>Disclamer: Staking {this.props.stakingData.mainToken.symbol} is an irreversible action, you'll be able to redeem your locked Uniswap V2 tokens only after the selected locking period. Do it at your own risk</p>
            </section>}
            <section>
                <section className="statusBox">
                    <h2>Your Positions</h2>
                    {!window.walletAddress && <a href="javascript:;" onClick={() => window.ethereum.enable().then(() => window.getAddress()).then(() => _this.emit('ethereum/ping')).then(_this.controller.load)} className="switchAction active">Connect your Wallet</a>}
                    {window.walletAddress && (!this.state || this.state.loadingPosition) && <LoaderMini />}
                    {window.walletAddress && (!this.state || !this.state.loadingPosition) && this.state && this.state.stakingPositions && this.state.stakingPositions.map((it, i) => <section className="statusYou">
                        <section className="statusPosition">
                            <h3>{it.poolAmountFromDecimals}</h3>
                            <h6 className="statusUni">&#129412; <a href="javascript:;">Uniswap-V2</a></h6>
                            <h6><b>{this.props.stakingData.pairs[it.poolPosition].symbol}-{this.props.stakingData.mainToken.symbol}</b></h6>
                            <br/>
                            <h6>Locked Balance:</h6>
                            <h6><b>{window.fromDecimals(it.myBalance, this.props.stakingData.mainToken.decimals)} {this.props.stakingData.mainToken.symbol}</b></h6>
                            <h6><b>{window.fromDecimals(it.otherBalance, this.props.stakingData.pairs[it.poolPosition].decimals)} {this.props.stakingData.pairs[it.poolPosition].symbol}</b></h6>
                            {this.props.stakingData.endBlock && <section>
                                {this.state && this.state.tryUnlock === i && !this.state.rewardApproved && <a data-target="reward" href="javascript:;" className={"switchAction switchActionMMINI" + (!this.state.rewardApproved ? " active" : "")} onClick={this.approve}>{this.state.loadingApprove && <GhostLoader/>}{!this.state.loadingApprove && ("Approve " + this.props.stakingData.rewardToken.symbol)}</a>}
                                {this.state && this.state.tryUnlock === i && this.state.rewardApproved && <a className={"ActiveRedeem UnlockButton UnlockButtonPP" + (!this.state.rewardApproved ? " UnlockButtonDisabled" : "")} href="javascript:;" onClick={e => this.controller.unlock(e, it.tier, it.position)}>{this.state.unlocking && <img width="25" src="assets/img/ghostload.gif"/>}{!this.state.unlocking && <span>&#x1F513;</span>}</a>}
                                {(!this.state || this.state.tryUnlock !== i) && <a className="ActiveRedeem UnlockButton UnlockButtonPP" href="javascript:;" onClick={e => this.setState({tryUnlock : i}, () => _this.state.rewardApproved && _this.controller.unlock(e, it.tier, it.position))}>&#x1F513;</a>}
                            </section>}
                        </section>
                        <section className="statusPosition">
                            <h5>{window.fromDecimals(it.reward, this.props.stakingData.rewardToken.decimals)} <img src={window.formatLink(this.props.stakingData.rewardToken.logo)}></img></h5>
                            <h6>Locked Reward</h6>
                            <h5><b>{window.fromDecimals(it.cumulativeReward, this.props.stakingData.rewardToken.decimals)}</b> <img src={window.formatLink(this.props.stakingData.rewardToken.logo)}></img></h5>
                            <h6>&#127873; Redeemable</h6>
                            <a className={it.cumulativeReward !== '0' && !it.canWithdraw ? "ActiveRedeem" : "NoRedeem"} href="javascript:;" onClick={e => this.controller.redeem(e, it.tier, it.position)}>Redeem</a>
                        </section>
                        <section className="statusPosition">
                            <h4>for <b>{_this.getTierKey(it.tier)}</b></h4>
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
                        {this.props.stakingData.tiers.map((it, i) => <StakingInfo tier={i} title={it.tierKey} stake={_this.props.stakingData.stakingManager} element={_this.props.element} mainToken={_this.props.stakingData.mainToken} rewardToken={_this.props.stakingData.rewardToken}/>)}
                    </section>
                </section>
                <section className="ExpTop">
                    <h1>Instructions:</h1>
                    <section className="ExpPar">
                        <p>This Liquidity Mining Mechanism is designed to reward <a className="FancyUni" href="https://uniswap.info/token/0x7b123f53421b1bf8533339bfbdc7c98aa94163db">Uniswap V2</a> liquidity Providers to lock long-term liquidity in Uniswap V2 <a className="FancyUni" href="https://uniswap.info/pair/0xb0fb35cc576034b01bed6f4d0333b1bd3859615c"></a>.</p>
                    </section>
                    <h1>&#127873; Reward System</h1>
                    <h2>The reward system is independent from the {this.props.stakingData.rewardToken.symbol} price!</h2>
                    <section className="ExpPar">
                        <p>Rewards are calculated based on how much {this.props.stakingData.rewardToken.symbol} a holder provides to a liquidity pool, without any change in or dependency from other assets.</p>
                    </section>
                    <section className="ExpPar">
                        <p>The reward amount is fixed, and depends on the locking period selected. The total reward of the staking position is divided and redeemable once a week!</p>
                    </section>
                    <section className="ExpPar">
                        <h1>&#129385; Staking Rules</h1>  
                        <p>The {this.props.stakingData.mainToken.symbol} staking reward is fixed and dependent on the lock tier selected. To ensure a fixed reward system for stakers, we have included a max {this.props.stakingData.mainToken.symbol} cap of simultaneous staking positions that can be opened.</p>
                    </section>
                    <section className="ExpPar">  
                        <p>There are no individual staking limitations, and there is a minimum amount of {this.props.stakingData.mainToken.symbol} to open a staking position (view the status Section).</p>
                    </section>
                    <section className="ExpPar">  
                        <h1>&#9193; How to Stake</h1>  
                        <p>Before you stake {this.props.stakingData.mainToken.symbol}, consider that during the staking process you're actually adding liquidity to Uniswap V2, and so you'll receive back Uniswap V2 Pool tokens at the end of the staking period. What happens in the background is that you're adding liquidity to Uniswap V2 just as you would via the Uniswap GUI, but you're also locking the Uniswap V2 Tokens to receive {this.props.stakingData.rewardToken.symbol} rewards. We kindly recommend that you read all of the Uniswap Liquidity Providers Documentation before staking, so that you can make an informed decision:</p>
                        <p><a href="https://docs.ethhub.io/guides/graphical-guide-for-understanding-uniswap/" target="_Blank">Ethhub Uniswap Guide</a> | <a href="https://uniswap.org/docs/v2/advanced-topics/understanding-returns/" target="_Blank">Uniswap Returns Guide</a> | <a href="https://medium.com/@pintail/understanding-uniswap-returns-cc593f3499ef" target="_Blank">Advanced Uniswap Guide</a> Keep in mind that staking buidl is an irreversible action. Do it at your own risk!</p>
                    </section>
                    <section className="ExpPar">    
                        <p>To Stake Liquidity, all you have to do is to scroll up to the "Stake" Section and follow these steps:</p>
                    </section>
                    <section className="ExpPar">    
                        <p>#1 Connect you wallet, by clicking the "Connect" button</p>
                        <p>#2 Choose the quantity of {this.props.stakingData.mainToken.symbol} you want to stake</p>
                        <p>#3 Select between the tier pool, and be sure you have the ammount required</p>
                        <p>#4 Select the lock duration</p>
                        <p>#5 If you haven’t already, click the "Approve" button</p>
                        <p>#6 Wait for the “Approval” transaction to confirm</p>
                        <p>#7 Start your staking transaction by clicking "Stake"</p>
                        <p>#8 Wait for the Staking Transaction to confirm...</p>
                        <p>... <b>Done!</b> You have successfully Staked {this.props.stakingData.mainToken.symbol}. Now, you can manage your position in the "Status" page.</p>
                    </section>
                    <section className="ExpPar">  
                        <h1>&#128176; How to reedem Staking and Rewards</h1>  
                        <p>Once you have successfully created a Staking Position, you can manage it on the "Your Positions" section:</p>
                    </section>
                    <section className="ExpPar">
                        <h2>Weekly Reward Withdraw</h2>  
                        <p>To Withdraw your weekly Reward from your position, just click the Withdraw Reward button. This button is designed to let you Withdraw all of your available unlocked rewards.</p>
                    </section>
                    <section className="ExpPar">
                        <h2>Position Withdraw</h2>  
                        <p>At the end of the Staking Period, you can use the "Withdraw Position" button to Withdraw all of your staked Uniswap V2 Pool Tokens, as well as your remaining rewards (if any).</p>
                        <p>To Withdraw your liquidity using your Uniswap V2 Liquidity Pool Tokens, you just have to go to the <a href="https://app.uniswap.org/#/pool" target="_Blank">Uniswap GUI</a>, select your Liquidity Pool and choose the amount to Withdraw.</p>
                    </section>
                </section>
            </section>
        </section>);
    }
});