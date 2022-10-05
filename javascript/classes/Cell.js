
"use strict"

// =====================================================================
// Cell Class
// =====================================================================
class Cell {
   constructor(collums, rows, size, isEuclidean, i, j) {
      
      this.id =`${i}-${j}`;
      this.collums = collums;
      this.rows = rows;
      this.size = size;
      this.isEuclidean = isEuclidean;
      this.i = i;
      this.j = j;
      
      this.center = {
         x: i *size + size/2,
         y: j *size + size/2,
      };

      this.neighborsList = {};
      this.cameFromCell;

      this.fCost = 0;
      this.gCost = 0;
      this.hCost = 0;
      
      this.isBlocked = false;
   }

   initNeighborsList(cellsList) {

      const nebID = {
         left:  `${this.i -1}-${this.j   }`,
         right: `${this.i +1}-${this.j   }`,
         top:   `${this.i   }-${this.j -1}`,
         bottom:`${this.i   }-${this.j +1}`,

         topLeft:    `${this.i -1}-${this.j -1}`,
         topRight:   `${this.i +1}-${this.j -1}`,
         bottomLeft: `${this.i -1}-${this.j +1}`,
         bottomRight:`${this.i +1}-${this.j +1}`,
      };

      this.setNeb_Left (cellsList, nebID, nebID.left);
      this.setNeb_Right(cellsList, nebID,nebID.right);
      this.setNeb_Top(   () => { this.addNeb(cellsList, nebID,nebID.top   ) });
      this.setNeb_Bottom(() => { this.addNeb(cellsList, nebID,nebID.bottom) });

      // If Euclidean ==> Can search diagonally
      if(this.isEuclidean) {
      
         this.setNeb_Top(() => {
            this.setNeb_Left (cellsList, nebID, nebID.topLeft);
            this.setNeb_Right(cellsList, nebID, nebID.topRight);
         });

         this.setNeb_Bottom(() => {
            this.setNeb_Left (cellsList, nebID, nebID.bottomLeft);
            this.setNeb_Right(cellsList, nebID, nebID.bottomRight);
         });
      }
   } 

   addNeb(cellsList, nebID, id) {
      let side = Object.keys(nebID).find(key => nebID[key] === id);
      this.neighborsList[side] = cellsList[id];
   }


   // Set Neighbors
   setNeb_Left(cellsList, nebID, id) {
      if(this.i -1 >= 0) this.addNeb(cellsList, nebID, id);
   }

   setNeb_Right(cellsList, nebID, id) {
      if(this.i +1 < this.collums) this.addNeb(cellsList, nebID, id);
   }

   setNeb_Top(callback) {
      if(this.j -1 >= 0) callback();
   }

   setNeb_Bottom(callback) {
      if(this.j +1 < this.rows) callback();
   }


   // Draw
   drawCenter(ctx) {

      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(
         this.center.x,
         this.center.y,
         4, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.closePath();
   }

   drawFrame(ctx) {

      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
   
      ctx.strokeRect(
         this.i *this.size,
         this.j *this.size,
         this.size,
         this.size
      );
   }

   drawHover(ctx, position, color) {

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
   
      ctx.strokeRect(
         position.x,
         position.y,
         this.size,
         this.size
      );
   }

   drawID(ctx) {

      ctx.fillStyle = "black";
      ctx.font = "20px Verdana";
      ctx.textAlign = "center";

      ctx.fillText(
         this.id,
         this.center.x,
         this.center.y -15
      );
   }

   drawData(ctx) {

      ctx.fillStyle = "white";
      ctx.font = "18px Verdana";
      ctx.textAlign = "left";

      let offsetX = 27;

      // hCost
      ctx.fillText(
         `h:${this.hCost}`,
         this.center.x -offsetX,
         this.center.y -12
      );

      // gCost
      ctx.fillText(
         `g:${this.gCost}`,
         this.center.x -offsetX,
         this.center.y +5
      );

      // fCost
      ctx.fillText(
         `f:${this.fCost}`,
         this.center.x -offsetX,
         this.center.y +27
      );      
   }

   drawWall(ctx, position, isBuilt) {

      let wallColor;
      if(isBuilt) wallColor = "dimgray";
      else wallColor = "rgba(105, 105, 105, 0.4)";
      
      ctx.fillStyle = wallColor;
      ctx.fillRect(
         position.x,
         position.y,
         this.size,
         this.size
      );
   }

   drawPathWall(ctx, mouseCell) {

      ctx.strokeStyle = "darkviolet";
      ctx.beginPath();

      ctx.moveTo(
         this.center.x,
         this.center.y
      );

      ctx.lineTo(
         mouseCell.centerX,
         mouseCell.centerY
      );

      ctx.lineWidth = 4;
      ctx.stroke();
   }

   drawStartEnd(ctx, color) {

      ctx.fillStyle = color;
      ctx.fillRect(
         this.i *this.size,
         this.j *this.size,
         this.size,
         this.size
      );
   }

}