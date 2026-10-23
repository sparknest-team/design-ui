<template>
  <div v-if="fetch">
    <c-map-select
      v-model:modelValue="value"
      show-name
      :map-type="mapType"
      show-locate-me-button
      enableGisSearch
      show-edit-address-button
      clearable
      :mapStyle="{
        height: '300px',
      }"
      :fetch="fetch"
      :valueKeyAlias="valueMap"
      :valueKeyScope="valueList"
      @change="changeHandler" />
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  setup() {
    const token = ref<string>('')
    const mapType = ref<'amaps' | 'google' | 'qqmaps'>('amaps')
    const fetch = ref<{ get: any; post: any }>()
    onMounted(() => {
      // 需要在项目中自行解决 _AMapSecurityConfig 的问题。
      ;(window as any)._AMapSecurityConfig = {
        securityJsCode: base64ToString('NDA1NTg5NTM3MTViZjA5ZDQ5ZGM2NTc2OWM0YjZjZTQ='),
      }
      // TODO: 脱敏迁移 - @maplejs/mfe-vue3 暂不可用，接入新的 Fetch 驱动后再恢复
    })
    let timer: any
    const geocoderHandler = async (lng: number, lat: number) => {
      console.log('handleGeocode-location', lng, lat)
      if (!lng || !lng) {
        return {}
      }
      const locationInfo = await new Promise((resolve) => {
        const pramas = {
          location: `${lat},${lng}`,
          longitude: lng,
          latitude: lat,
          output: 'jsonp',
          key: '55f594f57263aa0d1614bd22160b2afb',
        }
        if (timer) {
          clearTimeout(timer)
        }
        timer = setTimeout(async () => {
          // const res = await gisClient.getLocationRgeo(pramas) // TODO: 需要替换为新的接口
          const res = {
            address: `${lat},${lng}`,
            poi: '北京市',
            country: '中国',
            countryCode: 'CN',
            province: '北京市',
            city: '北京市',
            areaCode: '110101',
          }
          resolve({
            address: res.address,
            name: res?.poi,
            country: res?.country,
            countryCode: res.countryCode,
            province: res?.province,
            city: res?.city,
            adcode: res?.areaCode,
            latitude: lat, // 返回传入的原始经纬度，避免坐标转换带来的偏差
            longitude: lng,
          })
        }, 200)
      })
      return locationInfo
    }

    function changeHandler(changeValue: any, innerValue: any) {
      console.log('changeHandler---valueValue', value.value)
      console.log('changeHandler---changeValue', changeValue)
      console.log('changeHandler---innerValue', innerValue)
    }

    function geocoder(value: any) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            address: 'address',
            lat: 39.11408,
            lng: 112.99787,
          })
        }, 5000)
      })
    }

    function init() {
      token.value = localStorage.getItem('token') || ''
      mapType.value = (localStorage.getItem('mapType') as any) || 'amaps'
    }

    onMounted(() => {
      init()
    })

    // const value = ref({ address: '1212', lat: 39.11408, lng: 112.99787 })
    const value = ref()

    class Test {
      address = '我是地址哈啊哈'
      aliname = '我是名字'
      adcode = '123'
      city = '1233'
      lat = 39.11408
      lng = 112.99787
    }

    const valueList = ref(['address', 'name', 'longitude', 'latitude'])
    const valueMap = ref({
      longitude: 'lng',
      latitude: 'lat',
      address: 'address',
      name: 'aliname',
      adcode: 'adcode',
      countryCode: 'countryCode',
      city: 'city',
    })
    setTimeout(() => {
      value.value = { lat: 39.11408, lng: 112.99787 } as any
    }, 3000)

    return { mapType, token, value, geocoder, changeHandler, geocoderHandler, fetch, valueList, valueMap }
  },
})
</script>
