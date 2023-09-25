const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { createCanvas, loadImage } = require("canvas");

async function generatequoteimage(image_url, quote_text) {
    try {
      const brand_name = "QuotesCircle"
      const image = await loadImage(image_url);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");
      let font = "40px Impact";
      if(quote_text.length > 85){
        font = "35px Impact";
      }else if(quote_text.length > 100){
        font = "30px Impact";
      }else if(quote_text.length > 120){
        font = "25px Impact";
      }
      let lineHeight = 48;
  
      // Draw the image onto the canvas
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  
      // Add a semi-transparent black overlay on top of the image
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      // Measure the size of the text
      let textWidth = ctx.measureText(quote_text).width;
  
      // Adjust the font size to fit the text on the image
      while (textWidth > canvas.width - 100) {
        font = `${parseInt(font) - 4}px Impact`;
        ctx.font = font;
        lineHeight -= 4;
        textWidth = ctx.measureText(quote_text).width;
      }
  
      // Add text on the middle of the canvas
      ctx.fillStyle = "white";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
      ctx.lineWidth = 3;
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const words = quote_text.split(" ");
      let line = "";
      let y = canvas.height / 2 - lineHeight;
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > canvas.width - 100) {
          ctx.strokeText(line.trim(), canvas.width / 2, y);
          ctx.fillText(line.trim(), canvas.width / 2, y);
          line = words[i] + " ";
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.strokeText(line.trim(), canvas.width / 2, y);
      ctx.fillText(line.trim(), canvas.width / 2, y);
  
      // Draw the bottom black layer
      const layerHeight = 30;
      ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
      ctx.fillRect(0, canvas.height - layerHeight, canvas.width, layerHeight);
  
      // Add brand name at the center of the bottom layer
      ctx.fillStyle = "white";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(brand_name, canvas.width / 2, canvas.height - layerHeight / 2);
  
      const quote_text_no_spaces = quote_text.replace(/\s+/g, "-");
      const filename = `${quote_text_no_spaces}png`;
      const imgPath = path.join(__dirname, "./media/quotes", filename);
      fs.writeFileSync(imgPath, canvas.toBuffer());
      return filename;
    } catch (error) {
      console.error(error);
    }
  }

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./media/general");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
  }
});
const upload = multer({ storage: storage });

module.exports = {
  generatequoteimage,
  upload,
}