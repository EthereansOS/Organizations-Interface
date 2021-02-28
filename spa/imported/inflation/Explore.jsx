import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { FixedInflationComponent, FarmingComponent } from '../../../../components';
import Loading from '../../../../components/shared/Loading';

const Explore = (props) => {
    const [executable, setExecutable] = useState(false);
    const [fixedInflationContracts, setFixedInflationContracts] = useState([]);
    const [startingContracts, setStartingContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (props.dfoCore) {
            getEntries();
        }
    }, []);

    function manipulateResult(res, address) {
        var result = {
            0 : {},
            1 : {}
        };

        Object.entries(res[0]).forEach(it => result[0][it[0]] = it[1]);
        Object.entries(res[1]).forEach(it => result[1][it[0]] = it[1]);

        if(props.dfoCore.web3.utils.toChecksumAddress(address) === '0x1CB9F190247C8745DFFc751b1604BC3b3Bcd2175') {
            result[0].name = "EthOS - WIMD Weekly Fixed Inflation";
        }

        return result;
    }

    const getEntries = async () => {
        setLoading(true);
        try {
            await props.dfoCore.loadDeployedFixedInflationContracts();
            const mappedEntries = [];
            await Promise.all(
                props.dfoCore.deployedFixedInflationContracts.map(async (contract) => {
                    const fiContract = await props.dfoCore.getContract(props.dfoCore.getContextElement('FixedInflationABI'), contract.address);
                    const result = manipulateResult(await fiContract.methods.entry().call(), contract.address);
                    var extensionContract = await props.dfoCore.getContract(props.dfoCore.getContextElement("FixedInflationExtensionABI"), await fiContract.methods.extension().call());
                    var active = true;
                    try {
                        active = await extensionContract.methods.active().call();
                    } catch (e) {
                    }
                    active && mappedEntries.push({ contract: fiContract, entry: result[0], operations: result[1] });
                })
            );
            setFixedInflationContracts(mappedEntries);
            setStartingContracts(mappedEntries);
        } catch (error) {
            console.error(error);
            setFixedInflationContracts([]);
        } finally {
            setLoading(false);
        }
    }

    return loading ? <Loading /> : (

        <div className="MainExploration">
            {/*<div className="SortSection">
                    <select className="SelectRegular">
                        <option value="">Sort by..</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                    </select>
                    <div className="form-check my-4">
                        <input className="form-check-input" type="checkbox" value={executable} onChange={(e) => setExecutable(e.target.checked)} id="setExecutable" />
                        <label className="form-check-label" htmlFor="setExecutable">
                            Executable
                        </label>
                    </div>
            </div> */}
            <div className="ListOfThings">
                {
                    fixedInflationContracts.length === 0 && <div className="col-12 text-left">
                        <h6><b>No fixed inflation contracts!</b></h6>
                    </div>
                }
                {
                    fixedInflationContracts.sort((a, b) => {
                        if(a.entry.name < b.entry.name) { return -1; }
                        if(a.entry.name > b.entry.name) { return 1; }
                        return 0;
                       }).map(({ contract, entry, operations }, i) => {
                        return (
                            <FixedInflationComponent key={entry.name + "_" + i} className={"InflationContract"} contract={contract} entry={entry} operations={operations} showButton={true} hasBorder={true} />
                        )
                    })
                }
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    const { core } = state;
    return { dfoCore: core.dfoCore };
}

export default connect(mapStateToProps)(Explore);