import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser'

const path = require("path");

const resolve = dir => {
    return path.join(__dirname, dir);
};
const inputOptions = {
    input: resolve("build/index.js") 
};
const outputOptions = {
    file: resolve("dist/js-mark.js"), 
    format: "umd", 
    name: "JsMark"
};

export default {
    ...inputOptions,
    output: [outputOptions],
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
        terser({
            output: {
              ascii_only: true // 仅输出ascii字符
            },
            compress: {
              pure_funcs: ['console.log'] // 去掉console.log函数
            }
          })
    ]
}