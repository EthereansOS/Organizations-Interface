/* Discussion:
 * https://gitcoin.co/grants/154/decentralized-flexible-organization
 */
/* Description:
 * DFOHub - ENS Caller.
 * This specific DFOHub Functionality manages the dfohub.eth ENS Domain.
 * It can be used to setup new ENS domains or other writing operations involving ENS.
 * Its code can be just called by proxy functionalities or by the proxy itself.
 * This is NOT a Stateless Microservice. As it linked to a unique ENS, it can be just hardcabled to a specific proxy, which can be changed, of course.
 */
pragma solidity ^0.6.0;

contract CallENS {

    bytes32 constant private DOMAIN_NODE = 0x4710df84d2a5a23c87ad560f1151bd82497aab22e9c95162daa7c219d4a1ef78;
    ENS constant private ENS_CONTROLLER = ENS(0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e);
    address private constant DFOHUB = 0x78f1Ddd26D21eB532ad603C626a68aF6526b160F;

    address private _proxy;

    function onStart(address, address) public {
        require(_proxy == address(0), "Already initialized!");
        _proxy = msg.sender;
    }

    function onStop(address newSurvey) public {
        if(ENS_CONTROLLER.owner(DOMAIN_NODE) != address(this)) {
            _proxy = address(0);
            return;
        }
        require(msg.sender == _proxy, "Unauthorized action!");
        _proxy = address(0);
        address location = IMVDFunctionalityProposal(newSurvey).getLocation();
        ENS_CONTROLLER.setOwner(DOMAIN_NODE, location == address(0) ? DFOHUB : location);
    }

    function callENS(address sender, uint256, bytes memory payload) public returns (bytes memory) {
        require(msg.sender == _proxy && IMVDProxy(_proxy).isAuthorizedFunctionality(sender), "Unauthorized operation!");
        (bool result, bytes memory response) = address(ENS_CONTROLLER).call(payload);
        require(result, "Something went wrong while calling ENS");
        return response;
    }
}

interface ENS {
    function setOwner(bytes32 node, address owner) external;
    function owner(bytes32 node) external view returns (address);
}

interface IMVDFunctionalityProposal {
    function getLocation() external view returns(address);
}

interface IMVDProxy {
    function isAuthorizedFunctionality(address functionality) external view returns(bool);
}