var PairList = React.createClass({
    requiredScripts: [
        'spa/loaderMinimino.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            'ethereum/update' : () => this.controller.loadData(this)
        }
    },
    componentDidMount() {
        this.controller.loadData(this);
    },
    sortList() {
        var list = [];
        if(this.state && this.state.list) {
            list = this.state.list;
        }
        return list;
    },
    select(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var pair = this.state.list[e.currentTarget.dataset.i];
        var _this = this;
        _this.setState({selected : e.currentTarget.dataset.i}, function() {
            _this.props.onChange(pair);
        });
    },
    render() {
        var _this = this;
        return (<section>
            {(!this.state || !this.state.list) && <LoaderMinimino/>}
            {this.state && this.state.list && <section>
                <ul>
                    {this.sortList().map((it, i) => <li key={it.key}>
                        <section className={"Pair" + (i === this.state.selected ? " Selected" : "")}>
                            <a href="javascript:;" data-i={i} onClick={_this.select}>
                                <span>
                                    <img src={it.token0.logo}/>
                                    <span>{it.token0.name}</span>
                                    <span>({it.token0.symbol})</span>
                                </span>
                                -
                                <span>
                                    <img src={it.token1.logo}/>
                                    <span>{it.token1.name}</span>
                                    <span>({it.token1.symbol})</span>
                                </span>
                            </a>
                        </section>
                    </li>)}
                </ul>
            </section>}
        </section>);
    }
});