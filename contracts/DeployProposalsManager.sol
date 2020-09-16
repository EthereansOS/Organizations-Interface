// SPDX-License-Identifier: BSD
pragma solidity ^0.6.0;

/*
 * @title Proposal Manager Creation
 * @dev This specific DFOHub functionality is called during the new DFO creation procedure.
 * It just initializes a new Proposal Manager, cloning the logic from the original DFOHub one.
 * @notice This is a solo-Functionality made as a workaround of the cumulative gas consumption problem.
 */
contract DeployProposalsManager {
    string private _metadataLink;

    /**
     * @dev Constructor for the contract
     * @param metadataLink Link to the metadata of the Governance rules
     */
    constructor(string memory metadataLink) public {
        _metadataLink = metadataLink;
    }

    /**
     * @dev GETTER for the metadataLink
     * @return metadataLink Link to the metadata of the Governance rules
     */
    function getMetadataLink() public view returns (string memory) {
        return _metadataLink;
    }

    function onStart(address, address) public {}

    function onStop(address) public {}

    /**
     * @dev Deploy the Proposal Manager cloning the original core one
     */
    function deployProposalsManager(address sender, uint256)
        public
        returns (
            address mvdFunctionalityProposalManagerAddress,
            address mvdWallet,
            address doubleProxy
        )
    {
        IMVDProxy senderProxy = IMVDProxy(msg.sender);
        senderProxy.emitEvent(
            "DFOCollateralContractsCloned(address_indexed,address,address,address)",
            abi.encodePacked(sender),
            bytes(""),
            abi.encode(
                mvdFunctionalityProposalManagerAddress = clone(
                    senderProxy.getMVDFunctionalityProposalManagerAddress()
                ),
                mvdWallet = clone(senderProxy.getMVDWalletAddress()),
                doubleProxy = clone(senderProxy.getDoubleProxyAddress())
            )
        );
    }

    /**
     * @dev Clone and deploy of the core Proposal Manager
     */
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
}

interface IMVDProxy {
    function getMVDFunctionalityProposalManagerAddress()
        external
        view
        returns (address);

    function getMVDWalletAddress() external view returns (address);

    function getDoubleProxyAddress() external view returns (address);

    function emitEvent(
        string calldata eventSignature,
        bytes calldata firstIndex,
        bytes calldata secondIndex,
        bytes calldata data
    ) external;
}
