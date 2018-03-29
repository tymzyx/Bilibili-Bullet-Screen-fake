<template>
  <div class="player-window" id="player-window">
    <base-video ></base-video>
  </div>
</template>

<script>
  import BaseVideo from '../../components/BaseVideo'

  export default {
    data() {
      return {

      }
    },
    components: {BaseVideo},
    mounted() {

    }
  }
</script>

<style>
  .player-window {
    /*position: absolute;*/
    /*left: 50%;*/
    /*top: 40px;*/
    /*transform: translateX(-50%);*/
    width: 9rem;
    height: 6rem;
  }
</style>
