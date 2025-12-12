<template>
  <Pie :chart-data="chartData" :chart-options="chartOptions" />
</template>

<script setup>
import { defineProps } from 'vue'
import { Pie } from 'vue-chartjs'

defineProps({
  chartData: Object,
  chartOptions: Object
})
</script>
