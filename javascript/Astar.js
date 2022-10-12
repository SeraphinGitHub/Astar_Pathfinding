

"use strict"

// ================================================================================================
// Set DOM & Contexts
// ================================================================================================
const DOM = {
   cartX:   document.querySelector(".coordinates .cartX"),
   cartY:   document.querySelector(".coordinates .cartY"),
   isoX:    document.querySelector(".coordinates .isoX"),
   isoY:    document.querySelector(".coordinates .isoY"),
   cellX:   document.querySelector(".coordinates .cellX"),
   cellY:   document.querySelector(".coordinates .cellY"),
   cellID:  document.querySelector(".coordinates .ID-cell"),
};

const canvasObj = {
   terrain:   document.querySelector(".canvas-terrain"),
   isoSelect: document.querySelector(".canvas-isoSelect"),
   buildings: document.querySelector(".canvas-buildings"),
   units:     document.querySelector(".canvas-units"),
};

const ctx = {
   terrain:   canvasObj.terrain.getContext("2d"),
   isoSelect: canvasObj.isoSelect.getContext("2d"),
   buildings: canvasObj.buildings.getContext("2d"),
   units:     canvasObj.units.getContext("2d"),
};

const viewport = {
   x: 0,
   y: 0,
   width: 1920,
   height: 927,
}


// ================================================================================================
// Grid Variables
// ================================================================================================
let gridSize = 1000;
let cellSize = 100;
let gridHeight = gridSize;
let gridWidth = gridSize;

const Cos_45deg = 0.707;
const Cos_30deg = 0.866;

const grid = new Grid(gridWidth, gridHeight, cellSize);

Object.values(canvasObj).forEach(canvas => {

   if(canvas === canvasObj.terrain
   || canvas === canvasObj.isoSelect) {

      canvas.width = gridWidth;
      canvas.height = gridHeight;
   }
   else {
      canvas.width = viewport.width;
      canvas.height = viewport.height;
   }
});


// ================================================================================================
// Project Variables
// ================================================================================================
let startCell;
let endCell;
let startCell_Color = "yellow";
let endCell_Color = "red";
let getCell;
let agent;
let startWall;
let isDrawingWalls = false;
let tempWallsIDArray = [];

const DebugVar = {
   isEuclidean: true,
   showWallCol: false,
   showCellInfo: true,
};

const tileImg = {
   // src: "images/tiles/GroundTiles.png",
   src: "images/tiles/TestTiles.png",
   size: 200,
};


// ========== TEST ==========
const treeImg = {
   src: "images/tiles/tree_0.png",
   size: 186,
   offsetX: 99,
   offsetY: 170,
};

const treePicture = new Image();
treePicture.src = treeImg.src;

let treesList = {};

const addTree = (cell) => {

   if(cell.id !== startCell.id && cell.id !== endCell.id) {
      
      if(!Object.keys(treesList).includes(cell.id) && !cell.isBlocked) {
         treesList[cell.id] = getCell.screen;
      }
      cell.isBlocked = true;
      cell.drawStartEnd(ctx.isoSelect, "darkviolet");
   }
}

const removeTree = (cell) => {
   
   if(Object.keys(treesList).includes(cell.id)) {

      cell.isBlocked = false;
      delete treesList[cell.id];
   }
}

const drawTree = (position) => {

   ctx.buildings.drawImage(
      treePicture,
      0, 0, treeImg.size, treeImg.size,
      
      // Destination
      position.x -treeImg.offsetX,
      position.y -treeImg.offsetY,
      186,
      186
   );
}
// ========== TEST ==========


// ================================================================================================
// Project Functions
// ================================================================================================
const clearCanvas = () => {

   ctx.isoSelect.clearRect(0, 0, gridWidth, gridHeight);
   ctx.buildings.clearRect(0, 0, viewport.width, viewport.height);
   ctx.units.clearRect(    0, 0, viewport.width, viewport.height);
}

