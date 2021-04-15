const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "https://space.fuzzius.repl.co",
    methods: ["GET", "POST"]
  }
});

let tiles = {"0, 0":"Welcome to inSpace",
	     "0, 1":"Use this text box to set the text in your selected square.",
	     "0, 2":"Press 'k' to get the key of your selected square.",
	     "1, 0":"Use the arrow keys to move around.",
	     "1, 1":"Each square can only contain a maximum of 100 characters.",
	     "1, 2":"If someone already got the key of a square, you cannot get it with 'k'.",
	     "2, 0":"Use the wasd keys to move your selection box, or just click on squares to select them.",
	     "2, 1":"To get back to a square, you can use its key.",
	     "2, 2":"Press 'l' to use a key, and use the key 'origin' to get back here."}
let assign = {"origin":"0, 0",
	      "9sg91syZRYlBVkK2":"-127, 204",
	      "YRRGL5Xzas-cvoTQ":"117, -177"}

app.get('/', (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.send("Space Server Running");	
});

io.on("connection", (socket) => {
	if(Object.keys(assign).length > 0){
  	io.emit("newAssign", assign)
	}
  socket.on("getTiles", (data) => {
    let { x, y, width, height } = data;
    let map = {};
    for(i=x-width/2; i<x+width/2; i+=1){
      for(j=y-height/2; j<y+height/2; j+=1){
        map[`${i}, ${j}`] = tiles[`${i}, ${j}`] || "";
      }
    }
    io.emit("newTiles", {map, id: socket.id});
  })
  socket.on("writeTile", (data) => {
    write(data.text, data.tile);
  })
  socket.on("assignTile", (data) => {
    assign[data.key] = data.tile;
    io.emit("newAssign", assign)
  })
})

function write(text, tile){
  if(text.length > 100){
    tiles[tile] = text.substring(0, 100);
    let x = parseFloat(tile.split(", ")[0]);
    let y = parseFloat(tile.split(", ")[1]);
    write(text.substring(100), `${x+1}, ${y}`);
  } else{
    tiles[tile] = text;
  }
}

server.listen(80, () => {
  console.log('listening on '+80);
});
