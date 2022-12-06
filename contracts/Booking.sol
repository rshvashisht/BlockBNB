// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <=0.9.0;

contract Booking {
  address[8] public bookings;
  uint256 revenue;
  uint256 capacity;
  uint256 rate;
  string name;
  string propertyType;
  string location;
  address booker;
  address payable receiveValue;

  constructor(){
    receiveValue = payable(msg.sender);
  }

  //book a property by adding the address of the booker to the bookings array
  function book(uint propertyId) payable public returns(address[8] memory){
    require(propertyId >= 0 && propertyId <= 7);
    bookings[propertyId] = msg.sender;

    //pay contract from buyer's account
    receiveValue.transfer(msg.value);
    return bookings;
  }

  //retrieve booking status of all properties
  // function updateAddress(uint propertyId) payable public returns (address[8] memory) {
  //       bookings[propertyId] = msg.sender;
  //       return bookings;
  // }


  //retrieve booking status of all properties
  function getBookings() public view returns (address[8] memory) {
    return bookings;
  }
}
