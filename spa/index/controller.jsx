var IndexController = function (view) {
    var context = this;
    context.view = view;

    context.tryLoadDFO = async function tryLoadDFO(dFOAddress) {
        if (!isEthereumAddress(dFOAddress)) {
            throw "Insert a valid DFO Address";
        }
        var dFO = window.newContract(window.context.proxyAbi, dFOAddress);
        if (await window.blockchainCall(dFO.methods.getFunctionalitiesAmount) === 0) {
            return "This Address is not a DFO";
        }
        return dFO;
    };

    context.tryLoadStaking = async function tryLoadStaking() {
        if (!window.addressBarParams.staking) {
            return;
        }
        context.view.setState({
            optionalPage: {
                component: NoWeb3Loader
            }
        }, async function () {
            var stakingManager = window.newContract(window.context.StakeAbi, window.web3.utils.toChecksumAddress(window.addressBarParams.staking));
            delete window.addressBarParams.staking;
            var doubleProxy = window.newContract(window.context.DoubleProxyAbi, await window.blockchainCall(stakingManager.methods.doubleProxy));
            var element = {
                key: doubleProxy.options.address,
                dFO: await window.loadDFO(await window.blockchainCall(doubleProxy.methods.proxy)),
                startBlock: window.getNetworkElement('deploySearchStart')
            };
            await window.updateInfo(undefined, element);
            var blockTiers = {};
            Object.keys(window.context.blockTiers).splice(2, Object.keys(window.context.blockTiers).length).forEach(it => blockTiers[it] = window.context.blockTiers[it]);
            var props = {
                element,
                stakingData: await window.setStakingManagerData(stakingManager, blockTiers)
            };
            ReactModuleLoader.load({
                modules: ['spa/stake'],
                callback: function () {
                    context.view.setState({
                        optionalPage: {
                            component: window.Stake,
                            props
                        }
                    });
                }
            });
        });
    };
};