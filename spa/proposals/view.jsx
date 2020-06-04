var Proposals = React.createClass({
    requiredModules: [
        'spa/proposal'
    ],
    requiredScripts: [
        'spa/loaderMini.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            'surveys/refresh': () => this.controller.loadSurveys(this.props.element, this.state.surveys, this.state.terminatedSurveys),
            'toggle': toggle => this.setState({toggle}),
        };
    },
    componentDidMount() {
        this.mountDate = new Date().getTime() + "_" + Math.random();
        this.controller.loadSurveys();
    },
    componentWillUnmount() {
        delete this.controller.loading;
        delete this.mountDate;
    },
    sortSurveys(surveys) {
        return Object.values(surveys).sort((first, second) => {;
            var a = parseInt(first.key.substring(0, first.key.indexOf("_")));
            var b = second ? parseInt(second.key.substring(0, second.key.indexOf("_"))) : 0;
            return a < b ? 1 : a > b ? -1 : 0;
        });
    },
    render() {
        var _this = this;
        return (
            <section className="ProposalsIndex">
                <section className="ProposalsActiveIndex">
                    <h2>Active Proposals</h2>
                    {_this.state && _this.state.surveys && Object.keys(_this.state.surveys).length === 0 && <span>No active proposals right now</span>}
                    <ul>
                        {_this.state && _this.state.surveys && _this.sortSurveys(_this.state.surveys).map(it => <li key={it.key}>
                            <Proposal toggle={_this.state.toggle} newController={true} element={_this.props.element} survey={it} myBalance={_this.state.myBalance} currentBlock={_this.state.currentBlock}/>
                        </li>)}
                    </ul>
                    {(!_this.controller || _this.controller.loading) && <LoaderMini message="Loading Active Proposals"/>}
                </section>
                <section className="ProposalsOldIndex">
                    <h2>Proposals History</h2>
                    {_this.state && _this.state.terminatedSurveys && Object.keys(_this.state.terminatedSurveys).length === 0 && <span>No Proposal History right now</span>}
                    <ul>
                        {_this.state && _this.state.terminatedSurveys && _this.sortSurveys(_this.state.terminatedSurveys).map(it => <li key={it.key}>
                            <Proposal toggle={_this.state.toggle} newController={true} element={_this.props.element} survey={it} myBalance={_this.state.myBalance} currentBlock={_this.state.currentBlock}/>
                        </li>)}
                    </ul>
                    {(!_this.controller || _this.controller.loading) && <LoaderMini message="Loading Proposals History"/>}
                </section>
            </section>
        );
    }
});