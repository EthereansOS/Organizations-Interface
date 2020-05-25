/* Description:
 * Utilities Get Uint256 Value Functionality
 * This functionality simply returns the uint256 value created with its deployment
 */
/* Discussion:
 * https://gitcoin.co/grants/154/decentralized-flexible-organization
 */
pragma solidity ^0.6.0;

contract GetUint256Value {

    uint256 private _value;

    constructor(uint256 value) public {
        _value = value;
    }

    function onStart(address, address) public {
    }

    function onStop(address) public {
    }

    function getValue() public view returns(uint256) {
        return _value;
    }
}