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
/* Update:
 * Correct reclaim
 */
pragma solidity ^0.6.0;

contract DeployDFO {

    uint256 constant private DOMAIN_ID = 26462834956419126467027313759401618380915230190462237878347296505689869422264;
    address constant private ENS_TOKEN_ADDRESS = 0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85;
    bytes32 constant private DOMAIN_NODE = 0x4710df84d2a5a23c87ad560f1151bd82497aab22e9c95162daa7c219d4a1ef78;
    ENS constant private ENS_CONTROLLER = ENS(0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e);
    bytes4 constant private ENS_ADDRESS_INTERFACE_ID = 0x213b9eb8;

    function onStart(address, address) public {
    }

    function onStop(address) public {
    }

    function deployDFO(
        address sender, uint256,
        address votingToken, address mvdFunctionalityProposalManagerAddress, address stateHolderAddress, address mvdFunctionalityModelsManagerAddress, address mvdFunctionalitiesManagerAddress, address walletAddress,
        string memory ens) public returns (address proxy) {
            IMVDProxy senderProxy = IMVDProxy(msg.sender);

            require(compareContracts(votingToken, senderProxy.getToken()) == 1, "Not original Voting Token");
            IVotingToken tkn = IVotingToken(votingToken);

            uint256 proxyBalance = tkn.balanceOf(senderProxy.getMVDWalletAddress());
            uint256 votingTokenAmountForHub = toUint256(senderProxy.read("getVotingTokenAmountForHub", abi.encode(tkn.totalSupply())));

            require(proxyBalance >= votingTokenAmountForHub, "Insufficient tokens amount for DFOHub!");

            IMVDProxy(proxy = clone(msg.sender)).init(votingToken, mvdFunctionalityProposalManagerAddress, stateHolderAddress, mvdFunctionalityModelsManagerAddress, mvdFunctionalitiesManagerAddress, walletAddress);
            senderProxy.transfer(walletAddress, proxyBalance - votingTokenAmountForHub, votingToken);
            _emitEvent(proxy, sender);
            setupENS(senderProxy, proxy, toLowerCase(ens));
    }

    function _emitEvent(address proxy, address sender) private {
        IMVDProxy(msg.sender).emitEvent("DFODeployed(address_indexed,address_indexed,address,address)", abi.encodePacked(proxy), abi.encodePacked(sender), abi.encode(proxy, sender));
    }

    function setupENS(IMVDProxy senderProxy, address proxy, string memory ens) private {

        bytes32 subdomainLabel = keccak256(bytes(ens));
        bytes32 subnode = keccak256(abi.encodePacked(DOMAIN_NODE, subdomainLabel));

        require(!ENS_CONTROLLER.recordExists(subnode), "ENS Name already taken");

        address domainOwner = ENS_CONTROLLER.owner(DOMAIN_NODE);

        if(domainOwner != address(this)) {
            senderProxy.transfer721(address(this), DOMAIN_ID, "", true, ENS_TOKEN_ADDRESS);
            IERC721(ENS_TOKEN_ADDRESS).reclaim(DOMAIN_ID, address(this));
            IERC721(ENS_TOKEN_ADDRESS).transferFrom(address(this), senderProxy.getMVDWalletAddress(), DOMAIN_ID);
        }

        address resolverAddress = ENS_CONTROLLER.resolver(DOMAIN_NODE);

        ENS_CONTROLLER.setSubnodeRecord(DOMAIN_NODE, subdomainLabel, resolverAddress == address(0) ? domainOwner : address(this), resolverAddress, 0);

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

    function onERC721Received(address,address,uint256,bytes memory) public returns (bytes4) {
        return 0x150b7a02;
    }
}

interface IVotingToken {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

interface IMVDProxy {
    function init(address votingTokenAddress, address functionalityProposalManagerAddress, address stateHolderAddress, address functionalityModelsManagerAddress, address functionalitiesManagerAddress, address walletAddress) external;

    function getMVDWalletAddress() external view returns(address);
    function getToken() external view returns(address);
    function getStateHolderAddress() external view returns(address);
    function transfer(address receiver, uint256 value, address token) external;
    function read(string calldata codeName, bytes calldata data) external view returns(bytes memory returnData);
    function submit(string calldata codeName, bytes calldata data) external payable returns(bytes memory returnData);
    function transfer721(address receiver, uint256 tokenId, bytes calldata data, bool safe, address token) external;
    function emitEvent(string calldata eventSignature, bytes calldata firstIndex, bytes calldata secondIndex, bytes calldata data) external;
}

interface ENS {
    function resolver(bytes32 node) external view returns (address);
    function owner(bytes32 node) external view returns (address);
    function setOwner(bytes32 node, address ownerAddress) external;
    function recordExists(bytes32 node) external view returns (bool);
    function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl) external;
}

interface IResolver {
    function supportsInterface(bytes4 interfaceID) external returns(bool);
    function setAddr(string calldata ensDomain, address a) external;
}

interface IERC721 {
    function reclaim(uint256 id, address owner) external;
    function transferFrom(address _from, address _to, uint256 _tokenId) external payable;
}