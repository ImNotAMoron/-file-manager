import EventEmitter from "node:events";
import fileManager from "./fileManager.js";
import {args} from "./argvParser.js";
import os from "node:os";

const emitter = new EventEmitter();

function addCommandHandler(command, exec) {
  emitter.on(command, async (...args) => {
    try {
      await exec(...args);
    } catch (e) {
      console.log("Operation failed");
    }
    console.log(`You are currently in ${fileManager.path}`);
  });
}

function exit() {
  console.log(`Thank you for using File Manager, ${args.username}, goodbye!`);
  process.exit(0)
}

process.on("SIGINT", exit);

addCommandHandler(".exit", () => {
  exit();
})

addCommandHandler("up", () => {
  fileManager.up();
});
addCommandHandler("cd", (path) => {
  fileManager.cd(path);
})
addCommandHandler("ls", () => {
  const sortByName = (a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }
  const files = [...fileManager.ls().sort(sortByName)];
  console.table([...files.filter(el => el.isDirectory()), ...files.filter(el => !el.isDirectory())].map(el => {
    return {
      "Name": el.name,
      "Type": el.isDirectory() ? "directory" : "file"
    }
  }))
})

addCommandHandler("cat", async (path) => {
  return new Promise((resolve, reject) => {
    const stream = fileManager.cat(path).on("data", (data) => {
      console.log(data)
    })
    stream.on("end", resolve);
    stream.on("error", reject);
  })
})

addCommandHandler("rn", (filePath, name) => {
  fileManager.rn(filePath, name);
})

addCommandHandler("cp", async (sourcePath, destinationPath) => {
  await fileManager.cp(sourcePath, destinationPath)
});
addCommandHandler("rm", (path) => {
  fileManager.rm(path)
});
addCommandHandler("mv", async (sourcePath, destinationPath) => {
  await fileManager.mv(sourcePath, destinationPath)
})

addCommandHandler("os", async (argument) => {
  const option = argument.substring(2);
  switch (option) {
    case "EOL":
      console.log(os.EOL);
      break;
    case "cpus":
      const cpus = os.cpus();
      console.log(`CPUs amount: ${cpus.length}`);
      console.table(os.cpus().map((cpu) => {
        return {
          "model": cpu.model,
          "rate": `${cpu.speed/1000}GHz`
        }
      }))
      break;
    case "username":
      console.log(os.userInfo().username);
      break;
    case "architecture":
      console.log(os.arch());
  }
})
addCommandHandler("hash", async(path) => {
  console.log(await fileManager.calculateHash(path));
})

addCommandHandler("compress", async(path) => {
  await fileManager.compress(path);
})

addCommandHandler("decompress", async(path) => {
  await fileManager.decompress(path);
})

export default emitter;
