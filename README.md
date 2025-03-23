# Dark Trek

**Dark Trek** combines the strategy of classic RTS games with the creativity of _Dark Forest_. Players use fog of war to conceal fleet paths and surprise their enemies. Blockchain and zero-knowledge proofs (ZKP) ensure privacy, security, and a decentralized gaming experience, adding layers of strategy and unpredictability.

## 🚀 Features

- **Strategic Stealth**: Hide your fleet's movements and use surprise tactics to gain the upper hand.
- **Commit-Reveal Mechanism**: Conceal and reveal fleet paths for added strategic depth and privacy.
- **Decentralized & Secure**: Built on blockchain and ZKP for transparency and privacy-preserving gameplay.
- **Dynamic Gameplay**: Plan ambushes, intercept attacks, or adjust strategies on the fly.

## 🌟 Why It's Challenging

Building **Dark Trek** presented several unique challenges:

- **Commit-Reveal Paths**:

  - Using ZKP to prove the validity of hidden fleet paths.
  - Ensuring the integrity of hidden routes and their reveal at the right time.

- **Performance Optimization**:

  - Reducing circuit constraints to fit under **100k** for fast proof generation and efficient gameplay.
  - Ensuring seamless interaction with blockchain networks.

- **Gameplay Design**:

  - Creating a fluid experience for players to design, commit, and reveal paths.
  - Developing a game environment where strategy and surprise are paramount.


## 🚧 Challenges

We identified **Griffin Permutation** as a potential alternative to **MiMC/Poseidon** hashes to reduce constraints, and tweaked it to fit our specific scenario. However, we faced challenges in efficiently mapping hashes to the bit array within **Bloom Filter** constraints.

To address this, we attempted to use **VDF** (Verifiable Delay Function) to delay the search process. Unfortunately, the **Sloth Scheme** didn’t prove suitable for the field, resulting in limited progress.

## 🚀 Future Improvements

- Further optimize constraints for **Bloom Filter** hashes while ensuring security.
- Integrate **VDF** to limit search capabilities, maintaining small constraint sizes for better performance and scalability.


## 🛠️ How It's Made

### Technology Stack

- **[Noir](https://noir-lang.org/)**: High-level language for zk-SNARKs, used to write secure and privacy-preserving circuits.
- **[Circom](https://github.com/iden3/circom)**: ZKP circuit development.
- **[Circomlib](https://github.com/iden3/circomlib)**: Libraries for building ZKP circuits.
- **[SnarkJS](https://github.com/iden3/snarkjs)**: In-browser proof generation.
- **[React](https://reactjs.org/)**: Front-end development.
- **[Solidity](https://soliditylang.org/)**: Smart contract programming language.
- **[Typechain](https://github.com/dethcrypto/TypeChain)**: Automating the connection between contracts and the front-end.


### Development Workflow

1. **Circuit Design and Integration**:

   - Circom circuits encode game rules and generate Solidity verifiers.
   - The verifier interacts with the core game contract deployed on blockchain networks.

2. **Front-End and Proofs**:

   - Circom-generated WASM files enable in-browser proof generation via SnarkJS.
   - React handles the dynamic UI for fleet path design and gameplay interaction.

3. **Blockchain Interaction**:

   - Typechain automates smart contract connections to the front-end.
   - Web3.js ensures secure and seamless blockchain communication.

## Deployment Details

- Groth16 Verifier: 0xDB1bb803EAAC1d6496E57C58EA118d42022599fc
- Game: 0xc61A7C3728E71C658fed1eb65eEf8Fc19C3a13BF

## 🎮 Gameplay Highlights

- **Hidden Fleet Paths**: Conceal your fleet’s movements to plan surprise attacks or strategic retreats.
- **Strategic Surprises**: Use the commit-reveal mechanism to ambush enemies or shift your strategy mid-game.
- **Optimized for All Devices**: Play on both desktop and mobile browsers without sacrificing performance.

## 💡 Future Improvements

- Enhanced fleet path visualization tools.
- New game mechanics for deeper tactical gameplay.
- Expanding blockchain features, such as incorporating NFTs or player-owned assets.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

**Start your covert operations in Dark Trek!** 🌌🚀
