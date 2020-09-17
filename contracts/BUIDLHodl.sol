// SPDX-License-Identifier: BSD-2
pragma solidity ^0.6.0;

/**
 * @title Staking (Liquidity Mining/Farming) Contract for Buidl
 */
contract BUIDLHodl {
    uint256 private constant MODES = 3;

    address private _proxy;

    address private _buidlTokenAddress;
    address private _usdcTokenAddress;

    address private _uniswapV2RouterAddress;
    address private _buidlEthPoolTokenAddress;
    address private _buidlUSDCPoolTokenAddress;

    uint256[] private _blocksRanges;
    uint256[][] private _tokenRewards;

    uint256 private _accumulatingEndBlock;

    mapping(address => mapping(uint256 => StakingInfo)) private _totalLocked;

    struct StakingInfo {
        bool eth;
        uint256 amountLocked;
        uint256 reward;
        uint256 unlockBlock;
        bool withdrawn;
    }

    event Staked(
        address indexed sender,
        uint256 indexed mode,
        bool eth,
        uint256 amountIn,
        uint256 tokenPool,
        uint256 reward,
        uint256 endBlock
    );

    /**
     * @dev Constructor for the contract
     * @param proxy Address of the Proxy contract
     * @param usdcTokenAddress Address of the USDC stablecoin contract
     * @param uniswapV2RouterAddress Address of the UniswapV2Router Contract
     * @param buidlEthPoolTokenAddress Address of the Uniswap buidl-eth pool
     * @param buidlUSDCPoolTokenAddress Address of the Uniswap buidl-usdc pool
     * @param accumulatingEndBlock Maximum time in which the staking is available
     * @param blockRanges Array of timed windows for the various staking tiers
     * @param tokenRewardsMultipliers Multipliers for the above tiers (Numerator)
     * @param tokensRewardsDividers Dividers for the above tier, gives you the percentage (Denominator)
     */
    constructor(
        address proxy,
        address usdcTokenAddress,
        address uniswapV2RouterAddress,
        address buidlEthPoolTokenAddress,
        address buidlUSDCPoolTokenAddress,
        uint256 accumulatingEndBlock,
        uint256[] memory blocksRanges,
        uint256[] memory tokenRewardsMultipliers,
        uint256[] memory tokenRewardsDividers
    ) public {
        assert(
            blocksRanges.length == MODES &&
                blocksRanges.length == tokenRewardsMultipliers.length &&
                tokenRewardsMultipliers.length == tokenRewardsDividers.length
        );
        _buidlTokenAddress = IMVDProxy(_proxy = proxy).getToken();
        _usdcTokenAddress = usdcTokenAddress;
        _uniswapV2RouterAddress = uniswapV2RouterAddress;
        _buidlEthPoolTokenAddress = buidlEthPoolTokenAddress;
        _buidlUSDCPoolTokenAddress = buidlUSDCPoolTokenAddress;
        _accumulatingEndBlock = accumulatingEndBlock;
        _blocksRanges = blocksRanges;
        for (uint256 i = 0; i < tokenRewardsMultipliers.length; i++) {
            _tokenRewards.push([tokenRewardsMultipliers[i], tokenRewardsDividers[i]]);
        }
    }

    /**
     * @dev GETTER for the proxy
     * @return proxy Address for the proxy contract
     */
    function proxy() public view returns (address proxy) {
        return _proxy;
    }

    /**
     * @dev SETTER for the proxy
     * @param newProxy Address for the new proxy contract to set
     */
    function setProxy(address newProxy) public {
        require(
            IMVDFunctionalitiesManager(IMVDProxy(_proxy).getMVDFunctionalitiesManagerAddress())
                .isAuthorizedFunctionality(msg.sender),
            "Unauthorized Action!"
        );
        _proxy = newProxy;
    }

    /**
     * @dev Stake the liquidity
     * @param buidlIn Amount if buidl to stake
     * @param usdcIn Amount of usdc to stake
     * @param mode Staking mode (time tier)
     */
    function lock(
        uint256 buidlIn,
        uint256 usdcIn,
        uint256 mode
    ) public payable {
        require(block.number < _accumulatingEndBlock, "Accumulating Time has finished!");
        require(mode < MODES, "Unknown mode!");
        uint256 reward = _calculateReward(buidlIn, mode);
        _installStorageIfNecessary(msg.sender);
        StakingInfo[] storage array = _totalLocked[msg.sender][mode];
        array.push(
            StakingInfo(msg.value > 0, buidlIn, reward, block.number + _blocksRanges[mode], false)
        );
        _totalLocked[msg.sender][mode] = array;
        if (msg.value == 0) {
            IERC20(_usdcTokenAddress).transferFrom(msg.sender, address(this), usdcIn);
        }
        emit Staked(
            msg.sender,
            mode,
            msg.value > 0,
            msg.value > 0 ? msg.value : buidlIn,
            0,
            reward,
            block.number + _blocksRanges[mode]
        );
    }

    // For each user insert their info in the relevant tier
    function _installStorageIfNecessary(address sender) private {
        if (_totalLocked[sender].length > 0) {
            return;
        }
        for (uint256 i = 0; i < MODES; i++) {
            _totalLocked[sender].push(new StakingInfo[]);
        }
    }

    /**
     * @dev Compute the staking reward according to the mode
     * @param amount Locked amount
     * @param mode Temporal Tier
     * @return reward Total reward
     */
    function _calculateReward(uint256 amount, uint256 mode) private view returns (uint256 reward) {
        return _tokenRewards[mode][0];
    }

    /**
     * @dev Withdraw staked liquidity. Can only be done after the time tier is passed.
     * @param sender Address of the requester. Liquidity withdrawn will be sent to this address
     */
    function withdraw(address sender) public {
        require(block.number >= _accumulatingEndBlock, "Accumulating Time is still running!");
        StakingInfo[][] storage stakingInfos = _totalLocked[sender];
        uint256 ethPoolTokens = 0;
        uint256 usdcPoolTokens = 0;
        uint256 buidlTokens = 0;
        for (uint256 i = 0; i < _blocksRanges.length; i++) {
            for (uint256 z = 0; z < stakingInfos[i].length; z++) {
                StakingInfo storage stakingInfo = stakingInfos[i][z];
                if (stakingInfo.withdrawn) {
                    continue;
                }
                if (stakingInfo.unlockBlock > block.number) {
                    break;
                }
                stakingInfo.withdrawn = true;
                ethPoolTokens += stakingInfo.eth ? stakingInfo.amountLocked : 0;
                usdcPoolTokens += stakingInfo.eth ? 0 : stakingInfo.amountLocked;
                buidlTokens += stakingInfo.reward;
            }
        }
        if (ethPoolTokens > 0) {
            IERC20(_buidlEthPoolTokenAddress).transfer(sender, ethPoolTokens);
        }
        if (usdcPoolTokens > 0) {
            IERC20(_buidlUSDCPoolTokenAddress).transfer(sender, usdcPoolTokens);
        }
        if (buidlTokens > 0) {
            IERC20(_buidlTokenAddress).transfer(sender, buidlTokens);
        }
    }
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function burn(uint256 amount) external;
}

interface IUniswapV2Router {
    function WETH() external pure returns (address);

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

interface IMVDProxy {
    function getToken() external view returns (address);

    function getStateHolderAddress() external view returns (address);

    function getMVDWalletAddress() external view returns (address);

    function getMVDFunctionalitiesManagerAddress() external view returns (address);

    function submit(string calldata codeName, bytes calldata data)
        external
        payable
        returns (bytes memory returnData);

    function transfer(
        address receiver,
        uint256 value,
        address token
    ) external;
}

interface IMVDFunctionalitiesManager {
    function isAuthorizedFunctionality(address functionality) external view returns (bool);
}

interface IStateHolder {
    function setUint256(string calldata name, uint256 value) external returns (uint256);

    function getUint256(string calldata name) external view returns (uint256);

    function getAddress(string calldata name) external view returns (address);

    function setAddress(string calldata varName, address val) external returns (address);

    function clear(string calldata varName)
        external
        returns (string memory oldDataType, bytes memory oldVal);
}
