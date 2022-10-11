

"use strict"

// ================================================================================================
// Set DOM & Contexts
// ================================================================================================
const DOM = {
   cartX:  document.querySelector(".coordinates .cartX"),
   cartY:  document.querySelector(".coordinates .cartY"),
   isoX:   document.querySelector(".coordinates .isoX"),
   isoY:   document.querySelector(".coordinates .isoY"),
   cellX:  document.querySelector(".coordinates .cellX"),
   cellY:  document.querySelector(".coordinates .cellY"),
   cellID: document.querySelector(".coordinates .ID-cell"),
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
   width: 1920,
   height: 927,
}


// ================================================================================================
// Grid Variables
// ================================================================================================
let gridSize = 960;
let cellSize = 120;
let gridHeight = gridSize;
let gridWidth = gridSize;
let cos_45deg = 0.707;

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
let cellPos;
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

const drawTree = () => {

   ctx.units.strokeStyle = "darkviolet";
   ctx.units.lineWidth = 2;
   ctx.units.strokeRect(
      500,
      500,
      100,
      100
   );

   ctx.buildings.drawImage(
      treePicture,
      0, 0, treeImg.size, treeImg.size,
      
      // Destination
      // 600,
      // 200,
      cellPos.cartX -treeImg.offsetX,
      cellPos.cartY -treeImg.offsetY,
      // 200 -treeImg.offsetX,
      // 200 -treeImg.offsetY,
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
   ctx.buildings.clearRect(0, 0, 1920, 927);
   ctx.units.clearRect(0, 0, 1920, 927);
}

const setDOM = (cellPos) => {

   DOM.cartX.textContent = `x : ${cellPos.cartX}`;
   DOM.cartY.textContent = `y : ${cellPos.cartY}`;
   DOM.isoX.textContent =  `x : ${cellPos.isoX}`;
   DOM.isoY.textContent =  `y : ${cellPos.isoY}`;
   DOM.cellX.textContent = `x : ${cellPos.x}`;
   DOM.cellY.textContent = `y : ${cellPos.y}`;
   DOM.cellID.textContent = `id : ${cellPos.id}`;
}

const getCellPosition = (event) => {

   const cartBounderies = canvasObj.units.getBoundingClientRect();
   const isoBounderies = canvasObj.isoSelect.getBoundingClientRect();

   // Cartesian
   const cartMouse = {
      cartX: event.clientX -cartBounderies.left,
      cartY: event.clientY -cartBounderies.top,
      isoX:  event.clientX -isoBounderies.left,
      isoY:  event.clientY -isoBounderies.top,
   }

   // Isometric
   const isoMouse = {
      x:  Math.floor( ((cartMouse.isoX -cartMouse.isoY *2) /cos_45deg) /2 ) +gridWidth /2,
      y:  Math.floor( ((cartMouse.isoX +cartMouse.isoY *2) /2) /cos_45deg ) -gridWidth /2,

      // to_CartX:  Math.floor( ((cartMouse.isoY /2 +cartMouse.isoX) *cos_45deg) *2 ) -gridWidth *2,
      // to_CartY:  Math.floor( ((cartMouse.isoY /2 -cartMouse.isoX) *2) *cos_45deg ) +gridWidth *2,

      to_CartX:  Math.floor( ((cartMouse.isoY /2 +cartMouse.isoX) /cos_45deg) /2 ) -gridWidth /2,
      to_CartY:  Math.floor( ((cartMouse.isoY /2 -cartMouse.isoX) *2) /cos_45deg ) +gridWidth /2,
   }

   // Cell Position
   const cellPos = {
      x: isoMouse.x - (isoMouse.x % cellSize),
      y: isoMouse.y - (isoMouse.y % cellSize),
   }

   const cartCellPos = {
      x: cartMouse.cartX - (cartMouse.cartX % cellSize),
      y: cartMouse.cartY - (cartMouse.cartY % cellSize),
   }

   return {
      id: `${cellPos.x /cellSize}-${cellPos.y /cellSize}`,
      x: cellPos.x,
      y: cellPos.y,

      cellCartX: cartCellPos.x,
      cellCartY: cartCellPos.y,

      isoX: isoMouse.x,
      isoY: isoMouse.y,

      cartX: cartMouse.cartX,
      cartY: cartMouse.cartY,
      
      // cartX: isoMouse.to_CartX,
      // cartY: isoMouse.to_CartY,

      centerX: cellPos.x +cellSize /2,
      centerY: cellPos.y +cellSize /2,
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
      if(endCell && cellPos.id === endCell.id) endCell = undefined;
      if(startCell && cellPos.id === startCell.id) startCell = undefined;
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
      ctx.isoSelect.clearRect(cellPos.x, cellPos.y, cellSize, cellSize);
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
      endX: cellPos.centerX,
      endY: cellPos.centerY,
   }

   // If raycast collide cell ==> Draw tempory wall
   if(cell.line_toSquare(raycast, isDiamond)
   && !cell.isBlocked
   && cell !== startWall) {
      
      tempWallsIDArray.push(cell.id);
      cell.drawWall(ctx.isoSelect, true);
      cell.drawWallCollider(ctx.isoSelect, isDiamond, DebugVar.showWallCol);
   }
}

const drawBuiltWalls = (cell) => {

   tempWallsIDArray.forEach(id => {
      let tempCell = grid.cellsList[id];

      tempCell.isBlocked = true;
      tempCell.drawWall(ctx.isoSelect, false);
      drawCellInfo(tempCell);
   });

   startWall.drawPathWall(ctx.isoSelect, cellPos);
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
      
      cellPos = getCellPosition(event);
      setDOM(cellPos);
      tempWallsIDArray = [];

      cycleCells((cell) => {
         if(cell.isBlocked) cell.drawWall(ctx.isoSelect, false);
         if(isDrawingWalls) drawTempWalls(cell);
         cell.drawHover(ctx.isoSelect, cellPos, "blue");
      });


      drawTree();


      if(startCell) startCell.drawStartEnd(ctx.isoSelect, startCell_Color);
      if(endCell) endCell.drawStartEnd(ctx.isoSelect, endCell_Color);
      if(agent) agent.displayPath(ctx.isoSelect);
      if(isDrawingWalls) startWall.drawPathWall(ctx.isoSelect, cellPos);
   });
   

   // ===================================
   // Mouse Click
   // ===================================
   canvasObj.units.addEventListener("mousedown", (event) => {
      
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
            agent.showData = false;
            agent.displayPath(ctx.isoSelect);
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