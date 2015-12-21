## 开发文档（create by yanting）

### 极有家装修服务detail页面` 服务范围`组件

#### 1. 开发环境
- [Gulp](http://www.gulpjs.com.cn/)部署开发环境
- [Kissy 1.4.7](http://docs.kissyui.com/1.4/docs/html/guideline/startup.html)
- 样式：less
- [xtemplate(kissy)](http://kpm.taobao.net/xtemplate/doc/guide/index.html)模板渲染

#### 2. 拉取仓库
- `git clone git@gitlab.alibaba-inc.com:cm/jiyoujia-decoration-service.git`
- `git remote show origin`  查看远程分支
- `git checkout x.x.x`  切换到最新的分支
- `tnpm install`   安装依赖

#### 3. 编码约定

- 使用[EditorConfig](http://editorconfig.org/)来做基本代码约定，所以请使用支持 EditorConfig 的开发软件或开发时配置好软件本身来适应项目。
- 使用 [jscs](http://jscs.info/) 来检测 js 代码风格

#### 4. 先打包代码


    $ gulp build

#### 5. 再开启本地服务器


    $ gulp start


默认的端口是 `6666`，直接访问 [demo](http://localhost:8888/demo/index.html) 即可。

#### 6. git 分支的约定

- 开分支必须添加 changelog
- 新分支以最新的 master 为基础
- [遵循语义化版本号][sematic version]
- 不是同一个需求，不要放到同一个分支，开独立的分支
- 多分支并存时，开分支时参照上面的规则，发布时需要保持版本号递增的趋势，视其需要而开新分支来发，发完后把旧的分支移除

  如，先来了个需求开了 `1.0.1` 的分支，还没发布，然后又来了个需求开了 `1.0.2` 的分支。
  
  但各种原因，`1.0.2` 的分支需要先发，那么，打 `publish/1.0.2` 的 tag 发布即可，`1.0.1` 的分支继续开发。
  
  `1.0.1` 测试通过后需要发布，那么以 `1.0.1` 为基础开个新分支 `1.0.3`（`git checkout -b daily/1.0.3 daily/1.0.1`），然后打 `publish/1.0.3` 的 tag 发布。发布完成后，删除 `1.0.1` 的远程分支（注意，此处需要小心操作，若对此命令不放心，最好在像 SourceTree 之类的 gui 软件中操作）`git push origin :daily/1.0.1`，至于本地分支看自己心情，我是不会留着碍眼的。

#### 7. 发布

假定分支是 `daily/1.0.0`，远程仓库是默认的 `origin`

- 提交到服务器：`git push origin daily/1.0.0`
- 打 tag：`git tag publish/1.0.0`
- 推送 tag 来触发部署：`git push origin publish/1.0.0 -m '需求或 bug 修复描述'`

