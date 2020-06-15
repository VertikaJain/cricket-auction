//backend server (main)
let express = require('express');
let socket = require('socket.io');
const path = require('path');
let app = express();
let port = 3000;
let server = app.listen(port, function () {
  console.log("listening to request on port " + port);
});
// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public'));
app.use(express.static('public'));

let io = socket(server);
app.get('/bidder', function (req, res) {
  res.render('pages/bidder');
});
app.get('/auctioner', function (req, res) {
  res.render('pages/auctioner');
});

let bidderIds = [];
//custom namespace creation
const bidder = io.of('/bidder');
const auctioner = io.of('/auctioner');

bidder.on('connection', function (socket) {
  let socketId = socket.id.substr(socket.id.length - 5);
  bidderIds.push(socketId);
  socket.emit('newBidder', {
    id: socketId
  });
  console.log('bidderIds: ', bidderIds);
  socket.on('submitBid', function (data) {
    console.log('data: ', data);
    auctioner.emit('aucBid', data);
  });
});

//on page load
io.on('connection', function (socket) {
  console.log('Default connection established.');
  socket.on('disconnect', function (user) {
    console.log('A user disconnected.', user);
  });
});

auctioner.on('connection', function (socket) {
  socket.on('sharePlayerDetails', function (data) {
    console.log('sharePlayerDetails data: ', data);
    bidder.emit('playerDetails', data);
  });
  socket.on('sharePlayerList', function (data) {
    bidder.emit('playerList', data.player);
    console.log('playerList details: ', data.player);
  });
  socket.on('soldUnsoldDetails', function (data) {
    bidder.emit('soldUnsoldBid', data);
    console.log('soldUnsold Details: ', data);
  });
  socket.on('disableBidding', function () {
    bidder.emit('disableBid');
    // io.sockets.emit('broadcast', {description: `bidding over.`});
    console.log('Auction stopped by auctioneer.');
  });
  socket.on('enableBidding', function () {
      bidder.emit('enableBid');
      console.log('Auction started by auctioneer.');
  });
});
