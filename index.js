#!/usr/bin/env node --harmony

const { sync } = require("cross-spawn");
const { exec } = require("child_process");

function normalize(args) {
  return args.map((arg) => {
    Object.keys(process.env)
      .sort((x, y) => x.length < y.length) // sort by descending length to prevent partial replacement
      .forEach((key) => {
        const regex = new RegExp(`\\$${key}|%${key}%`, "ig");
        arg = arg.replace(regex, process.env[key]);
      });
    return arg;
  });
}

let args = process.argv.slice(2);

if (args.length === 1) {
  const [command] = normalize(args);
  const proc = exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      process.exit(1);
    }
    process.stdout.write(stdout);
    process.stderr.write(stderr);
    process.exit(proc.code);
  });
} else {
  args = normalize(args);
  const command = args.shift();
  const proc = sync(command, args, { stdio: "inherit" });
  process.exit(proc.status);
}
