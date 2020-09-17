// SPDX-License-Identifier: BSD-2
pragma solidity ^0.6.0;

/**
 * @title Generation Fee Contract
 * @dev Once a DFO is created, it automatically sends a percentage of its Voting Tokens to the DFOHub Community Wallet
 * as a percentage of the total supply.
 * This function calculates the correct amount to send to DFOHub.
 * The Token supply earned by DFOhub is driven by DFOhub token holders.
 */
contract VotingTokenAmountForHub {
    string private _metadataLink;

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
     * @dev Calculate generation fee
     * @param total Total supply of the voting token
     * @return generationFee Computed generation fee
     */
    function calculate(uint256 total) public pure returns (uint256 generationFee) {
        return (total * 15) / 1000;
    }
}
