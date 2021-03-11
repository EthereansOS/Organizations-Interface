import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { FarmingComponent } from '../../../../components';

const contracts = [{address: '0xc3BE549499f1e504c793a6c89371Bd7A98229500'}, {address: '0x761E02FEC5A21C6d3F284bd536dB2D2d33d5540B'}];

const Hosted = (props) => {
    const [tokenFilter, setTokenFilter] = useState("");
    const [farmingContracts, setFarmingContracts] = useState([]);
    const [startingContracts, setStartingContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (props.dfoCore) {
            getContracts();
        }
    }, [])

    const getContracts = async () => {
        setLoading(true);
        try {
            const hostedContracts = props.dfoCore.getHostedFarmingContracts();
            const mappedContracts = await Promise.all(
                hostedContracts.map(async (contract) => { 
                    return props.dfoCore.getContract(props.dfoCore.getContextElement('FarmMainABI'), contract.address);
                })
            );
            setFarmingContracts(mappedContracts);
            setStartingContracts(mappedContracts);
        } catch (error) {
            console.error(error);
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
            {
                loading ? 
                <div className="row mt-4">
                    <div className="col-12 justify-content-center">
                        <div className="spinner-border text-secondary" role="status">
                            <span className="visually-hidden"></span>
                        </div>
                    </div>
                </div> : <div className="ListOfThings">
                    {
                        farmingContracts.length === 0 && <div className="col-12 text-left">
                            <h6><b>No farming contract available!</b></h6>
                        </div>
                    }
                    {
                        farmingContracts.length > 0 && farmingContracts.map((farmingContract) => {
                            return (
                                <FarmingComponent className="FarmContract" dfoCore={props.dfoCore} contract={farmingContract} hostedBy={true} hasBorder />
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

export default connect(mapStateToProps)(Hosted);