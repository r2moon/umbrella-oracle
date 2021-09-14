import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract, Signer, BigNumber, constants, utils } from 'ethers';
import {
  LeafKeyCoder,
  LeafValueCoder,
  SortedMerkleTree,
  APIClient,
  ChainContract,
  ContractRegistry,
} from '@umb-network/toolbox';
import config from './config';
require('dotenv').config();

const { REGISTRY_ADDRESS, UMBRELLA_API_KEY, UMBRELLA_API_BASE_URL } =
  process.env;

describe('UmbrellaOracle', () => {
  let accounts: Signer[];
  let umbrellaOracle: Contract;
  let chainContract: ChainContract;
  let apiClient: APIClient;

  beforeEach(async () => {
    accounts = await ethers.getSigners();

    const contractRegistry = new ContractRegistry(
      accounts[0].provider,
      REGISTRY_ADDRESS,
    );
    const chainContractAddress = await contractRegistry.getAddress('Chain');
    chainContract = new ChainContract(
      accounts[0].provider,
      chainContractAddress,
    );
    apiClient = new APIClient({
      baseURL: UMBRELLA_API_BASE_URL,
      chainContract,
      apiKey: UMBRELLA_API_KEY,
    });

    const UmbrellaOracleFactory = await ethers.getContractFactory(
      'UmbrellaOracle',
    );
    umbrellaOracle = await UmbrellaOracleFactory.deploy(REGISTRY_ADDRESS);
  });

  describe('constructor', () => {
    it('check registry', async () => {
      const proof = await apiClient.getProofs(['ETH-USD']);
      console.log(proof);
      const verificationResult = await apiClient.verifyProofForNewestBlock(
        'ETH-USD',
      );

      console.log(verificationResult);
      expect(await umbrellaOracle.registry()).to.equal(REGISTRY_ADDRESS);
    });
  });

  describe('check price', () => {
    beforeEach(async () => {
      for (const key of config) {
        await umbrellaOracle.registerKey(
          key.token,
          LeafKeyCoder.encode(key.key),
        );
        console.log(LeafKeyCoder.encode(key.key).toString('hex'));
      }
    });

    it('getTokensOwed', async () => {
      const ethAmount = utils.parseEther('10');
      const uni = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984';
      const uniAmount = await umbrellaOracle.getTokensOwed(ethAmount, uni);
      console.log(uniAmount.toString());

      const wbtc = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
      const wbtcAmount = await umbrellaOracle.getTokensOwed(ethAmount, wbtc);
      console.log(wbtcAmount.toString());
    });

    it('getEthOwed', async () => {
      const tokenAmount = utils.parseEther('10');
      const uni = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984';
      const uniAmount = await umbrellaOracle.getEthOwed(tokenAmount, uni);
      console.log(uniAmount.toString());

      const wbtc = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
      const wbtcAmount = await umbrellaOracle.getEthOwed(tokenAmount, wbtc);
      console.log(wbtcAmount.toString());
    });
  });
});
