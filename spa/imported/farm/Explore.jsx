import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { FarmingComponent } from '../../../../components';

const Explore = (props) => {
    const [tokenFilter, setTokenFilter] = useState("");
    const [farmingContracts, setFarmingContracts] = useState([]);
    const [startingContracts, setStartingContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (props.dfoCore) {
            getDeployedContracts();
        }
    }, []);

    const getDeployedContracts = async () => {
        setLoading(true);
        try {
            await props.dfoCore.loadDeployedFarmingContracts();
            const mappedContracts = await Promise.all(
                props.dfoCore.deployedFarmingContracts.map(async (contract) => { 
                    return props.dfoCore.getContract(props.dfoCore.getContextElement('FarmMainABI'), contract.address);
                })
            );
            setFarmingContracts(mappedContracts);
            setStartingContracts(mappedContracts);
        } catch (error) {
            console.log(error);
            setFarmingContracts([]);
            setStartingContracts([]);
        } finally {
            setLoading(false);
        }
    }

    const onChangeTokenFilter = async (value) => {
        if (!value) {
            setTokenFilter("");
            setFarmingContracts(startingContracts);
            return;
        }
        setLoading(true);
        try {
            setTokenFilter(value);
            const filteredFarmingContracts = [];
            await Promise.all(startingContracts.map(async (contract) => {
                const rewardTokenAddress = await contract.methods._rewardTokenAddress().call();
                if (rewardTokenAddress.toLowerCase().includes(value.toLowerCase())) {
                    filteredFarmingContracts.push(contract);
                }
            }));
            setFarmingContracts(filteredFarmingContracts);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="MainExploration">
            <h6><b>Reward token address</b></h6>
            <input type="text" className="TextRegular" placeholder="Reward token address.." value={tokenFilter} onChange={(e) => onChangeTokenFilter(e.target.value)} />
            {/*<div className="SortSection">
                    <select className="SelectRegular">
                        <option value="">Sort by..</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                    </select>
            </div> */}
            {
                loading ? 
                <div className="row mt-4">
                    <div className="col-12 justify-content-center">
                        <div className="spinner-border text-secondary" role="status">
                            <span className="visually-hidden"></span>
                        </div>
                    </div>
                </div> : 
                <div className="ListOfThings">
                    {
                        farmingContracts.length === 0 && <div className="col-12 text-left">
                            <h6><b>No farming contract available!</b></h6>
                        </div>
                    }
                    {
                        farmingContracts.length > 0 && farmingContracts.map((farmingContract) => {
                            return (
                                <FarmingComponent className="FarmContract" dfoCore={props.dfoCore} contract={farmingContract} hasBorder />
                            )
                        })
                    }
                </div>
            }
        </div>
    )
}

const mapStateToProps = (state) => {
    const { core } = state;
    return { dfoCore: core.dfoCore };
}

export default connect(mapStateToProps)(Explore);