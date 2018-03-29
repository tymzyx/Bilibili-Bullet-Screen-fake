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

    <div class="pauseStatus" v-show="isPaused && isStart">
      <div @click="triggerStatus">
        <i class="iconfont icon-play"></i>
      </div>
    </div>
    <div class="start-btn" @click="videoStart" v-if="!isStart">
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
      <div class="ctrl-volume">
        <i class="iconfont icon-voice" v-if="true"></i>
        <i class="iconfont icon-voice-close" v-if="false"></i>
        <div class="ctrl-volume-bar" v-if="false">
          <el-slider v-model="playerCtrl.volume" :max="100" class="volume-slider" vertical height="60px"
                     @change="volumeBarChange"></el-slider>
        </div>
      </div>
      <div class="ctrl-resolution">
        <span>自动</span>
        <div class="ctrl-resolution-select">
          <span>高清 720P</span>
          <span>清晰 480P</span>
          <span>流畅 360P</span>
          <span>自动(480P)</span>
        </div>
      </div>
      <div class="ctrl-others">
        <div>
          <i class="iconfont icon-ic_speaker_notes" v-if="playerCtrl.isBullet" @click="playerCtrl.isBullet = false"></i>
          <i class="iconfont icon-ic_speaker_notes_off" v-else @click="playerCtrl.isBullet = true"></i>
        </div>
        <div>
          <i class="iconfont icon-xunhuan1" v-if="true"></i>
          <i class="iconfont icon-jinzhi" v-else></i>
        </div>
        <div>
          <i class="iconfont icon-Television"></i>
        </div>
        <div>
          <i class="iconfont icon-quanping" v-if="true" @click="fullScreen"></i>
          <i class="iconfont icon-tuichuquanping" v-else @click="fullScreen"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import utils from '../assets/js/utils'
  import ElSlider from "element-ui/packages/slider/src/main";

  export default {
    components: {ElSlider},
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
        isStart: false,
        isPaused: true,
        playerCtrl: {
          isPlay: false,
          isEnd: false,
          currentTimeInt: 0,
          durationInt: 0,
          duration: 0,
          currentTime: 0,
          volume: 10, // 音量控制
          voiceSlider: 50, // 声音控制
          isFullScreen: false,
          isBullet: true
        }
      }
    },
    props: [],
    computed: {
      player() {
        return this.$refs.videoPlayer.player;
      }
    },
    mounted() {
      this.player.volume(this.playerCtrl.volume/100)
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
      },
      videoStart() {
        this.isStart = true;
        this.isPaused = false;
        this.playerCtrl.isPlay = true;
        this.player.play();
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
    right: 0.2rem;
    bottom: 0.2rem;
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
    width: 100%;
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
    padding: 0 28px;
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
  .ctrl-others {
    display: flex;
  }
  .ctrl-others div {
    font-size: 18px;
    color: #888;
    margin: 0 4px;
    cursor: pointer;
  }
</style>
