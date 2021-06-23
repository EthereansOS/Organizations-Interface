import { useState } from 'react';
import { connect } from 'react-redux';
import CreateOrEditFarmingSetup from './CreateOrEditFarmingSetup';
import CreateOrEditFarmingSetupGen2 from './CreateOrEditFarmingSetupGen2';

const CreateOrEditFarmingSetups = (props) => {
    const { rewardToken, farmingSetups, onAddFarmingSetup, onEditFarmingSetup, onRemoveFarmingSetup, onCancel, onFinish } = props;
    const [isAdd, setIsAdd] = useState(false);
    const [editSetup, setEditSetup] = useState(null);
    const [editSetupIndex, setEditSetupIndex] = useState(0);
    const [selectedFarmingType, setSelectedFarmingType] = useState("");
    const [currentStep, setCurrentStep] = useState(0);
    const [gen2SetupType, setGen2SetupType] = useState("");

    if (currentStep > 0 || editSetup) {
        return props.generation === 'gen2' ? (
            <CreateOrEditFarmingSetupGen2
                rewardToken={rewardToken}
                onAddFarmingSetup={(setup) => { onAddFarmingSetup(setup); setCurrentStep(0); setIsAdd(false); setGen2SetupType(""); }}
                editSetup={editSetup}
                editSetupIndex={editSetupIndex}
                gen2SetupType={gen2SetupType}
                onEditFarmingSetup={(setup, index) => { onEditFarmingSetup(setup, index); setEditSetup(null); setEditSetupIndex(0); setCurrentStep(0); setGen2SetupType(""); }}
                selectedFarmingType={editSetup ? !editSetup.maxLiquidity ? "free" : "locked" : selectedFarmingType}
                onCancel={() => { setCurrentStep(0); setEditSetup(null); setEditSetupIndex(0); setGen2SetupType(""); }}
            />) : (
            <CreateOrEditFarmingSetup
                rewardToken={rewardToken}
                onAddFarmingSetup={(setup) => { onAddFarmingSetup(setup); setCurrentStep(0); setIsAdd(false); }}
                editSetup={editSetup}
                editSetupIndex={editSetupIndex}
                onEditFarmingSetup={(setup, index) => { onEditFarmingSetup(setup, index); setEditSetup(null); setEditSetupIndex(0); setCurrentStep(0); }}
                selectedFarmingType={editSetup ? !editSetup.maxLiquidity ? "free" : "locked" : selectedFarmingType}
                onCancel={() => { setCurrentStep(0); setEditSetup(null); setEditSetupIndex(0); }}
            />)
    }

    if (farmingSetups.length === 0 || isAdd) {
        return (
            <div className="CheckboxQuestions">
                <div className="FancyExplanationCreate">
                    <h6><b>Create Setup by</b></h6>
                </div>
                {props.generation === 'gen2' ?  <>
                    <div className="generationSelector">
                        <h6>Diluted Liquidity</h6>
                        <p>Choosing Diluted Liquidity automatically the setup will calculate a price range by 10,000 times from the current price of tokens, to esily add liquidity as older AMMs (less trading fees and less IL risks).</p>
                        <a className="web2ActionBTN" onClick={() => void(setGen2SetupType("diluted"), setSelectedFarmingType('free'), setCurrentStep(1))}>Select</a>
                    </div>
                    <div className="generationSelector">
                        <h6>Concentrated Liquidity</h6>
                        <p>Choosing Concentrated Liquidity you'll set a custom price range for this farming setup. To know more about the potential and risks about it: <a target="_blank" href="https://docs.uniswap.org/concepts/V3-overview/concentrated-liquidity">Uniswap Documentation</a></p>
                        <a className="web2ActionBTN" onClick={() => void(setGen2SetupType("concentrated"), setSelectedFarmingType('free'), setCurrentStep(1))}>Select</a>
                    </div>
                </> : <>
                    <div className="generationSelector">
                        <h6>Free</h6>
                        <p>In free farming, Farmers can stake / un-stake liquidity anytime, but the reward/block is shared btween them.</p>
                        <a className="web2ActionBTN" onClick={() => void(setSelectedFarmingType('free'), setCurrentStep(1))}>Select</a>
                    </div>
                    <div className="generationSelector">
                        <h6>Locked</h6>
                        <p>In Locked setups Farmers lock the liquidity until it ends, but reawards are fixed.</p>
                        <a className="web2ActionBTN" onClick={() =>  void(setSelectedFarmingType('locked'), setCurrentStep(1))}>Select</a>
                    </div>
                </>}
                <div className="Web2ActionsBTNs">
                    <a className="backActionBTN" onClick={onCancel}>Back</a>
                    <a onClick={() => selectedFarmingType && setCurrentStep(1)} disabled={!selectedFarmingType} className="web2ActionBTN">Next</a>
                    <a className="hiddenLink" onClick={onFinish}>Deploy without setups</a>
                </div>
            </div>
        );
    }

    return (
        <div className="CheckboxQuestions">
            {
                farmingSetups.map((setup, i) => {
                    return (
                        <div key={i} className="SetupListITEM FancyExplanationCreate">
                            <div className="SetupListITEMINFO">
                                <p>{setup.free ? "Free setup" : "Locked setup"} {!setup.free ? `${(setup.mainToken.isEth && setup.involvingEth) ? 'ETH' : setup.liquidityPoolToken.symbol}` : ` ${setup.liquidityPoolToken.tokens.map((token) => `${(setup.involvingEth && token.address.toLowerCase() === setup.ethAddress.toLowerCase()) ? 'ETH' : token.symbol}`)}`} ({setup.liquidityPoolToken.name}) - Reward: {setup.rewardPerBlock} {rewardToken.symbol}/block </p>
                            </div>
                            <div className="SetupListITEMACTIONS">
                                <a className="web2ActionBTN web2ActionBTNGigi" onClick={() => onRemoveFarmingSetup(i)}><b>Delete</b></a>
                                <a onClick={() => { setEditSetup(setup); setEditSetupIndex(i); }} className="web2ActionBTN web2ActionBTNGigi"><b>Edit</b></a>
                            </div>
                        </div>
                    )
                })
            }
            <div className="Web2ActionsBTNs">
                <a onClick={() => setIsAdd(true)} className="web2ActionBTN web2ActionBTNGigi">Add new setup</a>
                <div className="Web2ActionsBTNs">
                    <a onClick={() => {
                        farmingSetups.forEach((_, index) => onRemoveFarmingSetup(index));
                        onCancel();
                    }} className="backActionBTN mr-4">Back</a> {props.finishButton || <a onClick={() => onFinish()} className="web2ActionBTN ml-4">Next</a>}
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