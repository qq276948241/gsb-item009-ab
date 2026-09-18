#!/usr/bin/env node
"use strict";

var fs = require("fs");

var 左引号 = { "「": "单", "『": "双" };
var 右引号 = { "」": "单", "』": "双" };
var 换行 = "\n";

var 退出码 = {
  没问题: 0,
  有问题: 1,
  用不了: 2
};

function 报错(消息) {
  process.stderr.write(消息 + "\n");
}

function 读文稿(参数) {
  if (!参数 || 参数.length !== 3) {
    return { 错误: "用法不对：请恰好给出一份文稿的路径" };
  }
  var 路径 = 参数[2];
  try {
    if (fs.statSync(路径).isDirectory()) {
      return { 错误: "这不是一份文稿：" + 路径 };
    }
    return { 正文: fs.readFileSync(路径, "utf8") };
  } catch (错误) {
    return { 错误: "读不了这份文稿：" + 路径 };
  }
}

function 处理右引号(种类, 行号, 问题, 栈) {
  if (栈.length === 0) {
    问题.push("第" + 行号 + "行有右引号没有左引号");
    return;
  }
  var 栈顶 = 栈[栈.length - 1];
  if (栈顶.种类 !== 种类) {
    问题.push("第" + 行号 + "行两种引号缠在一起");
  }
  栈.pop();
}

function 查引号(正文) {
  var 问题 = [];
  var 栈 = [];
  var 行号 = 1;
  for (var 下标 = 0; 下标 < 正文.length; 下标 = 下标 + 1) {
    var 字 = 正文.charAt(下标);
    if (字 === 换行) {
      行号 = 行号 + 1;
    } else if (Object.prototype.hasOwnProperty.call(左引号, 字)) {
      栈.push({ 种类: 左引号[字], 行: 行号 });
    } else if (Object.prototype.hasOwnProperty.call(右引号, 字)) {
      处理右引号(右引号[字], 行号, 问题, 栈);
    }
  }
  for (var 序号 = 0; 序号 < 栈.length; 序号 = 序号 + 1) {
    问题.push("第" + 栈[序号].行 + "行的左引号没有关上");
  }
  return 问题;
}

function 拼成输出(问题) {
  var 行 = [];
  for (var 第几条 = 0; 第几条 < 问题.length; 第几条 = 第几条 + 1) {
    行.push(问题[第几条]);
  }
  return 行.length === 0 ? "" : 行.join("\n") + "\n";
}

function 主程序(参数) {
  var 文稿 = 读文稿(参数);
  if (文稿.错误) {
    报错(文稿.错误);
    return 退出码.用不了;
  }
  var 输出 = 拼成输出(查引号(文稿.正文));
  if (输出.length > 0) {
    process.stdout.write(输出);
    return 退出码.有问题;
  }
  return 退出码.没问题;
}

if (require.main === module) {
  process.exit(主程序(process.argv));
}

module.exports = { 主程序: 主程序 };
