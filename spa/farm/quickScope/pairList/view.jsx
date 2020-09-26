var PairList = React.createClass({
    requiredModules: [
        'spa/farm/quickScope/pairItem'
    ],
    sortList() {
        var list = this.props.list || [];
        return list;
    },
    render() {
        var _this = this;
        return (<section>
            <section>
                <ul>
                    {this.sortList().map((it, i) => <li key={it.key}>
                        <section className="Pair">
                            <PairItem lock={this.props.lock} pair={it} tokenT={this.props.tokenT}/>
                        </section>
                    </li>)}
                </ul>
            </section>
        </section>);
    }
});