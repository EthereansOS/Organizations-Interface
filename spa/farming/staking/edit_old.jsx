var StakingEditOld = React.createClass({
    requiredScripts: [
        'spa/loaderMinimino.jsx',
        'spa/uniswapTokenPicker.jsx'
    ],
    getInitialState() {
        var state = {
            tiers: [],
            pairs: [],
            blockNumber: (this.props.blockTiers && Object.values(this.props.blockTiers)[0].averages[1]) || null
        };
        /*this.props && this.props.stakingData && this.props.stakingData.tiers && this.props.stakingData.tiers.forEach(it => state.tiers.push(it));
        this.props && this.props.stakingData && this.props.stakingData.pairs && this.props.stakingData.pairs.forEach(it => state.pairs.push(it));*/
        return state;
    },
    deleteTier(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var i = parseInt(e.currentTarget.dataset.index);
        var deleted = this.state.tiers[i];
        this.state.tiers.splice(i, 1);
        var _this = this;
        this.setState({ tiers: this.state.tiers, tier: deleted.tierKey, blockNumber: deleted.tierKey === 'Custom' ? deleted.blockNumber : null }, function () {
            _this.customBlockNumber && (_this.customBlockNumber.value = deleted.blockNumber);
            _this.rewardSplitTranchesInput && (_this.rewardSplitTranchesInput.value = deleted.rewardSplitTranche);
            !_this.customBlockNumber && (_this.domRoot.children().find('input[type="radio"][data-value="' + deleted.blockNumber + '"]')[0].checked = true);
            _this.hardCapInput.value = window.fromDecimals(deleted.hardCap, _this.props.element.decimals);
            _this.minCapInput.value = window.fromDecimals(deleted.minCap, _this.props.element.decimals);
            _this.rewardPercentageInput.value = window.formatMoney(deleted.percentage);
        });
    },
    addTier(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.emit('message');
        var hardCap = '0';
        try {
            hardCap = window.toDecimals(this.hardCapInput.value.split(',').join(''), this.props.element.decimals);
        } catch (e) {
        }
        if (isNaN(parseInt(hardCap)) || parseInt(hardCap) <= 0) {
            return this.emit('message', 'Hard Cap must be a valid positive number', 'error');
        }
        var minCap = '0';
        try {
            minCap = window.toDecimals(this.minCapInput.value.split(',').join(''), this.props.element.decimals);
        } catch (e) {
        }
        if (isNaN(parseInt(minCap)) || parseInt(minCap) <= 0) {
            return this.emit('message', 'Min Cap must be a valid positive number', 'error');
        }
        var blockNumber = '0';
        try {
            blockNumber = (this.customBlockNumber ? this.customBlockNumber.value : this.domRoot.children().find('input[type="radio"]:checked')[0].dataset.value).split(',').join('');
        } catch (e) {
        }
        if (isNaN(parseInt(blockNumber)) || parseInt(blockNumber) <= 0) {
            return this.emit('message', 'Block Limit must be a valid positive number', 'error');
        }
        var rewardSplitTranche = 0;
        try {
            rewardSplitTranche = this.rewardSplitTranchesInput ? this.rewardSplitTranchesInput.value : this.props.blockTiers[this.state.tier].weeks;
        } catch (e) {
        }
        if (this.rewardSplitTranchesInput && (isNaN(parseInt(rewardSplitTranche)) || parseInt(rewardSplitTranche) <= 0)) {
            return this.emit('message', 'Split amount must be a valid positive number', 'error');
        }
        var percentage = 0;
        try {
            percentage = parseFloat(this.rewardPercentageInput.value.split(',').join(''));
        } catch (e) {
        }
        if (isNaN(percentage) || percentage <= 0) {
            return this.emit('message', 'Percentage must be a positive number', 'error');
        }
        var rewardTokenAddress;
        try {
            rewardTokenAddress = this.rewardTokenPicker && this.rewardTokenPicker.state && !isNaN(this.rewardTokenPicker.state.selected) && this.state.tokensList[this.rewardTokenPicker.state.key][this.rewardTokenPicker.state.selected].address;
        } catch (e) {
        }
        if (!rewardTokenAddress) {
            return this.emit('message', 'Reward Token is mandatory', 'error');
        }
        var mainTokenAddress;
        try {
            mainTokenAddress = this.mainTokenPicker && this.mainTokenPicker.state && !isNaN(this.mainTokenPicker.state.selected) && this.state.tokensList[this.mainTokenPicker.state.key][this.mainTokenPicker.state.selected].address;
        } catch (e) {
        }
        if (!mainTokenAddress) {
            return this.emit('message', 'Main Token is mandatory', 'error');
        }
        if(!this.state || !this.state.pairs || this.state.pairs.length === 0) {
            return this.emit('message', 'You must choose at least a pair', 'error');
        }
        var tiers = (this.state && this.state.tiers) || [];
        tiers.push({
            hardCap,
            minCap,
            blockNumber,
            percentage,
            time: window.calculateTimeTier(blockNumber),
            tierKey: window.getTierKey(blockNumber),
            rewardSplitTranche
        });
        var _this = this;
        this.setState({ tiers, blockNumber: null, tier: null }, function () {
            _this.customBlockNumber && (_this.customBlockNumber.value = '');
            _this.rewardSplitTranchesInput && (_this.rewardSplitTranchesInput.value = '');
            _this.hardCapInput.value = '';
            _this.minCapInput.value = '';
            _this.rewardPercentageInput.value = '';
            _this.onTierChange({
                currentTarget: {
                    value: Object.keys(_this.props.blockTiers)[0]
                }
            });
        });
    },
    onTierChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var blockNumber = this.props.blockTiers[e.currentTarget.value];
        blockNumber = blockNumber ? blockNumber.averages[1] : null;
        this.setState({ blockNumber, tier: e.currentTarget.value });
    },
    onBlockLimitChange(e) {
        this.setState({ blockNumber: parseInt(e.currentTarget.dataset.value) });
    },
    onNewPair(newPair) {
        if (!newPair) {
            return;
        }
        this.pairPicker && this.pairPicker.setState({ selected: null });
        var mainTokenAddress = this.mainTokenPicker && this.mainTokenPicker.state && !isNaN(this.mainTokenPicker.state.selected) && this.state.tokensList[this.mainTokenPicker.state.key][this.mainTokenPicker.state.selected].address;
        if (newPair.address === mainTokenAddress) {
            this.mainTokenPicker.setState({ selected: null });
        }
        var pairs = (this.state && this.state.pairs) || [];
        for (var pair of pairs) {

            if (pair.address === newPair.address) {
                return;
            }
        }
        pairs.push(newPair);
        this.setState({ pairs });
    },
    onNewMainToken(mainToken) {
        if (!mainToken) {
            return;
        }
        var pairs = (this.state && this.state.pairs) || [];
        var found;
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            if (pair.address === mainToken.address) {
                found = i;
                break;
            }
        }
        !isNaN(found) && pairs.splice(found, 1);
        this.setState({ pairs });
    },
    deletePair(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.state.pairs.splice(parseInt(e.currentTarget.dataset.index), 1);
        this.setState({ pairs: this.state.pairs });
    },
    proposeNewStaking(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.emit('message');
        var startBlock = parseInt(this.startBlockInput.value);
        if (isNaN(startBlock) || startBlock < 0) {
            return this.emit('message', 'Start Block must be a number greater than 0', 'error');
        }
        var endBlock = parseInt(this.endBlockInput.value);
        if (isNaN(endBlock) || endBlock < 0) {
            return this.emit('message', 'End Block must be a number greater than 0', 'error');
        }
        var pairs = (this.state && this.state.pairs || []);
        if (pairs.length === 0) {
            return this.emit('message', 'Please select at least a pair', 'error');
        }
        var tiers = (this.state && this.state.tiers || []);
        if (tiers.length === 0) {
            return this.emit('message', 'You must add at least a tier', 'error');
        }
        for (var tier of tiers) {
            tier.timeWindow = tier.blockNumber;
            var percentage = window.calculateMultiplierAndDivider(tier.percentage);
            tier.rewardMultiplier = percentage[0];
            tier.rewardDivider = percentage[1];
        }
        var mainTokenAddress = this.mainTokenPicker && this.mainTokenPicker.state && !isNaN(this.mainTokenPicker.state.selected) && this.state.tokensList[this.mainTokenPicker.state.key][this.mainTokenPicker.state.selected].address;
        if (!mainTokenAddress) {
            return this.emit('message', 'Main Token is mandatory', 'error');
        }
        for (var pair of pairs) {
            if (pair.address === mainTokenAddress) {
                return this.emit('message', 'Main Token cannot be in the pair list', 'error');
            }
        }
        var rewardTokenAddress = this.rewardTokenPicker && this.rewardTokenPicker.state && !isNaN(this.rewardTokenPicker.state.selected) && this.state.tokensList[this.rewardTokenPicker.state.key][this.rewardTokenPicker.state.selected].address;
        if (!rewardTokenAddress) {
            return this.emit('message', 'Reward Token is mandatory', 'error');
        }
        window.stake(this, startBlock, endBlock, mainTokenAddress, rewardTokenAddress, pairs.map(it => it.address), tiers);
    },
    onHardCapChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.hardCapChangeTimeout && window.clearTimeout(this.hardCapChangeTimeout);
        var _this = this;
        this.hardCapChangeTimeout = window.setTimeout(function () {
            var value = window.formatMoney(parseFloat(_this.hardCapInput.value.split(',').join()) / 1000);
            if (isNaN(parseFloat(value.split(',').join('')))) {
                value = '0.00';
            }
            _this.minCapInput.value = value
        }, 300);
    },
    componentDidMount() {
        var _this = this;
        window.loadOffChainWallets().then(tokensList => _this.setState({ tokensList }));
        this.onTierChange({
            currentTarget: {
                value: Object.keys(this.props.blockTiers)[0]
            }
        });
    },
    render() {
        var _this = this;
        if (!_this.props.stakingData) {
            return (<LoaderMinimino />);
        }
        var rewardToken;
        try {
            rewardToken = this.rewardTokenPicker && this.rewardTokenPicker.state && !isNaN(this.rewardTokenPicker.state.selected) && this.state.tokensList[this.rewardTokenPicker.state.key][this.rewardTokenPicker.state.selected];
        } catch (e) {
        }
        var mainToken;
        try {
            mainToken = this.mainTokenPicker && this.mainTokenPicker.state && !isNaN(this.mainTokenPicker.state.selected) && this.state.tokensList[this.mainTokenPicker.state.key][this.mainTokenPicker.state.selected];
        } catch (e) {
        }
        return (<section>
            <p className="WOWDescription2">Before creating a Liquidity Mining Mechanism, be sure there are already existing Uniswap V2 Liquidity pools for the DFO Voting Token. Be also assured that the DFO wallet has enough funds to cover the rewards. The min Stake is a critical feature to ensure that the maximum number of open positions are supported by the Ethereum Virtual Machine without receiving a general "Out Of Gas" error and makes it impossible for stakers to redeem their funds.</p>
            <section className="TheDappInfo1">
                <section className="DFOTitleSection BravPicciot">
                    <h5 className="DFOHostingTitle"><b>Start Block:</b></h5>
                    <input type="number" ref={ref => (this.startBlockInput = ref) && !_this.firstTime && (_this.firstTime = true) && (ref.value = '0')} min="0" />
                    <h5 className="DFOHostingTitle"><b>End Block:</b></h5>
                    <input type="number" ref={ref => (this.endBlockInput = ref) && !_this.firstTime && (_this.firstTime = true) && (ref.value = '0')} min="0" />
                    <h5 className="DFOHostingTitle"><b>Reward With:</b></h5>
                    <UniswapTokenPicker readOnly={this.state && this.state.tiers && this.state.tiers.length > 0} ref={ref => this.rewardTokenPicker = ref} tokensList={this.state.tokensList} exceptFor={window.wethAddress} onChange={() => _this.forceUpdate()} />
                    <h5 className="DFOHostingTitle"><b>Main Token:</b></h5>
                    <UniswapTokenPicker readOnly={this.state && this.state.tiers && this.state.tiers.length > 0} ref={ref => this.mainTokenPicker = ref} tokensList={this.state.tokensList} exceptFor={window.wethAddress} onChange={this.onNewMainToken} />
                    <h5 className="DFOHostingTitle"><b>Pairs:</b></h5>
                    {this.state.pairs.map((it, i) => <a key={it.address} href="javascript:;" className="DFOHostingTag">
                        <img src={it.logo}></img>
                        {it.symbol}
                        {(!this.state || !this.state.tiers || this.state.tiers.length === 0) && <a className="ChiudiQuella ChiudiQuellaGigi" href="javascript:;" data-index={i} onClick={_this.deletePair}>X</a>}
                    </a>)}
                    {false && <TokenPicker ref={ref => this.pairPicker = ref} tokenAddress={this.props.element.token.options.address} onChange={this.onNewPair} />}
                    <UniswapTokenPicker readOnly={this.state && this.state.tiers && this.state.tiers.length > 0} ref={ref => this.pairPicker = ref} tokensList={this.state.tokensList} onChange={this.onNewPair} />
                </section>
            </section>
            <section className="TheDappInfo2">
                <section className="DFOTitleSection BravPicciot">
                    <h5 className="DFOHostingTitle"><b>Tiers:</b></h5>
                    <section className="OVaglio">
                        <p>Locking Period:</p>
                        <select onChange={this.onTierChange}>
                            {Object.keys(_this.props.blockTiers).map(it => <option key={it} value={it} selected={_this.state.tier === it}>{it}</option>)}
                            <option value="Custom" selected={_this.state.tier === 'Custom'}>Custom</option>
                        </select>

                        {(!this.state || this.state.tier !== 'Custom') && <ul>
                            <p>Blocks:</p>
                            {_this.props.blockTiers[(this.state && this.state.tier) || Object.keys(_this.props.blockTiers)[0]].averages.map(it => <li key={it}>
                                <label>
                                    <input className="AMeMoPiach" type="radio" data-value={it} name="blockNumber" onChange={this.onBlockLimitChange} ref={ref => ref && (ref.checked = this.state.blockNumber === it)} />
                                    <span><b>{it}</b></span>
                                </label>
                            </li>)}
                        </ul>}

                        {this.state && this.state.tier === 'Custom' && <section>
                            <label>
                                <p>Value:</p>
                                <input type="number" min="1" placeholder="Custom block number..." ref={ref => this.customBlockNumber = ref} />
                            </label>
                            <label>
                                <p>Tranches amount:</p>
                                <input type="number" min="1" ref={ref => this.rewardSplitTranchesInput = ref} />
                            </label>
                        </section>}
                        {(this.state && this.state.tier && this.state.tier !== 'Custom') && <p>{_this.props.blockTiers[this.state.tier].weeks} Tranches (Weeks)</p>}
                    </section>
                    <section className="OVaglio">
                        <label>
                            <p>Max Simultaneous Stake:</p>
                            <input ref={ref => this.hardCapInput = ref} type="text" placeholder="Amount" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" onKeyUp={this.onHardCapChange} />
                        </label>
                        <label>
                            <p>Min to Stake:</p>
                            <input ref={ref => this.minCapInput = ref} type="text" placeholder="Amount" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" disabled />
                        </label>
                        <label>
                            <p>Reward Percentage:</p>
                            <aside><input ref={ref => this.rewardPercentageInput = ref} type="number" min="0" placeHoder="Insert a percentage" /> %</aside>
                        </label>
                    </section>
                    <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonG LinkVisualButtonBIGGA" onClick={this.addTier}>Add</a>
                </section>
            </section>
            {this.state && this.state.tiers && <ul>
                {this.state.tiers.map((it, i) => <li key={it.blockNumber} className="TheDappInfoAll TheDappInfoSub">
                    <section className="TheDappInfo1">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle"><img src={rewardToken.logo}></img><b>{rewardToken.symbol}</b> for {it.time}</h5>
                            <h5 className="DFOHostingTitle">Reward: <b className='DFOHostingTitleG'>{window.formatMoney(it.percentage)}%</b></h5>
                            <h5 className="DFOHostingTitle">by staking <img src={mainToken.logo}></img><b>{mainToken.symbol}</b></h5>
                            <p className="DFOHostingTitle">Distribution: <b>Weekly</b></p>
                            <p className="DFOLabelTitleInfosmall">DEX: &#129412; V2 </p>
                        </section>
                    </section>
                    {_this.state && _this.state.pairs && <section className="TheDappInfo1">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle"><b>Pairs:</b></h5>
                            {_this.state.pairs.map(pair => <a key={pair.address} href={window.getNetworkElement('etherscanURL') + 'token/' + pair.address} target="_blank" className="DFOHostingTag">
                                <img src={pair.logo} />
                                {pair.symbol}
                            </a>)}
                        </section>
                    </section>}
                    <section className="TheDappInfo05">
                        <section className="DFOTitleSection">
                            <span className="DFOHostingTitleS">Min Cap:</span>
                            <h5 className="DFOHostingTitle"><b>{window.fromDecimals(it.minCap, _this.props.element.decimals)}</b></h5>
                            <span className="DFOHostingTitleS DFOHostingTitleG">Hard Cap:</span>
                            <h5 className="DFOHostingTitle DFOHostingTitleG"><b>{window.fromDecimals(it.hardCap, _this.props.element.decimals)}</b></h5>
                        </section>
                    </section>
                    <a className="ChiudiQuella ChiudiQuellaGigi" data-index={i} onClick={_this.deleteTier}>X</a>
                </li>)}
            </ul>}
            <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB LinkVisualButtonBIGGAMaNNTROPAAAA" onClick={this.proposeNewStaking}>Propose New Liquidity Mining</a>
        </section>);
    }
});