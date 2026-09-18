#!/usr/bin/env node
"use strict";

var fs = require("fs");

var 左引号种类表 = Object.create(null);
左引号种类表["「"] = "单";
左引号种类表["『"] = "双";

var 右引号种类表 = Object.create(null);
右引号种类表["」"] = "单";
右引号种类表["』"] = "双";

function 取左引号种类(字) {
  return 左引号种类表[字] || null;
}

function 取右引号种类(字) {
  return 右引号种类表[字] || null;
}

function 报错退出信息(消息) {
  process.stderr.write(消息 + "\n");
}

function 读文稿(路径) {
  try {
    var 状态 = fs.statSync(路径);
    if (状态.isDirectory()) {
      return { 失败: "目录" };
    }
    return { 正文: fs.readFileSync(路径, "utf8") };
  } catch (错误) {
    return { 失败: "读不了" };
  }
}

function 记一条问题(问题列表, 行号, 内容) {
  问题列表.push("第" + 行号 + "行" + 内容);
}

function 压入左引号(栈, 种类, 行号) {
  栈.push({ 种类: 种类, 行: 行号 });
}

function 处理右引号(栈, 问题列表, 种类, 行号) {
  if (栈.length === 0) {
    记一条问题(问题列表, 行号, "有右引号没有左引号");
    return;
  }
  if (栈[栈.length - 1].种类 !== 种类) {
    记一条问题(问题列表, 行号, "两种引号缠在一起");
    栈.pop();
    return;
  }
  栈.pop();
}

function 查文稿(正文) {
  var 问题列表 = [];
  var 栈 = [];
  var 行号 = 1;
  var 下标 = 0;
  while (下标 < 正文.length) {
    var 字 = 正文.charAt(下标);
    var 左种类 = 取左引号种类(字);
    var 右种类 = 取右引号种类(字);
    if (字 === "\n") {
      行号 = 行号 + 1;
    } else if (左种类 !== null) {
      压入左引号(栈, 左种类, 行号);
    } else if (右种类 !== null) {
      处理右引号(栈, 问题列表, 右种类, 行号);
    }
    下标 = 下标 + 1;
  }
  var 序号 = 0;
  while (序号 < 栈.length) {
    记一条问题(问题列表, 栈[序号].行, "的左引号没有关上");
    序号 = 序号 + 1;
  }
  return 问题列表;
}

function 拼成输出(问题列表) {
  var 输出 = "";
  var 第几条 = 0;
  while (第几条 < 问题列表.length) {
    输出 = 输出 + 问题列表[第几条] + "\n";
    第几条 = 第几条 + 1;
  }
  return 输出;
}

function 主程序(参数) {
  if (!参数 || 参数.length !== 3) {
    报错退出信息("用法不对：请恰好给出一份文稿的路径");
    return 2;
  }
  var 路径 = 参数[2];
  var 文稿 = 读文稿(路径);
  if (文稿.失败 === "目录") {
    报错退出信息("这不是一份文稿：" + 路径);
    return 2;
  }
  if (文稿.失败 === "读不了") {
    报错退出信息("读不了这份文稿：" + 路径);
    return 2;
  }
  var 输出 = 拼成输出(查文稿(文稿.正文));
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
