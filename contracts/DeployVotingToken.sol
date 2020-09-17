// SPDX-License-Identifier: BSD
pragma solidity ^0.6.0;

/**
 * Description:
 * @title Voting Token Creation.
 * @dev This specific DFOHub functionality is called during the new DFO creation.
 * It initialized 3 DFO delegates cloning them from the original DFOHub ones: Voting Token, State Holder,
 * Well-Known Functionalities Manager.
 * Voting Token amount is split between DFOHub (calculating the correct amount through
 * the proper functionality) and the survey proposer.
 * After its initialization, StateHolder is filled with a standard index page and an additional voting
 * token amount (if any).
 */
contract DeployVotingToken {
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
     * @dev Deploy the voting token
     * @param sender Address of the Caller
     * @param
     * @param name Name of the voting token
     * @param symbol Ticker Symbol for the voting token
     * @param totalSupply Total Supply of the voting token
     * @param additionalAmount Token supply that will be left locked inside the DFO after creation
     * @return votingToken Address of the newly deployed voting token
     * @return stateHolderAddress Address of the StateHolder
     * @return mvdFunctionalityModelsManagerAddress Address of the FunctionalityModelsManager
     */
    function deployVotingToken(
        address sender,
        uint256,
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 additionalAmount
    )
        public
        returns (
            address votingToken,
            address stateHolderAddress,
            address mvdFunctionalityModelsManagerAddress
        )
    {
        IMVDProxy proxy = IMVDProxy(msg.sender);

        IVotingToken token = IVotingToken(votingToken = clone(proxy.getToken()));
        token.init(name, symbol, 18, totalSupply);
        token.transfer(
            proxy.getMVDWalletAddress(),
            additionalAmount +
                toUint256(proxy.read("getVotingTokenAmountForHub", abi.encode(token.totalSupply())))
        );
        token.transfer(sender, token.balanceOf(address(this)));

        IStateHolder(stateHolderAddress = clone(proxy.getStateHolderAddress())).init();

        mvdFunctionalityModelsManagerAddress = proxy.getMVDFunctionalityModelsManagerAddress();

        proxy.emitEvent(
            "DFOCollateralContractsCloned(address_indexed,address,address,address)",
            abi.encodePacked(sender),
            bytes(""),
            abi.encode(votingToken, stateHolderAddress, mvdFunctionalityModelsManagerAddress)
        );
    }

    // Assembly magic for cloning contract
    function clone(address original) private returns (address copy) {
        assembly {
            mstore(
                0,
                or(
                    0x5880730000000000000000000000000000000000000000803b80938091923cF3,
                    mul(original, 0x1000000000000000000)
                )
            )
            copy := create(0, 0, 32)
            switch extcodesize(copy)
                case 0 {
                    invalid()
                }
        }
    }

    function toUint256(bytes memory bs) private pure returns (uint256 x) {
        if (bs.length >= 32) {
            assembly {
                x := mload(add(bs, add(0x20, 0)))
            }
        }
    }
}

interface IVotingToken {
    function init(
        string calldata name,
        string calldata symbol,
        uint256 decimals,
        uint256 totalSupply
    ) external;

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);
}

interface IStateHolder {
    function init() external;
}

interface IMVDProxy {
    function getMVDWalletAddress() external view returns (address);

    function getToken() external view returns (address);

    function getStateHolderAddress() external view returns (address);

    function getMVDFunctionalityModelsManagerAddress() external view returns (address);

    function getMVDFunctionalitiesManagerAddress() external view returns (address);

    function read(string calldata codeName, bytes calldata data)
        external
        view
        returns (bytes memory returnData);

    function emitEvent(
        string calldata eventSignature,
        bytes calldata firstIndex,
        bytes calldata secondIndex,
        bytes calldata data
    ) external;
}
