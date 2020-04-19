/* Description:
 * DFOHub - Setup the Hodlers Driven Governance.
 * This specific DFOHub functionality is called when choosing to create a DFO with this specific governance model.
 * The Functionality Manager is created using the Open Basic governance rules, which is the standard.
 * The new StateHolder is filled up with the minimum number of Voting Tokens every proposer must stake to consider their Proposals valid.
 */
/* Discussion:
 * https://gitcoin.co/grants/154/decentralized-flexible-organization
 */
pragma solidity ^0.6.0;

contract DeployHodlersDrivenGovernanceRules {

    function onStart(address newSurvey, address oldSurvey) public {
    }

    function onStop(address newSurvey) public {
    }

    function deployHodlersDrivenGovernanceRules(
        address sender, uint256 value,
        uint256 minimumBlockNumber,
        uint256 emergencyBlockNumber,
        uint256 emergencyStaking,
        address stateHolderAddress,
        uint256 quorum,
        uint256 surveyMinStake) public returns (address) {
        IStateHolder(stateHolderAddress).setUint256("minimumStaking", surveyMinStake * (10 ** 18));
        return abi.decode(IMVDProxy(msg.sender).submit("deployOpenBasicGovernanceRules", abi.encode(
            address(0),
            0,
            minimumBlockNumber,
            emergencyBlockNumber,
            emergencyStaking,
            stateHolderAddress,
            quorum)), (address));
    }
}

interface IMVDProxy {
    function submit(string calldata codeName, bytes calldata data) external payable returns(bytes memory returnData);
}

interface IStateHolder {
    function setUint256(string calldata varName, uint256 val) external returns(uint256);
}