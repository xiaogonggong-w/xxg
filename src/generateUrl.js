
const fs = require('fs');
const os = require('os');
const path = require('path');

const fileName = 'xxg-registries.json'
// 获取主目录下的配置镜像源的工具
const config = path.join(os.homedir(), fileName);
function generateUrl() {
    if (!fs.existsSync(config)) {
        // 配置文件不存在,创建并初始化
        const newConfigData = [
            {
                "name": "npm",
                "url": "https://registry.npmjs.org/"
            },
            {
                "name": "yarn",
                "url": "https://registry.yarnpkg.com/"
            },
            {
                "name": "cnpm",
                "url": "http://r.cnpmjs.org/"
            },
            {
                "name": "taobao",
                "url": "https://registry.npmmirror.com/"
            },
            {
                "name": "npmMirror",
                "url": "https://skimdb.npmjs.com/registry/"
            }
        ]

        fs.writeFileSync(config, JSON.stringify(newConfigData, null, 2));

        console.log('配置文件已创建并初始化')
    } else {
        console.log('配置文件已存在,不需要初始化')
    }
}

module.exports = {
    generateUrl,
    fileName
}