<template>
  <n-result status="404" title="404 Not Found" description="You know life is always ridiculous.">
    <template #footer>
      <n-button @click="$router.push('/Overview')">Back Overview</n-button>
    </template>
  </n-result>
</template>
<style lang="scss" scoped></style>
<script setup lang="ts"></script>
