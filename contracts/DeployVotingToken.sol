/* Update:
 * Move Amounts to decimals
 */
/* Discussion:
 * https://gitcoin.co/grants/154/decentralized-flexible-organization
 */
/* Description:
 * DFOHub - Voting Token Creation.
 * This specific DFOHub functionality is called during the new DFO creation.
 * It initialized 3 DFO delegates cloning them from the original DFOHub ones: Voting Token, State Holder, Well-Known Functionalities Manager.
 * Complessive Voting Token amount is split between DFOHub (calculating the correct amount through the proper functionality) and the survey proposer.
 * After its initialization, StateHolder is filled with a standard index page and an additional voting token amount (if any).
 */
pragma solidity ^0.6.0;

contract DeployVotingToken {

    function onStart(address, address) public {
    }

    function onStop(address) public {
    }

    function deployVotingToken(
        address sender, uint256,
        string memory name, string memory symbol, uint256 totalSupply, uint256 additionalAmount)
        public returns(address votingToken, address stateHolderAddress, address mvdFunctionalityModelsManagerAddress) {

        IMVDProxy proxy = IMVDProxy(msg.sender);

        IVotingToken token = IVotingToken(votingToken = clone(proxy.getToken()));
        token.init(name, symbol, 18, totalSupply);
        token.transfer(proxy.getMVDWalletAddress(), additionalAmount + toUint256(proxy.read("getVotingTokenAmountForHub", abi.encode(token.totalSupply()))));
        token.transfer(sender, token.balanceOf(address(this)));

        IStateHolder(stateHolderAddress = clone(proxy.getStateHolderAddress())).init();

        mvdFunctionalityModelsManagerAddress = proxy.getMVDFunctionalityModelsManagerAddress();

        proxy.emitEvent("DFOCollateralContractsCloned(address_indexed,address,address,address)", abi.encodePacked(sender), bytes(""), abi.encode(votingToken, stateHolderAddress, mvdFunctionalityModelsManagerAddress));
    }

    function clone(address original) private returns(address copy) {
        assembly {
            mstore(0, or(0x5880730000000000000000000000000000000000000000803b80938091923cF3, mul(original, 0x1000000000000000000)))
            copy := create(0, 0, 32)
            switch extcodesize(copy) case 0 { invalid() }
        }
    }

    function toUint256(bytes memory bs) private pure returns(uint256 x) {
        if(bs.length >= 32) {
            assembly {
                x := mload(add(bs, add(0x20, 0)))
            }
        }
    }
}

interface IVotingToken {
    function init(string calldata name, string calldata symbol, uint256 decimals, uint256 totalSupply) external;
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

interface IStateHolder {
    function init() external;
}

interface IMVDProxy {
    function getMVDWalletAddress() external view returns(address);
    function getToken() external view returns(address);
    function getStateHolderAddress() external view returns(address);
    function getMVDFunctionalityModelsManagerAddress() external view returns(address);
    function getMVDFunctionalitiesManagerAddress() external view returns(address);
    function read(string calldata codeName, bytes calldata data) external view returns(bytes memory returnData);
    function emitEvent(string calldata eventSignature, bytes calldata firstIndex, bytes calldata secondIndex, bytes calldata data) external;
}