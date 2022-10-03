
"use strict"

// =====================================================================
// Agent Class
// =====================================================================
class Agent {
   constructor(ctx, startCell, endCell, isEuclidean) {

      this.ctx = ctx;

      this.startCell = startCell;
      this.endCell = endCell;
      this.openList = [startCell];
      this.closedList = [];
      this.path = [];
      this.isEuclidean = isEuclidean; // Can move diagonally if "true"
   }

   calcHeuristic(cell) {

      let distX = Math.abs(this.endCell.center.x -cell.center.x);
      let distY = Math.abs(this.endCell.center.y -cell.center.y);
      let hypotenuse = Math.sqrt(distX * distX + distY * distY);

      if(!this.isEuclidean) return distX + distY;
      else return hypotenuse;
   }

   searchPath() {
      while(this.openList.length > 0) {

         let lowestIndex = 0;

         // Set lowest cell fCost's index
         for(let i = 0; i < this.openList.length; i++) {
            if(this.openList[lowestIndex].fCost > this.openList[i].fCost) {
               lowestIndex = i;
            }
         }

         let currentCell = this.openList[lowestIndex];
         
         console.log(this.openList); // ******************************************************
         console.log(this.openList[lowestIndex]); // ******************************************************
         // console.log(currentCell.id); // ******************************************************

         // If reached destination
         if(currentCell.id === this.endCell.id) {
   
            let temporyCell = currentCell;
            this.path.push(temporyCell);
   
            while(temporyCell.cameFromCell) {
               this.path.push(temporyCell.cameFromCell);
               temporyCell = temporyCell.cameFromCell;
            }
   
            console.log("DONE!"); // ******************************************************
            console.log(this.path); // ******************************************************

            return this.path.reverse();
         }
         


         // Transfert currentCell to closedList
         this.openList.splice(lowestIndex, 1);
         this.closedList.push(currentCell);



         // Scan each current cell's neighbors
         for(let i in currentCell.neighborsList) {
            let neighbor = currentCell.neighborsList[i];

            // If this neighbor hasn't been scanned yet
            if(!closedList.includes(neighbor)) {
               let possibleG = currentCell.gCost +1;
               
               if(!openList.includes(neighbor)) openList.push(neighbor);
               else if(possibleG >= neighbor.gCost) continue;
      
               neighbor.hCost = this.calcHeuristic(neighbor);
               neighbor.gCost = possibleG;
               neighbor.fCost = neighbor.gCost +neighbor.hCost;
               neighbor.cameFromCell = currentCell;
            }
         }


         // Transfert currentCell to closedList
         // this.openList.splice(lowestIndex, 1);
         // this.closedList.push(currentCell);
      }

      return [];
   }

   drawHitbox(boxSize) {

      this.ctx.fillStyle = "blue";
      this.ctx.fillRect(
         this.startCell.x -boxSize /2,
         this.startCell.y -boxSize /2,
         boxSize,
         boxSize
      );
   }
}