// require lodash
;(function(exports) {

  var typeDict = {
    main: /main|route|setup|app|config/,
    
    view: /view/,
    model: /model/,
    collection: /collection/,

    lib: /lib|jquery|underscore|backbone|zepto|lang|dollar/,
    widget: /module|util|mods|mod\/|widget|mo\/|moui|event|soviet|nerv/
  }

function TreeToGraph(inputTree, opts) {
  this.defaultForce = (opts && opts.value) || 1

  this.originTree = inputTree
}

_.extend(TreeToGraph.prototype, {
  generate: function() {
    this.nodesMap = {}

    this.generateNodesMap()
    this.indexMap = _.invert(_.keys(this.nodesMap))
    console.log(this.nodesMap)
    console.log(this.indexMap)

    this.generateNodes()
    this.generateLinks()

    this.setExtraNodeInfo()
    this.setExtraLinkInfo()

    this.generateLevelsMap()

    console.log(this.links)
    console.log(this.nodes)

    return {
      nodes: this.nodes
    , links: this.links
    , levelsMap: this.levelsMap
    , nodesMap: this.nodesMap
    }
  }

, generateNodesMap: function() {
    this.nodesMap = {}
    _.each(this.originTree, function(dependings, name) {
      this.checkContainsAndSet(this.nodesMap, name, {
        name: name
      , dependings: _.clone(dependings)
      , dependers: []
      })

      _.each(dependings, function(name){
        this.checkContainsAndSet(this.nodesMap, name, {
          name: name
        , dependings: _.clone(this.originTree[name]) || []
        , dependers: []
        })
      }, this)
    }, this)
  }

, generateNodes: function() {
    this.nodes = _.values(this.nodesMap)
  }

, generateLinks: function() {
    var links = []

    _.each(this.nodes, function(node, index) {
      _.each(node.dependings, function(dependingName) {
        var target = +this.indexMap[dependingName]
        links.push({
          source: index // depender
        , target: target // depending / be depended by source
        , sourceNode: node
        , targetNode: this.nodes[target]
        })
      }, this)
    }, this)

    this.links = links
  }

, checkContainsAndSet: function(map, name, node) {
    if (!_.contains(_.keys(map), name)) {
      map[name] = node
    }
  }

, setExtraNodeInfo: function() {
    // set node type
    _.each(this.nodes, function(node) {
      node.type = 'misc'
      _.any(typeDict, function(re, type) {
        if (re.test(node.name)) {
          node.type = type
          return true
        }
        return false
      })
    })
  
    // set dependers
    _.each(this.links, function(link) {
      var depending = link.targetNode
        , depender = link.sourceNode
      depending.dependers.push(depender.name)
    }, this)


    // set dependings & dependers counts
    _.each(this.nodesMap, function(node, name) {
      node.dependingCount = _.size(node.dependings)
      node.dependerCount = _.size(node.dependers)
    })

    // count dependingStrengths
    var distenceWeaken = 0.7
      , baseDependingStrength = 5
      , self = this

    _.each(this.nodesMap, function(node, name) {
      cutDependerLoop(node, [])
    })
    _.each(this.nodesMap, function(node, name) {
      node.dependingStrength = countDependingStrength(node)
      node.longestDependLevel = countLongestDependLevel(node)
    })

    function cutDependerLoop(node, stack) {
      var nodes = node.dependers
        , depender

      stack.push(node.name)
      _.each(nodes, function(dependerName){
        depender = self.nodesMap[dependerName]
        if(_.contains(stack, dependerName)) {
          console.log('cut', dependerName, stack)
          node.dependers = _.without(nodes, dependerName)
          depender.dependings = _.without(depender.dependerings, node.name)
        } else {
          cutDependerLoop(self.nodesMap[dependerName], stack)
        }
      })
      stack.pop()
    }

    function countDependingStrength(node) {
      var nodes = node.dependings
        , dependingStrengthSum = 0
        , longestDependLevel = 0


      if(!_.isUndefined(node.dependingStrength)) {
        return node.dependingStrength
      }

      _.each(nodes, function(dependingName) {
        dependingStrengthSum += countDependingStrength(self.nodesMap[dependingName]) + baseDependingStrength
      })

      if(dependingStrengthSum === 0) {
        node.dependingStrength = baseDependingStrength
      } else {
        node.dependingStrength = dependingStrengthSum * distenceWeaken
      }
      return node.dependingStrength
    }

    function countLongestDependLevel(node) {
      var longestDependLevel = 0
        , nodes = node.dependings

      _.each(nodes, function(nodeName) {
        longestDependLevel = 
          Math.max(
              countLongestDependLevel(self.nodesMap[nodeName]) + 1
            , longestDependLevel
            )
      })
      node.longestDependLevel = longestDependLevel
      return longestDependLevel
    }
  }

, setExtraLinkInfo: function() {
    var globalLongestDependLevel = _.max(this.nodes
          , function(node){
              return node.longestDependLevel
            }).longestDependLevel

    _.each(this.links, function(link) {
      link.linkStrength = link.targetNode.dependingStrength / 200
      this.linkDistance = 
        (link.sourceNode.longestDependLevel - link.targetNode.longestDependLevel)
      link.linkDistanceExp = Math.exp(this.linkDistance/globalLongestDependLevel * 3 + 8) / 40
    }, this)
  }

, generateLevelsMap: function() {
    var level
    this.levelsMap = {}
    _.each(this.nodes, function(node) {
      level = node.longestDependLevel + ''
      this.checkContainsAndSet(this.levelsMap, level, [])
      this.levelsMap[level].push(node)
    }, this)
  }

  // no use
, addNamePrefix: function(map, pathPrefix) {
    _.each(map, function(dependings, name) {
      if(name.indexOf(pathPrefix) !== 0) {
        inputTree[pathPrefix +'/' + name] = map[key]
        ;delete map[key]
      }
    })
  }
})

exports.TreeToGraph = TreeToGraph

}(window))
