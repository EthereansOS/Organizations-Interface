var Index = React.createClass({
    requiredModules: [
        'spa/deploy',
        'spa/dFOList'
    ],
    requiredScripts: [
        'spa/messages.jsx',
        'spa/loader.jsx',
        'spa/walletEnablerButton.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            'dfo/deploy': this.onDFO,
            'dfo/deploy/cancel': () => this.setState({ deploy: null }),
            'ethereum/ping': () => this.forceUpdate(),
            'index/fullscreen': this.onFullscreen
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
            address = window.location.search.split(' ').join('').split('/').join('').split('?addr=').join('');
        } catch (e) {
        }
        isEthereumAddress(address) && (this.address.value = address) && this.load({target:{dataset:{timeout:"300"}}});
    },
    toggleDarkMode(e) {
        e && e.preventDefault(true) && e.stopPropagation(true);
        $(e.target).html('&#' + (this.domRoot.toggleClass('DarkMode').hasClass('DarkMode') ? '128161' : '127769') + ';');
        window.localStorage.setItem('darkMode', this.domRoot.hasClass('DarkMode') ? 'true' : 'false');
    },
    render() {
        return (
            <div className={"Main" + (window.localStorage.darkMode === 'true' ? " DarkMode" : "")}>
                <section ref={ref => this.header = $(ref)} className="Explorer">
                    <header className="HeaderDFO">
                        <ul>
                            <li className="BrandLi">
                                <a href="javascript:;" onClick={() => window.location.reload()}>&#128123;<span className="BODL">DFO</span><span>hub</span></a> <a className="BrandLiInfo" href="https://dfohub.com" target="_blank"> &#8505;</a>
                            </li>
                            <li className="SearchLi">
                                <input ref={ref => this.address = ref} placeholder="Search by Name or Address" onChange={this.load} />
                                <a href="javascript:;" type="button" data-timeout="0" onClick={this.load}>
                                    <div className="search">
                                        <div className="search__circle"></div>
                                        <div class="search__rectangle"></div>
                                    </div>
                                </a>
                            </li>
                            <li className="DeployLi">
                                <WalletEnablerButton className={"LinkVisualButton LinkVisualButtonB" + (this.state && this.state.deploy ? " Editing" : "")} onClick={this.deploy}>{this.state && this.state.deploy ? 'Back' : 'New'}</WalletEnablerButton>
                                <a className="ChangeViewDtoW" href="javascript:;" onClick={this.toggleDarkMode} ref={ref => ref && (ref.innerHTML = ("&#" + (window.localStorage.darkMode === 'true' ? "128161" : "127769") + ";"))}>&#127769;</a>
                            </li>
                        </ul>
                    </header>
                    <div className="BETABANNER">
                        <section>
                            <h1>&#128123;</h1>
                            <h2>Welcome to the DFOhub <span>BETA 0.1</span></h2>
                            <p>To follow our Developing and Bug Fixing: <a href="https://www.notion.so/dfohub/DFOhub-Project-05787c6c7e2f49c5bd3a767c020583e8" target="_blank">DevStatus</a> If you want to be an active part of our Developing, we scheduled some fancy rewards! Read the <a href="https://www.notion.so/dfohub/Community-Guidelines-a03ceeab28254eb3944ab85320be70de" target="_blank">Community Guidelines</a> and join our <a href="https://discord.gg/B9V9CM4" target="_blank">Discord Server</a></p>
                            <section className="BugUpdateBunner">
                            <h2>&#128718; Dev Notes:</h2>
                            <p>ENS Integration is working, but due to the early state of ENS, we're dicussing an <a href="https://github.com/MetaMask/metamask-extension/pull/7740" target="_blank">Improvement Proposal</a> to the Metamask team, in order to manage DFOs ENS in a totally decentralized way. In the meantime Metamask can't redirect the ENS properly.</p>
                            </section>
                            <a href="javascript:;" onClick={e => $(e.currentTarget).parent().parent().hide()}>Gotcha!</a>
                        </section>
                    </div>
                    {this.state && this.state.deploy && <Deploy/>}
                    {(!this.state || !this.state.deploy) && <DFOList/>}
                </section>
                <Messages/>
                <Loader/>
            </div>
        );
    }
});