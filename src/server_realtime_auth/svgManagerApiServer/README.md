# 这是一个 svg 文件操作 api server

提供对 json-scada server_realtime_auth 的 svg 静态资源进行操作的 api.

第三方服务可以通过该接口对 json-scada 进行 svg 的部署。

## 环境变量

util/env.ts 中定义了该服务依赖的值:

```ts
export const env = {
  SvgFolder: process.env['SvgFolder'] ?? '/htdocs/svg',
}
```

- SvgFolder 这是该服务将操作的 svg 目录, 默认值 `'/htdocs/svg'` 是 docker-compose.yaml 中对 server_realtime_auth 设置的映射目录

你可以简单地通过对写入环境变量来提供对应值

## 与 json-scada 交互

index.ts 的 export config:

```ts
export const config = {
  // 用于 json-scada 反向代理
  address: `http://localhost:${port}`,
}
```

- address 用于 server_realtime_auth 进行返向代理的依据, 该服务将被开放在 `'/svgManagerApi'` 路由下

  ```js
  const { config: { address } } = require('./svgManagerApiServer/src/index')

  // Svg manager api reverse proxy
  app.use('/svgManagerApi', httpProxy(address))
  ```

## api 和模型

### api

接口统一模型:

```ts
interface api {
  data: any;
  error: boolean;
  message: string;
}
```

- data 将携带有效信息
- error 指示该请求是否出错, 若出错, error 将放置错误信息
- message: 信息

### 获取 svg 列表

| GET /svg |     |
| -------- | --- |

响应:

```ts
interface api {
  data: SvgInfo[];
  error: boolean;
  message: string;
}

interface SvgInfo {
  filename: string;
  SHA256HashHex: string;
  birthtime: number;
}
```

### 添加 svg

| POST /svg   |        | Json                                       |
| ----------- | ------ | ------------------------------------------ |
| filename    | string | svg 文件名, 当后缀不为 .svg 时, 将自动补全 |
| fileContent | string | svg 内容                                   |

响应:

```ts
interface api {
  data: undefined;
  error: boolean;
  message: string;
}
```

### 删除 svg

| DELETE /svg |        | QueryString                                |
| ----------- | ------ | ------------------------------------------ |
| filename    | string | svg 文件名, 当后缀不为 .svg 时, 将自动补全 |

响应:

```ts
interface api {
  data: undefined;
  error: boolean;
  message: string;
}
```

### 修改 svg

| PUT /svg |         | Josn                                       |
| -------- | ------- | ------------------------------------------ |
| filename | string  | svg 文件名, 当后缀不为 .svg 时, 将自动补全 |
| updater  | Updater |                                            |

类型:

```ts
interface Updater {
  filename?: stirng;
  fileContent?:string;
}
```

响应:

```ts
interface api {
  data: undefined;
  error: boolean;
  message: string;
}
```
