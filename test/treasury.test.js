const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Treasury", function () {
  it("accepts deposits and owner can withdraw", async function () {
    const [owner, other] = await ethers.getSigners();
    const Treasury = await ethers.getContractFactory("Treasury");
    const t = await Treasury.deploy();

    await owner.sendTransaction({ to: await t.getAddress(), value: ethers.parseEther("1") });

    const balBefore = await ethers.provider.getBalance(other.address);
    await t.withdraw(other.address, ethers.parseEther("0.2"));
    const balAfter = await ethers.provider.getBalance(other.address);

    expect(balAfter).to.be.gt(balBefore);
  });
});
