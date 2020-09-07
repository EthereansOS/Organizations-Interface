/* Description:
 * Utilities Get Uint256 Value Functionality
 * This functionality simply returns the uint256 value created with its deployment
 */
/* Discussion:
 * https://gitcoin.co/grants/154/decentralized-flexible-organization
 */
pragma solidity ^0.6.0;

contract GetUint256Value {

    string private _metadataLink;
    uint256 private _value;

    constructor(string memory metadataLink, uint256 value) public {
        _metadataLink = metadataLink;
        _value = value;
    }

    function getMetadataLink() public view returns(string memory) {
        return _metadataLink;
    }

    function onStart(address, address) public {
    }

    function onStop(address) public {
    }

    function getValue() public view returns(uint256) {
        return _value;
    }
}