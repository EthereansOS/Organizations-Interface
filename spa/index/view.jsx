var Index = React.createClass({
    requiredModules: [
        'spa/deploy',
        'spa/dFOList'
    ],
    requiredScripts: [
        'spa/messages.jsx',
        'spa/loader.jsx',
        'spa/walletEnablerButton.jsx',
        'spa/noWeb3Loader.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            'dfo/deploy': this.onDFO,
            'dfo/deploy/cancel': () => this.setState({ deploy: null }),
            'ethereum/ping': () => this.forceUpdate(),
            'index/fullscreen': this.onFullscreen,
            'stake/close' : () => this.state && this.state.optionalPage && this.setState({optionalPage : null})
        };
    },
    onFullscreen(fullscreen) {
        this.header.removeClass('HeaderTop');
        fullscreen && this.header.addClass('HeaderTop');
        window.onScrollFunction && window.onScrollFunction();
    },
    onDFO(dFO) {
        var _this = this;
        _this.setState({ dFO, deploy: null }, function () {
            _this.address && (_this.address.value = dFO.options.address) && this.load({ target: { dataset: { timeout: "0" } } });
            window.history.pushState({}, "", window.location.protocol + "//" + window.location.hostname + (window.location.port && window.location.port !== "443" && window.location.port !== "80" ? (":" + window.location.port) : "") + "/?addr=" + dFO.options.address);
        });
    },
    load(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var timeout = e.target.dataset.timeout;
        timeout = timeout ? parseInt(timeout) : 700;
        this.loadTimeout && window.clearTimeout(this.loadTimeout);
        var _this = this;
        _this.loadTimeout = setTimeout(function () {
            _this.setState({ dFO: null, deploy: null }, () => {
                _this.onFullscreen();
                _this.emit('search', _this.address.value)
            });
        }, timeout);
    },
    deploy(e) {
        e && e.preventDefault(true) && e.stopPropagation(true);
        var _this = this;
        _this.setState({ dFO: null, deploy: (_this.state && _this.state.deploy) ? false : true }, () => _this.onFullscreen(true));
    },
    componentDidMount() {
        var address = '';
        try {
            address = window.addressBarParams.addr;
        } catch (e) {
        }
        isEthereumAddress(address) && (this.address.value = address) && this.load({target:{dataset:{timeout:"700"}}});
        this.controller.tryLoadStaking();
    },
    toggleLightMode(e) {
        e && e.preventDefault(true) && e.stopPropagation(true);
        $(e.target).html('&#' + (this.domRoot.toggleClass('DarkMode').hasClass('DarkMode') ? '128161' : '127769') + ';');
        window.localStorage.setItem('lightMode', this.domRoot.hasClass('DarkMode') ? 'false' : 'true');
    },
    compareGotcha(ref) {
        ref && setTimeout(function() {
            ref.innerHTML = '<a href="javascript:;" onclick="$(this).parent().parent().parent().hide()">Gotcha!</a>'
        }, 3000);
    },
    render() {
        return (
            <div className={"Main" + (window.localStorage.lightMode === 'true' ? "" : " DarkMode")}>
                <section ref={ref => this.header = $(ref)} className="Explorer">
                    <header className="HeaderDFO">
                        <ul>
                            <li className="BrandLi">
                                <a href="javascript:;" onClick={() => window.location.reload()}>&#128123;<span className="BODL">DFO</span><span>hub</span></a> <a className="BrandLiInfo" href="https://dfohub.com" target="_blank"> &#8505;</a>
                            </li>
                            <li className="SearchLi">
                                <input ref={ref => this.address = ref} placeholder="Search by Address" onChange={this.load} />
                                <a href="javascript:;" type="button" data-timeout="0" onClick={this.load}>
                                    <div className="search">
                                        <div className="search__circle"></div>
                                        <div class="search__rectangle"></div>
                                    </div>
                                </a>
                            </li>
                            <li className="DeployLi">
                                <WalletEnablerButton className={"LinkVisualButton LinkVisualButtonB" + (this.state && this.state.deploy ? " Editing" : "")} onClick={this.deploy}>{this.state && this.state.deploy ? 'Back' : 'New'}</WalletEnablerButton>
                                <a className="ChangeViewDtoW" href="javascript:;" onClick={this.toggleLightMode} ref={ref => ref && (ref.innerHTML = ("&#" + (window.localStorage.lightMode === 'true' ? "127769" : "128161") + ";"))}>&#127769;</a>
                            </li>
                        </ul>
                    </header>
                    {!(this.state && this.state.optionalPage) && <div className="BETABANNER">
                        <section>
                            <h1>&#128123;</h1>
                            <h2>Welcome to the DFOhub <span>{window.context.dappVersion}</span></h2>
                            <p>To follow our Developing and Bug Fixing: <a href="https://www.notion.so/dfohub/DFOhub-Project-05787c6c7e2f49c5bd3a767c020583e8" target="_blank">DevStatus</a> If you want to be an active part of our Developing, we scheduled some fancy rewards! Read the <a href="https://www.notion.so/dfohub/Community-Guidelines-a03ceeab28254eb3944ab85320be70de" target="_blank">Community Guidelines</a> and join our <a href="https://discord.gg/B9V9CM4" target="_blank">Discord Server</a></p>
                            <section className="BugUpdateBunner TheDappInfoX">
                            <h2>&#128718; Dev Notes:</h2>
                            <p>ENS Integration is working! But due to the early state of ENS, we're discussing an <a href="https://github.com/MetaMask/metamask-extension/pull/7740" target="_blank">Improvement Proposal</a> with the Metamask team, to manage DFO's ENS in a decentralized way. In the meantime, Metamask can't redirect the ENS properly.</p>
                            </section>
                            <section className="BugUpdateBunner TheDappInfoXYZ">
                            <h2>Simple View</h2>
                            <p>During the R&D for the new DFOhub front-end V2, you can use this simplified front-end experience. Here you can use every DFOhub features (farming, voting etc), but to propose updates, you need to use a desktop.</p>
                            </section>
                            <section ref={this.compareGotcha}>
                                <span className="loaderMinimino"/>
                            </section>
                        </section>
                    </div>}
                    {this.state && this.state.deploy && <Deploy/>}
                    {(!this.state || !this.state.deploy) && <DFOList/>}
                </section>
                {this.state && this.state.optionalPage && React.createElement(this.state.optionalPage.component, this.state.optionalPage.props)}
                <Messages/>
                <Loader/>
            </div>
        );
    }
});