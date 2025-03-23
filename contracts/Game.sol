// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IGame.sol";
import "./interfaces/IRevealVerifier.sol";

contract Game is IGame {
    IRevealVerifier public revealVerifier;
    uint public armyCounter;
    uint public planetCounter;
    uint32 public salt;

    // Mapping to store army data
    mapping(uint => address) public armyOwner;
    mapping(uint => uint) public armyCommitment;
    mapping(uint => uint) public armyEnergy;
    mapping(uint => uint) public armyStartBlockNumber;

    // Mapping to store planet data
    mapping(uint => address) public planetOwner;
    mapping(uint => uint) public planetEnergy;

    constructor(address _revealVerifier, uint32 _salt) {
        revealVerifier = IRevealVerifier(_revealVerifier);
        salt = _salt;
    }

    function initPlayer() external {
        planetCounter++;
        planetOwner[planetCounter] = msg.sender;
        planetEnergy[planetCounter] = 400;
    }

    // Commit movement for secret movement via commit-and-reveal.
    // Commits the movement path from a source planet with a commitment and energy.
    // Returns an army id.
    function commit(
        uint sourcePlanet,
        uint commitment,
        uint energy
    ) external returns (uint armyId) {
        require(planetEnergy[sourcePlanet] >= energy, "Not enough energy");
        armyCounter++;
        armyId = armyCounter;
        armyOwner[armyId] = msg.sender;
        armyCommitment[armyId] = commitment;
        armyEnergy[armyId] = energy;
        armyStartBlockNumber[armyId] = block.number;
        // planetEnergy[sourcePlanet] -= energy;
        return armyId;
    }

    // Reveal movement with proof.
    // If the destination is one's own planet, credit the account; otherwise, mark as standby.
    function reveal(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint armyId,
        uint positionHash,
        uint energy
    ) external {
        require(armyId > 0, "Invalid army id");
        require(armyStartBlockNumber[armyId] > 0, "army already revealed");
        uint commitment = armyCommitment[armyId];
        address owner = armyOwner[armyId];
        uint duration = block.number - armyStartBlockNumber[armyId];
        uint[7] memory inputs = [
            commitment,
            duration,
            uint(uint160(owner)),
            uint(salt),
            uint(1),
            positionHash,
            energy
        ];
        require(revealVerifier.verifyProof(a, b, c, inputs), "Invalid proof");

        armyStartBlockNumber[armyId] = 0;
    }

    function maxArmyId() external view returns (uint) {
        return armyCounter;
    }

    function maxPlanetId() external view returns (uint) {
        return planetCounter;
    }
}
