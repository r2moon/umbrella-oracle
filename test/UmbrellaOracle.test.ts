import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract, Signer, BigNumber, constants, utils } from 'ethers';
import {
  LeafKeyCoder,
  LeafValueCoder,
  SortedMerkleTree,
} from '@umb-network/toolbox';
import config from './config';
require('dotenv').config();

const REGISTRY_ADDRESS = process.env.REGISTRY;

describe('UmbrellaOracle', () => {
  let accounts: Signer[];
  let umbrellaOracle: Contract;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const UmbrellaOracleFactory = await ethers.getContractFactory(
      'UmbrellaOracle',
    );
    umbrellaOracle = await UmbrellaOracleFactory.deploy(REGISTRY_ADDRESS);
  });

  describe('constructor', () => {
    it('check registry', async () => {
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
