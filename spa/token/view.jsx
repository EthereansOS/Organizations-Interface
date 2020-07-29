var Token = React.createClass({
    requiredModules: [
        'spa/editor'
    ],
    requiredScripts: [
        'spa/loaderMini.jsx',
        'spa/okBoomer.jsx',
        'spa/loaderMinimino.jsx',
        'assets/scripts/uniswapOps.js'
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
    toggleMintBurn(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.setState({mintBurnMethod: e.currentTarget.dataset.function, mintBurn : this.state && this.state.mintBurn === e.currentTarget.innerText ? null : e.currentTarget.innerText});
    },
    render() {
        var _this = this;
        return (
            <section className="DFOOverview">
                <ul className="DFOHosting">
                    <section className="HostingCategoryTitle">
                        <h2>Voting Token</h2>
                    </section>
                    <li className="TheDappInfo05">
                        <section className="DFOTitleSection">
                            <figure className="VerifiedIcon">
                                <img src="assets/img/buidlv2-logo.png"></img>
                            </figure>
                        </section>
                    </li>
                    <li className="TheDappInfo05">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">Name:</h5>
                            <AsyncValue>
                                {_this.props.element.name && <p className="DFOLabelTitleInfo"><a className="LinkVisualStandard" href={window.getNetworkElement("etherscanURL") + 'token/' + _this.props.element.token.options.address} target="_blank">{_this.props.element.name}</a></p>}
                            </AsyncValue>
                            <h5 className="DFOHostingTitle">Ticker:</h5>
                            <AsyncValue>
                                {_this.props.element.symbol && <p className="DFOLabelTitleInfo"><a className="LinkVisualStandard" href={window.getNetworkElement("etherscanURL") + 'token/' + _this.props.element.token.options.address} target="_blank">{_this.props.element.symbol}</a></p>}
                            </AsyncValue>
                        </section>
                    </li>
                    <li className="TheDappInfo05">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">Voting Power:</h5>
                            <AsyncValue>
                                +1
                            </AsyncValue>
                        </section>
                        <section className="DFOTitleSection">
                        </section>
                    </li>
                    <li className="TheDappInfo1">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">Existing Supply:  </h5>
                            <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.totalSupply && <p className="DFOLabelTitleInfo"><a className="LinkVisualStandard" href={window.getNetworkElement("etherscanURL") + 'token/tokenholderchart/' + _this.props.element.token.options.address} target="_blank">{window.fromDecimals(_this.props.element.totalSupply, _this.props.element.decimals)}</a></p>}
                            </AsyncValue>
                            <h5 className="DFOHostingTitle">DFO Wallet Supply: </h5>
                            <AsyncValue>
                                {_this.props.element.symbol && _this.props.element.balanceOf && <p className="DFOLabelTitleInfo"> <a className="LinkVisualStandard" href={window.getNetworkElement("etherscanURL") + 'token/tokenholderchart/' + _this.props.element.token.options.address} target="_blank">{window.fromDecimals(_this.props.element.balanceOf, _this.props.element.decimals)}</a></p>}
                            </AsyncValue>
                        </section>
                    </li>
                    <li className="TheDappInfo025">
                        <section className="DFOTitleSection">
                            <a href={window.context.uniSwapInfoURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Info</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.getNetworkElement("etherscanURL") + 'token/' + _this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualEthscan">&#128142; Info</a>
                            <a href={window.getNetworkElement("etherscanURL") + 'address/' + _this.props.element.token.options.address + '#code'} target="_blank" className="LinkVisualButton LinkVisualEthscan">&#128142; Contract</a>
                            {this.props.edit && <a href="javascript:;" data-function="mintNewTokens" onClick={this.toggleMintBurn} className={"LinkVisualButton LinkVisualPropose LinkVisualButtonB" + (this.state && this.state.mintBurn === 'Mint' ? 'EditDFOYo Editing' : '')}>Mint</a>}
                            {this.props.edit && <a href="javascript:;" data-function="burn" onClick={this.toggleMintBurn} className={"LinkVisualButton LinkVisualPropose LinkVisualButtonB" + (this.state && this.state.mintBurn === 'Burn' ? 'EditDFOYo Editing' : '')}>Burn</a>}
                            {this.props.edit && this.state && this.state.mintBurn && <section>
                                <label>
                                    Amount to {this.state.mintBurn}
                                    <input type="number" min="0" ref={ref => this.input = ref} />
                                </label>
                                <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB" onClick={() => window[this.state.mintBurnMethod](this, this.input.value)}>{this.state.mintBurn}</a>
                            </section>}
                        </section>
                    </li>
                </ul>
                <ul className="DFOHosting">
                    <section className="HostingCategoryTitle">
                        <h2>Dex Liquidity</h2>
                    </section>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                    <li className="TheDappInfo1 TheDappInfoSub">
                        <section className="DFOTitleSection">
                            <h5 className="DFOHostingTitle">&#129412; V2 <b>ETH - buidl</b></h5>
                            <span className="DFOLabelTitleInfosmall">24,100.55 ETH -</span>
                            <span className="DFOLabelTitleInfosmall"> 60,600.55 buidl</span>
                            <p className="DFOLabelTitleInfo">Liquidity: <b>51,600.56 USD</b></p>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Swap</a>
                            <a href={window.context.uniSwapSwapURL + this.props.element.token.options.address} target="_blank" className="LinkVisualButton LinkVisualUni">&#129412; Pool</a>
                        </section>
                    </li>
                </ul>
            </section>
        );
    }
});