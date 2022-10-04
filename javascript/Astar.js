

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

let gridPos;
let startCell;
let endCell;
let agent;
let startCell_Color = "yellow";
let endCell_Color = "red";

const gridHeight = 800;
const gridWidth = 1200;
const cellSize = 80;

const canvas = document.querySelector(".canvas-1");
const ctx = canvas.getContext("2d");
const grid = new Grid(ctx, gridWidth, gridHeight, cellSize, isEuclidean);

canvas.width = grid.width;
canvas.height = grid.height;


const clearCanvas = () => {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const getgridPosition = (event) => {

   const bounderies = canvas.getBoundingClientRect();

   const mousePos = {
      x: event.clientX -bounderies.left,
      y: event.clientY -bounderies.top,
   }

   return {
      mousePosX: mousePos.x,
      mousePosY: mousePos.y,
      x: mousePos.x - (mousePos.x % grid.cellSize),
      y: mousePos.y - (mousePos.y % grid.cellSize),
   }
}

const cycleGrid = (callback) => {

   for(let i in grid.cellsList) {
      let cell = grid.cellsList[i];

      callback(cell);
   }
}


const gameHandler = () => {

   canvas.addEventListener("mousemove", (event) => {
      gridPos = getgridPosition(event);

      DOM.mouseX.textContent = `x : ${gridPos.mousePosX}`;
      DOM.mouseY.textContent = `y : ${gridPos.mousePosY}`;
      DOM.cellX.textContent = `x : ${gridPos.x}`;
      DOM.cellY.textContent = `y : ${gridPos.y}`;
      
      clearCanvas();
      
      if(startCell) startCell.drawStartEnd(ctx, startCell_Color);
      if(endCell) endCell.drawStartEnd(ctx, endCell_Color);
      if(agent) agent.displayPath(ctx);

      cycleGrid((cell) => {
         let mouseCellID = `${gridPos.x /cell.size}-${gridPos.y /cell.size}`;

         if(cell.id === mouseCellID) DOM.cellID.textContent = `id : ${cell.id}`;
         if(cell.isBlocked) cell.drawWall(ctx, { x: cell.i * cell.size, y: cell.j * cell.size });

         cell.drawFrame(ctx);
         cell.drawCenter(ctx);
         cell.drawTile(ctx, gridPos, "blue");
      });
   });
   
   canvas.addEventListener("mousedown", (event) => {
      gridPos = getgridPosition(event);

      cycleGrid((cell) => {
         let mouseCellID = `${gridPos.x /cell.size}-${gridPos.y /cell.size}`;

         if(cell.id === mouseCellID) {

            // Mouse left click
            if(event.which === 1) {
               
               if(!startCell) {

                  startCell = cell;
                  cell.drawStartEnd(ctx, startCell_Color);
                  cell.drawFrame(ctx);
                  cell.drawCenter(ctx);
               }
      
               else if(!endCell) {

                  endCell = cell;
                  cell.drawStartEnd(ctx, endCell_Color);
                  cell.drawFrame(ctx);
                  cell.drawCenter(ctx);
               }

               else if(endCell) endCell = undefined;
            }
            
            // Mouse right click
            if(event.which === 3) {
   
               if(!cell.isBlocked) cell.isBlocked = true;
               else cell.isBlocked = false;
   
               cell.drawWall(ctx, gridPos);
               cell.drawFrame(ctx);
               cell.drawCenter(ctx);
            }
         }
      });
   });

   window.addEventListener("keydown", (event) => {
      
      if(event.key === "Enter") {
         
         let isUnit = true;
         agent = new Agent(startCell, endCell, isEuclidean, isUnit);

         agent.searchPath();
         agent.showPath = true;
         // agent.showData = true;
         agent.displayPath(ctx);
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
   grid.init(ctx);
});