/* Description:
 * Once a DFO is created, it automatically sends a percentage of its Voting Tokens to the DFOHub Community Wallet
 * as a percentage of the total supply.
 * This function calculates the correct amount to send to DFOHub.
 * The Token supply earned by DFOhub is driven by DFOhub token holders.
 */
/* Discussion:
 * https://gitcoin.co/grants/154/decentralized-flexible-organization
 */
pragma solidity ^0.6.0;

contract VotingTokenAmountForHub {

    string private _metadataLink;

    constructor(string memory metadataLink) public {
        _metadataLink = metadataLink;
    }

    function getMetadataLink() public view returns(string memory) {
        return _metadataLink;
    }

    function onStart(address, address) public {
    }

    function onStop(address) public {
    }

    function calculate(uint256 total) public pure returns(uint256) {
        return total * 15 / 1000;
    }
}