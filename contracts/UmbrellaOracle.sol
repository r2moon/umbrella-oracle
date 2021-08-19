//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@umb-network/toolbox/dist/contracts/IChain.sol";
import "@umb-network/toolbox/dist/contracts/IRegistry.sol";
import "@umb-network/toolbox/dist/contracts/lib/ValueDecoder.sol";
import "./interfaces/IERC20Detailed.sol";
import "hardhat/console.sol";

contract UmbrellaOracle {
    using ValueDecoder for bytes;
    using ValueDecoder for bytes32;

    // Umbrella Registry contract
    IRegistry public registry;

    // Key for token/USD pair
    mapping(address => bytes32) public keys;

    constructor(address _registry) {
        require(_registry != address(0x0), "_registry is empty");
        registry = IRegistry(_registry);
    }

    function getTokensOwed(uint256 _ethOwed, address _token)
        external
        view
        returns (uint256 tokenOwed)
    {
        uint256 ethPrice = getPrice(address(0));
        uint256 tokenPrice = getPrice(_token);
        tokenOwed = (ethPrice * _ethOwed) / tokenPrice;

        // TODO: check decimals
        // uint8 decimals = IERC20Detailed(_token).decimals();
        // if (decimals < 18) {
        //     tokenOwed /= 18 - uint256(decimals);
        // } else if (decimals > 18) {
        //     tokenOwed *= uint256(decimals) - 18;
        // }
    }

    function getEthOwed(uint256 _tokensOwed, address _token)
        external
        view
        returns (uint256 tokenOwed)
    {
        uint256 ethPrice = getPrice(address(0));
        uint256 tokenPrice = getPrice(_token);
        tokenOwed = (tokenPrice * _tokensOwed) / ethPrice;

        // TODO: check decimals
        // uint8 decimals = IERC20Detailed(_token).decimals();
        // if (decimals < 18) {
        //     tokenOwed *= 18 - uint256(decimals);
        // } else if (decimals > 18) {
        //     tokenOwed /= uint256(decimals) - 18;
        // }
    }

    function getPrice(address token) public view returns (uint256) {
        bytes32 _key = keys[token];

        (uint256 value, uint256 timestamp) = _chain().getCurrentValue(_key);

        require(timestamp > 0, "value does not exists");

        return value;
    }

    function registerKey(address token, bytes32 key) external {
        keys[token] = key;
    }

    function _chain() internal view returns (IChain umbChain) {
        umbChain = IChain(registry.getAddress("Chain"));
    }
}
