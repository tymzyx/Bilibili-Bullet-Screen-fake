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
    width: 9.8rem;
    height: 4.8rem;
  }
</style>
