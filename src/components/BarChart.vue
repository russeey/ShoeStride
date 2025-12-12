<template>
  <Bar :chart-data="chartData" :chart-options="chartOptions" />
</template>

<script setup>
import { defineProps } from 'vue'
import { Bar } from 'vue-chartjs'

defineProps({
  chartData: Object,
  chartOptions: Object
})
</script>
