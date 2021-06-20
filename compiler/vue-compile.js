"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
let vueCompiler = require('vue-template-compiler');
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vm_1 = __importDefault(require("vm"));
const glob_1 = __importDefault(require("glob"));
exports.default = {
    getComponentName: function (srcFile) {
        //Get and validate file extension
        let ext = path_1.default.extname(srcFile);
        if (ext !== '.vue')
            throw new Error(`not a .vue file`);
        //Parse component name from file basename: AnuGerah jadi anu-gerah
        let basename = path_1.default.basename(srcFile);
        let baseNoExt = basename.substr(0, basename.length - 4); // '.vue'.length  = 4
        let compName = baseNoExt.replace('.', '-');
        compName = compName.replace(/[A-Z]/g, c => "-" + c.toLowerCase()); //AnuGerah jadi -anu-gerah
        if (compName.substr(0, 1) === '-')
            compName = compName.substr(1, 1000);
        return compName;
    },
    compile: function (srcFile, destFile) {
        const compName = this.getComponentName(srcFile);
        destFile = (destFile == '') ? srcFile.replace(/\.vue$/g, '.js') : destFile;
        let fileRaw = fs_1.default.readFileSync(srcFile, { encoding: 'utf8' });
        const oParsed = vueCompiler.parseComponent(fileRaw);
        const template = oParsed.template ? oParsed.template.content : '';
        const templateEscaped = template.trim().replace(/`/g, '\\`');
        const script = oParsed.script ? oParsed.script.content : '';
        const stringMatcher = script.match(/(module\.exports\s+=|export\s+default)\s+{([\s\S]*)};?\s*$/);
        //Regex: 'module.exports =' atau 'export default' {<semua di sini>};   (boleh diakhiri }, }; atau };dengan whitespace);
        if (stringMatcher === null) {
            throw new Error(`'module.exports =' or 'export default' not found.`);
        }
        const inModule = stringMatcher[2].replace(/^\s+|\s+$/g, ''); //Trim semua whitespace
        const resultScript = `Vue.component("${compName}", {
      template: \`${templateEscaped}\`,
      ${inModule}
    });`;
        //Validate JS. Throws error if invalid
        const checkjs = new vm_1.default.Script(resultScript);
        //TODO: Validate template
        this.mkdirp(path_1.default.dirname(destFile));
        fs_1.default.writeFile(`${destFile}`, resultScript, err => { if (err)
            throw err; console.log(`${destFile} created.`); });
    },
    compileAll: function (srcFolder, destFolder) {
        let globStr = srcFolder.replace('\\', '/');
        const files = glob_1.default.sync(globStr + '/**/*.vue');
        for (let f of files) {
            let dest = f.replace(srcFolder, destFolder).replace(/\.vue$/g, '.js');
            this.compile(f, dest);
        }
    },
    mkdirp: function (dir) {
        if (fs_1.default.existsSync(dir))
            return true;
        let level = 1;
        while (level > 0) {
            let curdir = dir;
            let parent = dir;
            for (let i = 1; i <= level; i++)
                parent = path_1.default.dirname(parent);
            for (let i = 1; i < level; i++)
                curdir = path_1.default.dirname(curdir);
            if (fs_1.default.existsSync(parent)) {
                fs_1.default.mkdirSync(curdir);
                level--;
            }
            else {
                level++;
                if (parent == '.')
                    throw Error('Failed to create directory');
            }
        }
    }
};
