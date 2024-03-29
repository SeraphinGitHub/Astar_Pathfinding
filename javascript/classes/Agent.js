
"use strict"

// =====================================================================
// Agent Class
// =====================================================================
class AgentClass {
   constructor(startCell, endCell, isEuclidean) {

      this.startCell  = startCell;
      this.endCell    = endCell;
      this.openList   = [];
      this.closedList = [];
      this.pathArray  = [];

      this.showPath    = false;
      this.showData    = false;
      this.isPathDrawn = false;
      this.isEuclidean = isEuclidean; // Can move diagonally if "true"
   }

   calcHeuristic(cell) {
      
      let distX = Math.abs(this.endCell.center.x -cell.center.x);
      let distY = Math.abs(this.endCell.center.y -cell.center.y);
      let hypotenuse = Math.floor(Math.sqrt(distX * distX + distY * distY));

      if(!this.isEuclidean) return distX + distY;
      else return hypotenuse;
   }

   searchPath() {

      this.openList   = [this.startCell];
      this.closedList = [];
      this.pathArray  = [];

      while(this.openList.length > 0) {

         let lowestIndex = 0;

         // Bring up lowest fCost index
         for(let i = 0; i < this.openList.length; i++) {
            if(this.openList[lowestIndex].fCost > this.openList[i].fCost) {
               lowestIndex = i;
            }
         }

         let currentCell = this.openList[lowestIndex];
         let nebList = currentCell.neighborsList;         

         // Scan cell neighbors
         for(let i in nebList) {
            let neighbor = nebList[i];
            
            // If this neighbor hasn't been scanned yet
            if(!this.closedList.includes(neighbor) && !neighbor.isBlocked) {
               let possibleG = currentCell.gCost +1;
               
               if(!this.openList.includes(neighbor)) this.checkWallDiag(nebList, neighbor);
               else if(possibleG >= neighbor.gCost) continue;
               
               neighbor.hCost = this.calcHeuristic(neighbor);
               neighbor.gCost = possibleG;
               neighbor.fCost = neighbor.gCost +neighbor.hCost;
               neighbor.cameFromCell = currentCell;
            }
         }
         
         // If reached destination
         if(currentCell.id === this.endCell.id) {
   
            let temporyCell = currentCell;
            this.pathArray.push(temporyCell);
   
            while(temporyCell.cameFromCell) {
               this.pathArray.push(temporyCell.cameFromCell);
               temporyCell = temporyCell.cameFromCell;
            }
            
            // Reset neighbors data
            // this.closedList.forEach(cell => {
            //    cell.hCost = 0;
            //    cell.gCost = 0;
            //    cell.fCost = 0;
            //    cell.cameFromCell = undefined;
            // });

            this.pathArray.reverse();
            return this.pathArray;
         }

         // Transfert currentCell to closedList
         this.openList.splice(lowestIndex, 1);
         this.closedList.push(currentCell);
      }

      return [];
   }

   checkWallDiag(nebList, neighbor) {
      
      let topNeb =    nebList[ neighbor.manhattanNeb[0] ];
      let rightNeb =  nebList[ neighbor.manhattanNeb[1] ];
      let bottomNeb = nebList[ neighbor.manhattanNeb[2] ];
      let leftNeb =   nebList[ neighbor.manhattanNeb[3] ];

      let topLeftNeb =     nebList[ neighbor.euclideanNeb[0] ];
      let topRightNeb =    nebList[ neighbor.euclideanNeb[1] ];
      let bottomRightNeb = nebList[ neighbor.euclideanNeb[2] ];
      let bottomLeftNeb =  nebList[ neighbor.euclideanNeb[3] ];

      if( !(topNeb    && leftNeb  && topNeb.isBlocked    && leftNeb.isBlocked  && neighbor === topLeftNeb
         || topNeb    && rightNeb && topNeb.isBlocked    && rightNeb.isBlocked && neighbor === topRightNeb
         || bottomNeb && leftNeb  && bottomNeb.isBlocked && leftNeb.isBlocked  && neighbor === bottomLeftNeb
         || bottomNeb && rightNeb && bottomNeb.isBlocked && rightNeb.isBlocked && neighbor === bottomRightNeb )
      && this.isEuclidean
      || !this.isEuclidean) {

         this.openList.push(neighbor);
      }
   }

   displayPathAnim(ctx) {
      if(this.showPath) {

         // Display scanned neighbors
         let neighborsColor = "rgba(255, 145, 0, 0.4)";
   
         this.closedList.forEach(cell => {
            cell.drawCellColor(ctx, neighborsColor);
            if(this.showData) cell.drawData(ctx);
         });
   
         // Display path
         for(let i = 0; i < this.pathArray.length; i++) {
            
            let currentCell = this.pathArray[i];
            this.drawFullPath(i, ctx, currentCell);
            
            if(!this.isPathDrawn) this.drawHitboxDelayed(i, ctx, currentCell);
            else this.drawCellHitbox(ctx, currentCell);
         }
      }
   }

   drawFullPath(i, ctx, currentCell) {

      if(i +1 < this.pathArray.length) {
         let nextCell = this.pathArray[i +1];
         this.drawNextCellPath(ctx, currentCell, nextCell);
      }
   }

   drawNextCellPath(ctx, currentCell, nextCell) {
      
      ctx.strokeStyle = "lime";
      ctx.beginPath();

      ctx.moveTo(
         currentCell.center.x,
         currentCell.center.y
      );

      ctx.lineTo(
         nextCell.center.x,
         nextCell.center.y
      );

      ctx.lineWidth = 4;
      ctx.stroke();
   }

   drawHitboxDelayed(i, ctx, currentCell) {

      setTimeout(() => {
         this.drawCellHitbox(ctx, currentCell);
         if(i === this.pathArray.length -1) this.isPathDrawn = true;

      }, 100 *i);
   }

   drawCellHitbox(ctx, currentCell) {
      
      let ratio = 0.7; // 70%
            
      ctx.fillStyle = "blue";
      ctx.fillRect(
         currentCell.center.x -currentCell.size /2 *ratio,
         currentCell.center.y -currentCell.size /2 *ratio,
         currentCell.size *ratio,
         currentCell.size *ratio
      );

      if(this.showData)currentCell.drawData(ctx);
   }
}