

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

let showWallCol = false;
// let showWallCol = true;


const gridHeight = 800;
const gridWidth = 1200;
const cellSize = 80;

const canvas = document.querySelector(".canvas-1");
const ctx = canvas.getContext("2d");
const grid = new Grid(gridWidth, gridHeight, cellSize);

canvas.width = grid.width;
canvas.height = grid.height;

let startCell;
let endCell;
let startCell_Color = "yellow";
let endCell_Color = "red";

let cellPos;
let agent;

let startWall;
let isDrawingWalls = false;
let tempWallsIDArray = [];


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
      id: cellID,
      x: cellPos.x,
      y: cellPos.y,
      centerX: cellPos.x +grid.cellSize /2,
      centerY: cellPos.y +grid.cellSize /2,
      mouseX: mousePos.x,
      mouseY: mousePos.y,
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

const startEndPos = (cell) => {

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

const drawEraseWall = (cell) => {

   if(!isDrawingWalls && !cell.isBlocked) {

      isDrawingWalls = true;
      cell.isBlocked = true;
      cell.drawWall(ctx, false);
      startWall = cell;
   }
   
   else {
      isDrawingWalls = false;
      cell.isBlocked = false;
      clearClickedCell(cellPos);
   }

   drawCellInfo(cell);
}

// Mouse Hover
const drawTempWalls = (cell) => {

   let isDiamond = true;

   const raycast = {

      startX: startWall.center.x,
      startY: startWall.center.y,
      endX: cellPos.centerX,
      endY: cellPos.centerY,
   }

   // If raycast collide cell ==> Draw tempory wall
   if(cell.line_toSquare(raycast, isDiamond)
   && !cell.isBlocked
   && cell !== startWall) {
      
      tempWallsIDArray.push(cell.id);
      cell.drawWall(ctx, true);
      cell.drawWallCollider(ctx, isDiamond, showWallCol);
   }
}

// Mouse Click
const drawBuiltWalls = (cell) => {

   tempWallsIDArray.forEach(id => {
      let tempCell = grid.cellsList[id];

      tempCell.isBlocked = true;
      tempCell.drawWall(ctx, false);
      drawCellInfo(tempCell);
   });

   startWall.drawPathWall(ctx, cellPos);
   startWall = cell;
}


// ================================================================================================
// Game Handler
// ================================================================================================
const Game_Handler = () => {

   // ===================================
   // Mouse Hover
   // ===================================
   canvas.addEventListener("mousemove", (event) => {

      if(!agent || !agent.isSearching) {

         cellPos = getCellPosition(event);
         setDOM(cellPos);      
         clearCanvas();
         tempWallsIDArray = [];
   
         if(startCell) startCell.drawStartEnd(ctx, startCell_Color);
         if(endCell) endCell.drawStartEnd(ctx, endCell_Color);
         if(agent) agent.displayPath(ctx);
   
         cycleCells((cell) => {
            if(cell.isBlocked) cell.drawWall(ctx, false);
            if(isDrawingWalls) drawTempWalls(cell);
   
            drawCellInfo(cell);
            cell.drawHover(ctx, cellPos, "blue");
         });
   
         if(isDrawingWalls) startWall.drawPathWall(ctx, cellPos);
      }
   });
   

   // ===================================
   // Mouse Click
   // ===================================
   canvas.addEventListener("mousedown", (event) => {
      
      if(!agent || !agent.isSearching) {
         cycleCells((cell) => {

            if(cell.id === cellPos.id) {

               // Left click
               if(event.which === 1) {

                  if(isDrawingWalls) drawBuiltWalls(cell);
                  else startEndPos(cell);
               }
               
               
               // Right click
               if(event.which === 3) {

                  drawEraseWall(cell);
               }
            }
         });
      }
   });


   // Search Path
   window.addEventListener("keydown", (event) => {
      
      if(event.key === "Enter") {
         
         if(startCell && endCell) {

            clearCanvas();

            startCell.drawStartEnd(ctx, startCell_Color);
            endCell.drawStartEnd(ctx, endCell_Color);
      
            cycleCells((cell) => {
               if(cell.isBlocked) cell.drawWall(ctx, false);
               drawCellInfo(cell);
            });

            let showPath = true;
            let showData = false;

            agent = new Agent(startCell, endCell, isEuclidean, showPath, showData);
   
            agent.searchPath();
            agent.displayPath(ctx);
         }

         else console.log("No path to calculate !"); // ******************************************************
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
   
   Game_Handler();  
   grid.init(isEuclidean);
   cycleCells((cell) => drawCellInfo(cell));
});