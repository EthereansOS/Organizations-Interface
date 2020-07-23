var Wallet = React.createClass({
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
                        <h2>{_this.props.element.name} Balances {parseFloat(_this.props.element.walletCumulativeDollar) > 0 && <span>(Tracked: ${_this.props.element.walletCumulativeDollar})</span>} <a className="LinkVisualButton LinkVisualEthscan" target="_blank" href={window.getNetworkElement("etherscanURL") + "tokenHoldings?a=" + _this.props.element.walletAddress}>&#128142; Etherscan</a></h2>
                    </section>
                    <AsyncValue>
                        {_this.props.element.symbol && _this.props.element.totalSupply && _this.props.element.communityTokens && 
                            <li className="TheDappInfo1 TheDappInfoSub">
                                <section className="DFOTitleSection">
                                    <section className="DFOWalletBalanceSingleT">
                                        <aside>&#129689;</aside>
                                        <h3>{_this.props.element.symbol} {parseFloat(_this.props.element.communityTokensDollar) > 0 && <span className="DFOLabelTitleInfosmall"> (${_this.props.element.communityTokensDollar})</span>}</h3>
                                    </section>
                                    <h5 className="DFOLabelTitleInfoM"><b>{window.fromDecimals(_this.props.element.communityTokens, _this.props.element.decimals)}</b></h5>
                                    <br></br>
                                    <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Swap Proposal</a>
                                    <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Pool Proposal</a>
                                        
                                </section>
                            </li>
                        }
                    </AsyncValue>
                    {_this.props.element !== window.dfoHub && 
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <section className="DFOWalletBalanceSingleT">
                                <img src={window.getNetworkElement("trustwalletImgUrl") + window.getNetworkElement("buidlTokenAddress") + "/logo.png"}></img>
                                <h3>buidl {parseFloat(_this.props.element.walletBUIDLDollar) > 0 && <span className="DFOLabelTitleInfosmall"> (${_this.props.element.walletBUIDLDollar})</span>}</h3>
                            </section>
                            <h5 className="DFOLabelTitleInfoM"><b>{window.fromDecimals(_this.props.element.walletBUIDL, window.dfoHub.decimals)}</b></h5>
                            <br></br>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Swap Proposal</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Pool Proposal</a>
                        </section>
                    </li>}
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <section className="DFOWalletBalanceSingleT">
                                <img src="assets/img/eth-logo.png"></img>
                                <h3>ETH {parseFloat(_this.props.element.walletETHDollar) > 0 && <span className="DFOLabelTitleInfosmall"> (${_this.props.element.walletETHDollar})</span>}</h3>
                            </section>
                            <h5 className="DFOLabelTitleInfoM"><b>{window.fromDecimals(_this.props.element.walletETH, 18)}</b></h5>
                            <br></br>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Swap Proposal</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Pool Proposal</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <section className="DFOWalletBalanceSingleT">
                                <img src={window.getNetworkElement("trustwalletImgUrl") + window.getNetworkElement("usdcTokenAddress") + "/logo.png"}></img>
                                <h3>USDC {parseFloat(_this.props.element.walletUSDCDollar) > 0 && <span className="DFOLabelTitleInfosmall"> (${_this.props.element.walletUSDCDollar})</span>}</h3>
                            </section>
                            <h5 className="DFOLabelTitleInfoM"><b>{window.fromDecimals(_this.props.element.walletUSDC, 6)}</b></h5>
                            <br></br>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Swap Proposal</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Pool Proposal</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <section className="DFOWalletBalanceSingleT">
                                <img src={window.getNetworkElement("trustwalletImgUrl") + window.getNetworkElement("daiTokenAddress") + "/logo.png"}></img>
                                <h3>DAI {parseFloat(_this.props.element.walletDAIDollar) > 0 && <span className="DFOLabelTitleInfosmall"> (${_this.props.element.walletDAIDollar})</span>}</h3>
                            </section>
                            <h5 className="DFOLabelTitleInfoM"><b>{window.fromDecimals(_this.props.element.walletUSDC, 18)}</b></h5>
                            <br></br>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Swap Proposal</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Pool Proposal</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <section className="DFOWalletBalanceSingleT">
                                <img src={window.getNetworkElement("trustwalletImgUrl") + window.getNetworkElement("rsvTokenAddress") + "/logo.png"}></img>
                                <h3>RSV {parseFloat(_this.props.element.walletRSVDollar) > 0 && <span className="DFOLabelTitleInfosmall"> (${_this.props.element.walletRSVDollar})</span>}</h3>
                            </section>
                            <h5 className="DFOLabelTitleInfoM"><b>{window.fromDecimals(_this.props.element.walletUSDC, 18)}</b></h5>
                            <br></br>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Swap Proposal</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Pool Proposal</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <section className="DFOWalletBalanceSingleT">
                                <img src={window.getNetworkElement("trustwalletImgUrl") + window.getNetworkElement("usdtTokenAddress") + "/logo.png"}></img>
                                <h3>USDT {parseFloat(_this.props.element.walletUSDTDollar) > 0 && <span className="DFOLabelTitleInfosmall"> (${_this.props.element.walletUSDTDollar})</span>}</h3>
                            </section>
                            <h5 className="DFOLabelTitleInfoM"><b>{window.fromDecimals(_this.props.element.walletUSDC, 18)}</b></h5>
                            <br></br>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Swap Proposal</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Pool Proposal</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <section className="DFOWalletBalanceSingleT">
                                <img src={window.getNetworkElement("trustwalletImgUrl") + window.getNetworkElement("wethTokenAddress") + "/logo.png"}></img>
                                <h3>WETH {parseFloat(_this.props.element.walletWETHDollar) > 0 && <span className="DFOLabelTitleInfosmall"> (${_this.props.element.walletWETHDollar})</span>}</h3>
                            </section>
                            <h5 className="DFOLabelTitleInfoM"><b>{window.fromDecimals(_this.props.element.walletUSDC, 18)}</b></h5>
                            <br></br>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Swap Proposal</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Pool Proposal</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <section className="DFOWalletBalanceSingleT">
                                <img src={window.getNetworkElement("trustwalletImgUrl") + window.getNetworkElement("wbtcTokenAddress") + "/logo.png"}></img>
                                <h3>WBTC {parseFloat(_this.props.element.walletWBTCDollar) > 0 && <span className="DFOLabelTitleInfosmall"> (${_this.props.element.walletWBTCDollar})</span>}</h3>
                            </section>
                            <h5 className="DFOLabelTitleInfoM"><b>{window.fromDecimals(_this.props.element.walletUSDC, 18)}</b></h5>
                            <br></br>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Swap Proposal</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Pool Proposal</a>
                        </section>
                    </li>
                </ul>
            </section>
        );
    }
});