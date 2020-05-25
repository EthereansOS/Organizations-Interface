/* Description:
 * DFO Protocol - Emergency Survey duration provider.
 * One of the 4 well-known read-only mandatory Functionalities every DFO needs.
 * The logic is for general purpose so that every DFO can use it as a Stateless Microservice.
 * It provides the time duration (expected in blocks) of every emergency Survey Proposal.
 */
/* Discussion:
 * https://gitcoin.co/grants/154/decentralized-flexible-organization
 */
pragma solidity ^0.6.0;

contract GetMinimumBlockNumberForEmergencySurveyFunctionality {

    uint256 private _value;

    constructor(uint256 value) public {
        _value = value;
    }

    function onStart(address, address) public {
    }

    function onStop(address) public {
    }

    function getMinimumBlockNumberForEmergencySurvey() public view returns(uint256) {
        return _value;
    }
}