import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router';
import { FarmingComponent, SetupComponent } from '../../../../components';
import Create from './Create';
import CreateOrEditFarmingSetups from './CreateOrEditFarmingSetups';


const ExploreFarmingContract = (props) => {
    const { address } = useParams();
    const [farmingSetups, setFarmingSetups] = useState([]);
    const [contract, setContract] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [isAdd, setIsAdd] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [extension, setExtension] = useState(null);
    const [setupsLoading, setSetupsLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [newFarmingSetups, setNewFarmingSetups] = useState([]);

    useEffect(() => {
        getContractMetadata()
    }, []);

   
    const getContractMetadata = async () => {
        setLoading(true);
        try {
            const lmContract = await props.dfoCore.getContract(props.dfoCore.getContextElement('FarmMainABI'), address);
            setContract(lmContract);
            const rewardTokenAddress = await lmContract.methods._rewardTokenAddress().call();
            const rewardToken = await props.dfoCore.getContract(props.dfoCore.getContextElement("ERC20ABI"), rewardTokenAddress);
            const rewardTokenSymbol = await rewardToken.methods.symbol().call();
            setToken({ symbol: rewardTokenSymbol, address: rewardTokenAddress });
            const extensionAddress = await lmContract.methods._extension().call();
            const extensionContract = await props.dfoCore.getContract(props.dfoCore.getContextElement('FarmExtensionABI'), extensionAddress);
            setExtension(extensionContract);
            const host = await extensionContract.methods.data().call();
            const isHost = host["host"].toLowerCase() === props.dfoCore.address.toLowerCase();
            setIsHost(isHost);
            const setups = await lmContract.methods.setups().call();
            const res = [];
            for (let i = 0; i < setups.length; i++) {
                const setup = setups[i];
                const setupInfo = await lmContract.methods._setupsInfo(setups[i].infoIndex).call();
                if (setup.rewardPerBlock !== "0") {
                    res.push({...setup, setupInfo, rewardTokenAddress, setupIndex: i })
                }
            }
            const sortedRes = res.sort((a, b) => b.active - a.active);
            console.log(sortedRes);
            setFarmingSetups(sortedRes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const isWeth = (address) => {
        return (address.toLowerCase() === props.dfoCore.getContextElement('wethTokenAddress').toLowerCase()) || (address === props.dfoCore.voidEthereumAddress);
    }
    
    const addFarmingSetup = (setup) => {
        setNewFarmingSetups(newFarmingSetups.concat(setup));
    }

    const editFarmingSetup = (setup, index) => {
        const updatedSetups = newFarmingSetups.map((s, i) => {
            return i !== index ? s : setup;
        })
        setNewFarmingSetups(updatedSetups);
    }

    const removeFarmingSetup = (i) => {
        const updatedSetups = newFarmingSetups.filter((_, index) => index !== i);
        setNewFarmingSetups(updatedSetups);
    }

    const updateSetups = async () => {
        console.log(newFarmingSetups);
        setSetupsLoading(true);
        try {
            const newSetupsInfo = [];
            const ammAggregator = await props.dfoCore.getContract(props.dfoCore.getContextElement('AMMAggregatorABI'), props.dfoCore.getContextElement('ammAggregatorAddress'));
            await Promise.all(newFarmingSetups.map(async (_, i) => {
                const setup = newFarmingSetups[i];
                const isFree = !setup.maxLiquidity;
                const result = await ammAggregator.methods.findByLiquidityPool(isFree ? setup.data.address : setup.secondaryToken.address).call();
                const { amm } = result;
                const ammContract = await props.dfoCore.getContract(props.dfoCore.getContextElement('AMMABI'), amm);
                const res = await ammContract.methods.byLiquidityPool(isFree ? setup.data.address : setup.secondaryToken.address).call();
                const involvingETH = res['2'].filter((address) => isWeth(address)).length > 0;
                const setupInfo = 
                {
                    add: true,
                    disable: false,
                    index: 0,
                    info: {
                        free: isFree,
                        blockDuration: parseInt(setup.period),
                        originalRewardPerBlock: props.dfoCore.fromDecimals(setup.rewardPerBlock),
                        minStakeable: props.dfoCore.fromDecimals(setup.minStakeable),
                        maxStakeable: !isFree ? props.dfoCore.fromDecimals(setup.maxLiquidity) : 0,
                        renewTimes: setup.renewTimes,
                        ammPlugin:  amm,
                        liquidityPoolTokenAddress: isFree ? setup.data.address : setup.secondaryToken.address,
                        mainTokenAddress: result[2][0],
                        ethereumAddress: props.dfoCore.voidEthereumAddress,
                        involvingETH,
                        penaltyFee: isFree ? 0 : props.dfoCore.fromDecimals(parseFloat(parseFloat(setup.penaltyFee) / 100).toString()),
                        setupsCount: 0,
                        lastSetupIndex: 0,
                    }
                };
                newSetupsInfo.push(setupInfo);
            }));
            const gas = await extension.methods.setFarmingSetups(newSetupsInfo).estimateGas({ from: props.dfoCore.address });
            console.log(`gas ${gas}`);
            const result = await extension.methods.setFarmingSetups(newSetupsInfo).send({ from: props.dfoCore.address, gas });
        } catch (error) {
            console.error(error);
        } finally {
            setSetupsLoading(false);
            setIsAdd(false);
            setNewFarmingSetups([]);
            await getContractMetadata();
        }
    }


    if (loading) {
        return (
            <div className="ListOfThings">
                <div className="row">
                    <div className="col-12 justify-content-center">
                        <div className="spinner-border text-secondary" role="status">
                            <span className="visually-hidden"></span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ListOfThings">
            {
                contract ? 
                <div className="row">
                    <FarmingComponent className="FarmContractOpen" dfoCore={props.dfoCore} contract={contract} goBack={true} hostedBy={isHost} />
                </div> : <div/>
            }
            {
                isHost && <>
                    { !isAdd && <button className="btn btn-primary" onClick={() => setIsAdd(true)}>Add new setups</button> }
                </>
            }
            <div className="ListOfThings">
                {
                    (!isAdd && farmingSetups.length > 0) && farmingSetups.map((farmingSetup, setupIndex) => {
                        return (
                            <SetupComponent key={setupIndex} className="FarmSetup" setupIndex={farmingSetup.setupIndex} setupInfo={farmingSetup.setupInfo} lmContract={contract} dfoCore={props.dfoCore} setup={farmingSetup} hostedBy={isHost} hasBorder />
                        )
                    })
                }
                {
                    (isAdd && !isFinished) && <CreateOrEditFarmingSetups 
                        rewardToken={token} 
                        farmingSetups={newFarmingSetups} 
                        onAddFarmingSetup={(setup) => addFarmingSetup(setup)} 
                        onRemoveFarmingSetup={(i) => removeFarmingSetup(i)} 
                        onEditFarmingSetup={(setup, i) => editFarmingSetup(setup, i)} 
                        onCancel={() => { setNewFarmingSetups([]); setIsAdd(false);}} 
                        onFinish={() => setIsFinished(true)} 
                    />
                }
                {
                    (isAdd && isFinished && !setupsLoading) && <button className="btn btn-primary" onClick={() => updateSetups()}>Update setups</button>
                }
                {
                    (isAdd && isFinished && setupsLoading) && <button className="btn btn-primary" disabled={setupsLoading}><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span></button>
                }
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    const { core } = state;
    return { dfoCore: core.dfoCore };
}

export default connect(mapStateToProps)(ExploreFarmingContract);