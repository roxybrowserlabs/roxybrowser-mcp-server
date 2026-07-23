# API

::: tip
This documentation reflects the local API of the latest RoxyBrowser client. Endpoint definitions may change between releases. Please update your client to the latest version before using this reference.
:::

## Browser Health Check
### Health Check

 <b style="font-size: 18px">GET /health</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>

```Text
None
```

<p style="font-weight: 600"> <span class="order">2</span> Response</p>



```Json
{
    "code": 0,         // Status code, 0: Success, 500: Failure, type: int
    "msg": "Success"   // Response message, type: str
}
```

| Field Name | Field Type | Description |
| ---------------- | ------ | ---------------- |
| code | int | Status code, 0: Success, 500: Failure |
| msg | string | Response message |


## Team Project API
### Get Team Project List

<b style="font-size: 18px">GET /browser/workspace</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>



```Json
{
    "page_index": 1,                               // Page index, type: int, optional, default: 1
    "page_size": 15                                // Page size, type: int, optional, default: 15
}
```

| Parameter   | Required | Type | Default | Description |
| ----------- | -------- | ---- | ------- | ----------- |
| page_index  | No       | int  | 1       | Page index  |
| page_size   | No       | int  | 15      | Page size   |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>



```Json
{
    "code": 0,                                              // Status code, 0: success, 500: failure, type: int
    "data": {
        "total": 1,                                         // Total count
        "rows": [
            {
                "id": 1,                                    // Team ID
                "workspaceName": "feihairui's Team",   // Team name
                "project_details": [                        // Project details
                    {
                        "projectId": 1,                     // Project ID
                        "projectName": "xxProject"          // Project name
                    }
                ]
            }
        ]
    },
    "msg": "success"                                        // Return message, type: str
}
```



| Field Name | Field Type | Description |
| --------------- | ------ | ---------------- |
| code | int | Status code, 0: Success, 500: Failed |
| total | int | Total count |
| id | int | Team ID |
| workspaceName | string | Team name |
| project_details | List | Project details |
| projectId | int | Project ID |
| projectName | string | Project name |
| msg | string | Response message |

### Get Account List

<b style="font-size: 18px">GET /browser/account</b>

<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>

```Json
{
    "workspaceId": 1,       // Team ID, type: int, required, obtained through team API [/browser/workspace]
    "accountId": 1,         // Account library ID, type: int, optional
    "page_index": 1,        // Page index, type: int, optional, default: 1
    "page_size": 15         // Page size, type: int, optional, default: 15
}
```

| Parameter Name | Required | Parameter Type | Default Value | Description |
| ----------- | ---------------------------------------- | ---- | --- | ------ |
| workspaceId | <span class="parameter-require">Yes</span> | int | -- | Team ID |
| accountId | No | int | 1 | Account library ID |
| page_index | No | int | 1 | Page index |
| page_size | No | int | 15 | Page size |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>



```Json
{
    "code": 0,                                                                  // Status code, 0: success, 500: failed, type: int
    "data": {
        "total": 1,                                                             // Total count
        "rows": [
            {
                "id": 3,                                                        // Account ID
                "platformUrl": "https://www.tiktok.com/",                       // Platform URL
                "platformUserName": "Roxytest",                                 // Platform username
                "platformPassword": "123456",                                   // Platform password
                "platformEfa": "2F3CD67B6D",                                    // Platform EFA
                "platformCookies": [{"name": "1","value": "2","domain": "3"}],  // Platform cookies
                "platformName": "Roxytest",                                     // Platform name
                "platformRemarks": "Roxytest",                                  // Platform remarks
                "createTime": "2024-10-23 15:45:46",                            // Creation time
                "updateTime": "2024-10-23 15:45:46"                             // Update time
            }
        ]
    },
    "msg": "Success"                                                            // Response message, type: str
}
```

| Field Name       | Data Type | Description                              |
| ---------------- | --------- | ---------------------------------------- |
| code             | int       | Status code, 0: success, 500: failed     |
| msg              | string    | Response message                         |
| total            | int       | Total count                             |
| id               | int       | Account ID                              |
| platformUrl      | string    | Platform URL                            |
| platformUserName | string    | Platform username                       |
| platformPassword | string    | Platform password                       |
| platformEfa      | string    | Platform EFA                            |
| platformCookies  | object    | Platform cookies                        |
| platformName     | string    | Platform name                           |
| platformRemarks  | string    | Platform remarks                        |
| createTime       | string    | Creation time                           |
| updateTime       | string    | Update time                             |


### Get Label List

<b style="font-size: 18px">GET /browser/label</b>

<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>



```Json
{
    "workspaceId": 1       // Team ID, type: int, required, obtainable through [/browser/workspace] interface
}
```

| Parameter Name | Required | Type | Default | Description |
| ----------- | ---------------------------------------- | ---- | --- | ------ |
| workspaceId | <span class="parameter-require">Yes</span> | int  | --  | Team ID |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>

```Json
{
    "code": 0,                                                                  // Status code, 0: success, 500: failure, type: int
    "data": [
        {
            "id": 3,                                                           // Tag ID
            "color": "#7558F5",                                                // Tag color
            "name": "roxy test tag"                                            // Tag name
        }
    ],
    "msg": "success"                                                           // Response message, type: str
}
```

| Field Name | Field Type | Description |
| ---------------- | ------ | ---------------- |
| code | int | Status code, 0: success, 500: failure |
| msg | string | Response message |
| id | int | Tag ID |
| color | string | Tag color |
| name | string | Tag name |

## Browser Profile Interface
### Get Browser Profile List 

<b style="font-size: 18px">GET /browser/list_v3</b>




<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>



```Json
{
    "workspaceId": 10,                              // Team ID, type: int, required, obtain through [/browser/workspace] interface
    "dirIds": "dc1ed4d,2e18ce,yy67yegk",            // Browser Profile IDs, type: str, optional, multiple values separated by commas
    "windowName": "Roxytest",                       // Browser Profile name, type: str, optional
    "sortNums": "11,12",                            // Profile sequence numbers, type: str, optional, multiple values separated by commas
    "os": "Windows",                                // Operating system, type: str, optional
    "projectIds": "10,11",                          // Project IDs, type: str, optional, multiple values separated by commas
    "windowRemark": "Windows",                      // Profile remarks, type: str, optional
    "page_index": 1,                                // Page index, type: int, optional, default: 1
    "page_size": 15                                 // Page size, type: int, optional, default: 15
}
```


| Parameter Name        | Required                                      | Parameter Type   | Default Value | Description      |
| ----------- | ---------------------------------------- | ------ | --- | ------- |
| workspaceId | <span class="parameter-require">Yes</span> | int    | --  | Team ID  |
| dirIds      | No                                        | string | --  | Browser Profile ID |
| windowName  | No                                        | string | --  | Browser Profile name |
| sortNums    | No                                        | string | --  | Profile number |
| os          | No                                        | string | --  | Operating system |
| projectIds  | No                                        | string | --  | Project ID |
| windowRemark| No                                        | string | --  | Profile remark |
| page_index  | No                                        | int    | 1   | Page index    |
| page_size   | No                                        | int    | 15  | Page size    |

<p style="font-weight: 600"> <span class="order">2</span> Response Result</p>


```Json
{
    "code": 0,
    "data": {
        "total": 1,
        "rows": [
            {
                "dirId": "dc1e73d4dd954a",                                       // Browser Profile ID, str type
                "windowSortNum": 99,                                             // Profile number, int type  
                "windowName": "Roxytest",                                        // Profile name, str type
                "coreVersion": "117",                                            // Core version, enum values: 135，133，130，125，117，109, str type
                "coreType": "Chrome",                                            // Browser core type, Chrome/Firefox, str type
                "os": "Windows",                                                 // Operating system, enum values: Windows、macOS、Android、IOS, str type
                "osVersion": "11",                                               // Operating system version, enum values for Profile: 11, 10, 8, 7; enum values for macOS: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7, enum values for Android：14、13、12、11、10、9; enum values for IOS：18.2、18.1、18.0、17.0、16.6、16.5、16.4、16.3、16.2、16.1、16.0、15.7、15.6、15.5、15.4、15.3、15.2、15.1、15.0、14.7、14.6、14.5、14.4、14.3、14.2、14.1、14.0; str type   
                "windowRemark": "Roxytest",                                      // Profile remarks, str type
                "createTime": "2024-01-09 12:12:12",                             // Creation time, str type
                "updateTime": "2024-01-09 12:12:12",                             // Update time, str type
                "userName": "roxytest",                                          // Username of the Profile owner, i.e., account, str type
            }
        ]
    },
    "msg": "success"                                                             // Response message, type: str
}
```




| Field Name<div style="min-width: 250px"></div> | Field Type<div style="min-width: 150px"></div> | Description                                                     |
| ---------------------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| dirId                                    | string                                   | Browser Profile ID                                                |
| windowSortNum                            | int                                      | Profile number                                                   |
| windowName                               | string                                   | Profile name                                                   |
| coreVersion                              | string                                   | Core version, enum values: 135，133，130，125，117，109                                   |
| coreType                                 | string                                   | Browser core type, Chrome/Firefox                                   |
| os                                       | string                                   | Operating system, enum values: Windows, macOS, Linux, Android, IOS                           |
| osVersion                                | string                                   | Operating system version, enum values for Profiles：11、10、8、7; <br/>enum values for Linux: ALL; <br/>enum values for macOS: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7; <br/> enum values for Android：14、13、12、11、10、9; <br/> enum values for IOS：18.2、18.1、18.0、17.0、16.6、16.5、16.4、16.3、16.2、16.1、16.0、15.7、15.6、15.5、15.4、15.3、15.2、15.1、15.0、14.7、14.6、14.5、14.4、14.3、14.2、14.1、14.0 |
| windowRemark                             | string                                   | Profile remark                                                   |
| createTime                               | string                                   | Profile creation time                                                 |
| updateTime                               | string                                   | Profile modification time                                                 |
| userName                                 | string                                   | Username of the Profile owner, i.e., account                                         |


 
### Get Browser Profile Detail

<b style="font-size: 18px">GET /browser/detail</b>




<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>



```Json
{
    "workspaceId": 10,                              // Team ID, type: int, required, obtain through [/browser/workspace] interface
    "dirId": "dc1ed4d",                             // Browser Profile IDs, type: str, required
}
```


| Parameter Name        | Required                                      | Parameter Type   | Default Value | Description      |
| ----------- | ---------------------------------------- | ------ | --- | ------- |
| workspaceId | <span class="parameter-require">Yes</span> | int    | --  | Team ID  |
| dirId      | <span class="parameter-require">Yes</span> | string | --  | Browser Profile ID | 

<p style="font-weight: 600"> <span class="order">2</span> Response Result</p>


```Json
{
    "code": 0,
    "data": {
        "total": 1,
        "rows": [
            {
                "dirId": "dc1e73d4dd954a",                                       // Browser Profile ID, str type
                "windowSortNum": 99,                                             // Profile number, int type  
                "windowName": "Roxytest",                                        // Profile name, str type
                "coreVersion": "117",                                            // Core version, enum values: 135，133，130，125，117，109, str type
                "os": "Windows",                                                 // Operating system, enum values: Windows、macOS、Linux、Android、IOS, str type
                "osVersion": "11",                                               // Operating system version, enum values for Profile: 11, 10, 8, 7; enum values for Linux: ALL; enum values for macOS: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7; enum values for Android：14、13、12、11、10、9; enum values for IOS：18.2、18.1、18.0、17.0、16.6、16.5、16.4、16.3、16.2、16.1、16.0、15.7、15.6、15.5、15.4、15.3、15.2、15.1、15.0、14.7、14.6、14.5、14.4、14.3、14.2、14.1、14.0; str type   
                "userAgent": "Mozilla/5.0 (Windows NT 10.0)",                    // User Agent, str type
                "cookie": [
                    {
                        "name": "1",
                        "value": "2", 
                        "domain": "3"
                    }
                ],                                                               // cookie, List type
                "searchEngine": "Google",                                        // Search engine, enum values: Google, Microsoft Bing, Yahoo, Yandex, DuckDuckGo, str type
                "windowPlatformList": [{
                    "id": 0,                                                     // Platform Account ID, int type, optional, obtained through Platform Account list API [/account/list]
                    "platformUrl": "https://www.tiktok.com/",                    // Platform Account URL, str type
                    "platformUserName": "Roxytest",                              // Platform account, str type
                    "platformPassword": "Roxytest",                              // Platform password, str type
                    "platformEfa": "2F3CD67B6D",                                 // efa, str type
                    "platformRemarks": "Roxytest"                                // Platform remarks, str type
                }],
                "defaultOpenUrl": ["https://www.facebook.com"],                  // Store browser tabs, List type
                "windowRemark": "Roxytest",                                      // Profile remarks, str type
                "projectId": 4,                                                  // Project ID, int type
                "projectName": "Roxytest",                                       // Project name, str type
                "openStatus": false,                                             // Whether the team has opened, enum values: true: opened, false: not opened, bool type
                "statusInfo":[{
                    "openTime": "2024-01-09 12:12:12",                           // Open time, str type
                    "openUserName": "test"                                       // Username of the opener, str type
                }],                                                              // Detailed information when the Profile is opened, List type
                "createTime": "2024-01-09 12:12:12",                             // Creation time, str type
                "updateTime": "2024-01-09 12:12:12",                             // Update time, str type
                "userName": "roxytest",                                          // Username of the Profile owner, i.e., account, str type
                "openTime": "2024-12-05 10:57:43",                               // Last open time of the Profile, str type
                "closeTime": "2024-12-05 10:40:54",                              // Last close time of the Profile, str type
                "proxyInfo": {
                        "moduleId": 0,                                           // Proxy ID, int type, 0 means not using, optional, obtained through proxy list API [/proxy/list]
                        "proxyMethod": "custom",                                 // Proxy method, enum values: custom (manual), choose (select proxy IP), str type
                        "proxyCategory": "noproxy",                              // Proxy type, enum values: noproxy, HTTP, HTTPS, SOCKS5, SSH, str type
                        "ipType": "IPV4",                                        // Network protocol, enum values: IPV4, IPV6, str type
                        "protocol": "SOCKS5",                                    // Proxy protocol, enum values: HTTP, HTTPS, SOCKS5, str type
                        "host": "122.11.11.11",                                  // Proxy host, str type
                        "port": "37746",                                         // Proxy port, str type
                        "proxyUserName": "roxytest",                             // Proxy account, str type
                        "proxyPassword": "roxytest",                             // Proxy password, str type
                        "refreshUrl": "http://refresh-hk.roxybrowser.com",       // Refresh URL, str type
                        "lastIp": "119.1.2.3",                                   // Exit IP, str type
                        "lastCountry": "CN",                                     // Exit country, str type
                        "checkChannel": "http://iprust.io/ip.json"               // IP query channel, str type
                        },
                "isOften": false,                                                // Whether bookmarked, true: yes, false: no, boolean type
                "labelInfo": [
                    {
                        "labelId": 859,                                          // Tag ID, int type
                        "labelName": "Roxytest",                                 // Tag name, str type
                        "labelColor": "#FC9D12"                                  // Tag color, str type
                    }
                ]                                                                // Tag details, List type
            }
        ]
    },
    "msg": "success"                                                             // Response message, type: str
}
```




