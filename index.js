#!/usr/bin/env node 
const commander = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const request = require('request');
const progress = require('request-progress');
const exec = require('child_process').exec;

const program = new commander.Command();
let projectName = undefined;

// 初始化命令行
program
    .name('easy-cli-react')
    .version('0.0.1')
    .description('Init a react project using easy-template-react')
    .arguments('<projectName>')
    .action(name => {
        projectName = name;
    })
    .parse(process.argv);

if (!projectName) {
    console.log(chalk.red('[Error]: need projectName'));
    process.exit();
}

// 开始下载项目模板
console.log(chalk.cyan('[easy-cli-react]start to download project template...'));
const templateUrl = 'https://github.com/CoyPan/easy-template-react/archive/master.zip';

const downloadZipName = 'template.zip';
progress(request(templateUrl))
    .on('progress', function (state) {
        const progress = Math.floor(state.percent || 0) * 100 + '%';
        console.log(chalk.cyan(`[easy-cli-react]downloading project template (${progress})`));
    })
    .on('error', function (err) {
        console.log(chalk.red(`[error]${err}`));
    })
    .on('end', function () {

        console.log(chalk.cyan('[easy-cli-react]downloading project template (100%)'));
        console.log(chalk.cyan('[easy-cli-react]start to init project...'));

        // 解压并且重命名文件夹
        const cmdStr = [
            `unzip -o ${downloadZipName} -d ./`,
            `rm ${downloadZipName}`,
            `mv easy-template-react-master ${projectName}`
        ].join(' && ');

        exec(cmdStr, (error, stdout, stderr) => {
            if (error) {
                console.log(chalk.red(`[Error]: ${error}`));
                process.exit();
            }

            // 修改package.json内的项目名
            const packageJson = fs.readJsonSync(`${projectName}/package.json`);
            packageJson.name = projectName;
            fs.writeFileSync(
                `${projectName}/package.json`, 
                JSON.stringify(packageJson, null, 4)
            );
            console.log(chalk.cyan('[easy-cli-react]done!!'));

        });
    })
    .pipe(fs.createWriteStream(downloadZipName));