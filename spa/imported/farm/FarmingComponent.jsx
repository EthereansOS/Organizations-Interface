import PropTypes from 'prop-types';
import Coin from '../coin/Coin';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const FarmingComponent = (props) => {
    const { className, dfoCore, contract, goBack, hasBorder, hostedBy, showSettings } = props;
    const [metadata, setMetadata] = useState(null);

    useEffect(() => {
        getContractMetadata();
    }, []);

    const getContractMetadata = async () => {
        const rewardTokenAddress = await contract.methods._rewardTokenAddress().call();
        const rewardToken = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), rewardTokenAddress);
        const symbol = await rewardToken.methods.symbol().call();
        const extensionAddress = await contract.methods._extension().call();
        const extensionContract = await dfoCore.getContract(dfoCore.getContextElement('FarmExtensionABI'), extensionAddress);
        const { host, byMint } = await extensionContract.methods.data().call();
        
        const setups = await contract.methods.setups().call();
        const freeSetups = [];
        await Promise.all(setups.map(async (setup) => {
            const setupInfo = await contract.methods._setupsInfo(setup.infoIndex).call();
            if (setupInfo.free) {
                freeSetups.push(setup);
            }
        }))
        const lockedSetups = setups.length - freeSetups.length;

        /*
        const { data } = await axios.get(dfoCore.getContextElement("coingeckoCoinPriceURL") + rewardTokenAddress);
        console.log(data);
        const rewardTokenPriceUsd = data[rewardTokenAddress.toLowerCase()].usd;
        */
        const rewardTokenPriceUsd = 1;
        const yearlyBlocks = 36000;

        let valueLocked = 0;
        let rewardPerBlock = 0;
        await Promise.all(setups.map(async (setup) => {
            console.log(setup);
            rewardPerBlock += parseInt(setup.rewardPerBlock);
            console.log(dfoCore.toDecimals(setup.currentStakedLiquidity, 18, 18));
            if (setup.free) {
                valueLocked += parseInt(dfoCore.toDecimals(setup.totalSupply, 18, 18));
            } else {
                console.log(setup.currentStakedLiquidity);
                valueLocked += parseInt(dfoCore.toDecimals(setup.currentStakedLiquidity, 18, 18));
            }
        }))

        const apy = (rewardPerBlock * rewardTokenPriceUsd * yearlyBlocks * 100) / valueLocked;
        
        await Promise.all(setups.map(async (setup) => {
            const { rewardPerBlock } = setup;
            console.log(rewardPerBlock);
        }))

        setMetadata({
            name: `Farm ${symbol}`,
            contractAddress: contract.options.address,
            rewardTokenAddress: rewardToken.options.address,
            apy: `${dfoCore.toFixed(apy)}%`,
            valueLocked: `$ 0`,
            rewardPerBlock: `${(dfoCore.toDecimals(dfoCore.toFixed(rewardPerBlock).toString()))} ${symbol}`,
            byMint,
            freeSetups,
            lockedSetups,
            host: `${host.substring(0, 5)}...${host.substring(host.length - 3, host.length)}`,
            fullhost: `${host}`,
        });

    }

    return (
        <div className={className}>
                        {
                            metadata ? <>
                            <div className="FarmTitle">
                                <figure>
                                    <Coin address={metadata.rewardTokenAddress} />
                                </figure>
                                <aside>
                                    <h6><b>{metadata.name}</b></h6>
                                    <Link to={ goBack ? `/farm/dapp/` : `/farm/dapp/${metadata.contractAddress}`} className={ goBack ? "backActionBTN" : "web2ActionBTN" }>{ goBack ? "Back" : "Enter" }</Link>
                                    { showSettings ?  <a className="web2ActionBTN">Settings</a> : <></>}
                                </aside>
                            </div>
                            <div className="FarmThings">
                                    <p><b>APY</b>: {metadata.apy}</p>
                                    <p><b>Rewards/block</b>: {metadata.rewardPerBlock}</p>
                                    <p><b>Setups</b>: {metadata.freeSetups.length} free | {metadata.lockedSetups} Locked</p>
                                    <p><b>Host</b>: <a target="_blank" href={"https://etherscan.io/address/" + metadata.fullhost}>{metadata.host}</a></p>
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

export default FarmingComponent;