pragma solidity ^0.6.0;

/**
 * Description:
 * Utilities Get Uint256 Value Functionality
 * This functionality simply returns the uint256 value created with its deployment
 */
contract GetUint256Value {
    string private _metadataLink;
    uint256 private _value;

    constructor(string memory metadataLink, uint256 value) public {
        _metadataLink = metadataLink;
        _value = value;
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

    function getValue() public view returns (uint256) {
        return _value;
    }
}