const setDOM = (getCell,) => {

   DOM.cartX.textContent =   `x : ${getCell.cartMouse.x}`;
   DOM.cartY.textContent =   `y : ${getCell.cartMouse.y}`;
   DOM.isoX.textContent =    `x : ${getCell.isoMouse.x}`;
   DOM.isoY.textContent =    `y : ${getCell.isoMouse.y}`;
   DOM.cellX.textContent =   `x : ${getCell.position.x}`;
   DOM.cellY.textContent =   `y : ${getCell.position.y}`;
   DOM.cellID.textContent = `id : ${getCell.id}`;
}

// Grid Position
const screenPos_toGridPos = (mousePos) => {

   // Isometric <== Cartesian
   return {
      x:  Math.floor( (mousePos.x -mousePos.y *2) /Cos_45deg /2 ) +gridWidth /2,
      y:  Math.floor( (mousePos.x +mousePos.y *2) /Cos_45deg /2 ) -gridWidth /2,
   };
}

// Screen Position
const gridPos_toScreenPos = (cellPos) => {

   // Cartesian <== Isometric
   let TempX = Math.floor( (cellPos.x + cellPos.y) *Cos_45deg );
   let TempY = Math.floor( (cellPos.y + gridWidth /2) *Cos_45deg *2 -TempX ) /2;

   return {
      x: Math.floor( viewport.width  /2 - Cos_45deg /2 *(gridHeight +gridWidth) +TempX ),
      y: Math.floor( viewport.height /2 - Cos_45deg /4 *(gridHeight +gridWidth) +TempY +Cos_30deg *cellSize /2 ),
   };
}

// Cell Position
const getCellPos = (event) => {
   
   let screenBound = canvasObj.units.getBoundingClientRect();
   let isoGridBound = canvasObj.terrain.getBoundingClientRect();

   const cartMouse = {
      screen: {
         x: event.clientX -screenBound.left,
         y: event.clientY -screenBound.top,
      },

      isoGrid: {
         x: event.clientX -isoGridBound.left,
         y: event.clientY -isoGridBound.top,
      },
   }

   const isoMouse = screenPos_toGridPos(cartMouse.isoGrid);

   const cellPos = {
      x: isoMouse.x - (isoMouse.x % cellSize),
      y: isoMouse.y - (isoMouse.y % cellSize),
   };

   const cellCenter = {
      x: cellPos.x +cellSize /2,
      y: cellPos.y +cellSize /2,
   };

   const screenPos = gridPos_toScreenPos(cellCenter);

   return {
      id: `${cellPos.x /cellSize}-${cellPos.y /cellSize}`,
      cartMouse: cartMouse.screen,
      isoMouse: isoMouse,
      position: cellPos,
      center: cellCenter,
      screen: screenPos,
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
      cell.drawStartEnd(ctx.isoSelect, startCell_Color);
      drawCellInfo(cell);
   }
   
   // Draw EndPos
   else if(!endCell) {
      endCell = cell;
      cell.drawStartEnd(ctx.isoSelect, endCell_Color);
      drawCellInfo(cell);
   }
   
   // Erase StartPos && EndPos
   else {
      if(endCell && getCell.id === endCell.id) endCell = undefined;
      if(startCell && getCell.id === startCell.id) startCell = undefined;
   }
}

const drawEraseWall = (cell) => {

   if(!isDrawingWalls && !cell.isBlocked) {

      isDrawingWalls = true;
      cell.isBlocked = true;
      cell.drawWall(ctx.isoSelect, false);
      startWall = cell;
   }
   
   else {
      isDrawingWalls = false;
      cell.isBlocked = false;
      ctx.isoSelect.clearRect(getCell.position.x, getCell.position.y, cellSize, cellSize);
   }

   drawCellInfo(cell);
}

const drawCellInfo = (cell) => {

   if(DebugVar.showCellInfo) {
      cell.drawFrame(ctx.terrain);
      cell.drawCenter(ctx.terrain);
      cell.drawID(ctx.terrain);
   }
}

