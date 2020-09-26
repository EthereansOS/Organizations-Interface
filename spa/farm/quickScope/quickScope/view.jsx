var QuickScope = React.createClass({
    requiredScripts: [
        'spa/loaderMini.jsx'
    ],
    requiredModules : [
        'spa/farm/quickScope/pairList'
    ],
    getDefaultSubscriptions() {
        return {
            'ethereum/update' : () => this.controller.loadData(this),
            'quickScope/lock' : lock => this.setState({lock})
        };
    },
    componentDidMount() {
        this.controller.loadData(this);
    },
    render() {
        return (<section>
            {(!this.state || !this.state.list) && <LoaderMini/>}
            {this.state && this.state.list && <PairList lock={this.state && this.state.lock} list={this.state.list} tokenT={window.wethToken}/>}
        </section>);
    }
});