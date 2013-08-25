// requrie d3
// requrie lodash
// reuqire tip
// requrie TreeToGraph
// requrie DependencyGraph


var tocTmpl = (function() {/*
  <p>
    <a href="#{{title}}">{{title}}</a>
  </p>
*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1]

var 
    pathsJson = './scripts/dep-trees/paths.json' 
  , width = 3000
  , height= 3000
  , win = $(window)
  , winHeight = win.height()
  , winWidth = win.width()
  , tip = new Tip()
  , toc = new Tip({
      tipTmpl: tocTmpl,
      extraKlass: 'right'
    })
  , graph

scrollToCenter(width/2, height/2)
loadToc()
bindSelector()

function loadToc() {

  d3.json(pathsJson, function(paths) {
    var names = _.keys(paths)
    toc.set(paths)

    listenHash(paths)
    if (!location.hash) {
      location.hash = names[0]
    }
  })
}

function listenHash(paths) {
  $(window).on('hashchange', onHashChange)
  onHashChange()

  function onHashChange() {
    var name = location.hash.slice(1)
      , fileName = paths[name]

    if (name.length === 0) {return}
    if (!fileName) { throw new Error('wrong hash') }

    renderGraph(fileName, this.type)
  }

}

function renderGraph(fileName, type)  {
  var fileFullName = fileName

  d3.json(fileFullName, function(data) {
    var graphData = (new TreeToGraph(data, {value:1})).generate()

    $('.container').empty()
    graph = new D3Config({
      width: width,
      height: height,
      data: graphData,
      container: ".container",
      tip: tip,
      type: this.type || 'network'
    })

    bindSearch(graphData.nodes)
  })
}

function scrollToCenter(x, y) {
  $('html, body')
    .animate({
      scrollTop: y - winHeight/2, 
      scrollLeft: x - winWidth/2
    }, 200)

}

function bindSelector() {
  var select = $('#graph-type')
    , self = this
  select.on('change', function(e){
    self.type = this.value
    graph.setType(self.type)
  })
}

function bindSearch(data) {
  var search = $('#search')
    , self = this
    , sources = data
    , finder = new Fuse(sources, {keys: ['name']})
    , results, currentIndex
  search.on('input', function(e) {
    var query = this.value
    results = finder.search(query)
    currentIndex = 0
    show = results[currentIndex]
    highlightNode(show)
  })
  search.on('keydown', function(e) {
    if (e.keyCode !== 13) {return} // Enter
    currentIndex = ++currentIndex >= results.length 
      ? currentIndex = 0
      : currentIndex
    highlightNode(results[currentIndex])
  })
}

function highlightNode(node) {
  if (!node) { return }
  scrollToCenter(node.x, node.y)
  graph.highlight(node)
}
