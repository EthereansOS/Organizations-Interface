/* Update:
 * New StateHolder
 */
/* Discussion:
 * https://gitcoin.co/grants/154/decentralized-flexible-organization
 */
/* Description:
 * DFOHub - Deploy finalization.
 * This specific DFOHub Functionality is called as the last step of the creation of a DFO.
 * It clones the original DFOHub Proxy contract and sets up all the other delegate contracts (Voting Token, State Holder, Governance Rules, Functionalities, and Proposals Manager).
 * The Functionality checks if DFOHub received the correct amount of tokens needed for the creation.
 * After the init operation on the already-created Proxy, DFOHub transfers the expected amount of tokens
 * (e.g. if Governance type is Community Driven, the new DFO expected to receive the chosen amount of voting tokens set to pay
 * rewards for successful surveys). As a final step, this Functionality also sets up the chosen ENS for this DFO.
 */
pragma solidity ^0.6.0;

contract DeployDFO {

    bytes32 constant private DOMAIN_NODE = 0x4710df84d2a5a23c87ad560f1151bd82497aab22e9c95162daa7c219d4a1ef78;
    ENS constant private ENS_CONTROLLER = ENS(0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e);
    bytes4 constant private ENS_ADDRESS_INTERFACE_ID = 0x213b9eb8;

    function onStart(address newSurvey, address oldSurvey) public {
    }

    function onStop(address newSurvey) public {
    }

    function deployDFO(
        address sender, uint256 value,
        address votingToken, address stateHolderAddress, address mvdFunctionalityModelsManagerAddress, address mvdFunctionalityProposalManagerAddress, address mvdFunctionalitiesManagerAddress,
        string memory ens) public returns (address proxy) {
            IMVDProxy senderProxy = IMVDProxy(msg.sender);

            require(compareContracts(votingToken, senderProxy.getToken()) == 1, "Not original Voting Token");
            IVotingToken tkn = IVotingToken(votingToken);

            (,bytes memory amountBytes) = IStateHolder(stateHolderAddress).clear("additionalAmount");

            uint256 additionalAmount = toUint256(amountBytes);

            require(tkn.balanceOf(msg.sender) >= toUint256(senderProxy.read("getVotingTokenAmountForHub", abi.encode(tkn.totalSupply()))) + additionalAmount, "Insufficient tokens amount for DFOHub!");

            IMVDProxy(proxy = clone(msg.sender)).init(votingToken, stateHolderAddress, mvdFunctionalityModelsManagerAddress, mvdFunctionalityProposalManagerAddress, mvdFunctionalitiesManagerAddress);
            senderProxy.transfer(proxy, additionalAmount, votingToken);
            senderProxy.emitEvent("DFODeployed(address_indexed,address)", abi.encodePacked(sender), bytes(""), abi.encode(proxy));
            setupENS(senderProxy, proxy, toLowerCase(ens));
    }

    function setupENS(IMVDProxy senderProxy, address proxy, string memory ens) private {

        bytes32 subdomainLabel = keccak256(bytes(ens));
        bytes32 subnode = keccak256(abi.encodePacked(DOMAIN_NODE, subdomainLabel));

        require(!ENS_CONTROLLER.recordExists(subnode), "ENS Name already taken");

        address domainOwner = ENS_CONTROLLER.owner(DOMAIN_NODE);

        address resolverAddress = ENS_CONTROLLER.resolver(DOMAIN_NODE);

        senderProxy.submit("callENS", abi.encode(address(0), 0, abi.encodeWithSignature("setSubnodeRecord(bytes32,bytes32,address,address,uint64)", DOMAIN_NODE, subdomainLabel, resolverAddress == address(0) ? domainOwner : address(this), resolverAddress, 0)));

        if(resolverAddress == address(0)) {
            return;
        }

        IResolver resolver = IResolver(resolverAddress);

        if(resolver.supportsInterface(ENS_ADDRESS_INTERFACE_ID)) {
            resolver.setAddr(ens, proxy);
        }

        ENS_CONTROLLER.setOwner(subnode, domainOwner);
    }

    function clone(address original) private returns(address copy) {
        assembly {
            mstore(0, or(0x5880730000000000000000000000000000000000000000803b80938091923cF3, mul(original, 0x1000000000000000000)))
            copy := create(0, 0, 32)
            switch extcodesize(copy) case 0 { invalid() }
        }
    }

    function compareContracts(address a, address b) private view returns(uint8 result) {
        assembly {
            result := eq(extcodehash(a), extcodehash(b))
        }
    }

    function toUint256(bytes memory bs) private pure returns(uint256 x) {
        if(bs.length >= 32) {
            assembly {
                x := mload(add(bs, add(0x20, 0)))
            }
        }
    }

    function toString(address _addr) private pure returns(string memory) {
        bytes32 value = bytes32(uint256(_addr));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(uint8(value[i + 12] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }


    function toLowerCase(string memory str) private pure returns(string memory) {
        bytes memory bStr = bytes(str);
        for (uint i = 0; i < bStr.length; i++) {
            bStr[i] = bStr[i] >= 0x41 && bStr[i] <= 0x5A ? bytes1(uint8(bStr[i]) + 0x20) : bStr[i];
        }
        return string(bStr);
    }
}

interface IVotingToken {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

interface IStateHolder {
    function clear(string calldata varName) external returns(string memory oldDataType, bytes memory oldVal);
    function setAddress(string calldata varName, address val) external returns (address);
    function setString(string calldata varName, string calldata val) external returns(string memory);
}

interface IMVDProxy {
    function init(address votingTokenAddress, address stateHolderAddress, address functionalityModelsManagerAddress, address functionalityProposalManagerAddress, address functionalitiesManagerAddress) external;

    function getToken() external view returns(address);
    function getStateHolderAddress() external view returns(address);
    function transfer(address receiver, uint256 value, address token) external;
    function read(string calldata codeName, bytes calldata data) external view returns(bytes memory returnData);
    function submit(string calldata codeName, bytes calldata data) external payable returns(bytes memory returnData);
    function emitEvent(string calldata eventSignature, bytes calldata firstIndex, bytes calldata secondIndex, bytes calldata data) external;
}

interface ENS {
    function resolver(bytes32 node) external view returns (address);
    function owner(bytes32 node) external view returns (address);
    function setOwner(bytes32 node, address ownerAddress) external;
    function recordExists(bytes32 node) external view returns (bool);
}

interface IResolver {
    function supportsInterface(bytes4 interfaceID) external returns(bool);
    function setAddr(string calldata ensDomain, address a) external;
}