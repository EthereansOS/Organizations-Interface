import Coin from '../coin/Coin';
import { useEffect, useState } from 'react';
import { Input, ApproveButton } from '..';
import axios from 'axios';

const SetupComponent = (props) => {
    let { className, dfoCore, setupIndex, lmContract, manage, farm, redeem, hostedBy } = props;
    const [setup, setSetup] = useState(null);
    const [setupInfo, setSetupInfo] = useState(null);
    const [open, setOpen] = useState(false);
    const [blockNumber, setBlockNumber] = useState(0);
    const [loading, setLoading] = useState(true);
    const [AMM, setAMM] = useState({ name: "", version: "" });
    const [ammContract, setAmmContract] = useState(null);
    const [extensionContract, setExtensionContract] = useState(null);
    const [edit, setEdit] = useState(false);
    const [farmTokenSymbol, setFarmTokenSymbol] = useState("");
    const [farmTokenBalance, setFarmTokenBalance] = useState(0);
    const [canActivateSetup, setCanActivateSetup] = useState(false);
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
    const [removalAmount, setRemovalAmount] = useState(0);
    const [manageStatus, setManageStatus] = useState(null);
    const [unwrapPair, setUnwrapPair] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [updatedRewardPerBlock, setUpdatedRewardPerBlock] = useState(0);
    const [updatedRenewTimes, setUpdatedRenewTimes] = useState(0);
    const [openPositionForAnotherWallet, setOpenPositionForAnotherWallet] = useState(false);
    const [uniqueOwner, setUniqueOwner] = useState("");
    const [apy, setApy] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    const [rewardInterval, setRewardInterval] = useState(null);
    const [inputType, setInputType] = useState("add-pair");
    const [ethAmount, setEthAmount] = useState("");
    const [ethBalanceOf, setEthBalanceOf] = useState("0");

    useEffect(() => {
        getSetupMetadata();
        return () => {
            console.log('clearing interval.');
            if (intervalId) clearInterval(intervalId);
        }
    }, []);

    useEffect(() => {
        if (intervalId) clearInterval(intervalId);
        if (setupTokens && setupTokens.length > 0) {
            const interval = setInterval(async () => {
                const lpTokenBalance = await lpTokenInfo.contract.methods.balanceOf(dfoCore.address).call();
                const lpTokenApproval = await lpTokenInfo.contract.methods.allowance(dfoCore.address, lmContract.options.address).call();
                setLpTokenInfo({ ...lpTokenInfo, balance: lpTokenBalance, approval: parseInt(lpTokenApproval) !== 0 });
                const tokenAddress = setupInfo.liquidityPoolTokenAddress;
                let res;
                if (setupInfo.free) {
                    res = await ammContract.methods.byLiquidityPoolAmount(tokenAddress, setup.totalSupply).call();
                } else {
                    res = await ammContract.methods.byTokenAmount(tokenAddress, setupInfo.mainTokenAddress, setup.totalSupply).call();
                    res = await ammContract.methods.byLiquidityPoolAmount(tokenAddress, res.liquidityPoolAmount).call();
                }
                const tokens = [];
                const approvals = [];
                const contracts = [];
                for (let i = 0; i < res.liquidityPoolTokens.length; i++) {
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
                setSetupTokens(tokens);
                setTokensContracts(contracts);
                setTokensApprovals(approvals);
                if (currentPosition && currentPosition.positionId) {
                    const positionId = currentPosition.positionId;
                    const position = await lmContract.methods.position(positionId).call();
                    setCurrentPosition(position.creationBlock != "0" ? { ...position, positionId } : null);
                    if (position.creationBlock != "0") {
                        const free = position['free'];
                        const creationBlock = position['creationBlock'];
                        const positionSetupIndex = position['setupIndex'];
                        const liquidityPoolTokenAmount = position['liquidityPoolTokenAmount'];
                        const mainTokenAmount = position['mainTokenAmount'];
                        const amounts = await ammContract.methods.byLiquidityPoolAmount(setupInfo.liquidityPoolTokenAddress, liquidityPoolTokenAmount).call();
                        if (!setupInfo.free) {
                            const availableReward = await lmContract.methods.calculateLockedFarmingReward(0, 0, true, positionId).call();
                            console.log(availableReward.reward);
                            let lockedReward = parseInt(availableReward.reward) + parseInt(position.lockedRewardPerBlock);
                            setLockedAvailableRewards(lockedReward);
                        } else {
                            const availableReward = await lmContract.methods.calculateFreeFarmingReward(positionId, true).call();
                            let freeReward = parseInt(availableReward);
                            if (blockNumber < parseInt(setup.endBlock)) {
                                freeReward += (parseInt(setup.rewardPerBlock) * (parseInt(position.liquidityPoolTokenAmount) / parseInt(setup.totalSupply)))
                            }
                            setFreeAvailableRewards(freeReward);
                        }
                        setManageStatus({ free, creationBlock, positionSetupIndex, liquidityPoolAmount: liquidityPoolTokenAmount, mainTokenAmount, tokensAmounts: amounts['tokensAmounts'], tokens })
                    }
                }
            }, 2000);
            setIntervalId(interval);
        }
    }, [tokensApprovals]);

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
            console.log(farmSetup);
            const farmSetupInfo = await lmContract.methods._setupsInfo(farmSetup.infoIndex).call();
            const farmTokenCollectionAddress = await lmContract.methods._farmTokenCollection().call();
            const farmTokenCollection = await props.dfoCore.getContract(props.dfoCore.getContextElement('INativeV1ABI'), farmTokenCollectionAddress);
            if (!farmSetup.free) {
                // retrieve farm token data
                const objectId = farmSetup.objectId;
                if (objectId !== "0") {
                    const ftBalance = await farmTokenCollection.methods.balanceOf(props.dfoCore.address, objectId).call();
                    const ftSymbol = await farmTokenCollection.methods.symbol(objectId).call();
                    setFarmTokenSymbol(ftSymbol);
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
                address: lmContract.options.address,
                topics: [
                    window.web3.utils.sha3("Transfer(uint256,address,address)")
                ],
                fromBlock: await window.web3ForLogs.eth.getBlockNumber() - 1000,
                toBlock: await window.web3ForLogs.eth.getBlockNumber(),
            });
            await Promise.all(events.map(async (event) => {
                const { topics } = event;
                var positionId = props.dfoCore.web3.eth.abi.decodeParameter("uint256", topics[1]);
                const pos = await lmContract.methods.position(positionId).call();
                console.log(pos);
                if (dfoCore.isValidPosition(pos) && parseInt(pos.setupIndex) === parseInt(setupIndex)) {
                    position = { ...pos, positionId: positionId };
                }
            }))
            setCurrentPosition(position);
            if (!position) {
                setOpen(false);
            }
            const extensionAddress = await lmContract.methods._extension().call();
            const extContract = await dfoCore.getContract(dfoCore.getContextElement("FarmExtensionABI"), extensionAddress);
            setExtensionContract(extContract);
            const rewardTokenAddress = await lmContract.methods._rewardTokenAddress().call();
            const rewardToken = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), rewardTokenAddress);
            const rewardTokenSymbol = await rewardToken.methods.symbol().call();
            const rewardTokenDecimals = await rewardToken.methods.decimals().call();
            console.log(`reward token balance: ${await rewardToken.methods.balanceOf(dfoCore.address).call()}`);
            setRewardTokenInfo({ contract: rewardToken, symbol: rewardTokenSymbol, decimals: rewardTokenDecimals, address: rewardTokenAddress });

            const lpToken = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), farmSetupInfo.liquidityPoolTokenAddress);
            const lpTokenSymbol = await lpToken.methods.symbol().call();
            const lpTokenDecimals = await lpToken.methods.decimals().call();
            const lpTokenBalance = await lpToken.methods.balanceOf(dfoCore.address).call();
            const lpTokenApproval = await lpToken.methods.allowance(dfoCore.address, lmContract.options.address).call();
            setLpTokenInfo({ contract: lpToken, symbol: lpTokenSymbol, decimals: lpTokenDecimals, balance: lpTokenBalance, approval: parseInt(lpTokenApproval) !== 0 });
            const bNumber = await dfoCore.getBlockNumber();
            setBlockNumber(bNumber);
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
            for (let i = 0; i < res.liquidityPoolTokens.length; i++) {
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
                if (!farmSetupInfo.free) {
                    const availableReward = await lmContract.methods.calculateLockedFarmingReward(0, 0, true, position.positionId).call();
                    console.log(availableReward.reward);
                    let lockedReward = parseInt(availableReward.reward) + parseInt(position.lockedRewardPerBlock);
                    setLockedAvailableRewards(lockedReward);
                } else {
                    const availableReward = await lmContract.methods.calculateFreeFarmingReward(position.positionId, true).call();
                    console.log(availableReward);
                    let freeReward = parseInt(availableReward);
                    if (blockNumber < parseInt(farmSetup.endBlock)) {
                        freeReward += (parseInt(farmSetup.rewardPerBlock) * (parseInt(position.liquidityPoolTokenAmount) / parseInt(farmSetup.totalSupply)))
                    }
                    setFreeAvailableRewards(freeReward);
                }
                setManageStatus({ free, creationBlock, positionSetupIndex, liquidityPoolAmount: liquidityPoolTokenAmount, mainTokenAmount, tokensAmounts: amounts['tokensAmounts'], tokens })
            }
            // calculate APY
            let rewardTokenPriceUsd = 0;
            try {
                const { data } = await axios.get(dfoCore.getContextElement("coingeckoCoinPriceURL") + rewardTokenAddress);
                rewardTokenPriceUsd = data[rewardTokenAddress.toLowerCase()].usd;
            } catch (error) {
                rewardTokenPriceUsd = 0;
            }
            const yearlyBlocks = 2304000;
            if (farmSetup.totalSupply !== "0") {
                setApy((parseInt(farmSetup.rewardPerBlock) * yearlyBlocks) / parseInt(farmSetup.totalSupply) * rewardTokenPriceUsd);
            }
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
        try {
            const stake = {
                setupIndex,
                amount: 0,
                amountIsLiquidityPool: inputType === 'add-lp' ? true : false,
                positionOwner: uniqueOwner || dfoCore.voidEthereumAddress,
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
                    const gasLimit = await lmContract.methods.openPosition(stake).estimateGas({ from: dfoCore.address, value: setupInfo.involvingETH ? ethTokenValue : 0 });
                    console.log(gasLimit);
                    const result = await lmContract.methods.openPosition(stake).send({ from: dfoCore.address, gasLimit, value: setupInfo.involvingETH ? ethTokenValue : 0 });

                } else {
                    const gasLimit = await lmContract.methods.addLiquidity(currentPosition.positionId, stake).estimateGas({ from: dfoCore.address, value: setupInfo.involvingETH && !stake.amountIsLiquidityPool ? ethTokenValue : 0 });
                    const result = await lmContract.methods.addLiquidity(currentPosition.positionId, stake).send({ from: dfoCore.address, gasLimit, value: setupInfo.involvingETH && !stake.amountIsLiquidityPool ? ethTokenValue : 0 });
                }

            } else if (!setupInfo.free) {

                // opening position
                const gasLimit = await lmContract.methods.openPosition(stake).estimateGas({ from: dfoCore.address, value: setupInfo.involvingETH && !stake.amountIsLiquidityPool ? ethTokenValue : 0 });
                console.log(gasLimit);
                const result = await lmContract.methods.openPosition(stake).send({ from: dfoCore.address, gasLimit, value: setupInfo.involvingETH && !stake.amountIsLiquidityPool ? ethTokenValue : 0 });
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
                console.log(gasLimit);
                const result = await lmContract.methods.withdrawLiquidity(currentPosition.positionId, 0, unwrapPair, removedLiquidity).send({ from: dfoCore.address, gasLimit });
            } else {
                const gasLimit = await lmContract.methods.withdrawLiquidity(0, setup.objectId, unwrapPair, farmTokenBalance).estimateGas({ from: dfoCore.address });
                console.log(gasLimit);
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
            console.log(gasLimit);
            const result = await lmContract.methods.withdrawReward(currentPosition.positionId).send({ from: dfoCore.address, gasLimit });
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
            const updatedSetup = {
                free: false,
                blockDuration: 0,
                originalRewardPerBlock: updatedRewardPerBlock,
                minStakeable: 0,
                maxStakeable: 0,
                renewTimes: updatedRenewTimes,
                ammPlugin: dfoCore.voidEthereumAddress,
                liquidityPoolTokenAddress: dfoCore.voidEthereumAddress,
                mainTokenAddress: dfoCore.voidEthereumAddress,
                ethereumAddress: dfoCore.voidEthereumAddress,
                involvingETH: false,
                penaltyFee: 0,
                setupsCount: 0,
                lastSetupIndex: 0,
            };
            const updatedSetupConfiguration = { add: false, disable: false, index: parseInt(setupIndex), info: updatedSetup };
            const gasLimit = await extensionContract.methods.setFarmingSetups([updatedSetupConfiguration]).estimateGas({ from: dfoCore.address });
            const result = await extensionContract.methods.setFarmingSetups([updatedSetupConfiguration]).send({ from: dfoCore.address, gasLimit });
            await getSetupMetadata();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const disableSetup = async () => {
        setLoading(true);
        try {
            const updatedSetup = {
                free: false,
                blockDuration: 0,
                originalRewardPerBlock: 0,
                minStakeable: 0,
                maxStakeable: 0,
                renewTimes: 0,
                ammPlugin: dfoCore.voidEthereumAddress,
                liquidityPoolTokenAddress: dfoCore.voidEthereumAddress,
                mainTokenAddress: dfoCore.voidEthereumAddress,
                ethereumAddress: dfoCore.voidEthereumAddress,
                involvingETH: false,
                penaltyFee: 0,
                setupsCount: 0,
                lastSetupIndex: 0,
            };
            const updatedSetupConfiguration = { add: false, disable: true, index: parseInt(setupIndex), info: updatedSetup };
            const gasLimit = await extensionContract.methods.setFarmingSetups([updatedSetupConfiguration]).estimateGas({ from: dfoCore.address });
            const result = await extensionContract.methods.setFarmingSetups([updatedSetupConfiguration]).send({ from: dfoCore.address, gasLimit });
            await getSetupMetadata();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const getButton = () => {
        return <>
            {
                canActivateSetup &&
                <a className="web2ActionBTN" onClick={() => { activateSetup() }}>Activate</a>
            }
            {
                (hostedBy && extensionContract && !edit && parseInt(setupInfo.lastSetupIndex) === parseInt(setupIndex) && hostedBy) &&
                <a className="web2ActionBTN" onClick={() => { setOpen(false); setEdit(true) }}>Edit</a>
            }
            {
                (open || edit) &&
                <a className="backActionBTN" onClick={() => { setOpen(false); setEdit(false) }}>Close</a>
            }
            {
                ((currentPosition || parseInt(farmTokenBalance) > 0) && !open) ?
                    <a className="web2ActionBTN" onClick={() => { setOpen(true); setEdit(false); }}>Manage</a>
                    : (setup.rewardPerBlock > 0 && !open && parseInt(setup.startBlock) <= blockNumber && parseInt(setup.endBlock) > blockNumber && setup.active) ?
                        <a className="web2ActionBTN" onClick={() => { setOpen(true); setEdit(false); }}>Farm</a>
                        : <div />
            }
        </>
    }

    const getApproveButton = (isLp) => {
        if (!isLp) {
            const notApprovedIndex = tokensApprovals.findIndex((value) => !value);
            if (notApprovedIndex !== -1) {
                return <ApproveButton contract={tokensContracts[notApprovedIndex]} from={props.dfoCore.address} spender={lmContract.options.address} onApproval={() => onTokenApproval(notApprovedIndex, false)} onError={(error) => console.error(error)} text={`Approve ${setupTokens[notApprovedIndex].symbol}`} />
            } else {
                return <div />
            }
        } else {

            if (!lpTokenInfo.approval) {
                return <ApproveButton contract={lpTokenInfo.contract} from={props.dfoCore.address} spender={lmContract.options.address} onApproval={() => onTokenApproval(null, true)} onError={(error) => console.error(error)} text={`Approve ${lpTokenInfo.symbol}`} />
            } else {
                return <div />
            }
        }
    }

    const onInputTypeChange = e => {
        setInputType(e.target.value);
        props.dfoCore.web3.eth.getBalance(props.dfoCore.address).then(setEthBalanceOf);
    }

    const updateEthAmount = async amount => {
        try {
            setEthAmount(amount || "0");
            if (!amount) {
                return;
            };
        } catch (error) {
            console.error(error);
        }
    }

    const getAdvanced = () => {
        return !edit ? getManageAdvanced() : getEdit();
    }

    const getEdit = () => {
        return <div className="pb-4 px-4">
            <hr />
            <div className="row mt-2 align-items-center justify-content-start">
                {
                    setupInfo.free &&
                    <div className="col-12 mb-md-2">
                        <Input value={dfoCore.toDecimals(updatedRewardPerBlock)} min={0} onChange={(e) => setUpdatedRewardPerBlock(dfoCore.toFixed(dfoCore.fromDecimals(e.target.value), rewardTokenInfo.decimals))} label={"Reward per block"} />
                    </div>
                }
                <div className="col-12 mb-md-2">
                    <Input value={updatedRenewTimes} min={0} onChange={(e) => setUpdatedRenewTimes(e.target.value)} label={"Renew times"} />
                </div>
                <div className="col-12">
                    <button onClick={() => updateSetup()} className="btn btn-secondary">Update</button>
                    {setup.active && <button onClick={() => disableSetup()} className="btn btn-primary">Disable</button>}
                </div>
            </div>
        </div>
    }

    const getManageAdvanced = () => {
        return <div className="pb-4 px-4">
            {
                currentPosition &&
                <div className="row mt-2 align-items-center justify-content-start">
                    <hr />
                    <div className="col-12 mt-4">
                        <h6 style={{ fontSize: 14 }}>
                            <b>Your position: </b>
                            {window.formatMoney(dfoCore.toDecimals(manageStatus.liquidityPoolAmount, lpTokenInfo.decimals), 2)} {lpTokenInfo.symbol} - {manageStatus.tokens.map((token, i) => <span> {window.formatMoney(dfoCore.toDecimals(manageStatus.tokensAmounts[i], token.decimals), 2)} {token.symbol} </span>)}
                                ({setupInfo.free ? parseFloat(parseInt(manageStatus.liquidityPoolAmount / setup.totalSupply) * 100) : parseFloat(parseInt(manageStatus.mainTokenAmount) / parseInt(setupInfo.maxStakeable) * 100).toPrecision(2)}%)
                            </h6>
                    </div>
                    {
                        setupInfo.free && <>
                            <div className="col-md-6 col-12">
                                <h6 style={{ fontSize: 14 }}>
                                    <b>Available reward:</b> {dfoCore.toDecimals(dfoCore.toFixed(freeAvailableRewards), rewardTokenInfo.decimals)} {rewardTokenInfo.symbol}
                                </h6>
                            </div>
                            {
                                parseInt(freeAvailableRewards) > 0 && <div className="col-md-6 col-12">
                                    <button onClick={() => withdrawReward()} className="btn btn-primary">Withdraw reward</button>
                                </div>
                            }
                        </>
                    }
                    {
                        !setupInfo.free && <>
                            <div className="col-md-6 col-12">
                                <h6 style={{ fontSize: 14 }}>
                                    <b>Available reward:</b> {window.formatMoney(dfoCore.toDecimals(dfoCore.toFixed(lockedAvailableRewards), rewardTokenInfo.decimals), 4)} {rewardTokenInfo.symbol}
                                </h6>
                            </div>
                            {
                                parseInt(lockedAvailableRewards) > 0 && <div className="col-md-6 col-12">
                                    <button onClick={() => withdrawReward()} className="btn btn-primary">Withdraw reward</button>
                                </div>
                            }
                        </>
                    }
                    {
                        (!setupInfo.free && blockNumber >= parseInt(setup.startBlock) && blockNumber < parseInt(setup.endBlock)) && <>
                            <hr />
                            <div className="col-md-6">
                                <p style={{ fontSize: 14 }}>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quaerat animi ipsam nemo at nobis odit temporibus autem possimus quae vel, ratione numquam modi rem accusamus, veniam neque voluptates necessitatibus enim!</p>
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
                    <hr />
                </div>
            }
            {
                (parseInt(farmTokenBalance) > 0 && parseInt(blockNumber) >= parseInt(setup.endBlock)) && <>
                    <div className="row mt-4">
                        <b>Farm token balance</b>: {window.formatMoney(props.dfoCore.toDecimals(farmTokenBalance, 18), 2)} {farmTokenSymbol}
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
                        <div className="QuestionRegular">
                            {setup.active && (setupInfo.free || !currentPosition) && parseInt(setup.endBlock) > parseInt(blockNumber) && <>
                                <label className="PrestoSelector">
                                    <span>Add Liquidity by Pair</span>
                                    <input name="inputType" type="radio" value="add-pair" checked={inputType === "add-pair"} onChange={onInputTypeChange} />
                                </label>
                                <label className="PrestoSelector">
                                    <span>Add Liquidity by ETH</span>
                                    <input name="inputType" type="radio" value="add-eth" checked={inputType === "add-eth"} onChange={onInputTypeChange} />
                                </label>
                                <label className="PrestoSelector">
                                    <span>Add Liquidity by LP Token</span>
                                    <input name="inputType" type="radio" value="add-lp" checked={inputType === "add-lp"} onChange={onInputTypeChange} />
                                </label>
                            </>}
                            {(currentPosition && setupInfo.free) && <label className="PrestoSelector">
                                <span>Remove Liquidity</span>
                                <input name="inputType" type="radio" value="remove" checked={inputType === "remove"} onChange={onInputTypeChange} />
                            </label>}
                        </div>
                    </div>
                </div>
            }
            {inputType === 'add-pair' ? <>
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
                    openPositionForAnotherWallet && <div className="row justify-content-center mb-4">
                        <div className="col-md-9 col-12">
                            <input type="text" placeholder={"Position owner address"} value={uniqueOwner} onChange={(e) => setUniqueOwner(e.target.value)} className="form-control" id="uniqueOwner" ></input>
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
                            {getApproveButton()}
                        </div>
                    }
                    <div className="col-md-6 col-12">
                        <button className="btn btn-secondary" onClick={() => addLiquidity()} disabled={tokensApprovals.some((value) => !value) || tokensAmounts.some((value) => value === 0)}>Add</button>
                    </div>
                </div>
            </> : inputType === 'add-lp' ? <>
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
                            {getApproveButton(true)}
                        </div>
                    }
                    <div className="col-md-6 col-12">
                        <button className="btn btn-secondary" onClick={() => addLiquidity()} disabled={!lpTokenInfo.approval || parseFloat(lpTokenAmount) === 0}>Add</button>
                    </div>
                </div>
            </> : 
             inputType === 'add-eth' ? <>
             <div className="row justify-content-center mt-4">
                 <div className="col-md-9 col-12">
                     <div className="row text-center mb-4">
                         <Input showMax={true} address={window.voidEthereumAddress} value={ethAmount} balance={dfoCore.toDecimals(ethBalanceOf, 18)} min={0} onChange={e => updateEthAmount(e.target.value)} showCoin={true} showBalance={true} name={"ETH"} />
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
                         {getApproveButton(true)}
                     </div>
                 }
                 <div className="col-md-6 col-12">
                     <button className="btn btn-secondary" onClick={() => addLiquidity()} disabled={!lpTokenInfo.approval || parseFloat(lpTokenAmount) === 0}>Add</button>
                 </div>
             </div>
         </> : inputType === 'remove' ? <> {(currentPosition && setupInfo.free) && <>
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
                    <h6><b>Remove: </b> {window.formatMoney(dfoCore.toDecimals(dfoCore.toFixed(parseInt(manageStatus.liquidityPoolAmount) * removalAmount / 100).toString(), lpTokenInfo.decimals), 2)} {lpTokenInfo.symbol} - {manageStatus.tokens.map((token, i) => <span> {window.formatMoney(dfoCore.toDecimals(dfoCore.toFixed(parseInt(manageStatus.tokensAmounts[i]) * removalAmount / 100).toString(), token.decimals), 2)} {token.symbol} </span>)}</h6>
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
                    <div className="col-12 flex justify-content-center align-items-center">
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
                <h5><b>{setupInfo.free ? "Free Farming" : "Locked Farming"} {!setup.active && <span className="text-danger">(inactive)</span>} {(parseInt(setup.endBlock) <= blockNumber && parseInt(setup.endBlock) !== 0) && <span>(ended)</span>}</b> <a>{AMM.name}</a></h5>
                <aside>
                    <p><b>block end</b>: <a target="_blank" href={"https://etherscan.io/block/" + setup.endBlock}>{setup.endBlock}</a></p>
                    <p><b>Min to Stake</b>: {props.dfoCore.formatMoney(props.dfoCore.toDecimals(props.dfoCore.toFixed(setupInfo.minStakeable).toString()), 2)} {rewardTokenInfo.symbol}</p>
                </aside>
                {
                    setupInfo.free ? <>
                        <div className="SetupFarmingInstructions">
                            <div className="SetupFarmingBotton">
                                {getButton()}
                            </div>
                            <p>{setupTokens.map((token, i) => <figure key={token.address}>{i !== 0 ? '+ ' : ''}<Coin address={token.address} /> </figure>)} = <b>APY</b>: {window.formatMoney(apy, 0)}%</p>
                        </div>
                    </> : <>
                        <div className="SetupFarmingInstructions">
                            <p>{setupTokens.map((token, i) => <figure key={token.address}>{i !== 0 ? '+' : ''}<Coin address={token.address} /></figure>)} = <b>APY</b>: {window.formatMoney(apy, 0)}%</p>
                        </div>
                    </>
                }
                <div className="SetupFarmingOthers">
                    {
                        setupInfo.free ? <>
                            <p><b>Tot Reward/day</b>: {props.dfoCore.toDecimals(setup.rewardPerBlock)} {rewardTokenInfo.symbol} - {props.dfoCore.toDecimals(setup.rewardPerBlock)} {rewardTokenInfo.symbol} per Block  <span>(Shared)</span></p>
                            <p><b>Deposited</b>: {props.dfoCore.toDecimals(setup.rewardPerBlock)} {rewardTokenInfo.symbol} - {props.dfoCore.toDecimals(setup.rewardPerBlock)} {rewardTokenInfo.symbol}</p>
                        </> : <>
                            <p><b>Max Stakeable</b>: {window.formatMoney(dfoCore.toDecimals(setupInfo.maxStakeable), 4)} {rewardTokenInfo.symbol}</p>
                            {parseInt(setup.endBlock) > blockNumber && <p><b>Available</b>: {window.formatMoney(dfoCore.toDecimals(parseInt(setupInfo.maxStakeable) - parseInt(setup.totalSupply)), 4)} {rewardTokenInfo.symbol}</p>}
                            <p><b>1 {setupTokens[0].symbol} Staked</b> = {parseFloat((setup.rewardPerBlock * (1 / setupInfo.maxStakeable)).toPrecision(4))} {rewardTokenInfo.symbol}/block</p>
                        </>
                    }
                </div>
            </div>
            {
                (open && !edit) ? <><hr />{getAdvanced()}</> : <div />
            }
            {
                (edit && !open) ? getEdit() : <div />
            }
        </div>
    )
}

export default SetupComponent;