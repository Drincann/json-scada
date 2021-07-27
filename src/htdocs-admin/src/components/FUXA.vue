<template>
  <iframe
    :src="src"
    height="auto"
    width="100%"
    onload="this.height = document.documentElement.clientHeight - 120; window.addEventListener('resize', () => this.height = document.documentElement.clientHeight - 120);"
  ></iframe>
</template>

<script>
export default {
  name: "FUXA",
  data: () => ({
    src: window.location.protocol + "//" + window.location.hostname + ":1881",
  }),
};
</script>