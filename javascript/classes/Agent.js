
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
      this.pathArray = [];
      this.isEuclidean = isEuclidean; // Can move diagonally if "true"
      this.showPath = true;
   }

   calcHeuristic(cell) {
      
      let distX = Math.abs(this.endCell.center.x -cell.center.x);
      let distY = Math.abs(this.endCell.center.y -cell.center.y);
      let hypotenuse = Math.floor(Math.sqrt(distX * distX + distY * distY));

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

         // Scan cell neighbors
         for(let i in currentCell.neighborsList) {
            let neighbor = currentCell.neighborsList[i];

            // If this neighbor hasn't been scanned yet
            if(!this.closedList.includes(neighbor) && neighbor.isWalkable) {
               let possibleG = currentCell.gCost +1;
               
               if(!this.openList.includes(neighbor)) this.openList.push(neighbor);
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

            this.pathArray.reverse();
            if(this.showPath) this.displayPath();

            return this.pathArray;
         }

         // Transfert currentCell to closedList
         this.openList.splice(lowestIndex, 1);
         this.closedList.push(currentCell);
      }

      return [];
   }

   displayPath() {

      // Display scanned neighbors
      let neighborsColor = "rgba(255, 145, 0, 0.35)";
      this.closedList.forEach(cell => cell.drawPos(neighborsColor));

      // Display path
      for(let i = 0; i < this.pathArray.length; i++) {

         let currentCell = this.pathArray[i];
         this.drawHitbox(i, currentCell);
         
         if(i +1 < this.pathArray.length) {
            let nextCell = this.pathArray[i +1];
            this.drawPath(currentCell, nextCell);
         }
      }
   }

   drawPath(currentCell, nextCell) {
      
      this.ctx.strokeStyle = "lime";
      this.ctx.beginPath();

      this.ctx.moveTo(
         currentCell.center.x,
         currentCell.center.y
      );

      this.ctx.lineTo(
         nextCell.center.x,
         nextCell.center.y
      );

      this.ctx.lineWidth = 4;
      this.ctx.stroke();
   }

   drawHitbox(i, currentCell) {
      
      let ratio = 0.6; // 60%

      setTimeout(() => {
         this.ctx.fillStyle = "blue";
         this.ctx.fillRect(
            currentCell.center.x -currentCell.size /2 *ratio,
            currentCell.center.y -currentCell.size /2 *ratio,
            currentCell.size *ratio,
            currentCell.size *ratio
         );
      }, 100 *i);
   }
}