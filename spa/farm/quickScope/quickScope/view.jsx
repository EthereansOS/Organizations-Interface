var QuickScope = React.createClass({
    requiredScripts: [
        'spa/loaderMini.jsx'
    ],
    requiredModules: [
        'spa/farm/quickScope/pairToken'
    ],
    getDefaultSubscriptions() {
        return {
            'ethereum/update': () => this.controller.loadData(this),
            'quickScope/lock': lock => this.setState({ lock })
        };
    },
    componentDidMount() {
        this.controller.loadData(this);
    },
    sortList() {
        var list = (this.state && this.state.list) || [];
        if(!this.state || !this.state.selected || this.state.selected === 'all') {
            return list;
        }
        return list.filter(it => it.token0.address === this.state.selected || it.token1.address === this.state.selected);
    },
    onSelection(e) {
        this.setState({selected: e.currentTarget.value});
    },
    render() {
        var tokenT = window.wethToken;
        return (<section>
            {(!this.state || !this.state.list) && <LoaderMini />}
            {this.state && this.state.options && <select onChange={this.onSelection}>
                <option value="all">All</option>
                {Object.values(this.state.options).map(it => <option value={it.token.address} key={it.token.address}>
                    Only {it.token.name} ({it.token.symbol})
                </option>)}
            </select>}
            {this.state && this.state.list && <ul>
                {this.sortList().map(it => <li key={it.key}>
                    <PairToken lock={this.state && this.state.lock} pair={it} selection="token0" tokenT={tokenT}/>
                    <PairToken lock={this.state && this.state.lock} pair={it} selection="token1" tokenT={tokenT}/>
                </li>)}
            </ul>}
        </section>);
    }
});