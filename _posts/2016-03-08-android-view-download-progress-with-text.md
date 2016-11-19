---
layout:     post
title:      "Android 自定义进度条"
subtitle:   "支持文字颜色半边显示"
date:       2016-03-08
author:     "Royal"
header-color: "#98BE47"
tags:
    - Android
    - view
---
#### 工作中遇到一个难题
> 有个进度条显示效果要求进度按照比例计算，但是文字显示效果和背景恰好相反，项目中的效果是前人留下的，现实方式非常随意，直接使用大图完成，导致小屏手机无法显示完整图片，大屏手机显示拉伸，英文状态根本没有，后面接手修改适配真是头疼，做成了.9 模式，但是适配依然蛋疼，最后没有办法终于还是准备重写自定View来完成效果。

最终的效果如下：
<img src="{{site.baseurl}}/img/in-post/post-android-view-progress-text/01.png" width="800" height="200"/>

#### 实战演练
下面简要描述下代码的实现，主要分为两个部分，第一个为文字显示效果。第二个为背景显示效果。

文字显示 `Progress.java`

```java
/*
 *
 *      Copyright (C) 2016. 彭钦平
 *
 *      Licensed under the Apache License, Version 2.0 (the "License");
 *      you may not use this file except in compliance with the License.
 *      You may obtain a copy of the License at
 *
 *           http://www.apache.org/licenses/LICENSE-2.0
 *
 *      Unless required by applicable law or agreed to in writing, software
 *      distributed under the License is distributed on an "AS IS" BASIS,
 *      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *      See the License for the specific language governing permissions and
 *      limitations under the License.
 *
 */
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Shader;
import android.util.AttributeSet;
import android.widget.TextView;
/**
 * Created by pengqinping on 16/3/7.
 *
 * @email Royal.k.peng@gmail.com
 * @description
 */
public class Progress extends TextView {
    public Progress(Context context) {
        super(context);
        init();
    }
    public Progress(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }
    public Progress(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }
    private void init(){
//        mPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    }
    private LinearGradient mLinearGradient;
    private Matrix mGradientMatrix;
    private Paint mPaint;
    private int mViewWidth = 0;
    private int mTranslate = 0;
    private boolean mAnimating = true;
    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        /*if (mViewWidth == 0) {
            mViewWidth = getMeasuredWidth();
            if (mViewWidth > 0) {
                mPaint = getPaint();
                mLinearGradient = new LinearGradient(-mViewWidth, 0, 0, 0,
                        new int[] {Color.RED, Color.RED,Color.WHITE, Color.WHITE },
                        new float[] { 0, 0.5f,0.5f, 1 }, Shader.TileMode.MIRROR);
                mPaint.setShader(mLinearGradient);
                mGradientMatrix = new Matrix();
            }
        }*/
    }
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        /*if (mAnimating && mGradientMatrix != null) {
            mTranslate += mViewWidth / 10;
            if (mTranslate > 2 * mViewWidth) {
                mTranslate = -mViewWidth;
            }
            mGradientMatrix.setTranslate(mTranslate, 0);
            mLinearGradient.setLocalMatrix(mGradientMatrix);
            *//*postInvalidateDelayed(50);*//*
        }*/
       /* mPaint = getPaint();
        mLinearGradient = new LinearGradient(0, 0, getWidth(), getHeight(),
                new int[]{ Color.WHITE, Color.WHITE,Color.parseColor("#f05858"), Color.parseColor("#f05858")},
                new float[]{0, 0.5f, 0.5f, 1}, Shader.TileMode.MIRROR);
        mPaint.setShader(mLinearGradient);*/
    }
    /**
     * progress 取值范围 (0-100)
     */
    public void setProgress(int progress){
        mPaint = getPaint();
        mPaint.setFlags(Paint.ANTI_ALIAS_FLAG);
        if(progress <= 0){
            //白底红字 so paint not set shader, and setColor = Color.parseColor("#f05858")
            mPaint.setColor(Color.parseColor("#f05858"));
            setTextColor(Color.parseColor("#f05858"));
            setText("开始下载");
        }else if(progress >= 100){
            //红底白字
            mPaint.setColor(Color.WHITE);
            setTextColor(Color.WHITE);
            setText("再次下载");
        }else{
            final float precent = (float) progress/100f;
            mLinearGradient = new LinearGradient(0, 0, getWidth(), 0,
                    new int[]{ Color.WHITE, Color.WHITE,Color.parseColor("#f05858"), Color.parseColor("#f05858")},
                    new float[]{0, precent, precent, 1}, Shader.TileMode.MIRROR);
            mPaint.setShader(mLinearGradient);
            setText("继续下载");
        }
        postInvalidateDelayed(50);
    }
}
```

