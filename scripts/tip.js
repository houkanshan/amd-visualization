;(function(exports){

var events = _.extend({}, Event)

var tipContainerTmpl = (function() {/*
  <div class="tip-container">
  </div>
*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1]

var tipTmpl = (function() {/*
  <p>
    <b>{{title}}: </b> {{content}}
  </p>
*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1]

function Tip(opts) {
  opts = opts || {}
  this.tipTmpl = opts.tipTmpl || tipTmpl
  this.container = opts.container || 'body'

  this.tipContainer = $(tipContainerTmpl)

  if(opts.extraKlass) {
    this.tipContainer.addClass(opts.extraKlass)
  }

  $(this.container).append(this.tipContainer)
}

_.extend(Tip.prototype, {
  set: function(contents) {
    this.tipContainer.empty()

    _.each(contents, function(content, title) {
      this.tipContainer.append(this.tipTmpl
        .replace(/{{title}}/g, title)
        .replace(/{{content}}/g, content)
      )
    }, this)
  },
  remove: function() {
    this.tipContainer.remove()
  }
})

exports.Tip = Tip

}(window))
