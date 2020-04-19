/* Description:
 * DFOHub - Setup the Community-Driven Governance.
 * This specific DFOHub functionality is called when choosing to create a DFO with this specific governance model.
 * The Functionality Manager is created using the Open Basic governance rules, which is the standard.
 * The new StateHolder is filled up with the number of Voting Tokens.
 * Every proposer will automatically receive Tokens in case of a Successful Proposal Survey.
 * To let every proposer receive its eventual reward, the proposalEnd well-known functionality is also set up.
 * It will be triggered every time a new Proposal Survey ends and will execute the reward business logic.
 */
/* Discussion:
 * https://gitcoin.co/grants/154/decentralized-flexible-organization
 */
pragma solidity ^0.6.0;

contract DeployCommunityDrivenGovernanceRules {

    address private _sourceLocation = 0x9784B427Ecb5275c9300eA34AdEF57923Ab170af;

    uint256 private _communityDrivenGovernanceLocationId = 4;
    address private _communityDrivenGovernanceFunctionalityAddress = 0x75b827b7C30a633bfB5C8088d1BD184350530f47;

    function onStart(address newSurvey, address oldSurvey) public {
    }

    function onStop(address newSurvey) public {
    }

    function deployCommunityDrivenGovernanceRules(
        address sender, uint256 value,
        uint256 minimumBlockNumber,
        uint256 emergencyBlockNumber,
        uint256 emergencyStaking,
        address stateHolderAddress,
        uint256 quorum,
        uint256 surveySingleReward) public returns (IMVDFunctionalitiesManager mvdFunctionalitiesManager) {
        IStateHolder(stateHolderAddress).setUint256("surveySingleReward", surveySingleReward * (10 ** 18));
        (mvdFunctionalitiesManager = IMVDFunctionalitiesManager(abi.decode(IMVDProxy(msg.sender).submit("deployOpenBasicGovernanceRules", abi.encode(
            address(0),
            0,
            minimumBlockNumber,
            emergencyBlockNumber,
            emergencyStaking,
            stateHolderAddress,
            quorum)), (address))))
            .addFunctionality("proposalEnd", _sourceLocation, _communityDrivenGovernanceLocationId, _communityDrivenGovernanceFunctionalityAddress, true, "proposalEnd(address,bool)", "[]", false, false);
    }
}

interface IStateHolder {
    function getUint256(string calldata varName) external view returns (uint256);
    function setUint256(string calldata varName, uint256 val) external returns(uint256);
}

interface IMVDProxy {
    function getStateHolderAddress() external view returns(address);
    function submit(string calldata codeName, bytes calldata data) external payable returns(bytes memory returnData);
}

interface IMVDFunctionalitiesManager {
    function addFunctionality(string calldata codeName, address sourceLocation, uint256 sourceLocationId, address location, bool submitable, string calldata methodSignature, string calldata returnAbiParametersArray, bool isInternal, bool needsSender) external;
}