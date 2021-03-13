import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Coin, Input, TokenInput } from '../../../../components/shared';
import { setFarmingContractStep, updateFarmingContract, addFarmingSetup, removeFarmingSetup  } from '../../../../store/actions';
import { ethers } from "ethers";
import ContractEditor from '../../../../components/editor/ContractEditor';
import CreateOrEditFarmingSetups from './CreateOrEditFarmingSetups';
import FarmingExtensionTemplateLocation from '../../../../data/FarmingExtensionTemplate.sol';
import { useParams } from 'react-router';

const abi = new ethers.utils.AbiCoder();

const Create = (props) => {

    const { address } = useParams();
    const { inputRewardToken } = props;
    // utils
    const [loading, setLoading] = useState(false);
    const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
    // booleans
    const [isDeploy, setIsDeploy] = useState(false);
    // reward token
    const [selectedRewardToken, setSelectedRewardToken] = useState(inputRewardToken || null);
    const [byMint, setByMint] = useState(false);
    // setups
    const [farmingSetups, setFarmingSetups] = useState([]);
    // deploy data
    const [treasuryAddress, setTreasuryAddress] = useState(null);
    const [hostWalletAddress, setHostWalletAddress] = useState(null);
    const [hostDeployedContract, setHostDeployedContract] = useState(null);
    const [deployContract, setDeployContract] = useState(null);
    const [useDeployedContract, setUseDeployedContract] = useState(false);
    const [extensionPayload, setExtensionPayload] = useState("");
    const [selectedHost, setSelectedHost] = useState("");
    const [deployLoading, setDeployLoading] = useState(false);
    const [deployStep, setDeployStep] = useState(0);
    const [deployData, setDeployData] = useState(null);
    const [farmingExtensionTemplateCode, setFarmingExtensionTemplateCode] = useState("");

    useEffect(async () => {
        //setFarmingExtensionTemplateCode(await (await fetch(FarmingExtensionTemplateLocation)).text());
        if (props.farmingContract?.rewardToken) {
            setSelectedRewardToken(props.farmingContract.rewardToken);
        } else if (address) {
            onSelectRewardToken(address);
        }
        if (currentBlockNumber === 0) {
            props.dfoCore.getBlockNumber().then((blockNumber) => {
                setCurrentBlockNumber(blockNumber);
            });
        }
    }, []);

    const addFarmingSetup = (setup) => {
        setFarmingSetups(farmingSetups.concat(setup));
    }

    const editFarmingSetup = (setup, index) => {
        const updatedSetups = farmingSetups.map((s, i) => {
            return i !== index ? s : setup;
        })
        setFarmingSetups(updatedSetups);
    }

    const removeFarmingSetup = (i) => {
        const updatedSetups = farmingSetups.filter((_, index) => index !== i);
        setFarmingSetups(updatedSetups);
    }

    const onSelectRewardToken = async (address) => {
        setLoading(true);
        const rewardToken = await props.dfoCore.getContract(props.dfoCore.getContextElement('ERC20ABI'), address);
        const symbol = await rewardToken.methods.symbol().call();
        setSelectedRewardToken({ symbol, address });
        setLoading(false);
    }

    const initializeDeployData = async () => {
        setDeployLoading(true);
        try {
            const host = selectedHost === 'wallet' ? hostWalletAddress : hostDeployedContract;
            const hasExtension = (selectedHost === "deployed-contract" && hostDeployedContract && !deployContract);
            const data = { setups: [], rewardTokenAddress: selectedRewardToken.address, byMint, deployContract, host, hasExtension, extensionInitData: extensionPayload || '' };
            const ammAggregator = await props.dfoCore.getContract(props.dfoCore.getContextElement('AMMAggregatorABI'), props.dfoCore.getContextElement('ammAggregatorAddress'));
            for (let i = 0; i < farmingSetups.length; i++) {
                const setup = farmingSetups[i];
                const isFree = !setup.maxLiquidity;
                const result = await ammAggregator.methods.findByLiquidityPool(isFree ? setup.data.address : setup.secondaryToken.address).call();
                const { amm } = result;

                const parsedSetup = 
                [
                    isFree,
                    parseInt(setup.period),
                    props.dfoCore.fromDecimals(setup.rewardPerBlock),
                    props.dfoCore.fromDecimals(setup.minStakeable),
                    !isFree ? props.dfoCore.fromDecimals(setup.maxLiquidity) : 0,
                    setup.renewTimes,
                    amm,
                    isFree ? setup.data.address : setup.secondaryToken.address,
                    result[2][0],
                    props.dfoCore.voidEthereumAddress,
                    setup.involvingEth,
                    isFree ? 0 : props.dfoCore.fromDecimals(parseFloat(parseFloat(setup.penaltyFee) / 100).toString()),
                    0,
                    0
                ];
                data.setups.push(parsedSetup)
            }
            console.log(data);
            setDeployData(data);
            return data;
        } catch (error) {
            console.error(error);
            setDeployData(null);
        } finally {
            setDeployLoading(false);
        }
    }

    async function deployDFO(entry) {
        var farmingData = await initializeDeployData();
        const encodedSetups = abi.encode(["tuple(bool,uint256,uint256,uint256,uint256,uint256,address,address,address,address,bool,uint256,uint256,uint256)[]"], [farmingData.setups]);
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
        sequentialOps = props.farmContractAddress ? sequentialOps : [{
            name: "Clone Extension",
            description: "Farm Extension will comunicate with the DFO for Token and ETH transmission to the Farming Contract Contract",
            async call(data) {
                var transaction = await window.blockchainCall(dfoBasedFarmExtensionFactory.methods.cloneModel);
                var receipt = await window.web3.eth.getTransactionReceipt(transaction.transactionHash);
                data.extensionAddress = window.web3.eth.abi.decodeParameter("address", receipt.logs.filter(it => it.topics[0] === window.web3.utils.sha3('ExtensionCloned(address,address)'))[0].topics[1]);
            },
            onTransaction(data, transaction) {
                data.extensionAddress = window.web3.eth.abi.decodeParameter("address", transaction.logs.filter(it => it.topics[0] === window.web3.utils.sha3('ExtensionCloned(address,address)'))[0].topics[1]);
            }
        }, {
            name: "Deploy Farm Contract",
            description: 'New Farm Contract will be deployed.',
            async call(data) {
                var deployPayload = window.newContract(props.dfoCore.getContextElement("FarmMainABI")).methods.init(
                    data.extensionAddress,
                    window.web3.utils.sha3("init(bool,address,address)").substring(0, 10) + window.web3.eth.abi.encodeParameters(["bool", "address", "address"], [farmingData.byMint, data.element.doubleProxyAddress, window.voidEthereumAddress]).substring(2),
                    window.getNetworkElement("ethItemOrchestratorAddress"),
                    farmingData.rewardTokenAddress,
                    encodedSetups
                ).encodeABI();
                var transaction = await window.blockchainCall(farmFactory.methods.deploy, deployPayload);
                var receipt = await window.web3.eth.getTransactionReceipt(transaction.transactionHash);
                data.farmAddress = window.web3.eth.abi.decodeParameter("address", receipt.logs.filter(it => it.topics[0] === window.web3.utils.sha3('FarmMainDeployed(address,address,bytes)'))[0].topics[1]);
            },
            async onTransaction(data, transaction) {
                data.farmAddress = window.web3.eth.abi.decodeParameter("address", transaction.logs.filter(it => it.topics[0] === window.web3.utils.sha3('FarmMainDeployed(address,address,bytes)'))[0].topics[1]);
            }
        }, {
            name: "Generate SmartContract Proposal",
            async call(data) {
                data.selectedSolidityVersion = (await window.SolidityUtilities.getCompilers()).releases['0.7.6'];
                data.bypassFunctionalitySourceId = true;
                data.contractName = 'ProposalCode';
                var fileName = "NewFarmingExtension";

                data.functionalityMethodSignature = 'callOneTime(address)';
                if (JSON.parse(await window.blockchainCall(data.element.functionalitiesManager.methods.functionalityNames)).filter(it => it === 'manageFarming').length === 0) {
                    fileName = "ManageFarmingFunctionality";
                    data.functionalityMethodSignature = 'manageFarming(address,uint256,bool,address,address,uint256,bool)';
                    data.functionalityName = 'manageFarming';
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
            title: (!props.fixedInflationContractAddress ? 'New' : 'Edit') + ' Farming'
        };
        window.showProposalLoader(context);
    };

    const deploy = async () => {
        let error = false;
        let deployTransaction = null;
        setDeployLoading(true);
        try {
            const { setups, rewardTokenAddress, extensionAddress, extensionInitData } = deployData;
            const factoryAddress = props.dfoCore.getContextElement("farmFactoryAddress");
            const farmFactory = await props.dfoCore.getContract(props.dfoCore.getContextElement("FarmFactoryABI"), factoryAddress);
            const types = [
                "address",
                "bytes",
                "address",
                "address",
                "bytes",
            ];
            console.log(deployData);
            const encodedSetups = abi.encode(["tuple(bool,uint256,uint256,uint256,uint256,uint256,address,address,address,address,bool,uint256,uint256,uint256)[]"], [setups]);
            const params = [extensionAddress ? extensionAddress : hostDeployedContract, extensionPayload || extensionInitData || "0x", props.dfoCore.getContextElement("ethItemOrchestratorAddress"), rewardTokenAddress, encodedSetups || 0];
            console.log(params)
            console.log(extensionInitData);
            console.log(extensionPayload);
            console.log(extensionAddress);
            const payload = props.dfoCore.web3.utils.sha3(`init(${types.join(',')})`).substring(0, 10) + (props.dfoCore.web3.eth.abi.encodeParameters(types, params).substring(2));
            console.log(payload);
            const gas = await farmFactory.methods.deploy(payload).estimateGas({ from: props.dfoCore.address });
            // const gas = 8000000;
            console.log(gas);
            deployTransaction = await farmFactory.methods.deploy(payload).send({ from: props.dfoCore.address, gas });
            console.log(deployTransaction);
        } catch (error) {
            console.error(error);
            error = true;
        } finally {
            if (!error && deployTransaction) {
                props.updateFarmingContract(null);
                await Promise.all(farmingSetups.map(async (_, i) => {
                    removeFarmingSetup(i);
                }));
                props.setFarmingContractStep(0);
                setSelectedRewardToken(null);
                setByMint(false);
                setDeployStep(deployStep + 1);
            }
            setDeployLoading(false);
        }
    }

    const deployExtension = async () => {
        let error = false;
        setDeployLoading(true);
        try {
            const { byMint, host, deployContract } = deployData;
            if (!deployContract) {
                const factoryAddress = props.dfoCore.getContextElement("farmFactoryAddress");
                const farmFactory = await props.dfoCore.getContract(props.dfoCore.getContextElement("FarmFactoryABI"), factoryAddress);
                const cloneGasLimit = await farmFactory.methods.cloneFarmDefaultExtension().estimateGas({ from: props.dfoCore.address });
                const cloneExtensionTransaction = await farmFactory.methods.cloneFarmDefaultExtension().send({ from: props.dfoCore.address, gas: cloneGasLimit });
                const cloneExtensionReceipt = await props.dfoCore.web3.eth.getTransactionReceipt(cloneExtensionTransaction.transactionHash);
                const extensionAddress = props.dfoCore.web3.eth.abi.decodeParameter("address", cloneExtensionReceipt.logs.filter(it => it.topics[0] === props.dfoCore.web3.utils.sha3('ExtensionCloned(address)'))[0].topics[1])
                const farmExtension = new props.dfoCore.web3.eth.Contract(props.dfoCore.getContextElement("FarmExtensionABI"), extensionAddress);
                const extensionInitData = farmExtension.methods.init(byMint, host, treasuryAddress || props.dfoCore.voidEthereumAddress).encodeABI();
                setDeployData({ ...deployData, extensionAddress, extensionInitData });
            } else {
                const { abi, bytecode } = deployContract;
                const gasLimit = await new props.dfoCore.web3.eth.Contract(abi).deploy({ data: bytecode }).estimateGas({ from: props.dfoCore.address });
                const extension = await new props.dfoCore.web3.eth.Contract(abi).deploy({ data: bytecode }).send({ from: props.dfoCore.address, gasLimit });
                console.log(extension.options.address);
                setDeployData({ ...deployData, extensionAddress: extension.options.address });
            }
            setDeployStep(!error ? deployStep + 1 : deployStep);
        } catch (error) {
            console.error(error);
            error = true;
        } finally {
            setDeployLoading(false);
        }
    }

    function filterDeployedContract(contractData) {
        var abi = contractData.abi;
        if(abi.filter(abiEntry => abiEntry.type === 'constructor').length > 0) {
            return false;
        }
        if(abi.filter(abiEntry => abiEntry.type === 'function' && abiEntry.stateMutability !== 'view' && abiEntry.stateMutability !== 'pure' && abiEntry.name === 'transferTo' && (!abiEntry.outputs || abiEntry.outputs.length === 0) && abiEntry.inputs && abiEntry.inputs.length === 1 && abiEntry.inputs[0].type === 'uint256').length === 0) {
            return false;
        }
        if(abi.filter(abiEntry => abiEntry.type === 'function' && abiEntry.stateMutability === 'payable' && abiEntry.name === 'backToYou' && (!abiEntry.outputs || abiEntry.outputs.length === 0) && abiEntry.inputs && abiEntry.inputs.length === 1 && abiEntry.inputs[0].type === 'uint256').length === 0) {
            return false;
        }
        return true;
    }

    const getCreationComponent = () => {
        return <div className="col-12">
            <div className="row justify-content-center mb-4">
                <div className="col-9">
                    <TokenInput placeholder={"Reward token"} label={"Reward token address"} onClick={(address) => onSelectRewardToken(address)} text={"Load"} />
                </div>
            </div>
            {
                loading ? <div className="row justify-content-center">
                    <div className="spinner-border text-secondary" role="status">
                        <span className="visually-hidden"></span>
                    </div>
                </div> : <>  
                <div className="row mb-4">
                    { selectedRewardToken && <div className="col-12">
                            <Coin address={selectedRewardToken.address} /> {selectedRewardToken.symbol}    
                        </div>
                    }
                </div>
                {
                    selectedRewardToken && <div className="col-12">
                        <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quaerat animi ipsam nemo at nobis odit temporibus autem possimus quae vel, ratione numquam modi rem accusamus, veniam neque voluptates necessitatibus enim!</p>
                    </div>
                }
                {
                    selectedRewardToken && <div className="form-check my-4">
                        <input className="form-check-input" type="checkbox" value={byMint} onChange={(e) => setByMint(e.target.checked)} id="setByMint" />
                        <label className="form-check-label" htmlFor="setByMint">
                            By mint
                        </label>
                    </div>
                }
                {
                    selectedRewardToken && <div className="col-12">
                        <button className="btn btn-secondary" onClick={() => {
                            props.updateFarmingContract({ rewardToken: { ...selectedRewardToken, byMint } });
                            setDeployStep(0);
                        }}>Start</button>
                    </div>
                }
                </>
            }
           
        </div>
    }

    const getDeployComponent = () => {

        if (deployLoading) {
            return <div className="col-12">
                <div className="row justify-content-center">
                    <div className="spinner-border text-secondary" role="status">
                        <span className="visually-hidden"></span>
                    </div>
                </div>
            </div>
        }

        if (deployStep === 1) {
            return <div className="col-12 flex flex-column justify-content-center align-items-center">
                <div className="row mb-4">
                    <h6><b>Deploy extension</b></h6>
                </div>
                <div className="row">
                    <button onClick={() => setDeployStep(0)} className="btn btn-light mr-4">Back</button>
                    <button onClick={() => deployExtension()} className="btn btn-secondary ml-4">Deploy extension</button>
                </div>
            </div>
        } else if (deployStep === 2) {
            return <div className="col-12 flex flex-column justify-content-center align-items-center">
                <div className="row mb-4">
                    <h6><b>Deploy Farming Contract</b></h6>
                </div>
                <div className="row">
                    <button onClick={() => deploy()} className="btn btn-secondary">Deploy contract</button>
                </div>
            </div>
        } else if (deployStep === 3) {
            return <div className="col-12 flex flex-column justify-content-center align-items-center">
                <div className="row mb-4">
                    <h6 className="text-secondary"><b>Deploy successful!</b></h6>
                </div>
            </div>
        }

        return (
            <div className="col-12">
                <div className="row">
                    <h6><b>Host</b></h6>
                </div>
                <div className="row mb-2">
                    <p className="text-left text-small">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis delectus incidunt laudantium distinctio velit reprehenderit quaerat, deserunt sint fugit ex consectetur voluptas suscipit numquam. Officiis maiores quaerat quod necessitatibus perspiciatis!</p>
                </div>
                <div className="row mb-4">
                    <div className="col-12 p-0">
                        <select className="custom-select wusd-pair-select" value={selectedHost} onChange={(e) => setSelectedHost(e.target.value)}>
                            <option value="">Choose an host..</option>
                            <option value="deployed-contract">Contract</option>
                            <option value="wallet">Wallet</option>
                        </select>
                    </div>
                </div>
                {
                    selectedHost === 'wallet' ? <>
                        <div className="row mb-2">
                            <input type="text" className="form-control" value={hostWalletAddress || ""} onChange={(e) => setHostWalletAddress(e.target.value.toString())} placeholder={"Wallet address"} aria-label={"Wallet address"}/>
                        </div>
                        <div className="row mb-4">
                            <p className="text-left text-small">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis delectus incidunt laudantium distinctio velit reprehenderit quaerat, deserunt sint fugit ex consectetur voluptas suscipit numquam. Officiis maiores quaerat quod necessitatibus perspiciatis!</p>
                        </div>
                        <div className="row mb-4">
                            <h6><b>Treasury address</b></h6>
                            <input type="text" className="form-control" value={treasuryAddress || ""} onChange={(e) => setTreasuryAddress(e.target.value.toString())} placeholder={"Treasury address"} aria-label={"Treasury address"}/>
                        </div>
                    </> : selectedHost === 'deployed-contract' ? <>
                        <div className="form-check my-4">
                            <input className="form-check-input" type="checkbox" value={useDeployedContract} onChange={(e) => setUseDeployedContract(e.target.checked)} id="setIsDeploy" />
                            <label className="form-check-label" htmlFor="setIsDeploy">
                                Use deployed contract
                            </label>
                        </div>
                        {
                            !useDeployedContract ? <ContractEditor filterDeployedContract={filterDeployedContract} dfoCore={props.dfoCore} onContract={setDeployContract} templateCode={farmingExtensionTemplateCode} /> : <>
                                <div className="row mb-2">
                                    <input type="text" className="form-control" value={hostDeployedContract} onChange={(e) => setHostDeployedContract(e.target.value.toString())} placeholder={"Deployed contract address"} aria-label={"Deployed contract address"}/>
                                </div>
                            </>
                        }
                    </> : <div/>
                }
                <div>
                    <h6><b>Extension payload</b></h6>
                    <input type="text" className="form-control" value={extensionPayload || ""} onChange={(e) => setExtensionPayload(e.target.value.toString())} placeholder={"Payload"} aria-label={"Payload"}/>
                </div>
                <div className="row justify-content-center my-4">
                    <button onClick={() => {
                        setSelectedHost(null);
                        setIsDeploy(false);
                    } } className="btn btn-light mr-4">Back</button>
                    <button onClick={() => {
                        initializeDeployData();
                        setDeployStep((selectedHost === 'deployed-contract' && hostDeployedContract && !deployContract) ? 2 : 1);
                    }} className="btn btn-secondary ml-4" /*disabled={!selectedHost || (selectedHost === 'wallet' && (!hostWalletAddress || !isValidAddress(hostWalletAddress))) || (selectedHost === 'deployed-contract' && ((!useDeployedContract && (!deployContract || !deployContract.contract)) || (useDeployedContract && !hostDeployedContract)))}*/>Deploy</button>
                </div>
            </div>
        )
    }

    const getFarmingContractStatus = () => {
        return (
            <div className="col-12">
                <div className="row flex-column align-items-start mb-4">
                    <h5 className="text-secondary"><b>Farm {props.farmingContract.rewardToken.symbol}</b></h5>
                </div>
                <CreateOrEditFarmingSetups 
                    rewardToken={selectedRewardToken} 
                    farmingSetups={farmingSetups} 
                    onAddFarmingSetup={(setup) => addFarmingSetup(setup)} 
                    onRemoveFarmingSetup={(i) => removeFarmingSetup(i)} 
                    onEditFarmingSetup={(setup, i) => editFarmingSetup(setup, i)} 
                    onCancel={() => { setFarmingSetups([]); props.updateFarmingContract(null);}} 
                    onFinish={deployDFO} 
                />
            </div>
        )
    }

    if (isDeploy) {
        return (
            <div className="create-component">
                <div className="row mb-4">
                    { getDeployComponent() }
                </div>
            </div>
        )
    }

    return (
        <div className="create-component">
            <div className="row mb-4">
                { !props.farmingContract && getCreationComponent() }
                { props.farmingContract && getFarmingContractStatus() }
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    const { core, session } = state;
    const { farmingContract, farmingSetups, creationStep } = session;
    return { dfoCore: core.dfoCore, farmingContract, farmingSetups, creationStep };
}

const mapDispatchToProps = (dispatch) => {
    return {
        setFarmingContractStep: (index) => dispatch(setFarmingContractStep(index)),
        updateFarmingContract: (contract) => dispatch(updateFarmingContract(contract)),
        addFarmingSetup: (setup) => dispatch(addFarmingSetup(setup)), 
        removeFarmingSetup: (index) => dispatch(removeFarmingSetup(index)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Create);