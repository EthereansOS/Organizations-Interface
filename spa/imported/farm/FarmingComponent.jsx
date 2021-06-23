import Coin from '../coin/Coin';
import { Link } from 'react-router-dom';

const FarmingComponent = (props) => {
    const { className, goBack, metadata, dfoCore, withoutBack } = props;
    const symbol = metadata.symbol;
    const name = metadata.name;
    const dailyReward = metadata.rewardPerBlock * 6400;

    return (
        <div className={className}>
            {
                metadata ? <>
                <div className="FarmTitle">
                    <figure>
                        { metadata.rewardTokenAddress !== dfoCore.voidEthereumAddress ? <a target="_blank" href={`${props.dfoCore.getContextElement("etherscanURL")}token/${metadata.rewardTokenAddress}`} ><Coin address={metadata.rewardTokenAddress} /></a> : <Coin address={metadata.rewardTokenAddress} />}
                    </figure>
                    <aside>
                        <h6>{window.dfoCore.isItemSync(metadata.rewardTokenAddress) && <b>Farm {metadata.name} {goBack && <span className="ITEMsymbolF"> ({metadata.symbol})</span>}</b>} {!window.dfoCore.isItemSync(metadata.rewardTokenAddress) && <b>Farm {metadata.symbol}</b>}</h6>
                        { !withoutBack && <Link to={ goBack ? `/farm/dapp/` : `/farm/dapp/${metadata.contractAddress}`} className={ goBack ? "backActionBTN" : "web2ActionBTN" }>{ goBack ? "Back" : "Open" }</Link>}
                    </aside>
                </div>
                <div className="FarmThings">
                        {(metadata.freeSetups.length + metadata.lockedSetups.length === 0 && !metadata.canActivateSetup) ? <>
                            <b className="InactiveSignalP">Inactive</b> 
                            {metadata.generation === 'gen2' && <b className="VersionFarm">&#129412; V3</b>}
                            {metadata.generation === 'gen1' && <b className="VersionFarmOld">Gen 1</b>}
                            </>: <>
                            <p><b>Daily Rate</b>: {window.formatMoney(dailyReward, 6)} {window.dfoCore.isItemSync(metadata.rewardTokenAddress) && <>{metadata.name} <span className="ITEMsymbolF">({symbol})</span></>} {!window.dfoCore.isItemSync(metadata.rewardTokenAddress) && <>{symbol} <span className="ITEMsymbolF">({metadata.name})</span></>}</p>
                            <p>
                                <b className="InactiveSignalA">Active ({metadata.freeSetups.length + metadata.lockedSetups.length})</b>
                                {metadata.generation === 'gen2' && <b className="VersionFarm">&#129412; V3</b>}
                                {metadata.generation === 'gen1' && <b className="VersionFarmOld">Gen 1</b>}
                            </p>
                        </> }
                        <div className="StatsLink">
                            {window.dfoCore.isItemSync(metadata.rewardTokenAddress) && <a className="specialITEMlink" target="_blank" href={props.dfoCore.getContextElement("itemURLTemplate").format(metadata.rewardTokenAddress)}> ITEM</a>}
                            {!window.dfoCore.isItemSync(metadata.rewardTokenAddress) && <a className="specialERC20link" target="_blank" href={`${props.dfoCore.getContextElement("etherscanURL")}token/${metadata.rewardTokenAddress}`}> ERC20</a>}
                            <a target="_blank" href={`${props.dfoCore.getContextElement("etherscanURL")}address/${metadata.contractAddress}`}>Contract</a>
                            <a target="_blank" href={`${props.dfoCore.getContextElement("etherscanURL")}address/${metadata.fullhost}`}>Host</a>
                            <a target="_blank" href={`${props.dfoCore.getContextElement("etherscanURL")}address/${metadata.fullExtension}`}>Extension</a>
                            {goBack && !window.dfoCore.isItemSync(metadata.rewardTokenAddress) && <a className="specialMETAlink" onClick={() => props.dfoCore.addTokenToMetamask(metadata.rewardTokenAddress, metadata.symbol, "18", props.dfoCore.getContextElement('trustwalletImgURLTemplate').split('{0}').join(metadata.rewardTokenAddress))}>Add to Metamask</a>}
                            {goBack && window.dfoCore.isItemSync(metadata.rewardTokenAddress) && <a className="specialMETAlink" onClick={() => props.dfoCore.addTokenToMetamask(metadata.rewardTokenAddress, metadata.symbol, "18")}>Add to Metamask</a>} {/*@todo ITEM logo link + reward token decimals */}
                        </div>
                </div>
                {goBack && <>
                    <div className="FarmThings">
                        
                    </div>
                </>}
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