import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Coin, Input, TokenInput } from '../../../../components/shared';
import { setFarmingContractStep, updateFarmingContract, addFarmingSetup, removeFarmingSetup  } from '../../../../store/actions';
import Editor from "@monaco-editor/react";
import { ethers } from "ethers";
import ContractEditor from '../../../../components/editor/ContractEditor';

const abi = new ethers.utils.AbiCoder();

const Create = (props) => {
    const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
    const [selectedRewardToken, setSelectedRewardToken] = useState(null);
    const [selectedFarmingType, setSelectedFarmingType] = useState(null);
    const [selectedHost, setSelectedHost] = useState("");
    const [hostWalletAddress, setHostWalletAddress] = useState(null);
    const [hostDeployedContract, setHostDeployedContract] = useState(null);
    const [deployContract, setDeployContract] = useState(null);
    const [useDeployedContract, setUseDeployedContract] = useState(false);
    const [byMint, setByMint] = useState(false);
    const [freeLiquidityPoolToken, setFreeLiquidityPoolToken] = useState(null);
    const [freeRewardPerBlock, setFreeRewardPerBlock] = useState(0);
    const [minStakeable, setMinSteakeable] = useState(0);
    const [blockDuration, setBlockDuration] = useState(null);
    const [lockedStartBlock, setLockedStartBlock] = useState(0);
    const [lockedMainToken, setLockedMainToken] = useState(null);
    const [lockedMaxLiquidity, setLockedMaxLiquidity] = useState(0);
    const [lockedRewardPerBlock, setLockedRewardPerBlock] = useState(0);
    const [lockedSecondaryToken, setLockedSecondaryToken] = useState(null);
    const [lockedHasPenaltyFee, setLockedHasPenaltyFee] = useState(false);
    const [lockedPenaltyFee, setLockedPenaltyFee] = useState(0);
    const [isRenewable, setIsRenewable] = useState(false);
    const [renewTimes, setRenewTimes] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isAdd, setIsAdd] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [isAddLoadBalancer, setIsAddLoadBalancer] = useState(false);
    const [isDeploy, setIsDeploy] = useState(false);
    const [deployLoading, setDeployLoading] = useState(false);
    const [deployStep, setDeployStep] = useState(0);
    const [deployData, setDeployData] = useState(null);
    const [extensionPayload, setExtensionPayload] = useState("");

    useEffect(() => {
        if (props.farmingContract?.rewardToken) {
            setSelectedRewardToken(props.farmingContract.rewardToken);
        }
        if (currentBlockNumber === 0) {
            props.dfoCore.getBlockNumber().then((blockNumber) => {
                setCurrentBlockNumber(blockNumber);
                setLockedStartBlock(blockNumber);
            });
        }
    }, []);

    const isWeth = (address) => {
        return (address.toLowerCase() === props.dfoCore.getContextElement('wethTokenAddress').toLowerCase()) || (address === props.dfoCore.voidEthereumAddress);
    }

    const isValidAddress = (address) => {
        // TODO update check
        return address.length === 42;
    }

    const addFreeFarmingSetup = () => {
        const setup = {
            rewardPerBlock: freeRewardPerBlock,
            data: freeLiquidityPoolToken,
            period: blockDuration,
            minStakeable,
            renewTimes
        }
        if (isAdd && editIndex) {
            props.removeFarmingSetup(editIndex);
            setIsEdit(false);
            setEditIndex(null);
        }
        props.addFarmingSetup(setup);
        setFreeLiquidityPoolToken(null);
        setFreeRewardPerBlock(0);
        setMinSteakeable(0);
        setBlockDuration(null);
        setRenewTimes(0);
        setIsRenewable(false);
        setSelectedFarmingType(null);
        setIsAdd(false);
    }

    const addLockedFarmingSetup = () => {
        const setup = {
            period: blockDuration,
            data: lockedMainToken,
            maxLiquidity: lockedMaxLiquidity,
            rewardPerBlock: lockedRewardPerBlock,
            penaltyFee: lockedPenaltyFee,
            renewTimes,
            secondaryToken: lockedSecondaryToken,
            minStakeable,
        }
        if (isAdd && editIndex) {
            props.removeFarmingSetup(editIndex);
            setIsEdit(false);
            setEditIndex(null);
        }
        props.addFarmingSetup(setup);
        setBlockDuration(null);
        setLockedStartBlock(0);
        setLockedMainToken(null);
        setLockedMaxLiquidity(0);
        setLockedRewardPerBlock(0);
        setLockedHasPenaltyFee(false);
        setLockedPenaltyFee(0);
        setIsRenewable(false);
        setRenewTimes(0);
        setMinSteakeable(0);
        setLockedSecondaryToken(null);
        setSelectedFarmingType(null);
        setIsAdd(false);
        props.setFarmingContractStep(0);
    }

    const editSetup = (setup, index) => {
        if (!setup.maxLiquidity) {
            // free setup
            setMinSteakeable(setup.minStakeable);
            setBlockDuration(setup.period);
            setFreeLiquidityPoolToken(setup.data);
            setFreeRewardPerBlock(setup.rewardPerBlock);
            setSelectedFarmingType('free');
            setIsRenewable(parseInt(setup.renewTimes) !== 0);
            setRenewTimes(setup.renewTimes);
        } else {
            // locked setup
            setMinSteakeable(setup.minStakeable);
            setBlockDuration(setup.period);
            setLockedMainToken(setup.data);
            setLockedMaxLiquidity(setup.maxLiquidity);
            setLockedRewardPerBlock(setup.rewardPerBlock);
            setLockedHasPenaltyFee(parseInt(setup.penaltyFee) !== 0);
            setLockedPenaltyFee(setup.penaltyFee);
            setIsRenewable(parseInt(setup.renewTimes) !== 0);
            setRenewTimes(setup.renewTimes);
            setLockedSecondaryToken(setup.secondaryToken);
            setSelectedFarmingType('locked');
        }
        setIsAdd(true);
        setIsEdit(true);
        setEditIndex(index);
    }

    const onUpdatePenaltyFee = (value) => {
        setLockedPenaltyFee(value > 100 ? 100 : value);
    }

    const onSelectRewardToken = async (address) => {
        setLoading(true);
        const rewardToken = await props.dfoCore.getContract(props.dfoCore.getContextElement('ERC20ABI'), address);
        console.log(rewardToken);
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
            for (let i = 0; i < props.farmingSetups.length; i++) {
                const setup = props.farmingSetups[i];
                const isFree = !setup.maxLiquidity;
                const result = await ammAggregator.methods.findByLiquidityPool(isFree ? setup.data.address : setup.secondaryToken).call();
                console.log(result);
                console.log(setup);
                const { amm } = result;
                const ammContract = await props.dfoCore.getContract(props.dfoCore.getContextElement('AMMABI'), amm);
                const res = await ammContract.methods.byLiquidityPool(isFree ? setup.data.address : setup.secondaryToken).call();
                const involvingETH = res['2'].filter((address) => isWeth(address)).length > 0;
                const parsedSetup = 
                [
                    isFree,
                    parseInt(setup.period),
                    props.dfoCore.fromDecimals(setup.rewardPerBlock),
                    props.dfoCore.fromDecimals(setup.minStakeable),
                    !isFree ? props.dfoCore.fromDecimals(setup.maxLiquidity) : 0,
                    setup.renewTimes,
                    amm,
                    isFree ? setup.data.address : setup.secondaryToken,
                    result[2][0],
                    props.dfoCore.voidEthereumAddress,
                    involvingETH,
                    isFree ? 0 : props.dfoCore.fromDecimals(parseFloat(parseFloat(setup.penaltyFee) / 100).toString()),
                    0,
                    0
                ];
                data.setups.push(parsedSetup)
            }
            console.log(data);
            setDeployData(data);
        } catch (error) {
            console.error(error);
            setDeployData(null);
        } finally {
            setDeployLoading(false);
        }
    }

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
            const params = [extensionAddress ? extensionAddress : hostDeployedContract, extensionInitData || extensionPayload || "0x", props.dfoCore.getContextElement("ethItemOrchestratorAddress"), rewardTokenAddress, encodedSetups || 0];
            console.log(params)
            console.log(extensionInitData);
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
                await Promise.all(props.farmingSetups.map(async (_, i) => {
                    props.removeFarmingSetup(i);
                }));
                props.setFarmingContractStep(0);
                setSelectedRewardToken(null);
                setByMint(false);
                setIsDeploy(false);
                setIsAddLoadBalancer(false);
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
                const extensionInitData = farmExtension.methods.init(byMint, host).encodeABI()
                setDeployData({ ...deployData, extensionAddress, extensionInitData });
            } else {
                const { contract, payload } = deployContract;
                const { abi, bytecode } = contract;
                const gasLimit = await new props.dfoCore.web3.eth.Contract(abi).deploy({ data: bytecode }).estimateGas({ from: props.dfoCore.address });
                const extension = await new props.dfoCore.web3.eth.Contract(abi).deploy({ data: bytecode }).send({ from: props.dfoCore.address, gasLimit });
                console.log(extension.options.address);
                setDeployData({ ...deployData, extensionAddress: extension.options.address, extensionInitData: payload });
            }
            setDeployStep(!error ? deployStep + 1 : deployStep);
        } catch (error) {
            console.error(error);
            error = true;
        } finally {
            setDeployLoading(false);
        }
    }

    const getCreationComponent = () => {
        return <div className="col-12">
            {
                deployStep === 3 && <div className="row justify-content-center mb-4">
                    <div className="col-12">
                        <h3 className="text-secondary"><b>Deploy successful!</b></h3>
                    </div>
                </div>
            }
            <div className="row justify-content-center mb-4">
                <div className="col-9">
                    <TokenInput placeholder={"Reward token"} onClick={(address) => onSelectRewardToken(address)} text={"Load"} />
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
                        <p style={{fontSize: 14}}>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quaerat animi ipsam nemo at nobis odit temporibus autem possimus quae vel, ratione numquam modi rem accusamus, veniam neque voluptates necessitatibus enim!</p>
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

    const getFarmingSetups = () => {
        return <div className="col-12 p-0">
            {
                props.farmingSetups.map((setup, i) => {
                    return (
                        <div key={i} className="row align-items-center text-left mb-md-2 mb-4">
                            <div className="col-md-9 col-12">
                                <b style={{fontSize: 14}}>{ !setup.maxLiquidity ? "Free setup" : "Locked setup" } { setup.data.name }{ setup.maxLiquidity ? `${setup.data.symbol}` : ` | ${setup.data.tokens.map((token) => `${token.symbol}` )}` } - Reward: {setup.rewardPerBlock} {props.farmingContract.rewardToken.symbol}/block</b>
                            </div>
                            <div className="col-md-3 col-12 flex">
                                <button className="btn btn-sm btn-outline-danger mr-1" onClick={() => props.removeFarmingSetup(i)}><b>X</b></button> <button onClick={() => editSetup(setup, i)} className="btn btn-sm btn-danger ml-1"><b>EDIT</b></button>
                            </div>
                        </div>
                    )
                })
            }
            <div className="row justify-content-between mt-4">
                <div className="col-12 flex justify-content-start mb-4">
                    <button onClick={() => setIsAdd(true)} className="btn btn-light">Add setup</button>
                </div>
                <div className="col-12 mt-4">
                    <button onClick={() => {
                        setSelectedRewardToken(null);
                        props.farmingSetups.forEach((_, index) => props.removeFarmingSetup(index));
                        props.updateFarmingContract(null);
                    }} className="btn btn-light mr-4">Cancel</button> <button onClick={() => setIsDeploy(true)} className="btn btn-secondary ml-4">Next</button>
                </div>
            </div>
        </div>
    }

    const getEmptyFarmingSetups = () => {
        if (props.creationStep === 0) {
            return (
                <div className="col-12">
                    <div className="row justify-content-center mb-4">
                        <h6><b>Select farming type</b></h6>
                    </div>
                    <div className="row justify-content-center mb-4">
                        <button onClick={() => setSelectedFarmingType(selectedFarmingType !== 'free' ? 'free' : null)} className={`btn ${selectedFarmingType === 'free' ? "btn-secondary" : "btn-outline-secondary"} mr-4`}>Free Farming</button>
                        <button onClick={() => setSelectedFarmingType(selectedFarmingType !== 'locked' ? 'locked' : null)} className={`btn ${selectedFarmingType === 'locked' ? "btn-secondary" : "btn-outline-secondary"}`}>Locked</button>
                    </div>
                    <div className="row mb-4">
                        <p style={{fontSize: 14}}>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quaerat animi ipsam nemo at nobis odit temporibus autem possimus quae vel, ratione numquam modi rem accusamus, veniam neque voluptates necessitatibus enim!</p>
                    </div>
                    <div className="row justify-content-center">
                        <button onClick={() => props.setFarmingContractStep(0) } className="btn btn-light mr-4">Cancel</button>
                        <button onClick={() => props.setFarmingContractStep(1)} disabled={!selectedFarmingType} className="btn btn-primary">Next</button>
                    </div>
                </div>
            );
        } else if (props.creationStep === 1) {
            if (!selectedFarmingType) {
                props.setFarmingContractStep(0);
                return <div/>;
            }
            return selectedFarmingType === 'free' ? getFreeFirstStep() : getLockedFirstStep();
        } else if (props.creationStep === 2) {
            return getLockedSecondStep();
        }
        return <div/>
    }

    const onSelectFreeLiquidityPoolToken = async (address) => {
        if (!address) return;
        try {
            setLoading(true);
            const ammAggregator = await props.dfoCore.getContract(props.dfoCore.getContextElement('AMMAggregatorABI'), props.dfoCore.getContextElement('ammAggregatorAddress'));
            const res = await ammAggregator.methods.info(address).call();
            const name = res['name'];
            const ammAddress = res['amm'];
            const ammContract = await props.dfoCore.getContract(props.dfoCore.getContextElement('AMMABI'), ammAddress);
            const lpInfo = await ammContract.methods.byLiquidityPool(address).call();
            console.log(lpInfo);
            const tokens = [];
            await Promise.all(lpInfo[2].map(async (tkAddress) => {
                if (isWeth(tkAddress)) {
                    tokens.push({
                        symbol: 'ETH',
                        address: props.dfoCore.getContextElement('wethTokenAddress'),
                    })
                } else {
                    const currentToken = await props.dfoCore.getContract(props.dfoCore.getContextElement('ERC20ABI'), tkAddress);
                    const symbol = await currentToken.methods.symbol().call();
                    tokens.push({
                        symbol,
                        address: tkAddress
                    })
                }
            }))
            setFreeLiquidityPoolToken({ 
                address, 
                name,
                tokens,
            });
        } catch (error) {
            setFreeLiquidityPoolToken(null);
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const onSelectMainToken = async (address) => {
        setLoading(true);
        const mainTokenContract = await props.dfoCore.getContract(props.dfoCore.getContextElement('ERC20ABI'), address);
        const symbol = await mainTokenContract.methods.symbol().call();
        setLockedMainToken({ symbol, address });
        setLoading(false);
    }

    const goToFirstStep = () => {
        setFreeLiquidityPoolToken(null);
        setFreeRewardPerBlock(0);
        setBlockDuration(null);
        setLockedStartBlock(0);
        setLockedMainToken(null);
        setLockedMaxLiquidity(0);
        setLockedRewardPerBlock(0);
        setLockedHasPenaltyFee(false);
        setLockedPenaltyFee(0);
        setIsRenewable(false);
        setRenewTimes(0);
        setLockedSecondaryToken(null);
        props.setFarmingContractStep(0);
    }

    const getFreeFirstStep = () => {
        return <div className="col-12">
            <div className="row mb-4">
                <div className="col-12">
                    <select className="custom-select wusd-pair-select" value={blockDuration} onChange={(e) => setBlockDuration(e.target.value)}>
                        <option value={0}>Choose setup duration</option>
                        {
                            Object.keys(props.dfoCore.getContextElement("blockIntervals")).map((key, index) => {
                                return <option key={index} value={props.dfoCore.getContextElement("blockIntervals")[key]}>{key}</option>
                            })
                        }
                    </select>
                </div>
            </div>
            <div className="row justify-content-center mb-4">
                <div className="col-9">
                    <TokenInput label={"Liquidity pool address"} placeholder={"Liquidity pool address"} width={60} onClick={(address) => onSelectFreeLiquidityPoolToken(address)} text={"Load"} />
                </div>
            </div>
            {
                loading ? <div className="row justify-content-center">
                    <div className="spinner-border text-secondary" role="status">
                        <span className="visually-hidden"></span>
                    </div>
                </div> :  <>
                    <div className="row mb-4">
                        { (freeLiquidityPoolToken && freeLiquidityPoolToken.tokens.length > 0) && <div className="col-12">
                                <b>{freeLiquidityPoolToken.name} | {freeLiquidityPoolToken.tokens.map((token) => <>{token.symbol} </>)}</b> {freeLiquidityPoolToken.tokens.map((token) => <Coin address={token.address} className="mr-2" /> )}
                            </div>
                        }
                    </div>
                    {
                        freeLiquidityPoolToken && <>
                            <div className="row justify-content-center mb-4">
                                <div className="col-6">
                                    <Input min={0} showCoin={true} address={selectedRewardToken.address} value={freeRewardPerBlock} name={selectedRewardToken.symbol} label={"Reward per block"} onChange={(e) => setFreeRewardPerBlock(e.target.value)} />
                                </div>
                            </div>
                            <div className="row justify-content-center align-items-center flex-column mb-2">
                                <p className="text-center"><b>Monthly*: {freeRewardPerBlock * 3000} {selectedRewardToken.symbol}</b></p>
                                <p className="text-center"><b>Yearly*: {freeRewardPerBlock * 36000} {selectedRewardToken.symbol}</b></p>
                            </div>
                            <div className="row mb-4">
                                <p className="text-center">*Monthly/yearly reward are calculated in a forecast based on 3000 Blocks/m and 36000/y.</p>
                            </div>
                            <div className="row justify-content-center mb-4">
                                <div className="col-6">
                                    <Input min={0} showCoin={true} address={selectedRewardToken.address} value={minStakeable} name={selectedRewardToken.symbol} label={"Min stakeable"} onChange={(e) => setMinSteakeable(e.target.value)} />
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <div className="form-check my-4">
                                    <input className="form-check-input" type="checkbox" value={isRenewable} onChange={(e) => setIsRenewable(e.target.checked)} id="repeat" />
                                    <label className="form-check-label" htmlFor="repeat">
                                        Repeat
                                    </label>
                                </div>
                            </div>
                            {
                                isRenewable && <div className="row mb-4 justify-content-center">
                                    <div className="col-md-6 col-12">
                                        <Input min={0} width={50} value={renewTimes} onChange={(e) => setRenewTimes(e.target.value)} />
                                    </div>
                                </div>
                            }
                        </>
                    }
                    <div className="row justify-content-center mb-4">
                        <button onClick={() => goToFirstStep() } className="btn btn-light mr-4">Cancel</button>
                        <button onClick={() => addFreeFarmingSetup() } disabled={!freeLiquidityPoolToken || freeRewardPerBlock <= 0 || minStakeable <= 0 || !blockDuration} className="btn btn-secondary ml-4">{isEdit ? 'Edit' : 'Add'}</button>
                    </div>
                </>
            }
        </div>
    }

    const getLockedFirstStep = () => {
        return <div className="col-12">
            <div className="row mb-4">
                <div className="col-12">
                    <select className="custom-select wusd-pair-select" value={blockDuration} onChange={(e) => setBlockDuration(e.target.value)}>
                        <option value={0}>Choose setup duration</option>
                        {
                            Object.keys(props.dfoCore.getContextElement("blockIntervals")).map((key, index) => {
                                return <option key={index} value={props.dfoCore.getContextElement("blockIntervals")[key]}>{key}</option>
                            })
                        }
                    </select>
                </div>
            </div>
            <div className="row mb-4">
                <p className="text-center text-small">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis delectus incidunt laudantium distinctio velit reprehenderit quaerat, deserunt sint fugit ex consectetur voluptas suscipit numquam. Officiis maiores quaerat quod necessitatibus perspiciatis!</p>
            </div>
            <div className="row justify-content-center mb-4">
                <div className="col-9">
                    <TokenInput label={"Main token"} placeholder={"Main token address"} width={60} onClick={(address) => onSelectMainToken(address)} text={"Load"} />
                </div>
            </div>
            {
                loading ? <div className="row justify-content-center">
                    <div className="spinner-border text-secondary" role="status">
                        <span className="visually-hidden"></span>
                    </div>
                </div> :  <>
                    <div className="row mb-4">
                        { lockedMainToken && <div className="col-12">
                                <b>{lockedMainToken.symbol}</b> <Coin address={lockedMainToken.address} className="ml-2" />
                            </div>
                        }
                    </div>
                    {
                        lockedMainToken && <>
                            <hr/>
                            <div className="row justify-content-center my-4">
                                <div className="col-9">
                                    <TokenInput label={"Liquidity pool token"} placeholder={"Liquidity pool token address"} width={60} onClick={(address) => setLockedSecondaryToken(address !== lockedMainToken.address ? address : lockedSecondaryToken)} text={"Load"} />
                                </div>
                            </div>
                            {
                                lockedSecondaryToken && <div key={lockedSecondaryToken} className="row align-items-center mb-2">
                                    <div className="col-md-9 col-12">{lockedSecondaryToken}</div>
                                    <div className="col-md-3 col-12">
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => setLockedSecondaryToken(null)}>Remove</button>
                                    </div>
                                </div>
                            }
                            <div className="row justify-content-center mb-4">
                                <div className="col-6">
                                    <Input min={0} showCoin={true} address={selectedRewardToken.address} value={minStakeable} name={selectedRewardToken.symbol} label={"Min stakeable"} onChange={(e) => setMinSteakeable(e.target.value)} />
                                </div>
                            </div>
                            <div className="row justify-content-center mt-4 mb-4">
                                <div className="col-6">
                                    <Input label={"Max stakeable"} min={0} showCoin={true} address={lockedMainToken.address} value={lockedMaxLiquidity} name={lockedMainToken.symbol} onChange={(e) => setLockedMaxLiquidity(e.target.value)} />
                                </div>
                            </div>
                            <div className="row mb-4">
                                <p className="text-center text-small">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis delectus incidunt laudantium distinctio velit reprehenderit quaerat, deserunt sint fugit ex consectetur voluptas suscipit numquam. Officiis maiores quaerat quod necessitatibus perspiciatis!</p>
                            </div>
                            <div className="row justify-content-center mb-4">
                                <div className="col-6">
                                    <Input label={"Reward per block"} min={0} showCoin={true} address={lockedMainToken.address} value={lockedRewardPerBlock} name={lockedMainToken.symbol} onChange={(e) => setLockedRewardPerBlock(e.target.value)} />
                                </div>
                            </div>
                            <div className="row mb-4">
                                <p className="text-center text-small">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis delectus incidunt laudantium distinctio velit reprehenderit quaerat, deserunt sint fugit ex consectetur voluptas suscipit numquam. Officiis maiores quaerat quod necessitatibus perspiciatis!</p>
                            </div>
                            <div className="row justify-content-center align-items-center flex-column mb-2">
                                <p className="text-center"><b>Reward/block per {lockedMainToken.symbol}: {!lockedMaxLiquidity ? 0 : parseFloat((lockedRewardPerBlock * (1 / lockedMaxLiquidity)).toPrecision(4))} {lockedMainToken.symbol}</b></p>
                            </div>
                        </>
                    }
                    <div className="row justify-content-center mb-4">
                        <button onClick={() => goToFirstStep() } className="btn btn-light mr-4">Cancel</button>
                        <button onClick={() => props.setFarmingContractStep(2) } disabled={!lockedMainToken || lockedRewardPerBlock <= 0 || !lockedMaxLiquidity || !lockedSecondaryToken || !lockedStartBlock || !blockDuration} className="btn btn-secondary ml-4">Next</button>
                    </div>
                </>
            }
        </div>
    }

    const getLockedSecondStep = () => {
        return (
            <div className="col-12">
                <div className="row justify-content-center">
                    <div className="form-check my-4">
                        <input className="form-check-input" type="checkbox" value={lockedHasPenaltyFee} onChange={(e) => setLockedHasPenaltyFee(e.target.checked)} id="penaltyFee" />
                        <label className="form-check-label" htmlFor="penaltyFee">
                            Penalty fee
                        </label>
                    </div>
                </div>
                {
                    lockedHasPenaltyFee && <div className="row mb-4 justify-content-center">
                        <div className="col-md-6 col-12 flex justify-content-center">
                            <input type="number" className="form-control w-50" step={0.001} max={100} min={0} value={lockedPenaltyFee} onChange={(e) => onUpdatePenaltyFee(e.target.value)} />
                        </div>
                    </div>
                }
                <div className="row mb-4">
                    <p className="text-center text-small">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis delectus incidunt laudantium distinctio velit reprehenderit quaerat, deserunt sint fugit ex consectetur voluptas suscipit numquam. Officiis maiores quaerat quod necessitatibus perspiciatis!</p>
                </div>
                <div className="row justify-content-center">
                    <div className="form-check my-4">
                        <input className="form-check-input" type="checkbox" value={isRenewable} onChange={(e) => setIsRenewable(e.target.checked)} id="repeat" />
                        <label className="form-check-label" htmlFor="repeat">
                            Repeat
                        </label>
                    </div>
                </div>
                {
                    isRenewable && <div className="row mb-4 justify-content-center">
                        <div className="col-md-6 col-12">
                            <Input min={0} width={50} address={lockedMainToken.address} value={renewTimes} onChange={(e) => setRenewTimes(e.target.value)} />
                        </div>
                    </div>
                }
                <div className="row mb-4">
                    <p className="text-center text-small">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis delectus incidunt laudantium distinctio velit reprehenderit quaerat, deserunt sint fugit ex consectetur voluptas suscipit numquam. Officiis maiores quaerat quod necessitatibus perspiciatis!</p>
                </div>
                <div className="row justify-content-center mb-4">
                    <button onClick={() => goToFirstStep() } className="btn btn-light mr-4">Cancel</button>
                    <button onClick={() => addLockedFarmingSetup() } disabled={(isRenewable && renewTimes === 0) || (lockedHasPenaltyFee && lockedPenaltyFee === 0)} className="btn btn-secondary ml-4">Next</button>
                </div>
            </div>
        )
    }

    const getLockedFourthStep = () => {

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
                    <button onClick={() => deployExtension()} className="btn btn-secondary">Deploy extension</button>
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
                            <input type="text" className="form-control" value={hostWalletAddress} onChange={(e) => setHostWalletAddress(e.target.value.toString())} placeholder={"Wallet address"} aria-label={"Wallet address"}/>
                        </div>
                        <div className="row mb-4">
                            <p className="text-left text-small">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis delectus incidunt laudantium distinctio velit reprehenderit quaerat, deserunt sint fugit ex consectetur voluptas suscipit numquam. Officiis maiores quaerat quod necessitatibus perspiciatis!</p>
                        </div>
                    </> : selectedHost === 'deployed-contract' ? <>
                        <div className="form-check my-4">
                            <input className="form-check-input" type="checkbox" value={useDeployedContract} onChange={(e) => setUseDeployedContract(e.target.checked)} id="setIsDeploy" />
                            <label className="form-check-label" htmlFor="setIsDeploy">
                                Use deployed contract
                            </label>
                        </div>
                        {
                            !useDeployedContract ? <ContractEditor dfoCore={props.dfoCore} onContract={(contract) => setDeployContract({contract})} /> : <>
                                <div className="row mb-2">
                                    <input type="text" className="form-control" value={hostDeployedContract} onChange={(e) => setHostDeployedContract(e.target.value.toString())} placeholder={"Deployed contract address"} aria-label={"Deployed contract address"}/>
                                </div>
                            </>
                        }
                    </> : <div/>
                }
                <div>
                    <input type="text" className="form-control" value={extensionPayload || ""} onChange={(e) => setExtensionPayload(e.target.value.toString())} placeholder={"Payload"} aria-label={"Payload"}/>
                </div>
                <div className="row justify-content-center my-4">
                    <button onClick={() => {
                        setSelectedHost(null);
                        setIsAddLoadBalancer(true);
                        setIsDeploy(false);
                    } } className="btn btn-light mr-4">Cancel</button>
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
                    <b>Setups list</b>
                </div>
                {
                    isDeploy ? getLockedFourthStep() : <div className="col-12">
                        {
                            (props.farmingSetups.length > 0 && !isAdd) && getFarmingSetups()
                        }
                        {
                            (props.farmingSetups.length === 0 || isAdd) && getEmptyFarmingSetups()
                        }
                    </div>
                }
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