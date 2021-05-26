let vueCompiler = require('vue-template-compiler');
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import glob from 'glob';

export default {
  getComponentName: function (srcFile: string) : string {
    //Get and validate file extension
    let ext = path.extname(srcFile);
    if (ext !== '.vue') throw new Error(`not a .vue file`);
    
    //Parse component name from file basename: AnuGerah jadi anu-gerah
    let basename = path.basename(srcFile);
    let baseNoExt = basename.substr(0, basename.length - 4); // '.vue'.length  = 4
    let compName = baseNoExt.replace('.', '-');
    compName = compName.replace(/[A-Z]/g, c => "-"+c.toLowerCase()); //AnuGerah jadi -anu-gerah
    if (compName.substr(0,1) === '-') compName = compName.substr(1, 1000);

    return compName;
  },
  compile: function(srcFile: string, destFile: string) {
    const compName = this.getComponentName(srcFile);
    destFile = (destFile == '') ? srcFile.replace(/\.vue$/g, '.js') : destFile;
    
    let fileRaw = fs.readFileSync(srcFile, {encoding: 'utf8'});
    const oParsed = vueCompiler.parseComponent(fileRaw);
    const template = oParsed.template ? oParsed.template.content : '';
    const templateEscaped = template.trim().replace(/`/g, '\\`');
  
    const script = oParsed.script ? oParsed.script.content : '';
  
    const stringMatcher = script.match(/(module\.exports\s+=|export\s+default)\s+{([\s\S]*)};?\s*$/);
    //Regex: 'module.exports =' atau 'export default' {<semua di sini>};   (boleh diakhiri }, }; atau };dengan whitespace);
    if (stringMatcher === null) { throw new Error(`'module.exports =' or 'export default' not found.`); }
    const inModule = stringMatcher[2].replace(/^\s+|\s+$/g, ''); //Trim semua whitespace
  
    const resultScript = `Vue.component("${compName}", {
      template: \`${templateEscaped}\`,
      ${inModule}
    });`;
  
    //Validate JS. Throws error if invalid
    const checkjs = new vm.Script(resultScript);
  
    //TODO: Validate template
    this.mkdirp(path.dirname(destFile));
    fs.writeFile(`${destFile}`, resultScript, err=> { if (err) throw err; console.log(`${destFile} created.`); })
  },

  compileAll:function (srcFolder: string, destFolder:string) {
    let globStr = srcFolder.replace('\\', '/');
    const files = glob.sync(globStr+'/**/*.vue');
    for(let f of files) {
      let dest = f.replace(srcFolder, destFolder).replace(/\.vue$/g, '.js');
      this.compile(f, dest);
    }
  },
  mkdirp: function(dir: string) {
    if (fs.existsSync(dir)) return true;
    let level = 1;

    while (level > 0) {
      let curdir = dir;
      let parent = dir;
      for (let i=1; i<=level; i++) parent = path.dirname(parent);
      for (let i=1; i<level; i++) curdir = path.dirname(curdir);
      if (fs.existsSync(parent)) { fs.mkdirSync(curdir); level--; }
      else { level++; if (parent == '.') throw Error('Failed to create directory'); }
    }

  }
}
