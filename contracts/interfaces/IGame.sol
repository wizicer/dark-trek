// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGame {
    // Initialize player by creating a planet with default energy
    function initPlayer() external;

    // Commit movement for secret movement via commit-and-reveal.
    // Commits the movement path from a source planet with a commitment and energy.
    // Returns an army id.
    function commit(uint sourcePlanet, uint commitment, uint energy) external returns (uint armyId);

    // Reveal movement with proof.
    // If the destination is one's own planet, credit the account; otherwise, mark as standby.
    function reveal(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint armyId,
        uint positionHash,
        uint energy
    ) external;

    // Return the maximum army id.
    function maxArmyId() external view returns (uint);

    // Return the maximum planet id.
    function maxPlanetId() external view returns (uint);
}
