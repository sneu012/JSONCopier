var fs = require('fs');
var chalk = require('chalk');
var readline = require('readline-sync');

let args = process.argv.slice(2);

let sourceDirectory = args[0];
let destinationDirectory = args[1];

// let sourceDirectory = "/Users/samip/Documents/Projects/RxNT/template_projects/schema-generator/templates";
// let destinationDirectory = "./templates";

var sourceFiles = fs.readdirSync(sourceDirectory)
var modifiedFileMap = {}
var sourceFilesFiltered = sourceFiles.filter(x => x.includes(".json"))
let destinationFiles = fs.readdirSync(destinationDirectory).filter(x => x.includes(".json"));

let modifiedForms = [];
let newForms = [];

function handleFormsCopy() {
  sourceFilesFiltered.forEach((file, i) => {
    if (!destinationFiles.includes(file)) {
      createNewFile(file);
      newForms.push(file);
    } else { // file is present
      handleModifiedForms(file)
    }
  })
}

function createNewFile(file) {
  let srcFile = {};
  try {
    srcFile = JSON.parse(fs.readFileSync(sourceDirectory + `/${file}`));
  }catch(err){
    console.log(chalk.red(`Error while reading ${file}`));
  }
  console.log(`New form: ` + chalk.magenta(file));
  try {
    fs.writeFileSync(`${destinationDirectory}/${file}`, JSON.stringify(srcFile, null, 2));
  }catch(err){
    console.log(chalk.red(`Error ${err} while creating new files`));
  }
  console.log(chalk.green(file) + ` was copied`);
}

function handleModifiedForms(file) {

  let srcFileHandle, dstFileHandle, srcFileContent, destFileContent = {}
  try {
    srcFileHandle = fs.readFileSync(sourceDirectory + `/${file}`);
    dstFileHandle = fs.readFileSync(destinationDirectory + `/${file}`);
  } catch(err){
    console.log(chalk.red('Error while reading files'));
  }
  try {
    srcFileContent = JSON.parse(srcFileHandle);
    destFileContent = JSON.parse(dstFileHandle);
  } catch (err) {
    console.log(chalk.red(`Error with JSON content in file ${file}.`))
  }

  if (!(JSON.stringify(srcFileContent) === JSON.stringify(destFileContent))) {
    modifiedForms.push(file);
  }
}

function executeCopyAndLoop() {

  if (modifiedForms.length > 0) {
    console.log(chalk.greenBright("There are changes in the following forms:"));
    modifiedForms.forEach((file, i) => {
      modifiedFileMap[i] = file
      console.log( chalk.red(file), chalk.red(`: ${i}`),);
    })

    var userInput = readline.question(chalk.bgBlue("Select the form key you want to update or press x to cancel?\n"));

    while (userInput.toLowerCase() !== "x" && modifiedForms.length > 0) {
      
        let fileName = modifiedFileMap[userInput];
        if (fileName) {
          let srcFile = JSON.parse(fs.readFileSync(sourceDirectory + `/${fileName}`));
          fs.writeFileSync(`${destinationDirectory}/${fileName}`, JSON.stringify(srcFile, null, 2), (err) => {
            if (err) {
              console.log("Error while writing file: ", err);
            }
          })
          console.log(chalk.blueBright(`Form ${fileName} has been modified!`))
        } else {
          console.log(chalk.red(`Form is not found, Enter valid number`))
        }
        modifiedForms = modifiedForms.filter(x => x !== fileName)
        if(modifiedForms.length > 0){
          console.log(chalk.greenBright("There are changes in the following forms:"));
          modifiedForms.forEach((file, i) => {
            modifiedFileMap[i] = file
            console.log( chalk.red(file), chalk.red(`: ${i}`),);
          })
          userInput = readline.question(chalk.bgBlue("Enter the form number you want to update or press x to cancel?\n"));
        }else{
            console.log(chalk.green("All forms are Up-To-Date"))
            break;
      }
    }
  } else {
    console.log(chalk.green("All forms are Up-To-Date"))
  }
}

function printSummary() {
  if (newForms.length > 0) {
    console.log(chalk.red(`The following`,newForms.length,`new forms were added`));
    newForms.forEach(file => {
      console.log(chalk.blue(file))
    })
  }
}

handleFormsCopy();
executeCopyAndLoop();
printSummary();