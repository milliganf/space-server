const socket = io("https://space-server.openode.io/");
let id = undefined;
socket.on("connect", () => {
  id = socket.id;
})

const width = Math.min(window.innerWidth-10, window.innerHeight-10);
const height = width;

const eg = new Daim();
eg.createCanvas(width, height)
eg.monitorMouse();
eg.monitorKeyboard();

const brightness = document.createElement("input");
brightness.type = "range";
brightness.min = "0";
brightness.max = "255";
brightness.value = "128";
document.body.appendChild(brightness);

const textInput = document.createElement("textarea");
document.body.appendChild(textInput);

let inc = 0.4;

let tiles = {
}
let assigned = {

}
let chars = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890-_".split("");

let color = [255, 255, 0];

let locX = 0;
let locY = 0;

let selected = "0, 0";
let frames = 0;

eg.draw = (elapsedTime) => {
  frames += 1;
  eg.rect(0, 0, width, height, eg.BLACK, true);
  let size = width/(100*inc);
  if(frames === 10){
    socket.emit("getTiles", {x: locX, y: locY, width: 100*inc, height:100*inc});
    frames = 0;
  }
  Object.keys(tiles).forEach((loc, i) => {
    let tile = tiles[loc];
    let screen = worldToScreen(loc);
    eg.rect(screen[0], screen[1], size+1, size+1, eg.RGB((tile.length/100)*255), true);
  })
  for(let i = 0; i<width; i+=size){
    eg.line(i, 0, i, height, eg.RGB(0, 0, parseInt(brightness.value)));
  }
  for(let i = 0; i<height; i+=size){
    eg.line(0, i, width, i, eg.RGB(0, 0, parseInt(brightness.value)));
  }
  eg.rect(parseInt(eg.mouseX/(size))*size, parseInt(eg.mouseY/(size))*size, size, size, eg.WHITE, false);
  if(selected){
    let screen = worldToScreen(selected);
    eg.rect(screen[0], screen[1], size, size, eg.YELLOW, false);
  }

  if("ontouchstart" in window){
    eg.rect(width-(width/5)-15, height-(height/10)-15, width/5/2, height/20, eg.GRAY, true);
    eg.text("<", width-(width/5)-15, height-(height/10)+(width/5/8), width/5/4, eg.WHITE, true);
    eg.rect(width-(width/5/2)-10, height-(height/10)-15, width/5/2, height/20, eg.GRAY, true);
    eg.text(">", width-(width/5/8)-10, height-(height/10)+(width/5/8), width/5/4, eg.WHITE, true);
    eg.rect(width-(width/5)-10+(width/5/4), height-(height/20)-10, width/5/2, height/20, eg.GRAY, true);
    eg.text("v", width-(width/5)-10+(width/5/2)-(width/5/16), height-10, width/5/4, eg.WHITE, true);
    eg.rect(width-(width/5)-10+(width/5/4), height-(height/10)-(height/20)-20, width/5/2, height/20, eg.GRAY, true);
    eg.text("^", width-(width/5)-10+(width/5/2)-(width/5/16), height-(height/10)-(height/20)-20+(width/5/5), width/5/4, eg.WHITE, true);
  }


  let mouseLoc = screenToWorld(eg.mouseX, eg.mouseY)
  eg.text(mouseLoc, width-(mouseLoc.length*10), 20, 20, eg.WHITE, true);
  if(eg.mousePressed && eg.mouseX >= 0 && eg.mouseX <= width && eg.mouseY >= 0 && eg.mouseY <= height){
    if(!("ontouchstart" in window) || !((eg.mouseY > height-(height/10)-15 && eg.mouseY < height-(height/10)+(height/20)-15 && eg.mouseX > width-(width/5)-15) || (eg.mouseX > width-(width/5)-10+(width/5/4) && eg.mouseX < width-(width/5/2)-10+(width/5/4) && eg.mouseY > height-(height/10)-(height/20)-20))){
      selected = false;
      let worldCoords = screenToWorld(eg.mouseX, eg.mouseY)
      textInput.value = tiles[worldCoords] || "";
      selected = worldCoords;
    }
  }
}

eg.keyPress = (e) => {
  if(textInput !== document.activeElement){
    switch(e.key){
      case "ArrowUp":
        locY -= 1;
        if(selectedOff()){
          selected = false;
          textInput.value = ""
        }
        break;
      case "ArrowDown":
        locY += 1;
        if(selectedOff()){
          selected = false;
          textInput.value = ""
        }
        break;
      case "ArrowLeft":
        locX -= 1;
        if(selectedOff()){
          selected = false;
          textInput.value = ""
        }
        break;
      case "ArrowRight":
        locX += 1;
        if(selectedOff()){
          selected = false;
          textInput.value = ""
        }
        break;
      case "w":
        if(selected){
          let newSelected = `${parseInt(selected.split(", ")[0])}, ${parseInt(selected.split(", ")[1])-1}`
          textInput.value = tiles[newSelected] || "";
          selected = newSelected;
          showSelected();
        } 
        break;
      case "a":
        if(selected){
          let newSelected = `${parseInt(selected.split(", ")[0])-1}, ${parseInt(selected.split(", ")[1])}`
          textInput.value = tiles[newSelected] || "";
          selected = newSelected;
          showSelected();
        } 
        break; 
      case "s":
        if(selected){
          let newSelected = `${parseInt(selected.split(", ")[0])}, ${parseInt(selected.split(", ")[1])+1}`
          textInput.value = tiles[newSelected] || "";
          selected = newSelected;
          showSelected();
        } 
        break; 
      case "d":
        if(selected){
          let newSelected = `${parseInt(selected.split(", ")[0])+1}, ${parseInt(selected.split(", ")[1])}`
          textInput.value = tiles[newSelected] || "";
          selected = newSelected;
          showSelected();
        } 
        break;           
      case "k":
        if(selected){
          if(!Object.values(assigned).includes(selected)){
            let key = "";
            for(let i = 0; i<16; i++){
              key += chars[Math.floor(Math.random()*chars.length)];
            }
            while(Object.keys(assigned).includes(key)){
              key = "";
              for(let i = 0; i<16; i++){
                key += chars[Math.floor(Math.random()*chars.length)];
              }
            }
            assigned[key] = selected;
            socket.emit("assignTile", {tile: selected, key: key});
            alert(`Your key is: ${key}`);
          }
        }
        break;
      case "l":
        let goTo = prompt("What key do you want to go to?");
        if(goTo && assigned[goTo]){
          locX = parseInt(assigned[goTo].split(", ")[0]);
          locY = parseInt(assigned[goTo].split(", ")[1]);
          if(selectedOff()){
            selected = false;
            textInput.value = ""
          }
        }
        break; 
      // case "z":
      //   if(inc > 0.3){inc-=0.02};
      //   break;
      // case "x":
      //   if(inc < 0.4){inc+=0.02}  
      //   break;     
    }
  }
}

