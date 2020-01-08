let loadingRender = (function () {
    let $loadingBox = $('.loadingBox'),
        $current = $loadingBox.find('.currentProgress');

    let imgData = ["img/icon.png", "img/zf_concatAddress.png", "img/zf_concatInfo.png", "img/zf_concatPhone.png", "img/zf_course.png", "img/zf_course1.png", "img/zf_course2.png", "img/zf_course3.png", "img/zf_course4.png", "img/zf_course5.png", "img/zf_course6.png", "img/zf_cube1.png", "img/zf_cube2.png", "img/zf_cube3.png", "img/zf_cube4.png", "img/zf_cube5.png", "img/zf_cube6.png", "img/zf_cubeBg.jpg", "img/zf_cubeTip.png", "img/zf_emploment.png", "img/zf_messageArrow1.png", "img/zf_messageArrow2.png", "img/zf_messageChat.png", "img/zf_messageKeyboard.png", "img/zf_messageLogo.png", "img/zf_messageStudent.png", "img/zf_outline.png", "img/zf_phoneBg.jpg", "img/zf_phoneDetail.png", "img/zf_phoneListen.png", "img/zf_phoneLogo.png", "img/zf_return.png", "img/zf_style1.jpg", "img/zf_style2.jpg", "img/zf_style3.jpg", "img/zf_styleTip1.png", "img/zf_styleTip2.png", "img/zf_teacher1.png", "img/zf_teacher2.png", "img/zf_teacher3.jpg", "img/zf_teacher4.png", "img/zf_teacher5.png", "img/zf_teacher6.png", "img/zf_teacherTip.png"];

    // 预加载图片
    let run = function run(callback) {
        let n = 0,
            len = imgData.length;
        imgData.forEach(item => {
            let tempImg = new Image;
            tempImg.onload = () => {
                tempImg = null;
                $current.css('width', (++n / len) * 100 + '%');

                //加载完成,执行回调函数（让当前Loading页面消失，）
                if (n === len) {
                    clearTimeout(delayTimer);
                    callback && callback();
                }
            };
            tempImg.src = item;
        })
    };

    // 设置最长等待时间（假设10s,到达10s的时候，我们看加载了多少，如果达到了90%以上，我们可以正常访问内容了，如果不足这个比例，直接提示用户，当前网络不好，稍后重试）
    let maxDelay = function maxDelay(callback) {
        delayTimer = setTimeout(() => {
            if (n / len >= 0.9) {
                $current.css('width', '100%');
                callback && callback();
                return;
            }
            alert("网络不佳，请稍后再试！");
            // 此时我们不应该继续加载页面，而应该关闭页面或者跳转到其他页面
            window.location.href = "https://www.baidu.com";
        }, 10000);
    };

    // 完成后
    let done = function done() {
        let timer = setTimeout(() => {
            // 让用户看到进度条，停留一秒钟再进入下一环节
            $loadingBox.remove();
            phoneRender.init();
        }, 1000);
    }
    return {
        init: function () {
            $loadingBox.css('display', 'block');
            run(done);
            maxDelay(done);

        }
    }
})();

//loadingRender.init();

//开发过程中，由于当前项目板块众多（每一个板块都是一个单例），我们最好规划一种机制：通过标识的判断可以让程序只执行对应板块内容，这样开发哪个板块，我们就把标识改为哪个板块（HASH路由控制）
let phoneRender = (function () {
    let $phoneBox = $('.phoneBox'),
        $time = $phoneBox.find('h2 span'),
        $answer = $phoneBox.find('.answer'),
        $answerMarkLink = $answer.find('.markLink'),
        $hangUp = $phoneBox.find('.hangUp'),
        $hangUpMarkLink = $hangUp.find('.markLink'),
        answerBell = $('#answerBell')[0],
        introduction = $('#introduction')[0];

    let answerMarkTouch = function answerMarkTouch() {
        $answer.remove();
        // 一定要先暂停播放，然后再移除，否则，即使移除了标签，浏览器也会播放这个声音
        answerBell.pause();
        $(answerBell).remove();
        $hangUp.css({
            transform: 'translateY(0rem)'
        });
        introduction.play();
        $time.css('display', 'block');

        computedTime();
    }

    let computedTimer = null;
    let durationTime = 0;
    let computedTime = function computedTime() {
        introduction.oncanplay = function () {
            //我们让audio播放，它首先会加载资源，部分资源加载完成才会播放，才会计算出总的时间，所以
            // 我们可以把获取信息放到canplay监听事件中
            durationTime = introduction.duration;
            console.log(durationTime);
        }
        computedTimer = setInterval(() => {
            let timeValue = introduction.currentTime,
                minute = Math.floor(timeValue / 60),
                seconds = Math.floor(timeValue - minute * 60);
            if (timeValue >= durationTime) {
                clearInterval(computedTimer);
                closePhone();
                return;
            }
            minute = minute < 10 ? '0' + minute : minute;
            seconds = seconds < 10 ? '0' + seconds : seconds;

            $time.html(`${minute}:${seconds}`);
        }, 1000);

    }
    let closePhone = function () {
        clearInterval(computedTimer);
        introduction.pause();
        $(introduction).remove();
        $phoneBox.remove();
        messageRender.init();
    };
    return {
        init: function () {
            $phoneBox.css('display', 'block');
            // 播放bell
            answerBell.play();
            //console.dir(answerBell);
            answerBell.volume = 0.3;

            $answerMarkLink.tap(answerMarkTouch);
            $hangUpMarkLink.tap(closePhone);
        }
    }
})();

