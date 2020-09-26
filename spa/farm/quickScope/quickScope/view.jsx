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
        var renderedList = (this.state && this.state.options) ? [] : list;
        if(this.state && this.state.options) {
            for(var pair of list) {
                if(this.state.options[pair.token0.address].selected && this.state.options[pair.token1.address].selected) {
                    renderedList.push(pair);
                }
            }
        }
        return renderedList;
    },
    onSelection(e) {
        var options = this.state.options;
        options[e.currentTarget.dataset.key].selected = !options[e.currentTarget.dataset.key].selected;
        this.setState({options});
    },
    render() {
        var _this = this;
        var tokenT = window.wethToken;
        return (<section>
            {(!this.state || !this.state.list) && <LoaderMini />}
            {this.state && this.state.options && <ul>
                {Object.values(this.state.options).map(it => <li key={it.token.address}>
                    <label>
                        <input type="checkbox" data-key={it.token.address} onChange={_this.onSelection} checked={it.selected}/>
                        <img src={it.token.logo}/>
                        <span>{it.token.name}</span>
                        <span>({it.token.name})</span>
                    </label>
                </li>)}
            </ul>}
            {this.state && this.state.list && <ul>
                {this.sortList().map(it => <li key={it.key}>
                    <PairToken lock={this.state && this.state.lock} pair={it} selection="token0" tokenT={tokenT}/>
                    <PairToken lock={this.state && this.state.lock} pair={it} selection="token1" tokenT={tokenT}/>
                </li>)}
            </ul>}
        </section>);
    }
});