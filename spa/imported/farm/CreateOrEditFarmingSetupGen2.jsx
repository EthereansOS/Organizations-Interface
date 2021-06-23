import { useEffect } from 'react';
import { useState } from 'react';
import { connect } from 'react-redux';
import { Coin, Input, TokenInput } from '../../../../components/shared';
import {
    tickToPrice,
    nearestUsableTick,
    TICK_SPACINGS,
    TickMath
} from '@uniswap/v3-sdk/dist/';
import { Token } from "@uniswap/sdk-core/dist";

const CreateOrEditFarmingSetupGen2 = (props) => {
    const { rewardToken, onAddFarmingSetup, editSetup, onEditFarmingSetup, dfoCore, onCancel } = props;
    const selectedFarmingType = editSetup ? (editSetup.free ? "free" : "locked") : props.selectedFarmingType;
    // general purpose
    const [loading, setLoading] = useState(false);
    const [blockDuration, setBlockDuration] = useState((editSetup && editSetup.blockDuration) ? editSetup.blockDuration : 0);
    const [startBlock, setStartBlock] = useState((editSetup && editSetup.startBlock) ? editSetup.startBlock : 0);
    const [hasStartBlock, setHasStartBlock] = useState((editSetup && editSetup.startBlock) ? true : false);
    const [hasMinStakeable, setHasMinStakeable] = useState((editSetup && editSetup.minStakeable) ? editSetup.minStakeable : false);
    const [minStakeable, setMinSteakeable] = useState((editSetup && editSetup.minStakeable) ? editSetup.minStakeable : 0);
    const [isRenewable, setIsRenewable] = useState((editSetup && editSetup.renewTimes) ? editSetup.renewTimes > 0 : false);
    const [renewTimes, setRenewTimes] = useState((editSetup && editSetup.renewTimes) ? editSetup.renewTimes : 0);
    const [involvingEth, setInvolvingEth] = useState((editSetup && editSetup.involvingEth) ? editSetup.involvingEth : false);
    const [ethSelectData, setEthSelectData] = useState((editSetup && editSetup.ethSelectData) ? editSetup.ethSelectData : null);
    const [tickUpper, setTickUpper] = useState((editSetup && editSetup.tickUpper) ? editSetup.tickUpper : 0);
    const [tickLower, setTickLower] = useState((editSetup && editSetup.tickLower) ? editSetup.tickLower : 0);
    // token state
    const [liquidityPoolToken, setLiquidityPoolToken] = useState((editSetup && editSetup.data) ? editSetup.data : null);
    const [mainTokenIndex, setMainTokenIndex] = useState((editSetup && editSetup.mainTokenIndex) ? editSetup.mainTokenIndex : 0);
    const [mainToken, setMainToken] = useState((editSetup && editSetup.mainToken) ? editSetup.mainToken : null);
    const [rewardPerBlock, setRewardPerBlock] = useState((editSetup && editSetup.rewardPerBlock) ? editSetup.rewardPerBlock : 0);
    const [maxStakeable, setMaxStakeable] = useState((editSetup && editSetup.maxStakeable) ? editSetup.maxStakeable : 0);
    const [hasPenaltyFee, setHasPenaltyFee] = useState((editSetup && editSetup.penaltyFee) ? editSetup.penaltyFee > 0 : false);
    const [penaltyFee, setPenaltyFee] = useState((editSetup && editSetup.penaltyFee) ? editSetup.penaltyFee : 0);
    const [ethAddress, setEthAddress] = useState((editSetup && editSetup.ethAddress) ? editSetup.ethAddress : "");
    const [uniswapTokens, setUniswapTokens] = useState([]);
    const [secondTokenIndex, setSecondTokenIndex] = useState(1);
    const [maxPrice, setMaxPrice] = useState(0);
    const [minPrice, setMinPrice] = useState(0);
    // current step
    const [currentStep, setCurrentStep] = useState(0);

    const dilutedTickRange = 92100;
    var tickLowerInput;
    var tickUpperInput;

    useEffect(() => {
        if (editSetup && (editSetup.liquidityPoolTokenAddress || (editSetup.liquidityPoolToken && editSetup.liquidityPoolToken.address))) {
            onSelectLiquidityPoolToken(editSetup.liquidityPoolTokenAddress || editSetup.liquidityPoolToken.address).then(() => editSetup.mainToken && setMainToken(editSetup.mainToken));
        }
    }, []);

    useEffect(() => {
        var minPrice;
        var maxPrice;
        try {
            setMinPrice(minPrice = tickToPrice(uniswapTokens[secondTokenIndex], uniswapTokens[1 - secondTokenIndex], parseInt(tickLowerInput.value = tickLower)).toSignificant(18));
        } catch(e) {
        }
        try {
            setMaxPrice(maxPrice = tickToPrice(uniswapTokens[secondTokenIndex], uniswapTokens[1 - secondTokenIndex], parseInt(tickUpperInput.value = tickUpper)).toSignificant(18));
        } catch(e) {
        }
    }, [tickLower, tickUpper, secondTokenIndex]);

    const onSelectLiquidityPoolToken = async (address) => {
        if (!address) return;
        setLoading(true);
        try {
            const poolContract = await dfoCore.getContract(dfoCore.getContextElement("UniswapV3PoolABI"), address);
            var fee = await poolContract.methods.fee().call();
            var tick = parseInt((await poolContract.methods.slot0().call()).tick);
            var tickLower = nearestUsableTick(tick, TICK_SPACINGS[fee]);
            var tickUpper = tickLower;
            if(props.gen2SetupType === 'diluted') {
                tickLower -= dilutedTickRange;
                tickUpper += dilutedTickRange;
            }
            setTickLower(nearestUsableTick(tickLower, TICK_SPACINGS[fee]));
            setTickUpper(nearestUsableTick(tickUpper, TICK_SPACINGS[fee]));
            console.log({
                tick : nearestUsableTick(tick, TICK_SPACINGS[fee]),
                tickLower,
                tickUpper
            });

            const lpInfo = [
                [], [], [
                    await poolContract.methods.token0().call(),
                    await poolContract.methods.token1().call()
                ]
            ];
            const ammData = [
                await (await dfoCore.getContract(dfoCore.getContextElement("UniswapV3NonfungiblePositionManagerABI"), dfoCore.getContextElement('uniswapV3NonfungiblePositionManagerAddress'))).methods.WETH9().call()
            ];
            const tokens = [];
            var uniTokens = [];
            let ethTokenFound = false;
            setInvolvingEth(false);
            await Promise.all(lpInfo[2].map(async (tkAddress) => {
                if (tkAddress.toLowerCase() === ammData[0].toLowerCase()) {
                    setInvolvingEth(true);
                    ethTokenFound = true;
                    setEthAddress(ammData[0]);
                    if (ammData[0] === dfoCore.voidEthereumAddress) {
                        setEthSelectData(null);
                    } else {
                        const notEthToken = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), ammData[0]);
                        const notEthTokenSymbol = await notEthToken.methods.symbol().call();
                        setEthSelectData({ symbol: notEthTokenSymbol })
                    }
                }
                const currentToken = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), tkAddress);
                const symbol = tkAddress === window.voidEthereumAddress || tkAddress === ammData[0] ? "ETH" : await currentToken.methods.symbol().call();
                var name = tkAddress === window.voidEthereumAddress || tkAddress === ammData[0] ? "Ethereum" : await currentToken.methods.name().call();
                var decimals = parseInt(tkAddress ===window.voidEthereumAddress ? "18" : await currentToken.methods.decimals().call());
                tokens.push({ symbol, name, decimals, address: tkAddress, isEth: tkAddress.toLowerCase() === ammData[0].toLowerCase() });
                var uniToken = new Token(props.dfoCore.chainId, tkAddress, decimals, name, symbol);
                uniTokens.push(uniToken);
            }));
            if (!ethTokenFound) setEthSelectData(null);
            setLiquidityPoolToken({
                address,
                name: 'Uniswap V3',
                tokens,
                poolContract,
                fee,
                tick
            });
            setMainToken(tokens[0]);
            setUniswapTokens(uniTokens);
            setSecondTokenIndex(1);
        } catch (error) {
            setInvolvingEth(false);
            setEthSelectData(null);
            setLiquidityPoolToken(null);
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const onUpdateHasMinStakeable = (value) => {
        setHasMinStakeable(value);
        setMinSteakeable(0);
    }

    const onUpdateHasPenaltyFee = (value) => {
        setHasPenaltyFee(value);
        setPenaltyFee(0)
    }

    const onUpdatePenaltyFee = (value) => {
        setPenaltyFee(value > 100 ? 100 : value);
    }

    const onFreeRewardPerBlockUpdate = (value) => {
        const parsedValue = dfoCore.fromDecimals(value, rewardToken.decimals);
        setRewardPerBlock(parsedValue < 1 ? 0 : value);
    }

    const addSetup = () => {
        if (hasMinStakeable && window.formatNumber(minStakeable) <= 0) {
            return;
        }
        if (isRenewable && window.formatNumber(renewTimes) <= 0) {
            return;
        }
        const setup = {
            free: selectedFarmingType === 'free',
            blockDuration,
            startBlock,
            minStakeable,
            renewTimes,
            involvingEth,
            ethSelectData,
            liquidityPoolToken,
            mainTokenIndex,
            mainToken,
            rewardPerBlock,
            maxStakeable,
            penaltyFee,
            ethAddress,
            tickLower,
            tickUpper
        };
        editSetup ? onEditFarmingSetup(setup, props.editSetupIndex) : onAddFarmingSetup(setup);
    }

    function next() {
        if (selectedFarmingType === 'locked' && window.formatNumber(maxStakeable) <= 0) {
            return;
        }
        currentStep === 0 && liquidityPoolToken && window.formatNumber(blockDuration) > 0 && window.formatNumber(rewardPerBlock) > 0 && setCurrentStep(props.gen2SetupType === 'diluted' ? 2 : 1);
        currentStep === 1 && tickUpper !== tickLower && tickLower >= TickMath.MIN_TICK && tickUpper <= TickMath.MAX_TICK && tickLower < tickUpper && tickLower % TICK_SPACINGS[liquidityPoolToken.fee] === 0 && tickUpper % TICK_SPACINGS[liquidityPoolToken.fee] === 0 && setCurrentStep(2);
    }

    function updateTick(tick, increment) {
        var tickToUpdate = tick === 0 ? tickLower : tickUpper;
        var step = TICK_SPACINGS[liquidityPoolToken.fee];
        increment && (tickToUpdate += step);
        !increment && (tickToUpdate -= step);
        tickToUpdate = tickToUpdate > TickMath.MAX_TICK ? TickMath.MAX_TICK : tickToUpdate < TickMath.MIN_TICK ? TickMath.MIN_TICK : tickToUpdate;
        tick === 0 && setTickLower(tickToUpdate);
        tick === 1 && setTickUpper(tickToUpdate);
    }

    function onTickInputBlur(e) {
        var value = nearestUsableTick(window.formatNumber(e.currentTarget.value) || 0, TICK_SPACINGS[liquidityPoolToken.fee]);
        var tick = parseInt(e.currentTarget.dataset.tick);
        tick === 0 && setTickLower(value);
        tick === 1 && setTickUpper(value);
    }

    const getFirstStep = () => {
        return <div className="CheckboxQuestions">
            <div className="FancyExplanationCreate">
                <p className="BreefRecapB">Load the Pool you want to reward for this setup by its Ethereum address.</p>
                <TokenInput placeholder={"Liquidity pool address"} tokenAddress={(editSetup && (editSetup.liquidityPoolTokenAddress || (editSetup.liquidityPoolToken && editSetup.liquidityPoolToken.address))) || ""} onClick={onSelectLiquidityPoolToken} text={"Load"} />
            </div>
            {
                loading ? <div className="row justify-content-center">
                    <div className="spinner-border text-secondary" role="status">
                        <span className="visually-hidden"></span>
                    </div>
                </div> : <>
                    <div className="CheckboxQuestions">
                        {(liquidityPoolToken && liquidityPoolToken.tokens.length > 0) &&
                            <h6 className="TokenSelectedB uuuuTokenLoad"><b>{liquidityPoolToken.name} | {liquidityPoolToken.tokens.map((token) => <>{!token.isEth ? token.symbol : involvingEth ? 'ETH' : token.symbol} </>)}</b> {liquidityPoolToken.tokens.map((token) => <Coin address={!token.isEth ? token.address : involvingEth ? props.dfoCore.voidEthereumAddress : token.address} />)}</h6>
                        }
                    </div>
                    {
                        liquidityPoolToken && <>
                            {
                                false && ethSelectData &&
                                <div className="form-check HIDEO">
                                    <input className="form-check-input" type="checkbox" checked={involvingEth} onChange={(e) => setInvolvingEth(e.target.checked)} id="involvingEth" />
                                    <label className="form-check-label" htmlFor="involvingEth">
                                        Use {ethSelectData.symbol} as ETH
                                    </label>
                                </div>
                            }
                            <div className="FancyExplanationCreate">
                                        <h6>Reward per block</h6>
                                        <p className="BreefRecapB">Select the duration of the setup. The selected timeband will determine the end block once the setup begins.</p>
                                <div className="InputTokensRegular">
                                    <div className="InputTokenRegular">
                                        <Input min={0} showCoin={true} address={rewardToken.address} value={rewardPerBlock} name={rewardToken.symbol} onChange={(e) => onFreeRewardPerBlockUpdate(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="FancyExplanationCreate">
                                <p className="BreefRecapB">Select the duration of the setup. The selected timeband will determinate the end block once activated</p>
                            
                            <select className="SelectRegular" value={blockDuration} onChange={(e) => setBlockDuration(e.target.value)}>
                                <option value={0}>Choose setup duration</option>
                                {
                                    Object.keys(props.dfoCore.getContextElement("blockIntervals")).map((key, index) => {
                                        return <option key={key} value={props.dfoCore.getContextElement("blockIntervals")[key]}>{key}</option>
                                    })
                                }
                            </select>
                            </div>
                            <div className="FancyExplanationCreate">
                            <p className="BreefRecapB"><b>Total reward ({`${blockDuration}`} blocks): {rewardPerBlock * blockDuration} {rewardToken.symbol}</b></p>
                            </div>
                        </>
                    }
                    <div className="Web2ActionsBTNs">
                        <a onClick={onCancel} className="backActionBTN">Back</a>
                        <a onClick={next} className="web2ActionBTN">Next</a>
                    </div>
                </>
            }
        </div>
    }

    const choosetick = () => {
        return (
            <div>

                <div className="generationSelector">
                    <div className="InputTokenRegular">
                        <input className="PriceRangeInput" type="number" min={TickMath.MIN_TICK} max={TickMath.MAX_TICK} data-tick="0" ref={ref => tickLowerInput = ref} defaultValue={tickLower} onBlur={onTickInputBlur}/>
                    </div>
                    <div className="InputTokenRegular">
                        <a className="tickerchanger" href="javascript:;" onClick={() => updateTick(0, false)}> - </a>
                        <a className="tickerchanger" href="javascript:;" onClick={() => updateTick(0, true)}> + </a>
                    </div>
                    <h6>Min Price</h6>
                    <h5>{minPrice} {liquidityPoolToken.tokens[1 - secondTokenIndex].symbol}</h5>
                    <p>The minumum price of the curve, all position will be 100% {liquidityPoolToken.tokens[1 - secondTokenIndex].symbol} at this price and will no more earn fees.</p>
                </div>
                <div className="generationSelector">
                    <div className="InputTokenRegular">
                        <input className="PriceRangeInput" type="number" min={TickMath.MIN_TICK} max={TickMath.MAX_TICK} data-tick="1" ref={ref => tickUpperInput = ref} defaultValue={tickUpper} onBlur={onTickInputBlur}/>
                    </div>
                    <div className="InputTokenRegular">
                        <a className="tickerchanger" href="javascript:;" onClick={() => updateTick(1, false)}> - </a>
                        <a className="tickerchanger" href="javascript:;" onClick={() => updateTick(1, true)}> + </a>
                    </div>
                    <h6>Max Price</h6>
                    <h5>{maxPrice} {liquidityPoolToken.tokens[1 - secondTokenIndex].symbol}</h5>
                    <p>The minumum price of the curve, all position will be 100% {liquidityPoolToken.tokens[1 - secondTokenIndex].symbol} at this price and will no more earn fees.</p>
                </div>
                <div className="FancyExplanationCreate">
                    <div className="FancyExplanationCreateS">
                    <h6>{liquidityPoolToken.tokens[secondTokenIndex].symbol} per {liquidityPoolToken.tokens[1 - secondTokenIndex].symbol}</h6>
                    <p>Current Price: {tickToPrice(uniswapTokens[secondTokenIndex], uniswapTokens[1 - secondTokenIndex], parseInt(liquidityPoolToken.tick)).toSignificant(18)} {liquidityPoolToken.tokens[1 - secondTokenIndex].symbol}<br></br>Tick: {liquidityPoolToken.tick}</p>
                    </div>
                    <div className="FancyExplanationCreateS">
                        <a className="web2ActionBTN web2ActionBTNGigi" onClick={() => setSecondTokenIndex(1 - secondTokenIndex)}>Switch</a>
                    </div>
                </div>
                <div className="Web2ActionsBTNs">
                    <a onClick={() => setCurrentStep(0)} className="backActionBTN">Back</a>
                    <a onClick={next} className="web2ActionBTN">Next</a>
                </div>
            </div>
        );
    };

    const getSecondStep = () => {
        return (
            <div className="CheckboxQuestions">
                <div className="FancyExplanationCreate">
                    <h6><input type="checkbox" checked={hasStartBlock} onChange={(e) => {
                        setStartBlock(0);
                        setHasStartBlock(e.target.checked);
                    }} /> Start Block</h6>
                    {
                        hasStartBlock && <div className="InputTokensRegular InputRegularB">
                            <Input min={0} value={startBlock} onChange={(e) => setStartBlock(e.target.value)} />
                        </div>
                    }
                    <p className="BreefRecapB">[Optional <b>&#128171; Recommended</b>] Set a start block for this setup. Farmers will be able to activate it after that. This feature helps by giving the host the time needed to send reward tokens to the contract or vote via a DFO/DAO for more complex functionalities. more info in the <a target="_blank" href="https://docs.ethos.wiki/covenants/protocols/farm/manage-farming-setups/activate-disactivate-farming-setup">Grimoire</a></p>
                </div>
                <div className="FancyExplanationCreate">
                    <h6><input type="checkbox" checked={hasMinStakeable} onChange={(e) => onUpdateHasMinStakeable(e.target.checked)} id="minStakeable" /> Min stakeable</h6>
                    {
                        hasMinStakeable && <div className="InputTokensRegular">
                            <div className="InputTokenRegular">
                                <Input min={0} showCoin={true} address={(!mainToken?.isEth && !liquidityPoolToken.tokens[mainTokenIndex].isEth) ? `${mainToken?.address || liquidityPoolToken.tokens[mainTokenIndex].address}` : involvingEth ? props.dfoCore.voidEthereumAddress : `${mainToken?.address || liquidityPoolToken.tokens[mainTokenIndex].address}`} value={minStakeable} name={(!mainToken?.isEth && !liquidityPoolToken.tokens[mainTokenIndex].isEth) ? `${mainToken?.symbol || liquidityPoolToken.tokens[mainTokenIndex].symbol}` : involvingEth ? 'ETH' : `${mainToken?.symbol || liquidityPoolToken.tokens[mainTokenIndex].symbol}`} onChange={(e) => setMinSteakeable(e.target.value)} />
                            </div>
                            {
                                selectedFarmingType === 'free' && <>
                                    <h6>Main Token</h6>
                                    <select className="SelectRegular" value={mainTokenIndex} onChange={(e) => { setMainTokenIndex(e.target.value); setMainToken(liquidityPoolToken.tokens[e.target.value]); }}>
                                        {
                                            liquidityPoolToken.tokens.map((tk, index) => {
                                                return <option key={tk.address} value={index}>{!tk.isEth ? tk.symbol : involvingEth ? 'ETH' : tk.symbol}</option>
                                            })
                                        }
                                    </select>
                                    <br></br>
                                </>
                            }
                        </div>
                    }
                    <p className="BreefRecapB">[Optional] You can set a floor for the minimum amount of main tokens required to stake a position.</p>
                </div>
                <div className="FancyExplanationCreate">
                    <h6><input type="checkbox" checked={isRenewable} onChange={(e) => {
                        setRenewTimes(0);
                        setIsRenewable(e.target.checked);
                    }} id="repeat" /> Repeat</h6>
                    {
                        isRenewable && <div className="InputTokensRegular InputRegularB">
                            <Input min={0} value={renewTimes} onChange={(e) => setRenewTimes(e.target.value)} />
                        </div>
                    }
                    <p className="BreefRecapB">[Optional] You can customize a setup to automatically repeat itself after the end block.</p>
                </div>
                <div className="Web2ActionsBTNs">
                    <a onClick={() => setCurrentStep(1)} className="backActionBTN">Back</a>
                    <a onClick={() => addSetup()} className="web2ActionBTN">{editSetup ? 'Edit' : 'Add'}</a>
                </div>
            </div>
        )
    }

    var steps = [
        getFirstStep,
        choosetick,
        getSecondStep
    ];

    return steps[currentStep || 0]();
}


const mapStateToProps = (state) => {
    const { core } = state;
    return { dfoCore: core.dfoCore };
}

export default connect(mapStateToProps)(CreateOrEditFarmingSetupGen2);
