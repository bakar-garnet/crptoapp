// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Treasury is Ownable {
    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor() Ownable(msg.sender) {}

    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "insufficient");
        (bool ok,) = to.call{value: amount}("");
        require(ok, "transfer failed");
        emit Withdrawn(to, amount);
    }
}
