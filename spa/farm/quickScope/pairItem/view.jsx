var PairItem = React.createClass({
    requiredModules : [
        'spa/farm/quickScope/pairToken'
    ],
    render() {
        return (<section>
            <PairToken lock={this.props.lock} pair={this.props.pair} selection="token0" tokenT={this.props.tokenT}/>
            <PairToken lock={this.props.lock} pair={this.props.pair} selection="token1" tokenT={this.props.tokenT}/>
        </section>);
    }
});