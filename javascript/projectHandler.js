

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

const Viewport = {
   x: 0,
   y: 0,
   width: 1920,
   height: 927,
}


// ================================================================================================
// Grid Variables
// ================================================================================================
let GridSize = 1000;
let CellSize = 100;
let GridHeight = GridSize;
let GridWidth = GridSize;

const Cos_45deg = 0.707;
const Cos_30deg = 0.866;

const Grid = new GridClass(GridWidth, GridHeight, CellSize);

Object.values(canvasObj).forEach(canvas => {

   if(canvas === canvasObj.terrain
   || canvas === canvasObj.isoSelect) {

      canvas.width = GridWidth;
      canvas.height = GridHeight;
   }
   else {
      canvas.width = Viewport.width;
      canvas.height = Viewport.height;
   }
});


// ================================================================================================
// Project Variables
// ================================================================================================
let HoverCell;
let StartCell;
let EndCell;
let GetCell;
let Agent;
let StartWall;
let IsDrawingWalls = false;
let StartCell_Color = "yellow";
let EndCell_Color = "red";
let TempWallsIDArray = [];
let TreeList = {};

const DebugVar = {
   isEuclidean: true,
   showWallCol: false,
   showCellInfo: true,
};


// ================================================================================================
// Project Functions
// ================================================================================================
const clearCanvas = () => {

   ctx.isoSelect.clearRect(0, 0, GridWidth, GridHeight);
   ctx.buildings.clearRect(0, 0, Viewport.width, Viewport.height);
   ctx.units.clearRect(    0, 0, Viewport.width, Viewport.height);
}

const clearCell = () => {
   ctx.isoSelect.clearRect(GetCell.position.x, GetCell.position.y, CellSize, CellSize);
}

const setDOM = () => {

   DOM.cartX.textContent =   `x : ${GetCell.cartMouse.x}`;
   DOM.cartY.textContent =   `y : ${GetCell.cartMouse.y}`;
   DOM.isoX.textContent =    `x : ${GetCell.isoMouse.x}`;
   DOM.isoY.textContent =    `y : ${GetCell.isoMouse.y}`;
   DOM.cellX.textContent =   `x : ${GetCell.position.x}`;
   DOM.cellY.textContent =   `y : ${GetCell.position.y}`;
   DOM.cellID.textContent = `id : ${GetCell.id}`;
}

const screenPos_toGridPos = (mousePos) => {

   // Isometric <== Cartesian
   return {
      x:  Math.floor( (mousePos.x -mousePos.y *2) /Cos_45deg /2 ) +GridWidth /2,
      y:  Math.floor( (mousePos.x +mousePos.y *2) /Cos_45deg /2 ) -GridWidth /2,
   };
}

const gridPos_toScreenPos = (cellPos) => {

   // Cartesian <== Isometric
   let TempX = Math.floor( (cellPos.x + cellPos.y) *Cos_45deg );
   let TempY = Math.floor( (cellPos.y + GridWidth /2) *Cos_45deg *2 -TempX ) /2;

   return {
      x: Math.floor( Viewport.width  /2 - Cos_45deg /2 *(GridHeight +GridWidth) +TempX ),
      y: Math.floor( Viewport.height /2 - Cos_45deg /4 *(GridHeight +GridWidth) +TempY +Cos_30deg *CellSize /2 ),
   };
}

const GetCellPos = (event) => {
   
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
      x: isoMouse.x - (isoMouse.x % CellSize),
      y: isoMouse.y - (isoMouse.y % CellSize),
   };

   const cellCenter = {
      x: cellPos.x +CellSize /2,
      y: cellPos.y +CellSize /2,
   };

   const screenPos = gridPos_toScreenPos(cellCenter);

   return {
      id: `${cellPos.x /CellSize}-${cellPos.y /CellSize}`,
      cartMouse: cartMouse.screen,
      isoMouse: isoMouse,
      position: cellPos,
      center: cellCenter,
      screen: screenPos,
   }
}

