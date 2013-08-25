// require d3
// require lodash

;(function(exports){

function D3Config(options) {
  var width = options.width || 3000,
      height = options.height || 3000,
      graphData = options.data,
      container = options.container
      tip = options.tip
      this.type = options.type
      self = this

  var svg = d3.select(container).append("svg")
      .attr("width", width)
      .attr("height", height)

  var 
      colorMap = {
        'view': '#8FE862',
        'model': '#FFC700',
        'collection': '#E83B0B',

        'widget': '#30BBC7',

        'main':'#FF3A64',

        'lib': '#1D3D2A',

        'misc': '#D6F7CD'
    }

  var force, link, node 

  renderGraph()

  function renderGraph() {
    setForceLayout()
    setLinks()
    setNodes()
    nodeFollowForce()
    setTick()
  }

  function setForceLayout() {
    self.force = force = d3.layout.force()
          .gravity(.05)
          .distance(100)
          .charge(-180)
          .size([width, height])
          .theta(0.1)
          .linkStrength(0.01)

    force
      .nodes(graphData.nodes)
      .links(graphData.links)
      .linkDistance(function(link){
        return link.linkDistanceExp
       })
      .start()
  }

  function setLinks() {
    var line = d3.svg.line.radial()
        .interpolate("bundle")
        .tension(.85)
        .radius(function(d) { return d.y; })
        .angle(function(d) { return d.x / 180 * Math.PI; })
      , angle = d3.scale.ordinal().domain(d3.range(4)).rangePoints([0, 2 * Math.PI]),
        radius = d3.scale.linear().range([0, 100]),
        color = d3.scale.category10().domain(d3.range(20));


    link = svg.selectAll(".link")
        .data(graphData.links)
      .enter().append("line")
        .attr("class", "link")
        //.attr("d", d3.hive.link()
        //.angle(function(d) { return angle(d.x); })
        //.radius(function(d) { return radius(d.y); }))
        //.style("stroke", function(d) { return color(d.source.x); })

        .attr('data-source', function(d) {
          return normalizeName(d.sourceNode.name)
         })
        .attr('data-target', function(d) {
          return normalizeName(d.targetNode.name)
         })
  }

  function setNodes() {
    var circle, text

    node = svg.selectAll(".node")
        .data(graphData.nodes)
      .enter().append("g")
        .attr("class", "node")
        .attr('data-name', function(d) {
            return normalizeName(d.name)
          })

    circle = node.append("circle")
        .attr("class", "circle")
        .attr("r", function(d) {
          return Math.log(d.dependerCount+2) * 10
        })
        .style("fill", function(d) { 
          return colorMap[d.type]
        })

    text = node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name })

    node.each(function(d) {
      var level = d.longestDependLevel
        , preLevelNodesCnt = 
            _.size(graphData.levelsMap[level - 1 + ''])
              || _.size(graphData.levelsMap[level+''])
              || 1

      d.targetX = 400 * Math.log(level + 2) + 200
        + Math.log(d.dependingCount + 2) * 50
        - Math.log(d.dependerCount + 2) * 50
    })

    node.on('mouseover', mouseover)
    node.on('mouseout', mouseout)
  }


  function nodeFollowForce() {
    node.call(force.drag)
  }

  function setTick() {
    force.on("tick", function() {
      if (self.type === 'parallel') {
        // node limited on level
        node.each(function(d) {
          d.x = (d.x - d.targetX)*0.95 + d.targetX
        })
      }

    // link follow node
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; })

      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    })
  }


  function mouseover(d) {
    mouseout()
    svg.select('.node[data-name="'+normalizeName(d.name)+'"]')
      .classed('highlight', true)

    tip.set({
      'name': d.name,
      'requiredBy': '<span class="target">{{}}</span>'.replace('{{}}', d.dependerCount + ' mods'),
      'depend': '<span class="source">{{}}</span>'.replace('{{}}', d.dependingCount + ' mods'),
      'longestDependDepth': d.longestDependLevel,
      'dependStrength': d.dependingStrength,
      'type': d.type
    })

    svg.selectAll('.link[data-target="'+normalizeName(d.name)+'"]')
      .classed('target', true)
      .each(function(d) {
          var sourceName = normalizeName(d.sourceNode.name)
          svg.selectAll('.node[data-name="'+sourceName+'"]')
            .classed('highlight', true)
        })

    svg.selectAll('.link[data-source="'+normalizeName(d.name)+'"]')
      .classed('source', true)
      .each(function(d) {
          var targetName = normalizeName(d.targetNode.name)
          svg.selectAll('.node[data-name="'+targetName+'"]')
            .classed('highlight', true)
        })
  }

  function mouseout(d) {
    svg.selectAll('.source').classed('source', false)
    svg.selectAll('.target').classed('target', false)
    svg.selectAll('.highlight').classed('highlight', false)
  }

  // dirty but...
  this.mouseover = mouseover
  this.mouseout = mouseout

  function normalizeName(name) {
    return name.split('/').join('-')
  }


}

_.extend(D3Config.prototype, {
  setType: function(type) {
    this.type = type
    this.force.resume()
  },
  highlight: function(node) {
    this.mouseover(node)
  }
})


exports.D3Config = D3Config

}(window))
