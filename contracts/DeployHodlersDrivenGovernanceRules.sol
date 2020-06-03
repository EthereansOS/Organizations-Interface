/* Update:
 * Use of decimals
 */
/* Discussion:
 * https://gitcoin.co/grants/154/decentralized-flexible-organization
 */
/* Description:
 * DFOHub - Setup the Hodlers Driven Governance.
 * This specific DFOHub functionality is called when choosing to create a DFO with this specific governance model.
 * The Functionality Manager is created using the Open Basic governance rules, which is the standard.
 * The new StateHolder is filled up with the minimum number of Voting Tokens every proposer must stake to consider their Proposals valid.
 */
pragma solidity ^0.6.0;

contract DeployHodlersDrivenGovernanceRules {

    address private _sourceLocation = 0x9784B427Ecb5275c9300eA34AdEF57923Ab170af;

    uint256 private _getSurveyMinimumStakingSourceLocationId = 49;

    function onStart(address, address) public {
    }

    function onStop(address) public {
    }

    function deployHodlersDrivenGovernanceRules(
        address, uint256,
        uint256 minimumBlockNumber,
        uint256 emergencyBlockNumber,
        uint256 emergencyStaking,
        uint256 quorum,
        uint256 surveyMinStake) public returns (IMVDFunctionalitiesManager mvdFunctionalitiesManager) {
        (mvdFunctionalitiesManager = IMVDFunctionalitiesManager(abi.decode(IMVDProxy(msg.sender).submit("deployOpenBasicGovernanceRules", abi.encode(
            address(0),
            0,
            minimumBlockNumber,
            emergencyBlockNumber,
            emergencyStaking,
            quorum)), (address))))
            .addFunctionality("getSurveyMinimumStaking", _sourceLocation, _getSurveyMinimumStakingSourceLocationId, address(new GetUint256Value(surveyMinStake)), false, "getValue()", '["uint256"]', false, false);
    }
}

interface IMVDProxy {
    function submit(string calldata codeName, bytes calldata data) external payable returns(bytes memory returnData);
}

interface IMVDFunctionalitiesManager {
    function addFunctionality(string calldata codeName, address sourceLocation, uint256 sourceLocationId, address location, bool submitable, string calldata methodSignature, string calldata returnAbiParametersArray, bool isInternal, bool needsSender) external;
}

contract GetUint256Value {

    uint256 private _value;

    constructor(uint256 value) public {
        _value = value;
    }

    function onStart(address newSurvey, address oldSurvey) public {
    }

    function onStop(address newSurvey) public {
    }

    function getValue() public view returns(uint256) {
        return _value;
    }
}