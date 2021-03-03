import { useState, useEffect, Fragment } from 'react';
import { connect } from 'react-redux';
import { addEntry } from '../../../../store/actions';
import { Coin, Input, TokenInput } from '../../../../components/shared';
import Loading from '../../../../components/shared/Loading';

const CreateOrEditFixedInflationEntryOperation = (props) => {
    const { entry, onCancel, onFinish, operation } = props;
    const [step, setStep] = useState(0);
    // first step
    const [actionType, setActionType] = useState("");
    // second step
    const [inputToken, setInputToken] = useState(null);
    const [inputTokenMethod, setInputTokenMethod] = useState("");
    // third step
    const [transferType, setTransferType] = useState("");
    const [percentage, setPercentage] = useState(0);
    const [amount, setAmount] = useState(0);
    const [currentReceiver, setCurrentReceiver] = useState("");
    const [pathTokens, setPathTokens] = useState([]);
    const [receivers, setReceivers] = useState([]);
    // general
    const [loading, setLoading] = useState(false);

    const [enterInETH, setEnterInETH] = useState(false);
    const [exitInETH, setExitInETH] = useState(false);
    const [renderExitInETH, setRenderExitInETH] = useState(false);
    const [amm, setAmm] = useState(false);

    // check if an entry has been passed in the props
    useEffect(() => {
        if (operation) {
            var inputTokenAddress = operation.inputToken ? operation.inputToken.address ? operation.inputToken.address : operation.inputToken : null
            setActionType(operation.actionType);
            onSelectInputToken(inputTokenAddress);
            setInputTokenMethod(operation.inputTokenMethod)
            setAmount(operation.amount);
            setPercentage(operation.percentage);
            setTransferType(operation.transferType);
            setReceivers(operation.receivers);
            setPathTokens(operation.pathTokens);
            setEnterInETH(operation.enterInETH || inputTokenAddress === window.voidEthereumAddress);
            setExitInETH(operation.exitInETH || false);
            setRenderExitInETH(operation.exitInETH || false);
            setAmm(operation.amm);
        }
    }, []);

    // second step methods
    const onSelectInputToken = async (address) => {
        setAmm(null);
        setPathTokens([]);
        setExitInETH(false);
        setRenderExitInETH(false);
        if (!address) return setInputToken(null);
        setLoading(true);
        const inputTokenContract = await props.dfoCore.getContract(props.dfoCore.getContextElement('ERC20ABI'), props.dfoCore.web3.utils.toChecksumAddress(address));
        const symbol = address === window.voidEthereumAddress ? "ETH" : await inputTokenContract.methods.symbol().call();
        const decimals = address === window.voidEthereumAddress ? "18" : await inputTokenContract.methods.decimals().call();
        setInputToken({ symbol, address: props.dfoCore.web3.utils.toChecksumAddress(address), decimals });
        setLoading(false);
    }

    // third step methods
    const isValidPercentage = () => {
        var hasIncoherent = false;
        for (var receiver of receivers) {
            if (receiver.percentage <= 0 || receiver.percentage > 100) {
                hasIncoherent = true;
            }
        }
        const totalPercentage = receivers.map((receiver) => receiver.percentage).reduce((acc, num) => acc + num);
        return totalPercentage == 100 && !hasIncoherent;
    }

    const onPercentageChange = (index, percentage) => {
        var cumulate = percentage = parseInt(percentage);
        const updatedReceivers = receivers.map((receiver, i) => {
            if (i === index) {
                return { ...receiver, percentage };
            }
            if (i === receivers.length - 1) {
                return { ...receiver, percentage: 100 - cumulate };
            }
            cumulate += receiver.percentage;
            return receiver;
        });
        setReceivers(updatedReceivers);
    }

    const onAddPathToken = async (address) => {
        if (!address) return;
        setLoading(true);
        try {
            const ammAggregator = await props.dfoCore.getContract(props.dfoCore.getContextElement('AMMAggregatorABI'), props.dfoCore.getContextElement('ammAggregatorAddress'));
            const info = await ammAggregator.methods.info(address).call();
            const ammContract = await props.dfoCore.getContract(props.dfoCore.getContextElement("AMMABI"), info['amm']);
            const ammData = await ammContract.methods.data().call();
            const ethAddress = props.dfoCore.web3.utils.toChecksumAddress(ammData[0]);
            var realInputToken = props.dfoCore.web3.utils.toChecksumAddress(enterInETH ? ethAddress : inputToken.address);
            if (amm && amm.ammContract.options.address !== ammContract.options.address) {
                return;
            }
            if (pathTokens.filter(it => it.address === address).length > 0) {
                return;
            }
            const lastOutputToken = props.dfoCore.web3.utils.toChecksumAddress(pathTokens.length === 0 ? realInputToken : pathTokens[pathTokens.length - 1].outputTokenAddress);
            const lpInfo = await ammContract.methods.byLiquidityPool(address).call();
            const lpTokensAddresses = lpInfo[2];
            const symbols = [];
            let outputTokenAddress = null;
            let hasLastOutputToken = false;
            for (let i = 0; i < lpTokensAddresses.length; i++) {
                const currentTokenAddress = props.dfoCore.web3.utils.toChecksumAddress(lpTokensAddresses[i]);
                outputTokenAddress = outputTokenAddress ? outputTokenAddress : currentTokenAddress !== lastOutputToken ? currentTokenAddress : null
                if (currentTokenAddress !== window.voidEthereumAddress) {
                    const currentToken = await props.dfoCore.getContract(props.dfoCore.getContextElement('ERC20ABI'), currentTokenAddress);
                    const currentTokenSymbol = await currentToken.methods.symbol().call();
                    symbols.push(currentTokenSymbol);
                }
                ethAddress === currentTokenAddress && (symbols[symbols.length - 1] = `ETH (${symbols[symbols.length - 1]})`);
                if (lastOutputToken === currentTokenAddress) {
                    hasLastOutputToken = true;
                }
            }
            if (!hasLastOutputToken) {
                return;
            }
            !amm && setAmm({ ammAggregator, info, ammContract, ammData, ethAddress });
            const pathTokenContract = await props.dfoCore.getContract(props.dfoCore.getContextElement('ERC20ABI'), address);
            const symbol = await pathTokenContract.methods.symbol().call();
            const decimals = await pathTokenContract.methods.decimals().call();
            setPathTokens(pathTokens.concat({ symbol, address, decimals, output: null, outputTokenAddress, lpTokensAddresses, symbols }));
            setExitInETH(outputTokenAddress === ethAddress);
            setRenderExitInETH(!enterInETH && outputTokenAddress === ethAddress && ethAddress !== window.voidEthereumAddress);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const getEntry = () => {
        return {
            actionType,
            inputToken,
            inputTokenMethod,
            amount,
            percentage,
            transferType,
            receivers,
            pathTokens,
            index: operation ? operation.index : -1,
            enterInETH,
            exitInETH,
            amm
        }
    }

    function changeEnterInETH(e) {
        setEnterInETH(e.currentTarget.value === 'true');
        onSelectInputToken(e.currentTarget.value === 'true' ? window.voidEthereumAddress : null);
        e.currentTarget.value === 'true' && setInputTokenMethod("reserve");
        e.currentTarget.value === 'true' && onTransferChange({ target: { value: 'amount' } });
    }

    function changeExitInETH(e) {
        setExitInETH(e.currentTarget.value === 'true');
    }

    // step retrieval methods
    const getStep = () => {
        switch (step) {
            case 0:
                return getFirstStep();
            case 1:
                return getSecondStep();
            case 2:
                return getThirdStep();
            case 3:
                return getFourthStep();
            default:
                return <div />
        }
    }

    const getFirstStep = () => {
        var disabled = !actionType;
        return <div className="InputForm">
            <h6><b>Add new Operation by:</b></h6>
            <select className="SelectRegular" value={actionType} onChange={e => setActionType(e.target.value)}>
                <option value="">Operation type</option>
                <option value="transfer">Transfer</option>
                <option value="swap">Swap</option>
            </select>
            <div className="Web2ActionsBTNs">
                <a onClick={() => {
                    setActionType("");
                    props.cancelEditOperation();
                }} className="backActionBTN">Cancel</a>
                <a onClick={() => !disabled && setStep(1)} disabled={disabled} className={"web2ActionBTN" + (disabled ? " disabled" : "")}>Next</a>
            </div>
        </div>
    }

    const getSecondStep = () => {
        var disabled = !inputToken || !inputTokenMethod;
        return <div className="InputForm">
            <select className="SelectRegular" value={(enterInETH && enterInETH.toString()) || "false"} onChange={changeEnterInETH}>
                <option value="false" >Token or Item</option>
                <option value="true">Ethereum</option>
            </select>
            {!enterInETH && <div className="CreateList CreateListS">
                <TokenInput placeholder={"Token address"} tokenAddress={inputToken ? inputToken.address : ''} label={"Input token"} placeholder={"Input token address"} width={60} onClick={(address) => onSelectInputToken(address)} text={"Load"} />
            </div>}
            {
                loading ? <div className="row justify-content-center">
                    <div className="spinner-border text-secondary" role="status">
                        <span className="visually-hidden"></span>
                    </div>
                </div> : <>
                        {inputToken && <div className="TokenInflLoaded">
                            <h5>{inputToken.symbol}</h5> <Coin address={inputToken.address} className="TokenInflLoaded" />
                        </div>
                        }
                        <select value={inputTokenMethod} onChange={(e) => setInputTokenMethod(e.target.value)} className="SelectRegular">
                            <option value="">Select method</option>
                            {!enterInETH && <option value="mint">By mint</option>}
                            <option value="reserve">By reserve</option>
                        </select>
                        <p>If “by reserve” is selected, the input token will be sent from a wallet. If “by mint” is selected, it will be minted and then sent. The logic of this action must be carefully coded into the extension! To learn more, read the <a>Documentation (coming Soon)</a></p>
                    </>
            }
            <div className="Web2ActionsBTNs">
                <a onClick={() => setStep(step - 1)} className="backActionBTN">Back</a>
                <a onClick={() => !disabled && setStep(2)} disabled={disabled} className={"web2ActionBTN" + (disabled ? " disabled" : "")}>Next</a>
            </div>
        </div>
    }

    const getTransferThirdStep = () => {
        return <>
            <h6><b>Transfer</b></h6>
            <select value={transferType} onChange={(e) => setTransferType(e.target.value)} className="SelectRegular">
                <option value="">Select type</option>
                {!enterInETH && <option value="percentage">Percentage</option>}
                <option value="amount">Amount</option>
            </select>
            {
                transferType ?
                    transferType == 'percentage' ?
                        <div className="SpecialInputPerch">
                            <aside>%</aside>
                            <input type="number" min={0} max={100} value={percentage} onChange={(e) => setPercentage(e.target.value)} className="TextRegular" />
                            <p>Of {inputToken.symbol} Existing Supply</p>
                        </div>
                        :
                        <div className="InputTokensRegular">
                            <div className="InputTokenRegular">
                                <Input showCoin={true} address={inputToken.address} name={inputToken.symbol} value={amount} onChange={(e) => setAmount(e.target.value)} />
                            </div>
                        </div>
                    : <div />
            }
            {
                transferType ? <>
                    <h6><b>Receiver</b></h6>
                    <div className="CheckboxQuestions">
                        <input type="text" value={currentReceiver} onChange={(e) => setCurrentReceiver(e.target.value)} className="TextRegular" placeholder="Address" aria-label="Receiver" aria-describedby="button-add" />
                    </div>
                    <div className="Web2ActionsBTNs">
                        <a onClick={() => {
                            if (!window.isEthereumAddress(currentReceiver)) return;
                            const exists = receivers.filter((r) => r.address === currentReceiver).length > 0;
                            if (exists) return;
                            setReceivers(receivers.concat({ address: currentReceiver, percentage: receivers.length === 0 ? 100 : 0 }));
                            setCurrentReceiver("");
                        }} className="web2ActionBTN" type="button" id="button-add">+</a>
                    </div>
                    <div className="ReceiversList">
                        {
                            receivers.map((receiver, index) => {
                                return (
                                    <div key={receiver.address} className="ReceiverSingle">
                                        <p>{receiver.address}</p>
                                        <div className="DeleteAddress">
                                            <a onClick={() => setReceivers(receivers.filter((_, i) => i !== index))} className="web2ActionBTN">X</a>
                                        </div>
                                        {index !== receivers.length - 1 &&
                                            <div className="SpecialInputPerch">
                                                <aside>%</aside>
                                                <input type="number" min={0} max={100} onChange={(e) => onPercentageChange(index, e.target.value)} className="TextRegular" value={receiver.percentage} />
                                            </div>}
                                        {index === receivers.length - 1 && receivers.length !== 1 && <span>{receiver.percentage}</span>}
                                    </div>
                                )
                            })
                        }
                    </div>
                </> : <div />
            }
        </>
    }

    function onTransferChange(e) {
        setPercentage('');
        setAmount('');
        setTransferType(e.target.value);
    }

    function removePathTokens(index) {
        var removeAMM = pathTokens.length === 1;
        var newPathTokens = pathTokens.filter((_, i) => i !== index);
        setPathTokens(newPathTokens);
        removeAMM && setAmm(null);
        setExitInETH(false);
        setRenderExitInETH(!enterInETH && newPathTokens.length > 0 && newPathTokens[newPathTokens.length - 1].outputTokenAddress === amm.ethAddress && amm.ethAddress !== window.voidEthereumAddress);
    }

    const getSwapThirdStep = () => {
        return <>
            <h6><b>Swap</b></h6>
            <select value={transferType} onChange={onTransferChange} className="SelectRegular">
                <option value="">Select type</option>
                {!enterInETH && <option value="percentage">Percentage</option>}
                <option value="amount">Amount</option>
            </select>
            {
                transferType ?
                    transferType == 'percentage' ?
                        <div className="SpecialInputPerch">
                            <aside>%</aside>
                            <input type="number" min={0} max={100} value={percentage} onChange={(e) => setPercentage(e.target.value)} className="TextRegular" />
                            <p>Of {inputToken.symbol} Existing Supply</p>
                        </div>
                        :
                        <div className="InputTokensRegular">
                            <div className="InputTokenRegular">
                                <Input showCoin={true} address={inputToken.address} name={inputToken.symbol} value={amount} onChange={(e) => setAmount(e.target.value)} />
                            </div>
                        </div>
                    : <div />
            }
            {transferType && loading && <Loading />}
            {transferType && !loading && pathTokens.map((pathToken, index) => {
                var realInputToken = props.dfoCore.web3.utils.toChecksumAddress(enterInETH ? amm.ethAddress : inputToken.address);
                var lastOutputToken = props.dfoCore.web3.utils.toChecksumAddress(pathTokens.length === 1 ? realInputToken : pathTokens[pathTokens.length - 2].outputTokenAddress);
                return <Fragment key={pathToken.address}>
                    {pathToken && <div className="PathSelected">
                        <p>{pathToken.symbol} {pathToken.symbols.map((symbol) => <span>{symbol} </span>)}</p> {index === pathTokens.length - 1 ? <a className="backActionBTN" onClick={() => removePathTokens(index)}>x</a> : <div />}
                    </div>}
                    <div className="PathSelected">
                        <select value={pathToken.outputTokenAddress} disabled={index !== pathTokens.length - 1} onChange={e => setPathTokens(pathTokens.map((pt, i) => i === index ? { ...pt, outputTokenAddress: e.target.value } : pt))} className="SelectRegular">
                            {pathToken.lpTokensAddresses.filter(it => index !== pathTokens.length - 1 ? true : props.dfoCore.web3.utils.toChecksumAddress(it) !== lastOutputToken).map(lpTokenAddress => <option value={lpTokenAddress}>{pathToken.symbols[pathToken.lpTokensAddresses.indexOf(lpTokenAddress)]}</option>)}
                        </select>
                    </div>
                </Fragment>
            })}
            {transferType && renderExitInETH && 
                <div className="CheckboxQuestions">
                    <label>
                        <input name="enterInETH" type="radio" value="true" onChange={changeExitInETH} checked={exitInETH} />
                        <span>ETH</span>
                    </label>
                    <label>
                        <input name="enterInETH" type="radio" value="false" onChange={changeExitInETH} checked={!exitInETH} />
                        <span>WETH</span>
                    </label>
                </div>}
            {transferType && <div className="CreateList CreateListS">
                <TokenInput label={"Path"} placeholder={"Pool Address"} deleteAfterInsert={true} onClick={(address) => onAddPathToken(address)} text={"Load"} />
                <p>Insert the address of the Liquidity Pool where the swap operation will occur</p>
            </div>}

            {
                transferType ? <>
                    <h6><b>Receiver(s)</b></h6>
                    <div className="CheckboxQuestions">
                        <input type="text" value={currentReceiver} onChange={(e) => setCurrentReceiver(e.target.value)} className="TextRegular" placeholder="Address" aria-label="Receiver" aria-describedby="button-add" />
                        <div className="Web2ActionsBTNs"></div>
                        <a onClick={() => {
                            const exists = receivers.filter((r) => r.address === currentReceiver).length > 0;
                            if (exists) return;
                            setReceivers(receivers.concat({ address: currentReceiver, percentage: receivers.length === 0 ? 100 : 0 }));
                            setCurrentReceiver("");
                        }} className="Web2ActionBTN" type="button" id="button-add">+</a>
                    </div>
                    <div className="ReceiversList">
                        {
                            receivers.map((receiver, index) => {
                                return (
                                    <div key={receiver.address} className="ReceiverSingle">
                                        <p>{receiver.address}</p>
                                        <div className="DeleteAddress">
                                            <a onClick={() => setReceivers(receivers.filter((_, i) => i !== index))} className="web2ActionBTN">X</a>
                                        </div>
                                        {index !== receivers.length - 1 &&
                                            <div className="SpecialInputPerch">
                                                <aside>%</aside>
                                                <input type="number" min={0} max={100} onChange={(e) => onPercentageChange(index, e.target.value)} className="TextRegular" value={receiver.percentage} />
                                            </div>}
                                        {index === receivers.length - 1 && receivers.length !== 1 && <span>{receiver.percentage}</span>}
                                    </div>
                                )
                            })
                        }
                    </div>
                </> : <div />
            }
        </>
    }

    const getThirdStep = () => {
        var disabled = (!amount && !percentage) || !transferType || receivers.length === 0 || !isValidPercentage() || (actionType === 'swap' && pathTokens.length === 0);
        return <div className="InputForm">
            {actionType === 'transfer' ? getTransferThirdStep() : getSwapThirdStep()}
            <div className="Web2ActionsBTNs">
                <a onClick={() => setStep(step - 1)} className="backActionBTN">Back</a>
                <a
                    onClick={() => !disabled && props.saveEditOperation(getEntry())}
                    disabled={disabled}
                    className={"web2ActionBTN" + (disabled ? " disabled" : "")}
                >Add</a>
            </div>
        </div>
    }

    const getFourthStep = () => {
        return <div />
    }

    return getStep();
}

const mapStateToProps = (state) => {
    const { core, session } = state;
    const { dfoCore } = core;
    const { inflationSetups } = session;
    return { dfoCore, inflationSetups };
}

const mapDispatchToProps = (dispatch) => {
    return {
        addEntry: (entry, setupIndex) => dispatch(addEntry(entry, setupIndex)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateOrEditFixedInflationEntryOperation);