/* Description:
 * DFO Protocol - Community-Driven Governance.
 * This is the well-known Functionality provided by the DFO protocol, which is triggered when a Proposal is finalized (whether it is successful or not).
 * In case the Proposal Survey is successful (result value set to true), its proposer will receive an amount of Voting Tokens as a reward.
 * The reward amount is initially decided during the DFO Creation and can be changed with a proposal changing the value of the surveySingleReward variable set into the DFO StateHolder.
 */
/* Discussion:
 * https://gitcoin.co/grants/154/decentralized-flexible-organization
 */
pragma solidity ^0.6.0;

contract CommunityDrivenGovernance {

    function onStart(address newSurvey, address oldSurvey) public {
    }

    function onStop(address newSurvey) public {
    }

    function proposalEnd(address proposal, bool result) public {
        if(!result) {
            return;
        }
        IMVDProxy proxy = IMVDProxy(msg.sender);
        proxy.transfer(IMVDFunctionalityProposal(proposal).getProposer(), IStateHolder(proxy.getStateHolderAddress()).getUint256("surveySingleReward"), proxy.getToken());
    }
}

interface IVotingToken {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface IMVDProxy {
    function getToken() external view returns(address);
    function getStateHolderAddress() external view returns(address);
    function transfer(address receiver, uint256 value, address token) external;
}

interface IMVDFunctionalityProposal {
    function getProposer() external view returns(address);
}

interface IStateHolder {
    function getUint256(string calldata varName) external view returns (uint256);
}