const withinTheGrid = (callback) => {

   if(GetCell.isoMouse.x > 0
   && GetCell.isoMouse.x < GridWidth
   && GetCell.isoMouse.y > 0
   && GetCell.isoMouse.y < GridHeight) {

      callback();
   }
}

const cycleCells = (callback) => {

   for(let i in Grid.cellsList) {
      let cell = Grid.cellsList[i];

      callback(cell);
   }
}

const startEndPos = (cell) => {

   // Draw StartPos
   if(!StartCell) {
      StartCell = cell;
      cell.drawCellColor(ctx.isoSelect, StartCell_Color);
      drawCellInfo(cell);
   }
   
   // Draw EndPos
   else if(!EndCell) {
      EndCell = cell;
      cell.drawCellColor(ctx.isoSelect, EndCell_Color);
      drawCellInfo(cell);
   }
   
   // Erase StartPos && EndPos
   else {
      if(EndCell && GetCell.id === EndCell.id) EndCell = undefined;
      if(StartCell && GetCell.id === StartCell.id) StartCell = undefined;
   }
}

const renderBlockingItems = (cell) => {

   switch(cell.blockingItem) {

      case "wall" : cell.drawWall(ctx.isoSelect, false);
      break;

      case "tree" : cell.drawCellColor(ctx.isoSelect, "darkviolet");
      break;

      case undefined : cell.drawCellColor(ctx.isoSelect, "white");
      break;
   }
}

const addRemove_Wall = (cell) => {

   // Add wall
   if(!IsDrawingWalls && !cell.isBlocked) {

      StartWall = cell;
      IsDrawingWalls = true;
      cell.isBlocked = true;
      cell.blockingItem = "wall";
      cell.drawWall(ctx.isoSelect, false);
   }
   
   // Remove wall
   else {
      IsDrawingWalls = false;
      cell.isBlocked = false;
      cell.blockingItem = undefined;
      clearCell();
   }

   drawCellInfo(cell); // *************
}

const addRemove_Tree = (cell) => {

   // Add Tree
   if(!cell.isBlocked) {

      if(!StartCell && !EndCell
      ||  StartCell && StartCell.id !== cell.id && !EndCell
      ||  EndCell   && EndCell.id   !== cell.id && !StartCell
      ||  StartCell.id !== cell.id && EndCell.id !== cell.id) {

         cell.isBlocked = true;
         cell.blockingItem = "tree";
         TreeList[cell.id] = GetCell.screen;
         drawTree( GetCell.screen);
         renderBlockingItems(cell);
      }
   }

   // Remove Tree
   else {
      cell.isBlocked = false;
      cell.blockingItem = undefined;
      delete TreeList[cell.id];
      clearCell();
   }
}


// ================================================================================================
// Draw Functions
// ================================================================================================
const drawCellInfo = (cell) => {

   if(DebugVar.showCellInfo) {
      cell.drawFrame(ctx.terrain);
      cell.drawCenter(ctx.terrain);
      cell.drawID(ctx.terrain);
   }
}

const drawTempWalls = (cell) => {

   const isDiamond = true;

   const raycast = {
      startX: StartWall.center.x,
      startY: StartWall.center.y,
      endX: GetCell.center.x,
      endY: GetCell.center.y,
   }

   // If raycast collide cell ==> Draw tempory wall
   if(cell.line_toSquare(raycast, isDiamond)
   && cell !== StartWall
   && !cell.isBlocked) {
      
      TempWallsIDArray.push(cell.id);
      cell.drawWall(ctx.isoSelect, true);
      cell.drawWallCollider(ctx.isoSelect, isDiamond, DebugVar.showWallCol);
   }
}

