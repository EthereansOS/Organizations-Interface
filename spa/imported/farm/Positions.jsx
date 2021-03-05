import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { SetupComponent } from '../../../../components';

const Positions = (props) => {
    const [farmingSetups, setFarmingSetups] = useState([]);

    useEffect(() => {
        getPositions();
    }, []);

    const getPositions = async () => {
        await props.dfoCore.loadPositions();
        setFarmingSetups(props.dfoCore.positions);
    }

    return (
        <div className="positions-component">
            <div className="row mb-4">
                {
                    farmingSetups.map((farmingSetup) => {
                        return (
                            <SetupComponent className="col-12 mb-4" setupIndex={farmingSetup.setupIndex} lmContract={farmingSetup.contract} dfoCore={props.dfoCore} setup={farmingSetup} manage={true} hasBorder />
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

export default connect(mapStateToProps)(Positions);