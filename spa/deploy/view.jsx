var Deploy = React.createClass({
    requiredScripts: [
        'spa/deploy/subdomain.jsx',
        'spa/deploy/dFOMetadata.jsx',
        'spa/deploy/votingTokenData.jsx',
        'spa/deploy/governanceRulesData.jsx',
        'spa/deploy/deployDFO.jsx'
    ],
    steps: [
        'Subdomain',
        'DFOMetadata',
        'VotingTokenData',
        'GovernanceRulesData',
        'DeployDFO'
    ],
    getInitialState() {
        return {
            step: 0
        }
    },
    deploy(e) {
        this.currentElement.sequentialOps.go(e);
    },
    render() {
        this.data = this.data || this.steps.map(() => {});
        return (
            <section className="Nav">
                <div className="NavAll">
                    <div className="NavDeploy">
                        <h2>Incorporate a new <b>Decentralized Flexible Organization</b></h2>
                        {React.createElement(window[this.steps[this.state.step]], { allData: (this.state && this.state.allData) || {}, data: this.data[this.state.step], ref: ref => (this.currentElement = ref) && window.setData(this.currentElement.domRoot, this.data[this.state.step]) })}
                        <div className="DeployActions">
                            {this.state.step !== 0 && <a className="DeployNextPrev DeployOLNYPrev" href="javascript:;" onClick={this.controller.back}>Back</a>}
                            {this.state.step < (this.steps.length - 1) && <a className="DeployNextPrev" href="javascript:;" onClick={this.controller.next}>Next</a>}
                        </div>
                    </div>
                </div>
            </section>
        );
    }
});