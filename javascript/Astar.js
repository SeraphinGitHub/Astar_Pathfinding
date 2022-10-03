

"use strict"

const DOM = {
   mouseX: document.querySelector(".coordinates .mouseX"),
   mouseY: document.querySelector(".coordinates .mouseY"),
   cellX: document.querySelector(".coordinates .cellX"),
   cellY: document.querySelector(".coordinates .cellY"),
   cellID: document.querySelector(".coordinates .ID-cell"),
}

// let isEuclidean = false;
let isEuclidean = true;

let unitGridPos;
let startCell;
let endCell;
let startCell_Color = "blue";
let endCell_Color = "red";

const gridHeight = 800;
const gridWidth = 1200;
const cellSize = 80;

const canvas = document.querySelector(".canvas-1");
const unitCtx = canvas.getContext("2d");
const unitGrid = new Grid(unitCtx, gridWidth, gridHeight, cellSize, isEuclidean);

canvas.width = unitGrid.width;
canvas.height = unitGrid.height;


const clearCanvas = () => {
   unitCtx.clearRect(0, 0, canvas.width, canvas.height);
}

const getunitGridPosition = (event) => {

   const bounderies = canvas.getBoundingClientRect();

   const mousePos = {
      x: event.clientX -bounderies.left,
      y: event.clientY -bounderies.top,
   }

   return {
      mousePosX: mousePos.x,
      mousePosY: mousePos.y,
      x: mousePos.x - (mousePos.x % unitGrid.cellSize),
      y: mousePos.y - (mousePos.y % unitGrid.cellSize),
   }
}

const cycleGrid = (callback) => {

   for(let i in unitGrid.cellsList) {
      let cell = unitGrid.cellsList[i];

      callback(cell);
   }
}

const gameHandler = () => {

   canvas.addEventListener("mousemove", (event) => {
      unitGridPos = getunitGridPosition(event);

      DOM.mouseX.textContent = `x : ${unitGridPos.mousePosX}`;
      DOM.mouseY.textContent = `y : ${unitGridPos.mousePosY}`;
      DOM.cellX.textContent = `x : ${unitGridPos.x}`;
      DOM.cellY.textContent = `y : ${unitGridPos.y}`;
      
      clearCanvas();
      
      for(let i in unitGrid.cellsList) {
         let cell = unitGrid.cellsList[i];
         if(!cell.isWalkable) cell.drawWall({ x: cell.i * cell.size, y: cell.j * cell.size });
      }

      if(startCell) startCell.drawPos(startCell_Color);
      if(endCell) endCell.drawPos(endCell_Color);
      
      cycleGrid((cell) => {
         let mouseCellID = `${unitGridPos.x /cell.size}-${unitGridPos.y /cell.size}`;
         if(cell.id === mouseCellID) DOM.cellID.textContent = `id : ${cell.id}`;

         cell.drawFrame();
         cell.drawCenter();
         cell.drawTile(unitGridPos, "blue");
      });
   });
   
   canvas.addEventListener("mousedown", (event) => {
      unitGridPos = getunitGridPosition(event);

      cycleGrid((cell) => {
         let mouseCellID = `${unitGridPos.x /cell.size}-${unitGridPos.y /cell.size}`;

         if(cell.id === mouseCellID) {

            // Mouse left click
            if(event.which === 1) {
               
               if(!startCell) {

                  startCell = cell;
                  cell.drawPos(startCell_Color);
                  cell.drawFrame();
                  cell.drawCenter();
               }
      
               else if(!endCell) {

                  endCell = cell;
                  cell.drawPos(endCell_Color);
                  cell.drawFrame();
                  cell.drawCenter();
               }

               else if(endCell) endCell = undefined;
            }
            
            // Mouse right click
            if(event.which === 3) {
   
               if(cell.isWalkable) cell.isWalkable = false;
               else cell.isWalkable = true;
   
               cell.drawWall(unitGridPos);
               cell.drawFrame();
               cell.drawCenter();
            }
         }
      });
   });

   window.addEventListener("keydown", (event) => {
      
      if(event.key === "Enter") {
         const agent = new Agent(unitCtx, startCell, endCell, isEuclidean);
         agent.searchPath();
      }

      if(event.key === "Escape") {
         location.reload();
      }
   });
}

document.body.oncontextmenu = (event) => {
   event.preventDefault();
   event.stopPropagation();
}

window.addEventListener("load", () => {
   gameHandler();  
   unitGrid.init();
});