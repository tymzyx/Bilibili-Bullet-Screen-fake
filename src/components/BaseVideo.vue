<template>
  <div class="base-video-wrapper">
    <div class="video-wrapper" @click="triggerStatus">
      <video-player ref="videoPlayer" class="video-player-box my-video"
                    :options="playerOptions"
                    @loadeddata="onPlayerLoadedData($event)"
                    @timeupdate="onPlayerTimeUpdate($event)"
      >
      </video-player>
    </div>

    <!--<div class="pauseStatus" v-show="isPaused && isStart">-->
      <!--<div @click="triggerStatus">-->
        <!--<i class="iconfont icon-play"></i>-->
      <!--</div>-->
    <!--</div>-->
    <div class="start-btn" @click="triggerStatus" v-if="isPaused">
      <button type="button">
        <i class="iconfont icon-play"></i>
      </button>
    </div>
    <div class="ctrl-bar-wrapper">
      <div class="ctrl-play">
        <i class="iconfont icon-play" v-if="!playerCtrl.isPlay" @click="triggerStatus"></i>
        <i class="iconfont icon-ai07" v-else @click="triggerStatus"></i>
      </div>
      <div class="ctrl-time-bar">
        <el-slider v-model="playerCtrl.currentTimeInt" :max="playerCtrl.durationInt"
              :format-tooltip="timeBarTipFormat" @change="timeBarChange"></el-slider>
      </div>
      <div class="ctrl-time-shower">
        <span>{{playerCtrl.currentTime}} / {{playerCtrl.duration}}</span>
      </div>
      <div class="ctrl-volume" id="ctrl-volume">
        <i class="iconfont icon-voice" v-if="!playerCtrl.isSilence" @click="triggerSilence"></i>
        <i class="iconfont icon-voice-close" v-else @click="triggerSilence"></i>
        <div class="ctrl-volume-bar" v-if="playerCtrl.isSetVolume">
          <el-slider v-model="playerCtrl.volume" :max="100" class="volume-slider" vertical height="60px"
                     @change="volumeBarChange"></el-slider>
        </div>
      </div>
      <div class="ctrl-resolution">
        <span id="resolution-text">{{playerCtrl.selectedResolution}}</span>
        <div class="ctrl-resolution-select" v-if="playerCtrl.isSetResolution" id="ctrl-resolution-select">
          <span v-for="item in playerCtrl.resolutions" @click="changeResolution(item.index)"
                :class="{'resolution-selected': item.index === playerCtrl.resolutionIndex}">{{item.text}}</span>
        </div>
      </div>
      <div class="ctrl-others">
        <div class="ctrl-bullet" id="ctrl-bullet">
          <i class="iconfont icon-ic_speaker_notes" v-if="playerCtrl.isBullet" @click="playerCtrl.isBullet = false"></i>
          <i class="iconfont icon-ic_speaker_notes_off" v-else @click="playerCtrl.isBullet = true"></i>
          <span v-if="playerCtrl.isTips.isTipBullet">
            {{playerCtrl.isBullet ? '关闭弹幕' : '打开弹幕'}}
          </span>
        </div>
        <div class="ctrl-circle" id="ctrl-circle">
          <i class="iconfont icon-xunhuan1" v-if="playerCtrl.isCircle" @click="playerCtrl.isCircle = false"></i>
          <i class="iconfont icon-jinzhi" v-else @click="playerCtrl.isCircle = true"></i>
          <span v-if="playerCtrl.isTips.isTipCircle">
            {{playerCtrl.isCircle ? '关闭洗脑循环' : '打开洗脑循环'}}
          </span>
        </div>
        <div class="ctrl-wide" id="ctrl-wide">
          <i class="iconfont icon-Television"></i>
          <span v-if="playerCtrl.isTips.isTipWide">
            宽屏模式
          </span>
        </div>
        <div class="ctrl-full" id="ctrl-full">
          <i class="iconfont icon-quanping" v-if="true" @click="fullScreen"></i>
          <i class="iconfont icon-tuichuquanping" v-else @click="fullScreen"></i>
          <span v-if="playerCtrl.isTips.isTipFull">
            {{playerCtrl.isFull ? '退出全屏' : '进入全屏'}}
          </span>
        </div>
      </div>
    </div>
    <!--弹幕-->
    <div class="send-bullet-wrapper">
      <div class="bullet-ctrl">
        <i class="iconfont icon-ic_speaker_notes"></i>
      </div>
      <div class="bullet-color-ctrl">
        <i class="iconfont icon-zhediemianban"></i>
      </div>
      <div class="bullet-shoot">
        <input v-model="bulletInfo.content" type="text" placeholder="您可以这里输入弹幕吐槽哦~">
        <span>弹幕礼仪<i class="iconfont icon-right"></i></span>
        <button type="button" @click="shootBullet">发送<i class="iconfont icon-right"></i></button>
      </div>
    </div>
    <div class="bullet-wrapper">
      <div class="text-box">
      </div>
    </div>
    <span class="length bullet-text"></span>

    <button type="button" @click="bulletPauseTrigger">点击就送</button>
  </div>
