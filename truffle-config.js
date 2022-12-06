module.exports = {
  networks:{
    development:{
      host: "127.0.0.1", //localhost
      port: 7545,  //this is the port that ganache uses
      network_id: "*" //match any network id
    }
  },
  compilers: {
    solc: {
      version: "^0.8.0"
    }
  }
};
