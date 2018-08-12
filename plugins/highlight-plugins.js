/***********************
 * @name JS
 * @author Jo.gel
 * @date 2018/2/21
 ***********************/
import Vue from 'vue'
import highlight from 'highlight'
import 'highlight.js/styles/googlecode.css'

Vue.directive('highlight', function (el) {
  let blocks = el.querySelectorAll('pre code')
  blocks.forEach((block) => {
    highlight.highlightBlock(block)
  })
})
export default highlight
