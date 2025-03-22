// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGame {
    // Commit movement for secret movement via commit-and-reveal.
    // Commits the movement path from a source planet with a commitment and energy.
    // Returns an army id.
    function commit(uint sourcePlanet, bytes32 commitment, uint energy) external returns (uint armyId);

    // Reveal movement with proof.
    // If the destination is one's own planet, credit the account; otherwise, mark as standby.
    function reveal(uint[2] calldata a, uint[2][2] calldata b, uint[2] calldata c, uint armyId, uint positionHash, uint energy) external;

    // Reveal attack movement from a planet.
    // Assists in revealing and attacking using provided proof.
    function revealAttackFromPlanet(uint[2] calldata a1, uint[2][2] calldata b1, uint[2] calldata c1, uint id, uint positionHash, uint targetEnergy, uint ownPlanet, uint ownEnergy) external;

    // Reveal attack movement from an army.
    // Assists in revealing and attacking using provided proof.
    function revealAttackFromArmy(uint[2] calldata a2, uint[2][2] calldata b2, uint[2] calldata c2, uint id, uint positionHash, uint targetEnergy, uint ownArmyId) external;

    // Plain transmission from a source planet to a target position. Returns the new army id.
    function transmitFromPlanet(uint sourcePlanet, bytes32 positionHash) external returns (uint armyId);

    // Plain transmission from an army to a target position. Returns the new army id.
    function transmitFromArmy(uint armyId, bytes32 positionHash) external returns (uint newArmyId);

    // Discover function: Returns a boolean possibility based on hash, coordinates and a public key.
    function discover(bytes32 hash, uint x, uint y, bytes32 pk) external view returns (bool);

    // List all army IDs.
    function listArmy() external view returns (uint[] memory);
}
