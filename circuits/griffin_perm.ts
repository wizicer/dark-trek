// Griffin permutation implementation in TypeScript

// S-box related functions
function pow5(inp: bigint): bigint {
  const x2 = fieldMulMod(inp, inp);
  // inp * inp;
  const x4 = fieldMulMod(x2, x2);
  return fieldMulMod(inp, x4);
}

const P_bn128 = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
const P128 = 21888242871839275222246405745257275088696311157297823662689037894645226208583n;
const P128_Inv5 = 0x1d08fbde871dc67f6e96903a4db401d1c14da6573eaaacbb24138740e84afe5en;

// Finite field multiplication
function fieldMulMod(a: bigint, b: bigint, p: bigint = P_bn128): bigint {
    // Ensure inputs are non-negative and within field
    a = ((a % p) + p) % p;
    b = ((b % p) + p) % p;
    
    // Perform multiplication and modulo
    return (a * b) % p;
}

function fieldMul(a: bigint, b: bigint, p: bigint = P_bn128): bigint {
    return (a * b) % p;
}

// Ensure input is within the finite field Fp
function ensureInField(x: bigint, p: bigint = P_bn128): bigint {
    // Handle negative numbers and ensure value is within field
    return ((x % p) + p) % p;
}

// Finite field exponentiation
function fieldPow(base: bigint, exponent: bigint, p: bigint = P_bn128): bigint {
    // Handle special cases
    if (exponent === 0n) return 1n;
    if (base === 0n) return 0n;
    
    // Ensure base is within field
    base = ((base % p) + p) % p;
    
    // Handle negative exponents
    if (exponent < 0n) {
        throw new Error("Negative exponents not supported");
    }

    let result = 1n;
    let currentBase = base;

    // Square-and-multiply algorithm
    while (exponent > 0n) {
        if (exponent & 1n) {
            result = fieldMulMod(result, currentBase, p);
        }
        currentBase = fieldMulMod(currentBase, currentBase, p);
        exponent >>= 1n;
    }

    return result;
}

function pow(base: bigint, n: bigint) {
    n = BigInt(n);
    let current_pow = BigInt(base);
    let res = 1n;
    while (n > 0n) {
      if (n % 2n !== 0n) {
        // res = field.mul(res, current_pow);
        res = fieldMulMod(res, current_pow);
      }
      n = n / 2n;
      // current_pow = field.mul(current_pow, current_pow);
      current_pow = fieldMulMod(current_pow, current_pow);
    }
  
    return res;
  }

function powInv5(inp: bigint): bigint {
  const d_inv = 0x26b6a528b427b35493736af8679aad17535cb9d394945a0dcfe7f7a98ccccccdn;

  // Using modular exponentiation for large numbers
  console.log("x", inp);

  const inp_mod = ensureInField(inp);
  // inp ** d_inv;
  let result = fieldPow(inp_mod, d_inv);
  console.log("result", result);

  // Verify the result
  const check = pow5(result);
  console.log("check", check);

  console.log("check_mod_p128", check % P128);

  if (check !== inp_mod) {
    throw new Error("Invalid powInv5 result");
  }
  

  console.log("ok!");
  return result;

}

function horst(inp: bigint, y0: bigint, y1: bigint): bigint {
  const alpha = 0x146ecffb34a66316fae66609f78d1310bc14ad7208082ca7943afebb1da4aa4an;
  const beta = 0x2b568115d544c7e941eff6ccc935384619b0fb7d2c5ba6c078c34cf81697ee1cn;

  const u = y0 + y1;
  const u2 = u * u;
  const mult = u2 + alpha * u + beta;
  
  return inp * mult;
}

function sBox(inp: bigint[]): bigint[] {
  const out: bigint[] = new Array(3);
  
  out[0] = powInv5(inp[0]);
  out[1] = pow5(inp[1]);
  out[2] = horst(inp[2], out[0], out[1]);

  return out;
}

