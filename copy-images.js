const fs = require('fs');
const path = require('path');

const src1 = "";
const dest1 = "";

const src2 = "";
const dest2 = "";

try {
  fs.copyFileSync(src1, dest1);
  console.log("Copied contributors hologram to public/contributors_hologram.jpg");
  fs.copyFileSync(src2, dest2);
  console.log("Copied clients hologram to public/clients_hologram.jpg");
  console.log("All assets copied successfully!");
} catch (err) {
  console.error("Failed to copy assets:", err.message);
}
