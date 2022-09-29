

"use strict"

const DOM = {
   mouseX: document.querySelector(".coordinates .mouseX"),
   mouseY: document.querySelector(".coordinates .mouseY"),
   cellX: document.querySelector(".coordinates .cellX"),
   cellY: document.querySelector(".coordinates .cellY"),
}

const Grid = {

   cellSize: 100,
   collums: 12,
   rows: 8,
}

let cellsArray = [];
let wallsArray = [];

const canvas = document.querySelector(".canvas-1");
const ctx = canvas.getContext("2d");
canvas.height = Grid.cellSize * Grid.rows;
canvas.width = Grid.cellSize * Grid.collums;


const clearCanvas = () => {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const setGrid = () => {

   for(let i = 0; i < Grid.collums; i++) {
      for(let j = 0; j < Grid.rows; j++) {
         
         cellsArray.push({
            id: `${i}-${j}`,
            x: i,
            y: j,
         });
      }
   }
}

const drawGrid = () => {

   ctx.strokeStyle = "black";
   ctx.fillStyle = "black";
   ctx.lineWidth = 2;
   ctx.font = "20px Verdana";

   cellsArray.forEach(cell => {
      
      ctx.strokeRect(
         cell.x *Grid.cellSize,
         cell.y *Grid.cellSize,
         Grid.cellSize,
         Grid.cellSize
      );

      ctx.fillText(
         `${cell.x +1} , ${cell.y +1}`,
         cell.x *Grid.cellSize +25,
         cell.y *Grid.cellSize +60
      );
   });
}

const drawTile = (gridPos, color) => {

   ctx.strokeStyle = color;
   ctx.lineWidth = 4;

   ctx.strokeRect(
      gridPos.x,
      gridPos.y,
      Grid.cellSize,
      Grid.cellSize
   );
}

const drawWalls = () => {

   ctx.fillStyle = "dimgray";
   
   wallsArray.forEach(wall => {
      ctx.fillRect(
         wall.x,
         wall.y,
         Grid.cellSize,
         Grid.cellSize
      );
   });
}

const getGridPosition = (event) => {

   const bounderies = canvas.getBoundingClientRect();

   const mousePos = {
      x: event.clientX -bounderies.left,
      y: event.clientY -bounderies.top,
   }

   return {
      mousePosX: mousePos.x,
      mousePosY: mousePos.y,
      x: mousePos.x - (mousePos.x % Grid.cellSize),
      y: mousePos.y - (mousePos.y % Grid.cellSize),
   }
}

const mouseHandler = () => {

   canvas.addEventListener("mousemove", (event) => {
      const gridPos = getGridPosition(event);

      DOM.mouseX.textContent = `x : ${gridPos.mousePosX}`;
      DOM.mouseY.textContent = `y : ${gridPos.mousePosY}`;
      DOM.cellX.textContent = `x : ${gridPos.x}`;
      DOM.cellY.textContent = `y : ${gridPos.y}`;
      
      clearCanvas();
      drawGrid();
      drawWalls();
      drawTile(gridPos, "blue");
   });
   
   canvas.addEventListener("mousedown", (event) => {
      const gridPos = getGridPosition(event);

      if(event.which === 1) drawTile(gridPos, "red");
      if(event.which === 3) {

         const newWall = {
            id: `${gridPos.x /Grid.cellSize}-${gridPos.y /Grid.cellSize}`,
            x: gridPos.x,
            y: gridPos.y,
         }

         const index = wallsArray.findIndex(wall => wall.id === newWall.id);

         if(index === -1) wallsArray.push(newWall);
         else wallsArray.splice(index, 1);

         drawWalls();
      }
   });

   canvas.addEventListener("mouseup", (event) => {
      const gridPos = getGridPosition(event);

      if(event.which === 1) drawTile(gridPos, "blue");
   });
}

document.body.oncontextmenu = (event) => {
   event.preventDefault();
   event.stopPropagation();
}

window.addEventListener("load", () => {

   setGrid();
   drawGrid();
   mouseHandler();   
});