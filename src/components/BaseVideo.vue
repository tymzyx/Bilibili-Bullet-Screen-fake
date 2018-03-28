<template>
  <div class="base-video-wrapper">
    <div class="video-wrapper" @click="triggerStatus">
      <video-player ref="videoPlayer" class="video-player-box my-video"
                    :options="playerOptions"
                    @loadeddata="onPlayerLoadedData($event)"
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
  </div>
</template>

<script>
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
        isStart: false,
        isPaused: true,
        playerCtrl: {
          isPlay: false,
          isEnd: false,
          currentTimeInt:0,
          duration:0,
          currentTime:0,
          volume:0.5, // 音量控制
          voiceSlider:50, // 声音控制
          isFullScreen:false
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

    },
    methods: {
      onPlayerLoadedData(player) {
        this.playerCtrl.durationInt = Math.floor(player.duration()); // 获取视频的时长（单位：秒）
      },
      videoStart() {
        this.isStart = true;
        this.isPaused = false;
        this.player.play();
      },
      triggerStatus() {
        if (!this.isStart) {
          return;
        }
        if (this.player.paused()) {
          this.isPaused = false;
          this.player.play();
        } else {
          this.isPaused = true;
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
  .vjs_video_3-dimensions {
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
</style>
