

"use strict"

const DOM = {
   mouseX: document.querySelector(".coordinates .mouseX"),
   mouseY: document.querySelector(".coordinates .mouseY"),
   cellX: document.querySelector(".coordinates .cellX"),
   cellY: document.querySelector(".coordinates .cellY"),
   cellID: document.querySelector(".coordinates .ID-cell"),
}

let cellsArray = [];
let wallsArray = [];
let isEuclidean = false;
let unitGridPos;
let startCell;
let endCell;

const canvas = document.querySelector(".canvas-1");
const unitCtx = canvas.getContext("2d");

const unitGrid = new Grid(unitCtx, 500, 300, 100, isEuclidean);
const agent = new Agent(unitCtx, {}, {}, isEuclidean);

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
      wallsArray.forEach(cell => cell.drawWall({ x: cell.i * cell.size, y: cell.j * cell.size }));
      if(startCell) startCell.drawPos("lime");
      if(endCell) endCell.drawPos("dodgerblue");
      
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

            if(event.which === 1) cell.drawTile(unitGridPos, "red");
            if(event.which === 3) {
   
               if(!wallsArray.includes(cell)) wallsArray.push(cell);
               else {
                  let wallIndex = wallsArray.indexOf(cell);
                  wallsArray.splice(wallIndex, 1);
               }
   
               cell.drawWall(unitGridPos);
            }
         }
      });
   });

   canvas.addEventListener("mouseup", (event) => {
      unitGridPos = getunitGridPosition(event);

      cycleGrid((cell) => {
         let mouseCellID = `${unitGridPos.x /cell.size}-${unitGridPos.y /cell.size}`;
         
         if(cell.id === mouseCellID) {
            
            if(event.which === 1) cell.drawTile(unitGridPos, "blue");
         }
      });
   });

   window.addEventListener("keydown", (event) => {
      
      cycleGrid((cell) => {
         let mouseCellID = `${unitGridPos.x /cell.size}-${unitGridPos.y /cell.size}`;
         
         if(cell.id === mouseCellID) {

            if(event.key === "1") {            
               agent.startCell = cell.center;
               startCell = cell;
               cell.drawPos("lime");
            }
            
            if(event.key === "2") {            
               agent.endCell = cell.center;
               endCell = cell;
               cell.drawPos("dodgerblue");
            }
         }
      });

      if(event.key === "3") {
         console.log( agent.startCell );
         console.log( agent.endCell );
         console.log( agent.searchPath() );
      }
   });
}

document.body.oncontextmenu = (event) => {
   event.preventDefault();
   event.stopPropagation();
}

window.addEventListener("load", () => {

   gameHandler();  
   agent.drawHitbox(80);
   unitGrid.init();
});