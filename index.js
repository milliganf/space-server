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

let tiles = {
  "0, 0": "1234567890123456789012345678901234567890"
}
let assign = {
	"origin": "0, 0"
}

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
