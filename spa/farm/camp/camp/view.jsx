var Camp = React.createClass({
    requiredModules : [
        'spa/farm/camp/pairChooser',
        'spa/farm/camp/pairList'
    ],
    onPair(pair) {
        this.pairChooser.setPair(pair.token0.address, pair.token1.address);
    },
    componentDidMount() {
        this.controller.loadData();
    },
    render() {
        return (<section>
            <PairList onChange={this.onPair}/>
            <PairChooser ref={ref => this.pairChooser = ref} tokenT={window.wethToken}/>
        </section>);
    }
});