ImportReact({
    name : 'StakingEdit',
    requiredScripts : [
        'spa/imported/shared/Input.jsx',
        'spa/imported/shared/Coin.jsx',
        'spa/imported/shared/TokenInput.jsx',
        'spa/imported/farm/Create.jsx',
        'spa/imported/farm/Explore.jsx',
        'spa/imported/farm/ExploreFarmingContract.jsx',
        'spa/imported/farm/FarmingComponent.jsx',
        'spa/imported/farm/Hosted.jsx',
        'spa/imported/farm/Positions.jsx',
        'spa/imported/farm/SetupComponent.jsx'
    ],
    getInitialState() {
        var _this = this;
        return {
            farmingContract : null,
            farmingSetups : [],
            creationStep : 0,
            setFarmingContractStep(creationStep) {
                _this.setState({creationStep});
            },
            updateFarmingContract(farmingContract) {
                _this.setState({farmingContract});
            },
            addFarmingSetup(farmingSetup) {
                var farmingSetups = _this.state.farmingSetups.map(it => it);
                farmingSetups.push(farmingSetup);
                _this.setState({farmingSetups});
            },
            removeFarmingSetup(index) {
                var farmingSetups = _this.state.farmingSetups.map(it => it);
                farmingSetups.splice(index, 1);
                _this.setState({farmingSetups});
            }
        }
    },
    className : 'DappBox',
    render : 'Create'
});