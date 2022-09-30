
"use strict"

// =====================================================================
// Grid Class
// =====================================================================
class Grid {
   constructor(ctx, width, height, cellSize) {

      this.cellsList = {};

      this.ctx = ctx;
      this.width = width;
      this.height = height;
      this.cellSize = cellSize;
      
      this.collums = (width -(width %cellSize)) /cellSize;
      this.rows = (height -(height %cellSize)) /cellSize;
   }

   init(isEuclidean) {
      for (let i = 0; i < this.collums; i++) {
         for (let j = 0; j < this.rows; j++) {

            const cell = new Cell(this.ctx, this.collums, this.rows, this.cellSize, i, j, isEuclidean);
            cell.drawFrame();
            cell.drawCenter();

            this.cellsList[`${i}-${j}`] = cell;
         }
      }
   }

}