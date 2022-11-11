import Vue from "vue"
import App from "./App.vue"
import uView from "uview-ui"
Vue.config.productionTip = false
Vue.use(uView)
uni.$u.config.unit = "rpx"
const app = new (
  typeof App === "function"
    ? App
    : Vue.extend(Object.assign({ mpType: "app" }, App))
)()
app.$mount()