let messageRender = (function () {
    /**
     * 
     */
    let $messageBox = $('.messageBox'),
        $wrapper = $messageBox.find('.wrapper'),
        $messageList = $wrapper.find('li'),
        $keyBoard = $messageBox.find('.keyboard'),
        $txtInp = $keyBoard.find('span'),
        $submit = $keyBoard.find('.submit');
    let step = -1, //当前展示信息的索引
        total = $messageList.length + 1, //记录的是信息的总数，自己还要发一条，所以要加1
        autoTimer = null,
        interval = 2000;//多久发一条，记录信息出现的间隔时间

    let messageHight = 0,
        curem = parseInt($('html').css('fontSize'));

    let showMessage = function showMessage() {
        //console.log('信息展示');
        ++step;
        if (step === 2) {
            clearInterval(autoTimer);
            handleSend();
            return;
            //已经展示两条了，此时我们暂时结束自动发布信息，让键盘出来，开始执行手动发送
        }
        if (step >= $messageList.length - 1) {
            clearInterval(autoTimer);
            closeMessage();
        }
        let $cur = $messageList.eq(step);//eq得到的是$对象，get得到的是原生JS对象
        $cur.addClass('active');
        messageHight += $cur.height() / curem + 0.4;
        if (messageHight > 8) {

            let changeH = 'translateY(-' + (messageHight - 8) + 'rem)';
            console.log(changeH);
            $wrapper.css('transform', changeH);
        }
        //console.log(messageHight);
    };
    //手动发送
    let handleSend = function handleSend() {
        $keyBoard.css('transform', 'translateY(0rem)').one('transitionend', () => {
            // transitionend,监听当前元素transition动画结束的事件，并且有几个样式属性改变，并且执行了过渡效果，事件就会被触发几次
            // 用One方法用于事件绑定，只会让其触发一次
            let str = '好的，马上介绍!', textTimer = null;
            n = -1;
            textTimer = setInterval(() => {
                let orginhtml = $txtInp.html();
                $txtInp.html(orginhtml + str[++n]);
                if (n >= str.length - 1) {
                    // 文字完成，清除定时器
                    clearInterval(textTimer);
                    $submit.css('display', 'block');
                }
            }, 200);
        });
    };

    let handleSubmit = function handleSubmit() {
        // 把新创建的li增加到第二个Li的后面并且显示出来
        $(`<li class="self">
        <i class="arrow"></i>
        <img src="./img/zf_messageStudent.png" alt="" class="pic">
        ${$txtInp.html()}
    </li>`).insertAfter($messageList.eq(1)).addClass('active');
        $messageList = $wrapper.find('li');
        // 我们需要重新获取Li,让messagelist和页面中的li和messagelist一一对应，方便后期根据索引展示信息
        //该消失的消失
        $txtInp.html('');
        $submit.css('display', 'none');
        $keyBoard.css('transform', 'translateY(3.7rem)');
        autoTimer = setInterval(showMessage, interval);
    }
    //
    let closeMessage = function closeMessage() {
        $messageBox.remove();
        cubeRender.init();
    }
    return {
        init: function () {
            $messageBox.css('display', 'block');
            //加载页面立即展示一条信息，后期间隔interval再发送一条
            showMessage();
            autoTimer = setInterval(showMessage, interval);
            $submit.tap(handleSubmit);
            //继续向下展示信息
        }
    }
})();

