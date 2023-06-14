#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { Command } = require('commander');
const inquirer = require('inquirer');
const spawn = require('cross-spawn');
const HttpPing = require('node-http-ping');

const REGISTRY_LIST = require('../registries.json');

const package = require('../package.json')

const program = new Command();

const spawnSync = spawn.sync

program.version(package.version).description('一个切换npm源的工具');

program
  .command('ls')
  .description('查看所有可用的源')
  .action(() => {
    const registries = getRegistryList();
    const currentRegistry = getCurrentRegistry();
    const maxLength = Math.max(...registries.map(registry => registry.name.length));
    if (registries.length > 0) {
      console.log(registries.map((registry) => `${ currentRegistry === registry.url ? '*' :' ' } ${registry.name.padEnd(maxLength + 1)}->\t${registry.url}`).join('\n'));
    } else {
      console.log('没有找到源');
    }
  });

program
  .command('use <registry>')
  .description('切换到具体的源')
  .action((registry) => {
    const registries = getRegistryList();
    const targetRegistry = registries.find((item) => item.name === registry);

    if (!targetRegistry) {
      console.error(`Error: Registry "${registry}" not found.`);
      return;
    }

    fs.writeFileSync(path.join(os.homedir(), '.npmrc'), `registry=${targetRegistry.url}\n`);
    console.log(`成功切换到"${registry}".`);
  });

program
  .command('add')
  .description('添加一个新的源')
  .action(() => {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'name',
          message: '输入源的名称:',
        },
        {
          type: 'input',
          name: 'url',
          message: '输入源的地址:',
        },
      ])
      .then((answers) => {
        const registries = getRegistryList();

        if (registries.some((item) => item.name === answers.name)) {
          console.error(` 该源 "${answers.name}" 已经存在`);
          return;
        }

        registries.push({ name: answers.name, url: answers.url });
        saveRegistryList(registries);
        console.log(`源 "${answers.name}" 添加成功`);
      });
  });

program
  .command('del <registry>')
  .description('删除一个源')
  .action((registry) => {
    const registries = getRegistryList();
    const targetIndex = registries.findIndex((item) => item.name === registry);

    if (targetIndex === -1) {
      console.error(`源 "${registry}" 没有找到`);
      return;
    }

    registries.splice(targetIndex, 1);
    saveRegistryList(registries);
    console.log(`源 "${registry}" 删除成功`);
  });

program
.command('current')
.description('查看当前的源')
.action(()=>{
    const registry = getCurrentRegistry();
    const { name, url  } = getCurrentRegistryName(registry)
    if(registry){
        console.log(`当前源为${name}:${ url }`)
    }else{
        console.log('当前源不存在')
    }
})

program
.command('ping [registry]')
.description('测试源的速度，默认当前的源（也了选择）')
.action((registry)=>{
    const registries = getRegistryList();
    if(registry){
        // 说明用户输入了一个具体的源
        const current = registries.filter(v=> v.name === registry)

        if(current.length > 0){
            const url = current[0].url;
            HttpPing(url.slice(0, url.length - 1)).then(time=>console.log(`当前源响应时间为${time}ms`))
            .catch(()=>console.log("响应失败"))
        }
    }else{
        // 整理一下源的字符
        const registriesChoices = registries.map(v=> `${v.name}---${v.url}`)
        // 用户没有输入，让他选
        const question = {
            type: 'list',
            name: 'source',
            message: '请选择要使用的源：',
            choices: registriesChoices,
          };

          inquirer.prompt(question).then(answer => {
            console.log(`您选择了 ${answer.source}`);
            const [name, url] = answer.source.split('---');
            HttpPing(url.slice(0, url.length - 1)).then(time=>console.log(`当前源响应时间为${time}ms`))
            .catch(()=>console.log("响应失败"))
          });
    }
})


function getRegistryList() {
  return REGISTRY_LIST
}

function saveRegistryList(registries) {
  try {
    fs.writeFileSync('/registries.json', JSON.stringify(registries, null, 2));
  } catch (err) {
    console.error(`Failed to save registry config file: ${err.message}`);
    process.exit(1);
  }
}

function getCurrentRegistry() {
   // 执行 npm config get registry 命令并获取输出结果
const result = spawnSync('npm', ['config', 'get', 'registry']);

if (result.status === 0) {
  // 输出结果为标准输出流中的第一行，去除两端的空格
  const registryUrl = result.output[1].toString().trim();

  return registryUrl
} else {
  console.error(result.stderr.toString()); // 输出错误信息
}
}

function getCurrentRegistryName(registry){
    const  registries = getRegistryList();

    const found = registries.filter(v=> v.url === registry);
     
    return found.length > 0 ? found[0] : {name: '', url: ''}
}
program.parse(process.argv);
