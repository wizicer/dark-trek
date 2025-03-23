## Dark Route 电路设计

## 电路约束

**Reveal 电路的输入与输出**

电路输入 in:
- private positions[] ：隐私输入，表示的是的一个路径，一次途径的所有点，$p_0 \rightarrow p_1 \rightarrow \ldots \rightarrow p_{n-1}$ 。
- public commitment ：对路径的承诺，一个 `uint256` 的值。
- public duration: 表示从起始点 $p_0$ 出发经历的时间。
- public pk：产生 commitment 者的公钥。
- public salt ：哈希中的 salt。
- public target_occupied：用来表示是否是自己的星球，如果是的话，达到后无待命消耗；否则有待命消耗。

电路输出 out:
- position_hash：输出经过 duration 时间承诺者所在位置对应的哈希值。
- energy (remaining) ：表示经过 duration 时间消耗的总 energy

电路参数：
- `POINT_NUM`：positions[] 的长度
- `MAP_WIDTH`:  地图的宽度

**电路约束**
1. 由 positions 计算的承诺与输入 commitment 一致
2. positions 表示的路径之间是相连的
3. 输出 position_hash 根据 duration 正确计算
4. energy 是根据 duration/target_occupied 计算出来的

### TODO

- [ ] 扩展实现 VDF slot 方案

### 约束 positions 和 commitment

在电路中根据 positions 计算出一个 commitment，约束其与输入的 commitment 一致。

![](/discussions/dark-route-circuit-commitment.svg)

`positions[i]` 拼接 `pk` 和 `salt` 计算：
- `positions[i]`：64 位
- `pk` ： 160 位
- `salt` ：32 位
拼接后的结果 `concatenate[i] = positions[i]||pk||salt` 为 256 位。

### 约束 positions

private positions[] 表示的是承诺的一个路径，位置坐标，从 A 到 B，一次途径的所有坐标点。

$$
p_0 \rightarrow p_1 \rightarrow \ldots \rightarrow p_{n-1}
$$

需要约束两点之间是相邻的。

### 输出 position_hash

输出的 position_hash 是根据 duration 以及传入的 positions 长度计算得出的。

如果 `duration < len(positions) - 1` ，表明军队还没有到达目的地，输出的是中间路径点上的哈希值 `a[duration]` 。

![](/discussions/dark-route-circuit-position-hash.svg)

如果 `duration >= len(positions) - 1` ，表明军队已经到达目的地，输出最后一个点 $p_{n-1}$ 的哈希值 $a_{n-1}$。

![](/discussions/dark-route-circuit-position-hash2.svg)

### 输出 energy

2种情况：
- duration <= len(positions): energy = duration * 10
- duration > len(positions): len(positions) * 10 + **occupied** ? 0 : (duration - len(positions)) * 1 

下图是输出 energy 的示例。

![](/discussions/dark-route-circuit-route.svg)



## References

Griffin

- Griffin 算法论文：[Horst](https://eprint.iacr.org/2022/403.pdf)

Bloom filter 算法：

- [布隆过滤器BloomFilter基本原理、典型应用及工程实现](https://zhuanlan.zhihu.com/p/559058600)
- zk 实现 bloom filter 代码，arkworks rust 库： [GitHub - Tetration-Lab/arkworks-zk-filter](https://github.com/Tetration-Lab/arkworks-zk-filter/tree/master)
- bloom circom 部分实现：[bloom-circom/circuits/v3\_flag\_propagation/bloom.circom at main · gufett0/bloom-circom · GitHub](https://github.com/gufett0/bloom-circom/blob/main/circuits/v3_flag_propagation/bloom.circom)

Hash:

- circom 实现的 hash 库： [GitHub - bkomuves/hash-circuits: Hashing circuits implemented in circom](https://github.com/bkomuves/hash-circuits)
- circomlib 官方库：[GitHub - iden3/circomlib: Library of basic circuits for circom](https://github.com/iden3/circomlib)
- mimc rust 实现代码：[GitHub - arnaucube/mimc-rs: MiMC hash function](https://github.com/arnaucube/mimc-rs)