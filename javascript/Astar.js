

"use strict"

const DOM = {
   mouseX: document.querySelector(".coordinates .mouseX"),
   mouseY: document.querySelector(".coordinates .mouseY"),
   cellX: document.querySelector(".coordinates .cellX"),
   cellY: document.querySelector(".coordinates .cellY"),
}

const OldGrid = {

   cellSize: 100,
   collums: 6,
   rows: 4,
}

let cellsArray = [];
let wallsArray = [];


const isEuclidean = false;

const canvas = document.querySelector(".canvas-1");
const unitCtx = canvas.getContext("2d");
const unitGrid = new Grid(unitCtx, 500, 300, 100, isEuclidean);

const agent = new Agent(unitCtx, {x: 50, y: 50}, {x: 50, y: 50}, isEuclidean);

canvas.width = unitGrid.width;
canvas.height = unitGrid.height;

const clearCanvas = () => {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const setOldGrid = () => {

   for(let i = 0; i < OldGrid.collums; i++) {
      for(let j = 0; j < OldGrid.rows; j++) {
         
         cellsArray.push([i, j]);
      }
   }
}

const drawOldGrid = () => {

   ctx.strokeStyle = "black";
   ctx.fillStyle = "black";
   ctx.lineWidth = 2;
   ctx.font = "20px Verdana";

   cellsArray.forEach(cell => {

      ctx.strokeRect(
         cell[0] *OldGrid.cellSize,
         cell[1] *OldGrid.cellSize,
         OldGrid.cellSize,
         OldGrid.cellSize
      );

      ctx.fillText(
         `${cell[0]} , ${cell[1]}`,
         cell[0] *OldGrid.cellSize +25,
         cell[1] *OldGrid.cellSize +60
      );
   });
}

const drawTile = (OldGridPos, color) => {

   ctx.strokeStyle = color;
   ctx.lineWidth = 4;

   ctx.strokeRect(
      OldGridPos.x,
      OldGridPos.y,
      OldGrid.cellSize,
      OldGrid.cellSize
   );
}

const drawWalls = () => {

   ctx.fillStyle = "dimgray";
   
   wallsArray.forEach(wall => {
      ctx.fillRect(
         wall[0] *OldGrid.cellSize,
         wall[1] *OldGrid.cellSize,
         OldGrid.cellSize,
         OldGrid.cellSize
      );
   });
}

const getOldGridPosition = (event) => {

   const bounderies = canvas.getBoundingClientRect();

   const mousePos = {
      x: event.clientX -bounderies.left,
      y: event.clientY -bounderies.top,
   }

   return {
      mousePosX: mousePos.x,
      mousePosY: mousePos.y,
      x: mousePos.x - (mousePos.x % OldGrid.cellSize),
      y: mousePos.y - (mousePos.y % OldGrid.cellSize),
   }
}

const mouseHandler = () => {

   canvas.addEventListener("mousemove", (event) => {
      const OldGridPos = getOldGridPosition(event);

      DOM.mouseX.textContent = `x : ${OldGridPos.mousePosX}`;
      DOM.mouseY.textContent = `y : ${OldGridPos.mousePosY}`;
      DOM.cellX.textContent = `x : ${OldGridPos.x}`;
      DOM.cellY.textContent = `y : ${OldGridPos.y}`;
      
      clearCanvas();
      drawOldGrid();
      drawWalls();
      drawTile(OldGridPos, "blue");
   });
   
   canvas.addEventListener("mousedown", (event) => {
      const OldGridPos = getOldGridPosition(event);

      if(event.which === 1) drawTile(OldGridPos, "red");
      if(event.which === 3) {

         const newWall = [
            OldGridPos.x /OldGrid.cellSize,
            OldGridPos.y /OldGrid.cellSize
         ];

         const wallIndex = wallsArray.findIndex(wall => wall[0] === newWall[0] && wall[1] === newWall[1]);

         if(wallIndex === -1) wallsArray.push(newWall);
         else wallsArray.splice(wallIndex, 1);

         drawWalls();
      }
   });

   canvas.addEventListener("mouseup", (event) => {
      const OldGridPos = getOldGridPosition(event);

      if(event.which === 1) drawTile(OldGridPos, "blue");
   });
}

document.body.oncontextmenu = (event) => {
   event.preventDefault();
   event.stopPropagation();
}

window.addEventListener("load", () => {

   // setOldGrid();
   // drawOldGrid();
   // mouseHandler();  
   
   agent.drawHitbox(80);
   unitGrid.init(isEuclidean);

});