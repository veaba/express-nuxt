/***********************
 * @name JS
 * @author Jo.gel
 * @date 9/9/2018
 ***********************/
module.exports = {
  name: 'I am name',
  fn: function (name, data) {
    console.info('hello');
    return this.name || 'always'
  }
}
