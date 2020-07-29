/* Discussion:
 * {0}
 */
/* Description:
 * {1}
 */
pragma solidity ^{2};

contract AddToPoolProposal {

    address private constant UNISWAP_V2_FACTORY = {3};

    address private constant UNISWAP_V2_ROUTER = {4};

    address private WETH_ADDRESS = IUniswapV2Router(UNISWAP_V2_ROUTER).WETH();

    address private constant FIRST_TOKEN = {5};

    address private constant SECOND_TOKEN = {6};

    uint256 private constant FIRST_AMOUNT = {7};

    uint256 private constant SECOND_AMOUNT = {8};

    uint256 private constant SLIPPAGE_NUMERATOR = 5;
    uint256 private constant SLIPPAGE_DENOMINATOR = 1000;

    receive() external payable {
    }

    function callOneTime(address) public {
        IMVDProxy proxy = IMVDProxy(msg.sender);
        address firstToken = FIRST_TOKEN == address(0) ? SECOND_TOKEN : WETH_ADDRESS;
        uint256 originalFirstAmount = FIRST_TOKEN == address(0) ? SECOND_AMOUNT : FIRST_AMOUNT;
        proxy.transfer(address(this), originalFirstAmount, firstToken);

        address secondToken = FIRST_TOKEN == address(0) ? WETH_ADDRESS : SECOND_TOKEN;
        uint256 originalSecondAmount = FIRST_TOKEN == address(0) ? FIRST_AMOUNT : SECOND_AMOUNT;
        proxy.transfer(address(this), originalSecondAmount, secondToken);

        uint256 firstAmountMin, uint256 secondAmountMin = _calculateAmountMin(firstAddress, secondAddress, originalFirstAmount, originalSecondAmount);
        uint256 firstAmount = 0;
        uint256 secondAmount = 0;
        uint256 poolAmount = 0;
        address walletAddress = proxy.getMVDWalletAddress();

        if(secondToken == WETH_ADDRESS) {
            (firstAmount, secondAmount, poolAmount) = IUniswapV2Router(UNISWAP_V2_ROUTER).addLiquidityETH{value: originalSecondAmount}(
                firstToken,
                originalFirstAmount,
                firstAmountMin,
                secondAmountMin,
                walletAddress,
                block.timestamp + 1000
            );
        } else {
            (firstAmount, secondAmount, poolAmount) = IUniswapV2Router(UNISWAP_V2_ROUTER).addLiquidity(
                firstToken,
                secondToken,
                originalFirstAmount,
                originalSecondAmount,
                firstAmountMin,
                secondAmountMin,
                walletAddress,
                block.timestamp + 1000
            );
        }
        if(firstAmount < originalFirstAmount) {
            IERC20(firstToken).transfer(walletAddress, originalFirstAmount - firstAmount);
        }
        if(secondAmount < originalSecondAmount) {
            if(secondToken == WETH_ADDRESS) {
                payable(walletAddress).transfer(originalSecondAmount - secondAmount);
            } else {
                IERC20(secondToken).transfer(walletAddress, originalSecondAmount - secondAmount);
            }
        }
    }

    function _calculateAmountMin(address firstAddress, address secondAddress, uint256 originalFirstAmount, uint256 originalSecondAmount) private returns(uint256 firstAmountMin, uint256 secondAmountMin) {
        firstAmountMin = originalFirstAmount - (originalFirstAmount * SLIPPAGE_NUMERATOR / SLIPPAGE_DENOMINATOR);
        uint256 secondAmount = originalSecondAmount;
        IUniswapV2Pair pair = IUniswapV2Pair(IUniswapV2Factory(UNISWAP_V2_FACTORY).getPair(firstToken, secondToken));
        if(address(pairToken) != address(0)) {
            (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
            bool inverted = firstAddress == pair.token1();
            uint256 divisor = inverted ? reserve1 / reserve0 : reserve0 / reserve1;
            secondAmount = originalFirstAmount / multiplier;
        }
        secondAmountMin = secondAmount - (secondAmount * SLIPPAGE_NUMERATOR / SLIPPAGE_DENOMINATOR);
    }
}

interface IMVDProxy {
    function getMVDWalletAddress() external view returns(address);
    function transfer(address receiver, uint256 value, address token) external;
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface IUniswapV2Router {
    function WETH() external pure returns (address);
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);

    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

interface IUniswapV2Pair {
  event Approval(address indexed owner, address indexed spender, uint value);
  event Transfer(address indexed from, address indexed to, uint value);

  function name() external pure returns (string memory);
  function symbol() external pure returns (string memory);
  function decimals() external pure returns (uint8);
  function totalSupply() external view returns (uint);
  function balanceOf(address owner) external view returns (uint);
  function allowance(address owner, address spender) external view returns (uint);

  function approve(address spender, uint value) external returns (bool);
  function transfer(address to, uint value) external returns (bool);
  function transferFrom(address from, address to, uint value) external returns (bool);

  function DOMAIN_SEPARATOR() external view returns (bytes32);
  function PERMIT_TYPEHASH() external pure returns (bytes32);
  function nonces(address owner) external view returns (uint);

  function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;

  event Mint(address indexed sender, uint amount0, uint amount1);
  event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
  event Swap(
      address indexed sender,
      uint amount0In,
      uint amount1In,
      uint amount0Out,
      uint amount1Out,
      address indexed to
  );
  event Sync(uint112 reserve0, uint112 reserve1);

  function MINIMUM_LIQUIDITY() external pure returns (uint);
  function factory() external view returns (address);
  function token0() external view returns (address);
  function token1() external view returns (address);
  function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
  function price0CumulativeLast() external view returns (uint);
  function price1CumulativeLast() external view returns (uint);
  function kLast() external view returns (uint);

  function mint(address to) external returns (uint liquidity);
  function burn(address to) external returns (uint amount0, uint amount1);
  function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
  function skim(address to) external;
  function sync() external;
}