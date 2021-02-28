import { useEffect, useState, Fragment } from 'react';
import { connect } from 'react-redux';
import { FixedInflationComponent } from '../../../../components';
import { useLocation } from "react-router-dom";
import Loading from '../../../../components/shared/Loading';
import { Coin } from '../../../../components/shared';
import { Link } from 'react-router-dom';

const ExploreInflationContract = (props) => {

    const { dfoCore } = props;

    const [entries, setEntries] = useState([]);
    const [contract, setContract] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [executing, setExecuting] = useState(false);
    const [earnByInput, setEarnByInput] = useState(false);

    var paths = useLocation().pathname.split('/');

    useEffect(() => {
        getContractMetadata();
    }, []);

    const getContractMetadata = async () => {
        try {
            var contractAddress = paths[paths.length - 1];
            var contract = await props.dfoCore.getContract(props.dfoCore.getContextElement("FixedInflationABI"), contractAddress);
            setContract(contract);
            var result = await contract.methods.entry().call();
            var entry = result[0];
            var operations = result[1].map(it => {
                var copy = {};
                Object.entries(it).forEach(entry => copy[entry[0]] = entry[1]);
                return copy;
            });
            for (var operation of operations) {
                if (operation.ammPlugin !== window.voidEthereumAddress) {
                    var ammContract = await props.dfoCore.getContract(props.dfoCore.getContextElement("AMMABI"), operation.ammPlugin);
                    operation.amm = {
                        contract: ammContract,
                        info: await ammContract.methods.info().call(),
                        data: await ammContract.methods.data().call()
                    }
                }
                var inputTokenContract = await props.dfoCore.getContract(props.dfoCore.getContextElement("ERC20ABI"), operation.inputTokenAddress);
                operation.inputToken = {
                    contract: inputTokenContract,
                    symbol: operation.inputTokenAddress === window.voidEthereumAddress || (operation.amm && operation.enterInETH && operation.inputTokenAddress === operation.amm.data[0]) ? "ETH" : await inputTokenContract.methods.symbol().call(),
                    decimals: operation.inputTokenAddress === window.voidEthereumAddress || (operation.amm && operation.enterInETH && operation.inputTokenAddress === operation.amm.data[0]) ? "18" : await inputTokenContract.methods.decimals().call(),
                    address: operation.inputTokenAddress === window.voidEthereumAddress || (operation.amm && operation.enterInETH && operation.inputTokenAddress === operation.amm.data[0]) ? window.voidEthereumAddress : operation.inputTokenAddress
                }
                for (var swapTokenIndex in operation.swapPath) {
                    var swapToken = operation.swapPath[swapTokenIndex = parseInt(swapTokenIndex)];
                    var tokenContract = await props.dfoCore.getContract(props.dfoCore.getContextElement("ERC20ABI"), swapToken);
                    var data = {
                        contract: tokenContract,
                        symbol: await tokenContract.methods.symbol().call(),
                        decimals: await tokenContract.methods.decimals().call(),
                        address: swapToken
                    };
                    if (operation.amm && operation.exitInETH && swapTokenIndex === operation.swapPath.length - 1) {
                        data = {
                            contract: tokenContract,
                            symbol: swapToken === operation.amm.data[0] ? "ETH" : await tokenContract.methods.symbol().call(),
                            decimals: swapToken === operation.amm.data[0] ? "18" : await tokenContract.methods.decimals().call(),
                            address: swapToken === operation.amm.data[0] ? window.voidEthereumAddress : swapToken
                        }
                    }
                    (operation.swapTokens = operation.swapTokens || []).push(data);
                }
            }
            const period = Object.entries(dfoCore.getContextElement("blockIntervals")).filter(([key, value]) => value === entry.blockInterval);
            const oneHundred = await contract.methods.ONE_HUNDRED().call();
            const executorReward = (entry.callerRewardPercentage / oneHundred) * 100;
            var blockNumber = parseInt(await window.web3.eth.getBlockNumber());
            var nextBlock = parseInt(entry.lastBlock) + parseInt(entry.blockInterval);
            var extensionContract = await props.dfoCore.getContract(props.dfoCore.getContextElement("FixedInflationExtensionABI"), await contract.methods.extension().call());
            var active = true;
            try {
                active = await extensionContract.methods.active().call();
            } catch (e) {
            }
            setMetadata({
                entry,
                name: entry.name,
                period: period[0],
                executorReward,
                operations,
                extension: await contract.methods.extension().call(),
                contractAddress: contract.options.address,
                executable: active && blockNumber >= nextBlock,
                active,
                contract,
                oneHundred,
                nextBlock
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function execute() {
        setExecuting(true);
        var error;
        try {
            var sendingOptions = { from: props.dfoCore.address };
            var method = contract.methods.execute(earnByInput);
            var gasLimit = await method.estimateGas(sendingOptions);
            sendingOptions.gasLimit = gasLimit;
            var transactionResult = await method.send(sendingOptions);
            transactionResult = await window.web3.eth.getTransactionReceipt(transactionResult.transactionHash);
            var Executed = window.web3.eth.abi.decodeParameter("bool", transactionResult.logs.filter(it => it.topics[0] === window.web3.utils.sha3('Executed(bool)'))[0].data);
            error = !Executed ? "Operation not executed, extension has been deactivated" : error;
        } catch (e) {
            error = e;
        }
        setExecuting(false);
        getContractMetadata();
        error && alert(error.message || error);
    }

    return !metadata ? <Loading /> : <div className="InflationContractAll">
        <div className="InflationContractOpen">
            <h3>{metadata.entry.name}</h3>
            <div className="InflationContractOpenBack">
                <Link to={`/inflation/dapp`} className="backActionBTN">Back</Link>
            </div>
        </div>
        {metadata.operations.map((operation, i) => {
            var amount = window.fromDecimals(operation.inputTokenAmount, operation.inputTokenAmountIsPercentage ? "18" : operation.inputToken.decimals, true);
            amount = !operation.inputTokenAmountIsPercentage ? amount : (parseFloat(amount) * 100);
            return <Fragment key={i}>
                <div className="TokenOperation">
                    <h6>Operation {(i + 1)}</h6>
                    <div className="TokenOperationLinks">
                        {operation.ammPlugin !== window.voidEthereumAddress &&
                            <a target="_blank" href={`${props.dfoCore.getContextElement("etherscanURL")}address/${operation.ammPlugin}`}>{operation.amm.info[0]}</a>
                        }
                        {operation.receivers.map((it, i) => {
                            var percentage = i === operation.receiversPercentages.length ? metadata.oneHundred : operation.receiversPercentages[i];
                            if (i === operation.receiversPercentages.length) {
                                for (var perc of operation.receiversPercentages) {
                                    percentage = window.web3.utils.toBN(percentage).sub(window.web3.utils.toBN(perc)).toString();
                                }
                            }
                            return <Fragment key={it}>
                                <a target="_blank" href={`${props.dfoCore.getContextElement("etherscanURL")}address/${it}`}>
                                    {window.formatMoney(parseFloat(window.fromDecimals(percentage, 18, true)) * 100)}% Receiver
                                </a>
                            </Fragment>
                        })}
                        <a target="_blank" href={`${props.dfoCore.getContextElement("etherscanURL")}address/${metadata.extension}`}>Sender</a>
                    </div>
                    <p><b>{operation.inputTokenAmountIsByMint ? "Mint " : "Transfer "}</b> {window.formatMoney(amount) != '0' ? window.formatMoney(amount) : amount} {operation.inputTokenAmountIsPercentage ? "% of " : " "} {operation.inputToken.symbol} <Coin address={operation.inputToken.address} /> {operation.inputTokenAmountIsPercentage ? " Supply " : ""}
                        {operation.ammPlugin !== window.voidEthereumAddress && <>
                            and <b>swap</b><span> {" > "} </span>
                            {operation.swapTokens.map((swapToken, i) => <>
                                {swapToken.symbol}
                                <Coin address={swapToken.address} />
                                {i !== operation.swapTokens.length - 1 && " > "}
                            </>)}
                        </>}</p>
                </div>
            </Fragment>
        })}
        <div className="TokenOperationExecute">
            {metadata.executorReward !== 0 && <h5> {window.formatMoney(metadata.executorReward)}% reward by</h5>}
            {metadata.executable && !executing && <select className="SelectRegular" value={earnByInput} onChange={e => setEarnByInput(e.currentTarget.value === 'true')}>
                <option value="true">Input</option>
                <option value="false">Output</option>
            </select>}
        </div>
        <h5>Next Execution Block: <a href={`${props.dfoCore.getContextElement("etherscanURL")}block/${metadata.nextBlock}`} target="_blank"><b>#{metadata.nextBlock}</b></a></h5>
        {metadata.executable && !executing && <a className="Web3ActionBTN" onClick={execute}>Execute</a>}
        {executing && <Loading />}
    </div>;
}

const mapStateToProps = (state) => {
    return { dfoCore: state.core.dfoCore };
}

export default connect(mapStateToProps)(ExploreInflationContract);