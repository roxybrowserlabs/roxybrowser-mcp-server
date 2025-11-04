---
outline: deep
---

# API 说明

RoxyBrowser 支持通过接口调用方式使用浏览器功能，帮助用户运行自有的自动化脚本。可以配合Selenium、Puppeteer和playwright等自动化框架来实现浏览器操作的自动化。接口请求频率限制请查看具体的套餐权益。  

## 使用方式
1.打开Roxy浏览器，进入API功能  
2.将API启用状态设置为启用。  
3.使用API key，以及接口host：http://127.0.0.1:50000;（50000为默认端口）使用API。  
API密钥可以重置，重置后原先的密钥将失效。端口号可以修改，修改后需要重启软件才能生效。  

![图片alt](/image/webp/API.webp)   

## API 接入须知
1.注意：所有接口请求头必须加上token  
2.token 获取方式：登录 roxybrowser，应用窗口左侧菜单【API -> API配置 -> API Key】   
3.接口 host：http://127.0.0.1:50000; 其中50000为默认端口，可在 【API -> API配置 -> 端口】
4.请求前须开启开关：【API -> API配置 -> 开关】  





