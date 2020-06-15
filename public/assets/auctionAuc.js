//client side script
let socket = io.connect('http://localhost:3000/auctioner');
let playerName = '', basePrice = '';
let randomPlayerArray = [], bidTime = 10, timeOut, stopAuctionFlag = 0;
let bidAmount = 0, existingIds = [], lastBidId = '', previousBidAmount = 0;
let player = [{
  player_name: 'Joey',
  base_price: 100
}, {
  player_name: 'Chandler',
  base_price: 200
}, {
  player_name: 'Ross',
  base_price: 100
}, {
  player_name: 'Monica',
  base_price: 200
}, {
  player_name: 'Rachel',
  base_price: 100
}, {
  player_name: 'Phoebe',
  base_price: 100
}];

socket.emit('sharePlayerList', {
  player: player
});
//sold details
let soldPlayerName = [], unsoldPlayerName = [];
for (let playerData of player) {
  unsoldPlayerName.push(playerData.player_name);
}
$(document).ready(function () {
  myTimer();
  let myVar = setInterval(myTimer, bidTime * 1000);

  function myTimer() {
    let playerArray = Object.keys(player); //0,1,2,...
    let playerIndex = Math.floor(Math.random() * playerArray.length);
    let randomKey = playerArray[playerIndex];
    let index = randomPlayerArray.indexOf(randomKey);
    if (index === -1) { //if player is not found in array
      randomPlayerArray.push(randomKey);
      playerName = player[randomKey].player_name;
      console.log("playerName : ", player[randomKey].player_name);
      basePrice = player[randomKey].base_price;
      console.log("basePrice : ", player[randomKey].base_price);
      previousBidAmount = bidAmount = basePrice;
      existingIds = [];
      socket.emit('sharePlayerDetails', { //sharing bidding player details to bidder
        player_name: playerName,
        base_price: basePrice,
        bid_time: bidTime
      });
      $("#playerDetails").html(`<b>Bid for Player: ${playerName}, at Base Price: ${basePrice}.</b>`);
      let tempTime = bidTime, i = 1;
      for (; i <= bidTime; i++) {  //timer text
        timeOut = setTimeout(function () {
          if (tempTime !== 1) {
            $("#timer").html(`<p>Time left is: ${--tempTime} seconds.</p>`);
          } else {
            $("#timer").html(`<p>Time left is: 0 second. Time-Up!</p>`);
          }
          if (i === bidTime) {
            // socket.emit('disableBidding');
            console.log('Bidding time over for this player.');
          }
        }, i * 1000); //player changes after every 20 seconds
      }
      if ((i > bidTime) && (randomPlayerArray.length === player.length)) {   //end of players for auction
        clearInterval(myVar);
        clearTimeout(timeOut);
        // console.log('Bidding Session Complete for all players.');
      }
    } else { //if player is found in array
      // console.log('Bid round already held for this player.');
      if (randomPlayerArray.length !== player.length) { //if end of player array not reached
        myTimer();
      }
    }
    let auctionTimer;
    if (randomPlayerArray.length === player.length) {   //end of players for auction
      auctionTimer = setTimeout(() => {
        console.log("sending sold unsold details...");
        socket.emit('soldUnsoldDetails', {
          unsold_player_name: unsoldPlayerName,
          sold_player_name: soldPlayerName
        });
        stopAuctionFlag = 1;
        $("#timer").html(`<p>Time left is: 0 second. Time-Up!</p>`);
        console.log('Bidding Session Complete for all players.');
        alert("Auction is complete.");
      }, (bidTime + 1) * 1000);
      if (stopAuctionFlag === 1) {
        clearTimeout(auctionTimer);
        clearInterval(myVar);
      }
    }
  }

//on bidding click event
  socket.on('aucBid', function (data) {
    let current_datetime = new Date();
    let formatted_date = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear() +
      " at " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + " hrs.";

    if (jQuery.inArray(data.uid, existingIds) === -1) { //if uid is not present in existingIds array
      existingIds.push(data.uid);
      lastBidId = data.uid;
      if (bidAmount >= 100 && bidAmount < 200) {
        bidAmount += 10;
      } else if (bidAmount >= 200 && bidAmount < 500) {
        bidAmount += 25;
      } else if (bidAmount >= 500 && bidAmount < 1000) {
        bidAmount += 50;
      } else {
        bidAmount += 100;
      }
      $('#auctionDetails').append(`<p> UserId: ${data.uid} has bidded ₹${bidAmount} for player ${playerName} with baseprice ${basePrice} on ${formatted_date}</p>`);
      if (jQuery.inArray(playerName, soldPlayerName) === -1) {  //if element is not in array
        soldPlayerName.push(playerName);
      }
      unsoldPlayerName = $.grep(unsoldPlayerName, function (value) {
        return value != playerName;
      });
    } else { //if uid is present in existingIds array
      if (data.uid === lastBidId) { //if it has been bid last time
        console.log('user has already bid last time: ', data.uid);
      } else {
        lastBidId = data.uid;
        if (bidAmount >= 100 && bidAmount < 200) {
          bidAmount += 10;
        } else if (bidAmount >= 200 && bidAmount < 500) {
          bidAmount += 25;
        } else if (bidAmount >= 500 && bidAmount < 1000) {
          bidAmount += 50;
        } else {
          bidAmount += 100;
        }
        $('#auctionDetails').append(`<p> UserId: ${data.uid} has bidded ₹${bidAmount} for player ${playerName} with baseprice ${basePrice} on ${formatted_date}</p>`);
        if (jQuery.inArray(playerName, soldPlayerName) === -1) {  //if element is not in array
          soldPlayerName.push(playerName);
        }
        unsoldPlayerName = $.grep(unsoldPlayerName, function (value) {
          return value != playerName;
        });
      }
    }
    console.log('existingIds: ', existingIds);
    console.log('soldPlayerName: ', soldPlayerName);
    console.log('unsoldPlayerName: ', unsoldPlayerName);
  });

  /*$("#startAuction").click(function () { //start auction button
    socket.emit('enableBidding');
  });
  $("#stopAuction").click(function () { // stop auction button
    socket.emit('disableBidding');
  });*/

});