const drawTempWalls = (cell) => {

   let isDiamond = true;

   const raycast = {
      startX: startWall.center.x,
      startY: startWall.center.y,
      endX: getCell.center.x,
      endY: getCell.center.y,
   }

   // If raycast collide cell ==> Draw tempory wall
   if(cell.line_toSquare(raycast, isDiamond)
   && !cell.isBlocked
   && cell !== startWall) {
      
      tempWallsIDArray.push(cell.id);
      cell.drawWall(ctx.isoSelect, true);
      cell.drawWallCollider(ctx.isoSelect, isDiamond, DebugVar.showWallCol);

      
      // ========== TEST ==========
      drawTree( gridPos_toScreenPos(cell.center) );
      // ========== TEST ==========
   }
}

const drawBuiltWalls = (cell) => {

   tempWallsIDArray.forEach(id => {
      let tempCell = grid.cellsList[id];

      tempCell.isBlocked = true;
      tempCell.drawWall(ctx.isoSelect, false);
      drawCellInfo(tempCell);

   });

   startWall.drawPathWall(ctx.isoSelect, getCell);
   startWall = cell;
}


// ================================================================================================
// Project Handler
// ================================================================================================
const initProject = () => {

   // ===================================
   // Mouse Hover
   // ===================================
   canvasObj.units.addEventListener("mousemove", (event) => {

      clearCanvas();
      
      getCell = getCellPos(event);
      setDOM(getCell);
      tempWallsIDArray = [];

      cycleCells((cell) => {

         // ========== TEST ==========
         if(cell.isBlocked && !Object.keys(treesList).includes(cell.id)) cell.drawWall(ctx.isoSelect, false);
         else if(Object.keys(treesList).includes(cell.id)) cell.drawStartEnd(ctx.isoSelect, "darkviolet");
         // ========== TEST ==========

         // if(cell.isBlocked) cell.drawWall(ctx.isoSelect, false);
         if(isDrawingWalls) drawTempWalls(cell);
         cell.drawHover(ctx.isoSelect, getCell, "blue");
      });

      if(startCell) startCell.drawStartEnd(ctx.isoSelect, startCell_Color);
      if(endCell) endCell.drawStartEnd(ctx.isoSelect, endCell_Color);
      if(agent) agent.displayPath(ctx.isoSelect);
      if(isDrawingWalls) startWall.drawPathWall(ctx.isoSelect, getCell);


      // ========== TEST ==========
      if(getCell.isoMouse.x > 0
      && getCell.isoMouse.x < gridWidth
      && getCell.isoMouse.y > 0
      && getCell.isoMouse.y < gridHeight) {

         drawTree(getCell.screen);
      }
      for(let i in treesList) drawTree(treesList[i]);
      // ========== TEST ==========
   });
   

   // ===================================
   // Mouse Click
   // ===================================
   canvasObj.units.addEventListener("mousedown", (event) => {
      
      cycleCells((cell) => {

         if(cell.id === getCell.id) {

            // Left click
            if(event.which === 1) {

               if(isDrawingWalls) drawBuiltWalls(cell);
               else startEndPos(cell);
            }


            // Scroll click
            if(event.which === 2) {

               addTree(cell);
            }       

            
            // Right click
            if(event.which === 3) {

               drawEraseWall(cell);
               removeTree(cell);
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
            agent.showData = false;
            agent.displayPath(ctx.isoSelect);
         }

         else console.log("No path  to calculate !"); // ******************************************************
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
   
   initProject();
   grid.init(DebugVar.isEuclidean, ctx.terrain, tileImg);
   // grid.init(DebugVar.isEuclidean, ctx.terrain, isoTileimg);
   
   cycleCells((cell) => {
      cell.drawPicture(ctx.terrain, tileImg);
      drawCellInfo(cell);
   });
});


// sortingLayer(playerList, mobList) {

//    mobList.forEach(mob => {
//       if(this.circle_toCircle(this, mob, 0, 0, mob.radius)) {
         
//          if(this.y > mob.y) this.isCtxPlayer = true;
//          else this.isCtxPlayer = false;
//       }
//    });

//    for(let i in playerList) {
//       let otherPlayer = playerList[i];

//       if(this !== otherPlayer) {
//          if(this.circle_toCircle(this, otherPlayer, 0, 0, otherPlayer.radius)) {
            
//             if(this.y > otherPlayer.y) this.isCtxPlayer = true;
//             else this.isCtxPlayer = false;
//          }
//       }
//    };
// }