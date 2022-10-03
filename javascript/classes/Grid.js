
"use strict"

// =====================================================================
// Grid Class
// =====================================================================
class Grid {
   constructor(ctx, width, height, cellSize, isEuclidean) {

      this.cellsList = {};
      
      this.ctx = ctx;
      this.width = width;
      this.height = height;
      this.cellSize = cellSize;
      this.isEuclidean = isEuclidean; // Can move diagonally if "true"
      
      this.collums = (width -(width %cellSize)) /cellSize;
      this.rows = (height -(height %cellSize)) /cellSize;
   }

   init(ctx) {

      // Init grid
      for(let i = 0; i < this.collums; i++) {
         for(let j = 0; j < this.rows; j++) {
            
            const cell = new Cell(this.collums, this.rows, this.cellSize, this.isEuclidean, i, j);
            this.cellsList[cell.id] = cell;
         }
      }

      // Set cells neighborsList
      for(let i in this.cellsList) {
         let cell = this.cellsList[i];

         cell.initNeighborsList(this.cellsList);
         cell.drawFrame(ctx);
         cell.drawCenter(ctx);
      }
   }

}