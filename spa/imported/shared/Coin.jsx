import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import defaultLogoImage from '../../../assets/images/default-logo.png';
import ethereumLogoImage from '../../../assets/images/eth.png';
import Loading from '../Loading';
import { connect } from 'react-redux';

const Coin = (props) => {
    const { forcedImage, address } = props;
    const [image, setImage] = useState(props.dfoCore.getContextElement('trustwalletImgURLTemplate').split('{0}').join(window.web3.utils.toChecksumAddress(props.address)));
    const { icons } = require('../../../data/context.json').default;
    const [tokenSymbol, setTokenSymbol] = useState('');

    useEffect(() => props.dfoCore.getTokenSymbol(address).then(setTokenSymbol), []);

    var wellKnownTokenImage = props.dfoCore.tryRetrieveWellKnownTokenImage(address);

    var imageLink = props.address === window.voidEthereumAddress ? ethereumLogoImage : image;

    var addr = props.dfoCore.web3.utils.toChecksumAddress(props.address);
    var token = props.dfoCore.itemsTokens.filter(it => it.address === addr)[0];
    if(token) {
        imageLink = token.logoURI;
    }

    const onImageError = () => {
        if(wellKnownTokenImage) {
            return setImage(wellKnownTokenImage);
        }
        if (icons[props.address.toLowerCase()]) {
            setImage(icons[props.address.toLowerCase()]);
        } else {
            setImage(defaultLogoImage);
        }
    }

    return (
        image === defaultLogoImage ? tokenSymbol ? <span className="TokenCoolFancy"><span>{window.shortenWord(tokenSymbol, 4, true)}</span></span> :
        <Loading/> :
        <img className={props.className} src={forcedImage || imageLink} onError={onImageError}/>
    ); 
}

Coin.propTypes = {
    className: PropTypes.string,
    address: PropTypes.string,
    height: PropTypes.number
}

const mapStateToProps = (state) => {
    const { core, session } = state;
    const { dfoCore } = core;
    const { inflationSetups } = session;
    return { dfoCore, inflationSetups };
}

export default connect(mapStateToProps)(Coin);