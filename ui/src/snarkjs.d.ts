/* eslint-disable @typescript-eslint/no-explicit-any */
interface Window {
  snarkjs?: {
    groth16: {
      fullProve: (
        params: any,
        wasmPath: string,
        zkeyPath: string
      ) => Promise<{ proof: any; publicSignals: any }>;
    };
    exportSolidityCallData: (proof: any, publicSignals: any) => Promise<string>;
  };
}
