---
layout:     post
title:      "Android.EventBus[源码分析]"
subtitle:   "EventBus发送普通消息的流程"
date:       2016-04-20
author:     "Royal"
header-color: "#98BE47"
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
> 分析思路，以启动流程的逻辑来分析，没有任何前置条件。如果在越到变量值的问题，都以这个场景下的默认值带入

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

首先看到订阅者接受消息的方法集合通过 <code>subscriberMethodFinder.findSubscriberMethods</code> 来获取，我们看看**subscriberMethodFinder** 对象的实例化, 是在 *EventBus* 的构造器中进行注册的并且接受了 builer中的3个参数 <code>builder.subscriberInfoIndexes</code> , <code> builder.strictMethodVerification</code> , <code>builder.ignoreGeneratedIndex</code> *EventBusBuilder* 实例是个什么东东，看看就知道，**DEFAULT_BUILDER** 是个静态实例, <code> private static final EventBusBuilder DEFAULT_BUILDER = new EventBusBuilder();</code>

```java

    public EventBus() {
        this(DEFAULT_BUILDER);
    }

    EventBus(EventBusBuilder builder) {
        subscriptionsByEventType = new HashMap<>();
        typesBySubscriber = new HashMap<>();
        stickyEvents = new ConcurrentHashMap<>();
        mainThreadPoster = new HandlerPoster(this, Looper.getMainLooper(), 10);
        backgroundPoster = new BackgroundPoster(this);
        asyncPoster = new AsyncPoster(this);
        indexCount = builder.subscriberInfoIndexes != null ? builder.subscriberInfoIndexes.size() : 0;
        subscriberMethodFinder = new SubscriberMethodFinder(builder.subscriberInfoIndexes,
                builder.strictMethodVerification, builder.ignoreGeneratedIndex);
        logSubscriberExceptions = builder.logSubscriberExceptions;
        logNoSubscriberMessages = builder.logNoSubscriberMessages;
        sendSubscriberExceptionEvent = builder.sendSubscriberExceptionEvent;
        sendNoSubscriberEvent = builder.sendNoSubscriberEvent;
        throwSubscriberException = builder.throwSubscriberException;
        eventInheritance = builder.eventInheritance;
        executorService = builder.executorService;
    }

```

继续看看 *SubscriberMethodFinder* 的构造器中初始化了那些东西，那些是需要获取 **subscriberMethods** 这个集合使用的 首先看看入参值，参数值来源于 *EventBusBuiler* 的 **DEFAULT_BUILDER** 对象 so **DEFAULT_BUILDER**  的取值如下

1. <code>builder.subscriberInfoIndexes = null,</code>
2. <code>builder.strictMethodVerification = false;</code>
3. <code>builder.ignoreGeneratedIndex = false;</code>

那么 <code>EnventBus.getDefault().subscriberMethodFinder 取值</code> 注意其中 strictMethodVerification,ignoreGeneratedIndex 为 final修饰，所以这里就固定了它的取值

1. <code>subscriberMethodFinder.subscriberInfoIndexes = null,</code>
2. <code>subscriberMethodFinder.strictMethodVerification = false;</code>
3. <code>subscriberMethodFinder.ignoreGeneratedIndex = false;</code>

#### 2.SubscriberMethodFinder.findSubscriberMethods(Class<?> subscriberClass)

> 调用这个方法开始，才开始查找的第一步，**findSubscriberMethods** 中也仅仅是做了缓存读取，和空判断，以及从其他方法获取结果后存入缓存，其中有两种方式获取 **subscriberMethods** 的方式，两种方式的区别会在稍后解答。
 
```java

 List<SubscriberMethod> findSubscriberMethods(Class<?> subscriberClass) {
        //第一次进入肯定没有缓存，需要关心放到缓冲中的东西是什么，怎么来的？
        List<SubscriberMethod> subscriberMethods = METHOD_CACHE.get(subscriberClass);
        if (subscriberMethods != null) {
            return subscriberMethods;
        }

        //根据前置条件，这里第一次为false，可以看到我们通过这里就能获取到了 SubscriberMethod的集合
        if (ignoreGeneratedIndex) {
            subscriberMethods = findUsingReflection(subscriberClass);
        } else {
            subscriberMethods = findUsingInfo(subscriberClass);
        }
        if (subscriberMethods.isEmpty()) {
            throw new EventBusException("Subscriber " + subscriberClass
                    + " and its super classes have no public methods with the @Subscribe annotation");
        } else {
            METHOD_CACHE.put(subscriberClass, subscriberMethods);
            return subscriberMethods;
        }
    }

      private List<SubscriberMethod> findUsingInfo(Class<?> subscriberClass) {
        FindState findState = prepareFindState();
        findState.initForSubscriber(subscriberClass);
        while (findState.clazz != null) {
            //通过判断这里一般情况下 获取的 findState.subscriberInfo == null;
            findState.subscriberInfo = getSubscriberInfo(findState);
            if (findState.subscriberInfo != null) {
                SubscriberMethod[] array = findState.subscriberInfo.getSubscriberMethods();
                for (SubscriberMethod subscriberMethod : array) {
                    if (findState.checkAdd(subscriberMethod.method, subscriberMethod.eventType)) {
                        findState.subscriberMethods.add(subscriberMethod);
                    }
                }
            } else {
                findUsingReflectionInSingleClass(findState);
            }
            findState.moveToSuperclass();
        }
        return getMethodsAndRelease(findState);
    }

```


