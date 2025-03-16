import Vue from "vue"
import App from "./App.vue"
import uView from "uview-ui"
import store from './store'

Vue.config.productionTip = false
Vue.use(uView)
uni.$u.config.unit = "rpx"

const app = new (
  typeof App === "function"
    ? App
    : Vue.extend(Object.assign({ mpType: "app" }, App))
)()

// 将store挂载到Vue实例上
Vue.prototype.$store = store

app.$mount()