</template>

<script>
  // import $ from '../assets/js/jquery-vendor'
  // import '@egjs/jquery-pauseresume';

  import io from 'socket.io-client';

  import utils from '../assets/js/utils';

  let resolutions = [
    {text: '高清 720P', index: 0},
    {text: '清晰 480P', index: 1},
    {text: '流畅 360P', index: 2},
    {text: '自动(360P)', index: 3},
  ];

  export default {
    data() {
      return {
        playerOptions: {
          language: 'zh-CN',
          sources: [{
            type: "video/mp4",
            src: "https://cdn.theguardian.tv/webM/2015/07/20/150716YesMen_synd_768k_vp8.webm"
          }],
          controls:false,
        },
        isStart: true,
        isPaused: true,
        playerCtrl: {
          isPlay: false,
          isEnd: false,
          currentTimeInt: 0,
          durationInt: 0,
          duration: 0,
          currentTime: 0,
          volume: 10,  // 音量控制
          isFullScreen: false,
          isBullet: true,  // 是否显示弹幕
          isCircle: false,  // 是否打开洗脑循环
          isFull: false,  // 是否全屏
          isSetVolume: false,  // 是否显示音量控制条
          isSilence: false,
          isSetResolution: false,  // 是否显示清晰度选择框
          resolutionIndex: 3,
          resolutions: resolutions,
          selectedResolution: '自动',
          isTips: {
            isTipBullet: false,
            isTipCircle: false,
            isTipWide: false,
            isTipFull: false
          }
        },
        socket: '',
        allBullet: [],
        bulletInfo: {
          content: '',
        },
        isBulletPause: true,  // 是否停止播放弹幕
      }
    },
    props: [],
    computed: {
      player() {
        return this.$refs.videoPlayer.player;
      }
    },
    mounted() {
      this.player.volume(this.playerCtrl.volume/100);

      this.initEvent();

      this.bulletAnimate('test test test', 'white', '20px');

      this.connect();
    },
    methods: {
      onPlayerLoadedData(player) {
        this.playerCtrl.durationInt = Math.floor(player.duration()); // 获取视频的时长（单位：秒）
        this.playerCtrl.duration = utils.secondToTime(this.playerCtrl.durationInt);
        this.playerCtrl.currentTime = utils.secondToTime(this.playerCtrl.currentTimeInt);
      },
      onPlayerTimeUpdate(player) {
        this.playerCtrl.currentTime = utils.secondToTime(player.currentTime());
        this.playerCtrl.currentTimeInt = Math.floor(player.currentTime());
        // console.log("当前音量",player.volume());
      },
      initEvent() {

        let _this = this;
        let resolutionText = document.getElementById("resolution-text");
        let inSelectResolution = false;
        resolutionText.addEventListener("mouseover", function() {
          _this.playerCtrl.isSetResolution = true;
          setTimeout(function() {
            let resolutionSelect = document.getElementById("ctrl-resolution-select");
            resolutionSelect.addEventListener("mouseenter", function() {
              _this.playerCtrl.isSetResolution = true;
              inSelectResolution = true;
            });
            resolutionSelect.addEventListener("mouseleave", function() {
              _this.playerCtrl.isSetResolution = false;
              inSelectResolution = false;
            });
          }, 10);
        });
        resolutionText.addEventListener("mouseout", function() {
          // _this.playerCtrl.isSetResolution = false;
          setTimeout(function() {
            if (!inSelectResolution) {
              _this.playerCtrl.isSetResolution = false;
            }
          }, 500);
        });

        let ctrlVolume = document.getElementById('ctrl-volume');
        ctrlVolume.addEventListener('mouseenter', function() {
          _this.playerCtrl.isSetVolume = true;
        });
        ctrlVolume.addEventListener('mouseleave', function() {
          setTimeout(function () {
            _this.playerCtrl.isSetVolume = false;
          }, 500);
        });

        let ctrlBullet = document.getElementById('ctrl-bullet');
        ctrlBullet.addEventListener('mouseenter', function() {
          _this.playerCtrl.isTips.isTipBullet = true;
        });
        ctrlBullet.addEventListener('mouseleave', function() {
          _this.playerCtrl.isTips.isTipBullet = false;
        });

        let ctrlCircle = document.getElementById('ctrl-circle');
        ctrlCircle.addEventListener('mouseenter', function() {
          _this.playerCtrl.isTips.isTipCircle = true;
        });
        ctrlCircle.addEventListener('mouseleave', function() {
          _this.playerCtrl.isTips.isTipCircle = false;
        });

        let ctrlWide = document.getElementById('ctrl-wide');
        ctrlWide.addEventListener('mouseenter', function() {
          _this.playerCtrl.isTips.isTipWide = true;
        });
        ctrlWide.addEventListener('mouseleave', function() {
          _this.playerCtrl.isTips.isTipWide = false;
        });

        let ctrlFull = document.getElementById('ctrl-full');
        ctrlFull.addEventListener('mouseenter', function() {
          _this.playerCtrl.isTips.isTipFull = true;
        });
        ctrlFull.addEventListener('mouseleave', function() {
          _this.playerCtrl.isTips.isTipFull = false;
        });

      },

      // 自定义控制条
      timeBarTipFormat(val) {
        return utils.secondToTime(val);
      },
      timeBarChange(val) {
        this.player.currentTime(val);
        this.playerCtrl.currentTimeInt = val;
        this.playerCtrl.currentTime = utils.secondToTime(val);
      },
      volumeBarChange(val) {
        this.playerCtrl.volume = val;
        this.player.volume(val/100);
        val = Math.floor(val);
        if (val == 0) {
          this.playerCtrl.isSilence = true;
        } else {
          this.playerCtrl.isSilence = false;
        }
      },
      triggerSilence() {
        if (this.playerCtrl.isSilence) {
          this.volumeBarChange(10);
        } else {
          this.volumeBarChange(0);
        }
      },
      changeResolution(index) {
        this.playerCtrl.resolutionIndex = index;
        this.playerCtrl.resolutions.forEach(val => {
          if (val.index === index) {
            this.playerCtrl.selectedResolution = val.text.substr(0, 2);
            return;
          }
        });
      },
      fullScreen() {
        if(!this.player.isFullscreen()){
          this.player.requestFullscreen();
          this.player.isFullscreen(true);
        }else{
          this.player.exitFullscreen();
          this.player.isFullscreen(false);
        }
      },
      videoStart() {
        this.isStart = true;
        this.isPaused = false;
        this.playerCtrl.isPlay = true;
        this.player.play();
      },
      triggerStatus() {
        if (!this.isStart) {
          return;
        }
        if (this.player.paused()) {
          this.isPaused = false;
          this.playerCtrl.isPlay = true;
          this.player.play();
        } else {
          this.isPaused = true;
          this.playerCtrl.isPlay = false;
          this.player.pause();
        }
        this.bulletPauseTrigger();
      },

      // 弹幕相关方法
      connect() {
        let _this = this;
        this.socket = io.connect('http://localhost:6677');
        this.socket.emit('setConnect', 'admin');

        this.socket.on('getBullet', function (data) {
          console.log('allBullet: ', data);
          if (data[0].status === 0) {
            console.log(data[0].message);
          } else {
            _this.allBullet = data;
            _this.playBullet();
          }
        });

        this.socket.emit('bulletRequest', {videoId: 'test'});
      },
      getBulletTime() {
        let date = new Date();
        let videoTime = this.player.currentTime();
        let year = String(date.getYear() + 1900);
        let month = String(date.getMonth() + 1);
        month = month.length === 1 ? '0' + month : month;
        let day = date.getDate();
        day = day.length === 1 ? '0' + day : day;
        let hour = date.getHours();
        hour = hour.length === 1 ? '0' + hour : hour;
        let minute = date.getMinutes();
        minute = minute.length === 1 ? '0' + minute : minute;
        let second = date.getSeconds();
        second = second.length === 1 ? '0' + second : second;
        return {
          videoTime: String(videoTime),
          sendTime: {
            Y: year,
            M: month,
            D: day,
            hh: hour,
            mm: minute,
            ss: second
          }
        }
      },
      shootBullet() {
        if (this.bulletInfo.content.trim() === '') {
          return;
        }
        let bulletTime = this.getBulletTime();
        this.bulletInfo.videoTime = bulletTime.videoTime;
        this.bulletInfo.sendTime = bulletTime.sendTime;
        this.bulletInfo.videoId = 'test';
        this.bulletInfo.content = this.bulletInfo.content.trim();
        this.bulletInfo.userId = 'admin';
        this.bulletInfo.color = 'white';
        this.bulletInfo.fontSize = '20px';
        this.socket.emit('saveBullet', this.bulletInfo);

        this.bulletAnimate(this.bulletInfo.content.trim(), 'white', '20px');
        this.bulletInfo.content = '';
      },
      playBullet() {
        let _this = this;
        setInterval(function() {
          _this.allBullet.forEach(val => {
            if (_this.player.currentTime() == val.videoTime && !_this.isPaused) {
              _this.bulletAnimate(val.content, val.color, val.fontSize);
            }
          });
        }, 1000);
      },
      bulletAnimate(content, color, fontSize) {
        content = content.toString();
        let lengthDom = $('.length');
        lengthDom.eq(0).show();
        let length = lengthDom.html(content).eq(0).width();
        lengthDom.eq(0).hide();
        let time = ((400 - length) / 100 + 13) * 800;
        $('.bullet-wrapper .text-box').eq(0).append(`<p class="bullet-text">${content}</p>`);
        let top = 22 * Math.floor(Math.random() * 420 / 22);

        $('.bullet-wrapper .bullet-text').last().css({
          'top': `${top}px`,
          'left': '720px',
          'width': `${length}px`,
          'color': color,
          'font-size': fontSize
        }).animate({
          left: `-${length}px`
        }, time, 'linear', function(){
          $(this).remove();
        });

        if (this.isPaused) {
          $('.bullet-wrapper .bullet-text').last().pause();
        }
      },
      bulletPauseTrigger() {
        if (this.isBulletPause) {
          $('.bullet-wrapper .bullet-text').resume();
          this.isBulletPause = false;
        } else {
          $('.bullet-wrapper .bullet-text').pause();
          this.isBulletPause = true;
        }
      }
    }
  }
