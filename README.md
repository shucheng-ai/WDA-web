# beaver web version2

仓储设计自动化第二版web端代码仓库

## 项目结构
项目按如下结构排布

```
../
 └── beaver-web-v2
 |       ├── dist
 |       └── app
 └──beaver-server-v2
```

### api 配置文件

本地测如需修改proxy api，直接在`/app`目录下添加`local.config.js`，可以直接拷贝`default.local`后重命名为`local.config.js`，修改里面的api参数，后续config里如果需要修改本地配置统一写在`local.config.js`里面

docker 网关为 `172.17.0.1`.

```
let localConfig = {
    api: 'http://127.0.0.1:8000/',
}

module.exports = localConfig;

```

## 使用docker

### install

``` 
// 国内编译换源版镜像  
bash build_docker.sh

// 国外编译无需换源版镜像
bash build_docker.sh en 
```

### run npm server

``` 
bash start_docker.sh
```

### run npm build

``` 
bash npm_build.sh
```

### run npm install

``` 
# install all

bash npm_install.sh 

# install new lib
bash npm_install.sh new_name
```

### 第一次 clone 需依次操作
``` 
bash build.sh
```

### run shell

```
bash start_docker.sh shell
```  

### 部署  
项目根目录运行命令  
```  
docker-compose up -d
```