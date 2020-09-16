// SPDX-License-Identifier: BSD-2
pragma solidity ^0.6.0;

/**
 * @title Normal Survey duration provider.
 * @dev One of the 4 well-known read-only mandatory Functionalities every DFO needs.
 * The logic is for general purpose so that every DFO can use it as a Stateless Microservice.
 * It provides the time duration (expected in blocks) of every normal Survey Proposal.
 */
contract GetMinimumBlockNumberForSurveyFunctionality {
    string private _metadataLink;
    uint256 private _value;

    /**
     * @dev Contract constructor
     * @param metadataLink Metadata for the SurveyFunctionality
     * @param value Amount of blocks for the duration of the standard proposal
     */
    constructor(string memory metadataLink, uint256 value) public {
        _metadataLink = metadataLink;
        _value = value;
    }

    /**
     * @dev GETTER for the metadataLink
     * @return metadataLink Link to the metadata of the SurveyFunctionality
     */
    function getMetadataLink() public view returns (string memory) {
        return _metadataLink;
    }

    function onStart(address, address) public {}

    function onStop(address) public {}

    /**
     * @dev GETTER for the block duration of the proposal
     * @return value Amount of block indicating the duration of proposals
     */
    function getMinimumBlockNumberForSurvey() public view returns (uint256 value) {
        return _value;
    }
}
