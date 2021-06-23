import Coin from '../coin/Coin';
import { useEffect, useState } from 'react';
import { Input, ApproveButton } from '..';
import { connect } from 'react-redux';
import { addTransaction } from '../../../store/actions';
import SwitchIcon from "../../../assets/images/switch.png";
import ArrowIcon from "../../../assets/images/arrow.png";
import Loading from "../Loading";
import { useRef } from 'react';
import { tickToPrice, Pool, Position, nearestUsableTick, TICK_SPACINGS, TickMath, maxLiquidityForAmounts } from '@uniswap/v3-sdk/dist/';
import { Token } from "@uniswap/sdk-core/dist";

const SetupComponentGen2 = (props) => {
    let { className, dfoCore, setupIndex, lmContract, hostedBy } = props;
    // general info and setup data
    const [setup, setSetup] = useState(null);
    const [setupInfo, setSetupInfo] = useState(null);
    const [blockNumber, setBlockNumber] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activateLoading, setActivateLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [removeLoading, setRemoveLoading] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);
    const [transferLoading, setTransferLoading] = useState(false);
    // panel status
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(false);
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [showFreeTransfer, setShowFreeTransfer] = useState(false);
    const [canActivateSetup, setCanActivateSetup] = useState(false);
    const [setupReady, setSetupReady] = useState(false);
    const [showPrestoError, setShowPrestoError] = useState(false);
    // amm data
    const [AMM, setAMM] = useState({ name: "", version: "" });
    const [ammContract, setAmmContract] = useState(null);

    const [freeTransferAddress, setFreeTransferAddress] = useState("");
    const [extensionContract, setExtensionContract] = useState(null);
    const [farmTokenDecimals, setFarmTokenDecimals] = useState(18);
    const [farmTokenERC20Address, setFarmTokenERC20Address] = useState("");
    const [farmTokenSymbol, setFarmTokenSymbol] = useState("");
    const [farmTokenBalance, setFarmTokenBalance] = useState("0");
    const [farmTokenRes, setFarmTokenRes] = useState([]);
    const [setupTokens, setSetupTokens] = useState([]);
    const [tokensAmounts, setTokensAmount] = useState([]);
    const [tokensApprovals, setTokensApprovals] = useState([]);
    const [tokensContracts, setTokensContracts] = useState([]);
    const [lpTokenAmount, setLpTokenAmount] = useState(null);
    const [lockedEstimatedReward, setLockedEstimatedReward] = useState(0);
    const [freeEstimatedReward, setFreeEstimatedReward] = useState(0);
    const [lpTokenInfo, setLpTokenInfo] = useState(null);
    const [mainTokenInfo, setMainTokenInfo] = useState(null);
    const [rewardTokenInfo, setRewardTokenInfo] = useState(null);
    const [removalAmount, setRemovalAmount] = useState(0);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [manageStatus, setManageStatus] = useState(null);
    const [freeAvailableRewards, setFreeAvailableRewards] = useState(0);
    const [lockedPositions, setLockedPositions] = useState([]);
    const [lockedPositionStatuses, setLockedPositionStatuses] = useState([]);
    const [lockedPositionRewards, setLockedPositionRewards] = useState([]);
    const [updatedRewardPerBlock, setUpdatedRewardPerBlock] = useState(0);
    const [updatedRenewTimes, setUpdatedRenewTimes] = useState(0);
    const [openPositionForAnotherWallet, setOpenPositionForAnotherWallet] = useState(false);
    const [uniqueOwner, setUniqueOwner] = useState("");
    const [apy, setApy] = useState(0);
    const [inputType, setInputType] = useState("add-pair");
    const [outputType, setOutputType] = useState("to-pair");
    const [ethAmount, setEthAmount] = useState(0);
    const [ethBalanceOf, setEthBalanceOf] = useState("0");
    const intervalId = useRef(null);
    const [prestoData, setPrestoData] = useState(null);
    const [selectedAmmIndex, setSelectedAmmIndex] = useState(0);
    const [amms, setAmms] = useState(0);
    const [loadingPrestoData, setLoadingPrestoData] = useState(false);
    const [delayedBlock, setDelayedBlock] = useState(0);
    const [endBlockReached, setEndBlockReached] = useState(false);
    const [secondTokenIndex, setsecondTokenIndex] = useState(0);
    const [tickData, setTickData] = useState(null);

    const [withdrawingAll, setWithdrawingAll] = useState(false);

    const ethereumAddress = props.dfoCore.getContextElement("wethTokenAddress");

    function getFarmingPrestoAddress() {
        var prestoAddress = props.dfoCore.getContextElement("farmingPrestoAddress");
        var oldPrestoAddress = props.dfoCore.getContextElement("farmingPrestoAddressOld");
        var oldFarmingPrestoContracts = props.dfoCore.getContextElement("oldFarmingPrestoContracts").map(it => props.dfoCore.web3.utils.toChecksumAddress(it));
        var lmContractAddress = props.dfoCore.web3.utils.toChecksumAddress(lmContract.options.address);
        return oldFarmingPrestoContracts.indexOf(lmContractAddress) === -1 ? prestoAddress : oldPrestoAddress;
    }

    var farmingPresto = new props.dfoCore.web3.eth.Contract(props.dfoCore.getContextElement("FarmingPrestoABI"), getFarmingPrestoAddress());

    useEffect(() => {
        getSetupMetadata();
        return () => {
            clearInterval(intervalId.current)
        }
    }, []);

    useEffect(() => {
        updateEthAmount(ethAmount);
    }, [uniqueOwner, selectedAmmIndex]);

    useEffect(async () => {
        try {
            var slot = await lpTokenInfo.contract.methods.slot0().call();
            var a = window.formatNumber(tickToPrice(lpTokenInfo.uniswapTokens[0], lpTokenInfo.uniswapTokens[1], parseInt(setupInfo.tickLower)).toSignificant(15));
            var b = window.formatNumber(tickToPrice(lpTokenInfo.uniswapTokens[0], lpTokenInfo.uniswapTokens[1], parseInt(setupInfo.tickUpper)).toSignificant(15));
            var c = window.formatNumber(tickToPrice(lpTokenInfo.uniswapTokens[0], lpTokenInfo.uniswapTokens[1], parseInt(slot.tick)).toSignificant(15));
            var tickData = {
                maxPrice : tickToPrice(lpTokenInfo.uniswapTokens[1 - secondTokenIndex], lpTokenInfo.uniswapTokens[secondTokenIndex], parseInt(setupInfo.tickLower)).toSignificant(18),
                minPrice : tickToPrice(lpTokenInfo.uniswapTokens[1 - secondTokenIndex], lpTokenInfo.uniswapTokens[secondTokenIndex], parseInt(setupInfo.tickUpper)).toSignificant(18),
                currentPrice : tickToPrice(lpTokenInfo.uniswapTokens[1 - secondTokenIndex], lpTokenInfo.uniswapTokens[secondTokenIndex], parseInt(slot.tick)).toSignificant(18),
                cursorNumber : !(c > a) ? 100 : !(c < b) ? 0 : null,
                outOfRangeLower : parseInt(slot.tick) <= parseInt(setupInfo.tickLower),
                outOfRangeUpper : parseInt(slot.tick) >= parseInt(setupInfo.tickUpper)
            };
            if(secondTokenIndex === 1) {
                var maxPrice = tickData.maxPrice;
                tickData.maxPrice = tickData.minPrice;
                tickData.minPrice = maxPrice;
            }
            if(tickData.cursorNumber !== 0 && tickData.cursorNumber !== 100) {
                tickData.cursorNumber = window.formatNumber(Math.floor((1 / ((Math.sqrt(a * b) - Math.sqrt(b * c)) / (c - Math.sqrt(b * c)) + 1)) * 100));
            }
            tickData.cursor = window.formatMoney(tickData.cursorNumber, 2);
            setTickData(tickData);
        } catch(e) {
        }
    }, [lpTokenInfo, secondTokenIndex, setupInfo]);

    async function toggleSetup() {
        try {
            const gasLimit = await lmContract.methods.toggleSetup(setup.infoIndex).estimateGas({ from: dfoCore.address });
            const result = await lmContract.methods.toggleSetup(setup.infoIndex).send({ from: dfoCore.address, gas: parseInt(gasLimit * (props.dfoCore.getContextElement("farmGasMultiplier") || 1)), gasLimit: parseInt(gasLimit * (props.dfoCore.getContextElement("farmGasMultiplier") || 1)) });
        } catch(e) {
        }
    }

    const getSetupMetadata = async () => {
        setLoading(true);
        try {
            var blockNumber = await dfoCore.getBlockNumber();
            var { '0': farmSetup, '1': farmSetupInfo } = await props.dfoCore.loadFarmingSetup(lmContract, setupIndex);
            farmSetupInfo = {... farmSetupInfo, free : true};
            farmSetup = {... farmSetup, togglable : farmSetup.active && blockNumber > parseInt(farmSetup.endBlock)};
            setSetup(farmSetup);
            setSetupInfo(farmSetupInfo);
            setShowPrestoError(false);
            await loadData(farmSetup, farmSetupInfo, true);
            if (!intervalId.current) {
                intervalId.current = setInterval(async () => {
                    var { '0': s, '1': si } = await props.dfoCore.loadFarmingSetup(lmContract, setupIndex);
                    si = {...si, free : true, generation : 'gen2'};
                    s = {... s, togglable : s.active && blockNumber > parseInt(s.endBlock)};
                    setSetup(s);
                    setSetupInfo(si);
                    await loadData(s, si, false, true);
                }, 5000);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const loadData = async (farmSetup, farmSetupInfo, reset, loop) => {
        let position = null;
        let lockPositions = [];
        let positionIds = [];
        reset && setLockedEstimatedReward(0);
        setUpdatedRenewTimes(farmSetupInfo.renewTimes);
        setUpdatedRewardPerBlock(farmSetup.rewardPerBlock);
        const events = await window.getLogs({
            address: lmContract.options.address,
            topics: [
                window.web3.utils.sha3("Transfer(uint256,address,address)")
            ],
            fromBlock: props.dfoCore.getContextElement('deploySearchStart'),
            toBlock: 'latest',
        });
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const { topics } = event;
            var positionId = props.dfoCore.web3.eth.abi.decodeParameter("uint256", topics[1]);
            const pos = await lmContract.methods.position(positionId).call();
            if (dfoCore.isValidPosition(pos) && parseInt(pos.setupIndex) === parseInt(setupIndex)) {
                if (farmSetupInfo.free) {
                    position = { ...pos, positionId };
                } else if (!positionIds.includes(positionId)) {
                    lockPositions.push({ ...pos, positionId });
                    positionIds.push(positionId);
                }
            }
        }
        setCurrentPosition(position);
        setLockedPositions(lockPositions);
        if (!position && reset) {
            setOpen(false);
            setWithdrawOpen(false);
        }
        const extensionAddress = await lmContract.methods._extension().call();
        const extContract = await dfoCore.getContract(dfoCore.getContextElement("FarmExtensionGen2ABI"), extensionAddress);
        reset && setExtensionContract(extContract);
        const rewardTokenAddress = await lmContract.methods._rewardTokenAddress().call();
        const isEth = rewardTokenAddress === dfoCore.voidEthereumAddress;
        const rewardToken = !isEth ? await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), rewardTokenAddress) : null;
        const rewardTokenSymbol = !isEth ? await rewardToken.methods.symbol().call() : 'ETH';
        const rewardTokenDecimals = !isEth ? await rewardToken.methods.decimals().call() : 18;
        const rewardTokenApproval = !isEth ? await rewardToken.methods.allowance(dfoCore.address, lmContract.options.address).call() : 2 ^ 256 - 1;
        const rewardTokenBalance = !isEth ? await rewardToken.methods.balanceOf(dfoCore.address).call() : await dfoCore.web3.eth.getBalance(dfoCore.address);
        setRewardTokenInfo({ contract: rewardToken, symbol: rewardTokenSymbol, decimals: rewardTokenDecimals, balance: rewardTokenBalance, address: rewardTokenAddress, approval: parseInt(rewardTokenApproval) !== 0 && parseInt(rewardTokenApproval) >= parseInt(rewardTokenBalance) });

        const bNumber = await dfoCore.getBlockNumber();
        setBlockNumber(bNumber);
        const tokenAddress = farmSetupInfo.liquidityPoolTokenAddress;
        const lpToken = await props.dfoCore.getContract(props.dfoCore.getContextElement("UniswapV3PoolABI"), tokenAddress);
        if(!loop) {
            const lpTokenSymbol = "UniV3";
            const lpTokenDecimals = "18";
            const lpTokenBalance = "0";
            const lpTokenApproval = "0";
            const fee = await lpToken.methods.fee().call();
            const slot = await lpToken.methods.slot0().call();
            var uniswapTokens = await Promise.all([
                await lpToken.methods.token0().call(),
                await lpToken.methods.token1().call()
            ].map(async tkAddress => {
                const currentToken = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), tkAddress);
                const symbol = tkAddress === window.voidEthereumAddress || tkAddress === ethereumAddress ? "ETH" : await currentToken.methods.symbol().call();
                var name = tkAddress === window.voidEthereumAddress || tkAddress === ethereumAddress ? "Ethereum" : await currentToken.methods.name().call();
                var decimals = parseInt(tkAddress ===window.voidEthereumAddress ? "18" : await currentToken.methods.decimals().call());
                var uniToken = new Token(props.dfoCore.chainId, tkAddress, decimals, symbol, name);
                return uniToken;
            }));
            console.log("Slot", farmSetup.infoIndex, {
                tick: slot.tick,
                sqrtPriceX96: slot.sqrtPriceX96,
                tickLower : farmSetupInfo.tickLower,
                tickUpper : farmSetupInfo.tickUpper,
                fee,
                inRange : parseInt(farmSetupInfo.tickLower) >= parseInt(slot.tick) && parseInt(slot.tick) <= parseInt(farmSetupInfo.tickUpper)
            });
            setLpTokenInfo({ uniswapTokens, fee, contract: lpToken, symbol: lpTokenSymbol, decimals: lpTokenDecimals, balance: lpTokenBalance, approval: parseInt(lpTokenApproval) !== 0 && parseInt(lpTokenApproval) >= parseInt(lpTokenBalance) });
        }
        const activateSetup = parseInt(farmSetupInfo.renewTimes) > 0 && !farmSetup.active && parseInt(farmSetupInfo.lastSetupIndex) === parseInt(setupIndex);
        setCanActivateSetup(activateSetup);
        var startBlock = window.formatNumber(farmSetupInfo.startBlock || 0);
        setDelayedBlock(bNumber > startBlock ? 0 : startBlock);

        setEndBlockReached(bNumber > window.formatNumber(farmSetup.endBlock));

        const { host, byMint } = await extContract.methods.data().call();
        if(!loop) {
            let isSetupReady = false;
            const extensionBalance = !isEth ? await rewardToken.methods.balanceOf(extensionAddress).call() : await dfoCore.web3.eth.getBalance(extensionAddress);
            // check if it's a setup from a DFO
            try {
                const doubleProxyContract = await dfoCore.getContract(dfoCore.getContextElement('dfoDoubleProxyABI'), host);
                const proxyContract = await dfoCore.getContract(dfoCore.getContextElement('dfoProxyABI'), await doubleProxyContract.methods.proxy().call());
                const stateHolderContract = await dfoCore.getContract(dfoCore.getContextElement('dfoStateHolderABI'), await proxyContract.methods.getStateHolderAddress().call());
                isSetupReady = await stateHolderContract.methods.getBool(`farming.authorized.${extensionAddress.toLowerCase()}`).call();
            } catch (error) {
                // not from dfo
                isSetupReady = byMint || parseInt(extensionBalance) >= (parseInt(farmSetup.rewardPerBlock) * parseInt(farmSetupInfo.blockDuration));
            }
            setSetupReady(isSetupReady);
        }

        const liquidityPoolTokens = [
            await lpToken.methods.token0().call(),
            await lpToken.methods.token1().call()
        ];
        const tokens = [];
        const approvals = [];
        const contracts = [];
        var mtInfo;
        var balances = ['0', '0'];
        try {
            farmSetup.objectId && farmSetup.objectId !== '0' && (balances = await simulateDecreaseLiquidityAndCollect(farmSetup.objectId, lmContract.options.address));
        } catch(e) {
        }
        var fees = ['0', '0'];
        try {
            var nftPosMan = await dfoCore.getEthersContract(dfoCore.getContextElement("UniswapV3NonfungiblePositionManagerABI"), dfoCore.getContextElement("uniswapV3NonfungiblePositionManagerAddress"));
            var collect = await nftPosMan.callStatic.collect({
                tokenId : farmSetup.objectId,
                recipient: lmContract.options.address,
                amount0Max: dfoCore.MAX_UINT128,
                amount1Max: dfoCore.MAX_UINT128
            }, {
                from : lmContract.options.address
            });
            fees = [collect.amount0.toString(), collect.amount1.toString()];
        } catch(e) {
        }
        for (let i = 0; i < liquidityPoolTokens.length; i++) {
            const address = liquidityPoolTokens[i];
            const token = !isWeth(farmSetupInfo, address) ? await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), address) : null;
            const symbol = token ? await token.methods.symbol().call() : 'ETH';
            const decimals = token ? await token.methods.decimals().call() : 18;
            const balance = token ? await token.methods.balanceOf(dfoCore.address).call() : await dfoCore.web3.eth.getBalance(dfoCore.address);
            const approval = token ? await token.methods.allowance(dfoCore.address, lmContract.options.address).call() : true;
            approvals.push(parseInt(approval) !== 0 && (parseInt(approval) >= parseInt(balance) || !token));
            tokens.push({ amount: 0, balance: dfoCore.toDecimals(dfoCore.toFixed(balance), decimals), liquidity: balances[i], decimals, address: token ? address : dfoCore.voidEthereumAddress, symbol });
            contracts.push(token);
            if (address.toLowerCase() === farmSetupInfo.mainTokenAddress.toLowerCase()) {
                mtInfo = { approval: parseInt(approval) !== 0 && (parseInt(approval) >= parseInt(balance) || !token), decimals, contract: token, address: token ? address : dfoCore.voidEthereumAddress, symbol };
                setMainTokenInfo(mtInfo)
            }
        }
        setSetupTokens(tokens);
        setTokensContracts(contracts);
        reset && setLpTokenAmount(null);
        reset && setTokensAmount(new Array(tokens.length).fill(0));
        setTokensApprovals(approvals);
        // retrieve the manage data using the position
        if (position) {
            const free = position['free'];
            const creationBlock = position['creationBlock'];
            const positionSetupIndex = position['setupIndex'];
            const liquidityPoolTokenAmount = position['liquidityPoolTokenAmount'];
            const amounts = {
                tokensAmounts : [0, 0]
            };
            try {
                var nftPosMan = await dfoCore.getEthersContract(dfoCore.getContextElement("UniswapV3NonfungiblePositionManagerABI"), dfoCore.getContextElement("uniswapV3NonfungiblePositionManagerAddress"));
                var decreaseLiquidity = await nftPosMan.callStatic.decreaseLiquidity({
                    tokenId : farmSetup.objectId,
                    liquidity : position.liquidityPoolTokenAmount,
                    amount0Min: 0,
                    amount1Min: 0,
                    deadline : new Date().getTime() + 100000
                }, {
                    from : lmContract.options.address
                });
                amounts.tokensAmounts = [decreaseLiquidity.amount0.toString(), decreaseLiquidity.amount1.toString()];
            } catch(e) {
            }
            console.log(position.positionId);
            const availableReward = await lmContract.methods.calculateFreeFarmingReward(position.positionId, true).call();
            var additionalFees = ['0', '0'];
            try {
                var result = await lmContract.methods.calculateTradingFees(position.positionId, availableReward, fees[0], fees[1]).call();
                additionalFees = [
                    result[0],
                    result[1]
                ]
            } catch(e) {}
            let freeReward = parseInt(availableReward);
            const bNumber = await dfoCore.getBlockNumber();
            if (bNumber < parseInt(farmSetup.endBlock)) {
                freeReward += (parseInt(farmSetup.rewardPerBlock) * (parseInt(position.liquidityPoolTokenAmount) / parseInt(farmSetup.totalSupply)))
            }
            freeReward = window.numberToString(freeReward).split('.')[0];
            setFreeAvailableRewards(freeReward);
            var withdrawOnly = !farmSetup.active || bNumber > parseInt(farmSetup.endBlock);
            setManageStatus({ withdrawOnly, additionalFees, free, creationBlock, positionSetupIndex, liquidityPoolAmount: liquidityPoolTokenAmount, tokensAmounts: amounts['tokensAmounts'], tokens })
        }
        // calculate APY
        setApy(await calculateApy(farmSetup, farmSetupInfo, rewardTokenAddress, rewardTokenDecimals, tokens));
    }

    async function simulateDecreaseLiquidityAndCollect(objectId, lmContractAddress) {
        var nftPosManEthers = await dfoCore.getEthersContract(dfoCore.getContextElement("UniswapV3NonfungiblePositionManagerABI"), dfoCore.getContextElement("uniswapV3NonfungiblePositionManagerAddress"));
        var nftPosMan = await dfoCore.getContract(dfoCore.getContextElement("UniswapV3NonfungiblePositionManagerABI"), dfoCore.getContextElement("uniswapV3NonfungiblePositionManagerAddress"));
        var bytes = [
            nftPosMan.methods.decreaseLiquidity({
                tokenId : objectId,
                liquidity : (await nftPosMan.methods.positions(objectId).call()).liquidity,
                amount0Min : 0,
                amount1Min : 0,
                deadline: new Date().getTime() + 10000
            }).encodeABI(),
            nftPosMan.methods.collect({
                tokenId : objectId,
                recipient: lmContractAddress,
                amount0Max: dfoCore.MAX_UINT128,
                amount1Max: dfoCore.MAX_UINT128
            }).encodeABI()
        ];
        var result = await nftPosManEthers.callStatic.multicall(
            bytes, {
            from : lmContractAddress
        });
        return props.dfoCore.web3.eth.abi.decodeParameters(["uint128", "uint128"], result[1]);
    }

    const calculateApy = async (setup, setupInfo, rewardTokenAddress, rewardTokenDecimals, setupTokens) => {
        if (parseInt(setup.totalSupply) === 0) return -1;
        const yearlyBlocks = 2304000;
        try {
            const ethPrice = await window.getEthereumPrice();
            const wusdAddress = await dfoCore.getContextElement("WUSDAddress");
            if (setupInfo.free) {
                const searchTokens = `${rewardTokenAddress},${setupTokens.map((token) => (token && token.address) ? `${token.address},` : '')}`.slice(0, -1);
                const res = await window.getTokenPricesInDollarsOnCoingecko(searchTokens, { tickToPrice, Token, Pool, Position, nearestUsableTick, TICK_SPACINGS, TickMath, maxLiquidityForAmounts });
                const { data } = res;
                const rewardTokenPriceUsd = rewardTokenAddress !== dfoCore.voidEthereumAddress ? rewardTokenAddress.toLowerCase() === wusdAddress.toLowerCase() ? 1 : data[rewardTokenAddress.toLowerCase()].usd : ethPrice;
                let den = 0;
                await Promise.all(setupTokens.map(async (token) => {
                    if (token && token.address) {
                        const tokenPrice = token.address !== dfoCore.voidEthereumAddress ? token.address.toLowerCase() === wusdAddress.toLowerCase() ? 1 : data[token.address.toLowerCase()].usd : ethPrice;
                        den += (tokenPrice * token.liquidity * 10 ** (18 - token.decimals));
                    }
                }))
                const num = (parseInt(setup.rewardPerBlock) * 10 ** (18 - rewardTokenDecimals) * yearlyBlocks) * rewardTokenPriceUsd;
                return (num * 100 / den);
            } else {
                const { mainTokenAddress } = setupInfo;
                const mainTokenContract = mainTokenAddress !== dfoCore.voidEthereumAddress ? await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), mainTokenAddress) : null;
                const decimals = mainTokenAddress !== dfoCore.voidEthereumAddress ? await mainTokenContract.methods.decimals().call() : 18;
                const searchTokens = `${rewardTokenAddress},${mainTokenAddress}`;
                const res = await window.getTokenPricesInDollarsOnCoingecko(searchTokens);
                const { data } = res;
                const rewardTokenPriceUsd = rewardTokenAddress !== dfoCore.voidEthereumAddress ? rewardTokenAddress.toLowerCase() === wusdAddress.toLowerCase() ? 1 : data[rewardTokenAddress.toLowerCase()].usd : ethPrice;
                const mainTokenPriceUsd = mainTokenAddress !== dfoCore.voidEthereumAddress ? mainTokenAddress.toLowerCase() === wusdAddress.toLowerCase() ? 1 : data[mainTokenAddress.toLowerCase()].usd : ethPrice;
                const num = (parseInt(setup.rewardPerBlock) * 10 ** (18 - rewardTokenDecimals) * yearlyBlocks) * rewardTokenPriceUsd * 100;
                const den = (parseInt(setupInfo.maxStakeable) * 10 ** (18 - decimals) * mainTokenPriceUsd) * 2;
                return num / den;
            }
        } catch (error) {
            return 0;
        }
    }

    const isWeth = (setupInfo, address) => {
        return address.toLowerCase() === ethereumAddress.toLowerCase() && setupInfo.involvingETH;
    }

    const getPeriodFromDuration = (duration) => {
        const blockIntervals = dfoCore.getContextElement('blockIntervals');
        const inv = Object.entries(blockIntervals).reduce((ret, entry) => {
            const [key, value] = entry;
            ret[value] = key;
            return ret;
        }, {});
        return inv[duration];
    }

    const activateSetup = async () => {
        if (!setupReady) return;
        setActivateLoading(true);
        try {
            const gas = window.formatNumber(await lmContract.methods.activateSetup(setup.infoIndex).estimateGas({ from: props.dfoCore.address }));
            const result = await lmContract.methods.activateSetup(setup.infoIndex).send({ from: props.dfoCore.address, gas: window.numberToString(gas * props.dfoCore.getContextElement("farmSetupActivationGasMultiplier")) });
            props.addTransaction(result);
            await getSetupMetadata();
        } catch (error) {
            console.error(error);
        } finally {
            setActivateLoading(false);
        }
    }

    const onTokenApproval = (index, isLp) => {
        if (isLp) {
            setLpTokenInfo({ ...lpTokenInfo, approval: true });
            return;
        }
        setTokensApprovals(tokensApprovals.map((val, i) => i === index ? true : val));
    }


    const onUpdateTokenAmount = async (value, index) => {
        var tks = tokensAmounts.map(it => it);
        const fullValue = window.toDecimals(value, setupTokens[index].decimals);
        tks[index] = {
            value,
            full : fullValue
        }
        //setTokensAmount(tks.map(it => it));
        window.updateAmountTimeout && clearTimeout(window.updateAmountTimeout);
        setLpTokenAmount(null);
        if (!value) {
            setLockedEstimatedReward(0);
            setFreeEstimatedReward(0);
            setTokensAmount(tokensAmounts.map(() => 0));
            return;
        }
        window.updateAmountTimeout = setTimeout(async function () {
            var tokenAddress = setupTokens[index].address;
            tokenAddress = tokenAddress === window.voidEthereumAddress ? ethereumAddress : tokenAddress;
            var slot0 = await lpTokenInfo.contract.methods.slot0().call();
            var tick = nearestUsableTick(parseInt(slot0.tick), TICK_SPACINGS[lpTokenInfo.fee]);
            var sqrtPriceX96 = TickMath.getSqrtRatioAtTick(tick);
            var pool = new Pool(lpTokenInfo.uniswapTokens[0], lpTokenInfo.uniswapTokens[1], parseInt(lpTokenInfo.fee), sqrtPriceX96, 0, tick);
            var fromAmountData = {pool, tickLower : parseInt(setupInfo.tickLower), tickUpper : parseInt(setupInfo.tickUpper), useFullPrecision : true};
            fromAmountData[`amount${index}`] = window.formatNumber(fullValue);
            var pos = Position[`fromAmount${index}`](fromAmountData)[`amount${1 - index}`].toSignificant(18);
            tks[1 - index] = {
                value : window.numberToString(pos),
                full : window.toDecimals(window.numberToString(pos), setupTokens[1 - index].decimals)
            };
            tickData && tickData.cursorNumber === 0 && (tks[0] = {
                value : '0',
                full : '0'
            });
            tickData && tickData.cursorNumber === 100 && (tks[1] = {
                value : '0',
                full : '0'
            });
            setTokensAmount(tks.map(it => it));
            var liquidityPoolAmount = maxLiquidityForAmounts(
                parseInt(slot0.sqrtPriceX96),
                TickMath.getSqrtRatioAtTick(parseInt(setupInfo.tickLower)),
                TickMath.getSqrtRatioAtTick(parseInt(setupInfo.tickUpper)),
                tks[0].full,
                tks[1].full,
                true
            ).toString();
            console.log("Liquidity", liquidityPoolAmount);
            setLpTokenAmount(liquidityPoolAmount)
            if (parseInt(setup.totalSupply) + parseInt(liquidityPoolAmount) > 0) {
                const val = parseInt(liquidityPoolAmount) * 6400 * parseInt(setup.rewardPerBlock) / (parseInt(setup.totalSupply) + parseInt(liquidityPoolAmount));
                if (!isNaN(val)) {
                    setFreeEstimatedReward(props.dfoCore.toDecimals(props.dfoCore.toFixed(val), rewardTokenInfo.decimals))
                }
            }
        }, 300);
    }

    const onUpdateLpTokenAmount = async (value, index, isFull) => {
        window.updateAmountTimeout && clearTimeout(window.updateAmountTimeout);
        if (!value || value === 'NaN') {
            setLockedEstimatedReward(0);
            setFreeEstimatedReward(0);
            // setLpTokenAmount("0");
            return;
        }
        window.updateAmountTimeout = setTimeout(async function () {
            try {
                const fullValue = isFull ? value : props.dfoCore.toFixed(props.dfoCore.fromDecimals(value, parseInt(lpTokenInfo.decimals)));
                setLpTokenAmount({ value: window.numberToString(value), full: fullValue })
                const result = await ammContract.methods.byLiquidityPoolAmount(setupInfo.liquidityPoolTokenAddress, fullValue).call();
                const ams = result.tokensAmounts;
                setTokensAmount(ams);
                if (!setupInfo.free) {
                    let mainTokenIndex = 0;
                    await setupTokens.map((t, i) => {
                        if (t.address === setupInfo.mainTokenAddress) {
                            mainTokenIndex = i;
                        }
                    })
                    if (parseInt(ams[mainTokenIndex]) > 0) {
                        const reward = await lmContract.methods.calculateLockedFarmingReward(setupIndex, ams[mainTokenIndex], false, 0).call();
                        setLockedEstimatedReward(props.dfoCore.toDecimals(props.dfoCore.toFixed(parseInt(reward.relativeRewardPerBlock) * (parseInt(setup.endBlock) - blockNumber)), rewardTokenInfo.decimals));
                    }
                } else {
                    const val = parseInt(props.dfoCore.fromDecimals(value, parseInt(lpTokenInfo.decimals))) * 6400 * parseInt(setup.rewardPerBlock) / (parseInt(setup.totalSupply) + parseInt(props.dfoCore.fromDecimals(value, parseInt(lpTokenInfo.decimals))));
                    if (!isNaN(val)) {
                        setFreeEstimatedReward(props.dfoCore.toDecimals(window.numberToString(val), rewardTokenInfo.decimals))
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }, 300);
        // setFreeEstimatedReward(props.dfoCore.toDecimals(props.dfoCore.toFixed(parseInt(props.dfoCore.toFixed(props.dfoCore.fromDecimals(value, parseInt(lpTokenInfo.decimals)))) * 6400 * parseInt(setup.rewardPerBlock) / (parseInt(setup.totalSupply) + parseInt(value))), rewardTokenInfo.decimals))
    }

    const addLiquidity = async () => {
        setAddLoading(true);
        try {
            if (!lpTokenAmount) return;
            const stake = {
                setupIndex,
                amount: 0,
                amountIsLiquidityPool: inputType === 'add-lp' ? true : false,
                positionOwner: openPositionForAnotherWallet ? uniqueOwner : dfoCore.voidEthereumAddress,
            };

            let ethTokenIndex = null;
            let ethTokenValue = 0;
            let mainTokenIndex = 0;
            await Promise.all(setupTokens.map(async (token, i) => {
                if (setupInfo.involvingETH && token.address === window.voidEthereumAddress) {
                    ethTokenIndex = i;
                }
                if (token.address === setupInfo.mainTokenAddress || setupInfo.involvingETH && token.address === window.voidEthereumAddress && setupInfo.mainTokenAddress === ethereumAddress) {
                    mainTokenIndex = i;
                }
            }))
            let lpAmount = window.numberToString(lpTokenAmount.full || lpTokenAmount);
            stake.amount = window.numberToString(stake.amountIsLiquidityPool ? lpAmount : tokensAmounts[mainTokenIndex].full || tokensAmounts[mainTokenIndex]);
            ethTokenValue = ethTokenIndex === undefined || ethTokenIndex === null ? "0" : window.numberToString(tokensAmounts[ethTokenIndex].full || tokensAmounts[ethTokenIndex]);
            var value = setupInfo.involvingETH && !stake.amountIsLiquidityPool ? ethTokenValue : "0";
            stake.amount0 = tokensAmounts[0].full || tokensAmounts[0];
            stake.amount1 = tokensAmounts[1].full || tokensAmounts[1];
            if (prestoData) {
                console.log('using presto!')
                var sendingOptions = { from: dfoCore.address, value: prestoData.ethValue, gasLimit: 9999999 };
                sendingOptions.gasLimit = await prestoData.transaction.estimateGas(sendingOptions);
                sendingOptions.gasLimit = parseInt(sendingOptions.gasLimit * (props.dfoCore.getContextElement("farmGasMultiplier") || 1));
                sendingOptions.gas = sendingOptions.gasLimit;
                var result = await prestoData.transaction.send(sendingOptions)
                props.addTransaction(result);
            } else {
                if (!currentPosition || openPositionForAnotherWallet) {
                    const gasLimit = await lmContract.methods.openPosition(stake).estimateGas({ from: dfoCore.address, value });
                    const result = await lmContract.methods.openPosition(stake).send({ from: dfoCore.address, gas: parseInt(gasLimit * (props.dfoCore.getContextElement("farmGasMultiplier") || 1)), gasLimit: parseInt(gasLimit * (props.dfoCore.getContextElement("farmGasMultiplier") || 1)), value });
                    props.addTransaction(result);
                } else if (currentPosition) {
                    const gasLimit = await lmContract.methods.addLiquidity(currentPosition.positionId, stake).estimateGas({ from: dfoCore.address, value });
                    const result = await lmContract.methods.addLiquidity(currentPosition.positionId, stake).send({ from: dfoCore.address, gas: parseInt(gasLimit * (props.dfoCore.getContextElement("farmGasMultiplier") || 1)), gasLimit: parseInt(gasLimit * (props.dfoCore.getContextElement("farmGasMultiplier") || 1)), value });
                    props.addTransaction(result);
                }
            }
            await getSetupMetadata();
        } catch (error) {
            console.error(error);
            if (inputType === 'add-eth' && error.code && error.code !== 4001) {
                setShowPrestoError(true);
            }
        } finally {
            setAddLoading(false);
        }
    }

    const removeLiquidity = async () => {
        if (setupInfo.free && (!removalAmount || removalAmount === 0)) return;
        setRemoveLoading(true);
        try {
            const removedLiquidity = removalAmount === 100 ? manageStatus.liquidityPoolAmount : props.dfoCore.toFixed(parseInt(manageStatus.liquidityPoolAmount) * removalAmount / 100).toString().split('.')[0];
            const gasLimit = await lmContract.methods.withdrawLiquidity(currentPosition.positionId, removedLiquidity).estimateGas({ from: dfoCore.address });
            const result = await lmContract.methods.withdrawLiquidity(currentPosition.positionId, removedLiquidity).send({ from: dfoCore.address, gasLimit, gas : gasLimit });
            props.addTransaction(result);
            await getSetupMetadata();
        } catch (error) {
            console.error(error);
        } finally {
            setRemoveLoading(false);
        }
    }

    async function withdrawAll() {
        setWithdrawingAll(true);
        try {
            var method = lmContract.methods.withdrawLiquidity(currentPosition.positionId, manageStatus.liquidityPoolAmount);
            const gasLimit = await method.estimateGas({ from: dfoCore.address });
            const result = await method.send({ from: dfoCore.address, gasLimit, gas : gasLimit });
            props.addTransaction(result);
        } catch(e) {
            console.error(e);
        }
        setWithdrawingAll(false);
    };

    const withdrawReward = async () => {
        setClaimLoading(true);
        try {
            const gasLimit = await lmContract.methods.withdrawReward(currentPosition.positionId).estimateGas({ from: dfoCore.address });
            const result = await lmContract.methods.withdrawReward(currentPosition.positionId).send({ from: dfoCore.address, gasLimit, gas: gasLimit });
            props.addTransaction(result);
            await getSetupMetadata();
        } catch (error) {
            console.error(error);
        } finally {
            setClaimLoading(false);
        }
    }

    const transferPosition = async (positionId, index) => {
        if (!positionId) return;
        if (setupInfo.free) {
            setTransferLoading(true);
            try {
                //const gasLimit = await lmContract.methods.transferPosition(freeTransferAddress, positionId).estimateGas({ from: dfoCore.address });
                const result = await lmContract.methods.transferPosition(dfoCore.address, positionId).send({ from: dfoCore.address, gasLimit: 99999999, gas: 99999999 });
                props.addTransaction(result);
                await getSetupMetadata();
            } catch (error) {
                console.error(error);
            } finally {
                setTransferLoading(false);
            }
        }
    }
    /*
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
                const result = await extensionContract.methods.setFarmingSetups([updatedSetupConfiguration]).send({ from: dfoCore.address, gasLimit, gas: gasLimit });
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
                const result = await extensionContract.methods.setFarmingSetups([updatedSetupConfiguration]).send({ from: dfoCore.address, gasLimit, gas: gasLimit });
                await getSetupMetadata();
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        */

    const getApproveButton = (isLp) => {
        if (!isLp) {
            const notApprovedIndex = tokensApprovals.findIndex((value) => !value);
            if (notApprovedIndex !== -1) {
                if(tickData.cursorNumber === 0 || tickData.cursorNumber === 0) {
                    var index = tickData.cursorNumber === 100 ? 0 : 1;
                    return <ApproveButton contract={tokensContracts[index]} from={props.dfoCore.address} spender={lmContract.options.address} onApproval={() => onTokenApproval(index, false)} onError={(error) => console.error(error)} text={`Approve ${setupTokens[index].symbol}`} />
                }
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

    const onInputTypeChange = async (e) => {
        setInputType(e.target.value);
        const ethBalance = await props.dfoCore.web3.eth.getBalance(props.dfoCore.address);
        setEthBalanceOf(ethBalance);
        setPrestoData(null);
        setShowPrestoError(false);
        setEthAmount(0);
        if (e.target.value === 'add-eth') {
            setLpTokenAmount(0);
            setTokensAmount(new Array(setupTokens.length).fill(0));
            setFreeEstimatedReward("0");
            setLockedEstimatedReward("0");
        }
    }

    const onOutputTypeChange = e => {
        setOutputType(e.target.value);
    }

    const updateEthAmount = async amount => {
        try {
            setLoadingPrestoData(true);
            setPrestoData(null);
            setEthAmount(amount || "0");
            if (!parseFloat(amount)) {
                return setLoadingPrestoData(false);
            };
            var value = window.toDecimals(window.numberToString(amount), 18);

            var halfValue = props.dfoCore.web3.utils.toBN(value).div(props.dfoCore.web3.utils.toBN(2)).toString();
            var ammEthereumAddress = (await ammContract.methods.data().call())[0];

            var info = setupInfo;

            var liquidityPool = info.liquidityPoolTokenAddress;

            var tokens = await ammContract.methods.byLiquidityPool(liquidityPool).call();
            var token0 = new window.web3.eth.Contract(props.dfoCore.getContextElement("ERC20ABI"), tokens[2][0]);
            var token1 = new window.web3.eth.Contract(props.dfoCore.getContextElement("ERC20ABI"), tokens[2][1]);
            var token0decimals = tokens[2][0] === window.voidEthereumAddress ? 18 : await token0.methods.decimals().call();
            var token1decimals = tokens[2][1] === window.voidEthereumAddress ? 18 : await token1.methods.decimals().call();

            var lpDecimals = await new window.web3.eth.Contract(props.dfoCore.getContextElement("ERC20ABI"), liquidityPool).methods.decimals().call();

            var mainTokenIndex = tokens[2].indexOf(info.mainTokenAddress);

            var amm = ammContract;//amms[selectedAmmIndex].contract;

            var ethereumAddress = (await amm.methods.data().call())[0];

            async function calculateBestLP(firstToken, secondToken, firstDecimals, secondDecimals, hf) {

                var data = (await amm.methods.byTokens([ethereumAddress, firstToken]).call());

                var liquidityPoolAddress = data[2];

                if (liquidityPoolAddress === window.voidEthereumAddress) {
                    return {};
                }

                var mainTokenIndex = data[3].indexOf(firstToken);
                var middleTokenIndex = data[3].indexOf(ethereumAddress);

                var mainAmount = window.formatNumber(window.normalizeValue(data[1][mainTokenIndex], firstDecimals));
                var middleTokenAmount = window.formatNumber(window.normalizeValue(data[1][middleTokenIndex], 18));

                var constant = mainAmount * middleTokenAmount;

                var newMiddleTokenAmount = middleTokenAmount + window.formatNumber(window.normalizeValue(halfValue, 18));

                var newMainAmount = constant / newMiddleTokenAmount;

                var mainReceived = mainAmount - newMainAmount;

                var firstTokenEthLiquidityPoolAddress = liquidityPoolAddress;
                var token0Value = (await amm.methods.getSwapOutput(ethereumAddress, hf || halfValue, [liquidityPoolAddress], [firstToken]).call())[1];

                var ratio = newMainAmount / mainAmount;

                if (!hf) {
                    return await calculateBestLP(firstToken, secondToken, firstDecimals, secondDecimals, halfValue = window.numberToString(window.formatNumber(halfValue) * ratio).split('.')[0])
                }

                var token1Value = (await ammContract.methods.byTokenAmount(liquidityPool, firstToken, token0Value).call());
                var lpAmount = token1Value[0];
                token1Value = token1Value[1][token1Value[2].indexOf(secondToken)];

                lpAmount = window.numberToString(parseInt(lpAmount) / ratio).split('.')[0];
                token1Value = window.numberToString(parseInt(token1Value) / ratio).split('.')[0];

                const updatedFirstTokenAmount = window.formatNumber(window.normalizeValue(token0Value, firstDecimals));
                const updatedSecondTokenAmount = window.formatNumber(window.normalizeValue(token1Value, secondDecimals));

                liquidityPoolAddress = (await amm.methods.byTokens([ethereumAddress, secondToken]).call())[2];
                var secondTokenEthLiquidityPoolAddress = liquidityPoolAddress;
                var token1ValueETH = "0";
                if (secondTokenEthLiquidityPoolAddress !== window.voidEthereumAddress) {
                    token1ValueETH = (await amm.methods.getSwapOutput(secondToken, token1Value, [liquidityPoolAddress], [ethereumAddress]).call())[1];
                }

                return { lpAmount, updatedFirstTokenAmount, updatedSecondTokenAmount, token0Value, token1Value, token1ValueETH, firstTokenEthLiquidityPoolAddress, secondTokenEthLiquidityPoolAddress };
            }

            var bestLP = await calculateBestLP(token0.options.address, token1.options.address, token0decimals, token1decimals);

            var lpAmount = bestLP.lpAmount;
            var firstTokenAmount = bestLP.token0Value;
            var secondTokenAmount = bestLP.token1Value;
            var firstTokenETH = halfValue;
            var secondTokenETH = bestLP.token1ValueETH;
            var token0EthLiquidityPoolAddress = bestLP.firstTokenEthLiquidityPoolAddress;
            var token1EthLiquidityPoolAddress = bestLP.secondTokenEthLiquidityPoolAddress;

            if (token0.options.address === ammEthereumAddress || !lpAmount || (bestLP.updatedSecondTokenAmount > bestLP.updatedFirstTokenAmount)) {
                bestLP = await calculateBestLP(token1.options.address, token0.options.address, token1decimals, token0decimals);

                lpAmount = bestLP.lpAmount;
                firstTokenAmount = bestLP.token1Value;
                secondTokenAmount = bestLP.token0Value;
                firstTokenETH = bestLP.token1ValueETH;
                secondTokenETH = halfValue;
                token0EthLiquidityPoolAddress = bestLP.secondTokenEthLiquidityPoolAddress;
                token1EthLiquidityPoolAddress = bestLP.firstTokenEthLiquidityPoolAddress;
            }

            var operations = [];

            token0EthLiquidityPoolAddress !== window.voidEthereumAddress && operations.push({
                inputTokenAddress: ethereumAddress,
                inputTokenAmount: firstTokenETH,
                ammPlugin: amm.options.address,
                liquidityPoolAddresses: [token0EthLiquidityPoolAddress],
                swapPath: [token0.options.address],
                enterInETH: true,
                exitInETH: false,
                receivers: [farmingPresto.options.address],
                receiversPercentages: []
            });

            token1EthLiquidityPoolAddress !== window.voidEthereumAddress && operations.push({
                inputTokenAddress: ethereumAddress,
                inputTokenAmount: secondTokenETH,
                ammPlugin: amm.options.address,
                liquidityPoolAddresses: [token1EthLiquidityPoolAddress],
                swapPath: [token1.options.address],
                enterInETH: true,
                exitInETH: false,
                receivers: [farmingPresto.options.address],
                receiversPercentages: []
            });

            var ethValue = 0;
            token0EthLiquidityPoolAddress !== window.voidEthereumAddress && (ethValue = props.dfoCore.web3.utils.toBN(ethValue).add(props.dfoCore.web3.utils.toBN(firstTokenETH)).toString());
            token1EthLiquidityPoolAddress !== window.voidEthereumAddress && (ethValue = props.dfoCore.web3.utils.toBN(ethValue).add(props.dfoCore.web3.utils.toBN(secondTokenETH)).toString());
            info.involvingETH && token0.options.address === ammEthereumAddress && (ethValue = props.dfoCore.web3.utils.toBN(ethValue).add(props.dfoCore.web3.utils.toBN(firstTokenAmount)).toString());
            info.involvingETH && token1.options.address === ammEthereumAddress && (ethValue = props.dfoCore.web3.utils.toBN(ethValue).add(props.dfoCore.web3.utils.toBN(secondTokenAmount)).toString());

            var request = {
                setupIndex,
                amount: mainTokenIndex === 0 ? firstTokenAmount : secondTokenAmount,
                amountIsLiquidityPool: false,
                positionOwner: window.isEthereumAddress(uniqueOwner) ? uniqueOwner : props.dfoCore.address
            }

            if (!setupInfo.free) {
                const reward = await lmContract.methods.calculateLockedFarmingReward(setupIndex, mainTokenIndex === 0 ? firstTokenAmount : secondTokenAmount, false, 0).call();
                setLockedEstimatedReward(window.fromDecimals(parseInt(reward.relativeRewardPerBlock) * (parseInt(setup.endBlock) - blockNumber), rewardTokenInfo.decimals));
            } else {
                const val = parseInt(lpAmount) * 6400 * parseInt(setup.rewardPerBlock) / (parseInt(setup.totalSupply) + parseInt(lpAmount));
                if (!isNaN(val)) {
                    setFreeEstimatedReward(props.dfoCore.toDecimals(props.dfoCore.toFixed(val), rewardTokenInfo.decimals))
                }
            }

            setPrestoData({
                ethValue: value,
                transaction: farmingPresto.methods.openPosition(
                    props.dfoCore.getContextElement("prestoAddress"),
                    operations,
                    lmContract.options.address,
                    request
                ),
                firstTokenAmount,
                secondTokenAmount,
                token0decimals,
                token1decimals,
                token0Address: token0.options.address,
                token1Address: token1.options.address,
                token0Symbol: info.involvingETH && token0.options.address === ammEthereumAddress ? "ETH" : await token0.methods.symbol().call(),
                token1Symbol: info.involvingETH && token1.options.address === ammEthereumAddress ? "ETH" : await token1.methods.symbol().call()
            });

            setLpTokenAmount({ full: lpAmount, value: window.fromDecimals(lpAmount, lpDecimals) });
        } catch (error) {
            console.error(error);
        }
        setLoadingPrestoData(false);
    }

    const calculateLockedFixedValue = () => {
        const { rewardPerBlock } = setup;
        const { maxStakeable } = setupInfo;
        const normalizedRewardPerBlock = parseInt(rewardPerBlock) * 10 ** (18 - rewardTokenInfo.decimals);
        const normalizedMaxStakeable = parseInt(maxStakeable) * 10 ** (18 - mainTokenInfo.decimals);
        const amount = normalizedRewardPerBlock * (1 / normalizedMaxStakeable);
        return (canActivateSetup) ? window.formatMoney(amount * parseInt(setupInfo.blockDuration), 6) : parseInt(blockNumber) >= parseInt(setup.endBlock) ? 0 : window.formatMoney(amount * (parseInt(setup.endBlock) - parseInt(blockNumber)), 6);
    }

    const getAdvanced = () => {
        return !edit ? getManageAdvanced() : getEdit();
    }

    const getEdit = () => {
        return

        {/* @locked For upcoming release
        <div className="pb-4 px-4">
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
        </div>*/}
    }

    function calculateDailyEarnings() {
        if(!manageStatus) {
            return 0;
        }
        var rewardPerBlock = window.formatNumber(window.fromDecimals(setup.rewardPerBlock, rewardTokenInfo.decimals, true));
        var liquidityPoolAmount = window.formatNumber(window.fromDecimals(manageStatus.liquidityPoolAmount, rewardTokenInfo.decimals, true));
        var totalSupply = window.formatNumber(window.fromDecimals(setup.totalSupply, rewardTokenInfo.decimals, true));
        var dailyEarnings = (rewardPerBlock * 6400 * liquidityPoolAmount) / totalSupply;
        dailyEarnings = window.numberToString(dailyEarnings);
        dailyEarnings = window.formatMoney(dailyEarnings, 4);
        return dailyEarnings;
        //window.fromDecimals((parseInt(setup.rewardPerBlock) * 6400 * parseInt(manageStatus.liquidityPoolAmount) / parseInt(setup.totalSupply)).toString().split('.')[0], rewardTokenInfo.decimals, true)
    }

    const getManageAdvanced = () => {
        if (withdrawOpen && currentPosition && setupInfo.free) {
            return (
                <div className="FarmActions">
                    <input type="range" value={removalAmount} onChange={(e) => setRemovalAmount(parseInt(e.target.value))} className="form-control-range" id="formControlRange" />
                    <div className="Web2ActionsBTNs">
                        <p className="BreefRecap"><b>Amount:</b> {removalAmount}% ({manageStatus.tokens.map((token, i) => <span key={token.address}> {window.formatMoney(window.fromDecimals(parseInt(manageStatus.tokensAmounts[i].full || manageStatus.tokensAmounts[i]) * removalAmount / 100, token.decimals, true), 4)} {token.symbol} </span>)})</p>
                        <a className="web2ActionBTN" onClick={() => setRemovalAmount(10)} >10%</a>
                        <a className="web2ActionBTN" onClick={() => setRemovalAmount(25)} >25%</a>
                        <a className="web2ActionBTN" onClick={() => setRemovalAmount(50)} >50%</a>
                        <a className="web2ActionBTN" onClick={() => setRemovalAmount(75)} >75%</a>
                        <a className="web2ActionBTN" onClick={() => setRemovalAmount(90)} >90%</a>
                        <a className="web2ActionBTN" onClick={() => setRemovalAmount(100)} >MAX</a>
                    </div>
                    <div className="Web2ActionsBTNs">
                        {
                            removeLoading ? <a className="Web3ActionBTN" disabled={removeLoading}>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            </a> : <a onClick={() => removeLiquidity()} className="Web3ActionBTN">Remove</a>
                        }
                    </div>
                </div>
            )
        }

        return <div className="FarmActions">
            <label className="OptionalThingsFarmers" htmlFor="openPositionWallet1">
                <p><input className="form-check-input" type="checkbox" checked={openPositionForAnotherWallet} onChange={(e) => {
                        if (!e.target.checked) {
                            setUniqueOwner("");
                        }
                        setOpenPositionForAnotherWallet(e.target.checked);
                    }} id="openPositionWallet1" />
                    External Owner</p>
                </label>
                {
                    openPositionForAnotherWallet && <div className="DiffWallet">
                        <input type="text" className="TextRegular" placeholder="Position owner address" value={uniqueOwner} onChange={(e) => setUniqueOwner(e.target.value)} id="uniqueOwner" />
                        <p className="BreefExpl">This wallet will be the owner of this position and all of its assets.</p>
                    </div>
                }
                {
                    setupTokens.map((setupToken, i) => {
                        return <div key={setupToken.address} className="InputTokenRegular">
                            {(i === 1 ? tickData.cursorNumber !== 100 : tickData.cursorNumber !== 0) && <Input showMax={true} address={setupToken.address} value={tokensAmounts[i].value || window.fromDecimals(tokensAmounts[i], setupToken.decimals, true)} balance={setupToken.balance} min={0} onChange={(e) => onUpdateTokenAmount(e.target.value, i)} showCoin={true} showBalance={true} name={setupToken.symbol} />}
                        </div>
                    })
                }
                {
                    (setupInfo.free && rewardTokenInfo && lpTokenAmount !== undefined && lpTokenAmount !== null && lpTokenAmount !== '' && lpTokenAmount !== '0' && (!lpTokenAmount.full || lpTokenAmount.full !== '0')) && <div className="DiffWallet">
                        <p className="BreefRecap">Estimated reward per day: <br></br><b>{window.formatMoney(freeEstimatedReward, rewardTokenInfo.decimals)} {rewardTokenInfo.symbol}</b>
                        </p>
                    </div>
                }
                    <div className="Web3BTNs">
                        {
                            tokensApprovals.some((value) => !value) && <>
                                {getApproveButton()}
                            </>
                        }
                        {
                            addLoading ? <a className="Web3ActionBTN" disabled={addLoading}>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            </a> : <a className="Web3ActionBTN" onClick={addLiquidity} disabled={tokensApprovals.some((value) => !value) || tokensAmounts.some((value) => value === 0)}>Add Liquidity</a>
                        }
                    </div>
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
                <div className="SetupFarmingInstructions">
                    <div className="SetupFarmingInstructionsV3">
                        {setupTokens.map((token, i) => <div className="TokenFarmV3InfoBox"><figure key={token.address}>{i !== 0 ? '' : ''}{token.address !== props.dfoCore.voidEthereumAddress ? <a target="_blank" href={`${props.dfoCore.getContextElement("etherscanURL")}token/${token.address}`}><Coin address={token.address} /></a> : <Coin address={token.address} />}</figure><span> {tickData && `${(i === 0 ? tickData.cursorNumber : 100 - tickData.cursorNumber)}%`} {window.dfoCore.isItemSync(token.address) && <span className="Spannino">{token.symbol}</span>} {!window.dfoCore.isItemSync(token.address) && <span className="Spannino">{token.symbol}</span>}</span> </div>)}
                        {!endBlockReached && 
                            <p className="BlockInfoV3B">
                            {setup.active && parseInt(setup.endBlock) > blockNumber && <span className="V3FarmStatusYEP">Active</span>}
                                {!delayedBlock && <> {(!setup.active && canActivateSetup) ? <span className="V3FarmStatusNew">{setupReady ? "new" : "Soon"}</span> : (!setup.active) ? <span className="V3FarmStatusNope">Inactive</span> : <></>} {(parseInt(setup.endBlock) <= blockNumber && parseInt(setup.endBlock) !== 0) && <span className="V3FarmStatusNopeNow">Ended</span>}</>}{delayedBlock !== 0 && <span className="V3FarmStatusNew">Soon</span>}
                                {apy > 0 && <> <b>APY</b>: {window.formatMoney(apy, 3)}%</>}
                            </p>
                        }
                        {rewardTokenInfo && <p className="BlockInfoV3"><b>Daily Rate</b>: {window.formatMoney(window.fromDecimals(parseInt(setup.rewardPerBlock) * 6400, rewardTokenInfo.decimals, true), 4)} {rewardTokenInfo.symbol}</p>}
                        {parseInt(setup.endBlock) > 0 ? <p className="BlockInfoV3"><b>End</b>: <a className="BLKEMD" target="_blank" href={`${props.dfoCore.getContextElement("etherscanURL")}block/${setup.endBlock}`}>{setup.endBlock}</a></p> : <p className="BlockInfoV3"><b>Duration</b>: {getPeriodFromDuration(setupInfo.blockDuration)}</p>}
                        {!currentPosition && (!open && parseInt(setup.endBlock) > parseInt(blockNumber)) && <a className="web2ActionBTN" onClick={() => { setOpen(true); setWithdrawOpen(false); setEdit(false); }}>Farm</a>}
                        {!currentPosition && (open) && <a className="backActionBTN" onClick={() => { setOpen(false); setWithdrawOpen(false); setEdit(false) }}>Close</a>}
                        {
                                !delayedBlock && canActivateSetup && <>
                                    {
                                        !open && setupReady && <>
                                            {
                                                activateLoading ? <a className="Web3ActionBTN" disabled={activateLoading}>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                </a> : <a className="web2ActionBTN" onClick={() => void(setOpen(true), setWithdrawOpen(false), setEdit(false))}>Activate</a>
                                            }
                                        </>
                                    }
                                    {
                                        !setupReady && <>
                                            <p className="BreefRecap">Not ready to be activated, come back at another time</p>
                                        </>
                                    }
                                </>
                            }
                            {delayedBlock !== 0 && <div>
                                <p><b>Start Block: <a href={`${props.dfoCore.getContextElement("etherscanURL")}block/${delayedBlock}`} target="_blank">#{delayedBlock}</a></b></p>
                            </div>} 
                        </div>
                    <div className="farmInfoCurve">
                        <p className="farmInfoCurveL">
                            <p className="MAinTokensel">
                                <a href="javascript:;" onClick={() => setsecondTokenIndex(1 - secondTokenIndex)}><img src={SwitchIcon}></img></a> {setupTokens[secondTokenIndex].symbol} per {setupTokens[1 - secondTokenIndex].symbol}
                            </p>
                        </p>
                        <p className="farmInfoCurveR">
                            <p className="PriceRangeInfoFarm">
                                <a target="_blank" href={props.dfoCore.getContextElement("uniswapV3PoolURLTemplate").format(setupInfo.liquidityPoolTokenAddress)} className="InRangeV3 UniPoolFeeInfo">{window.formatMoney(window.numberToString(parseInt(lpTokenInfo.fee) / 10000), '2')}% Pool</a>
                                {setup.objectId && setup.objectId !== '0' && <a href={props.dfoCore.getContextElement("uniswapV3NFTURLTemplate").format(setup.objectId)} target="_blank" className="UniNFTInfo">NFT</a>}
                            </p>
                        </p>
                        {!tickData ? <Loading/> : <div className="UniV3CurveView">
                            <div className="UniV3CurveViewCurv">
                                <span className="CircleLeftV3Curve"></span>
                                <span className="CircleLeftV3CurvePrice">{window.formatMoney(tickData.minPrice, 3)}</span>
                                <span className="CircleRightV3Curve"></span>
                                <span className="CircleRightV3CurvePrice">{window.formatMoney(tickData.maxPrice, 3)}</span>
                                <div className="CircleActualPriceV3" style={{left : `${tickData.cursor}%`}}>
                                    <span className="CircleRightV3Actual">
                                        <img src={ArrowIcon}></img>
                                        <span className="CircleRightV3ActualPrice">{window.formatMoney(tickData.currentPrice, 3)}</span>
                                    </span>
                                </div>
                            </div>
                        </div>}
                        <span className="UniV3TVLFIV">
                            <b>TVL</b>: {setupTokens.map((token, index) => <span key={token.address}>{window.formatMoney(window.fromDecimals(token.liquidity, token.decimals, true), 4)} {token.symbol}{index !== setupTokens.length - 1 ? ' - ' : ''}</span>)}
                        </span>
                    </div>
                </div>
            </div>
                {
                    currentPosition &&
                    <div className="YourFarmingPositions YourFarmingPositionsFarmingFarmingFarmingChiFarmaViveComeUnPAsha">
                        <div className="FarmYou">
                            {manageStatus && <p><b>Your Deposit</b>:<br></br> {manageStatus.tokens.map((token, i) => <span key={token.address}> {window.formatMoney(window.fromDecimals(manageStatus.tokensAmounts[i], token.decimals, true), 3)} {token.symbol} </span>)}</p>}
                            {!endBlockReached && <p><b>Daily Earnings</b>: {calculateDailyEarnings()} {rewardTokenInfo.symbol}</p>}
                            {(!manageStatus?.withdrawOnly && !open && parseInt(setup.endBlock) > parseInt(blockNumber)) && <a className="web2ActionBTN" onClick={() => { setOpen(true); setWithdrawOpen(false); setEdit(false); }}>Increase</a>}
                            {(open) && <a className="backActionBTN" onClick={() => { setOpen(false); setWithdrawOpen(false); setEdit(false) }}>Close</a>}
                            {!manageStatus?.withdrawOnly && !withdrawOpen && <a className="web2ActionBTN web2ActionBTNGigi" onClick={() => { setOpen(false); setWithdrawOpen(true); setEdit(false); }}>Decrease</a>}
                            {withdrawOpen && <a className="backActionBTN" onClick={() => { setOpen(false); setWithdrawOpen(false); setEdit(false) }}>Close</a>}
                            {manageStatus?.withdrawOnly && !withdrawingAll && <a onClick={withdrawAll} className="Web3ActionBTN">Withdraw All</a>}
                            {withdrawingAll && <Loading/>}
                        </div>
                        <div className="Farmed">
                                <p><b>Available</b>: <br></br>{window.formatMoney(window.fromDecimals(freeAvailableRewards, rewardTokenInfo.decimals, true), 4)} {rewardTokenInfo.symbol}</p>
                                {manageStatus && <p><b>Fees Earned</b>: <br></br>{window.formatMoney(window.fromDecimals(manageStatus.additionalFees[0], setupTokens[0].decimals, true), 4)} {setupTokens[0].symbol} - {window.formatMoney(window.fromDecimals(manageStatus.additionalFees[1], setupTokens[1].decimals), 4)} {setupTokens[1].symbol}</p>}
                                {
                                    claimLoading ? <a className="Web3ActionBTN" disabled={claimLoading}>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    </a> : !manageStatus?.withdrawOnly && <a onClick={withdrawReward} className="Web3ActionBTN">Claim</a>
                                }
                        </div>
                    </div>
                }
            {
                ((open || withdrawOpen) && !edit) ? <><hr />{getAdvanced()}</> : <div />
            }
            {
                (edit && !open && !withdrawOpen) ? getEdit() : <div />
            }
        </div>)};

const mapStateToProps = (state) => {
    return {};
}

const mapDispatchToProps = (dispatch) => {
    return {
        addTransaction: (index) => dispatch(addTransaction(index))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SetupComponentGen2);