</script>

<style>
  .base-video-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .video-wrapper {
    width: 100%;
    height: 100%;
  }
  .my-video {
    width: 100%;
    height: 100%;
  }
  .vjs_video_3-dimensions, .video-js {
    width: 100%;
    height: 100%;
  }
  .start-btn {
    position: absolute;
    right: 30px;
    bottom: 24px;
    z-index: 100;
  }
  .start-btn button {
    width: 50px;
    height: 40px;
    display: flex;
    cursor: pointer;
    box-sizing: border-box;
    border: 1px solid rgba(200, 200, 200, 0.6);
    background: rgba(200, 200, 200, 0.6);
    border-radius: 8px;
    outline: none;
    align-items: center;
    justify-content: center;
  }
  .start-btn i {
    font-size: 20px;
    color: #eee;
  }
  .pauseStatus {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(10, 10, 10, 0.6);
    z-index: 101;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pauseStatus div {
    width: 80px;
    height: 60px;
    background: rgba(200, 200, 200, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    cursor: pointer;
  }
  .pauseStatus i {
    font-size: 34px;
    color: #ddd;
  }
  .ctrl-bar-wrapper {
    height: 32px;
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-top: 1px solid #fff;
  }
  .ctrl-play {
    padding: 0 8px;
  }
  .ctrl-play i, .ctrl-volume i {
    font-size: 24px;
    color: #888;
    cursor: pointer;
  }
  .ctrl-time-bar {
    flex: 1;
  }
  .el-slider__button {
    width: 8px;
    height: 8px;
  }
  .ctrl-time-shower {
    padding: 0 8px;
    font-size: 12px;
    color: #888;
  }
  .ctrl-volume {
    position: relative;
  }
  .ctrl-volume-bar {
    position: absolute;
    top: -74px;
    left: 0;
    width: 22px;
    height: 60px;
    padding: 8px 0;
    border-radius: 2px;
    display: flex;
    justify-content: center;
    background: #fff;
  }
  .volume-slider {
    flex: 1;
  }
  .ctrl-resolution {
    position: relative;
    padding: 0 24px;
    font-size: 12px;
    color: #888;
  }
  .ctrl-resolution span {
    cursor: pointer;
  }
  .ctrl-resolution-select {
    position: absolute;
    top: -128px;
    left: -8px;
    width: 100px;
    height: 120px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    background: #fff;
  }
  .ctrl-resolution-select span {
    flex: 1;
    display: flex;
    align-items: center;
  }
  .resolution-selected {
    color: dodgerblue;
  }
  .ctrl-others {
    display: flex;
    position: relative;
  }
  .ctrl-others div {
    font-size: 18px;
    color: #888;
    margin: 0 4px;
    cursor: pointer;
  }
  .ctrl-bullet span, .ctrl-circle span, .ctrl-wide span, .ctrl-full span {
    position: absolute;
    color: #fff;
    font-size: 12px;
    background: rgba(10, 10, 10, 0.6);
    padding: 3px;
    display: inline-block;
  }
  .ctrl-bullet span {
    left: -16px;
    top: -28px;
  }
  .ctrl-circle span {
    left: -4px;
    top: -28px;
  }
  .ctrl-wide span {
    left: 32px;
    top: -28px;
  }
  .ctrl-full span {
    left: 42px;
    top: -28px;
  }

  .bullet-wrapper {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  .length {
    display: none;
  }
  .bullet-text {
    font-size: 20px;
    line-height: 20px;
    position: absolute;
    top: -300px;
  }
  .send-bullet-wrapper {
    height: 40px;
    /*margin-top: 6px;*/
    display: flex;
    border: 1px solid #ddd;
    border-top: none;
  }
  .bullet-ctrl, .bullet-color-ctrl {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
  }
  .bullet-ctrl {
    margin: 0 20px 0 10px;
  }
  .bullet-color-ctrl {
    padding-right: 10px;
    border-right: 1px solid #ddd;
  }
  .bullet-ctrl i, .bullet-color-ctrl i {
    font-size: 18px;
  }
  .bullet-shoot {
    flex: 1;
    margin:0 10px 0 16px;
    display: flex;
    align-items: center;
    justify-content: right;
  }
  .bullet-shoot input {
    background-color: #fff;
    border: none;
    height: 24px;
    outline: none;
    flex: 1;
  }
  .bullet-shoot button {
    height: 36px;
    width: 66px;
    text-align: center;
    color: #fff;
    cursor: pointer;
    background: dodgerblue;
    box-sizing: border-box;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    outline: none;
  }
  .bullet-shoot i {
    font-size: 10px;
  }
  .bullet-shoot span {
    font-size: 14px;
    color: #888;
    margin:0 10px;
  }
</style>
