import '@nomiclabs/hardhat-waffle';
require('dotenv').config();

export default {
  networks: {
    hardhat: {
      forking: {
        url: process.env.ROPSTEN_RPC,
      },
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.5',
      },
    ],
  },
};
