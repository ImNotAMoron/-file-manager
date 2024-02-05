import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";

class FileManager {
  _getFileName(path) {
    let fileName = path.substring(path.lastIndexOf("/"));
    if (!fileName.includes(".")) throw "Not a file";
    if (fileName.startsWith("/")) return fileName.substring(1);
    return fileName;
  }

  _getFilePath(path) {
    let fileName = path.substring(0, path.lastIndexOf("/"));
    if (fileName.includes(".")) throw "Not a dir";
    return fileName;
  }

  _createAbsolutePath(newPath) {
    // TODO: Windows support
    if (newPath.startsWith("~")) newPath = newPath.replace("~", os.homedir, 1);
    if (newPath.startsWith("/")) {
      fs.accessSync(newPath);
      return path.join(newPath);
    } else {
      const mergedPath = path.join(this.path, newPath);
      fs.accessSync(mergedPath);
      return mergedPath;
    }
  }

  constructor() {
    this._path = os.homedir();
  }

  get path() {
    return this._path;
  }

  up() {
    this._path = this._createAbsolutePath("..")
  }

  cd(newPath) {
    const p = this._createAbsolutePath(newPath);
    if (!fs.lstatSync(p).isDirectory()) throw "Isn't a Directory"
    this._path = this._createAbsolutePath(newPath);
  }

  ls() {
    return fs.readdirSync(this._path, {withFileTypes: true});
  }

  cat(newPath) {
    const p = this._createAbsolutePath(newPath);
    return fs.createReadStream(p, {encoding: "utf-8"});
  }

  rn(filePath, name) {
    if (name.includes("/")) throw "The path is a dir!"
    const [_, ...dirPath] = this._createAbsolutePath(filePath).split("/").toReversed();
    fs.renameSync(this._createAbsolutePath(filePath), `${dirPath.toReversed().join("/")}/${name}`);
  }

  rm(filePath) {
    fs.rmSync(this._createAbsolutePath(filePath));
  }

  async cp(sourcePath, destinationPath) {
    const newFilePath = `${this._createAbsolutePath(destinationPath)}/${this._getFileName(sourcePath)}`;
    console.log(newFilePath);
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(newFilePath);
      const stream = fs.createReadStream(this._createAbsolutePath(sourcePath), {encoding: "utf-8"}).on('data', (data) => {
        writeStream.write(data);
      })
      stream.on("end", resolve);
      stream.on("error", reject)
    })
  }

  async mv(sourcePath, destinationPath) {
    await this.cp(sourcePath, destinationPath);
    this.rm(sourcePath);
  }

  async calculateHash(path) {
    const absolutePath = this._createAbsolutePath(path);
    const hashGenerator = crypto.createHash("sha256")
    const source = fs.createReadStream(absolutePath);
    let result = "";
    return new Promise((resolve, reject) => {
      const stream = source.pipe(hashGenerator).setEncoding('hex');
      stream.on("data", (data) => {
        result += data;
      });
      stream.on("end",() => resolve(result))
      stream.on('error', reject);
    })
  }

  async compress(path) {
    const absolutePath = this._createAbsolutePath(path);
    const writableStream = fs.createWriteStream(`${absolutePath}.br`, {encoding: "utf-8"});
    const brotli = zlib.createBrotliCompress();
    fs.createReadStream(absolutePath, {encoding: "utf-8"}).pipe(brotli).pipe(writableStream);
  }
  async decompress(path) {
    const absolutePath = this._createAbsolutePath(path);
    const writableStream = fs.createWriteStream(`${absolutePath}.decompressed`, {encoding: "utf-8"});
    const brotli = zlib.createBrotliDecompress();
    fs.createReadStream(absolutePath).pipe(brotli).pipe(writableStream);
  }
}

export default new FileManager();
