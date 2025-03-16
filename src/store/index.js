import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import bill from './modules/bill'
import category from './modules/category'
import budget from './modules/budget'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    user,
    bill,
    category,
    budget
  }
})

export default store 