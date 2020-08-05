/* Description:
 * dfohub - Deploy Governance Rules
 * This Microservice contains all the code useful to create the FunctionalitiesManager Core Contract.
 * The logic clones the original dfohub FunctionalitiesManager contract code and adds to it all the mandatory Functionalities. Also, it can optionally insert other side-functionalities like the Survey Quorum, the Votes Hard Cap, the minimum Survey Staking amount, or the reward amount for each successful Survey.
 */
/* Discussion:
 * https://github.com/b-u-i-d-l/dfo-hub
 */
pragma solidity ^0.7.0;

contract DeployGovernanceRules {

    address private _sourceLocation = 0x9784B427Ecb5275c9300eA34AdEF57923Ab170af;

    uint256 private _getMinimumBlockNumberForSurveySourceLocationId = 2;
    uint256 private _getMinimumBlockNumberForEmergencySurveySourceLocationId = 1;
    uint256 private _getEmergencySurveyStakingFunctionalitySourceLocationId = 0;

    uint256 private _surveyResultValidatorSourceLocationId = 62;

    uint256 private _getIndexSourceLocationId = 50;
    uint256 private _getQuorumSourceLocationId = 51;
    uint256 private _getVotesHardCapSourceLocationId = 146;

    uint256 private _communityDrivenGovernanceLocationId = 72;
    address private _communityDrivenGovernanceFunctionalityAddress = 0x92628ccDa6e51A3AC6746ef1100D419453fA8182;

    uint256 private _getSurveySingleRewardSourceLocationId = 49;

    uint256 private _getMinimumStakingSourceLocationId = 147;

    function onStart(address, address) public {
    }

    function onStop(address) public {
    }

    function deployGovernanceRules(
        address sender, uint256,
        uint256 minimumBlockNumber,
        uint256 emergencyBlockNumber,
        uint256 emergencyStaking,
        uint256 quorum,
        uint256 surveyMaxCap,
        uint256 surveyMinStake,
        uint256 surveySingleReward) public returns (IMVDFunctionalitiesManager mvdFunctionalitiesManager) {

        IMVDProxy proxy = IMVDProxy(msg.sender);

        IMVDFunctionalitiesManager originalFunctionalitiesManager = IMVDFunctionalitiesManager(proxy.getMVDFunctionalitiesManagerAddress());

        (address functionalityAddress,,,,) = originalFunctionalitiesManager.getFunctionalityData("checkSurveyResult");

        mvdFunctionalitiesManager = _deployFunctionalitiesManager(address(originalFunctionalitiesManager), functionalityAddress, minimumBlockNumber, emergencyBlockNumber, emergencyStaking);

        (functionalityAddress,,,,) = originalFunctionalitiesManager.getFunctionalityData("getDefaultIndex");

        _deployCollateralFunctionalities(mvdFunctionalitiesManager, functionalityAddress, quorum, surveyMaxCap, surveyMinStake, surveySingleReward);

        proxy.emitEvent("DFOCollateralContractsCloned(address_indexed,address)", abi.encodePacked(sender), bytes(""), abi.encode(address(mvdFunctionalitiesManager)));
    }

    function _deployFunctionalitiesManager(
        address originalFunctionalitiesManager,
        address checkSurveyResultFunctionalityAddress,
        uint256 minimumBlockNumber,
        uint256 emergencyBlockNumber,
        uint256 emergencyStaking) private returns(IMVDFunctionalitiesManager mvdFunctionalitiesManager) {
        (mvdFunctionalitiesManager = IMVDFunctionalitiesManager(clone(originalFunctionalitiesManager))).init(_sourceLocation,
            _getMinimumBlockNumberForSurveySourceLocationId, address(new GetMinimumBlockNumberForSurveyFunctionality(minimumBlockNumber)),
            _getMinimumBlockNumberForEmergencySurveySourceLocationId, address(new GetMinimumBlockNumberForEmergencySurveyFunctionality(emergencyBlockNumber)),
            _getEmergencySurveyStakingFunctionalitySourceLocationId, address(new GetEmergencySurveyStakingFunctionality(emergencyStaking)),
            _surveyResultValidatorSourceLocationId, checkSurveyResultFunctionalityAddress);
    }

    function _deployCollateralFunctionalities(
        IMVDFunctionalitiesManager mvdFunctionalitiesManager,
        address getDefaultIndexFunctionalityAddress,
        uint256 quorum,
        uint256 surveyMaxCap,
        uint256 surveyMinStake,
        uint256 surveySingleReward
    ) private {

        mvdFunctionalitiesManager.addFunctionality("getIndex", _sourceLocation, _getIndexSourceLocationId, getDefaultIndexFunctionalityAddress, false, "getValue()", '["uint256"]', false, false);

        if(quorum > 0) {
            mvdFunctionalitiesManager.addFunctionality("getQuorum", _sourceLocation, _getQuorumSourceLocationId, address(new GetUint256Value(quorum)), false, "getValue()", '["uint256"]', false, false);
        }

        if(surveyMaxCap > 0) {
            mvdFunctionalitiesManager.addFunctionality("getVotesHardCap", _sourceLocation, _getVotesHardCapSourceLocationId, address(new GetVotesHardCapFunctionality(surveyMaxCap)), false, "getVotesHardCap()", '["uint256"]', false, false);
        }

        if(surveyMinStake > 0) {
            mvdFunctionalitiesManager.addFunctionality("getMinimumStaking", _sourceLocation, _getMinimumStakingSourceLocationId, address(new GetUint256Value(surveyMinStake)), false, "getValue()", '["uint256"]', false, false);
        }

        if(surveySingleReward > 0) {
            mvdFunctionalitiesManager.addFunctionality("proposalEnd", _sourceLocation, _communityDrivenGovernanceLocationId, _communityDrivenGovernanceFunctionalityAddress, true, "proposalEnd(address,bool)", "[]", false, false);
            mvdFunctionalitiesManager.addFunctionality("getSurveySingleReward", _sourceLocation, _getSurveySingleRewardSourceLocationId, address(new GetUint256Value(surveySingleReward)), false, "getValue()", '["uint256"]', false, false);
        }
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
    function getMVDFunctionalitiesManagerAddress() external view returns(address);
    function emitEvent(string calldata eventSignature, bytes calldata firstIndex, bytes calldata secondIndex, bytes calldata data) external;
    function transfer(address receiver, uint256 value, address token) external;
    function read(string calldata codeName, bytes calldata data) external view returns(bytes memory returnData);
}

interface IMVDFunctionalitiesManager {
    function init(address sourceLocation,
        uint256 getMinimumBlockNumberSourceLocationId, address getMinimumBlockNumberFunctionalityAddress,
        uint256 getEmergencyMinimumBlockNumberSourceLocationId, address getEmergencyMinimumBlockNumberFunctionalityAddress,
        uint256 getEmergencySurveyStakingSourceLocationId, address getEmergencySurveyStakingFunctionalityAddress,
        uint256 checkVoteResultSourceLocationId, address checkVoteResultFunctionalityAddress) external;
    function addFunctionality(string calldata codeName, address sourceLocation, uint256 sourceLocationId, address location, bool submitable, string calldata methodSignature, string calldata returnAbiParametersArray, bool isInternal, bool needsSender) external;
    function getFunctionalityData(string calldata codeName) external view returns(address, uint256, string memory, address, uint256);
    function hasFunctionality(string calldata codeName) external view returns(bool);
}

interface IMVDFunctionalityProposal {
    function getProposer() external view returns(address);
}

contract GetMinimumBlockNumberForSurveyFunctionality {

    uint256 private _value;

    constructor(uint256 value) public {
        _value = value;
    }

    function onStart(address newSurvey, address oldSurvey) public {
    }

    function onStop(address newSurvey) public {
    }

    function getMinimumBlockNumberForSurvey() public view returns(uint256) {
        return _value;
    }
}

contract GetMinimumBlockNumberForEmergencySurveyFunctionality {

    uint256 private _value;

    constructor(uint256 value) public {
        _value = value;
    }

    function onStart(address newSurvey, address oldSurvey) public {
    }

    function onStop(address newSurvey) public {
    }

    function getMinimumBlockNumberForEmergencySurvey() public view returns(uint256) {
        return _value;
    }
}

contract GetEmergencySurveyStakingFunctionality {

    uint256 private _value;

    constructor(uint256 value) public {
        _value = value;
    }

    function onStart(address newSurvey, address oldSurvey) public {
    }

    function onStop(address newSurvey) public {
    }

    function getEmergencySurveyStaking() public view returns(uint256) {
        return _value;
    }
}

contract GetVotesHardCapFunctionality {

    uint256 private _value;

    constructor(uint256 value) public {
        _value = value;
    }

    function onStart(address newSurvey, address oldSurvey) public {
    }

    function onStop(address newSurvey) public {
    }

    function getVotesHardCap() public view returns(uint256) {
        return _value;
    }
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