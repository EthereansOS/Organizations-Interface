// SPDX-License-Identifier: BSD-2
pragma solidity ^0.7.0;

/**
 * Description:
 * @title Deploy Governance Rules
 * @dev This Microservice contains all the code useful to create the FunctionalitiesManager Core Contract.
 * The logic clones the original dfohub FunctionalitiesManager contract code and adds to it all the
 * mandatory Functionalities. Also, it can optionally insert other side-functionalities like the Survey Quorum,
 * the Votes Hard Cap, the minimum Survey Staking amount, or the reward amount for each successful Survey.
 */
/*
 * Discussion:
 * https://github.com/b-u-i-d-l/dfo-hub
 */
contract DeployGovernanceRules {
    // ROBE address where the onchain code is saved
    address private _sourceLocation = 0x9784B427Ecb5275c9300eA34AdEF57923Ab170af;

    // ROBE id for the various microservices
    uint256 private _getMinimumBlockNumberForSurveySourceLocationId = 2;
    uint256 private _getMinimumBlockNumberForEmergencySurveySourceLocationId = 1;
    uint256 private _getEmergencySurveyStakingFunctionalitySourceLocationId = 0;

    uint256 private _surveyResultValidatorSourceLocationId = 62;

    uint256 private _getIndexSourceLocationId = 50;
    uint256 private _getQuorumSourceLocationId = 51;
    uint256 private _getVotesHardCapSourceLocationId = 146;

    uint256 private _communityDrivenGovernanceLocationId = 72;

    // Address of a microservice that handles some of the voting related mechanisms
    address
        private _communityDrivenGovernanceFunctionalityAddress = 0x92628ccDa6e51A3AC6746ef1100D419453fA8182;

    uint256 private _getSurveySingleRewardSourceLocationId = 49;

    uint256 private _getMinimumStakingSourceLocationId = 147;

    string private _metadataLink;

    /**
     * @dev Constructor for the contract
     * @param metadataLink Link to the metadata of all the microservice information
     */
    constructor(string memory metadataLink) public {
        _metadataLink = metadataLink;
    }

    /**
     * @dev GETTER for the metadataLink
     * @return metadataLink Link to the metadata
     */
    function getMetadataLink() public view returns (string memory metadataLink) {
        return _metadataLink;
    }

    /**
     * @dev Each Microservice needs to implement its own logic for handling what happens when it's added or removed from a a DFO
     * onStart is one of this mandatory functions.
     * onStart is triggered when a microservice is added.
     * The method body can be left blank (i.e. you don't need any special startup/teardown logic)
     * The only strict requirement is for the method to be there.
     */
    function onStart(address, address) public {}

    /**
     * @dev Each Microservice needs to implement its own logic for handling what happens when it's added or removed from a a DFO
     * onStop is one of this mandatory functions.
     * onStop is triggered when a microservice is removed.
     * The method body can be left blank (i.e. you don't need any special startup/teardown logic)
     * The only strict requirement is for the method to be there.
     */
    function onStop(address) public {}

    /**
     * @dev Deploy the Governance Rules cloning the original core one and modify it according to
     * the desired functionalities/configurations
     * @param sender Address of the caller
     * @param
     * @param minimumBlockNumber Amount of blocks for the duration of a proposal
     * @param emergencyBlockNumber Amount of blocks for the duration of an EmergencyProposal
     * @param emergencyStaking
     * @param quorum Required quorum for a proposal to be accepted
     * @param surveyMaxCap Amount of voting tokens needed to reach the max-cap on a proposal
     * @param surveyMinStake The minimum of Token Staked needed to create a new Proposal.
     * @param surveySingleReward The amount of Voting Tokens set as a reward to the issuer for
     * every Accepted Proposal paid automatically by the DFO Wallet.
     * @return mvdFunctionalitiesManager The newly created Functionalities Manager
     */
    function deployGovernanceRules(
        address sender,
        uint256,
        uint256 minimumBlockNumber,
        uint256 emergencyBlockNumber,
        uint256 emergencyStaking,
        uint256 quorum,
        uint256 surveyMaxCap,
        uint256 surveyMinStake,
        uint256 surveySingleReward
    ) public returns (IMVDFunctionalitiesManager mvdFunctionalitiesManager) {
        IMVDProxy proxy = IMVDProxy(msg.sender);

        IMVDFunctionalitiesManager originalFunctionalitiesManager = IMVDFunctionalitiesManager(
            proxy.getMVDFunctionalitiesManagerAddress()
        );

        (address functionalityAddress, , , , ) = originalFunctionalitiesManager
            .getFunctionalityData("checkSurveyResult");

        mvdFunctionalitiesManager = _deployFunctionalitiesManager(
            address(originalFunctionalitiesManager),
            functionalityAddress,
            minimumBlockNumber,
            emergencyBlockNumber,
            emergencyStaking
        );

        (functionalityAddress, , , , ) = originalFunctionalitiesManager.getFunctionalityData(
            "getDefaultIndex"
        );

        _deployCollateralFunctionalities(
            mvdFunctionalitiesManager,
            functionalityAddress,
            quorum,
            surveyMaxCap,
            surveyMinStake,
            surveySingleReward
        );

        proxy.emitEvent(
            "DFOCollateralContractsCloned(address_indexed,address)",
            abi.encodePacked(sender),
            bytes(""),
            abi.encode(address(mvdFunctionalitiesManager))
        );
    }

    /**
     * @dev Clone and deploy of the core Functionalities Manager and its required functionalities
     */
    function _deployFunctionalitiesManager(
        address originalFunctionalitiesManager,
        address checkSurveyResultFunctionalityAddress,
        uint256 minimumBlockNumber,
        uint256 emergencyBlockNumber,
        uint256 emergencyStaking
    ) private returns (IMVDFunctionalitiesManager mvdFunctionalitiesManager) {
        (mvdFunctionalitiesManager = IMVDFunctionalitiesManager(
            clone(originalFunctionalitiesManager)
        ))
            .init(
            _sourceLocation,
            _getMinimumBlockNumberForSurveySourceLocationId,
            address(new GetMinimumBlockNumberForSurveyFunctionality(minimumBlockNumber)),
            _getMinimumBlockNumberForEmergencySurveySourceLocationId,
            address(new GetMinimumBlockNumberForEmergencySurveyFunctionality(emergencyBlockNumber)),
            _getEmergencySurveyStakingFunctionalitySourceLocationId,
            address(new GetEmergencySurveyStakingFunctionality(emergencyStaking)),
            _surveyResultValidatorSourceLocationId,
            checkSurveyResultFunctionalityAddress
        );
    }

    /**
     * @dev Add extra functionalities to the FunctionalitiesManager
     */
    function _deployCollateralFunctionalities(
        IMVDFunctionalitiesManager mvdFunctionalitiesManager,
        address getDefaultIndexFunctionalityAddress,
        uint256 quorum,
        uint256 surveyMaxCap,
        uint256 surveyMinStake,
        uint256 surveySingleReward
    ) private {
        mvdFunctionalitiesManager.addFunctionality(
            "getIndex",
            _sourceLocation,
            _getIndexSourceLocationId,
            getDefaultIndexFunctionalityAddress,
            false,
            "getValue()",
            '["uint256"]',
            false,
            false
        );

        if (quorum > 0) {
            mvdFunctionalitiesManager.addFunctionality(
                "getQuorum",
                _sourceLocation,
                _getQuorumSourceLocationId,
                address(new GetUint256Value(quorum)),
                false,
                "getValue()",
                '["uint256"]',
                false,
                false
            );
        }

        if (surveyMaxCap > 0) {
            mvdFunctionalitiesManager.addFunctionality(
                "getVotesHardCap",
                _sourceLocation,
                _getVotesHardCapSourceLocationId,
                address(new GetVotesHardCapFunctionality(surveyMaxCap)),
                false,
                "getVotesHardCap()",
                '["uint256"]',
                false,
                false
            );
        }

        if (surveyMinStake > 0) {
            mvdFunctionalitiesManager.addFunctionality(
                "getMinimumStaking",
                _sourceLocation,
                _getMinimumStakingSourceLocationId,
                address(new GetUint256Value(surveyMinStake)),
                false,
                "getValue()",
                '["uint256"]',
                false,
                false
            );
        }

        if (surveySingleReward > 0) {
            mvdFunctionalitiesManager.addFunctionality(
                "proposalEnd",
                _sourceLocation,
                _communityDrivenGovernanceLocationId,
                _communityDrivenGovernanceFunctionalityAddress,
                true,
                "proposalEnd(address,bool)",
                "[]",
                false,
                false
            );
            mvdFunctionalitiesManager.addFunctionality(
                "getSurveySingleReward",
                _sourceLocation,
                _getSurveySingleRewardSourceLocationId,
                address(new GetUint256Value(surveySingleReward)),
                false,
                "getValue()",
                '["uint256"]',
                false,
                false
            );
        }
    }

    /**
     * @dev Clone the core Functionality Manager
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
    function getMVDFunctionalitiesManagerAddress() external view returns (address);

    function emitEvent(
        string calldata eventSignature,
        bytes calldata firstIndex,
        bytes calldata secondIndex,
        bytes calldata data
    ) external;

    function transfer(
        address receiver,
        uint256 value,
        address token
    ) external;

    function read(string calldata codeName, bytes calldata data)
        external
        view
        returns (bytes memory returnData);
}

interface IMVDFunctionalitiesManager {
    function init(
        address sourceLocation,
        uint256 getMinimumBlockNumberSourceLocationId,
        address getMinimumBlockNumberFunctionalityAddress,
        uint256 getEmergencyMinimumBlockNumberSourceLocationId,
        address getEmergencyMinimumBlockNumberFunctionalityAddress,
        uint256 getEmergencySurveyStakingSourceLocationId,
        address getEmergencySurveyStakingFunctionalityAddress,
        uint256 checkVoteResultSourceLocationId,
        address checkVoteResultFunctionalityAddress
    ) external;

    function addFunctionality(
        string calldata codeName,
        address sourceLocation,
        uint256 sourceLocationId,
        address location,
        bool submitable,
        string calldata methodSignature,
        string calldata returnAbiParametersArray,
        bool isInternal,
        bool needsSender
    ) external;

    function getFunctionalityData(string calldata codeName)
        external
        view
        returns (
            address,
            uint256,
            string memory,
            address,
            uint256
        );

    function hasFunctionality(string calldata codeName) external view returns (bool);
}

interface IMVDFunctionalityProposal {
    function getProposer() external view returns (address);
}

contract GetMinimumBlockNumberForSurveyFunctionality {
    uint256 private _value;

    constructor(uint256 value) public {
        _value = value;
    }

    function onStart(address newSurvey, address oldSurvey) public {}

    function onStop(address newSurvey) public {}

    function getMinimumBlockNumberForSurvey() public view returns (uint256) {
        return _value;
    }
}

contract GetMinimumBlockNumberForEmergencySurveyFunctionality {
    uint256 private _value;

    constructor(uint256 value) public {
        _value = value;
    }

    function onStart(address newSurvey, address oldSurvey) public {}

    function onStop(address newSurvey) public {}

    function getMinimumBlockNumberForEmergencySurvey() public view returns (uint256) {
        return _value;
    }
}

contract GetEmergencySurveyStakingFunctionality {
    uint256 private _value;

    constructor(uint256 value) public {
        _value = value;
    }

    function onStart(address newSurvey, address oldSurvey) public {}

    function onStop(address newSurvey) public {}

    function getEmergencySurveyStaking() public view returns (uint256) {
        return _value;
    }
}

contract GetVotesHardCapFunctionality {
    uint256 private _value;

    constructor(uint256 value) public {
        _value = value;
    }

    function onStart(address newSurvey, address oldSurvey) public {}

    function onStop(address newSurvey) public {}

    function getVotesHardCap() public view returns (uint256) {
        return _value;
    }
}

contract GetUint256Value {
    uint256 private _value;

    constructor(uint256 value) public {
        _value = value;
    }

    function onStart(address newSurvey, address oldSurvey) public {}

    function onStop(address newSurvey) public {}

    function getValue() public view returns (uint256) {
        return _value;
    }
}
