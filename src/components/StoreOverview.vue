<template>
  <div :class="['store-overview-page']">
    <div id="chart1" class="top-side"></div>
    <div id="chart2" class="top-center"></div>
    <div id="chart3" class="top-side"></div>
    <div id="chart4" class="bottom"></div>
    <div id="chart5" class="bottom"></div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/styles';

.store-overview-page {
  height: 100vh;
  padding: 88px 1rem 1rem 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;

  > div {
    border: 1px solid $border-color;
    padding: 1rem;
    &.top-side {
      height: calc(60% - 0.5rem);
      width: calc(25% - 2rem / 3);
    }
    &.top-center {
      height: calc(60% - 0.5rem);
      width: calc(50% - 2rem / 3);
    }
    &.bottom {
      height: calc(40% - 0.5rem);
      width: calc(50% - 0.5rem);
    }
  }
}
</style>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

async function initChart(id: string, option: any) {
  await nextTick()
  const chartDom = document.getElementById(id)!
  if (!chartDom) return

  if (typeof echarts.getInstanceByDom(chartDom) === 'undefined') {
    echarts.dispose(chartDom)
    let myChart = echarts.init(chartDom)
    option && myChart.setOption(option)
    window.addEventListener('resize', function () {
      setTimeout(() => {
        myChart.resize()
      }, 300)
    })
  } else {
    // @ts-ignore
    echarts.dispose(chartDom)
    echarts.init(chartDom)
    if (!chartDom) return
    option && echarts.getInstanceByDom(chartDom)?.setOption(option)
  }
}

const chartsInfo = [
  {
    id: 'chart1',
    option: {
      tooltip: {
        trigger: 'item'
      },
      title: {
        text: '本日銷售對象男女比例'
      },
      grid: {
        top: '0',
        left: '0',
        right: '0',
        bottom: '0'
      },
      series: [
        {
          name: '人數',
          type: 'pie',
          radius: ['40%', '80%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 59, name: '男' },
            {
              value: 120,
              name: '女',
              itemStyle: {
                color: 'red'
              }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'chart2',
    option: {
      title: {
        text: '各類商品周統計'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {},
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '上衣',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: '長褲',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: [220, 182, 191, 234, 290, 330, 310]
        },
        {
          name: '襯衫',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: [150, 232, 201, 154, 190, 330, 410]
        },
        {
          name: '裙子',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: [320, 332, 301, 334, 390, 330, 320]
        },
        {
          name: '外套',
          type: 'line',
          stack: 'Total',
          label: {
            show: true,
            position: 'top'
          },
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: [820, 932, 901, 934, 1290, 1330, 1320]
        }
      ]
    }
  },
  {
    id: 'chart3',
    option: {
      title: {
        text: '年度銷售'
      },
      legend: {
        data: ['今年', '去年'],
        right: '0'
      },
      tooltip: {},
      radar: {
        // shape: 'circle',
        indicator: [
          { name: '一月', max: 10000 },
          { name: '二月', max: 10000 },
          { name: '三月', max: 10000 },
          { name: '四月', max: 10000 },
          { name: '五月', max: 10000 },
          { name: '六月', max: 10000 },
          { name: '七月', max: 10000 },
          { name: '八月', max: 10000 },
          { name: '九月', max: 10000 },
          { name: '十月', max: 10000 },
          { name: '十一月', max: 10000 },
          { name: '十二月', max: 10000 }
        ]
      },
      series: [
        {
          name: 'Budget vs spending',
          type: 'radar',
          data: [
            {
              value: Array.from({ length: 12 }, (_) => 6000 + Math.random() * 4000),
              name: '今年'
            },
            {
              value: Array.from({ length: 12 }, (_) => 4000 + Math.random() * 6000),
              name: '去年'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'chart4',
    option: {
      xAxis: {
        type: 'category',
        data: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
      },
      title: {
        text: '本周購買量'
      },
      legend: {},
      tooltip: {},
      grid: {
        top: '60',
        left: '0',
        right: '0',
        bottom: '20'
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '本週',
          type: 'bar',
          data: [
            120,
            {
              value: 200,
              itemStyle: {
                color: '#a90000'
              }
            },
            150,
            80,
            70,
            110,
            130
          ],
          markPoint: {
            data: [
              { type: 'max', name: 'Max' },
              { type: 'min', name: 'Min' }
            ]
          }
        },
        {
          name: '上週',
          type: 'line',
          itemStyle: {
            color: 'orange'
          },
          data: [70, 130, 100, 40, 80, 260, 200],
          markPoint: {
            data: [
              { type: 'max', name: 'Max' },
              { type: 'min', name: 'Min' }
            ]
          }
        }
      ]
    }
  },
  {
    id: 'chart5',
    option: {
      tooltip: {},
      title: {
        text: '年度數據'
      },
      grid: {
        top: '60',
        left: '0',
        right: '0',
        bottom: '30'
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 20 }, (_, idx) => 2005 + idx)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: Array.from({ length: 20 }, (_, idx) => (Math.random() * 5000 + 5000).toFixed(0)),
          type: 'line',
          smooth: true
        }
      ]
    }
  }
]

onMounted(() => {
  for (const info of chartsInfo) {
    initChart(info.id, info.option)
  }
})
</script>
