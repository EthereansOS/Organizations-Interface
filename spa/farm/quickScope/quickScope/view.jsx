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
        return list;
    },
    render() {
        var tokenT = window.wethToken;
        return (<section>
            {(!this.state || !this.state.list) && <LoaderMini />}
            <ul>
                {this.sortList().map(it => <li key={it.key}>
                    <PairToken lock={this.state && this.state.lock} pair={it} selection="token0" tokenT={tokenT}/>
                    <PairToken lock={this.state && this.state.lock} pair={it} selection="token1" tokenT={tokenT}/>
                </li>)}
            </ul>
        </section>);
    }
});