/*CUBE*/
let cubeRender = (function () {
    let $cubeBox = $('.cubeBox'),
        $cube = $('.cube'),
        $cubeList = $cube.find('li');
    //手指控制旋转
    let start = function start(ev) {
        //记录手指按下时，所在位置的坐标
        let point = ev.changedTouches[0];
        this.strX = point.clientX;
        this.strY = point.clientY;
        this.changeX = 0;
        this.changeY = 0;
    }
    let move = function move(ev) {
        //用最新手指的位置减去起始的位置，记录X/Y轴的偏移
        let point = ev.changedTouches[0];
        this.changeX = point.clientX - this.strX;
        this.changeY = point.clientY - this.strY;
    }
    let end = function end(ev) {
        //获取change/rotate值
        let point = ev.changedTouches[0];
        let { changeX, changeY, rotateX, rotateY } = this;
        isMove = false;
        //验证是否移动
        Math.abs(changeX) > 10 || Math.abs(changeY) > 10 ? isMove = true : null;
        //只有发生移动才做处理
        if (isMove) {
            //左右滑动是按照Y轴旋转 changeX 操作的是 rotateY 正比
            //上下滑 changeY 操作 rotateX ,反比
            rotateX -= changeY / 3;
            rotateY += changeX / 3;
            //赋值给魔方盒子
            $(this).css('transform', `scale(.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg`);
            //为了让每次操作旋转角度小一点，我们可以让每次距离的1/3作为每次的旋转角度
            this.rotateX = rotateX
            this.rotateY = rotateY;
        }
        //清楚其他记录的自定义属性
        ['strX', 'strY', 'changeX', 'changeY'].forEach(item => this[item] = 0);
    }
    return {
        init: function () {
            $cubeBox.css('display', 'block');
            //手指操作cube,让cube旋转
            $cube[0].rotateX = -35; // 记录初始的旋转角度（存储到自定义属性上）
            $cube[0].rotateY = 35;

            $cube.on('touchstart', start)
                .on('touchmove', move)
                .on('touchend', end);
            
            //点击每一个面，跳转到详情区域对应的面
            $cubeList.tap(function(){
                $cubeBox.css('display','none');
                //跳转到详情区域，通过传递点击Li的索引，让其定位到具体的slide
                let index = $(this).index();
                detailRender.init(index);

            }); 
        }
    }
})();
let detailRender = (function () {
    let $detailBox = $('.detailBox'),
        swiper = null,
        $dl = $('.page1 > dl'),
        $return = $('.returnBack');
    let swiperInit = function swiperInit() {
        swiper = new Swiper('.swiper-container', {
            // initialSlide:1 初始页面为第二章
            //direction:'horizontal|vertical' 切换方向， 默认水平
            effect: 'coverflow',
            //loop:true //swip有一个bug，3d设置loop为true的时候偶尔会出现无法切换的情况（2d没有问题）
            //无缝切换的原理：把真实第一张克隆一份放到末尾，把真实最后一张也克隆一份放到开始（真实slide有五个，wrap中会有7个slide）
            //callback
            onInit: move,//初始化成功调取的回调函数
            //onTransitionEnd 动画结束
            onTransitionEnd: move

        });
        // 实例的私有属性
        //.activeIndex 当前展示的slide的索引
        //slides h获取所有的slide【数组】

        //实例的共有方法
        //slideTo 切换到指定索引的slide
    }
    let move = function move(swiper) {
        //参数是当前创建的实例
        //1，判断当前是否为第一个slide,如果是，让3d菜单展开，不是，收起
        let activeIn = swiper.activeIndex,
            slideAry = swiper.slides;
        slideAry.forEach((item, index) => {
            if (activeIn === index) {
                item.id = `page${index + 1}`;
                return;
            }
            item.id = null;
        });
        if (activeIn === 0) {
            $dl.makisu({
                selector: 'dd',
                overlap: 0.6,
                speed: 1
            });
            $dl.makisu('open');
        } else {
            $dl.makisu({
                selector: 'dd',
                overlap: 0.6,
                speed: 0
            });
            $dl.makisu('close');
        }
    }
    return {
        init: function (index=0) {
            $detailBox.css('display', 'block');
            if (!swiper) { //防止重复初始化
                swiperInit();//swiper初始化
            }
            //
            //实现折叠效果
            swiper.slideTo(index,0);//跳转到相对应的页面
            $return.on('click', function(){
                $detailBox.css('display','none');
                cubeRender.init();
            });

        }
    }
})();


let url = window.location.href,
    //获取当前页面的url机制 
    // window.location.href='xx' 跳转到某个页面
    well = url.indexOf('#'),
    hash = well === -1 ? null : url.substr(well + 1);

switch (hash) {
    case 'loading':
        loadingRender.init();
        break;
    case 'phone':
        phoneRender.init();
        break;
    case 'message':
        messageRender.init();
        break;
    case 'cube':
        cubeRender.init();
        break;
    case 'detail':
        detailRender.init();
        break;
    default:
        loadingRender.init();

}