| Field Name<div style="min-width: 250px"></div> | Field Type<div style="min-width: 150px"></div> | Description                                                     |
| ---------------------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| dirId                                    | string                                   | Browser Profile ID                                                |
| windowSortNum                            | int                                      | Profile number                                                   |
| windowName                               | string                                   | Profile name                                                   |
| coreVersion                              | string                                   | Core version, enum values: 135，133，130，125，117，109                                   |
| os                                       | string                                   | Operating system, enum values: Windows, macOS, Linux, Android, IOS                           |
| osVersion                                | string                                   | Operating system version, enum values for Profiles：11、10、8、7; <br/>enum values for Linux: ALL; <br/>enum values for macOS: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7; <br/> enum values for Android：14、13、12、11、10、9; <br/> enum values for IOS：18.2、18.1、18.0、17.0、16.6、16.5、16.4、16.3、16.2、16.1、16.0、15.7、15.6、15.5、15.4、15.3、15.2、15.1、15.0、14.7、14.6、14.5、14.4、14.3、14.2、14.1、14.0 |
| userAgent                                | string                                   | User Agent                                             |
| cookie                                   | List                                     | Cookie                                                 |
| searchEngine                             | string                                   | Search engine, enum values: Google, Microsoft Bing, Yahoo, Yandex, DuckDuckGo |
| defaultOpenUrl                           | List                                     | Stored browser tabs                                               |
| windowRemark                             | string                                   | Profile remark                                                   |
| projectId                                | int                                      | Project ID                                                   |
| projectName                              | string                                   | Project name                                                   |
| openStatus                               | boolean                                  | Whether opened within the team, enum values: true: opened, false: not opened                     |
| createTime                               | string                                   | Profile creation time                                                 |
| updateTime                               | string                                   | Profile modification time                                                 |
| userName                                 | string                                   | Username of the Profile owner, i.e., account                                         |
| openTime                                 | string                                   | Last open time of the Profile                                                 |
| closeTime                                | string                                   | Last close time of the Profile                                                 |
| isOften                                  | boolean                                  | Whether bookmarked, true: yes, false: no                                                   |
| windowPlatformList                       | List                                     | See [windowPlatformList](#window-platform-list)          |
| statusInfo                               | object                                   | Detailed information when the Profile is opened, see [statusInfo](#status-info)                |
| proxyInfo                                | object                                   | See [proxyInfo](#proxy-info)                             |                         |
| labelInfo                                | object                                   | See [labelInfo](#label-info)                             |                         |


<a id="window-platform-list">windowPlatformList:</a>

| Parameter Name             | Parameter Type   | Description      |
| ---------------- | ------ | ------- |
| platformUrl      | string | Platform Account URL |
| platformUserName | string | Platform account    |
| platformPassword | string | Platform password    |
| platformEfa      | string | EFA     |
| platformRemarks  | string | Platform remark    |

<a id="status-info">statusInfo:</a>

| Field Name         | Field Type   | Description     |
| ------------ | ------ | ------ |
| openUserName | string | Username of the opener |
| openTime     | string | Open time   |

<a id="proxy-info">proxyInfo:</a>

| Field Name          | Field Type   | Description                                         |
| ------------- | ------ | ------------------------------------------ |
| moduleId      | int    | Proxy ID, 0 means not using |
| proxyMethod   | string | Proxy method, enum values: custom (manual), choose (select proxy IP) |
| proxyCategory | string | Proxy type, enum values: noproxy, HTTP, HTTPS, SOCKS5      |
| ipType        | string | Network protocol, enum values: IPV4, IPV6                       |
| protocol      | string | Proxy protocol, enum values: HTTP, HTTPS, SOCKS5               |
| host          | string | Proxy host                                       |
| port          | string | Proxy port                                       |
| proxyUserName | string | Proxy account                                       |
| proxyPassword | string | Proxy password                                       |
| refreshUrl    | string | Refresh URL                                      |
| lastIp        | string | Exit IP                                       |
| lastCountry   | string | Exit country                                       |
| checkChannel  | string | IP query channel                                       |


<a id="label-info">labelInfo:</a>

| Field Name          | Field Type   | Description                                         |
| ------------- | ------ | ------------------------------------------ |
| labelId       | int    | Tag ID                                         |
| labelName     | string | Tag name                                       |
| labelColor    | string | Tag color                                       |


 
### Create Browser Profile

<b style="font-size: 18px">POST /browser/create</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>



```Json
{
    "workspaceId": 1,                                             // Team ID, int type, required, obtained through the Team Project API [/browser/workspace]
    "windowName": "Roxytest",                                     // Profile name, str type, optional
    "coreVersion": "117",                                         // Core version, enum values such as: 138，137，136 etc., str type, optional
    "coreType": "Chrome",                                         // Browser core type, Chrome/Firefox, str type, optional
    "os": "Windows",                                              // Operating system, enum values: Windows, macOS, Linux, IOS, Android, str type, optional, default Windows
    "osVersion": "11",                                            // Operating system version, enum values for Profiles: 11, 10, 8, 7; enum values for Linux：ALL，enum values for macOS: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7; enum values for Android: 14,13,12,11,10,9; enum values for IOS: 18.2,18.1,18.0,17.0,16.6,16.5,16.4,16.3,16.2,16.1,16.0,15.7,15.6,15.5,15.4,15.3,15.2,15.1,15.0,14.7,14.6,14.5,14.4,14.3,14.2,14.1,14.0; str type, optional, default is the maximum value
    "cookie": [],                                                 // Cookie, List type, optional
    "searchEngine": "Google",                                     // Search engine, enum values: Google, Microsoft Bing, Yahoo, Yandex, DuckDuckGo, string type, optional, default is Google
    "labelIds": [12,13],                                          // Tag ID list, List type, optional, obtained through the Tag List interface [/browser/label]
    "windowPlatformList": [{
        "id": 0,                                                  // Platform Account ID, int type, optional, obtained through Platform Account list API [/account/list]
        "platformUrl": "https://www.tiktok.com/",                 // Platform Account URL, str type, optional
        "platformUserName": "Roxytest",                           // Platform account, str type, optional
        "platformPassword": "12345655",                           // Platform password, str type, optional
        "platformEfa": "2F3CD67B6D",                              // EFA, str type, optional
        "platformRemarks": "Roxytest"                             // Platform remark, str type, optional
    }],
    "defaultOpenUrl": ["https://www.facebook.com"],               // Stored browser tabs, List type, optional
    "windowRemark": "Roxytest",                                   // Profile remark, str type, optional
    "projectId":1,                                                // Project ID, int type, optional, obtained through the Team Project API [/browser/workspace]
    "proxyInfo": {
        "moduleId": 0,                                            // Proxy ID, int type, 0 means not using, optional, obtained through proxy list API [/proxy/list]
        "proxyMethod": "custom",                                  // Proxy method, enum values: custom (manual), choose (select proxy IP), str type
        "proxyCategory": "noproxy",                               // Proxy type, enum values: noproxy, HTTP, HTTPS, SOCKS5, SSH, str type, optional, default is noproxy
        "ipType": "IPV4",                                         // Network protocol, enum values: IPV4, IPV6, str type, optional, default is IPV4
        "host": "122.11.11.11",                                   // Proxy host, str type, optional
        "port": "37746",                                          // Proxy port, str type, optional
        "proxyUserName": "roxytest",                              // Proxy account, str type, optional
        "proxyPassword": "roxytest",                              // Proxy password, str type, optional
        "refreshUrl": "http://refresh-hk.roxybrowser.com",        // Refresh URL, str type, optional
        "checkChannel": "IPRust.io"                               // IP query channel, enum values: IPRust.io, IP-API, IP123.in, str type, optional
    },
    "fingerInfo": {
        "isLanguageBaseIp": true,                                 // Browser Language Type, Follow IP: true, Custom: false, Boolean,  Optional, Default true
        "language": "en-US",                                      // Custom Browser Language Value, str type, Optional, See Appendix-Language List
        "isDisplayLanguageBaseIp": true,                          // Display Language Type, Follow IP: true, Custom: false, Boolean, Optional, Default true
        "displayLanguage": "en-US",                               // Custom Display Language Value, str type, Optional, See Appendix-Display Language List
        "isTimeZone": true,                                       // Time Zone Type, Follow IP: true, Custom: false, Boolean, Optional, Default true
        "timeZone": "GMT-12:00 Etc/GMT+12",                       // Custom Time Zone Value, str type, Optional, See Appendix-Time Zone List
        "position": 0,                                            // Geolocation Prompt Type, Ask: 0, Allow: 1, Disable: 2, int type, Optional, Default 1
        "isPositionBaseIp": true,                                 // Geolocation Type, Follow IP: true, Custom: false, Boolean, Optional, Default true
        "longitude": "376",                                       // Longitude Value, Set when isPositionBaseIp is false, str type, Optional
        "latitude": "165",                                        // Latitude Value, Set when isPositionBaseIp is false, str type, Optional
        "precisionPos": "600",                                    // Precision Value (meters), Set when isPositionBaseIp is false, str type, Optional
        "forbidAudio": true,                                      // Disable Web Page Audio, Enable: true, Disable: false, Boolean, Optional, Default true
        "forbidImage": true,                                      // Disable Web Page Images, Enable: true, Disable: false, Boolean, Optional, Default true
        "forbiddenPictureSize": 0,                                // Image loading size threshold. When `forbidImage` is `false`, setting `forbiddenPictureSize = 0` will disable loading of all images. Default: `0`.

        "forbidMedia": true,                                      // Disable Web Page Videos, Enable: true, Disable: false, Boolean, Optional, Default true
        "openWidth": "1000",                                      // Profile Size, Width, str type, Optional, Default 1000
        "openHeight": "1000",                                     // Profile Size, Height, str type, Optional, Default 1000
        "openBookmarks":false,                                    // Whether to enable bookmarks, true: enable, false: disable, Boolean, Optional, Default false
        "positionSwitch":false,                                   // Window Position Switch, true: Custom, false: Full Screen, Boolean, Optional, Default true
        "windowRatioPosition": "",                                // Specify the position to open the window, str type, optional, default 0,0. Using proportional coordinate system in 'x,y' format, with values ranging from 0 to the number of displays. '0,0' represents the top-left corner of the first display; '0.5,0.5' denotes the center of the first display; '1.5,0' indicates the top-center of the second display in horizontal arrangement; '0,1.5' signifies the middle-left of the second display in vertical arrangement.
        "isDisplayName": false,                                   // Show Profile Name in Title Bar, Show: true, Hide: false, Boolean, Optional, Default false
        "syncBookmark": false,                                    // Sync Bookmarks, true: Yes, false: No, Boolean, Optional, Default false
        "syncHistory": false,                                     // Sync History, true: Yes, false: No, Boolean, Optional, Default false
        "syncTab": true,                                          // Sync Tabs, true: Yes, false: No, Boolean, Optional, Default true
        "syncCookie": true,                                       // Sync Cookies, true: Yes, false: No, Boolean, Optional, Default true
        "syncExtensions": false,                                  // Sync Extensions Data, true: Yes, false: No, Boolean, Optional, Default false
        "syncPassword": true,                                     // Sync Saved Passwords, true: Yes, false: No, Boolean, Optional, Default true
        "syncIndexedDb": false,                                   // Sync IndexedDB, true: Yes, false: No, Boolean, Optional, Default false
        "syncLocalStorage": false,                                // Sync Local Storage, true: Yes, false: No, Boolean, Optional, Default false
        "clearCacheFile": true,                                   // Clear Cache Files on Browser Start, true: Yes, false: No, Boolean, Optional, Default false
        "clearCookie": true,                                      // Clear Cookies on Browser Start, true: Yes, false: No, Boolean, Optional, Default false
        "clearLocalStorage": true,                                // Clear Local Storage on Browser Start, true: Yes, false: No, Boolean, Optional, Default false
        "randomFingerprint": true,                                // Randomize Fingerprint on Browser Start, true: Yes, false: No, Boolean, Optional, Default false
        "forbidSavePassword": true,                               // Disable Save Password Prompt, true: Yes, false: No, Boolean, Optional, Default true
        "stopOpenNet": true,                                      // Stop Opening Profile on Network Failure, true: Yes, false: No, Boolean, Optional, Default false
        "stopOpenIP": true,                                       // Stop Opening Profile on IP Change, true: Yes, false: No, Boolean, Optional, Default false
        "stopOpenPosition": true,                                 // Stop Opening Profile on Country/Region Change, true: Yes, false: No, Boolean, Optional, Default false
        "openWorkbench": 1,                                       // Whether to open workbench, 0: Disable, 1: Enable, 2: Follow software settings, int type, optional, default 1
        "resolutionType": true,                                   // Resolution, true: Custom, false: System Default, Boolean, Optional, Default false
        "resolutionX": "",                                        // Custom Resolution Width Value, str type, See Appendix-Resolution List, Optional
        "resolutionY": "",                                        // Custom Resolution Height Value, str type, See Appendix-Resolution List, Optional
        "fontType": false,                                        // Font Fingerprint, Random: true, Follow System: false, Boolean, Optional, Default false
        "webRTC": 0,                                             // WebRTC, Replace: 0, Real: 1, Disable: 2, int type, Optional, Default 2
        "webGL": true,                                           // WebGL Image, Random: true, Real: false, Boolean, Optional, Default true
        "webGLInfo": true,                                       // WebGLInfo Switch, Custom: true, Real: false, Boolean, Optional, Default true
        "webGLManufacturer": "",                                 // Custom WebGL Manufacturer Value when webGLInfo is Custom, str type, Optional
        "webGLRender": "",                                       // Custom WebGL Renderer Value when webGLInfo is Custom, str type, Optional
        "webGpu": "webgl",                                       // WebGpu, Match WebGL: webgl, Real: real, Disable: block, str type, Optional, Default: webgl
        "canvas": true,                                          // Canvas, Random: true, Real: false, Boolean, Optional, Default true
        "audioContext": true,                                    // AudioContext Value, Random: true, Real: false, Boolean, Optional, Default true
        "speechVoices": true,                                    // Speech Voices, Random: true, Real: false, Boolean, Optional, Default true
        "doNotTrack": true,                                      // Do Not Track, true: Enable, false: Disable, Boolean, Optional, Default true
        "clientRects": true,                                     // ClientRects, Random: true, Real: false, Boolean, Optional, Default true
        "deviceInfo": true,                                      // Media Devices, Random: true, Real: false, Boolean, Optional, Default true
        "deviceNameSwitch": true,                                // Device Name, Random: true, Real: false, Boolean, Optional, Default true
        "macInfo": true,                                         // MAC Address, Custom: true, Real: false, Boolean, Optional, Default true
        "hardwareConcurrent": "4",                               // Hardware Concurrency, str type, Optional
        "deviceMemory": "8",                                     // Device Memory, str type, Optional
        "disableSsl": true,                                      // SSL Fingerprint Setting, true: Enable, false: Disable, Boolean, Optional, Default false
        "disableSslList": [],                                    // SSL Feature Value List, List type, Optional
        "portScanProtect": true,                                 // Port Scan Protection, false: Disable, true: Enable, Boolean, Optional, Default true
        "portScanList": "",                                      // Port Scan Protection Whitelist, Comma-separated, str type, Optional
        "useGpu": true,                                          // Use GPU Acceleration Mode, true: Yes, false: No, Boolean, Optional, Default true
        "sandboxPermission": false,                              // Disable Sandbox, true: Enable, false: Disable, Boolean, Optional, Default false
        "startupParam": "",                                     // Browser Startup Parameters, str type, Semicolon-separated, Optional
        "openBattery": false,                                   // Battery API simulation master switch, Boolean, Optional, Default false
        "openCharging": false,                                  // Simulated charging state when battery simulation is enabled, Boolean, Optional, Default false
        "chargingTime": "",                                     // Seconds until full charge (numeric value only, no unit suffix), str, Optional
        "dischargingTime": "",                                  // Seconds until empty (numeric value only, no unit suffix), str, Optional
        "level": "",                                            // Battery level, 0–1, str, Optional
        "openNetwork": false,                                   // Network Information API simulation master switch, Boolean, Optional, Default false
        "networkType": "wifi",                                  // Connection type: wifi, cellular, ethernet, bluetooth, wimax, other, unknown, str, Optional
        "networkSpeed": "4g",                                   // Effective connection type: slow-2G, 2g, 3g, 4g (maps to downlinkMax/effectiveType; if networkType is cellular, slow-2G is normalized to 2G for the underlying nettype), str, Optional
        "downloadSpeed": "",                                    // Downlink speed, Mbps, str, Optional
        "maxDownloadSpeed": "",                                 // Maximum downlink speed, Mbps, str, Optional
        "latency": "",                                          // Round-trip time, ms, str or number, Optional
        "saveFlowMode": false,                                  // Save-Data / reduced data mode, Boolean, Optional, Default false
        "openBluetooth": false,                                 // Bluetooth simulation master switch, Boolean, Optional, Default false
        "bluetoothAdapter": false,                              // Simulated Bluetooth adapter present, Boolean, Optional, Default false
        "blockDomainList": "",                                  // Domain blocklist, multiple domains separated by \n
        "allowDomainList": ""                                   // Domain allowlist, multiple domains separated by \n
    }
}

```

| Parameter Name | Required<div style="min-width: 65px"></div> |  Parameter Type <div style="min-width: 120px"></div> | Default Value<div style="min-width: 120px"></div> | Description |
|-----------------|-----------|-----------------|----------------|-------------|
| workspaceId | <span class="parameter-require">Yes</span> | int | -- | Team ID |
| windowName | No | string | -- | Profile name |
| coreVersion | No | string | Latest | Core version, enum values: 135，133，130，125，117，109 |
| coreType | No | string | Chrome | Browser core type, Chrome/Firefox |
| os | No | string | Windows | Operating system, enum values: Windows, macOS, IOS, Android |
| osVersion | No | string | Maximum value | Operating system version, enum values for Windows: 11, 10, 8, 7;<br/>enum values for macOS: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7; enum values for Android: 14,13,12,11,10,9; enum values for IOS: 18.2,18.1,18.0,17.0,16.6,16.5,16.4,16.3,16.2,16.1,16.0,15.7,15.6,15.5,15.4,15.3,15.2,15.1,15.0,14.7,14.6,14.5,14.4,14.3,14.2,14.1,14.0 |
| cookie | No | List | [] | Cookie |
| searchEngine | No | string | Google | Search engine, options include: Google, Microsoft Bing, Yahoo, Yandex, DuckDuckGo
| labelIds | No | List | -- | Tag ID list, obtained through the Tag List interface [/browser/label] |
| defaultOpenUrl | No | List | -- | Stored browser tabs |
| windowRemark | No | string | -- | Profile remark |
| projectId | No | number | -- | Project ID |
| windowPlatformList | No | List | -- | See [windowPlatformList](#window-platform-list) |
| proxyInfo | No | object | -- | See [proxyInfo](#proxy-info) | 
| fingerInfo | No | object | -- | See [fingerInfo](#finger-info) | 

<a id="window-platform-list">windowPlatformList:</a>

| Parameter Name | Required | Parameter Type | Default Value | Description |
| --------------- | --- | ------------ | --- | ----------- |
| platformUrl | No | string | -- | Platform Account URL |
| platformUserName | No | string | -- | Platform Account |
| platformPassword | No | string | -- | Platform Password |
| platformEfa | No | string | -- | efa |
| platformRemarks | No | string | -- | Platform Remarks |


<a id="proxy-info">proxyInfo:</a>

| Parameter Name | Required | Parameter Type | Default Value | Description |
| ------------- | --- | ------------ | ------- | ------------------------------------- |
| moduleId | No | int | 0 | Proxy ID, 0 means not using, obtained through proxy list API [/proxy/list] |
| proxyMethod | No | string | custom | Proxy Method, Enum: custom (manual), choose (select proxy IP) |
| proxyCategory | No | string | noproxy | Proxies Category, Enum: noproxy, HTTP, HTTPS, SOCKS5, SSH |
| ipType | No | string | IPV4 | Network Protocol, Enum: IPV4, IPV6 |
| host | No | string | -- | Proxies Host |
| port | No | string | -- | Proxies Port |
| proxyUserName | No | string | -- | Proxies Account |
| proxyPassword | No | string | -- | Proxies Password |
| refreshUrl | No | string | -- | Refresh URL |
| checkChannel | No | string | -- | IP Query Channel |


<a id="finger-info">fingerInfo:</a>

| Parameter Name | Required<div style="min-width: 50px"></div> | Parameter Type<div style="min-width: 65px"></div> | Default Value<div style="min-width: 50px"></div> | Description |
| ----------------------- | -------------------------------------- | --------------------------------------- | -------------------------------------- | -------------------------------------------------------------- |
| isLanguageBaseIp | No | boolean | true | Browser Language Type, Follow IP: true, Custom: false, Boolean, Optional, Default true |
| language | No | string | -- | Custom Browser Language Value, str type, Optional, See [Appendix-Language List](#api_language) |
| isDisplayLanguageBaseIp | No | boolean | true | Display Language Type, Follow IP: true, Custom: false, Boolean, Optional, Default true |
| displayLanguage | No | string | -- | Custom Display Language Value, str type, Optional, See [Appendix-Display Language List](#api_dispalylanguage) |
| isTimeZone | No | boolean | true | Time Zone Type, Follow IP: true, Custom: false, Boolean, Optional, Default true |
| timeZone | No | string | -- | Custom Time Zone Value, str type, Optional, See [Appendix-Time Zone List](#api_timezone) |
| position | No | int | 1 | Geolocation Prompt Type, Ask: 0, Allow: 1, Disable: 2 |
| isPositionBaseIp | No | boolean | true | Geolocation Type, Follow IP: true, Custom: false |
| longitude | No | string | -- | Longitude Value, Set when isPositionBaseIp is false |
| latitude | No | string | -- | Latitude Value, Set when isPositionBaseIp is false |
| precisionPos | No | string | -- | Precision Value (meters), Set when isPositionBaseIp is false |
| forbidAudio | No | boolean | true | Disable Web Page Audio, Enable: true, Disable: false |
| forbidImage | No | boolean | true | Disable Web Page Images, Enable: true, Disable: false |
| forbiddenPictureSize | No | number | 0 | When forbidImage is false, setting forbiddenPictureSize = 0 will disable all image loading. |
| forbidMedia | No | boolean | true | Disable Web Page Videos, Enable: true, Disable: false |
| openWidth | No | string | 1000 | Profile Size, Width |
| openHeight | No | string | 1000 | Profile Size, Height |
| openBookmarks | No | boolean | false | Whether to enable bookmarks, true: enable, false: disable
| positionSwitch | No | boolean | true | Window Position Switch, true: Custom, false: Full Screen |
| windowRatioPosition| No | string| 0,0| See [windowRatioPosition](#windowRatioPosition) |
| isDisplayName | No | boolean | false | Show Profile Name in Title Bar, Show: true, Hide: false |
| syncBookmark | No | boolean | false | Sync Bookmarks, true: Yes, false: No |
| syncHistory | No | boolean | false | Sync History, true: Yes, false: No |
| syncTab | No | boolean | true | Sync Tabs, true: Yes, false: No |
| syncCookie | No | boolean | true | Sync Cookies, true: Yes, false: No |
| syncExtensions | No | boolean | false | Sync Extensions Data, true: Yes, false: No |
| syncPassword | No | boolean | true | Sync Saved Passwords, true: Yes, false: No |
| syncIndexedDb | No | boolean | false | Sync IndexedDB, true: Yes, false: No |
| syncLocalStorage | No | boolean | false | Sync Local Storage, true: Yes, false: No |
| clearCacheFile | No | boolean | false | Clear Cache Files on Browser Start, true: Yes, false: No |
| clearCookie | No | boolean | false | Clear Cookies on Browser Start, true: Yes, false: No |
| clearLocalStorage | No | boolean | false | Clear Local Storage on Browser Start, true: Yes, false: No |
| randomFingerprint | No | boolean | false | Randomize Fingerprint on Browser Start, true: Yes, false: No |
| forbidSavePassword | No | boolean | false | Disable Save Password Prompt, true: Yes, false: No |
| stopOpenNet | No | boolean | false | Stop Opening Profile on Network Failure, true: Yes, false: No |
| stopOpenIP | No | boolean | false | Stop Opening Profile on IP Change, true: Yes, false: No |
| stopOpenPosition | No | boolean | false | Stop Opening Profile on Country/Region Change, true: Yes, false: No |
| openWorkbench | No | int | 1 | Whether to open workbench, 1: Enable, 0: Disable, Follow software settings: 2 
| resolutionType | No | boolean | false | Resolution, true: Custom, false: System Default |
| resolutionX | No | string | -- | Custom Resolution Width Value, str type, See [Appendix-Resolution List](#api_relution) |
| resolutionY | No | string | -- | Custom Resolution Height Value, str type, See [Appendix-Resolution List](#api_relution) |
| fontType | No | boolean | false | Font Fingerprint, Random: true, Follow System: false |
| webRTC | No | int | 2 | WebRTC, Replace: 0, Real: 1, Disable: 2 |
| webGL | No | boolean | true | WebGL Image, Random: true, Real: false |
| webGLInfo | No | boolean | true | WebGLInfo Switch, Custom: true, Real: false |
| webGLManufacturer | No | string | -- | Custom WebGL Manufacturer Value when webGLInfo is Custom |
| webGLRender | No | string | -- | Custom WebGL Renderer Value when webGLInfo is Custom |
| webGpu | No | string | webgl | WebGpu, Match WebGL: webgl, Real: real, Disable: block |
| canvas | No | boolean | true | Canvas, Random: true, Real: false |
| audioContext | No | boolean | true | AudioContext Value, Random: true, Real: false |
| speechVoices | No | boolean | true | Speech Voices, Random: true, Real: false |
| doNotTrack | No | boolean | true | Do Not Track, true: Enable, false: Disable |
| clientRects | No | boolean | true | ClientRects, Random: true, Real: false |
| deviceInfo | No | boolean | true | Media Devices, Random: true, Real: false |
| deviceNameSwitch | No | boolean | true | Device Name, Random: true, Real: false |
| macInfo | No | boolean | true | MAC Address, Custom: true, Real: false |
| hardwareConcurrent | No | string | -- | Hardware Concurrency |
| deviceMemory | No | string | -- | Device Memory |
| disableSsl | No | boolean | false | SSL Fingerprint Setting, true: Enable, false: Disable |
| disableSslList | No | List | -- | SSL Feature Value List, List type |
| portScanProtect | No | boolean | true | Port Scan Protection, false: Disable, true: Enable |
| portScanList | No | string | -- | Port Scan Protection Whitelist, Comma-separated |
| useGpu | No | boolean | true | Use GPU Acceleration Mode, true: Yes, false: No |
| sandboxPermission | No | boolean | false | Disable Sandbox, true: Yes, false: No |
| startupParam | No | string | -- | Browser Startup Parameters |
| openBattery | No | boolean | false | Battery API simulation master switch |
| openCharging | No | boolean | false | Simulated charging state when battery simulation is enabled |
| chargingTime | No | string | -- | Seconds until full charge (numeric string, no unit suffix) |
| dischargingTime | No | string | -- | Seconds until empty (numeric string, no unit suffix) |
| level | No | string | -- | Battery level, 0–1 |
| openNetwork | No | boolean | false | Network Information API simulation master switch |
| networkType | No | string | -- | Connection type: wifi, cellular, ethernet, bluetooth, wimax, other, unknown |
| networkSpeed | No | string | -- | Effective type: slow-2G, 2g, 3g, 4g; when `networkType` is cellular, `slow-2G` is normalized to `2G` for the engine nettype |
| downloadSpeed | No | string | -- | Downlink speed (Mbps) |
| maxDownloadSpeed | No | string | -- | Maximum downlink speed (Mbps) |
| latency | No | string / number | -- | Round-trip time (ms) |
| saveFlowMode | No | boolean | false | Save-Data / reduced data mode |
| openBluetooth | No | boolean | false | Bluetooth simulation master switch |
| bluetoothAdapter | No | boolean | false | Simulated Bluetooth adapter present |
| blockDomainList | No | string | -- | Domain blocklist, multiple domains separated by \n |
| allowDomainList | No | string | -- | Domain allowlist, multiple domains separated by \n |

The <a id="windowRatioPosition">windowRatioPosition</a> parameter employs a proportional coordinate system to precisely position windows across single or multiple displays, irrespective of screen resolutions.

<div style="background: var(--vp-code-block-bg); padding: 20px; border-radius: 8px;">
Coordinate System:<br />
Format: (x, y)<br />
- X-axis: 0 to total number of displays (horizontal)<br />
- Y-axis: 0 to total number of displays (vertical)<br />

Single Display Coordinates:

<div style="display: flex; justify-content: center;">
<img src="https://roxy-web.oss-cn-beijing.aliyuncs.com/faq/image/en/windowRatioPosition.png" alt="windowRatioPosition parameter" style="width: 80%; height: auto;" />
</div>

(0, 0) - Top left<br />
(0.5, 0) - Top center<br />
(1, 0) - Top right<br />
(0, 0.5) - Middle left<br />
(0.5, 0.5) - Center<br />
(0, 1) - Bottom left<br />

Multiple Display Coordinates:

For horizontally arranged dual display:<br />
(0, 0) - First display, top left<br />
(1, 0) - The intersection point: first display's top right / second display's top left<br />
(1.5, 0) - Second display, top center<br />
(2, 0) - Second display, top right<br />

For vertically arranged dual display:<br />
(0, 0) - First display, top left<br />
(0, 1) - The intersection point: first display's bottom left / second display's top left<br />
(0, 1.5) - Second display, middle left<br />
(0, 2) - Second display, bottom left
</div>

<p style="font-weight: 600"> <span class="order">2</span> Response Result</p>


```Json
{
    "code": 0,                 // Status Code, 0: Success, 500: Failure, int type
    "msg": "Success",          // Response Message, str type
    "data": {
        "dirId": "05299704c4a89337bd6a37cdb9b95d96"
    }
}
```

| Field Name | Field Type | Description |
| ---- | ------ | ---------------- |
| code | int | Status Code, 0: Success, 500: Failure |
| msg | string | Response Message |


### Modify Browser Profile

<b style="font-size: 18px">POST /browser/mdf</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>


```Json
{
    "workspaceId": 1,                                              // Team ID, int type, Required, Obtained from Team Project API [/browser/workspace]
    "dirId": "dc1e73d4dd954a3a8ca087d53d2e18ce",                   // Browser Profile ID, str type, Required
    "windowName": "Roxytest",                                      // Profile Name, str type, Optional
    "coreVersion": "117",                                          // Core version, enum values such as: 138，137，136 etc., str type, optional
    "os": "Windows",                                               // Operating System, Enum: Windows, macOS, Linux, IOS, Android, str type, Optional, Default Windows
    "osVersion": "11",                                             // Operating system version, enum values for Profile: 11, 10, 8, 7; enum values for Linux: ALL; enum values for macOS: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7; enum values for Android：14、13、12、11、10、9; enum values for IOS：18.2、18.1、18.0、17.0、16.6、16.5、16.4、16.3、16.2、16.1、16.0、15.7、15.6、15.5、15.4、15.3、15.2、15.1、15.0、14.7、14.6、14.5、14.4、14.3、14.2、14.1、14.0; str type 
    "cookie": [],                                                  // Cookies, List type, Optional
    "searchEngine": "Google",                                      // Search engine, enum values: Google, Microsoft Bing, Yahoo, Yandex, DuckDuckGo, str type, optional, default is Google
    "labelIds": [12,13],                                           // Label IDs, List type, Optional, Obtained from Label List API [/browser/label]
    "windowPlatformList": [{
        "id": 0,                                                  // Platform Account ID, int type, optional, obtained through Platform Account list API [/account/list]
        "platformUrl": "https://www.tiktok.com/",                 // Platform Account URL, str type, Optional
        "platformUserName": "Roxytest",                           // Platform Account, str type, Optional
        "platformPassword": "123456",                             // Platform Password, str type, Optional
        "platformEfa": "2F3CD67B6D",                              // efa, str type, Optional
        "platformRemarks": "Roxytest"                             // Platform Remarks, str type, Optional
    }],
    "defaultOpenUrl": ["https://www.facebook.com"],               // Stored Browser Tabs, List type, Optional
    "windowRemark": "Roxytest",                                   // Profile Remarks, str type, Optional
    "projectId": 1,                                               // Project ID, int type, Optional, Obtained from Team Project API [/browser/workspace]
    "proxyInfo": {
        "moduleId": 0,                                            // Proxy ID, int type, 0 means not using, optional, obtained through proxy list API [/proxy/list]
        "proxyMethod": "custom",                                  // Proxy method, enum values: custom (manual), choose (select proxy IP), str type, Optional, Default custom
        "proxyCategory": "noproxy",                               // Proxy Category, Enum: noproxy, HTTP, HTTPS, SOCKS5, str type, Optional, Default noproxy
        "ipType": "IPV4",                                         // Network Protocol, Enum: IPV4, IPV6, str type, Optional, Default IPV4
        "host": "122.11.11.11",                                   // Proxies Host, str type, Optional
        "port": "37746",                                          // Proxies Port, str type, Optional
        "proxyUserName": "roxytest",                              // Proxies Account, str type, Optional
        "proxyPassword": "roxytest",                              // Proxies Password, str type, Optional
        "refreshUrl": "http://refresh-hk.roxybrowser.com",        // Refresh URL, str type, Optional
        "checkChannel": "IPRust.io"                               // IP Query Channel, Enum: IPRust.io, IP-API, IP123.in, str type, Optional
    },
    "fingerInfo": {
        "isLanguageBaseIp": true,                                 // Browser Language Type, Follow IP: true, Custom: false, Boolean,  Optional, Default true
        "language": "en-US",                                      // Custom Browser Language Value, str type, Optional, See Appendix-Language List
        "isDisplayLanguageBaseIp": true,                          // Display Language Type, Follow IP: true, Custom: false, Boolean, Optional, Default true
        "displayLanguage": "en-US",                               // Custom Display Language Value, str type, Optional, See Appendix-Display Language List
        "isTimeZone": true,                                       // Time Zone Type, Follow IP: true, Custom: false, Boolean, Optional, Default true
        "timeZone": "GMT-12:00 Etc/GMT+12",                       // Custom Time Zone Value, str type, Optional, See Appendix-Time Zone List
        "position": 0,                                            // Geolocation Prompt Type, Ask: 0, Allow: 1, Disable: 2, int type, Optional, Default 1
        "isPositionBaseIp": true,                                 // Geolocation Type, Follow IP: true, Custom: false, Boolean, Optional, Default true
        "longitude": "376",                                       // Longitude Value, Set when isPositionBaseIp is false, str type, Optional
        "latitude": "165",                                        // Latitude Value, Set when isPositionBaseIp is false, str type, Optional
        "precisionPos": "600",                                    // Precision Value (meters), Set when isPositionBaseIp is false, str type, Optional
        "forbidAudio": true,                                      // Disable Web Page Audio, Enable: true, Disable: false, Boolean, Optional, Default true
        "forbidImage": true,                                      // Disable Web Page Images, Enable: true, Disable: false, Boolean, Optional, Default true
        "forbiddenPictureSize": 0,                                 // Image loading size threshold. When `forbidImage` is `false`, setting `forbiddenPictureSize = 0` will disable loading of all images. Default: `0`.

        "forbidMedia": true,                                      // Disable Web Page Videos, Enable: true, Disable: false, Boolean, Optional, Default true
        "openWidth": "1000",                                      // Profile Size, Width, str type, Optional, Default 1000
        "openHeight": "1000",                                     // Profile Size, Height, str type, Optional, Default 1000
        "openBookmarks":false,                                    // Whether to enable bookmarks, true: enable, false: disable, Boolean, Optional, Default false
        "positionSwitch":false,                                   // Window Position Switch, true: Custom, false: Full Screen, Boolean, Optional, Default true
        "windowRatioPosition": "",                                // Specifies window position, str type, optional, default 0,0. Using proportional coordinate system in 'x,y' format, with values ranging from 0 to the number of displays. '0,0' represents the top-left corner of the first display; '0.5,0.5' denotes the center of the first display; '1.5,0' indicates the top-center of the second display in horizontal arrangement; '0,1.5' signifies the middle-left of the second display in vertical arrangement.
        "isDisplayName": false,                                   // Show Profile Name in Title Bar, Show: true, Hide: false, Boolean, Optional, Default false
        "syncBookmark": false,                                    // Sync Bookmarks, true: Yes, false: No, Boolean, Optional, Default false
        "syncHistory": false,                                     // Sync History, true: Yes, false: No, Boolean, Optional, Default false
        "syncTab": true,                                          // Sync Tabs, true: Yes, false: No, Boolean, Optional, Default true
        "syncCookie": true,                                       // Sync Cookies, true: Yes, false: No, Boolean, Optional, Default true
        "syncExtensions": false,                                  // Sync Extensions Data, true: Yes, false: No, Boolean, Optional, Default false
        "syncPassword": true,                                     // Sync Saved Passwords, true: Yes, false: No, Boolean, Optional, Default true
        "syncIndexedDb": false,                                   // Sync IndexedDB, true: Yes, false: No, Boolean, Optional, Default false
        "syncLocalStorage": false,                                // Sync Local Storage, true: Yes, false: No, Boolean, Optional, Default false
        "clearCacheFile": true,                                   // Clear Cache Files on Browser Start, true: Yes, false: No, Boolean, Optional, Default false
        "clearCookie": true,                                      // Clear Cookies on Browser Start, true: Yes, false: No, Boolean, Optional, Default false
        "clearLocalStorage": true,                                // Clear Local Storage on Browser Start, true: Yes, false: No, Boolean, Optional, Default false
        "randomFingerprint": true,                                // Randomize Fingerprint on Browser Start, true: Yes, false: No, Boolean, Optional, Default false
        "forbidSavePassword": true,                               // Disable Save Password Prompt, true: Yes, false: No, Boolean, Optional, Default true
        "stopOpenNet": true,                                      // Stop Opening Profile on Network Failure, true: Yes, false: No, Boolean, Optional, Default false
        "stopOpenIP": true,                                       // Stop Opening Profile on IP Change, true: Yes, false: No, Boolean, Optional, Default false
        "stopOpenPosition": true,                                 // Stop Opening Profile on Country/Region Change, true: Yes, false: No, Boolean, Optional, Default false
        "openWorkbench": 1,                                       // Whether to open workbench, Enable: 1, Disable: 0, Follow software settings: 2, int type, optional, default 1
        "resolutionType": true,                                   // Resolution, true: Custom, false: System Default, Boolean, Optional, Default false
        "resolutionX": "",                                        // Custom Resolution Width Value, str type, See Appendix-Resolution List, Optional
        "resolutionY": "",                                        // Custom Resolution Height Value, str type, See Appendix-Resolution List, Optional
        "fontType": false,                                        // Font Fingerprint, Random: true, Follow System: false, Boolean, Optional, Default false
        "webRTC": 0,                                             // WebRTC, Replace: 0, Real: 1, Disable: 2, int type, Optional, Default 2
        "webGL": true,                                           // WebGL Image, Random: true, Real: false, Boolean, Optional, Default true
        "webGLInfo": true,                                       // WebGLInfo Switch, Custom: true, Real: false, Boolean, Optional, Default true
        "webGLManufacturer": "",                                 // Custom WebGL Manufacturer Value when webGLInfo is Custom, str type, Optional
        "webGLRender": "",                                       // Custom WebGL Renderer Value when webGLInfo is Custom, str type, Optional
        "webGpu": "webgl",                                       // WebGpu, Match WebGL: webgl, Real: real, Disable: block, str type, Optional, Default: webgl
        "canvas": true,                                          // Canvas, Random: true, Real: false, Boolean, Optional, Default true
        "audioContext": true,                                    // AudioContext Value, Random: true, Real: false, Boolean, Optional, Default true
        "speechVoices": true,                                    // Speech Voices, Random: true, Real: false, Boolean, Optional, Default true
        "doNotTrack": true,                                      // Do Not Track, true: Enable, false: Disable, Boolean, Optional, Default true
        "clientRects": true,                                     // ClientRects, Random: true, Real: false, Boolean, Optional, Default true
        "deviceInfo": true,                                      // Media Devices, Random: true, Real: false, Boolean, Optional, Default true
        "deviceNameSwitch": true,                                // Device Name, Random: true, Real: false, Boolean, Optional, Default true
        "macInfo": true,                                         // MAC Address, Custom: true, Real: false, Boolean, Optional, Default true
        "hardwareConcurrent": "4",                               // Hardware Concurrency, str type, Optional
        "deviceMemory": "8",                                     // Device Memory, str type, Optional
        "disableSsl": true,                                      // SSL Fingerprint Setting, true: Enable, false: Disable, Boolean, Optional, Default false
        "disableSslList": [],                                    // SSL Feature Value List, List type, Optional
        "portScanProtect": true,                                 // Port Scan Protection, false: Disable, true: Enable, Boolean, Optional, Default true
        "portScanList": "",                                      // Port Scan Protection Whitelist, Comma-separated, str type, Optional
        "useGpu": true,                                          // Use GPU Acceleration Mode, true: Yes, false: No, Boolean, Optional, Default true
        "sandboxPermission": false,                              // Disable Sandbox, true: Enable, false: Disable, Boolean, Optional, Default false
        "startupParam": "",                                      // Browser Startup Parameters, str type, Semicolon-separated, Optional
        "openBattery": false,                                   // Battery API simulation master switch, Boolean, Optional, Default false
        "openCharging": false,                                  // Simulated charging state when battery simulation is enabled, Boolean, Optional, Default false
        "chargingTime": "",                                     // Seconds until full charge (numeric value only, no unit suffix), str, Optional
        "dischargingTime": "",                                  // Seconds until empty (numeric value only, no unit suffix), str, Optional
        "level": "",                                            // Battery level, 0–1, str, Optional
        "openNetwork": false,                                   // Network Information API simulation master switch, Boolean, Optional, Default false
        "networkType": "wifi",                                  // Connection type: wifi, cellular, ethernet, bluetooth, wimax, other, unknown, str, Optional
        "networkSpeed": "4g",                                   // Effective connection type: slow-2G, 2g, 3g, 4g (maps to downlinkMax/effectiveType; if networkType is cellular, slow-2G is normalized to 2G for the underlying nettype), str, Optional
        "downloadSpeed": "",                                    // Downlink speed, Mbps, str, Optional
        "maxDownloadSpeed": "",                                 // Maximum downlink speed, Mbps, str, Optional
        "latency": "",                                          // Round-trip time, ms, str or number, Optional
        "saveFlowMode": false,                                  // Save-Data / reduced data mode, Boolean, Optional, Default false
        "openBluetooth": false,                                 // Bluetooth simulation master switch, Boolean, Optional, Default false
        "bluetoothAdapter": false,                              // Simulated Bluetooth adapter present, Boolean, Optional, Default false
        "blockDomainList": "",                                   // Domain blocklist, multiple domains separated by \n
        "allowDomainList": ""                                    // Domain allowlist, multiple domains separated by \n
    }
    
}       
```



| Parameter Name | Required<div style="min-width: 50px"></div> | Parameter Type<div style="min-width: 65px"></div> | Default Value | Description |
| ------------------ | ---------------------------------------- | --------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dirId | <span class="parameter-require">Yes</span> | string | -- | Browser Profile ID |
| workspaceId | <span class="parameter-require">Yes</span> | int | -- | Team ID |
| windowName | No | string | -- | Profile Name |
| coreVersion | No | string | Latest | Core Version, Enum such as: 138，137，136 etc.|
| os | No | string | Windows | Operating System, Enum: Windows, macOS, Linux, IOS, Android, |
| osVersion | No | string | 11 | Operating system version, enum values for Profiles：11、10、8、7; <br/>enum values for Linux: ALL; <br/>enum values for macOS: 15.3.2,15.3.1,15.3,15.2,15.1,15.0.1,15.0,14.7.4,14.7.3,14.7.2,14.7.1,14.7,14.6.1,14.6,14.5,14.4.1,14.4,14.3.1,14.3,14.2.1,14.2,14.1,13.7.4,13.7.3,13.7.2,13.7.1,13.7; <br/> enum values for Android：14、13、12、11、10、9; <br/> enum values for IOS：18.2、18.1、18.0、17.0、16.6、16.5、16.4、16.3、16.2、16.1、16.0、15.7、15.6、15.5、15.4、15.3、15.2、15.1、15.0、14.7、14.6、14.5、14.4、14.3、14.2、14.1、14.0 |
| cookie | No | List | [] | Cookie |
| searchEngine | No | string | Google | Search engine, enum values: Google, Microsoft Bing, Yahoo, Yandex, DuckDuckGo |
| labelIds | No | List | -- | Tag ID list, obtained through the Tag List interface [/browser/label] |
| defaultOpenUrl | No | List | -- | Stored browser tabs |
| windowRemark | No | string | -- | Profile remark |
| projectId | No | number | -- | Project ID |
| windowPlatformList | No | List | -- | See [windowPlatformList](#window-platform-list)  |
| proxyInfo | No | object | -- | See [proxyInfo](#proxy-info) |
| fingerInfo | No | object | -- | See [fingerInfo](#finger-info) |


<a id="window-platform-list">windowPlatformList:</a>
| Parameter Name | Required | Parameter Type | Default Value | Description |
| --------------- | --- | ------------ | --- | ----------- |
| platformUrl | No | string | -- | Platform Account URL |
| platformUserName | No | string | -- | Platform Account |
| platformPassword | No | string | -- | Platform Password |
| platformEfa | No | string | -- | efa |
| platformRemarks | No | string | -- | Platform Remarks |


<a id="proxy-info">proxyInfo:</a>

| Parameter Name | Required | Parameter Type | Default Value | Description |
| ------------- | --- | ------------ | ------- | ------------------------------------- |
| moduleId | No | int | 0 | Proxy ID, 0 means not using, obtained through proxy list API [/proxy/list] |
| proxyMethod | No | string | custom | Proxy Method, Enum: custom (manual), choose (select proxy IP) |
| proxyCategory | No | string | noproxy | Proxies Category, Enum: noproxy, HTTP, HTTPS, SOCKS5 |
| ipType | No | string | IPV4 | Network Protocol, Enum: IPV4, IPV6 |
| host | No | string | -- | Proxies Host |
| port | No | string | -- | Proxies Port |
| proxyUserName | No | string | -- | Proxies Account |
| proxyPassword | No | string | -- | Proxies Password |
| refreshUrl | No | string | -- | Refresh URL |
| checkChannel | No | string | -- | IP Query Channel |

<a id="finger-info">fingerInfo:</a>

| Parameter Name | Required<div style="min-width: 50px"></div> | Parameter Type<div style="min-width: 65px"></div> | Default Value<div style="min-width: 50px"></div> | Description |
| ----------------------- | -------------------------------------- | --------------------------------------- | -------------------------------------- | -------------------------------------------------------------- |
| isLanguageBaseIp | No | boolean | true | Browser Language Type, Follow IP: true, Custom: false, Boolean, Optional, Default true |
| language | No | string | -- | Custom Browser Language Value, str type, Optional, See [Appendix-Language List](#api_language) |
| isDisplayLanguageBaseIp | No | boolean | true | Display Language Type, Follow IP: true, Custom: false, Boolean, Optional, Default true |
| displayLanguage | No | string | -- | Custom Display Language Value, str type, Optional, See [Appendix-Display Language List](#api_dispalylanguage) |
| isTimeZone | No | boolean | true | Time Zone Type, Follow IP: true, Custom: false, Boolean, Optional, Default true |
| timeZone | No | string | -- | Custom Time Zone Value, str type, Optional, See [Appendix-Time Zone List](#api_timezone) |
| position | No | int | 1 | Geolocation Prompt Type, Ask: 0, Allow: 1, Disable: 2 |
| isPositionBaseIp | No | boolean | true | Geolocation Type, Follow IP: true, Custom: false |
| longitude | No | string | -- | Longitude Value, Set when isPositionBaseIp is false |
| latitude | No | string | -- | Latitude Value, Set when isPositionBaseIp is false |
| precisionPos | No | string | -- | Precision Value (meters), Set when isPositionBaseIp is false |
| forbidAudio | No | boolean | true | Disable Web Page Audio, Enable: true, Disable: false |
| forbidImage | No | boolean | true | Disable Web Page Images, Enable: true, Disable: false |
| forbiddenPictureSize | No | number | 0 | When forbidImage is false, setting forbiddenPictureSize = 0 will disable all image loading. |
| forbidMedia | No | boolean | true | Disable Web Page Videos, Enable: true, Disable: false |
| openWidth | No | string | 1000 | Profile Size, Width |
| openHeight | No | string | 1000 | Profile Size, Height |
| openBookmarks | No | boolean | false | Whether to enable bookmarks, true: enable, false: disable |
| positionSwitch | No | boolean | true | Window Position Switch, true: Custom, false: Full Screen |
| windowRatioPosition | No | string | 0,0 | See [windowRatioPosition](#windowRatioPosition) |
| isDisplayName | No | boolean | false | Show Profile Name in Title Bar, Show: true, Hide: false |
| syncBookmark | No | boolean | false | Sync Bookmarks, true: Yes, false: No |
| syncHistory | No | boolean | false | Sync History, true: Yes, false: No |
| syncTab | No | boolean | true | Sync Tabs, true: Yes, false: No |
| syncCookie | No | boolean | true | Sync Cookies, true: Yes, false: No |
| syncExtensions | No | boolean | false | Sync Extensions Data, true: Yes, false: No |
| syncPassword | No | boolean | true | Sync Saved Passwords, true: Yes, false: No |
| syncIndexedDb | No | boolean | false | Sync IndexedDB, true: Yes, false: No |
| syncLocalStorage | No | boolean | false | Sync Local Storage, true: Yes, false: No |
| clearCacheFile | No | boolean | false | Clear Cache Files on Browser Start, true: Yes, false: No |
| clearCookie | No | boolean | false | Clear Cookies on Browser Start, true: Yes, false: No |
| clearLocalStorage | No | boolean | false | Clear Local Storage on Browser Start, true: Yes, false: No |
| randomFingerprint | No | boolean | false | Randomize Fingerprint on Browser Start, true: Yes, false: No |
| forbidSavePassword | No | boolean | false | Disable Save Password Prompt, true: Yes, false: No |
| stopOpenNet | No | boolean | false | Stop Opening Profile on Network Failure, true: Yes, false: No |
| stopOpenIP | No | boolean | false | Stop Opening Profile on IP Change, true: Yes, false: No |
| stopOpenPosition | No | boolean | false | Stop Opening Profile on Country/Region Change, true: Yes, false: No |
| openWorkbench | No | int | 1 | Whether to open workbench, 1: Enable, 0: Disable, Follow software settings: 2 |
| resolutionType | No | boolean | false | Resolution, true: Custom, false: System Default |
| resolutionX | No | string | -- | Custom Resolution Width Value, str type, See [Appendix-Resolution List](#api_relution) |
| resolutionY | No | string | -- | Custom Resolution Height Value, str type, See [Appendix-Resolution List](#api_relution) |
| fontType | No | boolean | false | Font Fingerprint, Random: true, Follow System: false |
| webRTC | No | int | 2 | WebRTC, Replace: 0, Real: 1, Disable: 2 |
| webGL | No | boolean | true | WebGL Image, Random: true, Real: false |
| webGLInfo | No | boolean | true | WebGLInfo Switch, Custom: true, Real: false |
| webGLManufacturer | No | string | -- | Custom WebGL Manufacturer Value when webGLInfo is Custom |
| webGLRender | No | string | -- | Custom WebGL Renderer Value when webGLInfo is Custom |
| webGpu | No | string | webgl | WebGpu, Match WebGL: webgl, Real: real, Disable: block |
| canvas | No | boolean | true | Canvas, Random: true, Real: false |
| audioContext | No | boolean | true | AudioContext Value, Random: true, Real: false |
| speechVoices | No | boolean | true | Speech Voices, Random: true, Real: false |
| doNotTrack | No | boolean | true | Do Not Track, true: Enable, false: Disable |
| clientRects | No | boolean | true | ClientRects, Random: true, Real: false |
| deviceInfo | No | boolean | true | Media Devices, Random: true, Real: false |
| deviceNameSwitch | No | boolean | true | Device Name, Random: true, Real: false |
| macInfo | No | boolean | true | MAC Address, Custom: true, Real: false |
| hardwareConcurrent | No | string | -- | Hardware Concurrency |
| deviceMemory | No | string | -- | Device Memory |
| disableSsl | No | boolean | false | SSL Fingerprint Setting, true: Enable, false: Disable |
| disableSslList | No | List | -- | SSL Feature Value List, List type |
| portScanProtect | No | boolean | true | Port Scan Protection, false: Disable, true: Enable |
| portScanList | No | string | -- | Port Scan Protection Whitelist, Comma-separated |
| useGpu | No | boolean | true | Use GPU Acceleration Mode, true: Yes, false: No |
| sandboxPermission | No | boolean | false | Disable Sandbox, true: Yes, false: No |
| startupParam | No | string | -- | Browser Startup Parameters |
| openBattery | No | boolean | false | Battery API simulation master switch |
| openCharging | No | boolean | false | Simulated charging state when battery simulation is enabled |
| chargingTime | No | string | -- | Seconds until full charge (numeric string, no unit suffix) |
| dischargingTime | No | string | -- | Seconds until empty (numeric string, no unit suffix) |
| level | No | string | -- | Battery level, 0–1 |
| openNetwork | No | boolean | false | Network Information API simulation master switch |
| networkType | No | string | -- | Connection type: wifi, cellular, ethernet, bluetooth, wimax, other, unknown |
| networkSpeed | No | string | -- | Effective type: slow-2G, 2g, 3g, 4g; when `networkType` is cellular, `slow-2G` is normalized to `2G` for the engine nettype |
| downloadSpeed | No | string | -- | Downlink speed (Mbps) |
| maxDownloadSpeed | No | string | -- | Maximum downlink speed (Mbps) |
| latency | No | string / number | -- | Round-trip time (ms) |
| saveFlowMode | No | boolean | false | Save-Data / reduced data mode |
| openBluetooth | No | boolean | false | Bluetooth simulation master switch |
| bluetoothAdapter | No | boolean | false | Simulated Bluetooth adapter present |
| blockDomainList | No | string | -- | Domain blocklist, multiple domains separated by \n |
| allowDomainList | No | string | -- | Domain allowlist, multiple domains separated by \n |

The <a id="windowRatioPosition">windowRatioPosition</a> parameter employs a proportional coordinate system to precisely position windows across single or multiple displays, irrespective of screen resolutions.

<div style="background: var(--vp-code-block-bg); padding: 20px; border-radius: 8px;">
Coordinate System:<br />
Format: (x, y)<br />
- X-axis: 0 to total number of displays (horizontal)<br />
- Y-axis: 0 to total number of displays (vertical)<br />

Single Display Coordinates:

<div style="display: flex; justify-content: center;">
<img src="https://roxy-web.oss-cn-beijing.aliyuncs.com/faq/image/en/windowRatioPosition.png" alt="windowRatioPosition parameter" style="width: 80%; height: auto;" />
</div>

(0, 0) - Top left<br />
(0.5, 0) - Top center<br />
(1, 0) - Top right<br />
(0, 0.5) - Middle left<br />
(0.5, 0.5) - Center<br />
(0, 1) - Bottom left<br />

Multiple Display Coordinates:

For horizontally arranged dual display:<br />
(0, 0) - First display, top left<br />
(1, 0) - The intersection point: first display's top right / second display's top left<br />
(1.5, 0) - Second display, top center<br />
(2, 0) - Second display, top right<br />

For vertically arranged dual display:<br />
(0, 0) - First display, top left<br />
(0, 1) - The intersection point: first display's bottom left / second display's top left<br />
(0, 1.5) - Second display, middle left<br />
(0, 2) - Second display, bottom left
</div>

<p style="font-weight: 600"> <span class="order">2</span> Response Result</p>

```Json
{
    "code": 0,          // Status Code, 0: Success, 500: Failure, int type
    "msg": "Success",   // Response Message, str type 
    "data": {
        "dirId": "05299704c4a89337bd6a37cdb9b95d96"  // Browser Profile ID
    }
}
```



| Field Name | Field Type | Description |
| ---- | ------ | ---------------- |
| code | int    | Status Code, 0: Success, 500: Failure |
| msg  | string | Response Message |


### Delete Browser Profile

<b style="font-size: 18px">POST /browser/delete</b>




<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>


```Json
{
    "workspaceId": 1,                          // Team ID, int type, Required
    "dirIds": ["dc1ed4d","2e18ce","yy67yegk"],  // Browser Profile ID List, List type, Required
    "isSoftDelete": false  // soft delete
}
```


| Parameter Name | Required | Parameter Type | Default Value | Description |
| --------------- | --- | ------------ | --- | ----------- |
| workspaceId | Yes | int | -- | Team ID |
| dirIds | Yes | List | -- | Browser Profile ID List |


<p style="font-weight: 600"> <span class="order">2</span> Response Result</p>

```Json
{
    "code": 0,         // Status Code, 0: Success, 500: Failure, int type
    "msg": "Success"   // Response Message, str type
}
```

| Field Name | Field Type | Description |
| ---------- | ---------- | ----------- |
| code | int | Status Code, 0: Success, 500: Failure |
| msg | string | Response Message |



### Open Browser Profile{#open-browser}

<b style="font-size: 18px">POST /browser/open</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>



```Json
{   
    "workspaceId": 1,                                                   // Team ID, int type, required, obtained through the Team Project API [/browser/workspace]
    "dirId": "dc1e73d4dd954a3a8ca087d53d2e18ce",                        // Browser Profile ID, str type, required
    "args": ["--remote-allow-origins=*", "--disable-audio-output"],      // Browser startup parameters, List type, optional
    "forceOpen": false,  // Force open?
    "headless": false    // Open in headless mode?
}

Note: The following startup parameters are built-in system parameters and will not take effect when modified:
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
          
For detailed parameter descriptions, please visit: https://peter.sh/experiments/chromium-command-line-switches/
The browser currently does not support headless mode (passing --headless will not take effect)
```



| Parameter Name | Required                                  | Parameter Type | Default Value | Description |
| -------------- | ------------------------------------------ | -------------- | ------------- | ----------- |
| workspaceId    | <span class="parameter-require">Yes</span> | int            | --            | Team ID  |
| dirId          | <span class="parameter-require">Yes</span> | string         | --            | Browser Profile ID |
| args           | No                                         | List           | --            | Browser startup parameters |

<p style="font-weight: 600"> <span class="order">2</span> Response Result</p>



```Json
 {
    "code": 0,                                                                              // Status code, 0: success, 500: failure, int type
    "data": {       
        "ws": "ws://127.0.0.1:52314/devtools/browser/857b2d0d-aae6-4852-ab3c-0784f0b2c1fb", // WebSocket interface for automation tools
        "http": "127.0.0.1:52314",                                                          // HTTP interface for automation tools
        "coreVersion": "112",                                                               // Core version
        "driver": "C:\\Users\\lumibrowser\\AppData\\Roaming\\lumibrowser\\chrome-bin\\125\\chromedriver.exe",  // WebDriver for automation tools
        "sortNum": 3474,                                                                    // Profile sort number
        "windowName": "",                                                                   // Profile name
        "windowRemark": "",                                                                 // Profile remark
        "pid":1111                                                                          // Process ID
    },
    "msg": "Success"                                                                        // Result message, str type
}  
```



| Field Name   | Field Type | Description                                |
| ------------ | ---------- | ------------------------------------------ |
| code         | int        | Status code, 0: success, 500: failure      |
| ws           | string     | WebSocket interface for automation tools   |
| http         | string     | HTTP interface for automation tools        |
| coreVersion  | string     | Core version                               |
| driver       | string     | WebDriver for automation tools             |
| sortNum      | int        | Profile sort number                        |
| windowName   | string     | Profile name                               |
| windowRemark | string     | Profile remark                             |
| pid          | int        | Process ID                                 |
| msg          | string     | Result message                             |


### Close Browser Profile

<b style="font-size: 18px">POST /browser/close</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>



```Json
{
    "dirId": "dc1e73d4dd954a3a8ca087d53d2e18ce"     // Browser Profile ID, str type, required
}
```



| Parameter Name | Required                                  | Parameter Type | Default Value | Description      |
| -------------- | ------------------------------------------ | -------------- | ------------- | ---------------- |
| dirId          | <span class="parameter-require">Yes</span> | string         | --            | Browser Profile ID |

<p style="font-weight: 600"> <span class="order">2</span> Response Result</p>



```Json
{
    "code": 0,             // Status code, 0: success, 500: failure, int type
    "msg": "Success"       // Result message, str type
}
```



| Field Name | Field Type | Description                        |
| ---------- | ---------- | ---------------------------------- |
| code       | int        | Status code, 0: success, 500: failure |
| msg        | string     | Result message                     |


### Randomize Profile Fingerprint

<b style="font-size: 18px">POST /browser/random_env</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>



```Json
{   "workspaceId": 1,                                      // Team ID, int type, required, obtained through the Team Project API [/browser/workspace]
    "dirId": "dc1e73d4dd954a3a8ca087d53d2e18ce"            // Browser Profile ID, str type, required
}
```



| Parameter Name | Required                                   | Parameter Type | Default Value | Description |
| -------------- | ------------------------------------------- | -------------- | ------------- | ----------- |
| workspaceId    | <span class="parameter-require">Yes</span> | int            | --            | Team ID  |
| dirId          | <span class="parameter-require">Yes</span> | string         | --            | Browser Profile ID |

<p style="font-weight: 600"> <span class="order">2</span> Response Result</p>



```Json
{
    "code": 0,         // Status code, 0: success, 500: failure, int type
    "msg": "Success"   // Result message, str type
}   
```



| Field Name | Field Type | Description                        |
| ---------- | ---------- | ---------------------------------- |
| code       | int        | Status code, 0: success, 500: failure |
| msg        | string     | Result message                     |


### Clear Local Cache for Profile

<b style="font-size: 18px">POST /browser/clear_local_cache</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>



```Json
{
    "dirIds": ["dc1ed4d","2e18ce","yy67yegk"],    // Browser Profile ID list, List type, required
    "type": "all",                                // Clear type, str type, optional, default all. partial: clear local cache (keep extensions); all: clear local cache; cloud: clear local and server cache
    "workspaceId": 1                              // Team ID, int type, required when type is cloud, obtained through [/browser/workspace] interface
}
```



| Parameter Name | Required                                  | Parameter Type | Default Value | Description      |
| -------------- | ------------------------------------------ | -------------- | ------------- | ---------------- |
| dirIds         | <span class="parameter-require">Yes</span> | List           | --            | Browser Profile ID list |
| type           | No                                         | string         | all           | Clear type, enum values: partial (clear all local cache files except extension data; login state remains valid; fingerprint and IP are not cleared), all (clear all local cache files; login state remains valid; fingerprint and IP are not cleared), cloud (clear local and server Cookie and all cache; synced tabs and browser login states will all become invalid) |
| workspaceId    | Required when type is cloud                | int            | --            | Team ID     |

<p style="font-weight: 600"> <span class="order">2</span> Response Result</p>



```Json
{
    "code": 0,             // Status code, 0: success, 500: failure, int type
    "msg": "Success"       // Result message, str type
}
```



| Field Name | Field Type | Description                        |
| ---------- | ---------- | ---------------------------------- |
| code       | int        | Status code, 0: success, 500: failure |
| msg        | string     | Result message                     |


### Clear Server Cache for Profile

<b style="font-size: 18px">POST /browser/clear_server_cache</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>



```Json
{   
    "workspaceId": 1,                              // Team ID, int type, required, obtained through the Team Project API [/browser/workspace]
    "dirIds": ["dc1ed4d","2e18ce","yy67yegk"]      // Browser Profile ID list, List type, required
}
```



| Parameter Name | Required                                   | Parameter Type | Default Value | Description      |
| -------------- | ------------------------------------------- | -------------- | ------------- | ---------------- |
| workspaceId    | <span class="parameter-require">Yes</span> | int            | --            | Team ID       |
| dirIds         | <span class="parameter-require">Yes</span> | List           | --            | Browser Profile ID list |

<p style="font-weight: 600"> <span class="order">2</span> Response Result</p>



```Json
{
    "code": 0,         // Status code, 0: success, 500: failure, int type
    "msg": "Success"   // Result message, str type
}   
```



| Field Name | Field Type | Description                        |
| ---------- | ---------- | ---------------------------------- |
| code       | int        | Status code, 0: success, 500: failure |
| msg        | string     | Result message                     |


### Connection Information for Opened Profiles

<b style="font-size: 18px">GET /browser/connection_info</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>



```Json
{   
    "dirIds": "dc1e73d4dd954a,157d4e73ae4f1ac8"                       // List of Browser Profile IDs, str type, multiple IDs separated by commas, optional
}
```



| Parameter Name | Required | Parameter Type | Default Value | Description      |
| -------------- | -------- | -------------- | ------------- | ---------------- |
| dirIds         | No       | string         | --            | List of Browser Profile IDs |

<p style="font-weight: 600"> <span class="order">2</span> Response Result</p>



```Json
{
    "code": 0,                                                                                  // Status code, 0: success, 500: failure, int type
    "data": [
        {       
            "ws": "ws://127.0.0.1:52314/devtools/browser/857b2d0d-aae6-4852-ab3c-0784f0b2c1fb", // WebSocket interface for automation tools
            "http": "127.0.0.1:52314",                                                          // HTTP interface for automation tools
            "coreVersion": "112",                                                               // Core version
            "driver": "C:\\Users\\lumibrowser\\AppData\\Roaming\\lumibrowser\\chrome-bin\\125\\chromedriver.exe",  // WebDriver for automation tools
            "sortNum": 3474,                                                                    // Profile sort number
            "windowName": "",                                                                   // Profile name
            "windowRemark": "",                                                                 // Profile remark
            "pid":1111,                                                                         // Process ID
            "dirId": "doc64hdyy7e"                                                              // Profile ID
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
    "msg": "Success"
}    
```



| Field Name   | Field Type | Description                                |
| ------------ | ---------- | ------------------------------------------ |
| code         | int        | Status code, 0: success, 500: failure      |
| ws           | string     | WebSocket interface for automation tools   |
| http         | string     | HTTP interface for automation tools        |
| coreVersion  | string     | Core version                               |
| driver       | string     | WebDriver for automation tools             |
| sortNum      | int        | Profile sort number                        |
| windowName   | string     | Profile name                               |
| windowRemark | string     | Profile remark                             |
| pid          | int        | Process ID                                 |
| dirId        | string     | Profile ID                                 |


## Proxy API
### Get Detection Channel

 <b style="font-size: 18px">GET /proxy/detect_channel</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>

```Text
None
```

<p style="font-weight: 600"> <span class="order">2</span> Response</p>


```Json
{
    "code": 0,      // Status code, 0: success, 500: failure, int type
    "data":[
        {
            "label": "",    // str type
            "type": "",     // str type
            "value": ""     // str type
        }
    ],
    "msg": "Success"   // Response message, str type
}   
```



| Field Name       | Field Type | Description                       |
| ---------------- | ---------- | --------------------------------- |
| code             | int        | Status code, 0: success, 500: failure |
| label            | string     | Channel label                     |
| type             | string     | Channel type                      |
| value            | string     | Channel value                     |
| msg              | string     | Response message                  |

### Get Proxy List (Deprecated)

<b style="font-size: 18px">GET /proxy/list</b>

::: warning Deprecated
This endpoint is deprecated and will be removed in a future release. Use [`GET /proxy/list_merged`](#get-merged-proxy-list) instead. The merged list returns both user-added proxies and proxy-store purchased proxies in one response.
:::



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>

```Json
{   
    "workspaceId": 1,    // Team ID, int type, required, obtained through team API [/browser/workspace]
    "page_index": 1,     // Page index, int type, optional, default: 1
    "page_size": 15      // Page size, int type, optional, default: 15
}
```

| Parameter Name | Required                                   | Parameter Type | Default | Description  |
| -------------- | ------------------------------------------ | -------------- | ------- | ------------ |
| workspaceId    | <span class="parameter-require">Yes</span> | int            | --      | Team ID |
| page_index     | No                                         | int            | 1       | Page index   |
| page_size      | No                                         | int            | 15      | Page size    |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>

```Json
{
    "code": 0,                                // Status code, 0: success, 500: failure, int type
    "data": {
        "total": 1,                           // Total count
        "rows": [
            {
                "id": 1,                      // Proxy ID, int
                "checkStatus": 0,             // Check status, int
                "checkChannel": "",           // Check channel address, str
                "checkChannelValue": "",      // Check channel value, str
                "lastIp": "",                 // Last IP, str
                "lastCountry": "",            // Last country, str
                "lastState": "",              // Last state, str
                "lastCity": "",               // Last city, str
                "ipType": "",                 // IP type, str
                "protocol": "",               // Protocol, str
                "host": "",                   // Host, str
                "port": "",                   // Port, str
                "proxyPassword": "",          // Proxy password, str
                "proxyUserName": "",          // Proxy username, str
                "refreshUrl": "",             // Refresh URL, str
                "remark": "",                 // Remark, str
                "checkTime": "",              // Check time, str
                "createTime": "",             // Creation time, str
                "updateTime": "",             // Update time, str
            }
        ] 
    },
    "msg": "Success"                          // Response message, str type
} 
```

| Field Name        | Field Type | Description                       |
| ----------------- | ---------- | --------------------------------- |
| code              | int        | Status code, 0: success, 500: failure |
| msg               | string     | Response message                  |
| total             | int        | Total count                       |
| id                | int        | Proxy ID                          |
| checkStatus       | int        | Check status                      |
| checkChannel      | string     | Check channel address             |
| checkChannelValue | string     | Check channel value               |
| lastIp            | string     | Last IP                           |
| lastCountry       | string     | Last country                      |
| lastState         | string     | Last state                        |
| lastCity          | string     | Last city                         |
| ipType            | string     | IP type                           |
| protocol          | string     | Protocol                          |
| host              | string     | Host                              |
| port              | string     | Port                              |
| proxyPassword     | string     | Proxy password                    |
| proxyUserName     | string     | Proxy username                    |
| refreshUrl        | string     | Refresh URL                       |
| remark            | string     | Remark                            |
| checkTime         | string     | Check time                        |
| createTime        | string     | Creation time                     |
| updateTime        | string     | Update time                       |

### Get Merged Proxy List

<b style="font-size: 18px">GET /proxy/list_merged</b>

<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>

```Json
{
    "workspaceId": 1,              // Team ID, int type, required, obtained through team API [/browser/workspace]
    "type": "available_list",      // Query type, str type, optional
    "page_index": 1,               // Page index, int/string type, optional, default: 1
    "page_size": 100,              // Page size, int/string type, optional, default: 15
    "orderName": "lastCountry",    // Sort field, str type, optional
    "orderType": "asc",            // Sort direction, enum values: asc, desc, optional
    "proxyType": "0",              // Proxy source, str type, optional, 0: user-added proxy, 1: proxy-store proxy
    "proxyBindStatus": "1",        // Binding status, str type, optional, empty means all
    "proxyAutoRenew": "1"          // Auto-renew status, str type, optional, empty means all
}
```

| Parameter Name  | Required                                   | Parameter Type | Default | Description  |
| ---------------- | ------------------------------------------ | -------------- | ------- | ------------ |
| workspaceId      | <span class="parameter-require">Yes</span> | int            | --      | Team ID |
| type             | No                                         | string         | --      | Query type, for example: available_list |
| page_index       | No                                         | int/string     | 1       | Page index |
| page_size        | No                                         | int/string     | 15      | Page size |
| orderName        | No                                         | string         | --      | Sort field, for example: lastCountry |
| orderType        | No                                         | string         | --      | Sort direction, asc or desc |
| proxyType        | No                                         | string         | --      | Proxy source, 0: user-added proxy, 1: proxy-store proxy |
| proxyBindStatus  | No                                         | string         | --      | Binding status. Do not pass this field or pass an empty value to query all |
| proxyAutoRenew   | No                                         | string         | --      | Auto-renew status. Do not pass this field or pass an empty value to query all |
| country          | No                                         | string         | --      | Filter by country |
| check_status     | No                                         | int            | --      | Filter by last check status |
| start_date       | No                                         | string         | --      | Filter by detection start date, YYYY-MM-DD |
| end_date         | No                                         | string         | --      | Filter by detection end date, YYYY-MM-DD |
| checker          | No                                         | string         | --      | Filter by detection channel |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>

```Json
{
    "code": 0,
    "data": {
        "total": 1,
        "rows": [
            {
                "id": 395935,                                      // Proxy ID
                "userId": 37245,                                   // User ID
                "workspaceId": 19744,                               // Team ID
                "canBandwidthUpgrade": true,                        // Whether bandwidth can be upgraded
                "proxyProviderId": 1,                               // Proxy provider ID
                "orderNo": "",                                     // Order number
                "orderStatus": 1,                                   // Order status
                "ipType": "IPV4",                                  // IP type
                "host": "gate12.rola.vip",                         // Proxy host
                "protocol": "SOCKS5",                              // Proxy protocol
                "country": "",                                     // Country filter/source value
                "lastIp": "",                                      // Last IP
                "port": "2000",                                    // Proxy port
                "proxyUserName": "QWERFGKL_8998811-country-us",    // Proxy username
                "proxyPassword": "Q1",                             // Proxy password
                "proxyCheckChannel": "http://iprust.io/ip.json",    // Proxy check channel
                "remark": "4561",                                  // Remark
                "lastCountry": "",                                 // Last detected country
                "lastState": "",                                   // Last detected state
                "lastCity": "",                                    // Last detected city
                "checkStatus": 2,                                   // Last check status
                "proxyExpireStatus": 1,                             // Expiration status
                "checkTime": "2026-04-28 15:14:43",                 // Last check time
                "renewalTime": "",                                 // Renewal time
                "createTime": "2026-03-25 12:09:54",                // Creation time
                "proxyMonths": 0,                                   // Proxy months
                "updateTime": "2026-04-28 15:14:48",                // Update time
                "expireDate": "2026-04-28 15:14:48",                // Expiration date
                "replaceStatus": 0,                                 // Replacement status
                "proxyProviderName": "",                           // Proxy provider name
                "proxyType": 0,                                     // Proxy source type
                "providerType": "",                                // Provider type
                "opName": "",                                      // Operator name
                "giftDays": 0,                                      // Gift days
                "autoRenew": 0,                                     // Auto-renew status
                "canRenew": false,                                  // Whether it can be renewed
                "modelParam": "",                                  // Model parameter
                "refreshUrl": "",                                  // Refresh URL
                "isDirect": false,                                  // Whether direct connection is used
                "badgeTypeDesc": "",                               // Badge type description
                "dataType": "proxyModule",                          // Data source, proxyModule: user-added, buyProxy: proxy-store
                "checkChannel": "http://iprust.io/ip.json",         // Check channel address
                "checkChannelValue": "IPRust.io",                   // Check channel label
                "isBind": true,                                     // Whether bound to profiles
                "bindCount": 2,                                     // Bound profile count
                "bindList": [994, 992],                             // Bound profile list
                "canRefund": false,                                 // Whether it can be refunded
                "bandwidthSpeed": 10                                // Bandwidth speed
            }
        ]
    },
    "msg": "success"
}
```

| Field Name          | Field Type | Description |
| ------------------- | ---------- | ----------- |
| code                | int        | Status code, 0: success, 500: failure |
| msg                 | string     | Response message |
| total               | int        | Total count |
| id                  | int        | Proxy ID |
| userId              | int        | User ID |
| workspaceId         | int        | Team ID |
| canBandwidthUpgrade | boolean    | Whether bandwidth can be upgraded |
| proxyProviderId     | int        | Proxy provider ID |
| orderNo             | string     | Order number |
| orderStatus         | int        | Order status |
| ipType              | string     | IP type |
| host                | string     | Proxy host |
| protocol            | string     | Proxy protocol |
| country             | string     | Country filter/source value |
| lastIp              | string     | Last IP |
| port                | string     | Proxy port |
| proxyUserName       | string     | Proxy username |
| proxyPassword       | string     | Proxy password |
| proxyCheckChannel   | string     | Proxy check channel |
| remark              | string     | Remark |
| lastCountry         | string     | Last detected country |
| lastState           | string     | Last detected state |
| lastCity            | string     | Last detected city |
| checkStatus         | int        | Last check status |
| proxyExpireStatus   | int        | Expiration status |
| checkTime           | string     | Last check time |
| renewalTime         | string     | Renewal time |
| createTime          | string     | Creation time |
| proxyMonths         | int        | Proxy months |
| updateTime          | string     | Update time |
| expireDate          | string     | Expiration date |
| replaceStatus       | int        | Replacement status |
| proxyProviderName   | string     | Proxy provider name |
| proxyType           | int        | Proxy source type |
| providerType        | string     | Provider type |
| opName              | string     | Operator name |
| giftDays            | int        | Gift days |
| autoRenew           | int        | Auto-renew status |
| canRenew            | boolean    | Whether it can be renewed |
| modelParam          | string     | Model parameter |
| refreshUrl          | string     | Refresh URL |
| isDirect            | boolean    | Whether direct connection is used |
| badgeTypeDesc       | string     | Badge type description |
| dataType            | string     | Data source, proxyModule: user-added, buyProxy: proxy-store |
| checkChannel        | string     | Check channel address |
| checkChannelValue   | string     | Check channel label |
| isBind              | boolean    | Whether bound to profiles |
| bindCount           | int        | Bound profile count |
| bindList            | List       | Bound profile list |
| canRefund           | boolean    | Whether it can be refunded |
| bandwidthSpeed      | int        | Bandwidth speed |

### Create Proxy

 <b style="font-size: 18px">POST /proxy/create</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>

```Json
{   
    "workspaceId": 1,               // Team ID, int type, required, obtained through team API [/browser/workspace]
    "checkChannel": "",             // Check channel, required, obtained through [/proxy/detect_channel] API
    "ipType": "IPV4",               // Network protocol, IPV4, IPV6, required   
    "protocol": "SOCKS5",           // Proxy protocol, HTTP, HTTPS, SOCKS5, required
    "host": "",                     // Proxy host, str, required
    "port": "",                     // Proxy port, str, required
    "proxyUserName": "",            // Proxy username, str
    "proxyPassword": "",            // Proxy password, str
    "refreshUrl": "",               // Refresh URL, str
    "remark":"",                    // Remark
}
```
| Parameter Name | Required                                   | Parameter Type | Default | Description    |
| -------------- | ------------------------------------------ | -------------- | ------- | -------------- |
| workspaceId    | <span class="parameter-require">Yes</span> | int            | --      | Team ID   |
| checkChannel   | <span class="parameter-require">Yes</span> | string         | --      | Check channel  |
| ipType         | <span class="parameter-require">Yes</span> | string         | --      | Network protocol |
| protocol       | <span class="parameter-require">Yes</span> | string         | --      | Proxy protocol |
| host           | <span class="parameter-require">Yes</span> | string         | --      | Proxy host     |
| port           | <span class="parameter-require">Yes</span> | string         | --      | Proxy port     |
| proxyUserName  | No                                         | string         | --      | Proxy username |
| proxyPassword  | No                                         | string         | --      | Proxy password |
| refreshUrl     | No                                         | string         | --      | Refresh URL    |
| remark         | No                                         | string         | --      | Remark         |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>

```Json
{
    "code": 0,      // Status code, int
    "msg": "Success"    // Response message, str
} 
```
| Field Name | Field Type | Description                       |
| ---------- | ---------- | --------------------------------- |
| code       | int        | Status code, 0: success, 500: failure |
| msg        | string     | Response message                  |


### Batch Create Proxy

 <b style="font-size: 18px">POST /proxy/batch_create</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>

```Json
{
    "workspaceId": 1,                   // Team ID, int type, required, obtained through team API [/browser/workspace]
    "checkChannel": "",                 // Check channel, required, obtained through [/proxy/detect_channel] API
    "proxyList":[
        {   
            "checkChannel": "",             // Check channel, uses outer check channel if not provided
            "ipType": "IPV4",               // Network protocol, IPV4, IPV6, required   
            "protocol": "SOCKS5",           // Proxy protocol, HTTP, HTTPS, SOCKS5, required
            "host": "",                     // Proxy host, str, required
            "port": "",                     // Proxy port, str, required
            "proxyUserName": "",            // Proxy username, str
            "proxyPassword": "",            // Proxy password, str
            "refreshUrl": "",               // Refresh URL, str
            "remark":"",                    // Remark
        }
    ]
}
```
| Parameter Name | Required                                   | Parameter Type | Default | Description    |
| -------------- | ------------------------------------------ | -------------- | ------- | -------------- |
| workspaceId    | <span class="parameter-require">Yes</span> | int            | --      | Team ID   |
| checkChannel   | <span class="parameter-require">Yes</span> | string         | --      | Check channel  |
| proxyList      | <span class="parameter-require">Yes</span> | List           | --      | See [proxyList](#proxy-list) |

<a id="proxy-list">proxyList:</a>

| Parameter Name | Required                                   | Parameter Type | Default | Description    |
| -------------- | ------------------------------------------ | -------------- | ------- | -------------- |
| checkChannel   | <span class="parameter-require">Yes</span> | string         | --      | Check channel  |
| ipType         | <span class="parameter-require">Yes</span> | string         | --      | Network protocol |
| protocol       | <span class="parameter-require">Yes</span> | string         | --      | Proxy protocol |
| host           | <span class="parameter-require">Yes</span> | string         | --      | Proxy host     |
| port           | <span class="parameter-require">Yes</span> | string         | --      | Proxy port     |
| proxyUserName  | No                                         | string         | --      | Proxy username |
| proxyPassword  | No                                         | string         | --      | Proxy password |
| refreshUrl     | No                                         | string         | --      | Refresh URL    |
| remark         | No                                         | string         | --      | Remark         |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>

```Json
{
    "code": 0,      // Status code, int
    "msg": "Success"    // Response message, str
} 
```
| Field Name | Field Type | Description                       |
| ---------- | ---------- | --------------------------------- |
| code       | int        | Status code, 0: success, 500: failure |
| msg        | string     | Response message                  |


### Detect Proxy

 <b style="font-size: 18px">POST /proxy/detect</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>

```Json
{   
    "workspaceId": 1,               // Team ID, int type, required, obtained through team API [/browser/workspace]
    "id": 1,                        // Proxy ID, int type, required
}
```
| Parameter Name | Required                                   | Parameter Type | Default | Description    |
| -------------- | ------------------------------------------ | -------------- | ------- | -------------- |
| workspaceId    | <span class="parameter-require">Yes</span> | int            | --      | Team ID   |
| id             | <span class="parameter-require">Yes</span> | int            | --      | Proxy ID       |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>

```Json
{
    "code": 0,      // Status code, int
    "msg": "Success"    // Response message, str
} 
```
| Field Name | Field Type | Description                       |
| ---------- | ---------- | --------------------------------- |
| code       | int        | Status code, 0: success, 500: failure |
| msg        | string     | Response message                  |



### Modify Proxy

 <b style="font-size: 18px">POST /proxy/modify</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>

```Json
{   
    "workspaceId": 1,               // Team ID, int type, required, obtained through team API [/browser/workspace]
    "id": 1,                        // Proxy ID, int type, required
    "checkChannel": "",             // Check channel, required, obtained through [/proxy/detect_channel] API
    "ipType": "IPV4",               // Network protocol, IPV4, IPV6, required   
    "protocol": "SOCKS5",           // Proxy protocol, HTTP, HTTPS, SOCKS5, required
    "host": "",                     // Proxy host, str, required
    "port": "",                     // Proxy port, str, required
    "proxyUserName": "",            // Proxy username, str
    "proxyPassword": "",            // Proxy password, str
    "refreshUrl": "",               // Refresh URL, str
    "remark":"",                    // Remark
}
```
| Parameter Name | Required                                   | Parameter Type | Default | Description    |
| -------------- | ------------------------------------------ | -------------- | ------- | -------------- |
| workspaceId    | <span class="parameter-require">Yes</span> | int            | --      | Team ID   |
| id             | <span class="parameter-require">Yes</span> | int            | --      | Proxy ID       |
| checkChannel   | <span class="parameter-require">Yes</span> | string         | --      | Check channel  |
| ipType         | <span class="parameter-require">Yes</span> | string         | --      | Network protocol |
| protocol       | <span class="parameter-require">Yes</span> | string         | --      | Proxy protocol |
| host           | <span class="parameter-require">Yes</span> | string         | --      | Proxy host     |
| port           | <span class="parameter-require">Yes</span> | string         | --      | Proxy port     |
| proxyUserName  | No                                         | string         | --      | Proxy username |
| proxyPassword  | No                                         | string         | --      | Proxy password |
| refreshUrl     | No                                         | string         | --      | Refresh URL    |
| remark         | No                                         | string         | --      | Remark         |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>

```Json
{
    "code": 0,      // Status code, int
    "msg": "Success"    // Response message, str
} 
```
| Field Name | Field Type | Description                       |
| ---------- | ---------- | --------------------------------- |
| code       | int        | Status code, 0: success, 500: failure |
| msg        | string     | Response message                  |


### Delete Proxy (Batch Supported)

 <b style="font-size: 18px">POST /proxy/delete</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>

```Json
{   
    "workspaceId": 1,                   // Team ID, int type, required, obtained through team API [/browser/workspace]
    "ids": [],                          // Proxy IDs, List type, required
}
```
| Parameter Name | Required                                   | Parameter Type | Default | Description    |
| -------------- | ------------------------------------------ | -------------- | ------- | -------------- |
| workspaceId    | <span class="parameter-require">Yes</span> | int            | --      | Team ID   |
| ids            | <span class="parameter-require">Yes</span> | List           | --      | Proxy IDs      |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>

```Json
{
    "code": 0,      // Status code, int
    "msg": "Success"    // Response message, str
} 
```
| Field Name | Field Type | Description                       |
| ---------- | ---------- | --------------------------------- |
| code       | int        | Status code, 0: success, 500: failure |
| msg        | string     | Response message                  |

### Get Purchased Proxy IP List (Deprecated)

<b style="font-size: 18px">GET /proxy/bought_list</b>

::: warning Deprecated
This endpoint is deprecated and will be removed in a future release. Use [`GET /proxy/list_merged`](#get-merged-proxy-list) instead. The merged list returns proxy-store purchased proxies together with user-added proxies.
:::



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>

```Json
{   
    "workspaceId": 1,    // Team ID, int type, required, obtained through team API [/browser/workspace]
    "page_index": 1,     // Page index, int type, optional, default: 1
    "page_size": 15,     // Page size, int type, optional, default: 15
    "type": 0            // Query type, int type, optional, default: 0, 0: query all, 1: query available
}
```

| Parameter Name | Required                                   | Parameter Type | Default | Description  |
| -------------- | ------------------------------------------ | -------------- | ------- | ------------ |
| workspaceId    | <span class="parameter-require">Yes</span> | int            | --      | Team ID, obtained through team API [/browser/workspace] |
| page_index     | No                                         | int            | 1       | Page index   |
| page_size      | No                                         | int            | 15      | Page size    |
| type           | No                                         | int            | 0       | Query type, 0: query all, 1: query available |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>

```Json
{
    "code": 0,                                // Status code, 0: success, 500: failure, int type
    "data": {
        "total": 1,                           // Total count
        "rows": [
            {
                "id": 1,                      // Purchased proxy IP ID
                "orderNo": "",                // Order number
                "checkStatus": 1,             // Check status
                "proxyCheckChannel": "",      // Check channel address
                "checkChannelValue": "",      // Check channel value
                "lastIp": "",                 // Last IP
                "lastCountry": "",            // Last country
                "lastState": "",              // Last state
                "lastCity": "",               // Last city
                "proxyProviderName": "",      // Proxy provider name
                "providerType": "",           // Proxy provider type
                "ipType": "",                 // IP type
                "protocol": "",               // Protocol
                "host": "",                   // Host
                "port": "",                   // Port
                "proxyUserName": "",          // Proxy username
                "proxyPassword": "",          // Proxy password
                "remark": "",                 // Remark
                "checkTime": "",              // Check time
                "createTime": "",             // Creation time
                "updateTime": "",             // Update time
                "expireDate": "",             // Expiration date
            }
        ] 
    },
    "msg": "Success"                          // Response message, str type
} 
```

| Field Name        | Field Type | Description                       |
| ----------------- | ---------- | --------------------------------- |
| code              | int        | Status code, 0: success, 500: failure |
| msg               | string     | Response message                  |
| total             | int        | Total count                       |
| id                | int        | Purchased proxy IP ID             |
| orderNo           | string     | Order number                      |
| checkStatus       | int        | Check status                      |
| proxyCheckChannel | string     | Check channel address             |
| checkChannelValue | string     | Check channel value               |
| lastIp            | string     | Last IP                           |
| lastCountry       | string     | Last country                      |
| lastState         | string     | Last state                        |
| lastCity          | string     | Last city                         |
| proxyProviderName | string     | Proxy provider name               |
| providerType      | string     | Proxy provider type               |
| ipType            | string     | IP type                           |
| protocol          | string     | Protocol                          |
| host              | string     | Host                              |
| port              | string     | Port                              |
| proxyUserName     | string     | Proxy username                    |
| proxyPassword     | string     | Proxy password                    |
| remark            | string     | Remark                            |
| checkTime         | string     | Check time                        |
| createTime        | string     | Creation time                     |
| updateTime        | string     | Update time                       |
| expireDate        | string     | Expiration date                   |

## Platform Account API
### Get Platform Account List

 <b style="font-size: 18px">GET /account/list</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>



```Json
{   
    "workspaceId": 1,       // Team ID, int type, required, obtained through team API [/browser/workspace]
    "page_index": 1,        // Page index, int type, optional, default: 1
    "page_size": 15         // Page size, int type, optional, default: 15
}
```



| Parameter Name | Required                                   | Parameter Type | Default | Description  |
| -------------- | ------------------------------------------ | -------------- | ------- | ------------ |
| workspaceId    | <span class="parameter-require">Yes</span> | int            | --      | Team ID |
| page_index     | No                                         | int            | 1       | Page index   |
| page_size      | No                                         | int            | 15      | Page size    |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>

```Json
{
    "code": 0,                                                                  // Status code, 0: success, 500: failure, int type
    "data": {
        "total": 1,                                                             // Total count
        "rows": [
            {
                "id": 3,                                                        // Account ID
                "platformUrl": "https://www.tiktok.com/",                       // Platform URL
                "platformUserName": "Roxytest",                                 // Platform username
                "platformPassword": "123456",                                   // Platform password
                "platformEfa": "2F3CD67B6D",                                    // Platform EFA
                "platformCookies": [{"name": "1","value": "2","domain": "3"}],  // Platform cookies
                "platformRemarks": "Roxytest",                                  // Platform remarks
                "createTime": "2024-10-23 15:45:46",                            // Creation time
                "updateTime": "2024-10-23 15:45:46"                             // Update time
            }
        ] 
    },
    "msg": "Success"                                                            // Response message, str type
} 
```



| Field Name       | Field Type | Description                       |
| ---------------- | ---------- | --------------------------------- |
| code             | int        | Status code, 0: success, 500: failure |
| msg              | string     | Response message                  |
| total            | int        | Total count                       |
| id               | int        | Account ID                        |
| platformUrl      | string     | Platform URL                      |
| platformUserName | string     | Platform username                 |
| platformPassword | string     | Platform password                 |
| platformEfa      | string     | Platform EFA                      |
| platformCookies  | object     | Platform cookies                  |
| platformRemarks  | string     | Platform remarks                  |
| createTime       | string     | Creation time                     |
| updateTime       | string     | Update time                       |

### Create Platform Account

 <b style="font-size: 18px">POST /account/create</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>

```Json
{   
    "workspaceId": 1,                   // Team ID, int type, required, obtained through team API [/browser/workspace]
    "platformUrl":"https://www.x.com/", // Platform URL, str type, required
    "platformUserName":"",              // Platform account, str type
    "platformPassword":"",              // Platform password, str type
    "platformEfa":"",                   // 2FA key, str type
    "platformRemarks":""                // Remarks, str type
}
```
| Parameter Name   | Required                                   | Parameter Type | Default | Description    |
| ---------------- | ------------------------------------------ | -------------- | ------- | -------------- |
| workspaceId      | <span class="parameter-require">Yes</span> | int            | --      | Team ID   |
| platformUrl      | <span class="parameter-require">Yes</span> | string         | --      | Platform URL   |
| platformUserName | No                                         | string         | --      | Platform account |
| platformPassword | No                                         | string         | --      | Platform password |
| platformEfa      | No                                         | string         | --      | 2FA            |
| platformRemarks  | No                                         | string         | --      | Remarks        |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>

```Json
{
    "code": 0,      // Status code, int
    "data":{
        "platform_id":0 // Platform ID
    },
    "msg": "Success"    // Response message, str
} 
```
| Field Name  | Field Type | Description                       |
| ----------- | ---------- | --------------------------------- |
| code        | int        | Status code, 0: success, 500: failure |
| platform_id | int        | Platform account ID               |
| msg         | string     | Response message                  |


### Batch Create Platform Account

 <b style="font-size: 18px">POST /account/batch_create</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>

```Json
{
    "workspaceId": 1,                   // Team ID, int type, required, obtained through team API [/browser/workspace]
    "accountList":[
        {   
            "platformUrl":"https://www.x.com/", // Platform URL, str type, required
            "platformUserName":"",              // Platform account, str type
            "platformPassword":"",              // Platform password, str type
            "platformEfa":"",                   // 2FA key, str type
            "platformRemarks":""                // Remarks, str type
        }
    ]
}
```
| Parameter Name | Required                                   | Parameter Type | Default | Description    |
| -------------- | ------------------------------------------ | -------------- | ------- | -------------- |
| workspaceId    | <span class="parameter-require">Yes</span> | int            | --      | Team ID   |
| accountList    | <span class="parameter-require">Yes</span> | List           | --      | See [accountList](#account-list) |

<a id="account-list">accountList:</a>

| Parameter Name   | Required                                   | Parameter Type | Default | Description    |
| ---------------- | ------------------------------------------ | -------------- | ------- | -------------- |
| platformUrl      | <span class="parameter-require">Yes</span> | string         | --      | Platform URL   |
| platformUserName | No                                         | string         | --      | Platform account |
| platformPassword | No                                         | string         | --      | Platform password |
| platformEfa      | No                                         | string         | --      | 2FA            |
| platformRemarks  | No                                         | string         | --      | Remarks        |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>

```Json
{
    "code": 0,      // Status code, int
    "msg": "Success"    // Response message, str
} 
```
| Field Name | Field Type | Description                       |
| ---------- | ---------- | --------------------------------- |
| code       | int        | Status code, 0: success, 500: failure |
| msg        | string     | Response message                  |


### Modify Platform Account

 <b style="font-size: 18px">POST /account/modify</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>

```Json
{   
    "workspaceId": 1,                   // Team ID, int type, required, obtained through team API [/browser/workspace]
    "id": 1,                            // Platform account ID, int type, required
    "platformUrl":"https://www.x.com/", // Platform URL, str type, required
    "platformUserName":"",              // Platform account, str type
    "platformPassword":"",              // Platform password, str type
    "platformEfa":"",                   // 2FA key, str type
    "platformRemarks":""                // Remarks, str type
}
```
| Parameter Name   | Required                                   | Parameter Type | Default | Description         |
| ---------------- | ------------------------------------------ | -------------- | ------- | ------------------- |
| workspaceId      | <span class="parameter-require">Yes</span> | int            | --      | Team ID        |
| id               | <span class="parameter-require">Yes</span> | int            | --      | Platform account ID |
| platformUrl      | <span class="parameter-require">Yes</span> | string         | --      | Platform URL        |
| platformUserName | No                                         | string         | --      | Platform account    |
| platformPassword | No                                         | string         | --      | Platform password   |
| platformEfa      | No                                         | string         | --      | 2FA                 |
| platformRemarks  | No                                         | string         | --      | Remarks             |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>

```Json
{
    "code": 0,      // Status code, int
    "msg": "Success"    // Response message, str
} 
```
| Field Name | Field Type | Description                       |
| ---------- | ---------- | --------------------------------- |
| code       | int        | Status code, 0: success, 500: failure |
| msg        | string     | Response message                  |


### Delete Platform Account (Batch Supported)

 <b style="font-size: 18px">POST /account/delete</b>



<p style="font-weight: 600"> <span class="order">1</span> Request Parameters</p>

```Json
{   
    "workspaceId": 1,                   // Team ID, int type, required, obtained through team API [/browser/workspace]
    "ids": [],                          // Platform account IDs, List type, required
}
```
| Parameter Name | Required                                   | Parameter Type | Default | Description         |
| -------------- | ------------------------------------------ | -------------- | ------- | ------------------- |
| workspaceId    | <span class="parameter-require">Yes</span> | int            | --      | Team ID        |
| ids            | <span class="parameter-require">Yes</span> | List           | --      | Platform account IDs |

<p style="font-weight: 600"> <span class="order">2</span> Response</p>

```Json
{
    "code": 0,      // Status code, int
    "msg": "Success"    // Response message, str
} 
```
| Field Name | Field Type | Description                       |
| ---------- | ---------- | --------------------------------- |
| code       | int        | Status code, 0: success, 500: failure |
| msg        | string     | Response message                  |


## API Integration Code Examples
### Python Code Example{#python-example}

#### 1. API Call Example

```Python
import requests
import json
import time

class RoxyClient:
    '''
    :param port: API service port number
    :param token: API service token
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
    Health check, used to check if the API service is running normally
    '''
    def health(self):
        return self._get("/health").json()
    
    '''
    Get the list of teams and projects, used to get the list of owned teams and projects
    :param page_index,page_size Pagination parameters
    '''
    def workspace_project(self):
        return self._get("/browser/workspace").json()

    '''
    Get the Account list, used to get the configured platform Accounts
    :param workspaceId: The ID of the team, required. Specify which team's platform accounts to get, obtained through the workspace_project method
    :param accountId: Account library ID, optional
    :param page_index,page_size Pagination parameters
    '''
    def account(self,workspaceId:int,accountId:int = 0,page_index:int = 1,page_size:int = 15):
        return self._get("/browser/account",{"workspaceId":workspaceId,"accountId":accountId,"page_index":page_index,"page_size":page_size}).json()
    '''
    Get the label list, used to get the configured label information
    :param workspaceId: The ID of the team, required. Specify which team's labels to get, obtained through the workspace_project method
    '''
    def label(self,workspaceId:int):
        return self._get("/browser/label",{"workspaceId":workspaceId}).json()
    '''
    Get the Profile list
    :param workspaceId: The ID of the team, required. Specify which team's profile list to get, obtained through the workspace_project method
    :param dirId: Profile ID, optional; if provided, only information for this Profile will be queried
    :param page_index,page_size Pagination parameters
    :res Refer to the documentation for the return value
    '''
    def browser_list(self,workspaceId:int,sortNums:str = "",page_index:int = 1,page_size:int = 15):
        return self._get("/browser/list_v3",{"workspaceId":workspaceId,"sortNums":sortNums,"page_index":page_index,"page_size":page_size}).json()
    
    '''
    Get browser profile details
    :param workspaceId: The ID of the team, required. Specify which team's profile details to get, obtained through the workspace_project method
    :param dirId: The ID of the profile, required. Specify the profile to get details for
    :res Refer to the documentation for the return value
    '''
    def browser_detail(self, workspaceId: int, dirId: str):
        return self._get("/browser/detail", {"workspaceId": workspaceId, "dirId": dirId}).json()

    '''
    Create a Profile
    :param data: Create Profile parameters, see documentation for details
    :res Refer to the documentation for the return value
    '''
    def browser_create(self,data:dict = None):
        return self._post("/browser/create",data).json()
    
    '''
    Modify a Profile
    :param data: Modify Profile parameters, see documentation for details
    :res Refer to the documentation for the return value
    '''
    def browser_mdf(self,data:dict):
        return self._post("/browser/mdf",data).json()

    '''
    Delete Profiles
    :param workspaceId: The ID of the team, required. Specify the team where the profiles are located, obtained through the workspace_project method
    :param dirIds: List of Profile IDs to delete, required
    '''
    def browser_delete(self, workspaceId:int, dirIds:list):
        return self._post("/browser/delete", {"workspaceId": workspaceId, "dirIds": dirIds}).json()
    
    
    '''
    Open a profile
    :param dirId: The ID of the profile to open, required
    :param args: Specify browser startup arguments, optional
    :res Refer to the documentation for the return value
    '''
    def browser_open(self,dirId:str,args=[]):
        return self._post("/browser/open",{"dirId":dirId,"args": args}).json()
        
    '''
    Close a profile
    :param dirId: The ID of the profile to close, required
    :res Refer to the documentation for the return value
    '''
    def browser_close(self,dirId:str):
        return self._post("/browser/close",{"dirId":dirId}).json()

    '''
    Randomize profile fingerprint
    :param workspaceId: The ID of the team, required. Specify the team where the profile is located, obtained through the workspace_project method
    :param dirId: The ID of the profile, required. Specify the profile to randomize the fingerprint
    :res Refer to the documentation for the return value
    '''
    def browser_random_env(self,workspaceId:int,dirId:str):
        return self._post("/browser/random_env",{"workspaceId": workspaceId,"dirId":dirId}).json()
    
    '''
    Clear local cache of a profile
    :param dirIds: A list of profile IDs, required. Specify the profiles to clear the local cache
    :param type: Clear type, optional, default all. partial: clear local cache (keep extensions); all: clear local cache; cloud: clear local and server cache
    :param workspaceId: Team ID, required when type is cloud, obtained through the workspace_project method
    :res Refer to the documentation for the return value
    '''
    def browser_local_cache(self,dirIds:list,type:str="all",workspaceId:int=None):
        data = {"dirIds":dirIds,"type":type}
        if workspaceId is not None:
            data["workspaceId"] = workspaceId
        return self._post("/browser/clear_local_cache",data).json()
    
    '''
    Clear server cache of a profile
    :param workspaceId: The ID of the team, required. Specify the team where the profile is located, obtained through the workspace_project method
    :param dirIds: A list of profile IDs, required. Specify the profiles to clear the server cache
    :res Refer to the documentation for the return value
    '''
    def browser_server_cache(self,workspaceId:int,dirIds:list):
        return self._post("/browser/clear_server_cache",{"workspaceId": workspaceId,"dirIds":dirIds}).json()
    
    '''
    Get information about open profiles
    :param dirIds: The IDs of the profiles to query, optional
    :res Refer to the documentation for the return value
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
        "windowName":"Randomize fingerprint on launch",
        "coreVersion":"117",
        "os":"Windows",
        "osVersion": "11",
        "windowRemark":"Remark",
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
            "randomFingerprint":True,
            "portScanProtect":False
        }
    }
    print(client.browser_create(data))
    
    data = {
        "workspaceId": 10,
        "dirId":"ac4bd731074a6ef3bbe1e8f4f6667749",
        "windowName":"Modify profile",
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

#### 2、Selenium automation example

```Python
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.chrome.service import Service
import RoxyClient

if __name__ == "__main__":
    browser_id = "8ba009cbbedf192f34817574c81c9454"
    # Initialize the client
    client = RoxyClient(port=50000,token="d1f491a404druyt54880943e5c3cd9ca25")
    # Open the profile
    rsp = client.browser_open(browser_id)
    if rsp.get("code") != 0:
        print("Failed to open profile:",rsp)
        exit(0)
    # Get the connection information for Selenium
    debuggerAddress = rsp.get("data").get("http")
    driverPath = rsp.get("data").get("driver")
    print(f"Profile opened successfully, debuggerAddress:{debuggerAddress}, driverPath:{driverPath}")

    # Selenium connection code
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_experimental_option("debuggerAddress", debuggerAddress)

    chrome_service = Service(driverPath)
    driver = webdriver.Chrome(service=chrome_service, options=chrome_options)

    driver.get('https://ip123.in/')
    print(driver.title)

    #client.browser_close(browser_id)
```


### Node.js code example{#node-example}

#### 1、API list: roxy_api.js

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
    Health check, used to check if the API service is running normally
    */
    health() {
        return this._get("/health")
    }
    
    /*
    Get a list of teams and projects, used to get a list of owned teams and projects
    :param page_index,page_size Pagination parameters
    */
    workspace_project(self) {
        return this._get("/browser/workspace")
    }
    
    /*
    Get a list of accounts, used to get configured platform accounts
    :param workspaceId: The ID of the team, required. Specify which team's platform accounts to get, obtained through the workspace_project method
    :param accountId: The ID of the account, optional
    :param page_index,page_size Pagination parameters
    */
    account(self,workspaceId,accountId = 0,page_index = 1,page_size = 15) {
        return self._get("/browser/account",{"workspaceId":workspaceId,"accountId":accountId,"page_index":page_index,"page_size":page_size})
    }
    /*
    Get a list of labels, used to get configured label information
    :param workspaceId: The ID of the team, required. Specify which team's labels to get, obtained through the workspace_project method
    */
    label(self,workspaceId) {
        return self._get("/browser/label",{"workspaceId":workspaceId})
    }
    /*
    Get a list of profiles
    :param workspaceId: The ID of the team, required. Specify which team's profile list to get, obtained through the workspace_project method
    :param dirId: The ID of the profile, optional. If provided, only information about this profile will be queried
    :param page_index,page_size Pagination parameters
    :res Refer to the documentation for the return value
    */
    browser_list(workspaceId,sortNums = "",page_index = 1,page_size = 15) {
        return this._get("/browser/list_v3",{"workspaceId":workspaceId,"sortNums":sortNums,"page_index":page_index,"page_size":page_size})
    }
    /*
    Get browser profile details
    :param workspaceId: The ID of the team, required. Specify which team's profile details to get, obtained through the workspace_project method
    :param dirId: The ID of the profile, required. Specify the profile to get details for
    :res Refer to the documentation for the return value
    */
    browser_detail(workspaceId, dirId) {
        return this._get("/browser/detail", {"workspaceId": workspaceId, "dirId": dirId})
    }

    /*
    Create a profile
    :param data: The parameters required to create a profile, refer to the documentation. The workspaceId is required and can be obtained through the workspace_project method
    :res Refer to the documentation for the return value
    */
    browser_create(data = {}) {
        return this._post("/browser/create",data)
    }

    /*
    Modify a profile
    :param data: The parameters required to modify a profile, refer to the documentation. The workspaceId and dirId are required, with workspaceId obtained through the workspace_project method
    :res Refer to the documentation for the return value
    */
    browser_mdf(data = {}) {
        return this._post("/browser/mdf",data)
    }

    /*
    Delete a profile
    :param workspaceId: The ID of the team, required. Specify the team where the profile is located, obtained through the workspace_project method
    :param dirIds: A list of profile IDs, required. Specify the profiles to delete
    :res Refer to the documentation for the return value
    */
    browser_delete(workspaceId,dirid) {
        return this._post("/browser/delete",{"workspaceId":workspaceId,"dirIds":[dirid]})
    }

    /*
    Open a profile
    :param dirId: The ID of the profile to open, required
    :param args: Specify browser startup arguments, optional
    :res Refer to the documentation for the return value
    */
    browser_open(dirId,args=[]) {
        return this._post("/browser/open",{"dirId":dirId,"args": args})
    }

    /*
    Close a profile
    :param dirId: The ID of the profile to close, required
    :res Refer to the documentation for the return value
    */
    browser_close(dirId) {
        return this._post("/browser/close",{"dirId":dirId})
    }

    /*
    Clear local cache of a profile
    :param dirIds: A list of profile IDs, required. Specify the profiles to clear the local cache
    :param type: Clear type, optional, default all. partial: clear local cache (keep extensions); all: clear local cache; cloud: clear local and server cache
    :param workspaceId: Team ID, required when type is cloud, obtained through the workspace_project method
    :res Refer to the documentation for the return value
    */
    browser_clear_local_cache(dirIds, type = 'all', workspaceId = null) {
        const data = {"dirIds": dirIds, "type": type}
        if (workspaceId !== null) {
            data.workspaceId = workspaceId
        }
        return this._post("/browser/clear_local_cache", data)
    }
    
    /*
    Clear server cache of a profile
    :param workspaceId: The ID of the team, required. Specify the team where the profile is located, obtained through the workspace_project method
    :param dirIds: A list of profile IDs, required. Specify the profiles to clear the server cache
    :res Refer to the documentation for the return value
    */
    browser_clear_server_cache(workspaceId,dirid) {
        return this._post("/browser/clear_server_cache",{"workspaceId": workspaceId,"dirIds":[dirid]})
    }

    /*
    Randomize profile fingerprint
    :param workspaceId: The ID of the team, required. Specify the team where the profile is located, obtained through the workspace_project method
    :param dirId: The ID of the profile, required. Specify the profile to randomize the fingerprint
    :res Refer to the documentation for the return value
    */
    browser_random_env(workspaceId,dirid) {
        return this._post("/browser/random_env",{"workspaceId": workspaceId,"dirId":dirid})
    }
    
    /*
    Get information about open profiles
    :param dirIds: The IDs of the profiles to query, optional
    :res Refer to the documentation for the return value
    */
    browser_connection_info() {
        return this._get("/browser/connection_info")
    }

}

module.exports = {
    RoxyClient,
};
```



#### 2、Main Program Entry

```JavaScript
const {RoxyClient} = require("./roxy_api");
const puppeteer = require("puppeteer-core"); 
const api_token = "9976uu37d2df8bdde7bcbd872396142";
const roxy_client = new RoxyClient(50000, api_token);

const operate_window = async() => {

    // Health Check
    let health_rsp = await roxy_client.health();
    console.log(`browser_health----rsp:${JSON.stringify(health_rsp)}}`);

    // Create Profile
    let create_rsp = await roxy_client.browser_create();
    console.log(`browser_create----rsp:${JSON.stringify(create_rsp)}}`);
    
    // Get Profile List
    let browser_id = create_rsp["data"]["dirId"];
    let browsers_rsp = await roxy_client.browser_list(browser_id);
    console.log(`browser_list----rsp:${JSON.stringify(browsers_rsp)}}`);
    
    // Modify Profile
    let proxyInfo = {
        "proxyMethod":"custom",
        "proxyCategory":"noproxy"
    };
    let fingerInfo = {
        "clearCacheFile":true,
        "clearCookie":true,
        "clearHistory":true,
        "randomFingerprint":true,
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
        // Open Profile
        const rsp = await roxy_client.browser_open(browser_id);
        if (rsp["code"] != 0) {
            console.log(`${browser_id} browser_open err:${JSON.stringify(rsp)}`)
            if (rsp["msg"] == "Profile is already open") {
                let close_rsp = await roxy_client.browser_close(browser_id);
                console.log(`${browser_id} browser_close rsp:${JSON.stringify(close_rsp)}`);
            }
        }
        console.log(`${browser_id} browser_open success----ws:${rsp["data"]["ws"]}`);
        const browser = await puppeteer.connect({
            browserWSEndpoint:rsp["data"]["ws"],
            defaultViewport: null,
        });
        
        // Start Business
        let newPage = await browser.newPage();
        try {
            await newPage.goto("https://ip123.in/");
        } catch(err) {
            console.log(`${browser_id} open url err:${err}`);
        }

        // Open Profile Process Information
        let conn_info_rsp = await roxy_client.browser_connection_info();
        console.log(`browser_connection_info----rsp:${JSON.stringify(conn_info_rsp)}}`);
        
        // Close Profile
        // let close_rsp = await roxy_client.browser_close(browser_id);
        // console.log(`${browser_id} browser_close----rsp:${JSON.stringify(close_rsp)}`);

        // Clear Local Cache
        // let clear_local_rsp = await roxy_client.browser_clear_local_cache(browser_id);
        // console.log(`browser_clear_local_cache----rsp:${JSON.stringify(clear_local_rsp)}}`);

        // Clear Server Cache
        // let clear_server_rsp = await roxy_client.browser_clear_server_cache(browser_id);
        // console.log(`browser_clear_server_cache----rsp:${JSON.stringify(clear_server_rsp)}}`);

        // Reset Profile Fingerprint
        // let random_env_rsp = await roxy_client.browser_random_env(browser_id);
        // console.log(`browser_random_env----rsp:${JSON.stringify(random_env_rsp)}}`);

        // Delete Profile
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


## Appendix
### Appendix-Resolution List {#api_relution}

#####  Format: Width x Height

<br>

##### Mobile：

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

##### Desktop：

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

### Appendix-Language List {#api_language}

```Text
sq-AL    Albanian - shqip
ak    Akan - Akan
ar    Arabic - العربية
an    Aragonese - aragonés
am    Amharic - አማርኛ
as    Assamese - অসমীয়া
az-Cyrl-AZ    Azerbaijani - azərbaycan
ast    Asturian - asturianu
ee    Ewe - Eʋegbe
ay    Aymara - Aymar
ga    Irish - Gaeilge
et-EE    Estonian - eesti
oc    Occitan - occitan
or    Oriya - ଓଡ଼ିଆ
om    Oromo - Oromoo
eu    Basque - euskara
be-BY    Belarusian - беларуская
bm    Bambara - bamanakan
bg-BG    Bulgarian - български
nso    Northern Sotho - Northern Sotho
is-IS    Icelandic - íslenska
pl-PL    Polish - polski
bs    Bosnian - bosanski
fa    Persian - فارسی
bho    Bhojpuri - भोजपुरी
br    Breton - brezhoneg
tn    Tswana - Tswana
ts    Tsonga - Xitsonga
tt    Tatar - татар
da-DK    Danish - dansk
de    German - Deutsch
de-AT    German (Austria) - Deutsch (Österreich)
de-DE    German (Germany) - Deutsch (Deutschland)
de-LI    German (Liechtenstein) - Deutsch (Liechtenstein)
de-CH    German (Switzerland) - Deutsch (Schweiz)
dv    Divehi - ދިވެހި
doi    Dogri - डोगरी
ru    Russian - русский
fo    Faroese - føroyskt
fr    French - français
fr-FR    French (France) - français (France)
fr-CA    French (Canada) - français (Canada)
fr-CH    French (Switzerland) - français (Suisse)
sa    Sanskrit - संस्कृत भाषा
fil-PH    Filipino - Filipino
fi-FI    Finnish - suomi
km    Khmer - ខ្មែរ
ka-GE    Georgian - ქართული
gu    Gujarati - ગુજરાતી
gn    Guarani - Guarani
ia    Interlingua - interlingua
kk    Kazakh - қазақ тілі
ht    Haitian Creole - créole haïtien
ko    Korean - 한국어
ha    Hausa - Hausa
nl-NL    Dutch - Nederlands
gl    Galician - galego
ca    Catalan - català
cs-CZ    Czech - čeština
kn    Kannada - ಕನ್ನಡ
ky    Kyrgyz - кыргызча
xh    Xhosa - IsiXhosa
co    Corsican - Corsican
hr-HR    Croatian - hrvatski
qu    Quechua - Runasimi
kok    Konkani - कोंकणी
ku    Kurdish - Kurdî
la    Latin - Latin
lv-LV    Latvian - latviešu
lo-LA    Lao - ລາວ
lt-LT    Lithuanian - lietuvių
ln    Lingala - lingála
lg    Ganda - Luganda
lb    Luxembourgish - Lëtzebuergesch
rw-RW    Kinyarwanda - Kinyarwanda
ro-RO    Romanian - română
mo    Romanian (Moldova) - română (Republica Moldova)
rm    Romansh - rumantsch
mt-MT    Maltese - Malti
mr    Marathi - मराठी
mg    Malagasy - Malagasy
ml    Malayalam - മലയാളം
ms    Malay - Melayu
mk-MK    Macedonian - македонски
mai    Maithili - मैथिली
mni-Mtei    Manipuri (Meitei) - mni (Mtei)
mi    Maori - Māori
mn    Mongolian - монгол
bn-BD    Bengali - বাংলা
lus    Mizo - Mizo tawng
my    Burmese - မြန်မာ
hmn    Hmong - Hmong
af    Afrikaans - Afrikaans
st    Southern Sotho - Southern Sotho
ne-NP    Nepali - नेपाली
nn    Norwegian Nynorsk - norsk nynorsk
no    Norwegian - norsk
pa    Punjabi - ਪੰਜਾਬੀ
pt-PT    Portuguese - português
pt-BR    Portuguese (Brazil) - português (Brasil)
pt-PT    Portuguese (Portugal) - português (Portugal)
ps    Pashto - پښتو
ny    Nyanja - Nyanja
tw    Twi - Twi
chr    Cherokee - ᏣᎳᎩ
ja-JP    Japanese - 日本語
sv-SE    Swedish - svenska
sm    Samoan - Samoan
sh    Serbo-Croatian - srpskohrvatski
sr-Latn-RS    Serbian - српски
si    Sinhala - සිංහල
sn   Shona - chiShona
eo   Esperanto - Esperanto
nb   Norwegian Bokmål - norsk bokmål
sk-SK    Slovak - slovenčina
sl-SI    Slovenian - slovenščina
sw    Swahili - Kiswahili
gd   Scottish Gaelic - Gàidhlig
ceb  Cebuano - Cebuano
so    Somali - Soomaali
tg    Tajik - тоҷикӣ
te    Telugu - తెలుగు
ta    Tamil - தமிழ்
th    Thai - ไทย
to    Tongan - lea fakatonga
ti    Tigrinya - ትግርኛ
tr-TR    Turkish - Türkçe
tk    Turkmen - türkmen dili
wa    Walloon - wa
cy    Welsh - Cymraeg
ug    Uyghur - ئۇيغۇرچە
wo    Wolof - Wolof
ur    Urdu - اردو
uk-UA    Ukrainian - українська
uz    Uzbek - o'zbek
es-ES     Spanish - español
es-AR    Spanish (Argentina) - español (Argentina)
es-CO    Spanish (Colombia) - español (Colombia)
es-CR    Spanish (Costa Rica) - español (Costa Rica)
es-HN   Spanish (Honduras) - español (Honduras)
es-419   Spanish (Latin America) - español (Latinoamérica)
es-US    Spanish (United States) - español (Estados Unidos)
es-PE    Spanish (Peru) - español (Perú)
es-MX   Spanish (Mexico) - español (México)
es-VE    Spanish (Venezuela) - español (Venezuela)
es-UY    Spanish (Uruguay) - español (Uruguay)
es-ES    Spanish (Spain) - español (España)
es-CL    Spanish (Chile) - español (Chile)
fy    Western Frisian - Frysk
he   Hebrew - עברית
el-GR   Greek - Ελληνικά
haw    Hawaiian - ʻŌlelo Hawaiʻi
sd    Sindhi - سنڌي
hu-HU    Hungarian - magyar
su    Sundanese - Basa Sunda
hy-AM    Armenian - հայերեն
ig    Igbo - Igbo
ilo   Ilocano - Ilokano
it-IT    Italian - italiano
it-CH  Italian (Switzerland) - italiano (Svizzera)
it-IT    Italian (Italy) - italiano (Italia)
yi    Yiddish - ייִדיש
hi    Hindi - हिन्दी
id-ID    Indonesian - Indonesia
en    English - English
en-IE     English (Ireland) - English (Ireland)
en-AU   English (Australia) - English (Australia)
en-CA   English (Canada) - English (Canada)
en-US   English (United States) - English (United States)
en-ZA   English (South Africa) - English (South Africa)
en-NZ   English (New Zealand) - English (New Zealand)
en-IN    English (India) - English (India)
en-GB-oxendict    English (United Kingdom, Oxford Dictionary spelling) - English (United Kingdom
en-GB    English (United Kingdom) - English (United Kingdom)
yo    Yoruba - Èdè Yorùbá
vi-VN    Vietnamese - Tiếng Việt
jv    Javanese - Jawa
ckb    Central Kurdish - کوردیی ناوەندی
zh    Chinese - 中文
zh-TW    Chinese (Traditional) - 中文（繁體）
zh-CN    Chinese (Simplified) - 中文（简体）
zh-HK    Chinese (Hong Kong) - 中文（香港）
zu    Zulu - isiZulu
```

### Appendix-Interface Language List {#api_dispalylanguage}

```Text
sq-AL    Albanian - shqip
ak    Akan - Akan
ar    Arabic - العربية
an    Aragonese - aragonés
am    Amharic - አማርኛ
as    Assamese - অসমীয়া
az-Cyrl-AZ    Azerbaijani - azərbaycan
ast    Asturian - asturianu
ee    Ewe - Eʋegbe
ay    Aymara - Aymar
ga    Irish - Gaeilge
et-EE    Estonian - eesti
oc    Occitan - occitan
or    Oriya - ଓଡ଼ିଆ
om    Oromo - Oromoo
eu    Basque - euskara
be-BY    Belarusian - беларуская
bm    Bambara - bamanakan
bg-BG    Bulgarian - български
nso    Northern Sotho - Northern Sotho
is-IS    Icelandic - íslenska
pl-PL    Polish - polski
bs    Bosnian - bosanski
fa    Persian - فارسی
bho    Bhojpuri - भोजपुरी
br    Breton - brezhoneg
tn    Tswana - Tswana
ts    Tsonga - Xitsonga
tt    Tatar - татар
da-DK    Danish - dansk
de    German - Deutsch
de-AT    German (Austria) - Deutsch (Österreich)
de-DE    German (Germany) - Deutsch (Deutschland)
de-LI    German (Liechtenstein) - Deutsch (Liechtenstein)
de-CH    German (Switzerland) - Deutsch (Schweiz)
dv    Divehi - ދިވެހި
doi    Dogri - डोगरी
ru    Russian - русский
fo    Faroese - føroyskt
fr    French - français
fr-FR    French (France) - français (France)
fr-CA    French (Canada) - français (Canada)
fr-CH    French (Switzerland) - français (Suisse)
sa    Sanskrit - संस्कृत भाषा
fil-PH    Filipino - Filipino
fi-FI    Finnish - suomi
km    Khmer - ខ្មែរ
ka-GE    Georgian - ქართული
gu    Gujarati - ગુજરાતી
gn    Guarani - Guarani
ia    Interlingua - interlingua
kk    Kazakh - қазақ тілі
ht    Haitian Creole - créole haïtien
ko    Korean - 한국어
ha    Hausa - Hausa
nl-NL    Dutch - Nederlands
gl    Galician - galego
ca    Catalan - català
cs-CZ    Czech - čeština
kn    Kannada - ಕನ್ನಡ
ky    Kyrgyz - кыргызча
xh    Xhosa - IsiXhosa
co    Corsican - Corsican
hr-HR    Croatian - hrvatski
qu    Quechua - Runasimi
kok    Konkani - कोंकणी
ku    Kurdish - Kurdî
la    Latin - Latin
lv-LV    Latvian - latviešu
lo-LA    Lao - ລາວ
lt-LT    Lithuanian - lietuvių
ln    Lingala - lingála
lg    Ganda - Luganda
lb    Luxembourgish - Lëtzebuergesch
rw-RW    Kinyarwanda - Kinyarwanda
ro-RO    Romanian - română
mo    Romanian (Moldova) - română (Republica Moldova)
rm    Romansh - rumantsch
mt-MT    Maltese - Malti
mr    Marathi - मराठी
mg    Malagasy - Malagasy
ml    Malayalam - മലയാളം
ms    Malay - Melayu
mk-MK    Macedonian - македонски
mai    Maithili - मैथिली
mni-Mtei    Manipuri (Meitei) - mni (Mtei)
mi    Maori - Māori
mn    Mongolian - монгол
bn-BD    Bengali - বাংলা
lus    Mizo - Mizo tawng
my    Burmese - မြန်မာ
hmn    Hmong - Hmong
af    Afrikaans - Afrikaans
st    Southern Sotho - Southern Sotho
ne-NP    Nepali - नेपाली
nn    Norwegian Nynorsk - norsk nynorsk
no    Norwegian - norsk
pa    Punjabi - ਪੰਜਾਬੀ
pt-PT    Portuguese - português
pt-BR    Portuguese (Brazil) - português (Brasil)
pt-PT    Portuguese (Portugal) - português (Portugal)
ps    Pashto - پښتو
ny    Nyanja - Nyanja
tw    Twi - Twi
chr    Cherokee - ᏣᎳᎩ
ja-JP    Japanese - 日本語
sv-SE    Swedish - svenska
sm    Samoan - Samoan
sh    Serbo-Croatian - srpskohrvatski
sr-Latn-RS    Serbian - српски
si    Sinhala - සිංහල
sn   Shona - chiShona
eo   Esperanto - Esperanto
nb   Norwegian Bokmål - norsk bokmål
sk-SK    Slovak - slovenčina
sl-SI    Slovenian - slovenščina
sw    Swahili - Kiswahili
gd   Scottish Gaelic - Gàidhlig
ceb  Cebuano - Cebuano
so    Somali - Soomaali
tg    Tajik - тоҷикӣ
te    Telugu - తెలుగు
ta    Tamil - தமிழ்
th    Thai - ไทย
to    Tongan - lea fakatonga
ti    Tigrinya - ትግርኛ
tr-TR    Turkish - Türkçe
tk    Turkmen - türkmen dili
wa    Walloon - wa
cy    Welsh - Cymraeg
ug    Uyghur - ئۇيغۇرچە
wo    Wolof - Wolof
ur    Urdu - اردو
uk-UA    Ukrainian - українська
uz    Uzbek - o'zbek
es-ES     Spanish - español
es-AR    Spanish (Argentina) - español (Argentina)
es-CO    Spanish (Colombia) - español (Colombia)
es-CR    Spanish (Costa Rica) - español (Costa Rica)
es-HN   Spanish (Honduras) - español (Honduras)
es-419   Spanish (Latin America) - español (Latinoamérica)
es-US    Spanish (United States) - español (Estados Unidos)
es-PE    Spanish (Peru) - español (Perú)
es-MX   Spanish (Mexico) - español (México)
es-VE    Spanish (Venezuela) - español (Venezuela)
es-UY    Spanish (Uruguay) - español (Uruguay)
es-ES    Spanish (Spain) - español (España)
es-CL    Spanish (Chile) - español (Chile)
fy    Western Frisian - Frysk
he   Hebrew - עברית
el-GR   Greek - Ελληνικά
haw    Hawaiian - ʻŌlelo Hawaiʻi
sd    Sindhi - سنڌي
hu-HU    Hungarian - magyar
su    Sundanese - Basa Sunda
hy-AM    Armenian - հայերեն
ig    Igbo - Igbo
ilo   Ilocano - Ilokano
it-IT    Italian - italiano
it-CH  Italian (Switzerland) - italiano (Svizzera)
it-IT    Italian (Italy) - italiano (Italia)
yi    Yiddish - ייִדיש
hi    Hindi - हिन्दी
id-ID    Indonesian - Indonesia
en    English - English
en-IE     English (Ireland) - English (Ireland)
en-AU   English (Australia) - English (Australia)
en-CA   English (Canada) - English (Canada)
en-US   English (United States) - English (United States)
en-ZA   English (South Africa) - English (South Africa)
en-NZ   English (New Zealand) - English (New Zealand)
en-IN    English (India) - English (India)
en-GB-oxendict    English (United Kingdom, Oxford Dictionary spelling) - English (United Kingdom
en-GB    English (United Kingdom) - English (United Kingdom)
yo    Yoruba - Èdè Yorùbá
vi-VN    Vietnamese - Tiếng Việt
jv    Javanese - Jawa
ckb    Central Kurdish - کوردیی ناوەندی
zh    Chinese - 中文
zh-TW    Chinese (Traditional) - 中文（繁體）
zh-CN    Chinese (Simplified) - 中文（简体）
zh-HK    Chinese (Hong Kong) - 中文（香港）
zu    Zulu - isiZulu
```


### Appendix-Timezone List {#api_timezone}

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
