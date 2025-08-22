# 接口文档

## 浏览器健康检查

 <b style="font-size: 18px">GET /health</b>

<!-- <br>

接口说明描述xxx -->

<p style="font-weight: 600"> <span class="order">1</span> 请求参数</p>

```Text
无
```

<p style="font-weight: 600"> <span class="order">2</span> 返回结果</p>




```Json
{
    "code": 0,      // 状态码, 0:成功，500：失败，int类型
    "msg": "成功"   // 返回结果, str类型
}   
```



| 字段名称             | 字段类型   | 描述               |
| ---------------- | ------ | ---------------- |
| code             | int    | 状态码, 0：成功，500：失败 |
| msg              | string | 返回结果             |


## 空间项目接口
### 获取空间项目列表

 <b style="font-size: 18px">GET /browser/workspace</b>

<!-- <br>

接口说明描述xxx -->

<p style="font-weight: 600"> <span class="order">1</span> 请求参数</p>



```Json
{
    "page_index": 1,                                // 分页索引, int类型, 非必传, 默认1
    "page_size": 15                                // 分页条数, int类型, 非必传, 默认15
}
```



| 参数名称        | 必需项 | 参数类型 | 默认值 | 描述     |
| ----------- | --- | ---- | --- | ------ |
| page_index  | 否   | int  | 1   | 分页索引   |
| page_size   | 否   | int  | 15  | 分页条数   |

<p style="font-weight: 600"> <span class="order">2</span> 返回结果</p>



```Json
{
    "code": 0,                                              // 状态码, 0:成功，500：失败，int类型
    "data": {
        "total": 1,                                         // 总条数
        "rows": [
            {
                "id": 1,                                    // 工作空间ID
                "workspaceName": "feihairui's Workspace",   // 工作空间名称
                "project_details": [                        // 项目详细信息
                    {   
                        "projectId": 1,                     // 项目编号
                        "projectName": "xx项目"             // 项目名称
                    }
                ]
            }
        ]
    },
    "msg": "成功"                                           // 返回结果, str类型
}
```



| 字段名称            | 字段类型   | 描述               |
| --------------- | ------ | ---------------- |
| code            | int    | 状态码, 0:成功，500：失败 |
| total           | int    | 总条数              |
| id              | int    | 工作空间ID           |
| workspaceName   | string | 工作空间名称           |
| project_details | List   | 项目详细信息           |
| projectId       | int    | 项目编号             |
| projectName     | string | 项目名称             |
| msg             | string | 返回结果             |


### 获取账号列表

 <b style="font-size: 18px">GET /browser/account</b>

<!-- <br>

接口说明描述xxx -->

<p style="font-weight: 600"> <span class="order">1</span> 请求参数</p>



```Json
{   
    "workspaceId": 1,       // 工作空间id，int类型，必传，通过空间项目接口【/browser/workspace】获取
    "accountId": 1,         // 账号库id, int类型, 非必传
    "page_index": 1,        // 分页索引, int类型, 非必传, 默认1
    "page_size": 15        // 分页条数, int类型, 非必传, 默认15
}
```



| 参数名称        | 必需项                                      | 参数类型 | 默认值 | 描述     |
| ----------- | ---------------------------------------- | ---- | --- | ------ |
| workspaceId | <span class="parameter-require">是</span> | int  | --  | 工作空间id |
| accountId   | 否                                        | int  | 1   | 账号库id  |
| page_index  | 否                                        | int  | 1   | 分页索引   |
| page_size   | 否                                        | int  | 15  | 分页条数   |

<p style="font-weight: 600"> <span class="order">2</span> 返回结果</p>



```Json
{
    "code": 0,                                                                  // 状态码, 0:成功，500：失败，int类型
    "data": {
        "total": 1,                                                             // 总条数
        "rows": [
            {
                "id": 3,                                                        // 账号库id
                "platformUrl": "https://www.tiktok.com/",                       // 业务平台url
                "platformUserName": "Roxytest",                                 // 账号库用户名
                "platformPassword": "123456",                                   // 账号库密码
                "platformEfa": "2F3CD67B6D",                                    // 账号库Efa
                "platformCookies": [{"name": "1","value": "2","domain": "3"}],  // 账号库Cookies
                "platformName": "Roxytest",                                     // 平台名称
                "platformRemarks": "Roxytest",                                  // 平台备注
                "createTime": "2024-10-23 15:45:46",                            // 创建时间
                "updateTime": "2024-10-23 15:45:46"                             // 修改时间
            }
        ] 
    },
    "msg": "成功"                                                               // 返回结果, str类型
} 
```



| 字段名称             | 字段类型   | 描述               |
| ---------------- | ------ | ---------------- |
| code             | int    | 状态码, 0:成功，500：失败 |
| msg              | string | 返回结果             |
| total            | int    | 总条数              |
| id               | int    | 账号库id            |
| platformUrl      | string | 业务平台url          |
| platformUserName | string | 账号库用户名           |
| platformPassword | string | 账号库密码            |
| platformEfa      | string | 账号库Efa           |
| platformCookies  | object | 账号库Cookies       |
| platformName     | string | 平台名称             |
| platformRemarks  | string | 平台备注             |
| createTime       | string | 创建时间             |
| updateTime       | string | 修改时间             |


### 获取标签列表

<b style="font-size: 18px">GET /browser/label</b>

<!-- <br>

接口说明描述xxx -->

<p style="font-weight: 600"> <span class="order">1</span> 请求参数</p>



```Json
{   
    "workspaceId": 1       // 工作空间id，int类型，必传，通过空间项目接口【/browser/workspace】获取
}
```



| 参数名称        | 必需项                                      | 参数类型 | 默认值 | 描述     |
| ----------- | ---------------------------------------- | ---- | --- | ------ |
| workspaceId | <span class="parameter-require">是</span> | int  | --  | 工作空间id |

<p style="font-weight: 600"> <span class="order">2</span> 返回结果</p>



```Json
{
    "code": 0,                                                                  // 状态码, 0:成功，500：失败，int类型
    "data": [
        {
            "id": 3,                                                           // 标签id
            "color": "#7558F5",                                                // 标签颜色
            "name": "roxy测试标签"                                              // 标签名称
        }
    ],
    "msg": "成功"                                                               // 返回结果, str类型
} 

```



| 字段名称             | 字段类型   | 描述               |
| ---------------- | ------ | ---------------- |
| code             | int    | 状态码, 0:成功，500：失败  |
| msg              | string | 返回结果                 |
| id               | int    | 标签id                  |
| color            | string | 标签颜色                 |
| name             | string | 标签名称                 | 


## 浏览器窗口接口
### 获取浏览器窗口列表

<b style="font-size: 18px">GET /browser/list_v3</b>

<!-- <br>

接口说明描述xxx -->

<p style="font-weight: 600"> <span class="order">1</span> 请求参数</p>



```Json
{   
    "workspaceId": 10,                              // 工作空间id，int类型，必传，通过空间项目接口【/browser/workspace】获取
    "dirIds": "dc1ed4d,2e18ce,yy67yegk",            // 浏览器窗口id，str类型，非必传，多个以英文逗号分隔
    "windowName": "Roxytest",                       // 浏览器窗口名称，str类型，非必传
    "sortNums": "11,12",                            // 窗口序号，str类型，非必传，多个以英文逗号分隔
    "os": "Windows",                                // 操作系统，str类型，非必传
    "projectIds": "10,11",                          // 项目ID，str类型，非必传，多个以英文逗号分隔
    "windowRemark": "Windows",                      // 窗口备注，str类型，非必传
    "page_index": 1,                                // 分页索引, int类型, 非必传, 默认1
    "page_size": 15                                 // 分页条数, int类型, 非必传, 默认15
    
}
```



| 参数名称        | 必需项                                      | 参数类型   | 默认值 | 描述      |
| ----------- | ---------------------------------------- | ------ | --- | ------- |
| workspaceId | <span class="parameter-require">是</span> | int    | --  | 工作空间id  |
| dirIds      | 否                                        | string | --  | 浏览器窗口id |
| windowName  | 否                                        | string | --  | 浏览器窗口名称 |
| sortNums    | 否                                        | string | --  | 窗口序号 |
| os          | 否                                        | string | --  | 操作系统 |
| projectIds  | 否                                        | string | --  | 项目ID |
| windowRemark| 否                                        | string | --  | 窗口备注 |
| page_index  | 否                                        | int    | 1   | 分页索引    |
| page_size   | 否                                        | int    | 15  | 分页条数    |

<p style="font-weight: 600"> <span class="order">2</span> 返回结果</p>



```Json
{
    "code": 0,
    "data": {
        "total": 1,
        "rows": [
             {
                "dirId": "dc1e73d4dd954a",                              // 浏览器窗口id, str类型
                "windowSortNum": 99,                                    // 窗口序号, int类型
                "windowName": "Roxytest",                               // 窗口名称, str类型
                "coreVersion": "117",                                   // 内核版本，枚举值：135，133，130，125，117，109, str类型
                "os": "Windows",                                        // 操作系统, 枚举值：Windows、macOS、Android、IOS, str类型
                "osVersion": "11",                                      // 操作系统版本, 枚举值：Windows的枚举值：11、10、8、7; macOS的枚举值: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7; Android的枚举值：14、13、12、11、10、9; IOS的枚举值：18.2、18.1、18.0、17.0、16.6、16.5、16.4、16.3、16.2、16.1、16.0、15.7、15.6、15.5、15.4、15.3、15.2、15.1、15.0、14.7、14.6、14.5、14.4、14.3、14.2、14.1、14.0; str类型
                "windowRemark": "Roxytest",                             // 窗口备注, str类型
                "createTime": "2023-12-04 21:55:58",                    // 窗口创建时间, str类型
                "updateTime": "2023-12-04 21:56:01",                    // 窗口修改时间, str类型
                "userName": "roxytest"                                  // 窗口归属人用户名,即用户账号, str类型
            }
        ]
    },
    "msg": "成功"
}    
```



| 字段名称<div style="min-width: 250px"></div> | 字段类型<div style="min-width: 150px"></div> | 描述                                                     |
| ---------------------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| dirId                                    | string                                   | 浏览器窗口id                                                |
| windowSortNum                            | int                                      | 窗口序号                                                   |
| windowName                               | string                                   | 窗口名称                                                   |
| coreVersion                              | string                                   | 内核版本，枚举值：135，133，130，125，117，109                                   |
| os                                       | string                                   | 操作系统，枚举值：Windows、macOS、Android、IOS                           |
| osVersion                                | string                                   | 操作系统版本, 枚举值：Windows的枚举值：11、10、8、7; <br/>macOS的枚举值: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7; <br/> Android的枚举值：14、13、12、11、10、9; <br/> IOS的枚举值：18.2、18.1、18.0、17.0、16.6、16.5、16.4、16.3、16.2、16.1、16.0、15.7、15.6、15.5、15.4、15.3、15.2、15.1、15.0、14.7、14.6、14.5、14.4、14.3、14.2、14.1、14.0 |
| windowRemark                             | string                                   | 窗口备注                                                   |
| createTime                               | string                                   | 窗口创建时间                                                 |
| updateTime                               | string                                   | 窗口修改时间                                                 |
| userName                                 | string                                   | 窗口归属人用户名,即用户账号                                         |
 

### 获取浏览器窗口明细

<b style="font-size: 18px">GET /browser/detail</b>

<!-- <br>

接口说明描述xxx -->

<p style="font-weight: 600"> <span class="order">1</span> 请求参数</p>



```Json
{   
    "workspaceId": 10,                              // 工作空间id，int类型，必传，通过空间项目接口【/browser/workspace】获取
    "dirId": "dc1e73d4dd954a"            			// 浏览器窗口id，str类型，必传
}
```



| 参数名称        | 必需项                                      | 参数类型   | 默认值 | 描述      |
| ----------- | ---------------------------------------- | ------ | --- | ------- |
| workspaceId | <span class="parameter-require">是</span> | int    | --  | 工作空间id  |
| dirId      | <span class="parameter-require">是</span> | string | --  | 浏览器窗口id | 

<p style="font-weight: 600"> <span class="order">2</span> 返回结果</p>



```Json
{
    "code": 0,
    "data": {
        "total": 1,
        "rows": [
             {
                "dirId": "dc1e73d4dd954a",                              // 浏览器窗口id, str类型
                "windowSortNum": 99,                                    // 窗口序号, int类型
                "windowName": "Roxytest",                               // 窗口名称, str类型
                "coreVersion": "117",                                   // 内核版本，枚举值：135，133，130，125，117，109, str类型
                "os": "Windows",                                        // 操作系统, 枚举值：Windows、macOS、Android、IOS, str类型
                "osVersion": "11",                                      // 操作系统版本, 枚举值：Windows的枚举值：11、10、8、7; macOS的枚举值: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7; Android的枚举值：14、13、12、11、10、9; IOS的枚举值：18.2、18.1、18.0、17.0、16.6、16.5、16.4、16.3、16.2、16.1、16.0、15.7、15.6、15.5、15.4、15.3、15.2、15.1、15.0、14.7、14.6、14.5、14.4、14.3、14.2、14.1、14.0; str类型
                "userAgent": "Mozilla/5.0 (Windows NT 10.0)",           // User Agent, str类型
                "cookie": [												 				
                    {
                        "name": "1",
                        "value": "2",
                        "domain": "3"
                    }
                ],                                                      // cookie, List类型
                "searchEngine": "Google",                               // 搜索引擎，枚举值：Google, Microsoft Bing, Yahoo, Yandex, DuckDuckGo, str类型
                "windowPlatformList": [{
                    "platformUrl": "https://www.tiktok.com/",           // 业务平台URL，str类型
                    "platformUserName": "Roxytest",                     // 平台账号，str类型
                    "platformPassword": "Roxytest",                     // 平台密码，str类型
                    "platformEfa": "2F3CD67B6D",                        // efa，str类型                      
                    "platformRemarks": "Roxytest"                       // 平台备注，str类型      
                }],
                "defaultOpenUrl": ["https://www.facebook.com"],         // 存储浏览器标签页，List类型
                "windowRemark": "Roxytest",                             // 窗口备注, str类型
                "projectId": 4,											// 项目ID, int类型
                "projectName": "Roxytest",								// 项目名称, str类型	
                "openStatus": false,                                    // 团队内是否已打开, 枚举值：true: 已打开，false: 未打开，布尔类型
                "statusInfo":[
                    {   
                        "openTime": "2024-01-09 12:12:12",              // 打开时间，str类型
                        "openUserName": "test"                          // 打开人用户名，str类型
                    }
                ],                                                      // 窗口打开时的详细信息，List类型
                "createTime": "2023-12-04 21:55:58",                    // 窗口创建时间, str类型
                "updateTime": "2023-12-04 21:56:01",                    // 窗口修改时间, str类型
                "userName": "roxytest",                                 // 窗口归属人用户名,即用户账号, str类型
                "openTime": "2024-12-05 10:57:43",						// 窗口最后打开时间, str类型	
                "closeTime": "2024-12-05 10:40:54",						// 窗口最后关闭时间, str类型 
                "proxyInfo": {
                    "proxyMethod": "custom",                            // 代理方式，枚举值：手动填写：custom，选择代理资源：choose，API接入：api，str类型
                    "proxyCategory": "noproxy",                         // 代理类型，枚举值：noproxy, HTTP, HTTPS, SOCKS5, SSH, str类型
                    "ipType": "IPV4",                                   // 网络协议, 枚举值：IPV4, IPV6，str类型
                    "protocol": "SOCKS5",                               // 代理协议，枚举值：HTTP, HTTPS, SOCKS5，str类型
                    "host": "122.11.11.11",                             // 代理主机，str类型
                    "port": "37746",                                    // 代理端口，str类型
                    "proxyUserName": "roxytest",                        // 代理账号，str类型
                    "proxyPassword": "roxytest",                        // 代理密码，str类型
                    "refreshUrl": "http://refresh-hk.roxybrowser.com",  // 刷新URL，str类型
                    "lastIp": "119.1.2.3",                              // 出口IP，str类型
                    "lastCountry": "CN",                                // 出口国家，str类型
                    "checkChannel": "http://iprust.io/ip.json"			// IP查询渠道，str类型
                },
                "isOften": false,										// 是否收藏，true：是，false：否，布尔类型
                "labelInfo": [											
                    {
                        "labelId": 859,									// 标签ID，int类型
                        "labelName": "Roxytest",						// 标签名称，str类型
                        "labelColor": "#FC9D12"							// 标签颜色，str类型
                    }
                ]														// 标签详细信息，List类型
            }
        ]
    },
    "msg": "成功"
}    
```



