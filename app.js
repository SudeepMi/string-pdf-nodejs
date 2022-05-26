const app = require("express")();
const bodyParser = require("body-parser");
var cors = require("cors");
const fs = require("fs");
var html_to_pdf = require("html-pdf-node");

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

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

// deepcode ignore NoRateLimitingForExpensiveWebOperation
app.get("/", (req, res) => {
  const file_name = req.query.file_name;
// deepcode ignore PT
  const src = fs.createReadStream(file_name);
  src.pipe(res);
});

module.exports = app;
