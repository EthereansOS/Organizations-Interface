var Farm = React.createClass({
    getInitialState() {
        return {
            menu : [{
                "title" : "Quick Scope",
                "module" : "spa/farm/quickScope/quickScope",
                "section" : "QuickScope"
            }],
            menuSelection : 0
        };
    },
    onMenuSelection(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var menuSelection = e.currentTarget.dataset.index;
        var selection = this.state.menu[menuSelection];
        var _this = this;
        ReactModuleLoader.load({
            modules: [selection.module],
            callback : function() {
                _this.setState({menuSelection});
            }
        });
    },
    componentDidMount() {
        this.onMenuSelection({
            currentTarget : {
                dataset : {
                    index : this.state.menuSelection
                }
            }
        });
    },
    render() {
        return (<section>
            <section className="Menu">
                <ul>
                    {this.state.menu.map((it, i) => <li key={it.module}>
                        <section className={(i + "") === (this.state.menuSelection + "") ? "Selected" : undefined}>
                            <a href="javascript:;" className="MenuItem" onClick={this.onMenuSelection} data-index={i}>{it.title}</a>
                        </section>
                    </li>)}
                </ul>
            </section>
            {window[this.state.menu[this.state.menuSelection].section] && React.createElement(window[this.state.menu[this.state.menuSelection].section])}
        </section>);
    }
});