const drawBuiltWalls = (cell) => {

   TempWallsIDArray.forEach(id => {
      let tempCell = Grid.cellsList[id];

      tempCell.isBlocked = true;
      tempCell.blockingItem = "wall";
      tempCell.drawWall(ctx.isoSelect, false);
      drawCellInfo(tempCell);
   });

   StartWall.drawPathWall(ctx.isoSelect, GetCell);
   StartWall = cell;
}

const drawTree = (position) => {
   let tree = Artworks.tree;

   ctx.buildings.drawImage(
      tree.img,
      0, 0, tree.size, tree.size,
      
      position.x -tree.offsetX,
      position.y -tree.offsetY,
      tree.size,
      tree.size
   );
}


// ================================================================================================
// Mouse Inputs
// ================================================================================================
const Mouse_Move = (event) => {

   clearCanvas();
   TempWallsIDArray = [];

   // Set hover cell & DOM
   GetCell = GetCellPos(event);
   HoverCell = Grid.cellsList[GetCell.id];
   setDOM();
   
   // Render blocking items
   cycleCells((cell) => {
      if(IsDrawingWalls) drawTempWalls(cell);
      if(cell.isBlocked) renderBlockingItems(cell);
   });
   for(let i in TreeList) drawTree(TreeList[i]);


   // Redraw existing items after canvas cleared
   if(HoverCell) HoverCell.drawHover(ctx.isoSelect, GetCell, "blue");
   if(StartCell) StartCell.drawCellColor(ctx.isoSelect, StartCell_Color);
   if(EndCell) EndCell.drawCellColor(ctx.isoSelect, EndCell_Color);
   if(Agent) Agent.displayPath(ctx.isoSelect);
   if(IsDrawingWalls) StartWall.drawPathWall(ctx.isoSelect, GetCell);

   // Draw cursor tree ==> While inside grid
   // withinTheGrid(() => {
   //    drawTree(GetCell.screen);
   // });
}

const Mouse_LeftBtn = (state) => {
   
   if(state === "Down") {
      if(IsDrawingWalls) drawBuiltWalls(HoverCell);
      else startEndPos(HoverCell);   
   }
}

const Mouse_RightBtn = (state) => {
   
   if(state === "Down") {
      addRemove_Wall(HoverCell);
   }
}

const Mouse_ScrollBtn = (state) => {
   
   if(state === "Down") {
      addRemove_Tree(HoverCell);
   }
}


// ================================================================================================
// Keyboard Inputs
// ================================================================================================
const Keyboard_Enter = () => {

   if(StartCell && EndCell) {
      Agent = new AgentClass(StartCell, EndCell, DebugVar.isEuclidean);

      Agent.searchPath();
      Agent.showPath = true;
      Agent.showData = false;
      Agent.displayPath(ctx.isoSelect);
   }

   else alert("< No path  to calculate ! >");
}

const Keyboard_Esc = () => {

   location.reload();
}


// ================================================================================================
// Project Handler
// ================================================================================================
const initProject = () => {

   // Mouse move
   canvasObj.units.addEventListener("mousemove", (event) => Mouse_Move(event));
   

   // Mouse click
   canvasObj.units.addEventListener("mousedown", (event) => {
      const MouseState = "Down";

      if(HoverCell) {
         if(event.which === 1) Mouse_LeftBtn  (MouseState);
         if(event.which === 2) Mouse_ScrollBtn(MouseState);
         if(event.which === 3) Mouse_RightBtn (MouseState);
      }
   });


   // Keyboard press key
   window.addEventListener("keydown", (event) => {

      if(event.key === "Enter")  Keyboard_Enter();
      if(event.key === "Escape") Keyboard_Esc();
   });
}

document.body.oncontextmenu = (event) => {
   event.preventDefault();
   event.stopPropagation();
}

window.addEventListener("load", () => {
   
   loadImages();
   initProject();

   Grid.init(DebugVar.isEuclidean, ctx.terrain, Artworks.tile);
   
   cycleCells((cell) => {
      cell.drawPicture(ctx.terrain, Artworks.tile);
      drawCellInfo(cell);
   });
});