> So ,一般情况下我们都是通过 findUsingReflectionInSingleClass 这个方法去获取订阅者中，接受订阅消息的方法。 oh oh oh  真正的操作应该就是 **findUsingReflectionInSingleClass** 这个方法中了，果然也是通过反射机制，首先关于getDeclaredMethods()自行调试看下就知道是那些方法了。

```java

private void findUsingReflectionInSingleClass(FindState findState) {
        Method[] methods;
        try {
            // This is faster than getMethods, especially when subscribers are fat classes like Activities
            // findState.class == subscriberClass , about getDeclaredMethods method using baidu.com and google
            methods = findState.clazz.getDeclaredMethods();
        } catch (Throwable th) {
            // Workaround for java.lang.NoClassDefFoundError, see https://github.com/greenrobot/EventBus/issues/149
            methods = findState.clazz.getMethods();
            findState.skipSuperClasses = true;
        }
        for (Method method : methods) {
            int modifiers = method.getModifiers();
            //两个为操作符保证了方法的修饰符必须是 public, and non-static and non-abstract,
            if ((modifiers & Modifier.PUBLIC) != 0 && (modifiers & MODIFIERS_IGNORE) == 0) {
                //方法的参数类型集合
                Class<?>[] parameterTypes = method.getParameterTypes();
                //原则上只能有一个参数，所以这个参数一般是 消息载体 Event,也可以叫做订阅消息。
                if (parameterTypes.length == 1) {
                    //获取方法的注解描述
                    Subscribe subscribeAnnotation = method.getAnnotation(Subscribe.class);
                    if (subscribeAnnotation != null) {
                        //eventType表示事件类型
                        Class<?> eventType = parameterTypes[0];
                        if (findState.checkAdd(method, eventType)) {
                            //获取线程，findState.chackAdd的时候只有在第一次检测的时候才会返回true,其他时候都是false
                            ThreadMode threadMode = subscribeAnnotation.threadMode();
                            //这里终于创建了 SubscriberMethod 对象，并且放到了 findState对象中的 subscriberMethods 中。
                            findState.subscriberMethods.add(new SubscriberMethod(method, eventType, threadMode,
                                    subscribeAnnotation.priority(), subscribeAnnotation.sticky()));
                        }
                    }
                } else if (strictMethodVerification && method.isAnnotationPresent(Subscribe.class)) {
                    String methodName = method.getDeclaringClass().getName() + "." + method.getName();
                    throw new EventBusException("@Subscribe method " + methodName +
                            "must have exactly 1 parameter but has " + parameterTypes.length);
                }
            } else if (strictMethodVerification && method.isAnnotationPresent(Subscribe.class)) {
                String methodName = method.getDeclaringClass().getName() + "." + method.getName();
                throw new EventBusException(methodName +
                        " is a illegal @Subscribe method: must be public, non-static, and non-abstract");
            }
        }
    }


```

#### 2.EventBus.subscribe(Object subscriber,SubscriberMethod subscriberMethod);
通过注解拿到所有的消息接受的方法后，这里遍历所有的 subcriberMethods, 调用EventBus.subcriber开始注册，是在register开始完成的。

