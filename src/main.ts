import { createApp } from 'vue'
import './styles/global.sass'
import App from './App.vue'
import {createPinia} from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'
import dayjs from 'dayjs'
import dayjsRu from 'dayjs/locale/ru'
import dayjsUtc from 'dayjs/plugin/utc'
import dayjsTimezone from 'dayjs/plugin/timezone'
import dayjsWeekday from 'dayjs/plugin/weekday'
import dayjsFormat from 'dayjs/plugin/customParseFormat'
import dayjsMinMax from 'dayjs/plugin/minMax'

dayjs.locale(dayjsRu)
dayjs.extend(dayjsUtc)
dayjs.extend(dayjsTimezone)
dayjs.tz.setDefault('Europe/Moscow')
dayjs.extend(dayjsWeekday)
dayjs.extend(dayjsFormat)
dayjs.extend(dayjsMinMax)

const pinia = createPinia().use(piniaPersist)

createApp(App)
    .use(pinia)
    .mount('#app')
