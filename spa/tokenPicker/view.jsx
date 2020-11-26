var TokenPicker = React.createClass({
    onType(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.onTypeTimeout && clearTimeout(this.onTypeTimeout);
        var _this = this;
        var target = e.currentTarget;
        var value = target.value;
        this.onTypeTimeout = setTimeout(function() {
            _this.setState({search: value, selected: null}, () => {
                _this.props.tokenAddress && window.isEthereumAddress(_this.state.search) && window.loadUniswapPairs(_this, _this.props.tokenAddress, _this.state.search);
            });
        }, 600);
    },
    toggle(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if(e.relatedTarget && e.relatedTarget.tagName === 'INPUT') {
            return;
        }
        if(e.type === 'click' || (e.type === 'blur' && e.relatedTarget && e.relatedTarget.tagName === 'A' && e.relatedTarget.dataset.item)) {
            var _this = this;
            var item = JSON.parse((e.type==='click' ? e.currentTarget : e.relatedTarget).dataset.item);
            this.input.value = item.address;
            this.setState({selected: item, show: null, search: null}, function() {
                _this.props.onChange && _this.props.onChange(item);
            });
            return;
        }
        if(e.type === 'blur') {
            this.setState({show: null});
        }
        if(this.state && this.state.show && (e.type === 'focus' || (e.relatedTarget !== undefined && e.relatedTarget !== null))) {
            return;
        }
        (((!this.state || !this.state.show) && e.type === 'focus') || (this.state && this.state.show && e.type === 'blur')) && this.setState({show : e.type === 'focus'});
    },
    getList() {
        if(!this.state || !this.state.uniswapPairs) {
            return null;
        }
        var pairs = !this.props.tokenAddress ? this.state.uniswapPairs : Object.values(window.alreadyAdded).map(it => it.token0.address !== this.props.tokenAddress ? it.token0 : it.token1);

        if(!this.state.search) {
            return pairs;
        }
        var list = [];
        var search = this.state.search.trim().toLowerCase();
        for(var token of pairs) {
            (token.address.trim().toLowerCase().indexOf(search) !== -1 || token.name.trim().toLowerCase().indexOf(search) !== -1 || token.symbol.trim().toLowerCase().indexOf(search) !== -1) && list.push(token);
        }
        return list;
    },
    componentDidMount() {
        this.props.tokenAddress && window.loadUniswapPairs(this, this.props.tokenAddress);
        var _this = this;
        this.props.element && window.loadWallets(_this.props.element, uniswapPairs => _this.setState({uniswapPairs}), true);
    },
    renderSelection() {
        var list = this.getList();
        return (<section className="PikaPikaYaYa" tabindex="-1" onBlur={this.toggle}>
            <section className="PikaPikaSearch">
                <input onFocus={this.toggle} ref={ref => (this.input = ref) && (ref.value = (this.state && this.state.search) || '')} type="text" placeholder="Search Name/Address" onKeyUp={this.onType} onChange={this.onType}/>
            </section>
            <section className="PikaPikaFind">
                {!list && <h4>Loading tokens...</h4>}
                {list && list.length === 0 && <h4>No results found</h4>}
                {list && list.map(it => <a className="PikaPikaFindaaaaaaaaa" key={it.address} onClick={this.toggle} href="javascript:;" data-item={JSON.stringify(it)}>
                    <img src={it.logo}/>
                    <p>{it.name} ({it.symbol})</p>
                </a>)}
            </section>
        </section>);
    },
    render() {
        if(this.state && this.state.show) {
            return this.renderSelection();
        }
        return (<section tabindex="-1" onFocus={this.toggle}>
            {(!this.state || !this.state.selected) && <section>
                <a className="tokenpickerSelector" href="javascript:;">Select</a>
            </section>}
            {(this.state && this.state.selected) && <section className="PikaPikaSelectedBoomer">
                <img src={this.state.selected.logo}/>
                <p>{this.state.selected.name} <b>({this.state.selected.symbol})</b></p>
            </section>}
        </section>);
    }
});