<template>
  <iframe
    src="http://localhost:1881"
    height="auto"
    width="100%"
    onload="this.height = document.body.offsetHeight - 110; window.addEventListener('resize', () => this.height = document.body.offsetHeight - 110);"
  ></iframe>
</template>

<script>
export default {
  name: "FUXA",
  data: () => ({}),
};
</script>