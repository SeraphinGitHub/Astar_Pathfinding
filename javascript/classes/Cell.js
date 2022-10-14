
"use strict"

// =====================================================================
// Cell Class
// =====================================================================
class CellClass {
   constructor(collums, rows, size, isEuclidean, i, j) {
      
      this.id =`${i}-${j}`;

      this.collums = collums;
      this.rows = rows;
      this.size = size;
      this.isEuclidean = isEuclidean;

      this.i = i;
      this.j = j;
      this.x = i *size;
      this.y = j *size;
      
      this.center = {
         x: this.x + size/2,
         y: this.y + size/2,
      };

      this.manhattanNeb = [
         "top",
         "right",
         "bottom",
         "left",
      ];

      this.euclideanNeb = [
         "topLeft",
         "topRight",
         "bottomRight",
         "bottomLeft",
      ];

      this.tileIndex;
      this.tilesArray = [];

      this.neighborsList = {};
      this.cameFromCell;
      
      this.fCost = 0;
      this.gCost = 0;
      this.hCost = 0;
      
      this.blockingItem;
      this.isBlocked = false;
   }

   // Collision
   cellCollider(isDiamond) {

      // Collider is a Diamond
      if(isDiamond) return {

         top: {
            x: this.center.x,
            y: this.y,
         },

         right: {
            x: this.x +this.size,
            y: this.center.y,
         },

         bottom: {
            x: this.center.x,
            y: this.y +this.size,
         },

         left: {
            x: this.x,
            y: this.center.y,
         },
      }

      // Collider is a Square
      else return {

         top: {
            x: this.x,
            y: this.y,
         },

         right: {
            x: this.x +this.size,
            y: this.y,
         },

         bottom: {
            x: this.x,
            y: this.y +this.size,
         },

         left: {
            x: this.x +this.size,
            y: this.y +this.size,
         },
      };
   }

   line_toLine(lineA, lineB) {

      const vectorA = {
         x: lineA.endX -lineA.startX,
         y: lineA.endY -lineA.startY,
      }
   
      const vectorB = {
         x: lineB.endX -lineB.startX,
         y: lineB.endY -lineB.startY,
      }
   
      const vectorC = {
         x: lineA.startX -lineB.startX,
         y: lineA.startY -lineB.startY,
      }  
   
      let vectorValueA = vectorA.x *vectorC.y - vectorA.y *vectorC.x;
      let vectorValueB = vectorB.x *vectorC.y - vectorB.y *vectorC.x;
      let denominator = vectorB.y *vectorA.x - vectorB.x *vectorA.y;
      
      let rangeA = Math.floor(vectorValueA /denominator *1000) /1000;
      let rangeB = Math.floor(vectorValueB /denominator *1000) /1000;
      
      if(rangeA >= 0 && rangeA <= 1
      && rangeB >= 0 && rangeB <= 1) return true;
      else return false;
   }

   line_toSquare(line, isDiamond) {

      let rectCorner = this.cellCollider(isDiamond);     
      
      const rectSide = {

         left: {
            startX: rectCorner.bottom.x,
            startY: rectCorner.bottom.y,
            endX: rectCorner.top.x,
            endY: rectCorner.top.y,
         },

         right: {
            startX: rectCorner.right.x,
            startY: rectCorner.right.y,
            endX: rectCorner.bottom.x,
            endY: rectCorner.bottom.y,
         },

         top: {
            startX: rectCorner.top.x,
            startY: rectCorner.top.y,
            endX: rectCorner.right.x,
            endY: rectCorner.right.y,
         },

         bottom: {
            startX: rectCorner.bottom.x,
            startY: rectCorner.bottom.y,
            endX: rectCorner.left.x,
            endY: rectCorner.left.y,
         },
      };

      let topSide    = this.line_toLine(line, rectSide.top   );
      let rightSide  = this.line_toLine(line, rectSide.right );
      let bottomSide = this.line_toLine(line, rectSide.bottom);
      let leftSide   = this.line_toLine(line, rectSide.left  );
         
      if(leftSide
      || rightSide
      || topSide
      || bottomSide) return true;
      else return false;
   }
   

