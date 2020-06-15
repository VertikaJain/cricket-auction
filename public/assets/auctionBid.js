// client side script
let socket = io.connect('http://localhost:3000/bidder');
let uid = document.getElementById('uid');
let playerName = '', basePrice = 0, bidTime = 0, previousPlayerName = '';
let sold = [], unSold = [];

$(document).ready(function () {
  //display complete players list
  socket.on('playerList', function (data) {
    $.each(data, function (index, value) {
      $.each(value, function (key, value1) {
        $("#playerList").append(`${key} : ${value1}; `);
        console.log(key, value1);
      });
      $("#playerList").append(`<br>`);
    });
  });

  //display player names for bidding
  socket.on('playerDetails', function (data) {
    playerName = data.player_name;
    basePrice = data.base_price;
    bidTime = data.bid_time;
    console.log('playerName: ', playerName);
    console.log('basePrice: ', basePrice);
    console.log('bidTime: ', bidTime);
    $('#playerToBid').html(`<p><b>Player To Bid: <br>Name: ${playerName} | Base Price: ${basePrice}</b></p>`);
    let tempTime = bidTime;
    for (let i = 1; i <= bidTime; i++) {
      setTimeout(function () {
        if (tempTime !== 1) {
          $("#timer").html(`<p>Time left is: ${--tempTime} seconds.</p>`);
          $("#send").attr("disabled", false);
        } else {
          $("#timer").html(`<p>Time left is: 0 second. Time-Up!</p>`);
          $("#send").attr("disabled", true);
        }
      }, i * 1000); //player changes after every 30 seconds
    }
  });

  //on loading of page, new user created
  socket.on('newBidder', function (data) {
    $('#bidderId').html(`<p> Your ID is - ${data.id} </p>`);
    $('#uid').val(data.id);
  });

  //on clicking bid button
  $("#send").click(function () {
    if (previousPlayerName !== playerName) {
      $("#bidded").append(`<p>You have bidded for: ${playerName}</p>`);
      previousPlayerName = playerName;
    }
    socket.emit('submitBid', {
      uid: uid.value,
    });
  });

  //display details of sold and unsold players
  socket.on('soldUnsoldBid', function (data) {
    unSold.push(data.unsold_player_name);
    $.each(unSold, function (index, value) {
      $("#unSold").html(`<p>Unsold player: ${value}</p>`);
    });
    sold.push(data.sold_player_name);
    $.each(sold, function (index, value) {
      $("#sold").html(`<p>Sold player: ${value}</p>`);
    });
  });

  socket.on('disableBid', function () {
    $("#send").attr("disabled", true);
  });
  socket.on('enableBid', function () {
    $("#send").attr("disabled", false);
  });
});
