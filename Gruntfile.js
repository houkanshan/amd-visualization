module.exports = function(grunt) {
  var _ = require('underscore')

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    "amd-depends": {
      cwd: 'build',
      outPath: 'scripts/dep-trees',
      projects: [
        {
          name: 'jquery',
          path: 'projects/jquery/src'
        },
        {
          name: 'CardKit',
          path: 'projects/CardKit/js',
        }
      ]
    }
  , connect: {
      server: {
        options: {
          port: 9000,
          hostname: 'localhost',
          base: 'build/',
          keepalive: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-connect')
  grunt.registerTask('amd-depends',
      'generate amd-depends json file',
      function(){
        var
            madge = require('madge'),
            options = {format: 'amd'},

            opt = grunt.config('amd-depends'),
            projects = opt.projects,
            dstPath = opt.outPath || '',
            cwd = opt.cwd || '.',
            pathsJson = {},
            writeTo = ''

        projects.forEach(function(projectInfo, i){
          var
              name = projectInfo.name,
              srcPath = projectInfo.path,
              replacer = projectInfo.replacer,

              dstFile = [dstPath, name].join('/') + '.json',
              tree = madge(srcPath, options).tree,
              json

          pathsJson[name] = dstFile
          writeTo = [cwd, dstFile].join('/')

          if (_.isFunction(replacer)) {
            var newTree = {}
            _.each(tree, function(list, name) {
              newTree[replacer(name)] = _.map(list, replacer)
            })
            tree = newTree
          }

          json = JSON.stringify(tree, null, 2)
          console.log('write file:', writeTo)
          grunt.file.write(writeTo, json)
        })

        pathsJson = JSON.stringify(pathsJson, null, 2)
        writeTo = [cwd, dstPath, 'paths.json'].join('/')
        console.log('write file: ', writeTo)
        grunt.file.write(writeTo, pathsJson)
      })


  // Default task(s).
  grunt.registerTask('default', ['amd-depends'])
  grunt.registerTask('server', ['connect'])

};