   // NeighborsList
   initNeighborsList(cellsList) {

      const nebID = {
         top:   `${this.i   }-${this.j -1}`,
         right: `${this.i +1}-${this.j   }`,
         bottom:`${this.i   }-${this.j +1}`,
         left:  `${this.i -1}-${this.j   }`,

         topLeft:    `${this.i -1}-${this.j -1}`,
         topRight:   `${this.i +1}-${this.j -1}`,
         bottomRight:`${this.i +1}-${this.j +1}`,
         bottomLeft: `${this.i -1}-${this.j +1}`,
      };

      this.setNeb_Left (cellsList, nebID, nebID.left);
      this.setNeb_Right(cellsList, nebID, nebID.right);
      this.setNeb_Top(   () => { this.addNeb(cellsList, nebID, nebID.top   ) });
      this.setNeb_Bottom(() => { this.addNeb(cellsList, nebID, nebID.bottom) });

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
         this.x,
         this.y,
         this.size,
         this.size
      );
   }

   drawHover(ctx, getCell, color) {

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
   
      ctx.strokeRect(
         getCell.position.x,
         getCell.position.y,
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

   drawPicture(ctx, file, baseTilesTypes, count) {

      ctx.drawImage(
         file.img,

         // Source
         this.tileIndex *file.size,
         0,
         file.size,
         file.size,
         
         // Destination
         this.x,
         this.y,
         this.size,
         this.size
      );

      // ctx.fillStyle = "black";
      // ctx.font = "20px Verdana";
      // ctx.textAlign = "center";

      // let i = 0;
      // let offset = 25;

      // this.tilesArray.forEach(tile => {
      //    ctx.fillText(
      //       tile,
      //       this.center.x,
      //       this.center.y -offset +i
      //    );

      //    i += offset;
      // });

      // ctx.fillStyle = "red";
      // ctx.fillText(
      //    count +":"+ baseTilesTypes[this.tileIndex],
      //    this.center.x,
      //    this.center.y +offset *2
      // );

      if(count === 0) {

         ctx.strokeStyle = "darkviolet";
         ctx.lineWidth = 8;
         ctx.strokeRect(
            this.x,
            this.y,
            this.size,
            this.size
         );
      }

   }

   drawWall(ctx, isTempory) {

      let wallColor;
      if(isTempory) wallColor = "rgba(105, 105, 105, 0.45)";
      else wallColor = "dimgray";
      
      ctx.fillStyle = wallColor;
      ctx.fillRect(
         this.x,
         this.y,
         this.size,
         this.size
      );
   }

   drawWallCollider(ctx, isDiamond, showWallCol) {

      if(showWallCol) {
         let rectCorner = this.cellCollider(isDiamond);     

         ctx.fillStyle = "red";
         ctx.beginPath();
   
         ctx.moveTo(rectCorner.top.x, rectCorner.top.y);
         ctx.lineTo(rectCorner.right.x, rectCorner.right.y);
         ctx.lineTo(rectCorner.bottom.x, rectCorner.bottom.y);
         ctx.lineTo(rectCorner.left.x, rectCorner.left.y);
   
         ctx.fill();
      }
   }

   drawPathWall(ctx, mouseCell) {

      ctx.strokeStyle = "yellow";
      ctx.beginPath();

      ctx.moveTo(
         this.center.x,
         this.center.y
      );

      ctx.lineTo(
         mouseCell.center.x,
         mouseCell.center.y
      );

      ctx.lineWidth = 4;
      ctx.stroke();
   }

   drawCellColor(ctx, color) {

      ctx.fillStyle = color;
      ctx.fillRect(
         this.x,
         this.y,
         this.size,
         this.size
      );

      this.drawFrame(ctx);
   }

}