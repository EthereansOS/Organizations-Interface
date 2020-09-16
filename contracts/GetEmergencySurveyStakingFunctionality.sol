// SPDX-License-Identifier: BSD
pragma solidity ^0.6.0;

/**
 * @title Emergency Survey staking provider.
 * @dev One of the 4 well-known read-only mandatory Functionalities every DFO needs.
 * The logic is for general purpose so that every DFO can use it as a Stateless Microservice.
 * It provides the amount of Voting Tokens every proposer must stake to start a new emergency
 * Survey Proposal.
 */
contract GetEmergencySurveyStakingFunctionality {
    string private _metadataLink;
    uint256 private _value;

    /**
     * @dev Contract constructor
     * @param metadataLink Metadata for the EmergencySurvey
     * @param value Amount of token that must be be staked for the EmergencySurvey to start
     */
    constructor(string memory metadataLink, uint256 value) public {
        _metadataLink = metadataLink;
        _value = value;
    }

    /**
     * @dev GETTER for the metadataLink
     * @return metadataLink Link to the metadata of the EmergencySurvey
     */
    function getMetadataLink() public view returns (string memory) {
        return _metadataLink;
    }

    function onStart(address, address) public {}

    function onStop(address) public {}

    /**
     * @dev GETTER for the EmergencySurvey staking
     * @return value Amount of token that must be be staked for the EmergencySurvey to start
     */
    function getEmergencySurveyStaking() public view returns (uint256 value) {
        return _value;
    }
}
