/* Description:
 * DFOHub - Proposal Manager Creation.
 * This specific DFOHub functionality is called during the new DFO creation procedure.
 * It just initializes a new Proposal Manager, cloning the logic from the original DFOHub one.
 * This is a solo-Functionality made as a workaround of the cumulative gas consumption problem.
 */
/* Discussion:
 * https://gitcoin.co/grants/154/decentralized-flexible-organization
 */
pragma solidity ^0.6.0;

contract DeployProposalsManager {

    function onStart(address, address) public {
    }

    function onStop(address) public {
    }

    function deployProposalsManager(address sender, uint256) public returns (address mvdFunctionalityProposalManagerAddress, address mvdWallet) {
        IMVDProxy senderProxy = IMVDProxy(msg.sender);
        senderProxy
            .emitEvent("DFOCollateralContractsCloned(address_indexed,address,address)", abi.encodePacked(sender), bytes(""),
            abi.encode(
                mvdFunctionalityProposalManagerAddress = clone(senderProxy.getMVDFunctionalityProposalManagerAddress()),
                mvdWallet = clone(senderProxy.getMVDWalletAddress())
            )
        );
    }

    function clone(address original) private returns(address copy) {
        assembly {
            mstore(0, or(0x5880730000000000000000000000000000000000000000803b80938091923cF3, mul(original, 0x1000000000000000000)))
            copy := create(0, 0, 32)
            switch extcodesize(copy) case 0 { invalid() }
        }
    }
}

interface IMVDProxy {
    function getMVDFunctionalityProposalManagerAddress() external view returns(address);
    function getMVDWalletAddress() external view returns(address);
    function emitEvent(string calldata eventSignature, bytes calldata firstIndex, bytes calldata secondIndex, bytes calldata data) external;
}