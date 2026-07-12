# Fingerprint Fields

Use `fingerInfo` only when the user explicitly asks to customize browser fingerprint behavior, such as language, timezone, geolocation, WebRTC, Canvas, WebGL, resolution, sync, cache, or hardware settings. For ordinary browser creation and editing, omit `fingerInfo`.

Both `roxy_browser_create` and `roxy_browser_update` accept `fingerInfo` as an object. The MCP tool schema intentionally does not expand these fields to keep common create/update calls focused.

For appendix values referenced by language, display language, timezone, and resolution fields, read [fingerprint-languages.md](fingerprint-languages.md), [fingerprint-interface-languages.md](fingerprint-interface-languages.md), [fingerprint-timezones.md](fingerprint-timezones.md), or [fingerprint-resolutions.md](fingerprint-resolutions.md).

## Language and timezone

Use the API appendix values exactly. Boolean selectors use `true` for "follow IP/system" and `false` for "custom"; this is easy to invert when creating a profile.

For a custom timezone, set `isTimeZone: false` and pass the full appendix string in `timeZone`, including the GMT prefix and IANA zone. Do not pass only `Asia/Shanghai`, `America/Los_Angeles`, `UTC`, or a numeric offset.

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `isLanguageBaseIp` | boolean | `true`=follow IP, `false`=custom; default `true` | Browser language selector |
| `language` | string | Appendix-Language List, e.g. `en-US`, `zh-CN` | Custom browser language when `isLanguageBaseIp` is `false` |
| `isDisplayLanguageBaseIp` | boolean | `true`=follow IP, `false`=custom; default `true` | Interface/display language selector |
| `displayLanguage` | string | Appendix-Interface Language List, e.g. `en-US`, `zh-CN` | Custom display language when `isDisplayLanguageBaseIp` is `false` |
| `isTimeZone` | boolean | `true`=follow IP, `false`=custom; default `true` | Timezone selector |
| `timeZone` | string | Appendix-Timezone List, e.g. `GMT+08:00 Asia/Shanghai` | Custom timezone when `isTimeZone` is `false` |

Custom timezone example:

```json
{
  "fingerInfo": {
    "isTimeZone": false,
    "timeZone": "GMT+08:00 Asia/Shanghai"
  }
}
```

## Geolocation

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `position` | number | `0`=ask, `1`=allow, `2`=deny; default `1` | Geolocation prompt |
| `isPositionBaseIp` | boolean | `true`=follow IP, `false`=custom; default `true` | Geolocation selector |
| `longitude` | string | - | Custom longitude when `isPositionBaseIp` is `false` |
| `latitude` | string | - | Custom latitude when `isPositionBaseIp` is `false` |
| `precisionPos` | string | - | Precision in meters when `isPositionBaseIp` is `false` |

## Media settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `forbidAudio` | boolean | `true`=disable audio, `false`=allow audio; default `true` | Web page audio |
| `forbidImage` | boolean | `true`=disable images, `false`=allow with threshold; default `true` | Web page images |
| `forbiddenPictureSize` | number | - | Image load size threshold (KB, positive integer). When forbidImage is false, set forbiddenPictureSize = 0 to disable all image loading. Default 0. |
| `forbidMedia` | boolean | `true`=disable video, `false`=allow video; default `true` | Web page videos |

## Window settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `openWidth` | string | default `1000` | Window width |
| `openHeight` | string | default `1000` | Window height |
| `openBookmarks` | boolean | default `false` | Enable bookmarks |
| `positionSwitch` | boolean | `true`=custom position, `false`=full screen; default `true` | Window position switch |
| `windowRatioPosition` | string | default `0,0` | Window position ratio |
| `isDisplayName` | boolean | default `false` | Show window name in title bar |

## Sync settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `syncBookmark` | boolean | default `false` | Sync bookmarks |
| `syncHistory` | boolean | default `false` | Sync history |
| `syncTab` | boolean | default `true` | Sync tabs |
| `syncCookie` | boolean | default `true` | Sync cookies |
| `syncExtensions` | boolean | default `false` | Sync extensions |
| `syncPassword` | boolean | default `true` | Sync saved passwords |
| `syncIndexedDb` | boolean | default `false` | Sync IndexedDB |
| `syncLocalStorage` | boolean | default `false` | Sync LocalStorage |

## Cleanup settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `clearCacheFile` | boolean | default `false` | Clear cache files on startup |
| `clearCookie` | boolean | default `false` | Clear cookies on startup |
| `clearLocalStorage` | boolean | default `false` | Clear LocalStorage on startup |

