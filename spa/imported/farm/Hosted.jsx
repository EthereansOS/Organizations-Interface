import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { FarmingComponent } from '../../../../components';

const contracts = [{address: '0xc3BE549499f1e504c793a6c89371Bd7A98229500'}, {address: '0x761E02FEC5A21C6d3F284bd536dB2D2d33d5540B'}];

const Hosted = (props) => {
    const [farmingContracts, setFarmingContracts] = useState([]);

    useEffect(() => {
        getContracts();
    }, [])

    const getContracts = async () => {
        const hostedContracts = props.dfoCore.getHostedLiquidityMiningContracts();
        const mappedContracts = await Promise.all(
            hostedContracts.map(async (contract) => { 
                return props.dfoCore.getContract(props.dfoCore.getContextElement('FarmMainABI'), contract.address);
            })
        );
        setFarmingContracts(mappedContracts);
    }

    return (
        <div className="hosted-component">
            <div className="row mb-4">
                {
                    farmingContracts.map((farmingContract) => {
                        return (
                            <FarmingComponent className="col-12 mb-4" dfoCore={props.dfoCore} contract={farmingContract} hostedBy={true} showSettings={true} hasBorder />
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

export default connect(mapStateToProps)(Hosted);