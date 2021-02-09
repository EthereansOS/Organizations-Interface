import PropTypes from 'prop-types';
import { useState } from 'react';

const TokenInput = (props) => {
    const { onClick, placeholder, text, width, label } = props;
    const [tokenAddress, setTokenAddress] = useState(props.tokenAddress || "");

    return (
        <div className="LoadInput">
            <input type="text" className="TextRegular" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder={placeholder} aria-label={placeholder}/>
            <a className="web2ActionBTN" onClick={() => onClick(tokenAddress) }>{text}</a>
        </div>
    )}

TokenInput.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    text: PropTypes.string.isRequired,
    width: PropTypes.number,
}

export default TokenInput;