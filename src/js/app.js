App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  contractAddress: 0x0,
  BookingArtifact: null,

  init: function() {
    // Load property details
    $.getJSON('../property.json', function(data) {
      var propertiesRow = $('#propertiesRow');
      var propertyTemplate = $('#propertyTemplate');

      for (i = 0; i < data.length; i ++) {
        propertyTemplate.find('.panel-title').text(data[i].name);
        propertyTemplate.find('img').attr('src', data[i].picture);
        propertyTemplate.find('.property-type').text(data[i].type);
        propertyTemplate.find('.property-capacity').text(data[i].sleeps);
        propertyTemplate.find('.property-location').text(data[i].location);
        propertyTemplate.find('.btn-book').attr('data-id', data[i].id);
        propertyTemplate.find('.property-rate').text(data[i].rate);
        //set the rate as an attribute of the booking button as well:
        propertyTemplate.find('.btn-book').attr('data-value', data[i].rate);
        console.log(data[i].id);


        propertiesRow.append(propertyTemplate.html());
      }
    });
    return App.connectToMetamask();
  },

  connectToMetamask: function(){
    const ethereumButton = document.querySelector('.enableEthereumButton');
    console.log(ethereumButton);
    ethereumButton.addEventListener('click', () => {
      App.getAccount();
    });
  },

  getAccount: async function() {
    console.log("getaccount");
    accounts = ethereum.request({ method: 'eth_requestAccounts' });
    return App.initWeb3();
  },

  //Get current account info and display in header
  displayAccountInfo: function() {
    //console.log(err);
    console.log("HERE1");
    web3.eth.getCoinbase(function(err, account) {
      console.log(err);
      if(err === null) {
        console.log("HERE");
        console.log(ethereum.selectedAddress);
        //App.account = account;
        App.account = ethereum.selectedAddress;
        $('#account').text("Current Account: " + ethereum.selectedAddress);
        web3.eth.getBalance(ethereum.selectedAddress, function(err, balance) {
          console.log(err);
          if(err === null) {
            $('#accountBalance').text("Current Balance: " + web3.fromWei(balance, "ether") + " ETH");
          }
        })
      }
    });
  },

  initWeb3: function() {
    //is there an injected web3 instance?
    //console.log(typeof web3);
    if(typeof web3 === 'undefined'){
      //console.log("IS");
      App.web3Provider = web3.currentProvider;
      console.log(App.web3Provider);
    } else {
      console.log("local");
      //if no injected web3 instance is detected, use Ganache
      App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
    }
    console.log(App.web3Provider);
    web3 = new Web3(App.web3Provider);
    App.displayAccountInfo();
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Booking.json', function(data){
      //Get the necessary contract artifact file and instantiate it
      BookingArtifact = data;
      App.contracts.Booking = TruffleContract(BookingArtifact);
      //const contract = require("@truffle/contract");
      console.log(BookingArtifact.abi);
      console.log(App.contracts.Booking);
      console.log(App.contracts);

      //Set the provider for our contract
      console.log(App.web3Provider);
      App.contracts.Booking.setProvider(App.web3Provider);

      //Identify the properties that have already been booked
      return App.markBooked();
      //return App.bindEvents();

    });

    return App.bindEvents();
    //return App.markBooked();
  },

  bindEvents: function() {
    console.log("click");
    $(document).on('click', '.btn-book', App.handleBook);
    console.log(document);
  },

  metamaskTrans: async function(rate, propertyId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

    let subContract = new ethers.Contract(contractAddress,BookingArtifact.abi,signer);
    console.log(subContract);
    console.log(web3.fromWei(rate, 'ether'));
    rate = web3.fromWei(rate, 'ether')
    let tx = await subContract.book(propertyId, {from: App.account, value: web3.toWei(rate, 'ether')});
    return tx;
  },

  markBooked: function() {
    var bookingInstance;
    App.contracts.Booking.deployed().then(function(instance){
      console.log(instance.address);
      bookingInstance = instance;
      return bookingInstance.getBookings();
    }).then(function(bookings){
      console.log(bookings);
      console.log("PROG");
      for(i = 0; i < bookings.length; i++){
        //console.log(bookings[i]);
        //console.log(App.account);
        if(bookings[i] == App.account){
          console.log("!");
          //if a booking was booked by the current account, change the button to "BOOKED" and disable it
          $('.panel-property').eq(i).find('button').text('BOOKED').attr('disabled', true).addClass('btn-success');
        }else if(bookings[i] !== '0x0000000000000000000000000000000000000000'){
          //if a booking is found from another booker, disable its booking buttona and change text to "UNAVAILABLE"
          $('.panel-property').eq(i).find('button').text('UNAVAILABLE').attr('disabled', true);
        }
      }
    }).catch(function(err){
      console.log(err.message);
    });

  },

  handleBook: function(event) {
    event.preventDefault();

    var propertyId = parseInt($(event.target).data('id'));
    console.log(event);
    console.log(propertyId);
    var bookingInstance;
    //pull rate out of button value
    var _rate = parseFloat($(event.target).data('value'));
    contractAddress = App.contracts.Booking.address; //GET CONTRACT ADDRESS
    console.log(contractAddress);

    web3.eth.getAccounts(function(error, accounts){
      if(error){
        console.log(error);
      }
      console.log(accounts);})
      App.contracts.Booking.deployed().then(function(instance){
        bookingInstance = instance;
        console.log(bookingInstance);
        console.log(web3.toWei(_rate, "ether"));
        var Y = App.metamaskTrans(web3.toWei(_rate, "ether"),propertyId,bookingInstance);
        console.log(Y);
        return Y
        // .then(function(result){
        //   console.log("CHECK");
        //   console.log(result);
        // //Execute book() - note, since it is a transaction we must send the from address and the value
        // return bookingInstance.book(propertyId, {from: App.account, value: web3.toWei(_rate, "ether"), gas: 500000})
       .then(function(result){
        web3.eth.getBalance(ethereum.selectedAddress, function(err, balance) {
          console.log(err);
          if(err === null) {
            $('#accountBalance').text("Current Balance: " + web3.fromWei(balance, "ether") + " ETH");
          }
        })
        console.log(result);
        let x = bookingInstance.getBookings();
        console.log(x);
        return App.markBooked()
        .catch(function(err){
        console.log(err.message);
      }); //catch
    }); //getbalance
//  }); // to book
}); // handle book
}
} 

$(function() {
  $(window).load(function() {
    App.init();
  });
});