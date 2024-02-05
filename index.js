import {args} from "./argvParser.js";
import fs from "node:fs"
import CommandEmitter from "./commandEmitter.js";
import fileManager from "./fileManager.js";

console.log(`Welcome to the file manager, ${args.username}!`);
console.log(`You are currently in ${fileManager.path}`);
process.stdin.on('data', (data) => {
  let text = data.toString().trim();
  const currentBlockChar = {
    index: -1,
    open: false
  }
  const [command, ...args] = text.split(" ");
  //console.log(args);
  let newArguments = [];
  let flag = false;
  let tmpArg = "";
  for(let arg of args) {
    if(arg.startsWith(`"`) || arg.startsWith(`'`)) {
      flag = true;
      arg = arg.substring(1, arg.length);
    }
    if(flag) {
      tmpArg += arg + " ";
    }
    else {
      newArguments.push(arg);
    }
    if(arg.endsWith(`"`) || arg.endsWith(`'`)) {
      //arg = arg.substring(0, arg.length - 1);
      tmpArg = tmpArg.substring(0, tmpArg.length - 2);
      newArguments.push(tmpArg);
      tmpArg = "";
      flag = false;
    }
  }
  CommandEmitter.emit(command, ...newArguments);
  if(!CommandEmitter.eventNames().includes(command)) {
    console.log("Invalid input")
  }

});