```java

 // Must be called in synchronized block
    private void subscribe(Object subscriber, SubscriberMethod subscriberMethod) {
        //eventType 这里指的是 接受订阅消息的方法的方法中的参数类型。
        //例如  在下面的方法中 eventType = MessageEvent.class
        /*
        @Subscribe
        public void onMessageEvent(MessageEvent event){
            Toast.makeText(getApplicationContext(),"received message "+event.message,Toast.LENGTH_LONG).show();
        }*/
        Class<?> eventType = subscriberMethod.eventType;
        //Subscription 是订阅对象，包涵了 subscriber:订阅者类，subscriberMethod:接受订阅消息的方法，
        Subscription newSubscription = new Subscription(subscriber, subscriberMethod);
        //通过类型获取到，类型相关的多有的 Subcription对象集合，
        CopyOnWriteArrayList<Subscription> subscriptions = subscriptionsByEventType.get(eventType);
        if (subscriptions == null) {
            //没有的时候才去加入，有的话直接报错，这里说明了一个问题，如果同一个订阅中出现两个接受订阅消息的方法的参数的类型是一样的会报错，:) 这都发现了，天才啊。
            subscriptions = new CopyOnWriteArrayList<>();
            subscriptionsByEventType.put(eventType, subscriptions);
        } else {
            if (subscriptions.contains(newSubscription)) {
                throw new EventBusException("Subscriber " + subscriber.getClass() + " already registered to event "
                        + eventType);
            }
        }

        int size = subscriptions.size();
        //这里size = 0 ,但是for循环会执行一次，恰好里面的if是可以执行的。 这样subscriptionsByEventType中的 subscriptions 就有值了。
        for (int i = 0; i <= size; i++) {
            if (i == size || subscriberMethod.priority > subscriptions.get(i).subscriberMethod.priority) {
                subscriptions.add(i, newSubscription);
                break;
            }
        }

        List<Class<?>> subscribedEvents = typesBySubscriber.get(subscriber);
        if (subscribedEvents == null) {
            subscribedEvents = new ArrayList<>();
            typesBySubscriber.put(subscriber, subscribedEvents);
        }
        subscribedEvents.add(eventType);
        //只有添加了 sticky注解的才有走这里， sticky 是做什么的呢？
        //Sticky 事件不同之处在于，当事件发布后，再有订阅者开始订阅该类型事件，依然能收到该类型事件最近一个 Sticky 事件。
        //所以这里如果是 sticky事件，这里就开始发送给订阅者，即使还没有post(event) 这里的event那里来的呢？sticky 的意义就来了，他是发布事件后，在有订阅者
        //也就是 之前就应该有发布过事件，这里是能够取到事件对象的。
        if (subscriberMethod.sticky) {

            if (eventInheritance) {
                // Existing sticky events of all subclasses of eventType have to be considered.
                // Note: Iterating over all events may be inefficient with lots of sticky events,
                // thus data structure should be changed to allow a more efficient lookup
                // (e.g. an additional map storing sub classes of super classes: Class -> List<Class>).
                Set<Map.Entry<Class<?>, Object>> entries = stickyEvents.entrySet();
                for (Map.Entry<Class<?>, Object> entry : entries) {
                    Class<?> candidateEventType = entry.getKey();
                    if (eventType.isAssignableFrom(candidateEventType)) {
                        Object stickyEvent = entry.getValue();
                        checkPostStickyEventToSubscription(newSubscription, stickyEvent);
                    }
                }
            } else {
                Object stickyEvent = stickyEvents.get(eventType);
                checkPostStickyEventToSubscription(newSubscription, stickyEvent);
            }
        }
    }

```



#### 3.EventBus.post(Object subcriber)
到这一步后订阅者所有的接受消息的方法都放在了**subscriberMethods**中，所以接下来继续分析 发送消息的流程。post的机制就比较简单了，在 post方法中做了一个简单的线程安全的控制然后遍历 队列，通过 **postSingleEvent**来处理单个消息。

```java

 private void postSingleEvent(Object event, PostingThreadState postingState) throws Error {
        //这里的event就是消息，
        Class<?> eventClass = event.getClass();
        boolean subscriptionFound = false;
        //默认的Builde对象中，eventInheritance = true;
        if (eventInheritance) {
            //获取
            List<Class<?>> eventTypes = lookupAllEventTypes(eventClass);
            int countTypes = eventTypes.size();
            for (int h = 0; h < countTypes; h++) {
                Class<?> clazz = eventTypes.get(h);
                subscriptionFound |= postSingleEventForEventType(event, postingState, clazz);
            }
        } else {
            subscriptionFound = postSingleEventForEventType(event, postingState, eventClass);
        }
        if (!subscriptionFound) {
            if (logNoSubscriberMessages) {
                Log.d(TAG, "No subscribers registered for event " + eventClass);
            }
            if (sendNoSubscriberEvent && eventClass != NoSubscriberEvent.class &&
                    eventClass != SubscriberExceptionEvent.class) {
                post(new NoSubscriberEvent(this, event));
            }
        }
    }

```


最终是通过反射的方式来实现的。

```java

//使用反射的方法调用 订阅消息的接受者，并且传入 event 对象
    void invokeSubscriber(Subscription subscription, Object event) {
        try {
            subscription.subscriberMethod.method.invoke(subscription.subscriber, event);
        } catch (InvocationTargetException e) {
            handleSubscriberException(subscription, event, e.getCause());
        } catch (IllegalAccessException e) {
            throw new IllegalStateException("Unexpected exception", e);
        }
    }

```





