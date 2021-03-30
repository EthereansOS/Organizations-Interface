/* Discussion:
 * //discord.gg/34we8bh
 */
/* Description:
 * Edit Farming Setups
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

contract ProposalCode {

    string private _metadataLink;

    constructor(string memory metadataLink) {
        _metadataLink = metadataLink;
    }

    function getMetadataLink() public view returns(string memory) {
        return _metadataLink;
    }

    function onStart(address, address) public {
    }

    function onStop(address) public {
    }

    function callOneTime(address) public {
        FarmingSetupConfiguration[] memory farmingSetups = new FarmingSetupConfiguration[]({0});
        {1}
        IFarmExtension({2}).setFarmingSetups(farmingSetups);
    }
}

interface IFarmExtension {
    function setFarmingSetups(FarmingSetupConfiguration[] calldata farmingSetups) external;
}

struct FarmingSetupConfiguration {
    bool add; // true if we're adding a new setup, false we're updating it.
    bool disable;
    uint256 index; // index of the setup we're updating.
    FarmingSetupInfo info; // data of the new or updated setup
}

struct FarmingSetupInfo {
    bool free; // if the setup is a free farming setup or a locked one.
    uint256 blockDuration; // duration of setup
    uint256 originalRewardPerBlock;
    uint256 minStakeable; // minimum amount of staking tokens.
    uint256 maxStakeable; // maximum amount stakeable in the setup (used only if free is false).
    uint256 renewTimes; // if the setup is renewable or if it's one time.
    address ammPlugin; // amm plugin address used for this setup (eg. uniswap amm plugin address).
    address liquidityPoolTokenAddress; // address of the liquidity pool token
    address mainTokenAddress; // eg. buidl address.
    address ethereumAddress;
    bool involvingETH; // if the setup involves ETH or not.
    uint256 penaltyFee; // fee paid when the user exits a still active locked farming setup (used only if free is false).
    uint256 setupsCount; // number of setups created by this info.
    uint256 lastSetupIndex; // index of last setup;
}