| 字段名称<div style="min-width: 250px"></div> | 字段类型<div style="min-width: 150px"></div> | 描述                                                     |
| ---------------------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| dirId                                    | string                                   | 浏览器窗口id                                                |
| windowSortNum                            | int                                      | 窗口序号                                                   |
| windowName                               | string                                   | 窗口名称                                                   |
| coreVersion                              | string                                   | 内核版本，枚举值：135，133，130，125，117，109                                   |
| os                                       | string                                   | 操作系统，枚举值：Windows、macOS、Android、IOS                           |
| osVersion                                | string                                   | 操作系统版本, 枚举值：Windows的枚举值：11、10、8、7; <br/>macOS的枚举值: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7; <br/> Android的枚举值：14、13、12、11、10、9; <br/> IOS的枚举值：18.2、18.1、18.0、17.0、16.6、16.5、16.4、16.3、16.2、16.1、16.0、15.7、15.6、15.5、15.4、15.3、15.2、15.1、15.0、14.7、14.6、14.5、14.4、14.3、14.2、14.1、14.0 |
| userAgent                                | string                                   | User Agent                                             |
| cookie                                   | List                                     | cookie                                                 |
| searchEngine                             | string                                   | 搜索引擎，枚举值：Google, Microsoft Bing, Yahoo, Yandex, DuckDuckGo |
| defaultOpenUrl                           | List                                     | 存储浏览器标签页                                               |
| windowRemark                             | string                                   | 窗口备注                                                   |
| projectId                                | int                                      | 项目ID                                                   |
| projectName                              | string                                   | 项目名称                                                   |
| openStatus                               | boolean                                  | 团队内是否已打开, 枚举值：true: 已打开，false: 未打开                     |
| createTime                               | string                                   | 窗口创建时间                                                 |
| updateTime                               | string                                   | 窗口修改时间                                                 |
| userName                                 | string                                   | 窗口归属人用户名,即用户账号                                         |
| openTime                                 | string                                   | 窗口最后打开时间                                                 |
| closeTime                                | string                                   | 窗口最后关闭时间                                                 |
| isOften                                  | boolean                                  | 是否收藏，true：是，false：否                                                   |
| windowPlatformList                       | List                                     | 见 [windowPlatformList](#window-platform-list)          |
| statusInfo                               | object                                   | 窗口打开时的详细信息，见 [statusInfo](#status-info)                |
| proxyInfo                                | object                                   | 见 [proxyInfo](#proxy-info)                             |                         |
| labelInfo                                | object                                   | 见 [labelInfo](#label-info)                             |                         |


<a id="window-platform-list">windowPlatformList:</a>

| 字段名称             | 字段类型   | 描述      |
| ---------------- | ------ | ------- |
| platformUrl      | string | 业务平台URL |
| platformUserName | string | 平台账号    |
| platformPassword | string | 平台密码    |
| platformEfa      | string | efa     |
| platformRemarks  | string | 平台备注    |

<a id="status-info">statusInfo:</a>

| 字段名称         | 字段类型   | 描述     |
| ------------ | ------ | ------ |
| openUserName | string | 打开人用户名 |
| openTime     | string | 打开时间   |

<a id="proxy-info">proxyInfo:</a>

| 字段名称          | 字段类型   | 描述                                         |
| ------------- | ------ | ------------------------------------------ |
| proxyMethod   | string | 代理方式，枚举值：自定义：custom，导入的IP：choose，API接入：api |
| proxyCategory | string | 代理类型，枚举值：noproxy, HTTP, HTTPS, SOCKS5      |
| ipType        | string | 网络协议, 枚举值：IPV4, IPV6                       |
| protocol      | string | 代理协议，枚举值：HTTP, HTTPS, SOCKS5               |
| host          | string | 代理主机                                       |
| port          | string | 代理端口                                       |
| proxyUserName | string | 代理账号                                       |
| proxyPassword | string | 代理密码                                       |
| refreshUrl    | string | 刷新URL                                      |
| lastIp        | string | 出口IP                                       |
| lastCountry   | string | 出口国家                                       |
| checkChannel  | string | IP查询渠道                                       |


<a id="label-info">labelInfo:</a>

| 字段名称          | 字段类型   | 描述                                         |
| ------------- | ------ | ------------------------------------------ |
| labelId       | int    | 标签ID                                         |
| labelName     | string | 标签名称                                       |
| labelColor    | string | 标签颜色                                       |


 
### 创建浏览器窗口

<b style="font-size: 18px">POST /browser/create</b>

<!-- <br>

接口说明描述xxx -->

<p style="font-weight: 600"> <span class="order">1</span> 请求参数</p>



```Json
{
    "workspaceId": 1,                                           // 工作空间id，int类型，必传，通过空间项目接口【/browser/workspace】获取
    "windowName": "Roxytest",                                   // 窗口名称, str类型，非必传
    "coreVersion": "117",                                       // 内核版本，枚举值 例如：138，137，136等, str类型，非必传
    "os": "Windows",                                            // 操作系统, 枚举值：Windows、macOS、Linux、IOS、Android, str类型，非必传，默认Windows
    "osVersion": "11",                                          // 操作系统版本, Windows的枚举值：11、10、8、7; macOS的枚举值: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7，Android的枚举值：14,13,12,11,10,9；IOS的枚举值：18.2,18.1,18.0,17.0,16.6,16.5,16.4,16.3,16.2,16.1,16.0,15.7,15.6,15.5,15.4,15.3,15.2,15.1,15.0,14.7,14.6,14.5,14.4,14.3,14.2,14.1,14.0；str类型，非必传，默认取最大值
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",   // userAgent, str类型，非必传
    "cookie": [],                                               // cookie, List类型，非必传
    "searchEngine": "Google",                                   // 搜索引擎，枚举值：Google, Microsoft Bing, Yahoo, Yandex, DuckDuckGo, str类型，非必传，默认为Google
    "labelIds": [12,13],                                        // 标签列表id，List类型，非必传，通过标签列表接口【/browser/label】获取
    "windowPlatformList": [{
        "platformUrl": "https://www.tiktok.com/",               //  业务平台URL，str类型，非必传
        "platformUserName": "Roxytest",                         // 平台账号，str类型，非必传
        "platformPassword": "12345655",                         // 平台密码，str类型，非必传
        "platformEfa": "2F3CD67B6D",                            // efa，str类型，非必传                           
        "platformRemarks": "Roxytest"                           // 平台备注，str类型，非必传      
    }],
    "defaultOpenUrl": ["https://www.facebook.com"],             // 存储浏览器标签页，List类型，非必传
    "windowRemark": "Roxytest",                                 // 窗口备注, str类型，非必传
    "projectId":1,                                              // 项目ID, int类型, 非必传，通过空间项目接口【/browser/workspace】获取
    "proxyInfo": {
        "proxyMethod": "custom",                                // 代理方式，枚举值：手动填写：custom，str类型, 非必传，默认为custom
        "proxyCategory": "noproxy",                             // 代理类型，枚举值：noproxy, HTTP, HTTPS, SOCKS5, SSH, str类型，非必传，默认为noproxy
        "ipType": "IPV4",                                       // 网络协议, 枚举值：IPV4, IPV6，str类型，非必传，默认为IPV4
        "host": "122.11.11.11",                                 // 代理主机，str类型，非必传
        "port": "37746",                                        // 代理端口，str类型，非必传
        "proxyUserName": "roxytest",                            // 代理账号，str类型，非必传
        "proxyPassword": "roxytest",                            // 代理密码，str类型，非必传
        "refreshUrl": "http://refresh-hk.roxybrowser.com",      // 刷新URL，str类型，非必传
        "checkChannel": "IPRust.io"                             // IP查询渠道，枚举值：IPRust.io,IP-API,IP123.in，str类型，非必传
    },
    "fingerInfo": {
        "isLanguageBaseIp": true,                               // 浏览器语言类型，跟随IP匹配：true，自定义：false，布尔类型，非必传, 默认true
        "language": "en-US",                                    // 浏览器语言类型为自定义时指定的语言值，str类型，非必传，见附录-语言列表
        "isDisplayLanguageBaseIp": true,                        // 界面语言类型，跟随IP匹配：true，自定义：false，布尔类型，非必传, 默认true
        "displayLanguage": "en-US",                             // 界面语言类型为自定义时指定的语言值，str类型，非必传，见附录-界面语言列表
        "isTimeZone": true,                                     // 时区类型，跟随IP匹配：true，自定义：false，布尔类型，非必传, 默认true
        "timeZone": "GMT-12:00 Etc/GMT+12",                     // 时区类型为自定义时指定的时区值, str类型，非必传，见附录-时区列表
        "position": 0,                                          // 地理位置提示类型，询问: 0，允许：1，禁用：2，int类型, 非必传, 默认1
        "isPositionBaseIp": true,                               // 地理位置类型，跟随IP匹配：true，自定义：false，布尔类型，非必传, 默认true
        "longitude": "376",                                     // 经度值，isPositionBaseIp为false时设置, str类型, 非必传
        "latitude": "165",                                      // 纬度值， isPositionBaseIp为false时设置, str类型, 非必传
        "precisionPos": "600",                                  // 精度值(米)， isPositionBaseIp为false时设置, str类型, 非必传
        "forbidAudio": true,                                    // 网页是否打开声音，开启：true，关闭：false，布尔类型，非必传, 默认true
        "forbidImage": true,                                    // 网页是否加载图片，开启：true，关闭：false，布尔类型，非必传, 默认true
        "forbidMedia": true,                                    // 网页是否播放视频，开启：true，关闭：false，布尔类型，非必传, 默认true
        "openWidth": "1000",                                    // 窗口尺寸，宽度, str类型，非必传，默认 1000
        "openHeight": "1000",                                   // 窗口尺寸，高度, str类型，非必传，默认 1000
        "openBookmarks":false,                                  // 是否开启书签，true：开启，false：关闭，布尔类型，非必传, 默认false
        "positionSwitch":false,                                 // 窗口位置开关，true：自定义，false：全屏，布尔类型，非必传, 默认true
        "windowRatioPosition": "",                              // 指定窗口打开位置, str类型，非必传，默认(0, 0)。使用比例坐标系统，格式为"x,y"，取值范围为0到显示器数量。"0,0": 第一个显示器左上角；"0.5,0.5": 第一个显示器中央；"1.5,0": 两显示器横排时，第二显示器顶部中央；"0,1.5": 两显示器纵排时，第二显示器左侧中央
        "isDisplayName": false,                                 // 窗口名是否在标题栏显示，显示：true，不显示：false，布尔类型，非必传, 默认false
        "syncBookmark": false,                                  // 是否同步书签，true：是，false：否，布尔类型，非必传, 默认false
        "syncHistory": false,                                   // 是否同步历史记录，true：是，false：否，布尔类型，非必传, 默认false
        "syncTab": true,                                        // 是否同步标签页，true：是，false：否，布尔类型，非必传, 默认true
        "syncCookie": true,                                     // 是否同步Cookie，true：是，false：否， 布尔类型，非必传, 默认true
        "syncExtensions": false,                                // 是否同步扩展应用数据，true：是，false：否，布尔类型，非必传, 默认false
        "syncPassword": true,                                   // 是否同步已保存的用户名密码，true：是，false：否，布尔类型，非必传, 默认true
        "syncIndexedDb": false,                                 // 是否同步IndexedDB，true：是，false：否，布尔类型，非必传, 默认false
        "syncLocalStorage": false,                              // 是否同步Local Storage，true：是，false：否，布尔类型，非必传, 默认false
        "clearCacheFile": true,                                 // 启动浏览器前是否删除缓存文件，true：是，false：否，布尔类型，非必传, 默认false
        "clearCookie": true,                                    // 启动浏览器前是否删除Cookie，true：是，false：否，布尔类型，非必传, 默认false
        "clearLocalStorage": true,                              // 启动浏览器前删除Local Storage，true：是，false：否，布尔类型，非必传, 默认false
        "randomFingerprint": false,                              // 启动浏览时是否随机生成指纹，true：是，false：否，布尔类型，非必传, 默认false
        "forbidSavePassword": true,                             // 网页是否弹出保存密码提示，true：是，false：否，布尔类型，非必传, 默认true
        "stopOpenNet": true,                                    // 网络不通是否停止打开窗口，true：是，false：否，布尔类型，非必传, 默认false
        "stopOpenIP": true,                                     // 出口IP发生变化是否停止打开窗口，true：是，false：否，布尔类型，非必传, 默认false
        "stopOpenPosition": true,                               // 出口IP对应国家/地区发生变化是否停止打开窗口，true：是，false：否，布尔类型，非必传, 默认false
        "openWorkbench": 1,                                     // 是否打开工作台, 1: 开启，关闭: 0，跟随软件设置: 2，int类型, 非必传, 默认1
        "resolutionType": true,                                 // 分辨率，true: 自定义, false: 跟随系统，布尔类型，非必传, 默认false
        "resolutionX": "",                                      // 自定义分辨率时，分辨率宽度值, str类型，见附录-分辨率列表，非必传
        "resolutionY": "",                                      // 自定义分辨率时，分辨率高度值, str类型，见附录-分辨率列表，非必传
        "fontType": false,                                      // 字体指纹，随机：true，跟随系统：false，布尔类型，非必传, 默认false
        "webRTC": 0,                                            // webrtc 替换: 0，真实：1，禁止：2，int类型, 非必传, 默认2
        "webGL": true,                                          // webGL图像， 随机：true，真实：false，布尔类型，非必传, 默认true
        "webGLInfo": true,                                      // webGLInfo开关，自定义：true，真实：false，布尔类型，非必传, 默认true
        "webGLManufacturer": "",                                // webGLInfo为自定义时指定的webGL厂商值, str类型，非必传
        "webGLRender": "",                                      // webGLInfo为自定义时指定的webGL渲染值, str类型，非必传
        "webGpu": "webgl",                                      // webGpu，基于webgl匹配：webgl，真实：real，禁用：block，str类型，非必传，默认值：webgl
        "canvas": true,                                         // canvas，随机：true，真实：false，布尔类型，非必传, 默认true
        "audioContext": true,                                   // audioContext值，随机：true，真实：false，布尔类型，非必传, 默认true
        "speechVoices": true,                                   // Speech Voices，随机：true，真实：false，布尔类型，非必传, 默认true
        "doNotTrack": true,                                     // doNotTrack，true：开启，false：关闭，布尔类型，非必传, 默认true
        "clientRects": true,                                    // ClientRects，随机：true，真实：false，布尔类型，非必传, 默认true
        "deviceInfo": true,                                     // 媒体设备，随机：true，真实：false，布尔类型，非必传, 默认true
        "deviceNameSwitch": true,                               // 设备名称，随机：true，真实：false，布尔类型，非必传, 默认true
        "macInfo": true,                                        // MAC地址，自定义：true，真实：false，布尔类型，非必传, 默认true
        "hardwareConcurrent": "4",                              // 硬件并发数, str类型，非必传
        "deviceMemory": "8",                                    // 设备内存, str类型，非必传
        "disableSsl": true,                                     // ssl指纹设置, true: 开启, false: 关闭, 布尔类型，非必传, 默认false
        "disableSslList": [],                                   // ssl特性值列表，List格式类型，非必传
        "portScanProtect": true,                                // 端口扫描保护, false: 关闭, true: 开启，布尔类型，非必传, 默认true
        "portScanList": "",                                     // 端口扫描保护开启时的白名单，英文逗号分隔，str类型，非必传
        "useGpu": true,                                         // 使用硬件加速模式，true：是，false：否，布尔类型，非必传, 默认true
        "sandboxPermission": false,                             // 禁用沙盒，true：开启，false：关闭，布尔类型，非必传, 默认false
        "startupParam": ""                                      // 浏览器启动参数, str类型，多个参数以英文分号分隔，非必传
    }
}
```



| 参数名称               | 必需项<div style="min-width: 65px"></div>   | 参数类型<div style="min-width: 80px"></div> | 默认值<div style="min-width: 80px"></div> | 描述                                                                                                                                                                                                                               |
| ------------------ | ---------------------------------------- | --------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| workspaceId        | <span class="parameter-require">是</span> | int                                     | --                                     | 工作空间id                                                                                                                                                                                                                           |
| windowName         | 否                                        | string                                  | --                                     | 窗口名称                                                                                                                                                                                                                             |
| coreVersion        | 否                                        | string                                  | 125                                    | 内核版本，枚举值 例如：138，137，136等                                                                                                                                                                      |
| os                 | 否                                        | string                                  | Windows                                | 操作系统, 枚举值：Windows、macOS、IOS、Android                                                                                                                                                                                       |
| osVersion          | 否                                        | string                                  | 11                                     | 操作系统版本, <br/>Windows的枚举值：11、10、8、7;<br/> Linux的枚举值：ALL，<br/>macOS的枚举值: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7，<br/>Android的枚举值：14,13,12,11,10,9；<br/>IOS的枚举值：18.2,18.1,18.0,17.0,16.6,16.5,16.4,16.3,16.2,16.1,16.0,15.7,15.6,15.5,15.4,15.3,15.2,15.1,15.0,14.7,14.6,14.5,14.4,14.3,14.2,14.1,14.0 |
| userAgent                 | 否                                        | string                                  | Mozilla/5.0 (Windows NT 10.0; Win64; x64)                                | userAgent
| cookie             | 否                                        | boolean                                 | --                                     | cookie                                                                                                                                                                                                                           |
| searchEngine             | 否                                        | string                                 | Google                                     | 搜索引擎                                                                                                                                                                                                                           |
| labelIds           | 否                                        | List                                    | --                                     | 标签列表id 
| defaultOpenUrl     | 否                                        | List                                    | --                                     | 存储浏览器标签页                                                                                                                                                                                                                         |
| windowRemark       | 否                                        | string                                  | --                                     | 窗口备注                                                                                                                                                                                                                             |
| projectId          | 否                                        | number                                  | --                                     | 项目ID                                                                                                                                                                                                                             |
| windowPlatformList | 否                                        | List                                    | --                                     | 见 [windowPlatformList](#window-platform-list)                                                                                                                                                                                    |
| proxyInfo          | 否                                        | object                                  | --                                     | 见 [proxyInfo](#proxy-info)                                                                                                                                                                                                       |
| fingerInfo         | 否                                        | object                                  | --                                     | 见 [fingerInfo](#finger-info)                                                                                                                                                                                                     |

<a id="window-platform-list">windowPlatformList:</a>

| 参数名称             | 必需项 | 参数类型   | 默认值 | 描述      |
| ---------------- | --- | ------ | --- | ------- |
| platformUrl      | 否   | string | --  | 业务平台URL |
| platformUserName | 否   | string | --  | 平台账号    |
| platformPassword | 否   | string | --  | 平台密码    |
| platformEfa      | 否   | string | --  | efa     |
| platformRemarks  | 否   | string | --  | 平台备注    |

<a id="proxy-info">proxyInfo:</a>

| 参数名称          | 必需项 | 参数类型   | 默认值     | 描述                                    |
| ------------- | --- | ------ | ------- | ------------------------------------- |
| proxyMethod   | 否   | string | custom  | 代理方式，枚举值：自定义：custom                   |
| proxyCategory | 否   | string | noproxy | 代理类型，枚举值：noproxy, HTTP, HTTPS, SOCKS5, SSH |
| ipType        | 否   | string | IPV4    | 网络协议, 枚举值：IPV4, IPV6                  |
| host          | 否   | string | --      | 代理主机                                  |
| port          | 否   | string | --      | 代理端口                                  |
| proxyUserName | 否   | string | --      | 代理账号                                  |
| proxyPassword | 否   | string | --      | 代理密码                                  |
| refreshUrl    | 否   | string | --      | 刷新URL                                  |
| checkChannel  | 否   | string | --      | IP查询渠道                                 |


<a id="finger-info">fingerInfo:</a>

| 参数名称                    | 必需项<div style="min-width: 50px"></div> | 参数类型<div style="min-width: 65px"></div> | 默认值<div style="min-width: 50px"></div> | 描述                                                             |
| ----------------------- | -------------------------------------- | --------------------------------------- | -------------------------------------- | -------------------------------------------------------------- |
| isLanguageBaseIp        | 否                                      | boolean                                 | true                                   | 浏览器语言类型，跟随IP匹配：true，自定义：false，布尔类型，非必传, 默认true                 |
| language                | 否                                      | string                                  | --                                     | 浏览器语言类型为自定义时指定的语言值，str类型，非必传，见 [附录-语言列表](#api_language)         |
| isDisplayLanguageBaseIp | 否                                      | boolean                                 | true                                   | 界面语言类型，跟随IP匹配：true，自定义：false，布尔类型，非必传, 默认true                  |
| displayLanguage         | 否                                      | string                                  | --                                     | 界面语言类型为自定义时指定的语言值，str类型，非必传，见 [附录-界面语言列表](#api_dispalylanguage) |
| isTimeZone              | 否                                      | boolean                                 | true                                   | 时区类型，跟随IP匹配：true，自定义：false，布尔类型，非必传, 默认true                    |
| timeZone                | 否                                      | string                                  | --                                     | 时区类型为自定义时指定的时区值, str类型，非必传，见 [附录-时区列表](#api_timezone)           |
| position                | 否                                      | int                                     | 1                                      | 地理位置提示类型，询问: 0，允许：1，禁用：2                                       |
| isPositionBaseIp        | 否                                      | boolean                                 | true                                   | 地理位置类型，跟随IP匹配：true，自定义：false                                   |
| longitude               | 否                                      | string                                  | --                                     | 经度值，isPositionBaseIp为false时设置                                  |
| latitude                | 否                                      | string                                  | --                                     | 纬度值， isPositionBaseIp为false时设置                                 |
| precisionPos            | 否                                      | string                                  | --                                     | 精度值(米)， isPositionBaseIp为false时设置                              |
| forbidAudio             | 否                                      | boolean                                 | true                                   | 网页是否打开声音，开启：true，关闭：false                                      |
| forbidImage             | 否                                      | boolean                                 | true                                   | 网页是否加载图片，开启：true，关闭：false                                      |
| forbidMedia             | 否                                      | boolean                                 | true                                   | 网页是否播放视频，开启：true，关闭：false                                      |
| openWidth               | 否                                      | string                                  | 1000                                   | 窗口尺寸，宽度                                                        |
| openHeight              | 否                                      | string                                  | 1000                                   | 窗口尺寸，高度
| openBookmarks            | 否                                      | boolean                                 | false                                  | 是否开启书签，true：开启，false：关闭
| positionSwitch          | 否                                      | boolean                                 | true                                   | 窗口位置开关，true：自定义，false：全屏
| windowRatioPosition     | 否                                      | string                                  | 0,0                                   | 见 [windowRatioPosition](#windowRatioPosition)                                                       |
| isDisplayName           | 否                                      | boolean                                 | false                                  | 窗口名是否在标题栏显示，显示：true，不显示：false                                  |
| syncBookmark            | 否                                      | boolean                                 | false                                  | 是否同步书签，true：是，false：否                                          |
| syncHistory             | 否                                      | boolean                                 | false                                  | 是否同步历史记录，true：是，false：否                                        |
| syncTab                 | 否                                      | boolean                                 | true                                   | 是否同步标签页，true：是，false：否                                         |
| syncCookie              | 否                                      | boolean                                 | true                                   | 是否同步Cookie，true：是，false：否                                      |
| syncExtensions          | 否                                      | boolean                                 | false                                  | 是否同步扩展应用数据，true：是，false：否                                      |
| syncPassword            | 否                                      | boolean                                 | true                                   | 是否同步已保存的用户名密码，true：是，false：否                                   |
| syncIndexedDb           | 否                                      | boolean                                 | false                                  | 是否同步IndexedDB，true：是，false：否                                   |
| syncLocalStorage        | 否                                      | boolean                                 | false                                  | 是否同步Local Storage，true：是，false：否                               |
| clearCacheFile          | 否                                      | boolean                                 | false                                  | 启动浏览器前是否删除缓存文件，true：是，false：否                                  |
| clearCookie             | 否                                      | boolean                                 | false                                  | 启动浏览器前是否删除Cookie，true：是，false：否                                |
| clearLocalStorage       | 否                                      | boolean                                 | false                                  | 启动浏览器前删除Local Storage，true：是，false：否                           |
| randomFingerprint       | 否                                      | boolean                                 | false                                  | 启动浏览时是否随机生成指纹，true：是，false：否                                   |
| forbidSavePassword      | 否                                      | boolean                                 | false                                  | 网页是否弹出保存密码提示，true：是，false：否                                    |
| stopOpenNet             | 否                                      | boolean                                 | false                                  | 网络不通是否停止打开窗口，true：是，false：否                                    |
| stopOpenIP              | 否                                      | boolean                                 | false                                  | 出口IP发生变化是否停止打开窗口，true：是，false：否                                |
| stopOpenPosition        | 否                                      | boolean                                 | false                                  | 出口IP对应国家/地区发生变化是否停止打开窗口，true：是，false：否                         |
| openWorkbench        | 否                                         | int                                     | 1                                      | 是否打开工作台, 1: 开启，关闭: 0，跟随软件设置: 2                         |
| resolutionType          | 否                                      | boolean                                 | false                                  | 分辨率，true: 自定义, false: 跟随系统                                       |
| resolutionX             | 否                                      | string                                  | --                                     | 自定义分辨率时，分辨率宽度值, str类型，见 [附录-分辨率列表](#api_relution)               |
| resolutionY             | 否                                      | string                                  | --                                     | 自定义分辨率时，分辨率高度值, str类型，见 [附录-分辨率列表](#api_relution)               |
| fontType                | 否                                      | boolean                                 | false                                  | 字体指纹，随机：true，跟随系统：false                                        |
| webRTC                  | 否                                      | int                                     | 2                                      | webrtc 替换: 0，真实：1，禁止：2                                         |
| webGL                   | 否                                      | boolean                                 | true                                   | webGL图像， 随机：true，真实：false                                      |
| webGLInfo               | 否                                      | boolean                                 | true                                   | webGLInfo开关，自定义：true，真实：false                                  |
| webGLManufacturer       | 否                                      | string                                  | --                                     | webGLInfo为自定义时指定的webGL厂商值                                      |
| webGLRender             | 否                                      | string                                  | --                                     | webGLInfo为自定义时指定的webGL渲染值                                      |
| webGpu                  | 否                                      | string                                  | webgl                                  | webGpu，基于webgl匹配：webgl，真实：real，禁用：block                        |
| canvas                  | 否                                      | boolean                                 | true                                   | canvas，随机：true，真实：false                                        |
| audioContext            | 否                                      | boolean                                 | true                                   | audioContext值，随机：true，真实：false                                 |
| speechVoices            | 否                                      | boolean                                 | true                                   | Speech Voices，随机：true，真实：false                                 |
| doNotTrack              | 否                                      | boolean                                 | true                                   | doNotTrack，true：开启，false：关闭                                    |
| clientRects             | 否                                      | boolean                                 | true                                   | ClientRects，随机：true，真实：false                                   |
| deviceInfo              | 否                                      | boolean                                 | true                                   | 媒体设备，随机：true，真实：false                                          |
| deviceNameSwitch        | 否                                      | boolean                                 | true                                   | 设备名称，随机：true，真实：false                                          |
| macInfo                 | 否                                      | boolean                                 | true                                   | MAC地址，自定义：true，真实：false                                        |
| hardwareConcurrent      | 否                                      | string                                  | --                                     | 硬件并发数                                                          |
| deviceMemory            | 否                                      | string                                  | --                                     | 设备内存                                                           |
| disableSsl              | 否                                      | boolean                                 | false                                  | ssl指纹设置, true: 开启, false: 关闭                                   |
| disableSslList          | 否                                      | List                                    | --                                     | ssl特性值列表，List格式类型                                              |
| portScanProtect         | 否                                      | boolean                                 | true                                   | 端口扫描保护, false: 关闭, true: 开启                                    |
| portScanList            | 否                                      | string                                  | --                                     | 端口扫描保护开启时的白名单，英文逗号分隔                                           |
| useGpu                  | 否                                      | boolean                                 | true                                   | 使用硬件加速模式，true：是，false：否                                        |
| sandboxPermission       | 否                                      | boolean                                 | false                                  | 禁用沙盒，true：是，false：否                                            |
| startupParam            | 否                                      | string                                  | --                                     | 浏览器启动参数                                                        |

<a id="windowRatioPosition">windowRatioPosition:</a> 用于指定窗口在单/多显示器环境中的精确位置。该参数采用比例坐标系统，使您能够轻松定位窗口，无需考虑实际屏幕分辨率。

<div style="background: var(--vp-code-block-bg); padding: 20px; border-radius: 8px;">
坐标系统<br />
参数格式：(x, y)，其中：<br />
x 表示水平位置，取值范围为 0 到显示器总数<br />
y 表示垂直位置，取值范围为 0 到显示器总数<br />

单显示器示例

在单显示器环境中，坐标系统如下图所示：

<div style="display: flex; justify-content: center;">
<img src="/image/windowRatioPosition.png" alt="windowRatioPosition 参数" style="width: 80%; height: auto;" />
</div>

(0, 0) - 屏幕左上角<br />
(0.5, 0) - 屏幕顶部中央<br />
(1, 0) - 屏幕右上角<br />
(0, 0.5) - 屏幕左侧中央<br />
(0.5, 0.5) - 屏幕正中央<br />
(0, 1) - 屏幕左下角<br />

多显示器示例

横向排列显示器<br />
当两个显示器横向排列时：<br />
(0, 0) - 第一个显示器的左上角<br />
(1, 0) - 第一个显示器的右上角/第二个显示器的左上角<br />
(1.5, 0) - 第二个显示器的顶部中央<br />
(2, 0) - 第二个显示器的右上角<br />

纵向排列显示器<br />
当两个显示器纵向排列时：<br />
(0, 0) - 第一个显示器的左上角<br />
(0, 1) - 第一个显示器的左下角/第二个显示器的左上角<br />
(0, 1.5) - 第二个显示器的左侧中央<br />
(0, 2) - 第二个显示器的左下角
</div>

<p style="font-weight: 600"> <span class="order">2</span> 返回结果</p>



```Json
{
    "code": 0,          // 状态码, 0:成功，500：失败，int类型
    "msg": "成功",      // 返回结果, str类型
    "data": {
        "windowId": 20981, 
        "dirId": "05299704c4a89337bd6a37cdb9b95d96"
    }
}
```



| 字段名称 | 字段类型   | 描述               |
| ---- | ------ | ---------------- |
| code | int    | 状态码, 0：成功，500：失败 |
| msg  | string | 返回结果             |


### 修改浏览器窗口

<b style="font-size: 18px">POST /browser/mdf</b>

<!-- <br>

接口说明描述xxx -->

<p style="font-weight: 600"> <span class="order">1</span> 请求参数</p>



```Json
{   
    "workspaceId": 1,                                       // 工作空间id，int类型，必传，通过空间项目接口【/browser/workspace】获取
    "dirId": "dc1e73d4dd954a3a8ca087d53d2e18ce",            // 浏览器窗口id, str类型，必传
    "windowName": "Roxytest",                               // 窗口名称, str类型，非必传
    "coreVersion": "117",                                   // 内核版本，枚举值：138，137，136等, str类型，非必传
    "os": "Windows",                                        // 操作系统, 枚举值：Windows、macOS、IOS、Android, str类型，非必传，默认Windows
    "osVersion": "11",                                      // 操作系统版本, Windows的枚举值：11、10、8、7; macOS的枚举值: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7，Android的枚举值：14,13,12,11,10,9；IOS的枚举值：18.2,18.1,18.0,17.0,16.6,16.5,16.4,16.3,16.2,16.1,16.0,15.7,15.6,15.5,15.4,15.3,15.2,15.1,15.0,14.7,14.6,14.5,14.4,14.3,14.2,14.1,14.0；str类型，非必传，默认取最大值
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",   // userAgent, str类型，非必传
    "cookie": [],                                           // cookie, List类型，非必传
    "searchEngine": "Google",                               // 搜索引擎，枚举值：Google, Microsoft Bing, Yahoo, Yandex, DuckDuckGo, str类型，非必传，默认为Google
    "labelIds": [12,13],                                    // 标签列表id，List类型，非必传，通过标签列表接口【/browser/label】获取
    "windowPlatformList": [{
        "platformUrl": "https://www.tiktok.com/",           // 业务平台URL，str类型，非必传
        "platformUserName": "Roxytest",                     // 平台账号，str类型，非必传
        "platformPassword": "123456",                       // 平台密码，str类型，非必传
        "platformEfa": "2F3CD67B6D",                        // efa，str类型，非必传                                 
        "platformRemarks": "Roxytest"                       // 平台备注，str类型，非必传      
    }],
    "defaultOpenUrl": ["https://www.facebook.com"],         // 存储浏览器标签页，List类型，非必传
    "windowRemark": "Roxytest",                             // 窗口备注, str类型，非必传
    "projectId": 1,                                         // 项目ID, int类型, 非必传，通过空间项目接口【/browser/workspace】获取
    "proxyInfo": {
        "proxyMethod": "custom",                            // 代理方式，枚举值：手动填写：custom，str类型, 非必传，默认为custom
        "proxyCategory": "noproxy",                         // 代理类型，枚举值：noproxy, HTTP, HTTPS, SOCKS5, SSH, str类型，默认为noproxy
        "ipType": "IPV4",                                   // 网络协议, 枚举值：IPV4, IPV6，str类型，非必传，默认为IPV4
        "host": "122.11.11.11",                             // 代理主机，str类型，非必传
        "port": "37746",                                    // 代理端口，str类型，非必传
        "proxyUserName": "roxytest",                        // 代理账号，str类型，非必传
        "proxyPassword": "roxytest",                        // 代理密码，str类型，非必传
        "refreshUrl": "http://refresh-hk.roxybrowser.com",  // 刷新URL，str类型，非必传
        "checkChannel": "IPRust.io"                         // IP查询渠道，枚举值：IPRust.io,IP-API,IP123.in，str类型，非必传
    },
    "fingerInfo": {
        "isLanguageBaseIp": true,                           // 浏览器语言类型，跟随IP匹配：true，自定义：false，布尔类型，非必传, 默认true
        "language": "en-US",                                // 浏览器语言类型为自定义时指定的语言值，str类型，非必传，见附录-语言列表
        "isDisplayLanguageBaseIp": true,                    // 界面语言类型，跟随IP匹配：true，自定义：false，布尔类型，非必传, 默认true
        "displayLanguage": "en-US",                         // 界面语言类型为自定义时指定的语言值，str类型，非必传，见附录-界面语言列表
        "isTimeZone": true,                                 // 时区类型，跟随IP匹配：true，自定义：false，布尔类型，非必传, 默认true
        "timeZone": "GMT-12:00 Etc/GMT+12",                 // 时区类型为自定义时指定的时区值, str类型，非必传，见附录-时区列表
        "position": 0,                                      // 地理位置提示类型，询问: 0，允许：1，禁用：2，int类型, 非必传, 默认1
        "isPositionBaseIp": true,                           // 地理位置类型，跟随IP匹配：true，自定义：false，布尔类型，非必传, 默认true
        "longitude": "376",                                 // 经度值，isPositionBaseIp为false时设置, str类型, 非必传
        "latitude": "165",                                  // 纬度值， isPositionBaseIp为false时设置, str类型, 非必传
        "precisionPos": "600",                              // 精度值(米)， isPositionBaseIp为false时设置, str类型, 非必传
        "forbidAudio": true,                                // 网页是否打开声音，开启：true，关闭：false，布尔类型，非必传, 默认true
        "forbidImage": true,                                // 网页是否加载图片，开启：true，关闭：false，布尔类型，非必传, 默认true
        "forbidMedia": true,                                // 网页是否播放视频，开启：true，关闭：false，布尔类型，非必传, 默认true
        "openWidth": "1000",                                // 窗口尺寸，宽度, str类型，非必传，默认 1000
        "openHeight": "1000",                               // 窗口尺寸，高度, str类型，非必传，默认 1000
        "openBookmarks":false,                              // 是否开启书签，true：开启，false：关闭，布尔类型，非必传, 默认false
        "positionSwitch":false,                             // 窗口位置开关，true：自定义，false：全屏，布尔类型，非必传, 默认true
        "windowRatioPosition": "",                          // 指定窗口打开位置, str类型，非必传，默认(0, 0)。使用比例坐标系统，格式为"x,y"，取值范围为0到显示器数量。"0,0": 第一个显示器左上角；"0.5,0.5": 第一个显示器中央；"1.5,0": 两显示器横排时，第二显示器顶部中央；"0,1.5": 两显示器纵排时，第二显示器左侧中央
        "isDisplayName": false,                             // 窗口名是否在标题栏显示，显示：true，不显示：false，布尔类型，非必传, 默认false
        "syncBookmark": false,                              // 是否同步书签，true：是，false：否，布尔类型，非必传, 默认false
        "syncHistory": false,                               // 是否同步历史记录，true：是，false：否，布尔类型，非必传, 默认false
        "syncTab": true,                                    // 是否同步标签页，true：是，false：否，布尔类型，非必传, 默认true
        "syncCookie": true,                                 // 是否同步Cookie，true：是，false：否， 布尔类型，非必传, 默认true
        "syncExtensions": false,                            // 是否同步扩展应用数据，true：是，false：否，布尔类型，非必传, 默认false
        "syncPassword": true,                               // 是否同步已保存的用户名密码，true：是，false：否，布尔类型，非必传, 默认true
        "syncIndexedDb": false,                             // 是否同步IndexedDB，true：是，false：否，布尔类型，非必传, 默认false
        "syncLocalStorage": false,                          // 是否同步Local Storage，true：是，false：否，布尔类型，非必传, 默认false
        "clearCacheFile": true,                             // 启动浏览器前是否删除缓存文件，true：是，false：否，布尔类型，非必传, 默认false
        "clearCookie": true,                                // 启动浏览器前是否删除Cookie，true：是，false：否，布尔类型，非必传, 默认false
        "clearLocalStorage": true,                          // 启动浏览器前删除Local Storage，true：是，false：否，布尔类型，非必传, 默认false
        "randomFingerprint": false,                          // 启动浏览时是否随机生成指纹，true：是，false：否，布尔类型，非必传, 默认false
        "forbidSavePassword": true,                         // 网页是否弹出保存密码提示，true：是，false：否，布尔类型，非必传, 默认true
        "stopOpenNet": true,                                // 网络不通是否停止打开窗口，true：是，false：否，布尔类型，非必传, 默认false
        "stopOpenIP": true,                                 // 出口IP发生变化是否停止打开窗口，true：是，false：否，布尔类型，非必传, 默认false
        "stopOpenPosition": true,                           // 出口IP对应国家/地区发生变化是否停止打开窗口，true：是，false：否，布尔类型，非必传, 默认false
        "openWorkbench": 1,                                 // 是否打开工作台, 1: 开启，关闭: 0，跟随软件设置: 2，int类型, 非必传, 默认1
        "resolutionType": true,                             // 分辨率，true: 自定义, false: 跟随系统，布尔类型，非必传, 默认false
        "resolutionX": "",                                  // 自定义分辨率时，分辨率宽度值, str类型，见附录-分辨率列表，非必传
        "resolutionY": "",                                  // 自定义分辨率时，分辨率高度值, str类型，见附录-分辨率列表，非必传
        "fontType": false,                                  // 字体指纹，随机：true，跟随系统：false，布尔类型，非必传, 默认false
        "webRTC": 0,                                        // webrtc 替换: 0，真实：1，禁止：2，int类型, 非必传, 默认2
        "webGL": true,                                      // webGL图像， 随机：true，真实：false，布尔类型，非必传, 默认true
        "webGLInfo": true,                                  // webGLInfo开关，自定义：true，真实：false，布尔类型，非必传, 默认true
        "webGLManufacturer": "",                            // webGLInfo为自定义时指定的webGL厂商值, str类型，非必传
        "webGLRender": "",                                  // webGLInfo为自定义时指定的webGL渲染值, str类型，非必传
        "webGpu": "webgl",                                  // webGpu，基于webgl匹配：webgl，真实：real，禁用：block，str类型，非必传，默认值：webgl
        "canvas": true,                                     // canvas，随机：true，真实：false，布尔类型，非必传, 默认true
        "audioContext": true,                               // audioContext值，随机：true，真实：false，布尔类型，非必传, 默认true
        "speechVoices": true,                               // Speech Voices，随机：true，真实：false，布尔类型，非必传, 默认true
        "doNotTrack": true,                                 // doNotTrack，true：开启，false：关闭，布尔类型，非必传, 默认true
        "clientRects": true,                                // ClientRects，随机：true，真实：false，布尔类型，非必传, 默认true
        "deviceInfo": true,                                 // 媒体设备，随机：true，真实：false，布尔类型，非必传, 默认true
        "deviceNameSwitch": true,                           // 设备名称，随机：true，真实：false，布尔类型，非必传, 默认true
        "macInfo": true,                                    // MAC地址，自定义：true，真实：false，布尔类型，非必传, 默认true
        "hardwareConcurrent": "4",                          // 硬件并发数, str类型，非必传
        "deviceMemory": "8",                                // 设备内存, str类型，非必传
        "disableSsl": true,                                 // ssl指纹设置, true: 开启, false: 关闭, 布尔类型，非必传, 默认false
        "disableSslList": [],                               // ssl特性值列表，List格式类型，非必传
        "portScanProtect": true,                            // 端口扫描保护, false: 关闭, true: 开启，布尔类型，非必传, 默认true
        "portScanList": "",                                 // 端口扫描保护开启时的白名单，英文逗号分隔，str类型，非必传
        "useGpu": true,                                     // 使用硬件加速模式，true：是，false：否，布尔类型，非必传, 默认true
        "sandboxPermission": false,                         // 禁用沙盒，true：开启，false：关闭，布尔类型，非必传, 默认false
        "startupParam": ""                                  // 浏览器启动参数, str类型，多个参数以英文分号分隔，非必传
    }
}
```



| 参数名称               | 必需项<div style="min-width: 50px"></div>   | 参数类型<div style="min-width: 65px"></div> | 默认值     | 描述                                                                                                                                                                                                                               |
| ------------------ | ---------------------------------------- | --------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dirId              | <span class="parameter-require">是</span> | string                                  | --      | 浏览器窗口id                                                                                                                                                                                                                          |
| workspaceId        | <span class="parameter-require">是</span> | int                                     | --      | 工作空间id                                                                                                                                                                                                                           |
| windowName         | 否                                        | string                                  | --      | 窗口名称                                                                                                                                                                                                                             |
| coreVersion        | 否                                        | string                                  | 125     | 内核版本，枚举值：135，133，130，125，117，109，默认125                                                                                                                                                                                                           |
| os                 | 否                                        | string                                  | Windows | 操作系统, 枚举值：Windows、macOS、IOS、Android,                                                                                                                                                                                       |
| osVersion          | 否                                        | string                                  | 11      | 操作系统版本, <br/>Windows的枚举值：11、10、8、7;<br/>macOS的枚举值: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7，<br/>Android的枚举值：14,13,12,11,10,9；<br/>IOS的枚举值：18.2,18.1,18.0,17.0,16.6,16.5,16.4,16.3,16.2,16.1,16.0,15.7,15.6,15.5,15.4,15.3,15.2,15.1,15.0,14.7,14.6,14.5,14.4,14.3,14.2,14.1,14.0 |
| userAgent                 | 否                                        | string                                  | Mozilla/5.0 (Windows NT 10.0; Win64; x64)                                | userAgent
| cookie             | 否                                        | boolean                                 | --      | cookie                                                                                                                                                                                                                           |
| searchEngine             | 否                                        | string                                 | Google                                     | 搜索引擎                                                                                                                                                                                                                           |
| labelIds           | 否                                        | List                                    | --      | 标签列表id    
| defaultOpenUrl     | 否                                        | List                                    | --      | 存储浏览器标签页                                                                                                                                                                                                                         |
| windowRemark       | 否                                        | string                                  | --      | 窗口备注                                                                                                                                                                                                                             |
| projectId          | 否                                        | number                                  | --      | 项目ID                                                                                                                                                                                                                             |
| windowPlatformList | 否                                        | List                                    | --      | 见 [windowPlatformList](#window-platform-list)                                                                                                                                                                                    |
| proxyInfo          | 否                                        | object                                  | --      | 见 [proxyInfo](#proxy-info)                                                                                                                                                                                                       |
| fingerInfo         | 否                                        | object                                  | --      | 见 [fingerInfo](#finger-info)                                                                                                                                                                                                     |

<a id="window-platform-list">windowPlatformList:</a>

| 参数名称             | 必需项 | 参数类型   | 默认值 | 描述      |
| ---------------- | --- | ------ | --- | ------- |
| platformUrl      | 否   | string | --  | 业务平台URL |
| platformUserName | 否   | string | --  | 平台账号    |
| platformPassword | 否   | string | --  | 平台密码    |
| platformEfa      | 否   | string | --  | efa     |
| platformRemarks  | 否   | string | --  | 平台备注    |

<a id="proxy-info">proxyInfo:</a>

| 参数名称          | 必需项 | 参数类型   | 默认值     | 描述                                    |
| ------------- | --- | ------ | ------- | ------------------------------------- |
| proxyMethod   | 否   | string | custom  | 代理方式，枚举值：自定义：custom                   |
| proxyCategory | 否   | string | noproxy | 代理类型，枚举值：noproxy, HTTP, HTTPS, SOCKS5 |
| ipType        | 否   | string | IPV4    | 网络协议, 枚举值：IPV4, IPV6                  |
| host          | 否   | string | --      | 代理主机                                  |
| port          | 否   | string | --      | 代理端口                                  |
| proxyUserName | 否   | string | --      | 代理账号                                  |
| proxyPassword | 否   | string | --      | 代理密码                                  |
| refreshUrl    | 否   | string | --      | 刷新URL                                  |
| checkChannel  | 否   | string | --      | IP查询渠道                                  |

<a id="finger-info">fingerInfo:</a>

| 参数名称                    | 必需项<div style="min-width: 50px"></div> | 参数类型<div style="min-width: 65px"></div> | 默认值<div style="min-width: 50px"></div> | 描述                                                             |
| ----------------------- | -------------------------------------- | --------------------------------------- | -------------------------------------- | -------------------------------------------------------------- |
| isLanguageBaseIp        | 否                                      | boolean                                 | true                                   | 浏览器语言类型，跟随IP匹配：true，自定义：false，布尔类型，非必传, 默认true                 |
| language                | 否                                      | string                                  | --                                     | 浏览器语言类型为自定义时指定的语言值，str类型，非必传，见 [附录-语言列表](#api_language)         |
| isDisplayLanguageBaseIp | 否                                      | boolean                                 | true                                   | 界面语言类型，跟随IP匹配：true，自定义：false，布尔类型，非必传, 默认true                  |
| displayLanguage         | 否                                      | string                                  | --                                     | 界面语言类型为自定义时指定的语言值，str类型，非必传，见 [附录-界面语言列表](#api_dispalylanguage) |
| isTimeZone              | 否                                      | boolean                                 | true                                   | 时区类型，跟随IP匹配：true，自定义：false，布尔类型，非必传, 默认true                    |
| timeZone                | 否                                      | string                                  | --                                     | 时区类型为自定义时指定的时区值, str类型，非必传，见 [附录-时区列表](#api_timezone)           |
| position                | 否                                      | int                                     | 1                                      | 地理位置提示类型，询问: 0，允许：1，禁用：2                                       |
| isPositionBaseIp        | 否                                      | boolean                                 | true                                   | 地理位置类型，跟随IP匹配：true，自定义：false                                   |
| longitude               | 否                                      | string                                  | --                                     | 经度值，isPositionBaseIp为false时设置                                  |
| latitude                | 否                                      | string                                  | --                                     | 纬度值， isPositionBaseIp为false时设置                                 |
| precisionPos            | 否                                      | string                                  | --                                     | 精度值(米)， isPositionBaseIp为false时设置                              |
| forbidAudio             | 否                                      | boolean                                 | true                                   | 网页是否打开声音，开启：true，关闭：false                                      |
| forbidImage             | 否                                      | boolean                                 | true                                   | 网页是否加载图片，开启：true，关闭：false                                      |
| forbidMedia             | 否                                      | boolean                                 | true                                   | 网页是否播放视频，开启：true，关闭：false                                      |
| openWidth               | 否                                      | string                                  | 1000                                   | 窗口尺寸，宽度                                                        |
| openHeight              | 否                                      | string                                  | 1000                                   | 窗口尺寸，高度                                                        |
| openBookmarks           | 否                                      | boolean                                 | false                                  | 是否开启书签，true：开启，false：关闭                                  |
| positionSwitch          | 否                                      | boolean                                 | true                                   | 窗口位置开关，true：自定义，false：全屏                                  |
| windowRatioPosition     | 否                                      | string                                  | 0,0                                   | 见 [windowRatioPosition](#windowRatioPosition)| 
| isDisplayName           | 否                                      | boolean                                 | false                                  | 窗口名是否在标题栏显示，显示：true，不显示：false                                  |
| syncBookmark            | 否                                      | boolean                                 | false                                  | 是否同步书签，true：是，false：否                                          |
| syncHistory             | 否                                      | boolean                                 | false                                  | 是否同步历史记录，true：是，false：否                                        |
| syncTab                 | 否                                      | boolean                                 | true                                   | 是否同步标签页，true：是，false：否                                         |
| syncCookie              | 否                                      | boolean                                 | true                                   | 是否同步Cookie，true：是，false：否                                      |
| syncExtensions          | 否                                      | boolean                                 | false                                  | 是否同步扩展应用数据，true：是，false：否                                      |
| syncPassword            | 否                                      | boolean                                 | true                                   | 是否同步已保存的用户名密码，true：是，false：否                                   |
| syncIndexedDb           | 否                                      | boolean                                 | false                                  | 是否同步IndexedDB，true：是，false：否                                   |
| syncLocalStorage        | 否                                      | boolean                                 | false                                  | 是否同步Local Storage，true：是，false：否                               |
| clearCacheFile          | 否                                      | boolean                                 | false                                  | 启动浏览器前是否删除缓存文件，true：是，false：否                                  |
| clearCookie             | 否                                      | boolean                                 | false                                  | 启动浏览器前是否删除Cookie，true：是，false：否                                |
| clearLocalStorage       | 否                                      | boolean                                 | false                                  | 启动浏览器前删除Local Storage，true：是，false：否                           |
| randomFingerprint       | 否                                      | boolean                                 | false                                  | 启动浏览时是否随机生成指纹，true：是，false：否                                   |
| forbidSavePassword      | 否                                      | boolean                                 | false                                  | 网页是否弹出保存密码提示，true：是，false：否                                    |
| stopOpenNet             | 否                                      | boolean                                 | false                                  | 网络不通是否停止打开窗口，true：是，false：否                                    |
| stopOpenIP              | 否                                      | boolean                                 | false                                  | 出口IP发生变化是否停止打开窗口，true：是，false：否                                |
| stopOpenPosition        | 否                                      | boolean                                 | false                                  | 出口IP对应国家/地区发生变化是否停止打开窗口，true：是，false：否                         |
| openWorkbench           | 否                                      | int                                     | 1                                      | 是否打开工作台, 1: 开启，关闭: 0，跟随软件设置: 2                                          |
| resolutionType          | 否                                      | boolean                                 | false                                  | 分辨率，true: 自定义, false: 跟随系统                                       |
| resolutionX             | 否                                      | string                                  | --                                     | 自定义分辨率时，分辨率宽度值, str类型，见 [附录-分辨率列表](#api_relution)               |
| resolutionY             | 否                                      | string                                  | --                                     | 自定义分辨率时，分辨率高度值, str类型，见 [附录-分辨率列表](#api_relution)               |
| fontType                | 否                                      | boolean                                 | false                                  | 字体指纹，随机：true，跟随系统：false                                        |
| webRTC                  | 否                                      | int                                     | 2                                      | webrtc 替换: 0，真实：1，禁止：2                                         |
| webGL                   | 否                                      | boolean                                 | true                                   | webGL图像， 随机：true，真实：false                                      |
| webGLInfo               | 否                                      | boolean                                 | true                                   | webGLInfo开关，自定义：true，真实：false                                  |
| webGLManufacturer       | 否                                      | string                                  | --                                     | webGLInfo为自定义时指定的webGL厂商值                                      |
| webGLRender             | 否                                      | string                                  | --                                     | webGLInfo为自定义时指定的webGL渲染值                                      |
| webGpu                  | 否                                      | string                                  | webgl                                  | webGpu，基于webgl匹配：webgl，真实：real，禁用：block                        |
| canvas                  | 否                                      | boolean                                 | true                                   | canvas，随机：true，真实：false                                        |
| audioContext            | 否                                      | boolean                                 | true                                   | audioContext值，随机：true，真实：false                                 |
| speechVoices            | 否                                      | boolean                                 | true                                   | Speech Voices，随机：true，真实：false                                 |
| doNotTrack              | 否                                      | boolean                                 | true                                   | doNotTrack，true：开启，false：关闭                                    |
| clientRects             | 否                                      | boolean                                 | true                                   | ClientRects，随机：true，真实：false                                   |
| deviceInfo              | 否                                      | boolean                                 | true                                   | 媒体设备，随机：true，真实：false                                          |
| deviceNameSwitch        | 否                                      | boolean                                 | true                                   | 设备名称，随机：true，真实：false                                          |
| macInfo                 | 否                                      | boolean                                 | true                                   | MAC地址，自定义：true，真实：false                                        |
| hardwareConcurrent      | 否                                      | string                                  | --                                     | 硬件并发数                                                          |
| deviceMemory            | 否                                      | string                                  | --                                     | 设备内存                                                           |
| disableSsl              | 否                                      | boolean                                 | false                                  | ssl指纹设置, true: 开启, false: 关闭                                   |
| disableSslList          | 否                                      | List                                    | --                                     | ssl特性值列表，List格式类型                                              |
| portScanProtect         | 否                                      | boolean                                 | true                                   | 端口扫描保护, false: 关闭, true: 开启                                    |
| portScanList            | 否                                      | string                                  | --                                     | 端口扫描保护开启时的白名单，英文逗号分隔                                           |
| useGpu                  | 否                                      | boolean                                 | true                                   | 使用硬件加速模式，true：是，false：否                                        |
| sandboxPermission       | 否                                      | boolean                                 | false                                  | 禁用沙盒，true：是，false：否                                            |
| startupParam            | 否                                      | string                                  | --                                     | 浏览器启动参数                                                        |

<a id="windowRatioPosition">windowRatioPosition:</a> 用于指定窗口在单/多显示器环境中的精确位置。该参数采用比例坐标系统，使您能够轻松定位窗口，无需考虑实际屏幕分辨率。

<div style="background: var(--vp-code-block-bg); padding: 20px; border-radius: 8px;">
坐标系统<br />
参数格式：(x, y)，其中：<br />
x 表示水平位置，取值范围为 0 到显示器总数<br />
y 表示垂直位置，取值范围为 0 到显示器总数<br />

单显示器示例

在单显示器环境中，坐标系统如下图所示：

<div style="display: flex; justify-content: center;">
<img src="/image/windowRatioPosition.png" alt="windowRatioPosition 参数" style="width: 80%; height: auto;" />
</div>

(0, 0) - 屏幕左上角<br />
(0.5, 0) - 屏幕顶部中央<br />
(1, 0) - 屏幕右上角<br />
(0, 0.5) - 屏幕左侧中央<br />
(0.5, 0.5) - 屏幕正中央<br />
(0, 1) - 屏幕左下角<br />

多显示器示例

横向排列显示器<br />
当两个显示器横向排列时：<br />
(0, 0) - 第一个显示器的左上角<br />
(1, 0) - 第一个显示器的右上角/第二个显示器的左上角<br />
(1.5, 0) - 第二个显示器的顶部中央<br />
(2, 0) - 第二个显示器的右上角<br />

纵向排列显示器<br />
当两个显示器纵向排列时：<br />
(0, 0) - 第一个显示器的左上角<br />
(0, 1) - 第一个显示器的左下角/第二个显示器的左上角<br />
(0, 1.5) - 第二个显示器的左侧中央<br />
(0, 2) - 第二个显示器的左下角
</div>

<p style="font-weight: 600"> <span class="order">2</span> 返回结果</p>



```Json
{
    "code": 0,          // 状态码, 0:成功，500：失败，int类型
    "msg": "成功",      // 返回结果, str类型
    "data": {
        "windowId": 20981, 
        "dirId": "05299704c4a89337bd6a37cdb9b95d96"
    }
}
```



| 字段名称 | 字段类型   | 描述               |
| ---- | ------ | ---------------- |
| code | int    | 状态码, 0：成功，500：失败 |
| msg  | string | 返回结果             |


### 删除浏览器窗口(支持批量)

<b style="font-size: 18px">POST /browser/delete</b>

<!-- <br>

接口说明描述xxx -->

<p style="font-weight: 600"> <span class="order">1</span> 请求参数</p>



```Json
{   
    "workspaceId": 1,                              // 工作空间id，int类型，必传，通过空间项目接口【/browser/workspace】获取
    "dirIds": ["dc1ed4d","2e18ce","yy67yegk"]      // 浏览器窗口id，List类型，必传
}
```



| 参数名称        | 必需项                                           | 参数类型 | 默认值 | 描述     |
| ----------- | --------------------------------------------- | ---- | --- | ------ |
| workspaceId | <span class="parameter-require">是</span> | int  | --  | 工作空间id |
| dirIds | <span class="parameter-require">是</span> | List | --  | 浏览器窗口id |

<p style="font-weight: 600"> <span class="order">2</span> 返回结果</p>



```Json
{
    "code": 0,      // 状态码, 0:成功，500：失败，int类型
    "msg": "成功"   // 返回结果, str类型
}   
```



| 字段名称             | 字段类型   | 描述               |
| ---------------- | ------ | ---------------- |
| code             | int    | 状态码, 0：成功，500：失败 |
| msg              | string | 返回结果             |


### 打开浏览器窗口

<b style="font-size: 18px">POST /browser/open</b>

<!-- <br>

接口说明描述xxx -->

<p style="font-weight: 600"> <span class="order">1</span> 请求参数</p>



```Json
{   
    "workspaceId": 1,                                                   // 工作空间id，int类型，必传，通过空间项目接口【/browser/workspace】获取
    "dirId": "dc1e73d4dd954a3a8ca087d53d2e18ce",                        // 浏览器窗口id, str类型，必传
    "args": ["--remote-allow-origins=*", "--disable-audio-output"]      // 浏览器启动参数，List类型，非必传
}

注意：如下启动参数为系统内置参数，在修改时不会生效：
--disable-background-mode           
--disable-popup-blocking          
--no-first-run                      
--no-default-browser-check          
--remote-debugging-port=0           
--use-mock-keychain                 
--user-data-dir                     
--window-position=0,0               
--window-size=1000,1000             
--no-sandbox                        
--disable-setuid-sandbox  
          
详细参数说明可打开如下地址查看：https://peter.sh/experiments/chromium-command-line-switches/
浏览器暂时不支持无头模式（传入--headless 无法生效）
```



| 参数名称  | 必需项                                      | 参数类型   | 默认值 | 描述      |
| ----- | ---------------------------------------- | ------ | --- | ------- |
| workspaceId | <span class="parameter-require">是</span> | int  | --  | 工作空间id |
| dirId | <span class="parameter-require">是</span> | string | --  | 浏览器窗口id |
| args  | 否                                        | List   | --  | 浏览器启动参数 |

<p style="font-weight: 600"> <span class="order">2</span> 返回结果</p>



```Json
 {
    "code": 0,                                                                              // 状态码, 0:成功，500：失败，int类型
    "data": {       
        "ws": "ws://127.0.0.1:52314/devtools/browser/857b2d0d-aae6-4852-ab3c-0784f0b2c1fb", // 用于自动化工具的ws接口
        "http": "127.0.0.1:52314",                                                          // 用于自动化工具的http接口
        "coreVersion": "112",                                                               // 内核版本
        "driver": "C:\\Users\\lumibrowser\\AppData\\Roaming\\lumibrowser\\chrome-bin\\125\\chromedriver.exe",  // 用于自动化工具的webdriver
        "sortNum": 3474,                                                                    // 窗口排序号
        "windowName": "",                                                                   // 窗口名称
        "windowRemark": "",                                                                 // 窗口备注
        "pid":1111                                                                          // 进程id
    },
    "msg": "成功"                                                                           // 返回结果, str类型
}  
```



| 字段名称         | 字段类型   | 描述                |
| ------------ | ------ | ----------------- |
| code         | int    | 状态码, 0:成功，500：失败  |
| ws           | string | 用于自动化工具的ws接口      |
| http         | string | 用于自动化工具的http接口    |
| coreVersion  | string | 内核版本              |
| driver       | string | 用于自动化工具的webdriver |
| sortNum      | int    | 窗口排序号             |
| windowName   | string | 窗口名称              |
| windowRemark | string | 窗口备注              |
| pid          | int    | 进程id              |
| msg          | string | 返回结果              |


### 关闭浏览器窗口

<b style="font-size: 18px">POST /browser/close</b>

<!-- <br>

接口说明描述xxx -->

<p style="font-weight: 600"> <span class="order">1</span> 请求参数</p>



```Json
{
    "dirId": "dc1e73d4dd954a3a8ca087d53d2e18ce"     // 浏览器窗口id, str类型，必传
}
```



| 参数名称  | 必需项                                      | 参数类型   | 默认值 | 描述      |
| ----- | ---------------------------------------- | ------ | --- | ------- |
| dirId | <span class="parameter-require">是</span> | string | --  | 浏览器窗口id |

<p style="font-weight: 600"> <span class="order">2</span> 返回结果</p>



```Json
{
    "code": 0,          // 状态码, 0:成功，500：失败，int类型
    "msg": "成功"       // 返回结果, str类型
}
```



| 字段名称 | 字段类型   | 描述               |
| ---- | ------ | ---------------- |
| code | int    | 状态码, 0：成功，500：失败 |
| msg  | string | 返回结果             |


### 窗口随机指纹

<b style="font-size: 18px">POST /browser/random_env</b>

<!-- <br>

接口说明描述xxx -->

<p style="font-weight: 600"> <span class="order">1</span> 请求参数</p>



```Json
{   "workspaceId": 1,                                      // 工作空间id，int类型，必传，通过空间项目接口【/browser/workspace】获取
    "dirId": "dc1e73d4dd954a3a8ca087d53d2e18ce"            // 浏览器窗口id, str类型，必传
}
```



| 参数名称        | 必需项                                           | 参数类型 | 默认值 | 描述     |
| ----------- | --------------------------------------------- | ---- | --- | ------ |
| workspaceId | <span class="parameter-require">是</span> | int  | --  | 工作空间id |
| dirId | <span class="parameter-require">是</span> | string  | --  | 浏览器窗口id |

<p style="font-weight: 600"> <span class="order">2</span> 返回结果</p>



```Json
{
    "code": 0,      // 状态码, 0:成功，500：失败，int类型
    "msg": "成功"   // 返回结果, str类型
}   
```



| 字段名称             | 字段类型   | 描述               |
| ---------------- | ------ | ---------------- |
| code             | int    | 状态码, 0：成功，500：失败 |
| msg              | string | 返回结果             |


### 清空窗口本地缓存

<b style="font-size: 18px">POST /browser/clear_local_cache</b>

<!-- <br>

接口说明描述xxx -->

<p style="font-weight: 600"> <span class="order">1</span> 请求参数</p>



```Json
{
    "dirIds": ["dc1ed4d","2e18ce","yy67yegk"]    // 浏览器窗口id，List类型，必传
}
```



| 参数名称   | 必需项                                      | 参数类型 | 默认值 | 描述      |
| ------ | ---------------------------------------- | ---- | --- | ------- |
| dirIds | <span class="parameter-require">是</span> | List | --  | 浏览器窗口id |

<p style="font-weight: 600"> <span class="order">2</span> 返回结果</p>



```Json
{
    "code": 0,          // 状态码, 0:成功，500：失败，int类型
    "msg": "成功"       // 返回结果, str类型
}
```



| 字段名称 | 字段类型   | 描述               |
| ---- | ------ | ---------------- |
| code | int    | 状态码, 0：成功，500：失败 |
| msg  | string | 返回结果             |


### 清空窗口服务器缓存

<b style="font-size: 18px">POST /browser/clear_server_cache</b>

<!-- <br>

接口说明描述xxx -->

<p style="font-weight: 600"> <span class="order">1</span> 请求参数</p>



```Json
{   
    "workspaceId": 1,                              // 工作空间id，int类型，必传，通过空间项目接口【/browser/workspace】获取
    "dirIds": ["dc1ed4d","2e18ce","yy67yegk"]      // 浏览器窗口id，List类型，必传
}
```



| 参数名称        | 必需项                                           | 参数类型 | 默认值 | 描述     |
| ----------- | --------------------------------------------- | ---- | --- | ------ |
| workspaceId | <span class="parameter-require">是</span> | int  | --  | 工作空间id |
| dirIds | <span class="parameter-require">是</span> | List | --  | 浏览器窗口id |

<p style="font-weight: 600"> <span class="order">2</span> 返回结果</p>



```Json
{
    "code": 0,      // 状态码, 0:成功，500：失败，int类型
    "msg": "成功"   // 返回结果, str类型
}   
```



| 字段名称             | 字段类型   | 描述               |
| ---------------- | ------ | ---------------- |
| code             | int    | 状态码, 0：成功，500：失败 |
| msg              | string | 返回结果             |


### 已打开窗口进程信息

<b style="font-size: 18px">GET /browser/connection_info</b>

<!-- <br>

接口说明描述xxx -->

<p style="font-weight: 600"> <span class="order">1</span> 请求参数</p>



```Json
{   
    "dirIds": "dc1e73d4dd954a,157d4e73ae4f1ac8"                       // 浏览器窗口id列表, str类型, 多个以英文逗号分隔，非必传
}
```



| 参数名称        | 必需项                                      | 参数类型   | 默认值 | 描述      |
| ----------- | ---------------------------------------- | ------ | --- | ------- |
| dirIds      | 否                                        | string | --  | 浏览器窗口id列表 |

<p style="font-weight: 600"> <span class="order">2</span> 返回结果</p>



```Json
{
    "code": 0,                                                                                  // 状态码, 0:成功，500：失败，int类型
    "data": [
        {       
            "ws": "ws://127.0.0.1:52314/devtools/browser/857b2d0d-aae6-4852-ab3c-0784f0b2c1fb", // 用于自动化工具的ws接口
            "http": "127.0.0.1:52314",                                                          // 用于自动化工具的http接口
            "coreVersion": "112",                                                               // 内核版本
            "driver": "C:\\Users\\lumibrowser\\AppData\\Roaming\\lumibrowser\\chrome-bin\\125\\chromedriver.exe",  // 用于自动化工具的webdriver
            "sortNum": 3474,                                                                    // 窗口排序号
            "windowName": "",                                                                   // 窗口名称
            "windowRemark": "",                                                                 // 窗口备注
            "pid":1111,                                                                         // 进程id
            "dirId": "doc64hdyy7e"                                                              // 窗口Id
        },
        {       
            "ws": "ws://127.0.0.1:53325/devtools/browser/857b2d0d-aae6-4852-ab3c-0784f0b2c1fb",
            "http": "127.0.0.1:53325",
            "coreVersion": "112", 
            "driver": "C:\\Users\\lumibrowser\\AppData\\Roaming\\lumibrowser\\chrome-bin\\125\\chromedriver.exe",
            "sortNum": 3474, 
            "windowName": "", 
            "windowRemark": "",  
            "pid":2222, 
            "dirId": "doc64hdyy7e"
        }
    ],
    "msg": "成功"
}    
```



| 字段名称         | 字段类型   | 描述                |
| ------------ | ------ | ----------------- |
| code         | int    | 状态码, 0:成功，500：失败  |
| ws           | string | 用于自动化工具的ws接口      |
| http         | string | 用于自动化工具的http接口    |
| coreVersion  | string | 内核版本              |
| driver       | string | 用于自动化工具的webdriver |
| sortNum      | int    | 窗口排序号             |
| windowName   | string | 窗口名称              |
| windowRemark | string | 窗口备注              |
| pid          | int    | 进程id              |
| dirId        | string | 窗口Id              |


## API接入代码示例
### Python-代码调用示例

#### 1、接口调用示例

```Python
import requests
import json
import time

class RoxyClient:
    '''
    :param port: api服务的端口号
    :param token: api服务的token
    '''
    def __init__(self,port:int,token:str) -> None:
        self.port = port 
        self.host = "127.0.0.1"
        self.token = token
        self.url = f"http://{self.host}:{self.port}"

    def _build_headers(self):
        return {"Content-Type": "application/json","token":self.token}
    
    def _post(self,path,data = None):
        return requests.post(self.url + path,json=data,headers=self._build_headers())
    
    def _get(self,path,data = None):
        return requests.get(self.url + path,params=data,headers=self._build_headers())

    '''
    健康检查,用于检查API服务是否正常运行
    '''
    def health(self):
        return self._get("/health").json()
    
    '''
    获取工作空间项目列表,用于获取已拥有的空间和项目列表
    :param page_index,page_size 分页参数
    '''
    def workspace_project(self):
        return self._get("/browser/workspace").json()

    '''
    获取账号列表,用于获取已配置的平台账号
    :param workspaceId: 工作空间id, 必填，指定要获取哪个空间下的平台账号，通过workspace_project方法获取
    :param accountId: 账号库id, 选填
    :param page_index,page_size 分页参数
    '''
    def account(self,workspaceId:int,accountId:int = 0,page_index:int = 1,page_size:int = 15):
        return self._get("/browser/account",{"workspaceId":workspaceId,"accountId":accountId,"page_index":page_index,"page_size":page_size}).json()
    '''
    获取标签列表,用于获取已配置的标签信息
    :param workspaceId: 工作空间id, 必填，指定要获取哪个空间下的标签，通过workspace_project方法获取
    '''
    def label(self,workspaceId:int):
        return self._get("/browser/label",{"workspaceId":workspaceId}).json()
    '''
    获取窗口列表
    :param workspaceId: 工作空间id, 必填，指定要获取哪个空间下的窗口列表，通过workspace_project方法获取
    :param dirId: 窗口id, 选填；如果填了就只查询这个窗口的信息
    :param page_index,page_size 分页参数
    :res 返回值参考文档
    '''
    def browser_list(self,workspaceId:int,sortNums:str = "",page_index:int = 1,page_size:int = 15):
        return self._get("/browser/list_v3",{"workspaceId":workspaceId,"sortNums":sortNums,"page_index":page_index,"page_size":page_size}).json()
    
    '''
    获取浏览器窗口明细
    :param workspaceId: 工作空间id, 必填，指定要获取哪个空间下的窗口明细，通过workspace_project方法获取
    :param dirId: 窗口id, 必填，指定要获取的窗口
    :res 返回值参考文档
    '''
    def browser_detail(self, workspaceId: int, dirId: str):
        return self._get("/browser/detail", {"workspaceId": workspaceId, "dirId": dirId}).json()

    '''
    创建窗口
    :param data: 创建窗口需要传的参数,参考文档说明，其中workspaceId为必传，通过workspace_project方法获取
    :res 返回值参考文档
    '''
    def browser_create(self,data:dict = None):
        return self._post("/browser/create",data).json()

    '''
    修改窗口
    :param data: 修改窗口需要传的参数,参考文档说明，其中workspaceId和dirId为必传，workspaceId通过workspace_project方法获取
    :res 返回值参考文档
    '''
    def browser_mdf(self,data:dict):
        return self._post("/browser/mdf",data).json()
    
    '''
    删除窗口
    :param workspaceId: 工作空间id, 必填，指定窗口所在的空间，通过workspace_project方法获取
    :param dirIds: 窗口id列表, 必填，指定要删除的浏览器窗口列表
    :res 返回值参考文档
    '''
    def browser_delete(self,workspaceId:int,dirIds:list):
        return self._post("/browser/delete",{"workspaceId":workspaceId,"dirIds": dirIds}).json()
    
    '''
    打开窗口
    :param dirId: 需要打开的窗口ID，必填
    :param args: 指定浏览器启动参数，选填
    :res 返回值参考文档
    '''
    def browser_open(self,dirId:str,args=[]):
        return self._post("/browser/open",{"dirId":dirId,"args": args}).json()
        
    '''
    关闭窗口
    :param dirId: 需要关闭的窗口ID，必填
    :res 返回值参考文档
    '''
    def browser_close(self,dirId:str):
        return self._post("/browser/close",{"dirId":dirId}).json()

    '''
    窗口随机指纹
    :param workspaceId: 工作空间id, 必填，指定窗口所在的空间，通过workspace_project方法获取
    :param dirId: 窗口id, 必填，指定需要随机指纹的窗口
    :res 返回值参考文档
    '''
    def browser_random_env(self,workspaceId:int,dirId:str):
        return self._post("/browser/random_env",{"workspaceId": workspaceId,"dirId":dirId}).json()
    
    '''
    清空窗口本地缓存
    :param dirIds: 窗口id列表, 必填，指定要清空缓存的窗口列表
    :res 返回值参考文档
    '''
    def browser_local_cache(self,dirIds:list):
        return self._post("/browser/clear_local_cache",{"dirIds":dirIds}).json()
    
    '''
    清空窗口服务器缓存
    :param workspaceId: 工作空间id, 必填，指定窗口所在的空间，通过workspace_project方法获取
    :param dirIds: 窗口id列表, 必填，指定要清空缓存的窗口列表
    :res 返回值参考文档
    '''
    def browser_server_cache(self,workspaceId:int,dirIds:list):
        return self._post("/browser/clear_server_cache",{"workspaceId": workspaceId,"dirIds":dirIds}).json()
    
    '''
    获取已打开的浏览器信息
    :param dirIds: 需要查询的窗口ID，选填
    :res 返回值参考文档
    '''
    def browser_connection_info(self,dirIds=[]):
        return self._get("/browser/connection_info",{"dirIds":dirIds}).json()

if __name__ == "__main__":
    client = RoxyClient(port=50000,token="d1f497a404d6854880773e5c3cd9ca25")
    #print(client.health())
    print(client.workspace_project())
    #print(client.account(workspaceId=10))
    #print(client.browser_list(workspaceId=10,sortNums="1,2"))
    '''
    data = {
        "workspaceId": 10,
        "windowName":"启动时随机指纹",
        "coreVersion":"117",
        "os":"Windows",
        "osVersion": "11",
        "windowRemark":"备注",
        "proxyInfo":{
            "proxyMethod":"custom",
            "proxyCategory":"SOCKS5",
            "ipType":"IPV4",
            "protocol":"SOCKS5",
            "host":"xxx",
            "port":"1200",
            "proxyUserName":"xxx",
            "proxyPassword":"xxx"
        },
        "fingerInfo":{
            "randomFingerprint":False,
            "portScanProtect":False
        }
    }
    print(client.browser_create(data))
    
    data = {
        "workspaceId": 10,
        "dirId":"ac4bd731074a6ef3bbe1e8f4f6667749",
        "windowName":"修改窗口",
        "coreVersion":"109",
        "os":"macOS",
        "proxyInfo":{
            "port":"1000"
        }
    }
    print(client.browser_mdf(data))
    
    '''
    #print(client.browser_delete(workspaceId=10,dirIds=["ac4bd731074a6ef3bbe1e8f4f6667749"]))
    print(client.browser_open(dirId="ac4bd731074a6ef3bbe1e8f4f6667749"))
    #print(client.browser_close(dirId="ac4bd731074a6ef3bbe1e8f4f6667749"))
    #print(client.browser_random_env(workspaceId=10,dirId="ac4bd731074a6ef3bbe1e8f4f6667749"))
    #print(client.browser_local_cache(dirIds=["ac4bd731074a6ef3bbe1e8f4f6667749"]))
    #print(client.browser_server_cache(workspaceId=10,dirIds=["ac4bd731074a6ef3bbe1e8f4f6667749"]))
    print(client.browser_connection_info())
```

#### 2、selenium自动化运行示例

```Python
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.chrome.service import Service
import RoxyClient

if __name__ == "__main__":
    brwoser_id = "8ba009cbbedf192f34817574c81c9454"
    # 初始化客户端
    client = RoxyClient(port=50000,token="d1f491a404druyt54880943e5c3cd9ca25")
    # 打开浏览器
    rsp = client.browser_open(brwoser_id)
    if rsp.get("code") != 0:
        print("浏览器打开失败:",rsp)
        exit(0)
    # 获取selenium的连接信息
    debuggerAddress = rsp.get("data").get("http")
    driverPath = rsp.get("data").get("driver")
    print(f"浏览器打开成功,debuggerAddress:{debuggerAddress},driverPath:{driverPath}")

    # selenium 连接代码
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_experimental_option("debuggerAddress", debuggerAddress)

    chrome_service = Service(driverPath)
    driver = webdriver.Chrome(service=chrome_service, options=chrome_options)

    driver.get('https://ip123.in/')
    print(driver.title)

    #client.browser_close(brwoser_id)
```


### Nodejs-代码调用示例

#### 1、接口列表：roxy_api.js

```JavaScript
const fetch = require('node-fetch');

class RoxyClient {
    constructor(port, token)  {
        this.port = port;
        this.token = token;
        this.host = '127.0.0.1';
        this.url = "http://" + this.host + ":" + this.port
    }
    _build_headers() {
        return {"Content-Type": "application/json","token":this.token}
    }
    async _post(path,data) {
        const response = await fetch(`http://${this.host}:${this.port}${path}`, {
            method: 'post',
            body: JSON.stringify(data),
            headers: this._build_headers(),
            timeout:10000
        });
        return response.json()
    }

    async _get(path,data) {
    
        let parmas = ""
        if (data) {
            for (var k in data) {
                let v = data[k]
                if (parmas == "") {
                    parmas = `${k}=${v}`
                } else {
                    parmas = `${parmas}&${k}=${v}`
                }
            }
        }
        let base_url = `http://${this.host}:${this.port}${path}`
        // console.log(base_url)
        const response = await fetch(parmas==""?base_url:`${base_url}?${parmas}`, {
            headers: this._build_headers(),
            timeout:10000});
        return await response.json();
        
    }

    /*
    健康检查,用于检查API服务是否正常运行
    */
    health() {
        return this._get("/health")
    }
    
    /*
    获取工作空间项目列表,用于获取已拥有的空间和项目列表
    :param page_index,page_size 分页参数
    */
    workspace_project(self) {
        return this._get("/browser/workspace")
    }
    
    /*
    获取账号列表,用于获取已配置的平台账号
    :param workspaceId: 工作空间id, 必填，指定要获取哪个空间下的平台账号，通过workspace_project方法获取
    :param accountId: 账号库id, 选填
    :param page_index,page_size 分页参数
    */
    account(self,workspaceId,accountId = 0,page_index = 1,page_size = 15) {
        return self._get("/browser/account",{"workspaceId":workspaceId,"accountId":accountId,"page_index":page_index,"page_size":page_size})
    }
    /*
    获取标签列表,用于获取已配置的标签信息
    :param workspaceId: 工作空间id, 必填，指定要获取哪个空间下的标签，通过workspace_project方法获取
    */
    label(self,workspaceId) {
        return self._get("/browser/label",{"workspaceId":workspaceId})
    }
    /*
    获取窗口列表
    :param workspaceId: 工作空间id, 必填，指定要获取哪个空间下的窗口列表，通过workspace_project方法获取
    :param dirId: 窗口id, 选填；如果填了就只查询这个窗口的信息
    :param page_index,page_size 分页参数
    :res 返回值参考文档
    */
    browser_list(workspaceId,sortNums = "",page_index = 1,page_size = 15) {
        return this._get("/browser/list_v3",{"workspaceId":workspaceId,"sortNums":sortNums,"page_index":page_index,"page_size":page_size})
    }
    
    /*
    获取浏览器窗口明细
    :param workspaceId: 工作空间id, 必填，指定要获取哪个空间下的窗口明细，通过workspace_project方法获取
    :param dirId: 窗口id, 必填，指定要获取的窗口
    :res 返回值参考文档
    */
    browser_detail(workspaceId, dirId) {
        return this._get("/browser/detail", {"workspaceId": workspaceId, "dirId": dirId})
    }

    /*
    创建窗口
    :param data: 创建窗口需要传的参数,参考文档说明，其中workspaceId为必传，通过workspace_project方法获取
    :res 返回值参考文档
    */
    browser_create(data = {}) {
        return this._post("/browser/create",data)
    }

    /*
    修改窗口
    :param data: 修改窗口需要传的参数,参考文档说明，其中workspaceId和dirId为必传，workspaceId通过workspace_project方法获取
    :res 返回值参考文档
    */
    browser_mdf(data = {}) {
        return this._post("/browser/mdf",data)
    }

    /*
    删除窗口
    :param workspaceId: 工作空间id, 必填，指定窗口所在的空间，通过workspace_project方法获取
    :param dirIds: 窗口id列表, 必填，指定要删除的浏览器窗口列表
    :res 返回值参考文档
    */
    browser_delete(workspaceId,dirid) {
        return this._post("/browser/delete",{"workspaceId":workspaceId,"dirIds":[dirid]})
    }

    /*
    打开窗口
    :param dirId: 需要打开的窗口ID，必填
    :param args: 指定浏览器启动参数，选填
    :res 返回值参考文档
    */
    browser_open(dirId,args=[]) {
        return this._post("/browser/open",{"dirId":dirId,"args": args})
    }

    /*
    关闭窗口
    :param dirId: 需要关闭的窗口ID，必填
    :res 返回值参考文档
    */
    browser_close(dirId) {
        return this._post("/browser/close",{"dirId":dirId})
    }

    /*
    清空窗口本地缓存
    :param dirIds: 窗口id列表, 必填，指定要清空缓存的窗口列表
    :res 返回值参考文档
    */
    browser_clear_local_cache(dirid) {
        return this._post("/browser/clear_local_cache",{"dirIds":[dirid]})
    }
    
    /*
    清空窗口服务器缓存
    :param workspaceId: 工作空间id, 必填，指定窗口所在的空间，通过workspace_project方法获取
    :param dirIds: 窗口id列表, 必填，指定要清空缓存的窗口列表
    :res 返回值参考文档
    */
    browser_clear_server_cache(workspaceId,dirid) {
        return this._post("/browser/clear_server_cache",{"workspaceId": workspaceId,"dirIds":[dirid]})
    }

    /*
    窗口随机指纹
    :param workspaceId: 工作空间id, 必填，指定窗口所在的空间，通过workspace_project方法获取
    :param dirId: 窗口id, 必填，指定需要随机指纹的窗口
    :res 返回值参考文档
    */
    browser_random_env(workspaceId,dirid) {
        return this._post("/browser/random_env",{"workspaceId": workspaceId,"dirId":dirid})
    }
    
    /*
    获取已打开的浏览器信息
    :param dirIds: 需要查询的窗口ID，选填
    :res 返回值参考文档
    */
    browser_connection_info() {
        return this._get("/browser/connection_info")
    }

}

module.exports = {
    RoxyClient,
};
```

#### 2、主程序入口

```JavaScript
const {RoxyClient} = require("./roxy_api");
const puppeteer = require("puppeteer-core"); 
const api_token = "9976uu37d2df8bdde7bcbd872396142";
const roxy_client = new RoxyClient(50000, api_token);

const operate_window = async() => {

    // 健康检查
    let health_rsp = await roxy_client.health();
    console.log(`browser_health----rsp:${JSON.stringify(health_rsp)}}`);

    // 创建窗口
    let create_rsp = await roxy_client.browser_create();
    console.log(`browser_create----rsp:${JSON.stringify(create_rsp)}}`);
    
    // 获取窗口列表
    let browser_id = create_rsp["data"]["dirId"];
    let browsers_rsp = await roxy_client.browser_list(browser_id);
    console.log(`browser_list----rsp:${JSON.stringify(browsers_rsp)}}`);
    
    // 修改窗口
    let proxyInfo = {
        "proxyMethod":"custom",
        "proxyCategory":"noproxy"
    };
    let fingerInfo = {
        "clearCacheFile":true,
        "clearCookie":true,
        "clearHistory":true,
        "randomFingerprint":false,
        "syncTab":false,
        "syncCookie":false
    };
    let mdf_rsp = await roxy_client.browser_mdf({
        "windowName": "demo",
        "dirId": browser_id,
        "proxyInfo": proxyInfo,
        "os": "Windows",
        "coreVersion": "117",
        "fingerInfo": fingerInfo
    });

    console.log(`${browser_id} browser_mdf----rsp:${JSON.stringify(mdf_rsp)}`);
    
    try {
        // 打开窗口
        const rsp = await roxy_client.browser_open(browser_id);
        if (rsp["code"] != 0) {
            console.log(`${browser_id} browser_open err:${JSON.stringify(rsp)}`)
            if (rsp["msg"] == "窗口已打开") {
                let close_rsp = await roxy_client.browser_close(browser_id);
                console.log(`${browser_id} browser_close rsp:${JSON.stringify(close_rsp)}`);
            }
        }
        console.log(`${browser_id} browser_open success----ws:${rsp["data"]["ws"]}`);
        const browser = await puppeteer.connect({
            browserWSEndpoint:rsp["data"]["ws"],
            defaultViewport: null,
        });
        
        // 开始做业务
        let newPage = await browser.newPage();
        try {
            await newPage.goto("https://ip123.in/");
        } catch(err) {
            console.log(`${browser_id} open url err:${err}`);
        }

        // 已打开窗口进程信息
        let conn_info_rsp = await roxy_client.browser_connection_info();
        console.log(`browser_connection_info----rsp:${JSON.stringify(conn_info_rsp)}}`);
        
        // 关闭窗口
        // let close_rsp = await roxy_client.browser_close(browser_id);
        // console.log(`${browser_id} browser_close----rsp:${JSON.stringify(close_rsp)}`);

        // 清除本地缓存
        // let clear_local_rsp = await roxy_client.browser_clear_local_cache(browser_id);
        // console.log(`browser_clear_local_cache----rsp:${JSON.stringify(clear_local_rsp)}}`);

        // 清除服务器缓存
        // let clear_server_rsp = await roxy_client.browser_clear_server_cache(browser_id);
        // console.log(`browser_clear_server_cache----rsp:${JSON.stringify(clear_server_rsp)}}`);

        // 重新设置窗口指纹
        // let random_env_rsp = await roxy_client.browser_random_env(browser_id);
        // console.log(`browser_random_env----rsp:${JSON.stringify(random_env_rsp)}}`);

        // 删除窗口
        // let delete_rsp = await roxy_client.browser_delete(browser_id);
        // console.log(`browser_delete----rsp:${JSON.stringify(delete_rsp)}}`);

    } catch (err) {
        console.log(`${browser_id} run err:${err}`);
    }
}

(async () => {
    await operate_window();
})();
```


## 附录
### 附录-分辨率列表 {#api_relution}

####  格式：宽x高

<br>

##### 移动端：

```Text
320x569
360x640
360x720
360x740
360x748
360x760
360x780
411x731
414x896
480x853
480x854
```

##### 桌面端：

```Text
800x600
1024x768
1280x720
1280x800
1280x960
1280x1024
1360x768
1400x900
1400x1050
1600x900
1600x1200
1920x1080
1920x1200
2048x1152
2304x1440
2560x1440
2560x1600
2880x1800
5120x2880
```

### 附录-语言列表 {#api_language}

```Text
sq-AL    阿尔巴尼亚语 - shqip
ak    阿肯语 - Akan
ar    阿拉伯语 - العربية
an    阿拉贡语 - aragonés
am    阿姆哈拉语 - አማርኛ
as    阿萨姆语 - অসমীয়া
az-Cyrl-AZ    阿塞拜疆语 - azərbaycan
ast    阿斯图里亚斯语 - asturianu
ee    埃维语 - Eʋegbe
ay    艾马拉语 - Aymar
ga    爱尔兰语 - Gaeilge
et-EE    爱沙尼亚语 - eesti
oc    奥克语 - occitan
or    奥里亚语 - ଓଡ଼ିଆ
om    奥罗莫语 - Oromoo
eu    巴斯克语 - euskara
be-BY    白俄罗斯语 - беларуская
bm    班巴拉语 - bamanakan
bg-BG    保加利亚语 - български
nso    北索托语 - Northern Sotho
is-IS    冰岛语 - íslenska
pl-PL    波兰语 - polski
bs    波斯尼亚语 - bosanski
fa    波斯语 - فارسی
bho    博杰普尔语 - भोजपुरी
br    布列塔尼语 - brezhoneg
tn    茨瓦纳语 - Tswana
ts    聪加语 - Xitsonga
tt    鞑靼语 - татар
da-DK    丹麦语 - dansk
de    德语 - Deutsch
de-AT    德语（奥地利） - Deutsch (Österreich)
de-DE    德语（德国） - Deutsch (Deutschland)
de-LI    德语（列支敦士登） - Deutsch (Liechtenstein)
de-CH    德语（瑞士） - Deutsch (Schweiz)
dv    迪维希语 - ދިވެހި
doi    多格拉语 - डोगरी
ru    俄语 - русский
fo    法罗语 - føroyskt
fr    法语 - français
fr-FR    法语（法国） - français (France)
fr-CA    法语（加拿大） - français (Canada)
fr-CH    法语（瑞士） - français (Suisse)
sa    梵语 - संस्कृत भाषा
fil-PH    菲律宾语 - Filipino
fi-FI    芬兰语 - suomi
km    高棉语 - ខ្មែរ
ka-GE    格鲁吉亚语 - ქართული
gu    古吉拉特语 - ગુજરાતી
gn    瓜拉尼语 - Guarani
ia    国际语 - interlingua
kk    哈萨克语 - қазақ тілі
ht    海地克里奥尔语 - créole haïtien
ko    韩语 - 한국어
ha    豪萨语 - Hausa
nl-NL    荷兰语 - Nederlands
gl    加利西亚语 - galego
ca    加泰罗尼亚语 - català
cs-CZ    捷克语 - čeština
kn    卡纳达语 - ಕನ್ನಡ
ky    柯尔克孜语 - кыргызча
xh    科萨语 - IsiXhosa
co    科西嘉语 - Corsican
hr-HR    克罗地亚语 - hrvatski
qu    克丘亚语 - Runasimi
kok    孔卡尼语 - कोंकणी
ku    库尔德语 - Kurdî
la    拉丁语 - Latin
lv-LV    拉脱维亚语 - latviešu
lo-LA    老挝语 - ລາວ
lt-LT    立陶宛语 - lietuvių
ln    林加拉语 - lingála
lg    卢干达语 - Luganda
lb    卢森堡语 - Lëtzebuergesch
rw-RW    卢旺达语 - Kinyarwanda
ro-RO    罗马尼亚语 - română
mo    罗马尼亚语（摩尔多瓦） - română (Republica Moldova)
rm    罗曼什语 - rumantsch
mt-MT    马耳他语 - Malti
mr    马拉地语 - मराठी
mg    马拉加斯语 - Malagasy
ml    马拉雅拉姆语 - മലയാളം
ms    马来语 - Melayu
mk-MK    马其顿语 - македонски
mai    迈蒂利语 - मैथिली
mni-Mtei    曼尼普尔语（曼尼普尔文） - mni (Mtei)
mi    毛利语 - Māori
mn    蒙古语 - монгол
bn-BD    孟加拉语 - বাংলা
lus    米佐语 - Mizo tawng
my    缅甸语 - မြန်မာ
hmn    苗语 - Hmong
af    南非荷兰语 - Afrikaans
st    南索托语 - Southern Sotho
ne-NP    尼泊尔语 - नेपाली
nn    挪威尼诺斯克语 - norsk nynorsk
no    挪威语 - norsk
pa    旁遮普语 - ਪੰਜਾਬੀ
pt-PT    葡萄牙语 - português
pt-BR    葡萄牙语（巴西） - português (Brasil)
pt-PT    葡萄牙语（葡萄牙） - português (Portugal)
ps    普什图语 - پښتو
ny    齐切瓦语 - Nyanja
tw    契维语 - Twi
chr    切罗基语 - ᏣᎳᎩ
ja-JP    日语 - 日本語
sv-SE    瑞典语 - svenska
sm    萨摩亚语 - Samoan
sh    塞尔维亚-克罗地亚语 - srpskohrvatski
sr-Latn-RS    塞尔维亚语 - српски
si    僧伽罗语 - සිංහල
sn   绍纳语 - chiShona
eo   世界语 - Esperanto
nb   书面挪威语 - norsk bokmål
sk-SK    斯洛伐克语 - slovenčina
sl-SI    斯洛文尼亚语 - slovenščina
sw    斯瓦希里语 - Kiswahili
gd   苏格兰盖尔语 - Gàidhlig
ceb  宿务语 - Cebuano
so    索马里语 - Soomaali
tg    塔吉克语 - тоҷикӣ
te    泰卢固语 - తెలుగు
ta    泰米尔语 - தமிழ்
th    泰语 - ไทย
to    汤加语 - lea fakatonga
ti    提格利尼亚语 - ትግርኛ
tr-TR    土耳其语 - Türkçe
tk    土库曼语 - türkmen dili
wa    瓦隆语 - wa
cy    威尔士语 - Cymraeg
ug    维吾尔语 - ئۇيغۇرچە
wo    沃洛夫语 - Wolof
ur    乌尔都语 - اردو
uk-UA    乌克兰语 - українська
uz    乌兹别克语 - o‘zbek
es-ES     西班牙语 - español
es-AR    西班牙语（阿根廷） - español (Argentina)
es-CO    西班牙语（哥伦比亚） - español (Colombia)
es-CR    西班牙语（哥斯达黎加） - español (Costa Rica)
es-HN   西班牙语（洪都拉斯） - español (Honduras)
es-419   西班牙语（拉丁美洲） - español (Latinoamérica)
es-US    西班牙语（美国） - español (Estados Unidos)
es-PE    西班牙语（秘鲁） - español (Perú)
es-MX   西班牙语（墨西哥） - español (México)
es-VE    西班牙语（委内瑞拉） - español (Venezuela)
es-UY    西班牙语（乌拉圭） - español (Uruguay)
es-ES    西班牙语（西班牙） - español (España)
es-CL    西班牙语（智利） - español (Chile)
fy    西弗里西亚语 - Frysk
he   希伯来语 - עברית
el-GR   希腊语 - Ελληνικά
haw    夏威夷语 - ʻŌlelo Hawaiʻi
sd    信德语 - سنڌي
hu-HU    匈牙利语 - magyar
su    巽他语 - Basa Sunda
hy-AM    亚美尼亚语 - հայերեն
ig    伊博语 - Igbo
ilo   伊洛卡诺语 - Ilokano
it-IT    意大利语 - italiano
it-CH  意大利语（瑞士） - italiano (Svizzera)
it-IT    意大利语（意大利） - italiano (Italia)
yi    意第绪语 - ייִדיש
hi    印地语 - हिन्दी
id-ID    印度尼西亚语 - Indonesia
en    英语 - English
en-IE     英语（爱尔兰） - English (Ireland)
en-AU   英语（澳大利亚） - English (Australia)
en-CA   英语（加拿大） - English (Canada)
en-US   英语（美国） - English (United States)
en-ZA   英语（南非） - English (South Africa)
en-NZ   英语（新西兰） - English (New Zealand)
en-IN    英语（印度） - English (India)
en-GB-oxendict    英语（英国，《牛津英语词典》拼法） - English (United Kingdom
en-GB    英语（英国） - English (United Kingdom)
yo    约鲁巴语 - Èdè Yorùbá
vi-VN    越南语 - Tiếng Việt
jv    爪哇语 - Jawa
ckb    中库尔德语 - کوردیی ناوەندی
zh    中文 - 中文
zh-TW    中文（繁体） - 中文（繁體）
zh-CN    中文（简体） - 中文（简体）
zh-HK    中文（香港） - 中文（香港）
zu    祖鲁语 - isiZulu
```

### 附录-界面语言列表 {#api_dispalylanguage}

```Text
sq-AL    阿尔巴尼亚语 - shqip
ak    阿肯语 - Akan
ar    阿拉伯语 - العربية
an    阿拉贡语 - aragonés
am    阿姆哈拉语 - አማርኛ
as    阿萨姆语 - অসমীয়া
az-Cyrl-AZ    阿塞拜疆语 - azərbaycan
ast    阿斯图里亚斯语 - asturianu
ee    埃维语 - Eʋegbe
ay    艾马拉语 - Aymar
ga    爱尔兰语 - Gaeilge
et-EE    爱沙尼亚语 - eesti
oc    奥克语 - occitan
or    奥里亚语 - ଓଡ଼ିଆ
om    奥罗莫语 - Oromoo
eu    巴斯克语 - euskara
be-BY    白俄罗斯语 - беларуская
bm    班巴拉语 - bamanakan
bg-BG    保加利亚语 - български
nso    北索托语 - Northern Sotho
is-IS    冰岛语 - íslenska
pl-PL    波兰语 - polski
bs    波斯尼亚语 - bosanski
fa    波斯语 - فارسی
bho    博杰普尔语 - भोजपुरी
br    布列塔尼语 - brezhoneg
tn    茨瓦纳语 - Tswana
ts    聪加语 - Xitsonga
tt    鞑靼语 - татар
da-DK    丹麦语 - dansk
de    德语 - Deutsch
de-AT    德语（奥地利） - Deutsch (Österreich)
de-DE    德语（德国） - Deutsch (Deutschland)
de-LI    德语（列支敦士登） - Deutsch (Liechtenstein)
de-CH    德语（瑞士） - Deutsch (Schweiz)
dv    迪维希语 - ދިވެހި
doi    多格拉语 - डोगरी
ru    俄语 - русский
fo    法罗语 - føroyskt
fr    法语 - français
fr-FR    法语（法国） - français (France)
fr-CA    法语（加拿大） - français (Canada)
fr-CH    法语（瑞士） - français (Suisse)
sa    梵语 - संस्कृत भाषा
fil-PH    菲律宾语 - Filipino
fi-FI    芬兰语 - suomi
km    高棉语 - ខ្មែរ
ka-GE    格鲁吉亚语 - ქართული
gu    古吉拉特语 - ગુજરાતી
gn    瓜拉尼语 - Guarani
ia    国际语 - interlingua
kk    哈萨克语 - қазақ тілі
ht    海地克里奥尔语 - créole haïtien
ko    韩语 - 한국어
ha    豪萨语 - Hausa
nl-NL    荷兰语 - Nederlands
gl    加利西亚语 - galego
ca    加泰罗尼亚语 - català
cs-CZ    捷克语 - čeština
kn    卡纳达语 - ಕನ್ನಡ
ky    柯尔克孜语 - кыргызча
xh    科萨语 - IsiXhosa
co    科西嘉语 - Corsican
hr-HR    克罗地亚语 - hrvatski
qu    克丘亚语 - Runasimi
kok    孔卡尼语 - कोंकणी
ku    库尔德语 - Kurdî
la    拉丁语 - Latin
lv-LV    拉脱维亚语 - latviešu
lo-LA    老挝语 - ລາວ
lt-LT    立陶宛语 - lietuvių
ln    林加拉语 - lingála
lg    卢干达语 - Luganda
lb    卢森堡语 - Lëtzebuergesch
rw-RW    卢旺达语 - Kinyarwanda
ro-RO    罗马尼亚语 - română
mo    罗马尼亚语（摩尔多瓦） - română (Republica Moldova)
rm    罗曼什语 - rumantsch
mt-MT    马耳他语 - Malti
mr    马拉地语 - मराठी
mg    马拉加斯语 - Malagasy
ml    马拉雅拉姆语 - മലയാളം
ms    马来语 - Melayu
mk-MK    马其顿语 - македонски
mai    迈蒂利语 - मैथिली
mni-Mtei    曼尼普尔语（曼尼普尔文） - mni (Mtei)
mi    毛利语 - Māori
mn    蒙古语 - монгол
bn-BD    孟加拉语 - বাংলা
lus    米佐语 - Mizo tawng
my    缅甸语 - မြန်မာ
hmn    苗语 - Hmong
af    南非荷兰语 - Afrikaans
st    南索托语 - Southern Sotho
ne-NP    尼泊尔语 - नेपाली
nn    挪威尼诺斯克语 - norsk nynorsk
no    挪威语 - norsk
pa    旁遮普语 - ਪੰਜਾਬੀ
pt-PT    葡萄牙语 - português
pt-BR    葡萄牙语（巴西） - português (Brasil)
pt-PT    葡萄牙语（葡萄牙） - português (Portugal)
ps    普什图语 - پښتو
ny    齐切瓦语 - Nyanja
tw    契维语 - Twi
chr    切罗基语 - ᏣᎳᎩ
ja-JP    日语 - 日本語
sv-SE    瑞典语 - svenska
sm    萨摩亚语 - Samoan
sh    塞尔维亚-克罗地亚语 - srpskohrvatski
sr-Latn-RS    塞尔维亚语 - српски
si    僧伽罗语 - සිංහල
sn   绍纳语 - chiShona
eo   世界语 - Esperanto
nb   书面挪威语 - norsk bokmål
sk-SK    斯洛伐克语 - slovenčina
sl-SI    斯洛文尼亚语 - slovenščina
sw    斯瓦希里语 - Kiswahili
gd   苏格兰盖尔语 - Gàidhlig
ceb  宿务语 - Cebuano
so    索马里语 - Soomaali
tg    塔吉克语 - тоҷикӣ
te    泰卢固语 - తెలుగు
ta    泰米尔语 - தமிழ்
th    泰语 - ไทย
to    汤加语 - lea fakatonga
ti    提格利尼亚语 - ትግርኛ
tr-TR    土耳其语 - Türkçe
tk    土库曼语 - türkmen dili
wa    瓦隆语 - wa
cy    威尔士语 - Cymraeg
ug    维吾尔语 - ئۇيغۇرچە
wo    沃洛夫语 - Wolof
ur    乌尔都语 - اردو
uk-UA    乌克兰语 - українська
uz    乌兹别克语 - o‘zbek
es-ES     西班牙语 - español
es-AR    西班牙语（阿根廷） - español (Argentina)
es-CO    西班牙语（哥伦比亚） - español (Colombia)
es-CR    西班牙语（哥斯达黎加） - español (Costa Rica)
es-HN   西班牙语（洪都拉斯） - español (Honduras)
es-419   西班牙语（拉丁美洲） - español (Latinoamérica)
es-US    西班牙语（美国） - español (Estados Unidos)
es-PE    西班牙语（秘鲁） - español (Perú)
es-MX   西班牙语（墨西哥） - español (México)
es-VE    西班牙语（委内瑞拉） - español (Venezuela)
es-UY    西班牙语（乌拉圭） - español (Uruguay)
es-ES    西班牙语（西班牙） - español (España)
es-CL    西班牙语（智利） - español (Chile)
fy    西弗里西亚语 - Frysk
he   希伯来语 - עברית
el-GR   希腊语 - Ελληνικά
haw    夏威夷语 - ʻŌlelo Hawaiʻi
sd    信德语 - سنڌي
hu-HU    匈牙利语 - magyar
su    巽他语 - Basa Sunda
hy-AM    亚美尼亚语 - հայերեն
ig    伊博语 - Igbo
ilo   伊洛卡诺语 - Ilokano
it-IT    意大利语 - italiano
it-CH  意大利语（瑞士） - italiano (Svizzera)
it-IT    意大利语（意大利） - italiano (Italia)
yi    意第绪语 - ייִדיש
hi    印地语 - हिन्दी
id-ID    印度尼西亚语 - Indonesia
en    英语 - English
en-IE     英语（爱尔兰） - English (Ireland)
en-AU   英语（澳大利亚） - English (Australia)
en-CA   英语（加拿大） - English (Canada)
en-US   英语（美国） - English (United States)
en-ZA   英语（南非） - English (South Africa)
en-NZ   英语（新西兰） - English (New Zealand)
en-IN    英语（印度） - English (India)
en-GB-oxendict    英语（英国，《牛津英语词典》拼法） - English (United Kingdom
en-GB    英语（英国） - English (United Kingdom)
yo    约鲁巴语 - Èdè Yorùbá
vi-VN    越南语 - Tiếng Việt
jv    爪哇语 - Jawa
ckb    中库尔德语 - کوردیی ناوەندی
zh    中文 - 中文
zh-TW    中文（繁体） - 中文（繁體）
zh-CN    中文（简体） - 中文（简体）
zh-HK    中文（香港） - 中文（香港）
zu    祖鲁语 - isiZulu
```

### 附录-时区列表 {#api_timezone}

```Text
GMT-01:00 America/Scoresbysund
GMT-01:00 Atlantic/Azores
GMT-01:00 Atlantic/Cape_Verde
GMT-01:00 Etc/GMT+1
GMT-02:00 America/Noronha
GMT-02:00 Atlantic/South_Georgia
GMT-02:00 Etc/GMT+2
GMT-03:00 America/Araguaina
GMT-03:00 America/Argentina/Buenos_Aires
GMT-03:00 America/Argentina/Catamarca
GMT-03:00 America/Argentina/Cordoba
GMT-03:00 America/Argentina/Jujuy
GMT-03:00 America/Argentina/La_Rioja
GMT-03:00 America/Argentina/Mendoza
GMT-03:00 America/Argentina/Rio_Gallegos
GMT-03:00 America/Argentina/Salta
GMT-03:00 America/Argentina/San_Juan
GMT-03:00 America/Argentina/San_Luis
GMT-03:00 America/Argentina/Tucuman
GMT-03:00 America/Argentina/Ushuaia
GMT-03:00 America/Asuncion
GMT-03:00 America/Bahia
GMT-03:00 America/Belem
GMT-03:00 America/Cayenne
GMT-03:00 America/Fortaleza
GMT-03:00 America/Godthab
GMT-03:00 America/Maceio
GMT-03:00 America/Miquelon
GMT-03:00 America/Montevideo
GMT-03:00 America/Nuuk
GMT-03:00 America/Paramaribo
GMT-03:00 America/Punta_Arenas
GMT-03:00 America/Recife
GMT-03:00 America/Santarem
GMT-03:00 America/Santiago
GMT-03:00 America/Sao_Paulo
GMT-03:00 Antarctica/Palmer
GMT-03:00 Antarctica/Rothera
GMT-03:00 Atlantic/Stanley
GMT-03:00 Etc/GMT+3
GMT-03:30 America/St_Johns
GMT-04:00 America/Anguilla
GMT-04:00 America/Antigua
GMT-04:00 America/Aruba
GMT-04:00 America/Barbados
GMT-04:00 America/Blanc-Sablon
GMT-04:00 America/Boa_Vista
GMT-04:00 America/Campo_Grande
GMT-04:00 America/Caracas
GMT-04:00 America/Cuiaba
GMT-04:00 America/Curacao
GMT-04:00 America/Dominica
GMT-04:00 America/Glace_Bay
GMT-04:00 America/Goose_Bay
GMT-04:00 America/Grenada
GMT-04:00 America/Guadeloupe
GMT-04:00 America/Guyana
GMT-04:00 America/Halifax
GMT-04:00 America/Kralendijk
GMT-04:00 America/La_Paz
GMT-04:00 America/Lower_Princes
GMT-04:00 America/Manaus
GMT-04:00 America/Marigot
GMT-04:00 America/Martinique
GMT-04:00 America/Moncton
GMT-04:00 America/Montserrat
GMT-04:00 America/Port_of_Spain
GMT-04:00 America/Porto_Velho
GMT-04:00 America/Puerto_Rico
GMT-04:00 America/Santo_Domingo
GMT-04:00 America/St_Barthelemy
GMT-04:00 America/St_Kitts
GMT-04:00 America/St_Lucia
GMT-04:00 America/St_Thomas
GMT-04:00 America/St_Vincent
GMT-04:00 America/Thule
GMT-04:00 America/Tortola
GMT-04:00 Atlantic/Bermuda
GMT-04:00 Etc/GMT+4
GMT-05:00 America/Atikokan
GMT-05:00 America/Bogota
GMT-05:00 America/Cancun
GMT-05:00 America/Cayman
GMT-05:00 America/Detroit
GMT-05:00 America/Eirunepe
GMT-05:00 America/Grand_Turk
GMT-05:00 America/Guayaquil
GMT-05:00 America/Havana
GMT-05:00 America/Indiana/Indianapolis
GMT-05:00 America/Indiana/Marengo
GMT-05:00 America/Indiana/Petersburg
GMT-05:00 America/Indiana/Vevay
GMT-05:00 America/Indiana/Vincennes
GMT-05:00 America/Indiana/Winamac
GMT-05:00 America/Indianapolis
GMT-05:00 America/Iqaluit
GMT-05:00 America/Jamaica
GMT-05:00 America/Kentucky/Louisville
GMT-05:00 America/Kentucky/Monticello
GMT-05:00 America/Lima
GMT-05:00 America/Montreal
GMT-05:00 America/Nassau
GMT-05:00 America/New_York
GMT-05:00 America/Nipigon
GMT-05:00 America/Panama
GMT-05:00 America/Pangnirtung
GMT-05:00 America/Port-au-Prince
GMT-05:00 America/Rio_Branco
GMT-05:00 America/Thunder_Bay
GMT-05:00 America/Toronto
GMT-05:00 EST
GMT-05:00 EST5EDT
GMT-05:00 Etc/GMT+5
GMT-05:00 Pacific/Easter
GMT-06:00 America/Bahia_Banderas
GMT-06:00 America/Belize
GMT-06:00 America/Chicago
GMT-06:00 America/Costa_Rica
GMT-06:00 America/El_Salvador
GMT-06:00 America/Guatemala
GMT-06:00 America/Indiana/Knox
GMT-06:00 America/Indiana/Tell_City
GMT-06:00 America/Managua
GMT-06:00 America/Matamoros
GMT-06:00 America/Menominee
GMT-06:00 America/Merida
GMT-06:00 America/Mexico_City
GMT-06:00 America/Monterrey
GMT-06:00 America/North_Dakota/Beulah
GMT-06:00 America/North_Dakota/Center
GMT-06:00 America/North_Dakota/New_Salem
GMT-06:00 America/Rainy_River
GMT-06:00 America/Rankin_Inlet
GMT-06:00 America/Regina
GMT-06:00 America/Resolute
GMT-06:00 America/Swift_Current
GMT-06:00 America/Tegucigalpa
GMT-06:00 America/Winnipeg
GMT-06:00 CST6CDT
GMT-06:00 Etc/GMT+6
GMT-06:00 Pacific/Galapagos
GMT-07:00 America/Boise
GMT-07:00 America/Cambridge_Bay
GMT-07:00 America/Chihuahua
GMT-07:00 America/Creston
GMT-07:00 America/Dawson
GMT-07:00 America/Dawson_Creek
GMT-07:00 America/Denver
GMT-07:00 America/Edmonton
GMT-07:00 America/Fort_Nelson
GMT-07:00 America/Hermosillo
GMT-07:00 America/Inuvik
GMT-07:00 America/Mazatlan
GMT-07:00 America/Ojinaga
GMT-07:00 America/Phoenix
GMT-07:00 America/Whitehorse
GMT-07:00 America/Yellowknife
GMT-07:00 Etc/GMT+7
GMT-07:00 MST
GMT-07:00 MST7MDT
GMT-08:00 America/Los_Angeles
GMT-08:00 America/Tijuana
GMT-08:00 America/Vancouver
GMT-08:00 Etc/GMT+8
GMT-08:00 Pacific/Pitcairn
GMT-08:00 PST8PDT
GMT-09:00 America/Anchorage
GMT-09:00 America/Juneau
GMT-09:00 America/Metlakatla
GMT-09:00 America/Nome
GMT-09:00 America/Sitka
GMT-09:00 America/Yakutat
GMT-09:00 Etc/GMT+9
GMT-09:00 Pacific/Gambier
GMT-09:30 Pacific/Marquesas
GMT-10:00 America/Adak
GMT-10:00 Etc/GMT+10
GMT-10:00 HST
GMT-10:00 Pacific/Honolulu
GMT-10:00 Pacific/Rarotonga
GMT-10:00 Pacific/Tahiti
GMT-11:00 Etc/GMT+11
GMT-11:00 Pacific/Midway
GMT-11:00 Pacific/Niue
GMT-11:00 Pacific/Pago_Pago
GMT-12:00 Etc/GMT+12
GMT+00:00 Africa/Abidjan
GMT+00:00 Africa/Accra
GMT+00:00 Africa/Bamako
GMT+00:00 Africa/Banjul
GMT+00:00 Africa/Bissau
GMT+00:00 Africa/Conakry
GMT+00:00 Africa/Dakar
GMT+00:00 Africa/Freetown
GMT+00:00 Africa/Lome
GMT+00:00 Africa/Monrovia
GMT+00:00 Africa/Nouakchott
GMT+00:00 Africa/Ouagadougou
GMT+00:00 Africa/Sao_Tome
GMT+00:00 America/Danmarkshavn
GMT+00:00 Antarctica/Troll
GMT+00:00 Atlantic/Canary
GMT+00:00 Atlantic/Faroe
GMT+00:00 Atlantic/Madeira
GMT+00:00 Atlantic/Reykjavik
GMT+00:00 Atlantic/St_Helena
GMT+00:00 Etc/GMT
GMT+00:00 Etc/GMT-0
GMT+00:00 Etc/GMT+0
GMT+00:00 Etc/GMT0
GMT+00:00 Etc/Greenwich
GMT+00:00 Etc/Universal
GMT+00:00 Etc/Zulu
GMT+00:00 Europe/Dublin
GMT+00:00 Europe/Guernsey
GMT+00:00 Europe/Isle_of_Man
GMT+00:00 Europe/Jersey
GMT+00:00 Europe/Lisbon
GMT+00:00 Europe/London
GMT+00:00 GMT
GMT+00:00 UTC
GMT+00:00 WET
GMT+01:00 Africa/Algiers
GMT+01:00 Africa/Bangui
GMT+01:00 Africa/Brazzaville
GMT+01:00 Africa/Casablanca
GMT+01:00 Africa/Ceuta
GMT+01:00 Africa/Douala
GMT+01:00 Africa/El_Aaiun
GMT+01:00 Africa/Kinshasa
GMT+01:00 Africa/Lagos
GMT+01:00 Africa/Libreville
GMT+01:00 Africa/Luanda
GMT+01:00 Africa/Malabo
GMT+01:00 Africa/Ndjamena
GMT+01:00 Africa/Niamey
GMT+01:00 Africa/Porto-Novo
GMT+01:00 Africa/Tunis
GMT+01:00 Arctic/Longyearbyen
GMT+01:00 CET
GMT+01:00 Etc/GMT-1
GMT+01:00 Europe/Amsterdam
GMT+01:00 Europe/Andorra
GMT+01:00 Europe/Belgrade
GMT+01:00 Europe/Berlin
GMT+01:00 Europe/Bratislava
GMT+01:00 Europe/Brussels
GMT+01:00 Europe/Budapest
GMT+01:00 Europe/Busingen
GMT+01:00 Europe/Copenhagen
GMT+01:00 Europe/Gibraltar
GMT+01:00 Europe/Ljubljana
GMT+01:00 Europe/Luxembourg
GMT+01:00 Europe/Madrid
GMT+01:00 Europe/Malta
GMT+01:00 Europe/Monaco
GMT+01:00 Europe/Oslo
GMT+01:00 Europe/Paris
GMT+01:00 Europe/Podgorica
GMT+01:00 Europe/Prague
GMT+01:00 Europe/Rome
GMT+01:00 Europe/San_Marino
GMT+01:00 Europe/Sarajevo
GMT+01:00 Europe/Skopje
GMT+01:00 Europe/Stockholm
GMT+01:00 Europe/Tirane
GMT+01:00 Europe/Vaduz
GMT+01:00 Europe/Vatican
GMT+01:00 Europe/Vienna
GMT+01:00 Europe/Warsaw
GMT+01:00 Europe/Zagreb
GMT+01:00 Europe/Zurich
GMT+01:00 MET
GMT+02:00 Africa/Blantyre
GMT+02:00 Africa/Bujumbura
GMT+02:00 Africa/Cairo
GMT+02:00 Africa/Gaborone
GMT+02:00 Africa/Harare
GMT+02:00 Africa/Johannesburg
GMT+02:00 Africa/Khartoum
GMT+02:00 Africa/Kigali
GMT+02:00 Africa/Lubumbashi
GMT+02:00 Africa/Lusaka
GMT+02:00 Africa/Maputo
GMT+02:00 Africa/Maseru
GMT+02:00 Africa/Mbabane
GMT+02:00 Africa/Tripoli
GMT+02:00 Africa/Windhoek
GMT+02:00 Asia/Amman
GMT+02:00 Asia/Beirut
GMT+02:00 Asia/Damascus
GMT+02:00 Asia/Famagusta
GMT+02:00 Asia/Gaza
GMT+02:00 Asia/Hebron
GMT+02:00 Asia/Jerusalem
GMT+02:00 Asia/Nicosia
GMT+02:00 EET
GMT+02:00 Etc/GMT-2
GMT+02:00 Europe/Athens
GMT+02:00 Europe/Bucharest
GMT+02:00 Europe/Chisinau
GMT+02:00 Europe/Helsinki
GMT+02:00 Europe/Kaliningrad
GMT+02:00 Europe/Kiev
GMT+02:00 Europe/Mariehamn
GMT+02:00 Europe/Nicosia
GMT+02:00 Europe/Riga
GMT+02:00 Europe/Sofia
GMT+02:00 Europe/Tallinn
GMT+02:00 Europe/Uzhgorod
GMT+02:00 Europe/Vilnius
GMT+02:00 Europe/Zaporozhye
GMT+03:00 Africa/Addis_Ababa
GMT+03:00 Africa/Asmara
GMT+03:00 Africa/Dar_es_Salaam
GMT+03:00 Africa/Djibouti
GMT+03:00 Africa/Juba
GMT+03:00 Africa/Kampala
GMT+03:00 Africa/Mogadishu
GMT+03:00 Africa/Nairobi
GMT+03:00 Antarctica/Syowa
GMT+03:00 Asia/Aden
GMT+03:00 Asia/Baghdad
GMT+03:00 Asia/Bahrain
GMT+03:00 Asia/Istanbul
GMT+03:00 Asia/Kuwait
GMT+03:00 Asia/Qatar
GMT+03:00 Asia/Riyadh
GMT+03:00 Etc/GMT-3
GMT+03:00 Europe/Istanbul
GMT+03:00 Europe/Kirov
GMT+03:00 Europe/Minsk
GMT+03:00 Europe/Moscow
GMT+03:00 Europe/Simferopol
GMT+03:00 Indian/Antananarivo
GMT+03:00 Indian/Comoro
GMT+03:00 Indian/Mayotte
GMT+03:30 Asia/Tehran
GMT+04:00 Asia/Baku
GMT+04:00 Asia/Dubai
GMT+04:00 Asia/Muscat
GMT+04:00 Asia/Tbilisi
GMT+04:00 Asia/Yerevan
GMT+04:00 Etc/GMT-4
GMT+04:00 Europe/Astrakhan
GMT+04:00 Europe/Samara
GMT+04:00 Europe/Saratov
GMT+04:00 Europe/Ulyanovsk
GMT+04:00 Europe/Volgograd
GMT+04:00 Indian/Mahe
GMT+04:00 Indian/Mauritius
GMT+04:00 Indian/Reunion
GMT+04:30 Asia/Kabul
GMT+05:00 Antarctica/Mawson
GMT+05:00 Asia/Aqtau
GMT+05:00 Asia/Aqtobe
GMT+05:00 Asia/Ashgabat
GMT+05:00 Asia/Atyrau
GMT+05:00 Asia/Dushanbe
GMT+05:00 Asia/Karachi
GMT+05:00 Asia/Oral
GMT+05:00 Asia/Qyzylorda
GMT+05:00 Asia/Samarkand
GMT+05:00 Asia/Tashkent
GMT+05:00 Asia/Yekaterinburg
GMT+05:00 Etc/GMT-5
GMT+05:00 Indian/Kerguelen
GMT+05:00 Indian/Maldives
GMT+05:30 Asia/Calcutta
GMT+05:30 Asia/Colombo
GMT+05:30 Asia/Kolkata
GMT+05:45 Asia/Kathmandu
GMT+05:45 Asia/Katmandu
GMT+06:00 Antarctica/Vostok
GMT+06:00 Asia/Almaty
GMT+06:00 Asia/Bishkek
GMT+06:00 Asia/Dhaka
GMT+06:00 Asia/Omsk
GMT+06:00 Asia/Qostanay
GMT+06:00 Asia/Thimphu
GMT+06:00 Asia/Urumqi
GMT+06:00 Etc/GMT-6
GMT+06:00 Indian/Chagos
GMT+06:30 Asia/Yangon
GMT+06:30 Indian/Cocos
GMT+07:00 Antarctica/Davis
GMT+07:00 Asia/Bangkok
GMT+07:00 Asia/Barnaul
GMT+07:00 Asia/Ho_Chi_Minh
GMT+07:00 Asia/Hovd
GMT+07:00 Asia/Jakarta
GMT+07:00 Asia/Krasnoyarsk
GMT+07:00 Asia/Novokuznetsk
GMT+07:00 Asia/Novosibirsk
GMT+07:00 Asia/Phnom_Penh
GMT+07:00 Asia/Pontianak
GMT+07:00 Asia/Tomsk
GMT+07:00 Asia/Vientiane
GMT+07:00 Etc/GMT-7
GMT+07:00 Indian/Christmas
GMT+08:00 Asia/Brunei
GMT+08:00 Asia/Choibalsan
GMT+08:00 Asia/Hong_Kong
GMT+08:00 Asia/Irkutsk
GMT+08:00 Asia/Kuala_Lumpur
GMT+08:00 Asia/Kuching
GMT+08:00 Asia/Macau
GMT+08:00 Asia/Makassar
GMT+08:00 Asia/Manila
GMT+08:00 Asia/Shanghai
GMT+08:00 Asia/Singapore
GMT+08:00 Asia/Taipei
GMT+08:00 Asia/Ulaanbaatar
GMT+08:00 Australia/Perth
GMT+08:00 Etc/GMT-8
GMT+08:45 Australia/Eucla
GMT+09:00 Asia/Chita
GMT+09:00 Asia/Dili
GMT+09:00 Asia/Jayapura
GMT+09:00 Asia/Khandyga
GMT+09:00 Asia/Pyongyang
GMT+09:00 Asia/Seoul
GMT+09:00 Asia/Tokyo
GMT+09:00 Asia/Yakutsk
GMT+09:00 Etc/GMT-9
GMT+09:00 Pacific/Palau
GMT+09:30 Australia/Darwin
GMT+10:00 Antarctica/DumontDUrville
GMT+10:00 Asia/Ust-Nera
GMT+10:00 Asia/Vladivostok
GMT+10:00 Australia/Brisbane
GMT+10:00 Australia/Lindeman
GMT+10:00 Etc/GMT-10
GMT+10:00 Pacific/Chuuk
GMT+10:00 Pacific/Guam
GMT+10:00 Pacific/Port_Moresby
GMT+10:00 Pacific/Saipan
GMT+10:30 Australia/Adelaide
GMT+10:30 Australia/Broken_Hill
GMT+11:00 Antarctica/Casey
GMT+11:00 Antarctica/Macquarie
GMT+11:00 Asia/Magadan
GMT+11:00 Asia/Sakhalin
GMT+11:00 Asia/Srednekolymsk
GMT+11:00 Australia/Currie
GMT+11:00 Australia/Hobart
GMT+11:00 Australia/Lord_Howe
GMT+11:00 Australia/Melbourne
GMT+11:00 Australia/Sydney
GMT+11:00 Etc/GMT-11
GMT+11:00 Pacific/Bougainville
GMT+11:00 Pacific/Efate
GMT+11:00 Pacific/Guadalcanal
GMT+11:00 Pacific/Kosrae
GMT+11:00 Pacific/Noumea
GMT+11:00 Pacific/Pohnpei
GMT+12:00 Asia/Anadyr
GMT+12:00 Asia/Kamchatka
GMT+12:00 Etc/GMT-12
GMT+12:00 Pacific/Fiji
GMT+12:00 Pacific/Funafuti
GMT+12:00 Pacific/Kwajalein
GMT+12:00 Pacific/Majuro
GMT+12:00 Pacific/Nauru
GMT+12:00 Pacific/Norfolk
GMT+12:00 Pacific/Tarawa
GMT+12:00 Pacific/Wake
GMT+12:00 Pacific/Wallis
GMT+13:00 Antarctica/McMurdo
GMT+13:00 Etc/GMT-13
GMT+13:00 Pacific/Auckland
GMT+13:00 Pacific/Enderbury
GMT+13:00 Pacific/Fakaofo
GMT+13:00 Pacific/Tongatapu
GMT+13:45 Pacific/Chatham
GMT+14:00 Etc/GMT-14
GMT+14:00 Pacific/Apia
GMT+14:00 Pacific/Kiritimati   
```
