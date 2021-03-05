import Coin from '../coin/Coin';
import { useEffect, useState } from 'react';
import { Input, ApproveButton } from '..';

const SetupComponent = (props) => {
    let { className, dfoCore, setupIndex, lmContract, manage, farm, redeem } = props;
    const [setup, setSetup] = useState(null);
    const [setupInfo, setSetupInfo] = useState(null);
    const [open, setOpen] = useState(false);
    const [blockNumber, setBlockNumber] = useState(0);
    const [loading, setLoading] = useState(true);
    const [AMM, setAMM] = useState({ name: "", version: ""});
    const [ammContract, setAmmContract] = useState(null);
    const [extensionContract, setExtensionContract] = useState(null);
    const [status, setStatus] = useState('farm');
    const [edit, setEdit] = useState(false);
    const [isHost, setIsHost] = useState(true);
    const [farmTokenCollection, setFarmTokenCollection] = useState(null);
    const [farmTokenBalance, setFarmTokenBalance] = useState(0);
    const [canActivateSetup, setCanActivateSetup] = useState(false);
    const [addLiquidityType, setAddLiquidityType] = useState(""); 
    const [setupTokens, setSetupTokens] = useState([]);
    const [tokensAmounts, setTokensAmount] = useState([]);
    const [tokensApprovals, setTokensApprovals] = useState([]);
    const [tokensContracts, setTokensContracts] = useState([]);
    const [lpTokenAmount, setLpTokenAmount] = useState(0);
    const [lockedEstimatedReward, setLockedEstimatedReward] = useState(0);
    const [freeAvailableRewards, setFreeAvailableRewards] = useState(0);
    const [lockedAvailableRewards, setLockedAvailableRewards] = useState(0);
    const [lpTokenInfo, setLpTokenInfo] = useState(null);
    const [rewardTokenInfo, setRewardTokenInfo] = useState(null);
    const [extension, setExtension] = useState(null);
    const [removalAmount, setRemovalAmount] = useState(0);
    const [manageStatus, setManageStatus] = useState(null);
    const [unwrapPair, setUnwrapPair] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [updatedRewardPerBlock, setUpdatedRewardPerBlock] = useState(0);
    const [updatedRenewTimes, setUpdatedRenewTimes] = useState(0);
    const [openPositionForAnotherWallet, setOpenPositionForAnotherWallet] = useState(false);
    const [uniqueOwner, setUniqueOwner] = useState(dfoCore.voidEthereumAddress);

    useEffect(() => {
        
        getSetupMetadata();
    }, []);

    const isWeth = (address) => {
        return address.toLowerCase() === props.dfoCore.getContextElement('wethTokenAddress').toLowerCase();
    }

    const getSetupMetadata = async () => {
        setLoading(true);
        try {
            let position = null;
            /*
            const events = await lmContract.getPastEvents('Transfer', { filter: { to: dfoCore.address, setupIndex }, fromBlock: 9771086 });
            for (let i = 0; i < events.length; i++) {
                const { returnValues } = events[i];
                const pos = await lmContract.methods.position(returnValues.positionId).call();
                if (dfoCore.isValidPosition(pos)) {
                    position = { ...pos, positionId: returnValues.positionId };
                }
            }
            */
            const setups = await lmContract.methods.setups().call();
            const farmSetup = setups[parseInt(setupIndex)];
            const farmSetupInfo = await lmContract.methods._setupsInfo(farmSetup.infoIndex).call();
            const farmTokenCollectionAddress = await lmContract.methods._farmTokenCollection().call();
            console.log(farmTokenCollectionAddress);
            const farmTokenCollection = await props.dfoCore.getContract(props.dfoCore.getContextElement('INativeV1ABI'), farmTokenCollectionAddress);
            setFarmTokenCollection(farmTokenCollection);
            if (!farmSetup.free) {
                // retrieve farm token data
                const objectId = farmSetup.objectId;
                console.log(objectId);
                if (objectId !== "0") {
                    const ftBalance = await farmTokenCollection.methods.balanceOf(props.dfoCore.address, objectId).call();
                    setFarmTokenBalance(ftBalance);
                } else {
                    setFarmTokenBalance(0);
                }
            }
            setUpdatedRenewTimes(farmSetupInfo.renewTimes);
            setUpdatedRewardPerBlock(farmSetup.rewardPerBlock);
            setSetup(farmSetup);
            setSetupInfo(farmSetupInfo);
            const events = await window.getLogs({
                address : lmContract.options.address,
                topics : [
                    window.web3.utils.sha3("Transfer(uint256,address,address)")
                ],
                fromBlock: await window.web3ForLogs.eth.getBlockNumber() - 1000,
                toBlock: await window.web3ForLogs.eth.getBlockNumber(),
            });
            await Promise.all(events.map(async (event) => {
                const { topics } = events[0];
                var positionId = props.dfoCore.web3.eth.abi.decodeParameter("uint256", topics[1]);
                const pos = await lmContract.methods.position(positionId).call();
                console.log(pos);
                if (dfoCore.isValidPosition(pos) && parseInt(pos.setupIndex) === parseInt(setupIndex)) {
                    position = { ...pos, positionId: positionId };
                }
            }))
            setCurrentPosition(position);
            const extensionAddress = await lmContract.methods._extension().call();
            setExtension(extensionAddress);
            const extContract = await dfoCore.getContract(dfoCore.getContextElement("FarmExtensionABI"), extensionAddress);
            setExtensionContract(extContract);
            const rewardTokenAddress = await lmContract.methods._rewardTokenAddress().call();
            const rewardToken = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), rewardTokenAddress);
            const rewardTokenSymbol = await rewardToken.methods.symbol().call();
            const rewardTokenDecimals = await rewardToken.methods.decimals().call();
            setRewardTokenInfo({ contract: rewardToken, symbol: rewardTokenSymbol, decimals: rewardTokenDecimals, address: rewardTokenAddress });
            
            const lpToken = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), farmSetupInfo.liquidityPoolTokenAddress);
            const lpTokenSymbol = await lpToken.methods.symbol().call();
            const lpTokenDecimals = await lpToken.methods.decimals().call();
            const lpTokenBalance = await lpToken.methods.balanceOf(dfoCore.address).call();
            const lpTokenApproval = await lpToken.methods.allowance(dfoCore.address, lmContract.options.address).call();
            setLpTokenInfo({ contract: lpToken, symbol: lpTokenSymbol, decimals: lpTokenDecimals, balance: lpTokenBalance, approval: parseInt(lpTokenApproval) !== 0 });

            setBlockNumber(await dfoCore.getBlockNumber());
            const ammContract = await dfoCore.getContract(dfoCore.getContextElement('AMMABI'), farmSetupInfo.ammPlugin);
            setAmmContract(ammContract);
            
            const activateSetup = parseInt(farmSetupInfo.renewTimes) > 0 && !farmSetup.active && parseInt(farmSetupInfo.lastSetupIndex) === parseInt(setupIndex);
            
            setCanActivateSetup(activateSetup);
            const tokenAddress = farmSetupInfo.liquidityPoolTokenAddress;
            let res;
            if (farmSetupInfo.free) {
                res = await ammContract.methods.byLiquidityPoolAmount(tokenAddress, farmSetup.totalSupply).call();
            } else {
                res = await ammContract.methods.byTokenAmount(tokenAddress, farmSetupInfo.mainTokenAddress, farmSetup.totalSupply).call();
                res = await ammContract.methods.byLiquidityPoolAmount(tokenAddress, res.liquidityPoolAmount).call();
            }
            const tokens = [];
            const approvals = [];
            const contracts = [];
            for(let i = 0; i < res.liquidityPoolTokens.length; i++) {
                const address = res.liquidityPoolTokens[i];
                const token = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), address);
                const symbol = !isWeth(address) ? await token.methods.symbol().call() : 'ETH';
                const decimals = await token.methods.decimals().call();
                const balance = !isWeth(address) ? await token.methods.balanceOf(dfoCore.address).call() : await dfoCore.web3.eth.getBalance(dfoCore.address);
                const approval = !isWeth(address) ? await token.methods.allowance(dfoCore.address, lmContract.options.address).call() : true;
                approvals.push(parseInt(approval) !== 0);
                tokens.push({ amount: 0, balance: dfoCore.toDecimals(dfoCore.toFixed(balance), decimals), liquidity: res.tokensAmounts[i], decimals, address, symbol });
                contracts.push(token);
            }
            const info = await ammContract.methods.info().call();
            setAMM({ name: info['0'], version: info['1'] });
            setSetupTokens(tokens);
            setTokensContracts(contracts);
            setTokensAmount(new Array(tokens.length).fill(0));
            setTokensApprovals(approvals);
            // retrieve the manage data using the position
            if (position) {
                const free = position['free'];
                const creationBlock = position['creationBlock'];
                const positionSetupIndex = position['setupIndex'];
                const liquidityPoolTokenAmount = position['liquidityPoolTokenAmount'];
                const mainTokenAmount = position['mainTokenAmount'];
                const amounts = await ammContract.methods.byLiquidityPoolAmount(farmSetupInfo.liquidityPoolTokenAddress, liquidityPoolTokenAmount).call();
                setManageStatus({ free, creationBlock, positionSetupIndex, liquidityPoolAmount: liquidityPoolTokenAmount, mainTokenAmount, tokensAmounts: amounts['tokensAmounts'], tokens  })
            }
            setAddLiquidityType("");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const activateSetup = async () => {
        setLoading(true);
        try {
            const gas = await lmContract.methods.activateSetup(setupIndex).estimateGas({ from: props.dfoCore.address });
            const result = await lmContract.methods.activateSetup(setupIndex).send({ from: props.dfoCore.address, gas });
            await getSetupMetadata();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const onTokenApproval = (index, isLp) => {
        if (isLp) {
            setLpTokenInfo({ ...lpTokenInfo, approval: true });
            return;
        }
        setTokensApprovals(tokensApprovals.map((val, i) => i === index ? true : val));
    }

    const isValidPosition = (position) => {
        return position.uniqueOwner !== dfoCore.voidEthereumAddress && position.creationBlock !== '0';
    }

    const onUpdateTokenAmount = async (value, index) => {
        
        if (!value) {
            setTokensAmount(tokensAmounts.map((old, i) => i === index ? "0" : old));
            return;
        }
        const result = await ammContract.methods.byTokenAmount(setupInfo.liquidityPoolTokenAddress, setupTokens[index].address, props.dfoCore.toFixed(props.dfoCore.fromDecimals(value, parseInt(setupTokens[index].decimals)))).call();
        const { liquidityPoolAmount } = result;
        const ams = result.tokensAmounts;
        setLpTokenAmount(props.dfoCore.toDecimals(liquidityPoolAmount, lpTokenInfo.decimals, 8))
        setTokensAmount(tokensAmounts.map((old, i) => props.dfoCore.toDecimals(ams[i], setupTokens[i].decimals)));
        if (!setupInfo.free) {
            if (parseInt(ams[0]) > 0) {
                const reward = await lmContract.methods.calculateLockedFarmingReward(setupIndex, ams[0], false, 0).call();
                setLockedEstimatedReward(props.dfoCore.toDecimals(props.dfoCore.toFixed(reward.relativeRewardPerBlock), rewardTokenInfo.decimals));
            }
        }
    }

    const onUpdateLpTokenAmount = async (value, index) => {
        if (!value || value === 'NaN') {
            setLpTokenAmount("0");
            return;
        }
        console.log(value);
        const result = await ammContract.methods.byLiquidityPoolAmount(setupInfo.liquidityPoolTokenAddress, props.dfoCore.toFixed(props.dfoCore.fromDecimals(value, parseInt(lpTokenInfo.decimals)))).call();
        const ams = result.tokensAmounts;
        setLpTokenAmount(value)
        setTokensAmount(tokensAmounts.map((old, i) => props.dfoCore.toDecimals(ams[i], setupTokens[i].decimals)));
        if (!setupInfo.free) {
            if (parseInt(ams[0]) > 0) {
                const reward = await lmContract.methods.calculateLockedFarmingReward(setupIndex, ams[0], false, 0).call();
                setLockedEstimatedReward(props.dfoCore.toDecimals(props.dfoCore.toFixed(reward.relativeRewardPerBlock), rewardTokenInfo.decimals));
            }
        }
    }

    const addLiquidity = async () => {
        setLoading(true);
        console.log(lpTokenAmount);
        try {
            const stake = {
                setupIndex,
                amount: 0,
                amountIsLiquidityPool: addLiquidityType === 'add-lp' ? true : false,
                positionOwner: dfoCore.voidEthereumAddress,
            };
            
            let ethTokenIndex = null;
            let ethTokenValue = 0;
            if (setupInfo.involvingETH) {
                await Promise.all(setupTokens.map(async (token, i) => {
                    if (isWeth(token.address)) {
                        ethTokenIndex = i;
                    }
                }))
            }
            let lpAmount = dfoCore.toFixed(dfoCore.fromDecimals(lpTokenAmount.toString()));
            const res = await ammContract.methods.byLiquidityPoolAmount(setupInfo.liquidityPoolTokenAddress, lpAmount).call();
            // const res = await ammContract.methods.byTokensAmount(setupInfo.liquidityPoolTokenAddress,  , stake.amount).call();
            console.log(res);
            if (!setupInfo.free) {
                stake.amount = stake.amountIsLiquidityPool ? lpAmount : res.tokensAmounts[0];
                ethTokenValue = res.tokensAmounts[ethTokenIndex];
            } else {
                stake.amount = stake.amountIsLiquidityPool ? lpAmount : res.tokensAmounts[0];
                ethTokenValue = res.tokensAmounts[ethTokenIndex];
            }
            
            
            if ((currentPosition && isValidPosition(currentPosition)) || setupInfo.free) {
                // adding liquidity to the setup
                if (!currentPosition) {
                    const gasLimit = await lmContract.methods.openPosition(stake).estimateGas({ from: dfoCore.address, value: setupInfo.involvingETH ? ethTokenValue : 0  });
                    console.log(`gas cost ${gasLimit}`);
                    const result = await lmContract.methods.openPosition(stake).send({ from: dfoCore.address, gasLimit, value: setupInfo.involvingETH ? ethTokenValue : 0  });
                
                } else {
                    const gasLimit = await lmContract.methods.addLiquidity(currentPosition.positionId, stake).estimateGas({ from: dfoCore.address, value: setupInfo.involvingETH && !stake.amountIsLiquidityPool ? ethTokenValue : 0 });
                    console.log(`gas cost ${gasLimit}`);
                    const result = await lmContract.methods.addLiquidity(currentPosition.positionId, stake).send({ from: dfoCore.address, gasLimit, value: setupInfo.involvingETH && !stake.amountIsLiquidityPool ? ethTokenValue : 0 });
                }
                
            } else if (!setupInfo.free) {
                
                // opening position
                const gasLimit = await lmContract.methods.openPosition(stake).estimateGas({ from: dfoCore.address, value: setupInfo.involvingETH && !stake.amountIsLiquidityPool ? ethTokenValue : 0  });
                console.log(`gas cost ${gasLimit}`);
                const result = await lmContract.methods.openPosition(stake).send({ from: dfoCore.address, gasLimit, value: setupInfo.involvingETH && !stake.amountIsLiquidityPool ? ethTokenValue : 0  });
            }
            await getSetupMetadata();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const removeLiquidity = async () => {
        setLoading(true);
        try {
            if (setupInfo.free) {
                const removedLiquidity = removalAmount === 100 ? manageStatus.liquidityPoolAmount : props.dfoCore.toFixed(parseInt(manageStatus.liquidityPoolAmount) * removalAmount / 100).toString().split('.')[0];
                const gasLimit = await lmContract.methods.withdrawLiquidity(currentPosition.positionId, 0, unwrapPair, removedLiquidity).estimateGas({ from: dfoCore.address });
                const result = await lmContract.methods.withdrawLiquidity(currentPosition.positionId, 0, unwrapPair, removedLiquidity).send({ from: dfoCore.address, gasLimit });
            } else {
                const gasLimit = await lmContract.methods.withdrawLiquidity(0, setup.objectId, unwrapPair, farmTokenBalance).estimateGas({ from: dfoCore.address });
                const result = await lmContract.methods.withdrawLiquidity(0, setup.objectId, unwrapPair, farmTokenBalance).send({ from: dfoCore.address, gasLimit });
            }
            await getSetupMetadata();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const withdrawReward = async () => {
        setLoading(true);
        try {
            const gasLimit = await lmContract.methods.withdrawReward(currentPosition.positionId).estimateGas({ from: dfoCore.address });
            const result = await lmContract.methods.withdrawReward(currentPosition.positionId).send({ from: dfoCore.address, gasLimit});
            await getSetupMetadata();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const unlockPosition = async () => {

        setLoading(true);
        try {
            await rewardTokenInfo.contract.methods.approve(lmContract.options.address, await rewardTokenInfo.contract.methods.totalSupply().call()).send({ from: dfoCore.address });
            const gasLimit = await lmContract.methods.unlock(currentPosition.positionId, unwrapPair).estimateGas({ from: dfoCore.address });
            const result = await lmContract.methods.unlock(currentPosition.positionId, unwrapPair).send({ from: dfoCore.address, gasLimit });
            await getSetupMetadata();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const updateSetup = async () => {
        setLoading(true);
        try {
            const updatedSetup = { ...setup, rewardPerBlock: updatedRewardPerBlock, renewTimes: updatedRenewTimes };
            const updatedSetupConfiguration = { add: false, index: setupIndex, data: updatedSetup };
            const gasLimit = await extensionContract.methods.setLiquidityMiningSetups([updatedSetupConfiguration], false, false, 0).estimateGas({ from: dfoCore.address });
            const result = await extensionContract.methods.setLiquidityMiningSetups([updatedSetupConfiguration], false, false, 0).send({ from: dfoCore.address, gasLimit });
            // await getSetupMetadata();
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    }

    const getButton = () => {
        console.log(`block number ${blockNumber}`);
        console.log(`start block number ${setup.startBlock}`);
        return <>
            {
                canActivateSetup && 
                    <a className="web2ActionBTN" onClick={() => { activateSetup() }}>Activate</a>
            }
            {
                (isHost && extensionContract && !edit) && 
                    <a className="web2ActionBTN" onClick={() => { setOpen(false); setEdit(true) }}>Edit</a>
            }
            {
                (open || edit) && 
                    <a className="backActionBTN" onClick={() => { setOpen(false); setEdit(false) }}>Close</a>
            }
            {
                (parseInt(setup.startBlock) > 0 && blockNumber < parseInt(setup.startBlock)) ? 
                    <a className="web2ActionBTN" disabled={true}>{setup.startBlock}</a>
                    : (currentPosition && !open) ? 
                    <a className="web2ActionBTN" onClick={() => { setOpen(true); setEdit(false); setStatus('manage') }}>Manage</a>
                    : (setup.rewardPerBlock > 0 && !open && parseInt(setup.startBlock) <= blockNumber) ? 
                    <a className="web2ActionBTN" onClick={() => { setOpen(true); setEdit(false); setStatus('manage') }}>Farm</a>
                     : <div/>
            }
        </>
    }

    const getApproveButton = (isLp) => {
        if (!isLp) {
            const notApprovedIndex = tokensApprovals.findIndex((value) => !value);
            if (notApprovedIndex !== -1) {
                return <ApproveButton contract={tokensContracts[notApprovedIndex]} from={props.dfoCore.address} spender={lmContract.options.address} onApproval={() => onTokenApproval(notApprovedIndex, false)} onError={(error) => console.error(error)} text={`Approve ${setupTokens[notApprovedIndex].symbol}`} />
            } else {
                return <div/>
            }
        } else {
            
            if (!lpTokenInfo.approval) {
                return <ApproveButton contract={lpTokenInfo.contract} from={props.dfoCore.address} spender={lmContract.options.address} onApproval={() => onTokenApproval(null, true)} onError={(error) => console.error(error)} text={`Approve ${lpTokenInfo.symbol}`} />
            } else {
                return <div/>
            }
        }
    }

    const getAdvanced = () => {
        return !edit ? getManageAdvanced() : getEdit();
    }

    const getEdit = () => {
        return <div className="pb-4 px-4">
        <hr/>
                <div className="row mt-2 align-items-center justify-content-start">  
                    <div className="col-12 mb-md-2">
                        <Input value={dfoCore.toDecimals(updatedRewardPerBlock)} min={0} onChange={(e) => setUpdatedRewardPerBlock(dfoCore.toFixed(dfoCore.fromDecimals(e.target.value)))} label={"Reward per block"} />
                    </div>
                    {
                        !setupInfo.free && <div className="col-12 mb-md-2">
                            <Input value={updatedRenewTimes} min={0} onChange={(e) => setUpdatedRenewTimes(e.target.value)} label={"Renew times"} />
                        </div>
                    }
                    <div className="col-12">
                        <button onClick={() => updateSetup()} className="btn btn-secondary">Update</button>
                    </div>
            </div>
        </div>
    }

    const getManageAdvanced = () => {
        return <div className="pb-4 px-4">
            {
                currentPosition &&
                    <div className="row mt-2 align-items-center justify-content-start">
                        <hr/>
                        <div className="col-12 mt-4">
                            <h6 style={{fontSize: 14}}>
                                <b>Your position: </b> 
                                {window.formatMoney(dfoCore.toDecimals(manageStatus.liquidityPoolAmount, lpTokenInfo.decimals), 2)} {lpTokenInfo.symbol} - {manageStatus.tokens.map((token, i) =>  <span> {window.formatMoney(dfoCore.toDecimals(manageStatus.tokensAmounts[i], token.decimals), 2)} {token.symbol} </span>)}
                                ({setupInfo.free ? parseFloat(parseInt(manageStatus.liquidityPoolAmount/setup.totalSupply) * 100) : parseFloat(parseInt(manageStatus.mainTokenAmount)/parseInt(setupInfo.maxStakeable) * 100).toPrecision(2)}%)
                            </h6>
                        </div>
                        {
                            setupInfo.free && <>
                                <div className="col-md-6 col-12">
                                    <h6 style={{fontSize: 14}}>
                                        <b>Available reward:</b> {dfoCore.toDecimals(dfoCore.toFixed(freeAvailableRewards), rewardTokenInfo.decimals, 8)} {rewardTokenInfo.symbol}
                                    </h6>
                                </div>
                                {
                                    freeAvailableRewards === 0 && <div className="col-md-6 col-12">
                                        <button onClick={() => withdrawReward()} className="btn btn-primary">Redeem</button>
                                    </div>
                                }
                            </>
                        }
                        {
                            !setupInfo.free && <>
                                <div className="col-md-6 col-12">
                                    <h6 style={{fontSize: 14}}>
                                        <b>Available reward:</b> {dfoCore.toDecimals(dfoCore.toFixed(lockedAvailableRewards), rewardTokenInfo.decimals)} {rewardTokenInfo.symbol}
                                    </h6>
                                </div>
                                {
                                    lockedAvailableRewards === 0 && <div className="col-md-6 col-12">
                                        <button onClick={() => withdrawReward()} className="btn btn-primary">Partial reward</button>
                                    </div>
                                }
                            </>
                        }
                        {
                            !setupInfo.free && <>
                                <hr/>
                                <div className="col-md-6">
                                    <p style={{fontSize: 14}}>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quaerat animi ipsam nemo at nobis odit temporibus autem possimus quae vel, ratione numquam modi rem accusamus, veniam neque voluptates necessitatibus enim!</p>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" value={unwrapPair} onChange={(e) => setUnwrapPair(e.target.checked)} id="getLpToken" />
                                        <label className="form-check-label" htmlFor="getLpToken">
                                            Unwrap tokens
                                        </label>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <button onClick={() => unlockPosition()} className="btn btn-secondary">Unlock position</button>
                                </div>
                            </>
                        }
                        <hr/>
                    </div>
                }
                {
                    (parseInt(farmTokenBalance) > 0 && parseInt(blockNumber) >= parseInt(setup.endBlock)) && <>
                        <div className="row mt-4">
                            <b>Farm token balance</b>: {window.formatMoney(props.dfoCore.toDecimals(farmTokenBalance, 18), 2)}
                        </div>
                        <div className="row mt-2">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" value={unwrapPair} onChange={(e) => setUnwrapPair(e.target.checked)} id="getLpToken" />
                                <label className="form-check-label" htmlFor="getLpToken">
                                    Unwrap tokens
                                </label>
                            </div>
                        </div>
                        <div className="row mt-2">
                            <button onClick={() => removeLiquidity()} className="btn btn-primary">Withdraw liquidity</button>
                        </div>
                        </>
                }
                {
                    (parseInt(setup.endBlock) > parseInt(blockNumber) || currentPosition) && 
                    <div className="row mt-4">
                        <div className="col-md-6">
                            <select className="custom-select wusd-pair-select" value={addLiquidityType} onChange={(e) => setAddLiquidityType(e.target.value)}>
                                <option value="">Choose..</option>
                                {
                                    (setup.active && (setupInfo.free || !currentPosition) && parseInt(setup.endBlock) > parseInt(blockNumber)) && <>
                                        <option value="add-tokens">Add liquidity</option>
                                        <option value="add-lp">Add liquidity by LP token</option>
                                    </>
                                }
                                {
                                    (currentPosition && setupInfo.free) && <option value="remove">Remove liquidity</option>
                                }
                            </select>
                        </div>
                    </div>
                }
                    { addLiquidityType === 'add-tokens' ? <>
                        <div className="row justify-content-center mt-4">
                            <div className="col-md-9 col-12">
                                {
                                    setupTokens.map((setupToken, i) => {
                                        return <div className="row text-center mb-4">
                                            <Input showMax={true} address={setupToken.address} value={tokensAmounts[i]} balance={setupToken.balance} min={0} onChange={(e) => onUpdateTokenAmount(e.target.value, i)} showCoin={true} showBalance={true} name={setupToken.symbol} />
                                        </div>
                                    })
                                }
                                </div>
                            </div>
                            {
                                (!setupInfo.free || !currentPosition) && <div className="form-check">
                                    <input className="form-check-input" type="checkbox" checked={openPositionForAnotherWallet} onChange={(e) => setOpenPositionForAnotherWallet(e.target.checked)} id="openPositionWallet1" />
                                    <label className="form-check-label" htmlFor="openPositionWallet1">
                                        Open position for another wallet
                                    </label>
                                </div>
                            }
                            {
                                openPositionForAnotherWallet &&  <div className="row justify-content-center mb-4">
                                        <div className="col-md-9 col-12">
                                        <input type="text" value={uniqueOwner} onChange={(e) => setUniqueOwner(e.target.value)} className="form-control" id="uniqueOwner" ></input>
                                    </div>
                                </div>
                            }
                            {
                                (!setupInfo.free && rewardTokenInfo) && <div className="row justify-content-center mt-4">
                                    <b>Estimated earnings (total)</b>: {window.formatMoney(lockedEstimatedReward, 2)} {rewardTokenInfo.symbol}/block
                                </div>
                            }
                            <div className="row justify-content-center mt-4">
                                {
                                    tokensApprovals.some((value) => !value) && <div className="col-md-6 col-12">
                                        { getApproveButton() }
                                    </div>
                                }
                                <div className="col-md-6 col-12">
                                    <button className="btn btn-secondary" onClick={() => addLiquidity()} disabled={tokensApprovals.some((value) => !value) || tokensAmounts.some((value) => value === 0)}>Add</button>
                                </div>
                            </div>
                        </>  : addLiquidityType === 'add-lp' ? <>
                            <div className="row justify-content-center mt-4">
                                <div className="col-md-9 col-12">
                                    <div className="row text-center mb-4">
                                        <Input showMax={true} address={lpTokenInfo.contract.options.address} value={lpTokenAmount} balance={dfoCore.toDecimals(lpTokenInfo.balance, lpTokenInfo.decimals)} min={0} onChange={(e) => onUpdateLpTokenAmount(e.target.value)} showCoin={true} showBalance={true} name={lpTokenInfo.symbol} />
                                    </div>
                                </div>
                            </div>
                            {
                                (!setupInfo.free || !currentPosition) && <div className="form-check">
                                    <input className="form-check-input" type="checkbox" checked={openPositionForAnotherWallet} onChange={(e) => setOpenPositionForAnotherWallet(e.target.checked)} id="openPosition2" />
                                    <label className="form-check-label" htmlFor="openPosition2">
                                        Open position for another wallet
                                    </label>
                                </div>
                            }
                            {
                                openPositionForAnotherWallet && <div className="row justify-content-center mb-4">
                                        <div className="col-md-9 col-12">
                                        <input type="text" value={uniqueOwner} onChange={(e) => setUniqueOwner(e.target.value)} className="form-control" id="uniqueOwner" ></input>
                                    </div>
                                </div>
                            }
                            {
                                (!setupInfo.free && rewardTokenInfo) && <div className="row justify-content-center mt-4">
                                    <b>Estimated earnings (total)</b>: {window.formatMoney(lockedEstimatedReward, 2)} {rewardTokenInfo.symbol}/block
                                </div>
                            }
                            <div className="row justify-content-center mt-4">
                                {
                                    !lpTokenInfo.approval && <div className="col-md-6 col-12">
                                        { getApproveButton(true) }
                                    </div>
                                }
                                <div className="col-md-6 col-12">
                                    <button className="btn btn-secondary" onClick={() => addLiquidity()} disabled={!lpTokenInfo.approval || parseFloat(lpTokenAmount) === 0}>Add</button>
                                </div>
                            </div>
                        </> : addLiquidityType === 'remove' ? <> { (currentPosition && setupInfo.free) && <>
                            <div className="row justify-content-center mt-4">
                                <div className="form-group w-100">
                                    <label htmlFor="formControlRange" className="text-secondary"><b>Amount:</b> {removalAmount}%</label>
                                    <input type="range" value={removalAmount} onChange={(e) => setRemovalAmount(e.target.value)} className="form-control-range" id="formControlRange" />
                                </div>
                            </div>
                            <div className="row mt-2 justify-content-evenly">
                                <button className="btn btn-outline-secondary mr-2" onClick={() => setRemovalAmount(10)} >10%</button>
                                <button className="btn btn-outline-secondary mr-2" onClick={() => setRemovalAmount(25)} >25%</button>
                                <button className="btn btn-outline-secondary mr-2" onClick={() => setRemovalAmount(50)} >50%</button>
                                <button className="btn btn-outline-secondary mr-2" onClick={() => setRemovalAmount(75)} >75%</button>
                                <button className="btn btn-outline-secondary mr-2" onClick={() => setRemovalAmount(90)} >90%</button>
                                <button className="btn btn-outline-secondary" onClick={() => setRemovalAmount(100)} >MAX</button>
                            </div>
                            <div className="row mt-4">
                                <h6><b>Remove: </b> {window.formatMoney(dfoCore.toDecimals(dfoCore.toFixed(parseInt(manageStatus.liquidityPoolAmount) * removalAmount / 100).toString(), lpTokenInfo.decimals), 2)} {lpTokenInfo.symbol} - {manageStatus.tokens.map((token, i) =>  <span> {window.formatMoney(dfoCore.toDecimals(dfoCore.toFixed(parseInt(manageStatus.tokensAmounts[i]) * removalAmount / 100).toString(), token.decimals), 2)} {token.symbol} </span>)}</h6>
                            </div>
                            <div className="row mt-4">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value={unwrapPair} onChange={(e) => setUnwrapPair(e.target.checked)} id="getLpToken" />
                                    <label className="form-check-label" htmlFor="getLpToken">
                                        Unwrap tokens
                                    </label>
                                </div>
                            </div>
                            <div className="row justify-content-center mt-4">
                                <button onClick={() => removeLiquidity()} disabled={!removalAmount || removalAmount === 0} className="btn btn-secondary">Remove</button>
                            </div> 
                            </>
                            }
                        </> : <></>
                    }
        </div>
    }

    if (loading || !setup) {
        return (
            <div className={className}>
                <div className="row px-2 farming-component-main-row">
                    <div className="col-12 justify-content-center">
                        <div className="spinner-border text-secondary" role="status">
                            <span className="visually-hidden"></span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="FarmSetupMain">
                    <h5><b>{setupInfo.free ? "Free Farming" : "Locked Farming"} {!setup.active && <span className="text-danger">(inactive)</span>} {(!setupInfo.free && parseInt(setup.endBlock) <= blockNumber) && <span>(ended)</span>}</b> <a>{AMM.name}</a></h5>
                    <aside>
                            <p><b>block end</b>: {setup.endBlock}</p>
                            <p><b>Min to Stake</b>: {props.dfoCore.formatMoney(props.dfoCore.toDecimals(props.dfoCore.toFixed(setupInfo.minStakeable).toString()), 2)} <Coin address={rewardTokenInfo.address} /></p>
                    </aside>
                    {
                        setupInfo.free ? <>
                            <div className="SetupFarmingInstructions">
                                {/* @todo - Insert  APY Calc*/}
                                <p>{setupTokens.map((token, i) => <figure key={token.address}>{i !== 0 ? '+ ' : ''}<Coin address={token.address} /> </figure>)} = <b>APY</b>: 3% <span>(Unstable)</span></p>
                            </div>
                        </> : <>
                            <div className="SetupFarmingInstructions">
                                {/* @todo - Insert  APY Calc*/}
                                <p>{setupTokens.map((token, i) => <figure key={token.address}>{i !== 0 ? '+' : ''}<Coin address={token.address} /></figure>)} = <b>APY</b>: 3%</p>                 
                                </div>
                        </>
                    }
                <div className="SetupFarmingOthers">
                {
                        setupInfo.free ? <>
                            <p><b>Reward/Block</b>: {props.dfoCore.toDecimals(setup.rewardPerBlock)} {rewardTokenInfo.symbol} <span>(Shared)</span></p>
                        </> : <>
                            {/* @todo - Insert  Reward for main token staked and Available to stake*/}
                            {/* @todo - Setup Reward Token Symbol don't work*/}
                            <p><b>Max Stakeable</b>: {window.formatMoney(dfoCore.toDecimals(setupInfo.maxStakeable), 4)} {rewardTokenInfo.symbol}</p> 
                            <p><b>Available</b>: {window.formatMoney(dfoCore.toDecimals(parseInt(setupInfo.maxStakeable) - parseInt(setup.totalSupply)), 4)} {rewardTokenInfo.symbol}</p>
                            <p><b>1 {setupTokens[0].symbol} Staked</b> = {parseFloat((setup.rewardPerBlock * (1 / setupInfo.maxStakeable)).toPrecision(4))} {rewardTokenInfo.symbol}/block</p>
                        </>
                    }
                </div>
                <div className="SetupFarmingBotton">
                        { getButton() }
                </div>
            </div>
            {
                (open && !edit) ? <><hr/>{getAdvanced()}</> : <div/>
            }
            {
                (edit && !open) ? getEdit() : <div/>
            }
        </div>
    )
}

export default SetupComponent;