import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Loading from '../Loading';

const FixedInflationComponent = (props) => {
    const { className, dfoCore, contract, entry, operations, showButton, hasBorder } = props;
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [earnByInput, setEarnByInput] = useState(false);

    useEffect(() => {
        getContractMetadata();
    }, []);

    const getContractMetadata = async () => {
        setLoading(true);
        try {
            const period = Object.entries(dfoCore.getContextElement("blockIntervals")).filter(([key, value]) => value === entry.blockInterval);
            const oneHundred = await contract.methods.ONE_HUNDRED().call();
            const executorReward = (entry.callerRewardPercentage / oneHundred) * 100;
            var blockNumber = parseInt(await window.web3.eth.getBlockNumber());
            var nextBlock = parseInt(entry.lastBlock) + parseInt(entry.blockInterval);
            var extensionContract = await props.dfoCore.getContract(props.dfoCore.getContextElement("FixedInflationExtensionABI"), await contract.methods.extension().call());
            var active = true;
            try {
                active = await extensionContract.methods.active().call();
            } catch(e) {
            }
            setMetadata({
                entry,
                name: entry.name,
                period: period[0],
                executorReward,
                operations,
                extension: await contract.methods.extension().call(),
                contractAddress: contract.options.address,
                executable : active && blockNumber >= nextBlock,
                active
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function execute() {
        setExecuting(true);
        var error;
        try {
            var sendingOptions = {from : props.dfoCore.address};
            var method = contract.methods.execute([entry.id], [earnByInput]);
            var gasLimit = await method.estimateGas(sendingOptions);
            sendingOptions.gasLimit = gasLimit;
            await method.send(sendingOptions);
        } catch(e) {
            error = e;
        }
        setExecuting(false);
        error && alert(error.message);
    }

    return (
        <div className={className}>
            {
                metadata ? <>
                    <h4>{metadata.name}</h4>
                    <div className="InflationContractLinks">
                        <a href={`${props.dfoCore.getContextElement('etherscanURL')}address/${metadata.extension}`} target="_blank">Host</a>
                        <a href={`${props.dfoCore.getContextElement('etherscanURL')}address/${metadata.contractAddress}`} target="_blank">Contract</a>
                    </div>
                        {metadata.executorReward !== 0 && <p>{window.formatMoney(metadata.executorReward)}% Reward to execute {metadata.operations.length} operations</p>}
                        {metadata.executorReward === 0 && <p>{metadata.operations.length} Operations</p>}
                    <div className="InflationContractButton">
                        { !showButton ? <div/> : <Link to={`/inflation/dapp/${metadata.contractAddress}`} className="web2ActionBTN">Open</Link>}
                        {false && showButton && metadata.executable && !executing && <a className="Web3ActionBTN" onClick={execute}>Execute</a>}
                        {false && executing && <Loading/>}
                    </div>
                </> : <div className="col-12 justify-content-center">
                    <div className="spinner-border text-secondary" role="status">
                        <span className="visually-hidden"></span>
                    </div>
                </div>
            }
        </div>
    )
}

FixedInflationComponent.propTypes = {
    className: PropTypes.string,
    entry: PropTypes.any.isRequired,
    hasBorder: PropTypes.bool
};

const mapStateToProps = (state) => {
    const { core } = state;
    return { dfoCore: core.dfoCore };
}

export default connect(mapStateToProps)(FixedInflationComponent);