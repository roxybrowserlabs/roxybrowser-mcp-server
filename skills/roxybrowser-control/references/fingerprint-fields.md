# Fingerprint Fields

Use `fingerInfo` only when the user explicitly asks to customize browser fingerprint behavior, such as language, timezone, geolocation, WebRTC, Canvas, WebGL, resolution, sync, cache, or hardware settings. For ordinary browser creation and editing, omit `fingerInfo`.

Both `roxy_browser_create` and `roxy_browser_update` accept `fingerInfo` as an object. The MCP tool schema intentionally does not expand these fields to keep common create/update calls focused.

## Language and timezone

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `isLanguageBaseIp` | boolean | - | Follow IP for browser language |
| `language` | string | - | Custom browser language |
| `isDisplayLanguageBaseIp` | boolean | - | Follow IP for display language |
| `displayLanguage` | string | - | Custom display language |
| `isTimeZone` | boolean | - | Follow IP for timezone |
| `timeZone` | string | - | Custom timezone |

## Geolocation

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `position` | number | - | Geolocation prompt: 0=ask, 1=allow, 2=deny |
| `isPositionBaseIp` | boolean | - | Follow IP for geolocation |
| `longitude` | string | - | Custom longitude |
| `latitude` | string | - | Custom latitude |
| `precisionPos` | string | - | Precision in meters |

## Media settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `forbidAudio` | boolean | - | Enable/disable sound |
| `forbidImage` | boolean | - | Enable/disable image loading |
| `forbiddenPictureSize` | number | - | Image load size threshold (KB, positive integer). When forbidImage is false, set forbiddenPictureSize = 0 to disable all image loading. Default 0. |
| `forbidMedia` | boolean | - | Enable/disable video playback |

## Window settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `openWidth` | string | - | Window width |
| `openHeight` | string | - | Window height |
| `openBookmarks` | boolean | - | Enable bookmarks |
| `positionSwitch` | boolean | - | Window position switch |
| `windowRatioPosition` | string | - | Window position ratio |
| `isDisplayName` | boolean | - | Show window name in title bar |

## Sync settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `syncBookmark` | boolean | - | Sync bookmarks |
| `syncHistory` | boolean | - | Sync history |
| `syncTab` | boolean | - | Sync tabs |
| `syncCookie` | boolean | - | Sync cookies |
| `syncExtensions` | boolean | - | Sync extensions |
| `syncPassword` | boolean | - | Sync saved passwords |
| `syncIndexedDb` | boolean | - | Sync IndexedDB |
| `syncLocalStorage` | boolean | - | Sync LocalStorage |

## Cleanup settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `clearCacheFile` | boolean | - | Clear cache files on startup |
| `clearCookie` | boolean | - | Clear cookies on startup |
| `clearLocalStorage` | boolean | - | Clear LocalStorage on startup |

## Advanced settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `randomFingerprint` | boolean | - | Generate random fingerprint |
| `forbidSavePassword` | boolean | - | Disable password save prompts |
| `stopOpenNet` | boolean | - | Stop opening if network fails |
| `stopOpenIP` | boolean | - | Stop opening if IP changes |
| `stopOpenPosition` | boolean | - | Stop opening if IP location changes |
| `openWorkbench` | number | - | Open workbench: 0=close, 1=open, 2=follow app |

## Display settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `resolutionType` | boolean | - | Custom resolution vs follow system |
| `resolutionX` | string | - | Custom resolution width |
| `resolutionY` | string | - | Custom resolution height |
| `fontType` | boolean | - | Random fonts vs system fonts |

## Browser fingerprint settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `webRTC` | number | - | WebRTC: 0=replace, 1=real, 2=disable |
| `webGL` | boolean | - | WebGL: random vs real |
| `webGLInfo` | boolean | - | WebGL info: custom vs real |
| `webGLManufacturer` | string | - | Custom WebGL manufacturer |
| `webGLRender` | string | - | Custom WebGL renderer |
| `webGpu` | string | webgl, real, block | WebGPU setting |
| `canvas` | boolean | - | Canvas: random vs real |
| `audioContext` | boolean | - | AudioContext: random vs real |
| `speechVoices` | boolean | - | Speech Voices: random vs real |
| `doNotTrack` | boolean | - | Enable Do Not Track |
| `clientRects` | boolean | - | ClientRects: random vs real |
| `deviceInfo` | boolean | - | Media devices: random vs real |
| `deviceNameSwitch` | boolean | - | Device names: random vs real |
| `macInfo` | boolean | - | MAC address: custom vs real |

## Hardware settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `hardwareConcurrent` | string | - | Hardware concurrency |
| `deviceMemory` | string | - | Device memory |

## Security settings

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `disableSsl` | boolean | - | SSL fingerprint settings |
| `disableSslList` | array<string> | - | SSL feature list |
| `portScanProtect` | boolean | - | Port scan protection |
| `portScanList` | string | - | Port scan whitelist |
| `useGpu` | boolean | - | Use GPU acceleration |
| `sandboxPermission` | boolean | - | Disable sandbox |
| `startupParam` | string | - | Browser startup parameters (--headless=new startup headless) |
