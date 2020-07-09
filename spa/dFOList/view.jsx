var DFOList = React.createClass({
    requiredModules: [
        "spa/dFOElement"
    ],
    requiredScripts: [
        'spa/loaderMini.jsx',
        'spa/asyncValue.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            'ethereum/update': () => this.forceUpdate(this.controller.loadList),
            'ethereum/ping': () => this.controller.loadList(true),
            'search': search => this.setState({ search, key: null }),
            'element/update': this.updateElement,
            'balances/refresh': this.controller.refreshBalances,
            'okBommer/toggle': this.toggleOkBoomer
        };
    },
    toggleOkBoomer () {var _this = this; this.dfoElement.setState({ okBoomer: !(this.dfoElement.state && this.dfoElement.state.okBoomer)}, () => _this.forceUpdate())},
    updateElement(element) {
        delete element.updating;
        this.controller.updateInfo(element);
    },
    componentDidMount() {
        this.controller.loadList();
    },
    componentDidUnmount() {
        this.controller.running = false;
    },
    getList() {
        var list = Object.keys(window.list).reverse().map(key => window.list[key]);
        var i = 0;
        while (i < list.length) {
            var element = list[i];
            if (!element.updating) {
                list.splice(i, 1);
                this.controller.updateInfo(element);
            } else {
                i++;
            }
        }
        list.length > 1 && list.unshift(list.splice(list.length - 1, 1)[0]);
        if (this.state && this.state.search) {
            var search = this.state.search.toLowerCase().trim();
            for (var i = 0; i < list.length; i++) {
                var element = list[i];
                if (!((element.name && element.name.toLowerCase().indexOf(search) === 0) || element.dFO.options.address.toLowerCase().indexOf(search) === 0)) {
                    list.splice(i, 1);
                    i--;
                }
            }
            if (list.length === 1 && window.isEthereumAddress(search)) {
                this.setState({ search: null, key: list[0].key });
            }
        }
        return this.sortList(list);
    },
    sortList(list) {
        return Object.values(list).sort((first, second) => {;
            var a = parseInt(first.key.substring(0, first.key.indexOf("_")));
            var b = second ? parseInt(second.key.substring(0, second.key.indexOf("_"))) : 0;
            return a < b ? 1 : a > b ? -1 : 0;
        });
    },
    componentDidUpdate() {
        this.emit('index/fullscreen', this.state && this.state.key !== undefined && this.state.key !== null);
    },
    render() {
        var _this = this;
        var list = this.getList();
        return (
            <section className={"DFOList" + (this.state && this.state.key ? ' DFOListOpenAfter' : '')}>
                <ul className="DFOLister">
                    {list.map(it => {
                        return (!_this.state || !_this.state.key || _this.state.key === it.key) && <li key={it.key} className="DFOInfo">
                            <section className={"DFOMAinNav" + (this.state && this.state.key ? ' DFOMAinNavAfter' : '')}>
                                <section className="DFOMAinNavBox">
                                <a href="javascript:;" onClick={() => {delete it.functionalities; _this.setState({ key: _this.state && _this.state.key === it.key ? null : it.key })}} className="DFOOpener">
                                    <section className="DFOIcon">
                                        <AsyncValue>
                                            <img src={it.icon}/>
                                        </AsyncValue>
                                    </section>
                                    <section className="DFOName">
                                        <AsyncValue>
                                            <h5>{it.name}</h5>
                                        </AsyncValue>
                                    </section>
                                    <section className="DFOMinInfo DFOMinInfoOp">
                                        <h6>Functions</h6>
                                        <AsyncValue>
                                            <h5>{it.functionalitiesAmount}</h5>
                                        </AsyncValue>
                                    </section>
                                    <section className="DFOMinInfo DFOMinInfoOp">
                                        <h6>Start Block</h6>
                                        <AsyncValue>
                                            <h5>{it.startBlock}</h5>
                                        </AsyncValue>
                                    </section>
                                    {_this.state && _this.state.key === it.key && window.walletAddress && <section className="DFOMinInfo">
                                            <figure>
                                                <img src={window.walletAvatar}/>
                                            </figure>
                                            <section>
                                            <h6>{window.walletAddress.substring(0, 20)}...</h6>
                                            <h5><aside>Balance: <AsyncValue>{window.fromDecimals(it.myBalanceOf, it.decimals)}</AsyncValue> {it.symbol}</aside></h5>
                                        </section>
                                    </section>}
                                </a>
                                <a className="DFOENSOpener" target="_blank" href={"https://" + ((it.ens && (it.ens.toLowerCase() + '.')) || '') + "dfohub.eth?ensd=" + ((it.ens && (it.ens.toLowerCase() + '.')) || '') + "dfohub.eth"}>
                                    <section className="DFOMinInfo">
                                        <h6>ENS</h6>
                                        <AsyncValue>
                                            {it.ens !== undefined && <h5>{(it.ens && (it.ens.toLowerCase() + '.')) || ''}dfohub.eth</h5>}
                                        </AsyncValue>
                                    </section>
                                </a>
                                <a className="DFOAddressOpener">
                                    <section className="DFOMinInfo">
                                        <h6>Token</h6>
                                        <AsyncValue>
                                            <h5>{it.symbol}</h5>
                                        </AsyncValue>
                                    </section>
                                </a>
                                <a className="DFOAddressOpener" href={window.getNetworkElement('etherscanURL') + 'address/' + it.dFO.options.address} target="_blank">
                                    <section className="DFOMinInfo">
                                        <h6>Address</h6>
                                        <AsyncValue>
                                            <h5>{it.dFO.options.address.substring(0, 9) + '...'}</h5>
                                        </AsyncValue>
                                    </section>
                                </a>
                                {_this.state && _this.state.key === it.key && <section className="DFOEditKill">
                                    <WalletEnablerButton href="javascript:;" className={"EditDFOYo" + (_this.dfoElement && _this.dfoElement.state && _this.dfoElement.state.edit ? ' Editing' : '')} onClick={() => _this.dfoElement.setState({ edit: !(_this.dfoElement.state && _this.dfoElement.state.edit) }, () => _this.forceUpdate())}>Edit</WalletEnablerButton>
                                    <a href="javascript:;" className="CloseDFOYo" onClick={() => {delete it.functionalities; _this.setState({ key: null })}}>&#x2612;</a>
                                </section>}
                                </section>
                            </section>
                            {_this.state && _this.state.key === it.key && <DFOElement element={it} ref={ref => _this.dfoElement = ref} />}
                        </li>
                    })}
                    {list.length === 1 && (!_this.controller || _this.controller.running) && <LoaderMini message="Loading DFOs" />}
                </ul>
            </section>
        );
    }
});