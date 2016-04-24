---
layout:     post
title:      "EventBus[1.register分析]"
subtitle:   "Android.EventBusRigster之源码分析"
date:       2016-04-20
author:     "Royal"
header-img: "img/post-bg-normal1.jpg"
tags:
    - Android
    - EventBus
    - fork Project
---

> Eventbus: Android optimized event bus that simplifies communication between Activities, Fragments, Threads, Services, etc. Less code, better quality.

1. 官方网址:[http://greenrobot.org/eventbus/](http://greenrobot.org/eventbus/)
2. github:[https://github.com/greenrobot/EventBus](https://github.com/greenrobot/EventBus)
3. Eventbus结构，流程，核心类分析 [codekk分析](http://a.codekk.com/detail/Android/Trinea/EventBus%20%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%90)
4. [自己测试demo](https://github.com/pengqinping/Android.demo/tree/master/app.eventbus)

#### 1.EventBus.register(Object subcriber)

```java

       /**
     * Registers the given subscriber to receive events. Subscribers must call {@link #unregister(Object)} once they
     * are no longer interested in receiving events.
     * <p/>
     * Subscribers have event handling methods that must be annotated by {@link Subscribe}.
     * The {@link Subscribe} annotation also allows configuration like {@link
     * ThreadMode} and priority.
     * 中文：注册suberscriber对象将会收到消息，订阅者如果不想收到消息需要调用 {@link #unregister(Object)} 方法取消,
     * 订阅者处理接受到的事件必须使用注解 {@link Subscribe} 来描述方法，
     * {@link Subscribe} 注解同样容许配置 {@link
     * ThreadMode} 和 优先级
     */
    public void register(Object subscriber) {
        // subsriberClass 表示订阅者对象的 class
        Class<?> subscriberClass = subscriber.getClass();
        // 对应 subscriberClass 所有 可以接受发布者发布的消息 的有 Subscribe 注解的方法的集合。
        List<SubscriberMethod> subscriberMethods = subscriberMethodFinder.findSubscriberMethods(subscriberClass);
        synchronized (this) {
            for (SubscriberMethod subscriberMethod : subscriberMethods) {
                subscribe(subscriber, subscriberMethod);
            }
        }
    }

```

首先我们看到订阅者接受消息的方法集合通过 subscriberMethodFinder.findSubscriberMethods来获取，
