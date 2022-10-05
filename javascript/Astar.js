

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

let cellPos;
let agent;

let startCell;
let endCell;

let startWall;

let startCell_Color = "yellow";
let endCell_Color = "red";

const gridHeight = 800;
const gridWidth = 1200;
const cellSize = 80;

const canvas = document.querySelector(".canvas-1");
const ctx = canvas.getContext("2d");
const grid = new Grid(gridWidth, gridHeight, cellSize);

canvas.width = grid.width;
canvas.height = grid.height;


const clearCanvas = () => {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const clearClickedCell = (cellPos) => {
   ctx.clearRect(cellPos.x, cellPos.y, grid.cellSize, grid.cellSize);
}

const setDOM = (cellPos) => {

   DOM.mouseX.textContent = `x : ${cellPos.mouseX}`;
   DOM.mouseY.textContent = `y : ${cellPos.mouseY}`;
   DOM.cellX.textContent = `x : ${cellPos.x}`;
   DOM.cellY.textContent = `y : ${cellPos.y}`;
   DOM.cellID.textContent = `id : ${cellPos.id}`;
}

const getCellPosition = (event) => {

   const bounderies = canvas.getBoundingClientRect();

   const mousePos = {
      x: event.clientX -bounderies.left,
      y: event.clientY -bounderies.top,
   }

   const cellPos = {
      x: mousePos.x - (mousePos.x % grid.cellSize),
      y: mousePos.y - (mousePos.y % grid.cellSize),
   }

   let cellID = `${cellPos.x /grid.cellSize}-${cellPos.y /grid.cellSize}`;

   return {
      mouseX: mousePos.x,
      mouseY: mousePos.y,
      centerX: cellPos.x +grid.cellSize /2,
      centerY: cellPos.y +grid.cellSize /2,
      x: cellPos.x,
      y: cellPos.y,
      id: cellID,
   }
}

const cycleCells = (callback) => {

   for(let i in grid.cellsList) {
      let cell = grid.cellsList[i];

      callback(cell);
   }
}

const drawCellInfo = (cell) => {

   cell.drawFrame(ctx);
   cell.drawCenter(ctx);
   cell.drawID(ctx);
}

const gameHandler = () => {

   // ================================================
   // Mouse Hover
   // ================================================
   canvas.addEventListener("mousemove", (event) => {
      
      cellPos = getCellPosition(event);
      setDOM(cellPos);      
      clearCanvas();
      
      if(startCell) startCell.drawStartEnd(ctx, startCell_Color);
      if(endCell) endCell.drawStartEnd(ctx, endCell_Color);
      if(agent) agent.displayPath(ctx);

      cycleCells((cell) => {
         
         const wall = {
            x: cell.i *cell.size,
            y: cell.j *cell.size,
         }

         if(cell.isBlocked) cell.drawWall(ctx, wall, true);

         drawCellInfo(cell);
         cell.drawHover(ctx, cellPos, "blue");
      });

      if(drawingWalls) startWall.drawPathWall(ctx, cellPos);
   });
   
   
   // ================================================
   // Mouse Click
   // ================================================
   canvas.addEventListener("mousedown", (event) => {

      cycleCells((cell) => {
         if(cell.id === cellPos.id) {

            // Left click
            if(event.which === 1) {

               // Draw StartPos
               if(!startCell) {
                  startCell = cell;
                  cell.drawStartEnd(ctx, startCell_Color);
                  drawCellInfo(cell);
               }
               
               // Draw EndPos
               else if(!endCell) {
                  endCell = cell;
                  cell.drawStartEnd(ctx, endCell_Color);
                  drawCellInfo(cell);
               }
               
               // Erase StartPos && EndPos
               else {
                  if(endCell && cellPos.id === endCell.id) endCell = undefined;
                  if(startCell && cellPos.id === startCell.id) startCell = undefined;
               }
            }
            
            
            // Right click
            if(event.which === 3) {
   
               if(!cell.isBlocked) {
                  startWall = cell;
                  cell.isBlocked = true;
                  cell.drawWall(ctx, cellPos, true);
               }
               
               else {
                  cell.isBlocked = false;
                  clearClickedCell(cellPos);
               }

               drawCellInfo(cell);
            }
         }
      });
   });


   // Search Path
   window.addEventListener("keydown", (event) => {
      
      if(event.key === "Enter") {
         agent = new Agent(startCell, endCell, isEuclidean);

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
   grid.init(isEuclidean);
   cycleCells((cell) => drawCellInfo(cell));
});