textInput.addEventListener("input", (e) => {
  if(selected){
    write(textInput.value, selected);
  }
})

eg.mouseMove = (e) => {
  if("ontouchstart" in window && eg.mouseX >= 0 && eg.mouseX <= width && eg.mouseY >= 0 && eg.mouseY <= height){
    selected = false;
    let worldCoords = screenToWorld(eg.mouseX, eg.mouseY)
    textInput.value = tiles[worldCoords] || "";
    selected = worldCoords;
  }
}

if("ontouchstart" in window){
  eg.mouseDown = (e) => {
    eg.rect(width-(width/5)-10+(width/5/4), height-(height/10)-(height/20)-20, width/5/2, height/20, eg.GRAY, true);
    if(eg.mouseY > height-(height/10)-15 && eg.mouseY < height-(height/10)+(height/20)-15){
      if(eg.mouseX > width-(width/5)-15 && eg.mouseX < width-(width/5/2)-15){
        locX -= 1;
        if(selectedOff()){
          selected = false;
          textInput.value = ""
        }
      } else if(eg.mouseX > width-(width/5/2)-10 && eg.mouseX < width-10){
        locX += 1;
        if(selectedOff()){
          selected = false;
          textInput.value = ""
        }
      }
    } else if(eg.mouseX > width-(width/5)-10+(width/5/4) && eg.mouseX < width-(width/5/2)-10+(width/5/4)){ 
      if(eg.mouseY > height-(height/20)-10 && eg.mouseY < height-10){
        locY += 1;
          if(selectedOff()){
            selected = false;
            textInput.value = ""
          }
      } else if(eg.mouseY > height-(height/10)-(height/20)-20 && eg.mouseY < height-(height/10)-20){
        locY -= 1;
          if(selectedOff()){
            selected = false;
            textInput.value = ""
          }
      }
    }
  }
}

eg.start(17);

// function getTiles(x, y, width, height){
//   socket.emit("getTiles", {x, y, width, height})
//   let map = {};
//   for(i=x-width/2; i<x+width/2; i+=1){
//     for(j=y-height/2; j<y+height/2; j+=1){
//       map[`${i}, ${j}`] = tiles[`${i}, ${j}`] || "";
//     }
//   }
//   return map;
// }

socket.on("newTiles", (data) => {
  if(data.id === id){
    tiles = data.map;
    if(selected && textInput !== document.activeElement){
      textInput.value = tiles[selected] || "";
    }
  }
})

socket.on("newAssign", (data) => {
  assigned = data;
})

function screenToWorld(x, y){
  let factorX = (100*inc)/width;
  let factorY = (100*inc)/height;
  return `${parseInt(parseInt(x*factorX)+(locX-(50*inc)))}, ${parseInt(parseInt(y*factorY)+(locY-(50*inc)))}`
}

function worldToScreen(loc){
  let x = parseFloat(loc.split(", ")[0]);
  let y = parseFloat(loc.split(", ")[1]);
  let factorX = width/(100*inc);
  let factorY = height/(100*inc);
  return [(x-(locX-(50*inc)))*factorX, (y-(locY-(50*inc)))*factorY];
}

function write(text, tile){
  selected = tile;
  showSelected();
  socket.emit("writeTile", {text, tile});
  if(text.length > 100){
    tiles[tile] = text.substring(0, 100);
    let x = parseFloat(tile.split(", ")[0]);
    let y = parseFloat(tile.split(", ")[1]);
    write(text.substring(100), `${x+1}, ${y}`);
  } else{
    tiles[tile] = text;
  }
  textInput.value = tiles[selected];
}

function showSelected(){
  if(selected){
    const x = parseInt(selected.split(", ")[0]);
    const y = parseInt(selected.split(", ")[1]);
    const beginX = locX-(50*inc);
    const beginY = locY-(50*inc);

    if(x < beginX){
      locX = x+(50*inc);
    } else if(x >= beginX+(100*inc)){
      locX = x+1-(50*inc);
    }
    if(y < beginY){
      locY = y+(50*inc);
    } else if(y >= beginY+(100*inc)){
      locY = y+1-(50*inc);
    }
  }
}

function selectedOff(){
  if(selected){
    const x = parseInt(selected.split(", ")[0]);
    const y = parseInt(selected.split(", ")[1]);
    const beginX = locX-(50*inc);
    const beginY = locY-(50*inc);
    if(x < beginX || x >= beginX+(100*inc) || y < beginY || y >= beginY+(100*inc)){
      return true;
    }
  }
  return false;
}


