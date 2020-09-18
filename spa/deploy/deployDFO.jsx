var DeployDFO = React.createClass({
    requiredScripts: [
        'spa/sequentialOps.jsx'
    ],
    render() {
        var _this = this;
        return (
            <span>
                <SequentialOps ref={ref => this.sequentialOps = ref} initialContext={_this.props.allData} auto="true">
                    {[{
                        name: "Data Integrity Validation",
                        call(data) {
                            return new Promise(function (ok, ko) {
                                var errors = [];
                                !data.tokenName && errors.push('Insert a valid Token Name');
                                !data.tokenSymbol && errors.push('Insert a valid Token Symbol');
                                (isNaN(data.tokenTotalSupply) || data.tokenTotalSupply <= 0) && errors.push('Token Total Supply must be greater than 0');
                                !data.ensDomain && errors.push('ENS Domain is mandatory');
                                (isNaN(data.surveyLength) || data.surveyLength <= 0) && errors.push("Survey Length must be a number greater than 0");
                                (isNaN(data.emergencySurveyLength) || data.emergencySurveyLength <= 0) && errors.push("Emergency Survey Length must be a number greater than 0");
                                var availableSupply = parseFloat(window.fromDecimals(data.availableSupply, 18).split(',').join(''));
                                var calculateAvailableSupplyBasedField = function calculateAvailableSupplyBasedField(data, availableSupply, errors, fieldName, label, bypassCheck) {
                                    if (!data[fieldName + 'Check'] && !bypassCheck) {
                                        return;
                                    }
                                    var value = parseFloat(data[fieldName].split(',').join(''));
                                    var minCheck = bypassCheck ? value < 0 : value <= 0;
                                    (isNaN(value) || minCheck || value > availableSupply) && errors.push(`${label || _this[fieldName + 'Label'].innerHTML.split(':').join('')} must be a valid, positive number ${bypassCheck ? 'between 0 and' : 'less than'} ${window.formatMoney(availableSupply)}`);
                                };
                                calculateAvailableSupplyBasedField(data, availableSupply, errors, 'emergencySurveyStaking', "Penalty Fee", true);
                                calculateAvailableSupplyBasedField(data, availableSupply, errors, 'surveyQuorum', "Survey Quorum");
                                calculateAvailableSupplyBasedField(data, availableSupply, errors, 'surveyMaxCap', "Max Cap");
                                calculateAvailableSupplyBasedField(data, availableSupply, errors, 'surveyMinStake', "Min Staking");
                                calculateAvailableSupplyBasedField(data, availableSupply, errors, 'surveyCommunityStake', "DFO Locked Supply");
                                calculateAvailableSupplyBasedField(data, availableSupply, errors, 'surveySingleReward', "Activity Reward");
                                if (errors.length > 0) {
                                    return ko(errors);
                                }
                                return ok();
                            });
                        }
                    }, {
                        name: "Deploy Voting Token | " + _this.props.allData.tokenTotalSupply + " " + _this.props.allData.tokenSymbol,
                        call(data) {
                            var payload = window.web3.eth.abi.encodeParameters(['address', 'uint256', 'string', 'string', 'uint256', 'uint256'], [
                                window.voidEthereumAddress, 0,
                                data.tokenName,
                                data.tokenSymbol,
                                data.tokenTotalSupply,
                                data.surveyCommunityStake ? window.toDecimals(data.surveyCommunityStake, 18) : 0
                            ]);
                            return window.blockchainCall(window.dfoHub.dFO.methods.submit, 'deployVotingToken', payload).then(response => {
                                response = window.formatDFOLogs(response.events.Event, "DFOCollateralContractsCloned(address_indexed,address,address,address)").raw.data;
                                data.votingToken = response[0];
                                data.stateHolder = response[1];
                                data.functionaltyModelsManagerAddress = response[2];
                            });
                        },
                        onTransaction(data, transaction) {
                            return new Promise(function (ok) {
                                var response = window.formatDFOLogs(transaction.logs, "DFOCollateralContractsCloned(address_indexed,address,address,address)")[0].data;
                                data.votingToken = response[0];
                                data.stateHolder = response[1];
                                data.functionaltyModelsManagerAddress = response[2];
                                ok();
                            });
                        }
                    }, {
                        name: "Deploy Proposals Manager",
                        call: function (data) {
                            var payload = window.web3.eth.abi.encodeParameters(['address', 'uint256'], [window.voidEthereumAddress, 0]);
                            return window.blockchainCall(window.dfoHub.dFO.methods.submit, 'deployProposalsManager', payload).then(response => {
                                response = window.formatDFOLogs(response.events.Event, "DFOCollateralContractsCloned(address_indexed,address,address,address)").raw.data;
                                data.mvdFunctionalityProposalManagerAddress = response[0];
                                data.mvdWalletAddress = response[1];
                                data.doubleProxyAddress = response[2];
                            });
                        },
                        onTransaction(data, transaction) {
                            return new Promise(function (ok) {
                                var response = window.formatDFOLogs(transaction.logs, "DFOCollateralContractsCloned(address_indexed,address,address,address)")[0].data;
                                data.mvdFunctionalityProposalManagerAddress = response[0];
                                data.mvdWalletAddress = response[1];
                                data.doubleProxyAddress = response[2];
                                ok();
                            });
                        }
                    }, {
                        name: "Deploy Governance Rules",
                        call: function (data) {
                            var params = ['address', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256'];
                            var values = [
                                window.voidEthereumAddress,
                                0,
                                data.surveyLength,
                                data.emergencySurveyLength,
                                window.toDecimals(data.emergencySurveyStaking, 18),
                                data.surveyQuorum ? window.toDecimals(data.surveyQuorum, 18) : 0,
                                data.surveyMaxCap ? window.toDecimals(data.surveyMaxCap, 18) : 0,
                                data.surveyMinStake ? window.toDecimals(data.surveyMinStake, 18) : 0,
                                data.surveySingleReward ? window.toDecimals(data.surveySingleReward, 18) : 0
                            ];
                            var payload = window.web3.eth.abi.encodeParameters(params, values);
                            return window.blockchainCall(window.dfoHub.dFO.methods.submit, 'deployGovernanceRules', payload).then(response => {
                                data.functionalitiesManagerAddress = window.formatDFOLogs(response.events.Event, "DFOCollateralContractsCloned(address_indexed,address)").raw.data[0];
                            });
                        },
                        onTransaction(data, transaction) {
                            return new Promise(function (ok) {
                                ok(data.functionalitiesManagerAddress = window.formatDFOLogs(transaction.logs, "DFOCollateralContractsCloned(address_indexed,address)")[0].data[0]);
                            });
                        }
                    }, {
                        name: 'Deploy Metadata',
                        call : function(data) {
                            var metadata = {};
                            Object.entries(data.metadata).forEach(entry => metadata[entry[0]] = entry[1]);
                            return window.deployMetadataLink(metadata, data.functionalitiesManagerAddress);
                        }
                    }, {
                        name: "Deploy New DFO",
                        call: function (data) {
                            var payload = window.web3.eth.abi.encodeParameters(['address', 'uint256', 'address', 'address', 'address', 'address', 'address', 'address', 'address', 'string'], [
                                window.voidEthereumAddress,
                                0,
                                data.votingToken,
                                data.mvdFunctionalityProposalManagerAddress,
                                data.stateHolder,
                                data.functionaltyModelsManagerAddress,
                                data.functionalitiesManagerAddress,
                                data.mvdWalletAddress,
                                data.doubleProxyAddress,
                                data.ensDomain.toLowerCase()
                            ]);
                            return window.blockchainCall(window.dfoHub.dFO.methods.submit, 'deployDFO', payload).then(response => {
                                data.response = window.formatDFOLogs(response.events.Event, "DFODeployed(address_indexed,address_indexed,address,address)").raw.data[0];
                            }).then(() => _this.emit("dfo/deploy", window.newContract(window.context.proxyAbi, data.response)));
                        },
                        actionName: "Deploy"
                    }]}
                </SequentialOps>
            </span>
        );
    }
});