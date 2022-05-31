const app = require("express")();
const bodyParser = require("body-parser");
var cors = require("cors");
const fs = require("fs");
const path = require("path");
var html_to_pdf = require("html-pdf-node");
const multer = require("multer")
const Document = require('extract-word-docs');
const HTMLtoDOCX = require('html-to-docx');
const express = require("express")

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use('/public', express.static(__dirname + '/public'));

app.post("/get", (req, res) => {
  const { string } = req.body;
  let options = { format: "A4" };
  let file = { content: string };
  
  // deepcode ignore PromiseNotCaughtNode
  html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
    const random = Math.random();
    fs.writeFileSync(`${__dirname}/public/${random}.pdf`, pdfBuffer, "binary");
    res
      .status(200)
      .json({ msg: "OK", file: `${__dirname}/public/${random}.pdf` });
  });
});

// export doc file
app.post("/doc", (req, res) => {
  const random = Math.random() * 10;
  const filePath = `./public/${random}.docx`
  if(!fs.existsSync('./public')){
    fs.mkdirSync('./public');
  }
  const { string } = req.body;
  (async () => {
    const fileBuffer = await HTMLtoDOCX(string, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });
  
    fs.writeFileSync(filePath, fileBuffer, (error) => {
      if (error) {
        console.log('Docx file creation failed');
        return;
      }
      console.log('Docx file created successfully');
    });

  })();
  res.json({
    link: `${req.protocol}://${req.get('host')}/${filePath}`
  }).send()
  
});

// deepcode ignore NoRateLimitingForExpensiveWebOperation
app.get("/", (req, res) => {
  const file_name = req.query.file_name;
// deepcode ignore PT
  const src = fs.createReadStream(file_name);
  src.pipe(res);
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const uploadStorage = multer({ storage: storage })

// Single file
app.post("/upload/single", uploadStorage.single("file"), (req, res) => {
  // var absPath = path.join(__dirname, req.file.path);
  let document = new Document(req.file.path, {editable: false, delText: false});
document.extractAsHTML().then(data => {
    res.status(200).json({
      filename: req.file.originalname,
      html: data
});
  
})
});




module.exports = app;
