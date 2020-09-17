// SPDX-License-Identifier: BSD
pragma solidity ^0.6.0;

/**
 * Description:
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
     * @dev Constructor for the contract
     * @param metadataLink Link to the metadata of all the microservice information
     */
    constructor(string memory metadataLink) public {
        _metadataLink = metadataLink;
    }

    /**
     * @dev GETTER for the metadataLink
     * @return metadataLink Link to the metadata
     */
    function getMetadataLink() public view returns (string memory metadataLink) {
        return _metadataLink;
    }

    /**
     * @dev Each Microservice needs to implement its own logic for handling what happens when it's added or removed from a a DFO
     * onStart is one of this mandatory functions.
     * onStart is triggered when a microservice is added.
     * The method body can be left blank (i.e. you don't need any special startup/teardown logic)
     * The only strict requirement is for the method to be there.
     */
    function onStart(address, address) public {}

    /**
     * @dev Each Microservice needs to implement its own logic for handling what happens when it's added or removed from a a DFO
     * onStop is one of this mandatory functions.
     * onStop is triggered when a microservice is removed.
     * The method body can be left blank (i.e. you don't need any special startup/teardown logic)
     * The only strict requirement is for the method to be there.
     */
    function onStop(address) public {}

    /**
     * @dev GETTER for the EmergencySurvey staking
     * @return value Amount of token that must be be staked for the EmergencySurvey to start
     */
    function getEmergencySurveyStaking() public view returns (uint256 value) {
        return _value;
    }
}
