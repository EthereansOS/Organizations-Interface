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
     * @dev Contract constructor
     * @param metadataLink Link to the metadata info
     */
    constructor(string memory metadataLink) public {
        _metadataLink = metadataLink;
    }

    /**
     * @dev GETTER for the metadataLink
     * @return metadataLink Link to the metadata
     */
    function getMetadataLink() public view returns (string memory) {
        return _metadataLink;
    }

    function onStart(address, address) public {}

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
