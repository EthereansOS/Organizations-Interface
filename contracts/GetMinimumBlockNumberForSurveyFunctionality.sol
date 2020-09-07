/* Description:
 * DFO Protocol - Normal Survey duration provider.
 * One of the 4 well-known read-only mandatory Functionalities every DFO needs.
 * The logic is for general purpose so that every DFO can use it as a Stateless Microservice.
 * It provides the time duration (expected in blocks) of every normal Survey Proposal.
 */
/* Discussion:
 * https://gitcoin.co/grants/154/decentralized-flexible-organization
 */
pragma solidity ^0.6.0;

contract GetMinimumBlockNumberForSurveyFunctionality {

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

    function getMinimumBlockNumberForSurvey() public view returns(uint256) {
        return _value;
    }
}