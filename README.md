Demo: 

> under development ...

Visualization a f2e project which base on AMD format

## Usage

1. install nodejs

2. install npm package

```bash

make node_modules

```

3. Put some project (F2E part is build with AMD) into the `projects` dir

```javascript

mkdir -p projects; cd projects; git clone https://github.com/jquery/jquery.git

# Or use submodule

```

4. config the Grunt task

```javascript

"amd-depends": {
  cwd: 'build',
  outPath: 'scripts/dep-trees',
  projects: [
    {
      name: 'jquery',
      path: 'projects/jquery/src'
    },
  ]
}

```

5. run grunt task

```bash

grunt

```
