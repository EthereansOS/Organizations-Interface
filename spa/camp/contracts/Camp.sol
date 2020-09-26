//SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

contract Camp {

    IUniswapV2Router private _uniswap;
    address private _wethAddress;

    constructor(address uniswapV2RouterAddress) {
        _uniswap = IUniswapV2Router(uniswapV2RouterAddress);
        _wethAddress = _uniswap.WETH();
    }

    function context() public view returns(address uniswapV2RouterAddress, address wethAddress) {
        uniswapV2RouterAddress = address(_uniswap);
        wethAddress = _wethAddress;
    }

    receive() external payable {
    }

    function camp(
        address pairAddress,
        uint256 gToken,
        address tokenTAddress,
        uint256 amountGIn
    ) public payable {
        IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
        address tokenGAddress = gToken == 0 ? pair.token0() : pair.token1();
        address tokenLAddress = gToken == 0 ? pair.token1() : pair.token0();
        _transferToMeAndCheckAllowance(tokenGAddress, amountGIn, address(_uniswap));
        uint256 amountOut = _swap(tokenGAddress, tokenLAddress, amountGIn);
        amountOut = _swap(tokenLAddress, tokenTAddress, amountOut);
        amountOut = _swap(tokenTAddress, tokenGAddress, amountOut);
        _flush(tokenGAddress);
        _flush(tokenLAddress);
        _flush(tokenTAddress);
        _flush(_wethAddress);
        _flush(address(0));
    }

    function _swap(
        address tokenA,
        address tokenB,
        uint256 amountA
    ) private returns(uint256) {
        _checkAllowance(tokenA, amountA, address(_uniswap));
        address[] memory path = new address[](2);
        path[0] = tokenA;
        path[1] = tokenB;
        uint256 amountOut = _uniswap.getAmountsOut(amountA, path)[1];
        if(tokenA == _wethAddress) {
            return _uniswap.swapExactETHForTokens{value : amountA}(amountOut, path, address(this), block.timestamp + 10000)[1];
        }
        if(tokenB == _wethAddress) {
            return _uniswap.swapExactTokensForETH(amountA, amountOut, path, address(this), block.timestamp + 10000)[1];
        }
        return _uniswap.swapExactTokensForTokens(amountA, amountOut, path, address(this), block.timestamp + 10000)[1];
    }

    function _flush(address tokenAddress) private {
        if(tokenAddress == address(0)) {
            uint256 balance = address(this).balance;
            if(balance > 0) {
                payable(msg.sender).transfer(balance);
            }
            return;
        }
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        if(balance > 0) {
            token.transfer(msg.sender, balance);
        }
    }

    function _checkAllowance(
        address tokenAddress,
        uint256 value,
        address spender
    ) private {
        if(tokenAddress == _wethAddress) {
            return;
        }
        IERC20 token = IERC20(tokenAddress);
        if (token.allowance(address(this), spender) <= value) {
            token.approve(spender, value);
        }
    }

    function _transferToMeAndCheckAllowance(
        address tokenAddress,
        uint256 value,
        address spender
    ) private {
        if(tokenAddress == _wethAddress) {
            return;
        }
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), value);
        _checkAllowance(tokenAddress, value, spender);
    }
}

interface IUniswapV2Router {
    function WETH() external pure returns (address);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts);
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface IUniswapV2Pair {
    function token0() external view returns (address);
    function token1() external view returns (address);
}