背景显示 `ProgressBg.java`

```java
/*
 *
 *      Copyright (C) 2016. 彭钦平
 *
 *      Licensed under the Apache License, Version 2.0 (the "License");
 *      you may not use this file except in compliance with the License.
 *      You may obtain a copy of the License at
 *
 *           http://www.apache.org/licenses/LICENSE-2.0
 *
 *      Unless required by applicable law or agreed to in writing, software
 *      distributed under the License is distributed on an "AS IS" BASIS,
 *      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *      See the License for the specific language governing permissions and
 *      limitations under the License.
 *
 */
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;

/**
 * Created by pengqinping on 16/3/8.
 *
 * @email Royal.k.peng@gmail.com
 * @description
 */
public class ProgressBg extends View {

    public ProgressBg(Context context) {
        super(context);
        init();
    }

    public ProgressBg(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public ProgressBg(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }
    private void init(){
        mPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    }
    private LinearGradient mLinearGradient;
    private Paint mPaint;
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        setBackgroundColor(Color.WHITE);
//        mLinearGradient = new LinearGradient(0, 0, getWidth(), getHeight(),
//                new int[]{Color.WHITE, Color.WHITE, Color.parseColor("#f05858"), Color.parseColor("#f05858")},
//                new float[]{0, 0.5f, 0.5f, 1}, Shader.TileMode.REPEAT);
//        mPaint.setShader(mLinearGradient);
        mPaint.setColor(Color.parseColor("#f05858"));
        canvas.drawRect(0f, 0f, getWidth()*precent, getHeight(), mPaint);
        invalidate();
    }
    public float precent = 0.0f;
    /**
     * progress 取值范围 (0-100)
     */
    public void setProgress(int progress){
        Log.i("precent","precent:"+precent);
        if(progress <= 0){
            //白底红字 so paint not set shader, and setColor = Color.parseColor("#f05858")
            precent = 0.0f;
        }else if(progress >= 100){
            //红底白字
            precent = 1.0f;
        }else{
            precent = (float) progress/100f;

        }
        invalidate();

    }
}

```

调用方法 `demo.xml`

```xml
<FrameLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content">

            <com.nostra13.universalimageloader.sample.ProgressBg
                android:layout_width="match_parent"
                android:id="@+id/progress_bg"
                android:layout_height="40dp"
                android:minHeight="40dp" />

            <com.nostra13.universalimageloader.sample.Progress
                android:layout_width="match_parent"
                android:layout_height="40dp"
                android:id="@+id/progress_1"
                android:gravity="center"
                android:minHeight="30dp"
                android:text="再次学习"
                android:textSize="30sp" />
        </FrameLayout>
```

调用方法 `Demo.java`

```java
 Handler mHandler = new Handler();
    int progress_value = 0;
    Runnable setProgress = new Runnable() {
        @Override
        public void run() {
            if (progress_value > 100) {
                progress_value = 0;
            }
            progress.setProgress(progress_value);
            progressBg.setProgress(progress_value);
            progress_value = progress_value + 2;
            mHandler.postDelayed(this, 1000L);
        }
    };
```

具体的进度根据实际的下载来定。

[demo.apk](https://github.com/pengqinping/Android-Universal-Image-Loader/blob/master/downloads/sample-debug.apk)

