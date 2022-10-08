

"use strict"

const DOM = {
   mouseX: document.querySelector(".coordinates .mouseX"),
   mouseY: document.querySelector(".coordinates .mouseY"),
   cellX: document.querySelector(".coordinates .cellX"),
   cellY: document.querySelector(".coordinates .cellY"),
   cellID: document.querySelector(".coordinates .ID-cell"),
}

const DebugVar = {
   
   isEuclidean: true,
   // isEuclidean: false,

   // showWallCol: true,
   showWallCol: false,

   showCellInfo: true,
   // showCellInfo: false,
};

const tile_Img = {
   
   // src: "images/tiles/GroundTiles.png",
   src: "images/tiles/TestTiles.png",
   width: 200,
   height: 200,
};


// const gridHeight = 720;
// const gridWidth = 1200;
// const cellSize = 120;

const gridHeight = 800;
const gridWidth = 1400;
const cellSize = 50;

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

   // =============================================
   // Mouse Position
   // =============================================
   const cartesianMouse = {
      x: event.clientX -bounderies.left,
      y: event.clientY -bounderies.top,
   }

   const isometricMouse = {
      x:  Math.floor(cartesianMouse.x -cartesianMouse.y),
      y:  Math.floor((cartesianMouse.x +cartesianMouse.y)) /2,
   }


   // =============================================
   // Cell Position
   // =============================================
   const cartCellPos = {
      x: cartesianMouse.x - (cartesianMouse.x % grid.cellSize),
      y: cartesianMouse.y - (cartesianMouse.y % grid.cellSize),
   }
   
   const isoCellPos = {
      x: Math.floor(isometricMouse.x /grid.cellSize) *grid.cellSize,
      y: Math.floor(isometricMouse.y /grid.cellSize) *grid.cellSize /2,
   }

   let mousePos = cartesianMouse;
   // let mousePos = isometricMouse;

   let cellPos = cartCellPos;
   // let cellPos = isoCellPos;

   let cartCellID = `${cellPos.x /grid.cellSize}-${cellPos.y /grid.cellSize}`;
   let isoCellID = `${cellPos.x}-${cellPos.y}`;

   let cellID = cartCellID;
   // let cellID = isoCellID;

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


// Cell Infos
const drawCellInfo = (cell) => {

   if(DebugVar.showCellInfo) {
      cell.drawFrame(ctx);
      // cell.drawCenter(ctx);
      // cell.drawID(ctx);
   }
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
      cell.drawWallCollider(ctx, isDiamond, DebugVar.showWallCol);
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

      // cellPos = getCellPosition(event);
      // setDOM(cellPos);      
      // clearCanvas();
      // tempWallsIDArray = [];

      // cycleCells((cell) => {
      //    cell.drawPicture(ctx, tile_Img);

      //    if(cell.isBlocked) cell.drawWall(ctx, false);
      //    if(isDrawingWalls) drawTempWalls(cell);

      //    drawCellInfo(cell);
      //    cell.drawHover(ctx, cellPos, "blue");
      // });

      // if(startCell) startCell.drawStartEnd(ctx, startCell_Color);
      // if(endCell) endCell.drawStartEnd(ctx, endCell_Color);
      // if(agent) agent.displayPath(ctx);
      // if(isDrawingWalls) startWall.drawPathWall(ctx, cellPos);
   });
   

   // ===================================
   // Mouse Click
   // ===================================
   canvas.addEventListener("mousedown", (event) => {
      
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
   });


   // Search Path
   window.addEventListener("keydown", (event) => {
      
      if(event.key === "Enter") {
      
         if(startCell && endCell) {
            agent = new Agent(startCell, endCell, DebugVar.isEuclidean);
   
            agent.searchPath();
            agent.showPath = true;
            // agent.showData = true;
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
   grid.init(DebugVar.isEuclidean, ctx, tile_Img);
   cycleCells((cell) => drawCellInfo(cell));
});