function addRC(inp: bigint[], round: number): bigint[] {
  const roundConsts = [
    0n, 0n, 0n,
    0x2fb30cafdb1f76156dfabf0cd0af4b895e764ac2a84386c9d0d7aed6a7f4eac9n,
    0x282927892ce324572f19abb14871d2b539a80d8a5800cdb87a81e1697a94b6c9n,
    0x03d0f3f2711dd59e3d97fc797261300cd3fee33b95cf710a32edf42aa2bc0905n,
    0x036a8b3eb9ef35c74ea5a367ed279ee6d043d4ff69817f192c7251b91dcbb03dn,
    0x2a626d396e7fa8ce8d6339bb37bd48491d56db0c7ac0afb5008a7464d5776a26n,
    0x0cc9dfabbeaef7982543453ea3ac37ef2bfefd35a7e7070aa39b021035852d5bn,
    0x2a1951149e2568ab28e972a2ceddc49eff0cae8e1cddcf4b0684a73a1b4ef61bn,
    0x2d0ff8e9158b2fd7ae3afe01cf09d4ce9ff81e6127e441eb6cbc79d21f22be9en,
    0x1cc315b7ea0c1efb538f0c3248a7da062309a9e41af5a555c9ea9e8a10930cb5n
    , 0x03cb10093ea62fb3f6e5680a128d07112ee566f1b424558f2ec9d86892e13a80n
    , 0x12e7bb50ae7e9e90f1765c073eb61c4be4956c424930233ce497d2722a458868n
    , 0x006b1367547937ae71e2e9b55d2f90c90131f9e6784ce3de0eb314ec748871e7n
    , 0x1ffff572c53442c58809aeca02287839b11df1420deb0e99fde2baad8b86fa9cn
    , 0x13aefd685e7739f9a8b4ccdbfc5ef9e566149af4d54d6b746058ea44cb422840n
    , 0x1ea6c3ea93fe6f4ed0186941650de76ff94ab0e6e8a583996b67ba026dd2b7a5n
    , 0x288f120288f9225643de833c5c15e22aadd358132bbdc12c75109048a158c9f4n
    , 0x0f638114cd7c781ab299e5233338b00cf2996df962347a00146a22103d9ad91an
    , 0x14eeca5fa2c18999ea25ddf44237d6ac3cb8757ea452f67e2590a46f7d5b1e4fn
    , 0x102d1a099e8cd107dc056e72370e340b0316d237b72d99ef6261761f7eb2d61cn
    , 0x0ef741fc2fcda50f207c759dbd844a4d630cc0e4062ca80f3ffba2cce2d3f51dn
    , 0x0989b9f642485692a1f91a4b207db64f38ae545bf3e0622f3862967d27f563dbn
    , 0x1eb4d812c80ce04784a80c89fbcc5aab89db274c62602bdd30f3223655e6cf8an
    , 0x0124a9400253731facd46e21f41016aed69a79087f81665bc5d29a34e4e924ddn
    , 0x2520bfa6b70e6ba7ad380aaf9015b71983868a9c53e66e685ed6e48692c185a8n
    , 0x1bd62b5bfa02667ac08d51d9e77bb3ab8dbd19e7a701442a20e23f7d3d6b28b4n
    , 0x1ae2f0d09fffc6bb869ebc639484a7c2084cfa3c1f88a7440713b1b154e5f952n
    , 0x0cd06e16a0d570c3799d800d92a25efbd44a795ed5b9114a28f5f869a57d9ba1n
    , 0x00691740e313922521fe8c4843355eff8de0f93d4f62df0fe48755b897881c39n
    , 0x19903aa449fe9c27ee9c8320e6915b50c2822e61ce894be72b47a449c5705762n
    , 0x126e801aae44016a35deceaa3eba6ccc341fa3c2a65ab3d021fcd39abd170e1bn
    , 0x1b0a98be27b54ac9d5d72b94187c991c1872cb2c7777c0e880f439c133971e8dn
    , 0x1e10a35afda2e5a173d4f3edecf29dacf51d8fac33d6bfb4088cc787ec647605n
    , 0x1793cda85abe2782ea8e911ce92bab59a8c68e0dd561a57b064bb233f109cc57n
  ];

  const out: bigint[] = new Array(3);
  for(let i = 0; i < 3; i++) {
    out[i] = inp[i] + roundConsts[3 * round + i];
  }
  return out;
}

// Linear layer functions
function linearLayer(inp: bigint[]): bigint[] {
//   console.log("inp", inp);

  for(let i = 0; i < inp.length; i++) {
    if (inp[i] == undefined) {
      inp[i] = 0n; 
    }
  }

  const out: bigint[] = new Array(3);
  out[0] = 2n * inp[0] + inp[1] + inp[2];
  out[1] = inp[0] + 2n * inp[1] + inp[2]; 
  out[2] = inp[0] + inp[1] + 2n * inp[2];

  for(let i = 0; i < out.length; i++) {
    out[i] = ensureInField(out[i]);
  }

  return out;
}

// Round function
function roundFun(inp: bigint[], round: number): bigint[] {
  const rc = addRC(inp, round);
  const sboxed = sBox(rc);
  return linearLayer(sboxed);
}

// Main permutation function
export function permutation(inp: bigint[]): bigint[] {
  const aux: bigint[][] = new Array(13);
  aux[0] = linearLayer(inp);

  for(let i = 0; i < 12; i++) {
    aux[i + 1] = roundFun(aux[i], i);
  }

  return aux[12];
}

// Compression function
function compression(inp: bigint[]): bigint {
  const permInput = [inp[0], inp[1], 0n];
  const permOutput = permutation(permInput);
  return permOutput[0];
}

