import { useState } from 'react';
import { connect } from 'react-redux';
import { Coin, Input, TokenInput } from '../../../../components/shared';

const CreateOrEditFarmingSetup = (props) => {
    const { rewardToken, onAddFarmingSetup, editSetup, editSetupIndex, onEditFarmingSetup, selectedFarmingType, dfoCore, onCancel } = props;
    // general purpose
    const [loading, setLoading] = useState(false);
    const [minStakeable, setMinSteakeable] = useState((editSetup && editSetup.minStakeable) ? editSetup.minStakeable : 0);
    const [blockDuration, setBlockDuration] = useState((editSetup && editSetup.period) ? editSetup.period : 0);
    const [isRenewable, setIsRenewable] = useState((editSetup && editSetup.renewTimes) ? editSetup.renewTimes > 0 : false);
    const [renewTimes, setRenewTimes] = useState((editSetup && editSetup.renewTimes) ? editSetup.renewTimes : 0);
    const [involvingEth, setInvolvingEth] = useState((editSetup && editSetup.involvingEth) ? editSetup.involvingEth : false);
    const [ethAddress, setEthAddress] = useState((editSetup && editSetup.ethAddress) ? editSetup.ethAddress : "");
    const [ethSelectData, setEthSelectData] = useState((editSetup && editSetup.ethSelectData) ? editSetup.ethSelectData : null);
    // free setup state
    const [freeLiquidityPoolToken, setFreeLiquidityPoolToken] = useState((editSetup && editSetup.data) ? editSetup.data : null);
    const [freeRewardPerBlock, setFreeRewardPerBlock] = useState((editSetup && editSetup.rewardPerBlock) ? editSetup.rewardPerBlock : 0);
    // locked setup state
    const [lockedMainToken, setLockedMainToken] = useState((editSetup && editSetup.data) ? editSetup.data : null);
    const [lockedMaxLiquidity, setLockedMaxLiquidity] = useState((editSetup && editSetup.maxLiquidity) ? editSetup.maxLiquidity : 0);
    const [lockedRewardPerBlock, setLockedRewardPerBlock] = useState((editSetup && editSetup.rewardPerBlock) ? editSetup.rewardPerBlock : 0);
    const [lockedSecondaryToken, setLockedSecondaryToken] = useState((editSetup && editSetup.secondaryToken) ? editSetup.secondaryToken : null);
    const [lockedHasPenaltyFee, setLockedHasPenaltyFee] = useState((editSetup && editSetup.penaltyFee) ? editSetup.penaltyFee > 0 : false);
    const [lockedPenaltyFee, setLockedPenaltyFee] = useState((editSetup && editSetup.penaltyFee) ? editSetup.penaltyFee : 0);
    // current step
    const [currentStep, setCurrentStep] = useState(0);

    const onSelectMainToken = async (address) => {
        if (!address) return;
        setLoading(true);
        try {
            if (address === dfoCore.voidEthereumAddress) {
                setLockedMainToken({ symbol: 'ETH', address });
            } else {
                const mainTokenContract = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), address);
                const symbol = await mainTokenContract.methods.symbol().call();
                setLockedMainToken({ symbol, address });
            }
        } catch (error) {
            console.error(error);
            setLockedMainToken(null);
        } finally {
            setLoading(false);
        }
    }

    const onSelectLockedSecondaryToken = async (address) => {
        if (!address) return;
        setLoading(true);
        try {
            const ammAggregator = await dfoCore.getContract(dfoCore.getContextElement('AMMAggregatorABI'), dfoCore.getContextElement('ammAggregatorAddress'));
            const res = await ammAggregator.methods.info(address).call();
            const name = res['name'];
            const ammAddress = res['amm'];
            const ammContract = await dfoCore.getContract(dfoCore.getContextElement('AMMABI'), ammAddress);
            const ammData = await ammContract.methods.data().call();
            if (ammData[0] === dfoCore.voidEthereumAddress) {
                setEthAddress(dfoCore.voidEthereumAddress);
                setEthSelectData(null);
            } else {
                setEthAddress(ammData[0]);
                const notEthToken = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), ammData[0]);
                const notEthTokenSymbol = await notEthToken.methods.symbol().call();
                setEthSelectData({ symbol: notEthTokenSymbol })
            }
            const secondatoryTokenInfo = await ammContract.methods.byLiquidityPool(address).call();
            const tokens = [];
            await Promise.all(secondatoryTokenInfo[2].map(async (tkAddress) => {
                if (tkAddress.toLowerCase() === ammData[0].toLowerCase()) {
                    setInvolvingEth(true);
                }
                const currentToken = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), tkAddress);
                const symbol = await currentToken.methods.symbol().call();
                tokens.push({ symbol, address: tkAddress, isEth: tkAddress.toLowerCase() === ammData[0].toLowerCase() })
            }));
            setLockedSecondaryToken({ 
                address, 
                name,
                tokens,
            });
        } catch (error) {
            console.error(error);
            setLockedSecondaryToken(null);
        } finally {
            setLoading(false);
        }

    }

    const onSelectFreeLiquidityPoolToken = async (address) => {
        if (!address) return;
        setLoading(true);
        try {
            const ammAggregator = await dfoCore.getContract(dfoCore.getContextElement('AMMAggregatorABI'), dfoCore.getContextElement('ammAggregatorAddress'));
            const res = await ammAggregator.methods.info(address).call();
            const name = res['name'];
            const ammAddress = res['amm'];
            const ammContract = await dfoCore.getContract(dfoCore.getContextElement('AMMABI'), ammAddress);
            const ammData = await ammContract.methods.data().call();
            if (ammData[0] === dfoCore.voidEthereumAddress) {
                setEthAddress(dfoCore.voidEthereumAddress);
                setEthSelectData(null);
            } else {
                setEthAddress(ammData[0]);
                const notEthToken = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), ammData[0]);
                const notEthTokenSymbol = await notEthToken.methods.symbol().call();
                setEthSelectData({ symbol: notEthTokenSymbol })
            }
            const lpInfo = await ammContract.methods.byLiquidityPool(address).call();
            const tokens = [];
            await Promise.all(lpInfo[2].map(async (tkAddress) => {
                if (tkAddress.toLowerCase() === ammData[0].toLowerCase()) {
                    setInvolvingEth(true);
                }
                const currentToken = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), tkAddress);
                const symbol = await currentToken.methods.symbol().call();
                tokens.push({ symbol, address: tkAddress, isEth: tkAddress.toLowerCase() === ammData[0].toLowerCase() })
            }));
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

    const onUpdatePenaltyFee = (value) => {
        setLockedPenaltyFee(value > 100 ? 100 : value);
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
                                <b>{freeLiquidityPoolToken.name} | {freeLiquidityPoolToken.tokens.map((token) => <>{!token.isEth ? token.symbol : involvingEth ? 'ETH' : token.symbol} </>)}</b> {freeLiquidityPoolToken.tokens.map((token) => <Coin address={token.address} className="mr-2" /> )}
                            </div>
                        }
                    </div>
                    {
                        freeLiquidityPoolToken && <>
                            {
                                (ethSelectData) && <div className="row justify-content-center mb-4">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" checked={involvingEth} onChange={(e) => setInvolvingEth(e.target.checked)} id="involvingEth" />
                                        <label className="form-check-label" htmlFor="involvingEth">
                                            Use {ethSelectData.symbol} as ETH
                                        </label>
                                    </div>
                                </div>
                            }
                            <div className="row justify-content-center mb-4">
                                <div className="col-6">
                                    <Input min={0} showCoin={true} address={rewardToken.address} value={freeRewardPerBlock} name={rewardToken.symbol} label={"Reward per block"} onChange={(e) => setFreeRewardPerBlock(e.target.value)} />
                                </div>
                            </div>
                            <div className="row justify-content-center align-items-center flex-column mb-2">
                                <p className="text-center"><b>Monthly*: {freeRewardPerBlock * 192000} {rewardToken.symbol}</b></p>
                                <p className="text-center"><b>Yearly*: {freeRewardPerBlock * 2304000} {rewardToken.symbol}</b></p>
                            </div>
                            <div className="row mb-4">
                                <p className="text-center">*Monthly/yearly reward are calculated in a forecast based on 192000 Blocks/m and 2304000/y.</p>
                            </div>
                            <div className="row justify-content-center mb-4">
                                <div className="col-6">
                                    <Input min={0} showCoin={true} address={rewardToken.address} value={minStakeable} name={rewardToken.symbol} label={"Min stakeable"} onChange={(e) => setMinSteakeable(e.target.value)} />
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <div className="form-check my-4">
                                    <input className="form-check-input" type="checkbox" checked={isRenewable} onChange={(e) => setIsRenewable(e.target.checked)} id="repeat" />
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
                        <button onClick={() => onCancel() } className="btn btn-light mr-4">Back</button>
                        <button 
                            onClick={() => editSetup ? onEditFarmingSetup({ rewardPerBlock: freeRewardPerBlock, data: freeLiquidityPoolToken, period: blockDuration, minStakeable, renewTimes, involvingEth, ethAddress, ethSelectData }, editSetupIndex) : onAddFarmingSetup({ rewardPerBlock: freeRewardPerBlock, data: freeLiquidityPoolToken, period: blockDuration, minStakeable, renewTimes, involvingEth, ethAddress, ethSelectData }) } 
                            disabled={!freeLiquidityPoolToken || freeRewardPerBlock <= 0 || minStakeable <= 0 || !blockDuration} 
                            className="btn btn-secondary ml-4"
                        >
                            {editSetup ? 'Edit' : 'Add'}
                        </button>
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
                                    <TokenInput label={"Liquidity pool token"} placeholder={"Liquidity pool token address"} width={60} onClick={(address) => onSelectLockedSecondaryToken(address)} text={"Load"} />
                                </div>
                            </div>
                            {
                                (lockedSecondaryToken && lockedSecondaryToken.tokens.length > 0) && <div key={lockedSecondaryToken.address} className="row align-items-center mb-4">
                                    <div className="col-md-9 col-12">
                                        <b>{lockedSecondaryToken.name} | {lockedSecondaryToken.tokens.map((token) => <>{!token.isEth ? token.symbol : involvingEth ? 'ETH' : token.symbol} </>)}</b> {lockedSecondaryToken.tokens.map((token) => <Coin address={token.address} className="mr-2" /> )}
                                    </div>
                                    <div className="col-md-3 col-12">
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => setLockedSecondaryToken(null)}>Remove</button>
                                    </div>
                                </div>
                            }
                            {
                                (lockedSecondaryToken && ethSelectData) && <div className="row justify-content-center mb-4">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" checked={involvingEth} onChange={(e) => setInvolvingEth(e.target.checked)} id="involvingEth" />
                                        <label className="form-check-label" htmlFor="involvingEth">
                                            Use {ethSelectData.symbol} as ETH
                                        </label>
                                    </div>
                                </div>
                            }
                            <div className="row justify-content-center mb-4">
                                <div className="col-6">
                                    <Input min={0} showCoin={true} address={lockedMainToken.address} value={minStakeable} name={lockedMainToken.symbol} label={"Min stakeable"} onChange={(e) => setMinSteakeable(e.target.value)} />
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
                        <button onClick={() => onCancel() } className="btn btn-light mr-4">Back</button>
                        <button onClick={() => setCurrentStep(1) } disabled={!lockedMainToken || lockedRewardPerBlock <= 0 || !lockedMaxLiquidity || !lockedSecondaryToken || !blockDuration} className="btn btn-secondary ml-4">Next</button>
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
                        <input className="form-check-input" type="checkbox" checked={lockedHasPenaltyFee} onChange={(e) => setLockedHasPenaltyFee(e.target.checked)} id="penaltyFee" />
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
                        <input className="form-check-input" type="checkbox" checked={isRenewable} onChange={(e) => setIsRenewable(e.target.checked)} id="repeat" />
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
                    <button onClick={() => setCurrentStep(0) } className="btn btn-light mr-4">Back</button>
                    <button onClick={() => editSetup ? onEditFarmingSetup({
                        period: blockDuration,
                        data: lockedMainToken,
                        maxLiquidity: lockedMaxLiquidity,
                        rewardPerBlock: lockedRewardPerBlock,
                        penaltyFee: lockedPenaltyFee,
                        renewTimes,
                        secondaryToken: lockedSecondaryToken,
                        minStakeable,
                        involvingEth,
                        ethAddress,
                        ethSelectData
                    }, editSetupIndex) : onAddFarmingSetup({
                        period: blockDuration,
                        data: lockedMainToken,
                        maxLiquidity: lockedMaxLiquidity,
                        rewardPerBlock: lockedRewardPerBlock,
                        penaltyFee: lockedPenaltyFee,
                        renewTimes,
                        secondaryToken: lockedSecondaryToken,
                        minStakeable,
                        involvingEth,
                        ethAddress,
                        ethSelectData
                    })} disabled={(isRenewable && renewTimes === 0) || (lockedHasPenaltyFee && lockedPenaltyFee === 0)} className="btn btn-secondary ml-4">
                        {editSetup ? 'Edit' : 'Add'}
                    </button>
                </div>
            </div>
        )
    }

    if (currentStep === 0) {
        return selectedFarmingType === 'free' ? getFreeFirstStep() : getLockedFirstStep();
    } else if (currentStep === 1) {
        return getLockedSecondStep();
    }

    return (
        <div/>
    )
}


const mapStateToProps = (state) => {
    const { core } = state;
    return { dfoCore: core.dfoCore };
}

export default connect(mapStateToProps)(CreateOrEditFarmingSetup);