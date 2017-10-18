---
layout: post
title: "2.kotlin grammar"
header-color: "#AD64b7"
subtitle:   "Koltin语法了解"
date:       2017-08-13
author:     "Royal"
tags: 
    - Kotlin
---
[本文参考地址](http://www.runoob.com/kotlin/kotlin-basic-syntax.html)

## 包申明

```java
package com.twp.kontlin.demo 
```

## 函数定义
函数定义使用关键字 fun，参数格式为：参数 : 类型 , 语法有点像oc

```java
fun sum(a : Int ,b: Int): Int{
    return a+b;
}

//表达式作为函数体，返回类型自动推断： a+b 为表达式,作为了函数的返回
fun sum1(a: Int, b: Int) = a + b

// public 方法则必须明确写出返回类型
public fun sum2(a: Int, b: Int): Int = a + b


//无返回值的函数(类似Java中的void)：
fun printSum(a: Int, b: Int): Unit {
    println("not public method "+(a + b))
}


// 如果是返回 Unit类型，则可以省略(对于public方法也是这样)：
public fun printSum1(a: Int, b: Int) {
    println("public method "+(a + b))
}
```

## lambda

```java
//lambda表达式使用实例
val sumLambda: (Int, Int) -> Int = {x,y -> x+y}
val voidLambda: (Int ,Int) -> Unit ={x,y -> x+y ; println(" this is unit return method")}

println("lambda:"+sumLambda(10,10));
voidLambda(1,2);
```

## 常量&变量
```java
//常量和变量
//变量: var <标识符>:<类型>=<初始化值>
val firstval:Int = 100;
val secondVal = 200;
val thirdVal = "ddd";

//常量: val <标识符>:<类型>=<初始化值>
var finalVar = 5;
```

## 字符模板

```java
//字符串模板

fun stringMode():Unit {
    var firstString = 1
    // 模板中的简单名称：
    val s1 = "firstString is $firstString"
    println(s1)
    firstString = 2;

    // 模板中的任意表达式：
    val s2 = "${s1.replace("is", "was")}, but now is $firstString"
    println(s2)
}
```
