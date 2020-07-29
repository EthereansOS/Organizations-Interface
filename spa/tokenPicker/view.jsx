var TokenPicker = React.createClass({
    onType(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.onTypeTimeout && clearTimeout(this.onTypeTimeout);
        var _this = this;
        var target = e.currentTarget;
        this.onTypeTimeout = setTimeout(function() {
            _this.setState({search: target.value, selected: null});
        }, 600);
    },
    toggle(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if(e.type === 'blur' && e.relatedTarget && e.relatedTarget.tagName === 'A' && e.relatedTarget.dataset.item) {
            var item = JSON.parse(e.relatedTarget.dataset.item);
            this.input.value = item.address;
            this.setState({selected: item, show: null, search: null});
            return;
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
        if(!this.state.search) {
            return this.state.uniswapPairs;
        }
        var list = [];
        var search = this.state.search.trim().toLowerCase();
        for(var token of this.state.uniswapPairs) {
            (token.address.trim().toLowerCase().indexOf(search) !== -1 || token.name.trim().toLowerCase().indexOf(search) !== -1 || token.symbol.trim().toLowerCase().indexOf(search) !== -1) && list.push(token);
        }
        return list;
    },
    componentDidMount() {
        this.controller.loadUniswapPairs(this);
    },
    renderSelection() {
        var list = this.getList();
        return (<section tabindex="-1" onBlur={this.toggle}>
            <section>
                <input onFocus={this.toggle} ref={ref => this.input = ref} type="text" placeholder="Type your Ethereum address here.." onKeyUp={this.onType} onChange={this.onType}/>
            </section>
            <section>
                {!list && <h4>Loading tokens...</h4>}
                {list && list.length === 0 && <h4>No results found</h4>}
                {list && list.map(it => <a key={it.address} href="javascript:;" data-item={JSON.stringify(it)}>
                    <img src={it.logo}/>
                    {'\u00a0'}
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
                <a href="javascript:;">Select a token...</a>
            </section>}
            {(this.state && this.state.selected) && <section>
                <img src={this.state.selected.logo}/>
                {'\u00a0'}
                <p>{this.state.selected.name} ({this.state.selected.symbol})</p>
            </section>}
        </section>);
    }
});