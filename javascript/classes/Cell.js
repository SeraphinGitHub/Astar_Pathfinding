
"use strict"

// =====================================================================
// Cell Class
// =====================================================================
class Cell {
   constructor(ctx, collums, rows, size, i, j, isEuclidean) {

      this.ctx = ctx;

      this.collums = collums;
      this.rows = rows;
      this.size = size;
      this.i = i;
      this.j = j;
      
      this.center = {
         x: i *size + size/2,
         y: j *size + size/2,
      };

      this.neighborsList = {};
      this.fCost = 0;
      this.gCost = 0;
      this.hCost = 0;
      
      this.isParsable;
      this.isBuildable;
      this.isWalkable;

      this.isEuclidean = isEuclidean; // Can move diagonally if "true"
   }

   setID(i, j) {
      return `${i}-${j}`;
   }

   setNeighborsList() {

      // Manhattan Neighbors
      const manhattan = {

         left: {
            x: this.center.x -this.size,
            y: this.center.y
         },

         right: {
            x: this.center.x +this.size,
            y: this.center.y
         },

         top: {
            x: this.center.x,
            y: this.center.y -this.size
         },

         bottom: {
            x: this.center.x,
            y: this.center.y +this.size
         }
      }

      // Left neighbor
      if(manhattan.left.x > 0) {

         const id = this.setID(this.i -1, this.j);
         this.neighborsList[id] = manhattan.left;
      }

      // Right neighbor
      if(manhattan.right.x < this.collums *this.size) {

         const id = this.setID(this.i +1, this.j);
         this.neighborsList[id] = manhattan.right;
      }

      // Top neighbor
      if(manhattan.top.y > 0) {

         const id = this.setID(this.i, this.j -1);
         this.neighborsList[id] = manhattan.top;
      }

      // Bottom neighbor
      if(manhattan.bottom.y < this.rows *this.size) {

         const id = this.setID(this.i, this.j +1);
         this.neighborsList[id] = manhattan.bottom;
      }


      // ==========================================================
      // If euclidean is active ==> can search diagonally
      // ==========================================================
      if(this.isEuclidean) {

         // Euclidean Neighbors
         const euclidean = {

            topLeft: {
               x: this.center.x -this.size,
               y: this.center.y -this.size
            },
            
            topRight: {
               x: this.center.x +this.size,
               y: this.center.y -this.size
            },
            
            botLeft: {
               x: this.center.x -this.size,
               y: this.center.y +this.size
            },
            
            botRight: {
               x: this.center.x +this.size,
               y: this.center.y +this.size
            }
         }


         
      }
   }

   drawFrame() {

      this.ctx.strokeStyle = "black";
      this.ctx.fillStyle = "black";
      this.ctx.lineWidth = 2;
      this.ctx.font = "20px Verdana";
      this.ctx.textAlign = "center";
   
      this.ctx.strokeRect(
         this.i *this.size,
         this.j *this.size,
         this.size,
         this.size
      );

      this.ctx.fillText(
         this.setID(this.i, this.j),
         this.center.x,
         this.center.y -25
      );
   }

   drawCenter() {

      this.ctx.fillStyle = "red";
      this.ctx.beginPath();
      this.ctx.arc(
         this.center.x,
         this.center.y,
         4, 0, Math.PI * 2
      );
      this.ctx.fill();
      this.ctx.closePath();
   }

}