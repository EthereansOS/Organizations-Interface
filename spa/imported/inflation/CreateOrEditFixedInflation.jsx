import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import CreateOrEditFixedInflationEntry from './CreateOrEditFixedInflationEntry';
import Loading from '../../../../components/shared/Loading';
import ContractEditor from '../../../../components/editor/ContractEditor';

const CreateOrEditFixedInflation = (props) => {

    var fixedInflationFactory = window.newContract(props.dfoCore.getContextElement("FixedInflationFactoryABI"), props.dfoCore.getContextElement("fixedInflationFactoryAddress"));
    var dfoHubBasedFixedInflationExtensionFactory = window.newContract(props.dfoCore.getContextElement("DFOBasedFixedInflationExtensionFactoryABI"), props.dfoCore.getContextElement("dFOBasedFixedInflationExtensionFactory"));

    const [step, setStep] = useState(NaN);
    const [entry, setEntry] = useState(null);
    const [deploying, setDeploying] = useState(false);
    const [extensionType, setExtensionType] = useState("wallet");
    const [walletAddress, setWalletAddress] = useState("");
    const [code, setCode] = useState("");
    const [payload, setPayload] = useState("");
    const [extensionAddress, setExtensionAddress] = useState("");
    const [deployMessage, setDeployMessage] = useState("");
    const [fixedInflationAddress, setFixedInflationAddress] = useState("");
    const [notFirstTime, setNotFirstTime] = useState(false);

    useEffect(async function componentDidMount() {
        if (!entry && !props.fixedInflationContractAddress) {
            return setEntry({
                name: '',
                operations: []
            });
        }
        var fixedInflationContract = await props.dfoCore.getContract(props.dfoCore.getContextElement('FixedInflationABI'), props.fixedInflationContractAddress);
        setExtensionAddress(await fixedInflationContract.methods.extension().call());
        var entry = await fixedInflationContract.methods.entry().call();
        var clonedEntry = {};
        Object.entries(entry[0]).forEach(it => clonedEntry[it[0]] = it[1]);
        (clonedEntry.callerRewardPercentage = window.numberToString(parseFloat(window.fromDecimals(clonedEntry.callerRewardPercentage, 18, true)) * 100));
        clonedEntry.operations = [];
        for (var operation of entry[1]) {
            var op = {};
            Object.entries(operation).forEach(it => op[it[0]] = it[1]);
            var inputTokenDecimals = '18';
            var inputTokenSymbol = 'ETH';
            try {
                var inputTokenContract = window.newContract(window.context.votingTokenAbi, op.inputTokenAddress);
                inputTokenDecimals = await window.blockchainCall(inputTokenContract.methods.decimals);
                inputTokenSymbol = await window.blockchainCall(inputTokenContract.methods.symbol);
            } catch (e) {
            }
            op.inputToken = { address: op.inputTokenAddress, symbol: inputTokenSymbol, decimals: inputTokenDecimals };
            op.actionType = op.ammPlugin === window.voidEthereumAddress ? 'transfer' : 'swap';
            op.inputTokenMethod = op.inputTokenAmountIsByMint ? 'mint' : 'reserve';
            op.transferType = op.inputTokenAmountIsPercentage ? 'percentage' : 'amount';
            !op.inputTokenAmountIsPercentage && (op.amount = window.fromDecimals(op.inputTokenAmount, inputTokenDecimals, true));
            op.inputTokenAmountIsPercentage && (op.percentage = window.numberToString(parseFloat(window.fromDecimals(op.inputTokenAmount, 18, true)) * 100));
            if (op.ammPlugin && op.ammPlugin !== window.voidEthereumAddress) {
                const ammAggregator = await props.dfoCore.getContract(props.dfoCore.getContextElement('AMMAggregatorABI'), props.dfoCore.getContextElement('ammAggregatorAddress'));
                const ammContract = await props.dfoCore.getContract(props.dfoCore.getContextElement("AMMABI"), op.ammPlugin);
                const ammData = await ammContract.methods.data().call();
                const ethAddress = ammData[0];
                op.amm = { ammAggregator, ammContract, ammData, ethAddress };
                op.pathTokens = [];
                for (var i in op.liquidityPoolAddresses) {
                    var address = op.liquidityPoolAddresses[i];
                    op.amm.info = op.amm.info || await ammAggregator.methods.info(address).call();
                    const lpInfo = await ammContract.methods.byLiquidityPool(address).call();
                    const lpTokensAddresses = lpInfo[2];
                    const symbols = [];
                    let outputTokenAddress = op.swapPath[i];
                    for (let i = 0; i < lpTokensAddresses.length; i++) {
                        const currentTokenAddress = lpTokensAddresses[i];
                        if (currentTokenAddress !== window.voidEthereumAddress) {
                            const currentToken = await props.dfoCore.getContract(props.dfoCore.getContextElement('ERC20ABI'), currentTokenAddress);
                            const currentTokenSymbol = await currentToken.methods.symbol().call();
                            symbols.push(currentTokenSymbol);
                        }
                        ethAddress === currentTokenAddress && (symbols[symbols.length - 1] = `ETH (${symbols[symbols.length - 1]})`);
                    }
                    const pathTokenContract = await props.dfoCore.getContract(props.dfoCore.getContextElement('ERC20ABI'), address);
                    const symbol = await pathTokenContract.methods.symbol().call();
                    const decimals = await pathTokenContract.methods.decimals().call();
                    op.pathTokens.push({ symbol, address, decimals, output: null, outputTokenAddress, lpTokensAddresses, symbols });
                }
            }
            op.oldReceivers = op.receivers;
            op.receivers = [];
            var lastPercentage = 100;
            for (i in op.oldReceivers) {
                var address = op.oldReceivers[i = parseInt(i)];
                var percentage = 0;
                i !== op.oldReceivers.length - 1 && (percentage = window.numberToString(parseFloat(window.fromDecimals(op.receiversPercentages[i], 18, true)) * 100));
                lastPercentage -= percentage;
                op.receivers.push({
                    address,
                    percentage: i !== op.oldReceivers.length - 1 ? percentage : lastPercentage
                });
            }
            clonedEntry.operations.push(op);
        }
        setEntry(clonedEntry);
    }, []);

    function onExtensionType(e) {
        setWalletAddress("");
        setCode("");
        setExtensionType(e.currentTarget.value);
    }

    function creationComplete(newEntry) {
        setEntry(newEntry);
        setStep(0);
    }

    function elaborateEntry(entry) {
        var elaboratedEntry = {
            id: window.web3.utils.sha3('0'),
            name: entry.name,
            lastBlock: entry.lastBlock,
            blockInterval: entry.blockInterval,
            callerRewardPercentage: window.toDecimals(window.numberToString((entry.callerRewardPercentage || 0) / 100), 18),
            operations: entry.operations.map(operation => {
                var receivers = operation.receivers.map(it => it.address);
                var receiversPercentages = operation.receivers.map(it => window.toDecimals(window.numberToString(it.percentage / 100), 18));
                receiversPercentages.pop();
                return {
                    inputTokenAddress: operation.enterInETH && operation.amm ? operation.amm.ethAddress : operation.inputToken.address,
                    inputTokenAmount: window.toDecimals(window.numberToString(operation.transferType === 'percentage' ? (parseFloat(operation.percentage) / 100) : operation.amount), operation.transferType === 'percentage' ? "18" : operation.inputToken.decimals),
                    inputTokenAmountIsPercentage: operation.transferType === 'percentage',
                    inputTokenAmountIsByMint: operation.inputTokenMethod === 'mint',
                    ammPlugin: operation.amm ? operation.amm.ammContract.options.address : window.voidEthereumAddress,
                    liquidityPoolAddresses: operation.pathTokens ? operation.pathTokens.map(it => it.address) : [],
                    swapPath: operation.pathTokens ? operation.pathTokens.map(it => it.outputTokenAddress) : [],
                    receivers: receivers,
                    receiversPercentages: receiversPercentages,
                    enterInETH: (operation.enterInETH && operation.amm !== undefined && operation.amm !== null) || false,
                    exitInETH: operation.exitInETH || false
                }
            })
        };
        console.log(JSON.stringify(elaboratedEntry));
        return elaboratedEntry;
    }

    var deployMethodologies = {
        async wallet() {
            setDeployMessage("1/3 - Deploying Extension...");
            var sendingOptions = { from: props.dfoCore.address };
            var method = fixedInflationFactory.methods.cloneFixedInflationDefaultExtension();
            var gasLimit = await method.estimateGas(sendingOptions);
            sendingOptions.gasLimit = gasLimit;
            var transaction = await method.send(sendingOptions);
            var receipt = await window.web3.eth.getTransactionReceipt(transaction.transactionHash);
            var fixedInflationExtensionAddress = window.web3.eth.abi.decodeParameter("address", receipt.logs.filter(it => it.topics[0] === window.web3.utils.sha3('ExtensionCloned(address)'))[0].topics[1]);

            setExtensionType("deployedContract");
            setExtensionAddress(fixedInflationExtensionAddress);

            var payload = window.web3.utils.sha3("init(address)").substring(0, 10);
            payload += window.web3.eth.abi.encodeParameter("address", walletAddress).substring(2);
            setPayload(payload);

            await deployMethodologies.deployedContract(fixedInflationExtensionAddress, payload);
        },
        async deployedContract(preDeployedContract, builtPayload) {
            setDeployMessage(`${preDeployedContract ? "2/3" : "1/2"} - Deploying Liqudity Mining Contract...`);
            var elaboratedEntry = elaborateEntry(entry);

            var data = window.newContract(props.dfoCore.getContextElement("FixedInflationABI")).methods.init(
                preDeployedContract || extensionAddress,
                builtPayload || payload || "0x",
                elaboratedEntry,
                elaboratedEntry.operations
            ).encodeABI();

            var sendingOptions = { from: props.dfoCore.address };
            var method = fixedInflationFactory.methods.deploy(data);
            var gasLimit = await method.estimateGas(sendingOptions);
            sendingOptions.gasLimit = gasLimit;
            var transaction = await method.send(sendingOptions);
            var receipt = await window.web3.eth.getTransactionReceipt(transaction.transactionHash);
            var fixedInflationAddress = window.web3.eth.abi.decodeParameter("address", receipt.logs.filter(it => it.topics[0] === window.web3.utils.sha3('FixedInflationDeployed(address,address,bytes)'))[0].topics[1]);

            setDeployMessage(`${preDeployedContract ? "3/3" : "2/2"} - Enabling Extension...`);

            var extension = await props.dfoCore.getContract(props.dfoCore.getContextElement("FixedInflationExtensionABI"), preDeployedContract || extensionAddress);

            sendingOptions = { from: props.dfoCore.address };
            method = extension.methods.setActive(true);
            gasLimit = await method.estimateGas(sendingOptions);
            sendingOptions.gasLimit = gasLimit;
            transaction = await method.send(sendingOptions);

            setFixedInflationAddress(fixedInflationAddress);
        }
    }

    function setDeployContract(contract, payload) {
        console.log(contract, payload);
    }

    var steps = [
        [
            function () {
                return <>
                    <div className="row">
                        <div className="col-12">
                            <h6>Host</h6>
                            <p></p>
                            <select className="custom-select wusd-pair-select" value={extensionType} onChange={onExtensionType}>
                                <option value="wallet">Wallet</option>
                                <option value="deployedContract">Deployed Contract</option>
                                {/*<option value="fromSourceCode">From Source Code</option>*/}
                            </select>
                        </div>
                        {(extensionType === 'wallet' || extensionType === 'deployedContract') && <div className="row">
                            <div className="col-12">
                                {extensionType === 'wallet' && <input type="text" placeholder="Host address" defaultValue={walletAddress} onKeyUp={e => setWalletAddress(window.isEthereumAddress(e.currentTarget.value) ? e.currentTarget.value : "")} />}
                                {extensionType === 'deployedContract' && <input type="text" placeholder="Insert extension address" defaultValue={extensionAddress} onKeyUp={e => setExtensionAddress(window.isEthereumAddress(e.currentTarget.value) ? e.currentTarget.value : "")} />}
                            </div>
                        </div>}
                        {extensionType === 'fromSourceCode' && <ContractEditor dfoCore={props.dfoCore} onFinish={setDeployContract} />}
                        {extensionType !== 'wallet' && <div className="row">
                            <div className="col-12">
                                <input placeholder="Optional init payload" type="text" defaultValue={payload} onKeyUp={e => setPayload(e.currentTarget.value)} />
                            </div>
                        </div>}
                    </div>
                </>
            },
            function () {
                return !(extensionType === 'wallet' ? walletAddress && walletAddress !== window.voidEthereumAddress : extensionType === 'deployedContract' ? extensionAddress : code)
            }]
    ];

    /*async function deploy() {
        setDeploying(true);
        setDeployMessage("");
        var error;
        try {
            await deployMethodologies[extensionType]();
        } catch (e) {
            error = e;
        }
        setDeploying(false);
        setDeployMessage("");
        error && alert(`Error: ${error.message}`);
    }*/

    function back() {
        var newStep = step === 0 ? NaN : step - 1;
        setNotFirstTime(isNaN(newStep));
        setStep(newStep);
    }

    function copy(entry) {
        var copy = {
        };
        for (var key of Object.keys(entry)) {
            copy[key] = entry[key];
        }
        copy.operations = [];
        for (var operation of entry.operations) {
            var operationCopy = {};
            Object.entries(operation).forEach(it => operationCopy[it[0]] = it[1]);
            copy.operations.push(operationCopy);
        }
        return copy;
    }

    function saveEntry(entryName, lastBlock, blockInterval, callerRewardPercentage, operations) {
        var newEntry = {
            name: entryName,
            lastBlock,
            blockInterval,
            callerRewardPercentage,
            operations
        };
        setEntry(newEntry);
        deploy(newEntry);
    }

    async function deploy(entry) {
        var sequentialOps = [{
            name: "Generate SmartContract Proposal",
            async call(data) {
                data.selectedSolidityVersion = (await window.SolidityUtilities.getCompilers()).releases['0.7.6'];
                data.bypassFunctionalitySourceId = true;
                data.contractName = 'ProposalCode';

                data.functionalityMethodSignature = 'callOneTime(address)';

                var fileName = 'FixedInflationSetEntry';
                var newEntries = [elaborateEntry(data.entry)];

                var entryCode = `FixedInflationEntry("${newEntries[0].name}", ${newEntries[0].blockInterval}, ${newEntries[0].lastBlock || 0}, ${newEntries[0].callerRewardPercentage})`;
                var operations = "";
                var functions = "";

                for (var i in newEntries) {
                    var entry = newEntries[i];
                    var operationSetsIndex = `operationSets_${i}`;
                    var line = "";
                    for (var j in entry.operations) {
                        var operation = entry.operations[j];
                        line += `\n        operationSets[${j}] = _${operationSetsIndex}_${j}();`
                    }
                    operations += "        " + line + "\n";
                }
                for (var i in newEntries) {
                    for (var j in newEntries[i].operations) {
                        var operation = newEntries[i].operations[j];
                        var line = `    function _operationSets_${i}_${j}() private view returns(FixedInflationOperation memory) {`
                        line += `\n        address[] memory liquidityPoolAddresses_${i}_${j} = new address[](${operation.liquidityPoolAddresses.length});`
                        for (var z in operation.liquidityPoolAddresses) {
                            line += `\n        liquidityPoolAddresses_${i}_${j}[${z}] = ${web3.utils.toChecksumAddress(operation.liquidityPoolAddresses[z])};`;
                        }
                        line += `\n        address[] memory swapPath_${i}_${j} = new address[](${operation.swapPath.length});`
                        for (var z in operation.swapPath) {
                            line += `\n        swapPath_${i}_${j}[${z}] = ${web3.utils.toChecksumAddress(operation.swapPath[z])};`;
                        }
                        line += `\n        address[] memory receivers_${i}_${j} = new address[](${operation.receivers.length});`
                        for (var z in operation.receivers) {
                            line += `\n        receivers_${i}_${j}[${z}] = ${web3.utils.toChecksumAddress(operation.receivers[z])};`;
                        }
                        line += `\n        uint256[] memory receiversPercentages_${i}_${j} = new uint256[](${operation.receiversPercentages.length});`
                        for (var z in operation.receiversPercentages) {
                            line += `\n        receiversPercentages_${i}_${j}[${z}] = ${operation.receiversPercentages[z]};`;
                        }
                        line += `\n        return FixedInflationOperation(${web3.utils.toChecksumAddress(operation.inputTokenAddress)}, ${operation.inputTokenAmount}, ${operation.inputTokenAmountIsPercentage}, ${operation.inputTokenAmountIsByMint}, ${operation.ammPlugin}, liquidityPoolAddresses_${i}_${j}, swapPath_${i}_${j}, ${operation.enterInETH}, ${operation.exitInETH}, receivers_${i}_${j}, receiversPercentages_${i}_${j});`
                        functions += line + "\n    }\n\n";
                    }
                }
                data.sourceCode = (await (await fetch(`data/${fileName}.sol`)).text()).format(extensionAddress, entryCode.trim(), newEntries[0].operations.length, operations.trim(), functions.trim());
                console.log(data.sourceCode);
            }
        }];
        sequentialOps = props.fixedInflationContractAddress ? sequentialOps : [{
            name: "Clone Extension",
            description: "Fixed Inflation Extension will comunicate with the DFO for Token and ETH transmission to the Fixed Inflation Contract",
            async call(data) {
                var transaction = await window.blockchainCall(dfoHubBasedFixedInflationExtensionFactory.methods.cloneModel);
                var receipt = await window.web3.eth.getTransactionReceipt(transaction.transactionHash);
                data.extensionAddress = window.web3.eth.abi.decodeParameter("address", receipt.logs.filter(it => it.topics[0] === window.web3.utils.sha3('ExtensionCloned(address,address)'))[0].topics[1]);
            },
            onTransaction(data, transaction) {
                data.extensionAddress = window.web3.eth.abi.decodeParameter("address", transaction.logs.filter(it => it.topics[0] === window.web3.utils.sha3('ExtensionCloned(address,address)'))[0].topics[1]);
            }
        }, {
            name: "Deploy Fixed Inflation Contract",
            description: 'New Fixed Inflation Contract will be deployed.',
            async call(data) {
                data.elaboratedEntry = elaborateEntry(data.entry);
                var deployPayload = window.newContract(props.dfoCore.getContextElement("FixedInflationABI")).methods.init(
                    data.extensionAddress,
                    window.web3.utils.sha3("init(address)").substring(0, 10) + window.web3.eth.abi.encodeParameter("address", data.element.doubleProxyAddress).substring(2),
                    data.elaboratedEntry,
                    data.elaboratedEntry.operations
                ).encodeABI();
                var transaction = await window.blockchainCall(fixedInflationFactory.methods.deploy, deployPayload);
                var receipt = await window.web3.eth.getTransactionReceipt(transaction.transactionHash);
                data.fixedInflationAddress = window.web3.eth.abi.decodeParameter("address", receipt.logs.filter(it => it.topics[0] === window.web3.utils.sha3('FixedInflationDeployed(address,address,bytes)'))[0].topics[1]);
            },
            async onTransaction(data, transaction) {
                data.fixedInflationAddress = window.web3.eth.abi.decodeParameter("address", transaction.logs.filter(it => it.topics[0] === window.web3.utils.sha3('FixedInflationDeployed(address,address,bytes)'))[0].topics[1]);
            }
        }, {
            name: "Generate SmartContract Proposal",
            async call(data) {
                data.selectedSolidityVersion = (await window.SolidityUtilities.getCompilers()).releases['0.7.6'];
                data.bypassFunctionalitySourceId = true;
                data.contractName = 'ProposalCode';
                var fileName = "NewFixedInflationExtension";

                data.functionalityMethodSignature = 'callOneTime(address)';
                if (JSON.parse(await window.blockchainCall(data.element.functionalitiesManager.methods.functionalityNames)).filter(it => it === 'manageFixedInflation').length === 0) {
                    fileName = "ManageFixedInflationFunctionality";
                    data.functionalityMethodSignature = 'manageFixedInflation(address,uint256,address[],uint256[],uint256[],address)';
                    data.functionalityName = 'manageFixedInflation';
                    data.functionalitySubmitable = true;
                    data.functionalityNeedsSender = true;
                }
                data.sourceCode = (await (await fetch(`data/${fileName}.sol`)).text()).format(window.web3.utils.toChecksumAddress(data.extensionAddress));

                console.log(data.sourceCode);
            }
        }];

        var context = {
            element: props.element,
            sequentialOps,
            entry,
            sourceCode: 'test',
            title: (!props.fixedInflationContractAddress ? 'New' : 'Edit') + ' Fixed Inflation'
        };
        window.showProposalLoader(context);
    };

    function render() {
        return <>
            <div className="row">
                <div className="col-12">
                    <h6>Deploy</h6>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    {steps[step][0]()}
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <button disabled={deploying} onClick={back} className="btn btn-light">Back</button>
                    {step !== steps.length - 1 && <button disabled={steps[step][1]()} onClick={() => setStep(step + 1)} className="btn btn-primary">Next</button>}
                    {step === steps.length - 1 && (deploying ? <Loading /> : <button disabled={steps[step][1]()} onClick={deploy} className="btn btn-primary">Deploy</button>)}
                    {deployMessage && <span>{deployMessage}</span>}
                </div>
            </div>
        </>
    }

    function success() {
        return <>
            <div className="row">
                <div className="col-12">
                    <h6>Success!</h6>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <a target="_blank" href={`${props.dfoCore.getContextElement("etherscanURL")}/address/${fixedInflationAddress}`}>{fixedInflationAddress}</a>
                </div>
            </div>
        </>
    }

    return (
        !entry ? <Loading /> :
            fixedInflationAddress ? success() :
                isNaN(step) ? <CreateOrEditFixedInflationEntry entry={copy(entry)} continue={creationComplete} saveEntry={saveEntry} cancelEdit={props.cancelEdit} notFirstTime={notFirstTime} /> :
                    render()
    );
}

const mapStateToProps = (state) => {
    return { dfoCore: state.core.dfoCore };
}

export default connect(mapStateToProps)(CreateOrEditFixedInflation);