## Advanced settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `randomFingerprint` | boolean | default `false` | Randomize fingerprint on browser start |
| `forbidSavePassword` | boolean | default `false` | Disable password save prompts |
| `stopOpenNet` | boolean | default `false` | Stop opening if network fails |
| `stopOpenIP` | boolean | default `false` | Stop opening if IP changes |
| `stopOpenPosition` | boolean | default `false` | Stop opening if IP country/region changes |
| `openWorkbench` | number | `0`=disable, `1`=enable, `2`=follow app; default `1` | Open workbench |

## Display settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `resolutionType` | boolean | `true`=custom, `false`=system default; default `false` | Resolution selector |
| `resolutionX` | string | Appendix-Resolution List | Custom resolution width when `resolutionType` is `true` |
| `resolutionY` | string | Appendix-Resolution List | Custom resolution height when `resolutionType` is `true` |
| `fontType` | boolean | `true`=random, `false`=follow system; default `false` | Font fingerprint |

## Browser fingerprint settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `webRTC` | number | `0`=replace, `1`=real, `2`=disable; default `2` | WebRTC |
| `webGL` | boolean | `true`=random, `false`=real; default `true` | WebGL image |
| `webGLInfo` | boolean | `true`=custom, `false`=real; default `true` | WebGL info |
| `webGLManufacturer` | string | - | Custom WebGL manufacturer |
| `webGLRender` | string | - | Custom WebGL renderer |
| `webGpu` | string | `webgl`=match WebGL, `real`=real, `block`=disable; default `webgl` | WebGPU setting |
| `canvas` | boolean | `true`=random, `false`=real; default `true` | Canvas |
| `audioContext` | boolean | `true`=random, `false`=real; default `true` | AudioContext |
| `speechVoices` | boolean | `true`=random, `false`=real; default `true` | Speech Voices |
| `doNotTrack` | boolean | `true`=enable, `false`=disable; default `true` | Do Not Track |
| `clientRects` | boolean | `true`=random, `false`=real; default `true` | ClientRects |
| `deviceInfo` | boolean | `true`=random, `false`=real; default `true` | Media devices |
| `deviceNameSwitch` | boolean | `true`=random, `false`=real; default `true` | Device names |
| `macInfo` | boolean | `true`=custom, `false`=real; default `true` | MAC address |

## Hardware settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `hardwareConcurrent` | string | - | Hardware concurrency |
| `deviceMemory` | string | - | Device memory |

## Security settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `disableSsl` | boolean | `true`=enable SSL fingerprint setting, `false`=disable; default `false` | SSL fingerprint settings |
| `disableSslList` | array<string> | - | SSL feature list |
| `portScanProtect` | boolean | `true`=enable, `false`=disable; default `true` | Port scan protection |
| `portScanList` | string | - | Port scan whitelist |
| `useGpu` | boolean | default `true` | Use GPU acceleration |
| `sandboxPermission` | boolean | `true`=disable sandbox, `false`=keep sandbox; default `false` | Sandbox permission |
| `startupParam` | string | - | Browser startup parameters (--headless=new startup headless) |

## Battery, network, Bluetooth, and domain controls

These fields are also accepted in `fingerInfo` by the API docs.

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `openBattery` | boolean | default `false` | Battery API simulation master switch |
| `openCharging` | boolean | default `false` | Simulated charging state when battery simulation is enabled |
| `chargingTime` | string | numeric string, no unit | Seconds until full charge |
| `dischargingTime` | string | numeric string, no unit | Seconds until empty |
| `level` | string | `0`-`1` | Battery level |
| `openNetwork` | boolean | default `false` | Network Information API simulation master switch |
| `networkType` | string | `wifi`, `cellular`, `ethernet`, `bluetooth`, `wimax`, `other`, `unknown` | Connection type |
| `networkSpeed` | string | `slow-2G`, `2g`, `3g`, `4g` | Effective connection type |
| `downloadSpeed` | string | Mbps | Downlink speed |
| `maxDownloadSpeed` | string | Mbps | Maximum downlink speed |
| `latency` | string or number | ms | Round-trip time |
| `saveFlowMode` | boolean | default `false` | Save-Data / reduced data mode |
| `openBluetooth` | boolean | default `false` | Bluetooth simulation master switch |
| `bluetoothAdapter` | boolean | default `false` | Simulated Bluetooth adapter present |
| `blockDomainList` | string | newline separated domains | Domain blocklist |
| `allowDomainList` | string | newline separated domains | Domain allowlist |
