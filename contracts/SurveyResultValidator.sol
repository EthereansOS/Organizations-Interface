/* Update:
 * Avoid StateHolder
 */
/* Discussion:
 * https://gitcoin.co/grants/154/decentralized-flexible-organization
 */
/* Description:
 * DFO Protocol - Survey Result validator.
 * One of the 4 well-known read-only mandatory Functionalities every DFO needs.
 * The logic of this functionality is for general purpose so that every DFO can use it as a Stateless Microservice.
 * This logic can provide a Proposal (partial) situation even while the Proposal is still running.
 * It contains the logic to provide the survey result. If the proposer has not staked a minimum amount of Voting Tokens
 * (Decided by the DFO Governance Rules), the Proposal is considered failed by design, regardless of its number of votes.
 * If the DFO Governance Rules provide a minimum quorum of Voting Tokens and it is not reached, regardless of accepts or refuses, the Proposal is considered failed. If the two rules described above are respected or bypassed, the Proposal is to be considered valid if and only if the accept votes are higher than the refuses.
 */
pragma solidity ^0.6.0;

contract SurveyResultValidator {

    function onStart(address, address) public {
    }

    function onStop(address) public {
    }

    function checkSurveyResult(address proposalAddress) public view returns(bool) {
        IMVDProxy proxy = IMVDProxy(msg.sender);
        IMVDFunctionalitiesManager functionalitiesManager = IMVDFunctionalitiesManager(proxy.getMVDFunctionalitiesManagerAddress());
        IMVDFunctionalityProposal proposal = IMVDFunctionalityProposal(proposalAddress);
        if(functionalitiesManager.hasFunctionality("getMinimumStaking")) {
            uint256 minimumStaking = toUint256(proxy.read("getMinimumStaking", bytes("")));
            if(minimumStaking > 0) {
                (uint256 accept,) = proposal.getVote(proposal.getProposer());
                if(accept < minimumStaking) {
                    return false;
                }
            }
        }
        (uint256 accept, uint256 refuse) = proposal.getVotes();
        bool acceptWins = accept > refuse;
        if(functionalitiesManager.hasFunctionality("getQuorum")) {
            uint256 quorum = toUint256(proxy.read("getQuorum", bytes("")));
            if(quorum > 0) {
                if((acceptWins ? accept : refuse) < quorum) {
                    return false;
                }
            }
        }
        return acceptWins;
    }

    function toUint256(bytes memory bs) private pure returns(uint256 x) {
        if(bs.length >= 32) {
            assembly {
                x := mload(add(bs, add(0x20, 0)))
            }
        }
    }
}

interface IMVDFunctionalityProposal {
    function getProposer() external view returns(address);
    function getVotes() external view returns(uint256, uint256);
    function getVote(address addr) external view returns(uint256 accept, uint256 refuse);
}

interface IMVDProxy {
    function getMVDFunctionalitiesManagerAddress() external view returns(address);
    function read(string calldata codeName, bytes calldata data) external view returns(bytes memory returnData);
}

interface IMVDFunctionalitiesManager {
    function hasFunctionality(string calldata codeName) external view returns(bool);
}