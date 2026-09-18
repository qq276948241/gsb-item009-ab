#!/usr/bin/env node
"use strict";

var fs = require("fs");

function 主程序(参数) {
  if (!参数 || 参数.length !== 3) {
    process.stderr.write("用法不对：请恰好给出一份文稿的路径\n");
    return 2;
  }
  var 路径 = 参数[2];
  var 正文;
  try {
    var 状态 = fs.statSync(路径);
    if (状态.isDirectory()) {
      process.stderr.write("这不是一份文稿：" + 路径 + "\n");
      return 2;
    }
    正文 = fs.readFileSync(路径, "utf8");
  } catch (错误) {
    process.stderr.write("读不了这份文稿：" + 路径 + "\n");
    return 2;
  }

  var 问题 = [];
  var 栈 = [];
  var 行号 = 1;
  var 下标 = 0;
  while (下标 < 正文.length) {
    var 字 = 正文.charAt(下标);
    if (字 === "\n") {
      行号 = 行号 + 1;
      下标 = 下标 + 1;
      continue;
    }
    if (字 === "「") {
      栈.push({ 种类: "单", 行: 行号 });
      下标 = 下标 + 1;
      continue;
    }
    if (字 === "『") {
      栈.push({ 种类: "双", 行: 行号 });
      下标 = 下标 + 1;
      continue;
    }
    if (字 === "」") {
      if (栈.length === 0) {
        问题.push("第" + 行号 + "行有右引号没有左引号");
      } else if (栈[栈.length - 1].种类 !== "单") {
        问题.push("第" + 行号 + "行两种引号缠在一起");
        栈.pop();
      } else {
        栈.pop();
      }
      下标 = 下标 + 1;
      continue;
    }
    if (字 === "』") {
      if (栈.length === 0) {
        问题.push("第" + 行号 + "行有右引号没有左引号");
      } else if (栈[栈.length - 1].种类 !== "双") {
        问题.push("第" + 行号 + "行两种引号缠在一起");
        栈.pop();
      } else {
        栈.pop();
      }
      下标 = 下标 + 1;
      continue;
    }
    下标 = 下标 + 1;
  }
  var 序号 = 0;
  while (序号 < 栈.length) {
    问题.push("第" + 栈[序号].行 + "行的左引号没有关上");
    序号 = 序号 + 1;
  }
  var 输出 = "";
  var 第几条 = 0;
  while (第几条 < 问题.length) {
    输出 = 输出 + 问题[第几条] + "\n";
    第几条 = 第几条 + 1;
  }
  if (输出.length > 0) {
    process.stdout.write(输出);
    return 1;
  }
  return 0;
}

if (require.main === module) {
  process.exit(主程序(process.argv));
}

module.exports = { 主程序: 主程序 };
