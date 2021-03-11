import { useState } from 'react';
import { connect } from 'react-redux';
import CreateOrEditFarmingSetup from './CreateOrEditFarmingSetup';

const CreateOrEditFarmingSetups = (props) => {
    const { rewardToken, farmingSetups, onAddFarmingSetup, onEditFarmingSetup, onRemoveFarmingSetup, onCancel, onFinish } = props;
    const [isAdd, setIsAdd] = useState(false);
    const [editSetup, setEditSetup] = useState(null);
    const [editSetupIndex, setEditSetupIndex] = useState(0);
    const [selectedFarmingType, setSelectedFarmingType] = useState("");
    const [currentStep, setCurrentStep] = useState(0);

    if (currentStep > 0 || editSetup) {
        return (
            <CreateOrEditFarmingSetup 
                rewardToken={rewardToken} 
                onAddFarmingSetup={(setup) => { onAddFarmingSetup(setup); setCurrentStep(0); setIsAdd(false); }} 
                editSetup={editSetup} 
                editSetupIndex={editSetupIndex}
                onEditFarmingSetup={(setup, index) => { onEditFarmingSetup(setup, index); setEditSetup(null); setEditSetupIndex(0); setCurrentStep(0); }}
                selectedFarmingType={editSetup ? !editSetup.maxLiquidity ? "free" : "locked" : selectedFarmingType} 
                onCancel={() => { setCurrentStep(0); setEditSetup(null); setEditSetupIndex(0); }} 
            />
        )
    }

    if (farmingSetups.length === 0 || isAdd) {
        return (
            <div className="col-12">
                <div className="row justify-content-center mb-4">
                    <h6><b>Select farming type</b></h6>
                </div>
                <div className="row justify-content-center mb-4">
                    <button onClick={() => setSelectedFarmingType(selectedFarmingType !== 'free' ? 'free' : null)} className={`btn ${selectedFarmingType === 'free' ? "btn-secondary" : "btn-outline-secondary"} mr-4`}>Free Farming</button>
                    <button onClick={() => setSelectedFarmingType(selectedFarmingType !== 'locked' ? 'locked' : null)} className={`btn ${selectedFarmingType === 'locked' ? "btn-secondary" : "btn-outline-secondary"}`}>Locked</button>
                </div>
                <div className="row mb-4">
                    <p style={{fontSize: 14}}>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quaerat animi ipsam nemo at nobis odit temporibus autem possimus quae vel, ratione numquam modi rem accusamus, veniam neque voluptates necessitatibus enim!</p>
                </div>
                <div className="row justify-content-center">
                    <button onClick={() => {
                        farmingSetups.forEach((_, index) => onRemoveFarmingSetup(index));
                        onCancel();
                    }} className="btn btn-light mr-4">Back</button>
                    <button onClick={() => setCurrentStep(1)} disabled={!selectedFarmingType} className="btn btn-primary">Next</button>
                </div>
            </div>
        );
    }

    return (
        <div className="col-12 p-0">
            {
                farmingSetups.map((setup, i) => {
                    return (
                        <div key={i} className="row align-items-center text-left mb-md-2 mb-4">
                            <div className="col-md-9 col-12">
                                <b style={{fontSize: 14}}>{ !setup.maxLiquidity ? "Free setup" : "Locked setup" } { setup.data.name }{ setup.maxLiquidity ? `${setup.data.symbol}` : ` | ${setup.data.tokens.map((token) => `${(setup.involvingEth && token.address.toLowerCase() === setup.ethAddress.toLowerCase()) ? 'ETH' : token.symbol}` )}` } - Reward: {setup.rewardPerBlock} {rewardToken.symbol}/block</b>
                            </div>
                            <div className="col-md-3 col-12 flex">
                                <button className="btn btn-sm btn-outline-danger mr-1" onClick={() => onRemoveFarmingSetup(i)}><b>X</b></button> <button onClick={() => { setEditSetup(setup); setEditSetupIndex(i); }} className="btn btn-sm btn-danger ml-1"><b>EDIT</b></button>
                            </div>
                        </div>
                    )
                })
            }
            <div className="row justify-content-between mt-4">
                <div className="col-12 flex justify-content-start mb-4">
                    <button onClick={() => setIsAdd(true)} className="btn btn-light">Add setup</button>
                </div>
                <div className="col-12 mt-4">
                    <button onClick={() => {
                        farmingSetups.forEach((_, index) => onRemoveFarmingSetup(index));
                        onCancel();
                    }} className="btn btn-light mr-4">Back</button> <button onClick={() => onFinish()} className="btn btn-secondary ml-4">Next</button>
                </div>
            </div>
        </div>
    )
}


const mapStateToProps = (state) => {
    const { core } = state;
    return { dfoCore: core.dfoCore };
}

export default connect(mapStateToProps)(CreateOrEditFarmingSetups);