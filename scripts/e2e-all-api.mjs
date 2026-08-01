#!/usr/bin/env node

import assert from "node:assert/strict";
import process from "node:process";
import { RoxyApiClient } from "../lib/api/roxy-api-client.js";
import spec from "../spec/roxy-api.json" with { type: "json" };

const apiKey = process.env.ROXY_API_KEY?.trim();
const apiHost = process.env.ROXY_API_HOST?.trim() || "http://127.0.0.1:50003";
const configuredWorkspaceId = optionalInteger(process.env.ROXY_WORKSPACE_ID);
const configuredProjectId = optionalInteger(process.env.ROXY_E2E_PROJECT_ID);
const timeout = optionalInteger(process.env.ROXY_TIMEOUT) ?? 120_000;

if (!apiKey) throw new Error("ROXY_API_KEY is required for live E2E tests");

const endpointByHttp = new Map(
  spec.endpoints.map((endpoint) => [`${endpoint.http.method} ${endpoint.http.path}`, endpoint]),
);
const coverage = new Map(
  spec.endpoints.map((endpoint) => [
    endpoint.id,
    { calls: 0, requestPaths: new Set(), responsePaths: new Set(), codes: [] },
  ]),
);
const conditionallyAbsentResponseFields = new Set([
  "account-list:data.rows[].platformCookies[].name",
  "account-list:data.rows[].platformCookies[].value",
  "account-list:data.rows[].platformCookies[].domain",
  "browser-account-list:data.rows[].platformCookies[].name",
  "browser-account-list:data.rows[].platformCookies[].value",
  "browser-account-list:data.rows[].platformCookies[].domain",
  "profile-detail:data.rows[].windowPlatformList[].id",
  "profile-detail:data.rows[].statusInfo[].openUserName",
  "profile-detail:data.rows[].statusInfo[].openTime",
  "profile-detail:data.rows[].proxyInfo.moduleId",
]);

function optionalInteger(value) {
  if (value === undefined || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed))
    throw new Error(`Expected an integer environment value, got ${value}`);
  return parsed;
}

function collectPaths(value, prefix, output) {
  if (Array.isArray(value)) {
    for (const item of value) collectPaths(item, `${prefix}[]`, output);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    output.add(path);
    collectPaths(child, path, output);
  }
}

async function trackedFetch(input, init) {
  const url = new URL(typeof input === "string" ? input : input.url);
  const method = init?.method ?? "GET";
  const endpoint = endpointByHttp.get(`${method} ${url.pathname}`);
  assert.ok(endpoint, `Unexpected E2E request: ${method} ${url.pathname}`);
  const entry = coverage.get(endpoint.id);
  entry.calls += 1;
  if (method === "GET") {
    for (const key of url.searchParams.keys()) entry.requestPaths.add(key);
  } else if (init?.body) {
    collectPaths(JSON.parse(String(init.body)), "", entry.requestPaths);
  }

  const response = await fetch(input, init);
  const payload = await response.clone().json();
  collectPaths(payload, "", entry.responsePaths);
  entry.codes.push(payload.code);
  const errors = schemaErrors(endpoint.response.schema, payload);
  assert.deepEqual(errors, [], `${endpoint.id} response schema mismatch: ${errors.join(", ")}`);
  return response;
}

function referencedSchema(node) {
  const name = node?.$ref?.startsWith("#/schemas/")
    ? node.$ref.slice("#/schemas/".length)
    : undefined;
  return name ? spec.schemas[name] : undefined;
}

function schemaPaths(node, prefix = "", seen = new Set()) {
  const referenced = referencedSchema(node);
  if (referenced) {
    const name = node.$ref.slice("#/schemas/".length);
    if (seen.has(name)) return new Set();
    return schemaPaths(referenced, prefix, new Set([...seen, name]));
  }
  const paths = new Set();
  for (const choice of node?.oneOf ?? []) {
    for (const path of schemaPaths(choice, prefix, seen)) paths.add(path);
  }
  if (node?.type === "array") {
    for (const path of schemaPaths(node.items, `${prefix}[]`, seen)) paths.add(path);
  }
  if (node?.type !== "object") return paths;
  if (node.extends) {
    for (const path of schemaPaths(node.extends, prefix, seen)) paths.add(path);
  }
  for (const [name, property] of Object.entries(node.properties ?? {})) {
    const path = prefix ? `${prefix}.${name}` : name;
    paths.add(path);
    for (const childPath of schemaPaths(property, path, seen)) paths.add(childPath);
  }
  return paths;
}

function schemaErrors(node, value, path = "response", seen = new Set()) {
  const referenced = referencedSchema(node);
  if (referenced) {
    const name = node.$ref.slice("#/schemas/".length);
    if (seen.has(name)) return [];
    return schemaErrors(referenced, value, path, new Set([...seen, name]));
  }
  if (node?.oneOf) {
    const variants = node.oneOf.map((choice) => schemaErrors(choice, value, path, seen));
    return variants.some((errors) => errors.length === 0)
      ? []
      : [`${path} does not match any schema variant`];
  }
  if (node?.enum && !node.enum.includes(value)) return [`${path} is outside its enum`];
  if (node?.type === "unknown") return [];
  if (node?.type === "array") {
    if (!Array.isArray(value)) return [`${path} must be an array`];
    return value.flatMap((item, index) =>
      schemaErrors(node.items, item, `${path}[${index}]`, seen),
    );
  }
  if (node?.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return [`${path} must be an object`];
    }
    const errors = node.extends ? schemaErrors(node.extends, value, path, seen) : [];
    for (const name of node.required ?? []) {
      if (!Object.hasOwn(value, name)) errors.push(`${path}.${name} is required`);
    }
    for (const [name, property] of Object.entries(node.properties ?? {})) {
      if (Object.hasOwn(value, name)) {
        errors.push(...schemaErrors(property, value[name], `${path}.${name}`, seen));
      }
    }
    return errors;
  }
  const valid = {
    string: typeof value === "string",
    number: typeof value === "number" && Number.isFinite(value),
    integer: Number.isInteger(value),
    boolean: typeof value === "boolean",
    null: value === null,
    void: value === undefined,
  }[node?.type];
  return valid === false ? [`${path} must be ${node.type}`] : [];
}

function assertSuccess(response, endpointId) {
  assert.equal(response.code, 0, `${endpointId} failed: ${response.msg}`);
  console.log(`PASS ${endpointId}`);
  return response.data;
}

async function cleanupRequest(method, path, params) {
  const url = new URL(path, apiHost);
  const init = { method, headers: { "Content-Type": "application/json", token: apiKey } };
  if (method === "GET") {
    for (const [name, value] of Object.entries(params)) url.searchParams.set(name, String(value));
  } else {
    init.body = JSON.stringify(params);
  }
  return await (await fetch(url, init)).json();
}

async function cleanupByPrefix(workspaceId, runId) {
  const profiles = await cleanupRequest("GET", "/browser/list_v3", {
    workspaceId,
    page_index: 1,
    page_size: 100,
  });
  const profileIds = (profiles.data?.rows ?? [])
    .filter(({ windowName }) => windowName?.startsWith(runId))
    .map(({ dirId }) => dirId);
  for (const dirId of profileIds) {
    await cleanupRequest("POST", "/browser/close", { dirId });
  }
  if (profileIds.length > 0) {
    await cleanupRequest("POST", "/browser/delete", {
      workspaceId,
      dirIds: profileIds,
      isSoftDelete: false,
    });
  }

  const proxies = await cleanupRequest("GET", "/proxy/list_merged", {
    workspaceId,
    page_index: 1,
    page_size: 100,
  });
  const proxyIds = (proxies.data?.rows ?? [])
    .filter(({ remark }) => remark?.startsWith(runId))
    .map(({ id }) => id);
  if (proxyIds.length > 0) {
    await cleanupRequest("POST", "/proxy/delete", { workspaceId, ids: proxyIds });
  }

  const accounts = await cleanupRequest("GET", "/account/list", {
    workspaceId,
    page_index: 1,
    page_size: 100,
  });
  const accountIds = (accounts.data?.rows ?? [])
    .filter(
      ({ platformUserName, platformRemarks }) =>
        platformUserName?.startsWith(runId) || platformRemarks?.startsWith(runId),
    )
    .map(({ id }) => id);
  if (accountIds.length > 0) {
    await cleanupRequest("POST", "/account/delete", { workspaceId, ids: accountIds });
  }
}

function fullProfileInput({ workspaceId, projectId, labelId, accountId, runId }) {
  const endpoint = spec.endpoints.find(({ id }) => id === "profile-create");
  const input = structuredClone(endpoint.request.examples.shared);
  Object.assign(input, {
    workspaceId,
    windowName: runId,
    coreVersion: "150",
    coreType: "Chrome",
    os: "Windows",
    osVersion: "11",
    cookie: [{ name: "roxy_e2e", value: runId, domain: ".example.com" }],
    labelIds: labelId ? [labelId] : [],
    windowPlatformList: [
      {
        id: accountId,
        platformUrl: `https://example.com/${runId}`,
        platformUserName: `${runId}-profile-account`,
        platformPassword: "e2e-profile-password",
        platformEfa: "JBSWY3DPEHPK3PXP",
        platformRemarks: `${runId}-profile-account`,
      },
    ],
    defaultOpenUrl: ["https://example.com/"],
    windowRemark: `${runId}-remark`,
    projectId,
  });
  Object.assign(input.proxyInfo, {
    moduleId: 0,
    proxyMethod: "custom",
    proxyCategory: "noproxy",
    ipType: "IPV4",
    host: "",
    port: "",
    proxyUserName: "",
    proxyPassword: "",
    refreshUrl: "",
    checkChannel: "IPRust.io",
  });
  Object.assign(input.fingerInfo, {
    isLanguageBaseIp: false,
    language: "en-US",
    isDisplayLanguageBaseIp: false,
    displayLanguage: "en-US",
    isTimeZone: false,
    timeZone: "GMT+09:00 Asia/Tokyo",
    position: 1,
    isPositionBaseIp: false,
    longitude: "139.6917",
    latitude: "35.6895",
    precisionPos: "100",
    forbidAudio: false,
    forbidImage: false,
    forbiddenPictureSize: 64,
    forbidMedia: false,
    openWidth: "1280",
    openHeight: "720",
    openBookmarks: true,
    positionSwitch: true,
    windowRatioPosition: "0,0",
    isDisplayName: true,
    syncBookmark: true,
    syncHistory: true,
    syncTab: true,
    syncCookie: true,
    syncExtensions: true,
    syncPassword: true,
    syncIndexedDb: true,
    syncLocalStorage: true,
    clearCacheFile: false,
    clearCookie: false,
    clearLocalStorage: false,
    randomFingerprint: false,
    forbidSavePassword: false,
    stopOpenNet: false,
    stopOpenIP: false,
    stopOpenPosition: false,
    openWorkbench: 1,
    resolutionType: true,
    resolutionX: "1280",
    resolutionY: "720",
    fontType: true,
    webRTC: 0,
    webGL: true,
    webGLInfo: true,
    webGLManufacturer: "Google Inc. (Intel)",
    webGLRender: "ANGLE (Intel)",
    webGpu: "webgl",
    canvas: true,
    audioContext: true,
    speechVoices: true,
    doNotTrack: true,
    clientRects: true,
    deviceInfo: true,
    deviceNameSwitch: true,
    macInfo: true,
    hardwareConcurrent: "8",
    deviceMemory: "8",
    disableSsl: true,
    disableSslList: ["TLSv1", "TLSv1.1"],
    portScanProtect: true,
    portScanList: "80,443",
    useGpu: true,
    sandboxPermission: false,
    startupParam: "--disable-notifications",
    openBattery: true,
    openCharging: true,
    chargingTime: "0",
    dischargingTime: "3600",
    level: "0.8",
    openNetwork: true,
    networkType: "wifi",
    networkSpeed: "4g",
    downloadSpeed: "10",
    maxDownloadSpeed: "100",
    latency: 20,
    saveFlowMode: false,
    openBluetooth: true,
    bluetoothAdapter: true,
    blockDomainList: "ads.example.com",
    allowDomainList: "example.com",
  });
  return input;
}

async function run() {
  const runId = `codex-e2e-${Date.now()}`;
  const createdAccountIds = [];
  const createdProxyIds = [];
  const cleanupErrors = [];
  let createdProfileId;
  let profileOpened = false;
  let client;
  let workspaceId;

  try {
    const bootstrap = new RoxyApiClient({ apiKey, baseUrl: apiHost, timeout, fetch: trackedFetch });
    assertSuccess(await bootstrap.health(), "health");
    const workspaces = assertSuccess(
      await bootstrap.workspace.list({ page_index: 1, page_size: 100 }),
      "workspace-list",
    );
    const workspace = configuredWorkspaceId
      ? workspaces.rows.find(({ id }) => id === configuredWorkspaceId)
      : workspaces.rows[0];
    assert.ok(workspace, "No E2E workspace is available");
    workspaceId = workspace.id;
    const projects = workspace.project_details ?? [];
    const project = configuredProjectId
      ? projects.find(({ projectId }) => projectId === configuredProjectId)
      : projects.at(-1);
    assert.ok(project?.projectId, "No E2E project is available in the selected workspace");

    client = new RoxyApiClient({
      apiKey,
      baseUrl: apiHost,
      workspaceId,
      timeout,
      fetch: trackedFetch,
    });
    const labels = assertSuccess(await client.browser.labels({}), "label-list");
    const channels = assertSuccess(await client.proxy.detectChannels(), "proxy-detect-channels");
    assert.ok(channels.length > 0, "No proxy detection channel is available");

    const singleAccount = {
      platformUrl: `https://example.com/${runId}/single`,
      platformUserName: `${runId}-single`,
      platformPassword: "e2e-single-password",
      platformEfa: "JBSWY3DPEHPK3PXP",
      platformRemarks: `${runId}-single-remark`,
    };
    const createdAccount = assertSuccess(
      await client.account.create(singleAccount),
      "account-create",
    );
    createdAccountIds.push(createdAccount.platform_id);
    const batchAccount = {
      platformUrl: `https://example.com/${runId}/batch`,
      platformUserName: `${runId}-batch`,
      platformPassword: "e2e-batch-password",
      platformEfa: "JBSWY3DPEHPK3PXP",
      platformRemarks: `${runId}-batch-remark`,
    };
    assertSuccess(
      await client.account.batchCreate({ accountList: [batchAccount] }),
      "account-batch-create",
    );
    const accounts = assertSuccess(
      await client.account.list({ page_index: 1, page_size: 100 }),
      "account-list",
    );
    const batchAccountRow = accounts.rows.find(
      ({ platformUserName }) => platformUserName === batchAccount.platformUserName,
    );
    assert.ok(batchAccountRow, "Batch-created platform account was not returned by account-list");
    createdAccountIds.push(batchAccountRow.id);
    assertSuccess(
      await client.browser.accounts({ accountId: 0, page_index: 1, page_size: 100 }),
      "browser-account-list",
    );
    assertSuccess(
      await client.account.modify({
        id: createdAccountIds[0],
        platformUrl: `https://example.com/${runId}/modified`,
        platformUserName: `${runId}-modified`,
        platformPassword: "e2e-modified-password",
        platformEfa: "JBSWY3DPEHPK3PXP",
        platformRemarks: `${runId}-modified-remark`,
      }),
      "account-modify",
    );

    const proxyChannel =
      channels.find(({ label }) => label === "IP123.in")?.value ?? channels[0].value;
    const singleProxy = {
      checkChannel: proxyChannel,
      ipType: "IPV4",
      protocol: "SOCKS5",
      host: "127.0.0.1",
      port: "9",
      proxyUserName: `${runId}-proxy-user`,
      proxyPassword: "e2e-proxy-password",
      refreshUrl: "",
      remark: `${runId}-proxy-single`,
    };
    assertSuccess(await client.proxy.create(singleProxy), "proxy-create");
    const batchProxy = {
      ...singleProxy,
      protocol: "HTTP",
      proxyUserName: `${runId}-proxy-batch-user`,
      remark: `${runId}-proxy-batch`,
    };
    assertSuccess(
      await client.proxy.batchCreate({ checkChannel: proxyChannel, proxyList: [batchProxy] }),
      "proxy-batch-create",
    );
    const proxies = assertSuccess(
      await client.proxy.listMerged({
        type: "",
        page_index: 1,
        page_size: 100,
        orderName: "createTime",
        orderType: "desc",
        proxyType: "0",
        proxyBindStatus: "",
        proxyAutoRenew: "",
        country: "",
        check_status: -1,
        start_date: "",
        end_date: "",
        checker: "",
      }),
      "proxy-list-merged",
    );
    for (const proxy of proxies.rows) {
      if ([singleProxy.remark, batchProxy.remark].includes(proxy.remark)) {
        createdProxyIds.push(proxy.id);
      }
    }
    assert.equal(
      createdProxyIds.length,
      2,
      "Created proxies were not returned by proxy-list-merged",
    );
    assertSuccess(await client.proxy.list({ page_index: 1, page_size: 100 }), "proxy-list-legacy");
    assertSuccess(
      await client.proxy.boughtList({ page_index: 1, page_size: 100, type: 0 }),
      "proxy-bought-list",
    );
    assertSuccess(
      await client.proxy.modify({
        id: createdProxyIds[0],
        checkChannel: proxyChannel,
        ipType: "IPV4",
        protocol: "HTTPS",
        host: "127.0.0.2",
        port: "10",
        proxyUserName: `${runId}-proxy-modified`,
        proxyPassword: "e2e-proxy-modified-password",
        refreshUrl: "",
        remark: `${runId}-proxy-modified`,
      }),
      "proxy-modify",
    );
    const detectableProxy = proxies.rows.find(({ checkStatus }) => checkStatus === 1);
    assert.ok(detectableProxy, "No previously healthy proxy is available for proxy-detect");
    assertSuccess(await client.proxy.detect({ id: detectableProxy.id }), "proxy-detect");

    const profileInput = fullProfileInput({
      workspaceId,
      projectId: project.projectId,
      labelId: labels[0]?.id,
      accountId: createdAccountIds[0],
      runId,
    });
    const createdProfile = assertSuccess(
      await client.browser.create(profileInput),
      "profile-create",
    );
    createdProfileId = createdProfile.dirId;
    let profileDetail = assertSuccess(
      await client.browser.detail({ dirId: createdProfileId }),
      "profile-detail",
    );
    const profile = profileDetail.rows[0];
    assert.ok(profile, "Created profile was not returned by profile-detail");
    assertSuccess(
      await client.browser.list({
        dirIds: createdProfileId,
        windowName: runId,
        sortNums: String(profile.windowSortNum),
        os: "Windows",
        projectIds: String(project.projectId),
        windowRemark: `${runId}-remark`,
        page_index: 1,
        page_size: 100,
      }),
      "profile-list",
    );
    assertSuccess(
      await client.browser.randomEnv({ dirId: createdProfileId }),
      "profile-randomize-fingerprint",
    );
    const modifyInput = structuredClone(profileInput);
    delete modifyInput.coreType;
    Object.assign(modifyInput, {
      dirId: createdProfileId,
      windowName: `${runId}-modified`,
      windowRemark: `${runId}-modified-remark`,
    });
    assertSuccess(await client.browser.modify(modifyInput), "profile-modify");
    assertSuccess(
      await client.browser.open({
        dirId: createdProfileId,
        args: ["--remote-allow-origins=*", "--disable-audio-output"],
        forceOpen: true,
        headless: true,
      }),
      "profile-open",
    );
    profileOpened = true;
    const connections = assertSuccess(
      await client.browser.connectionInfo({ dirIds: createdProfileId }),
      "profile-connection-info",
    );
    assert.ok(
      connections.some(({ dirId }) => dirId === createdProfileId),
      "Opened profile was not returned by profile-connection-info",
    );
    profileDetail = assertSuccess(
      await client.browser.detail({ dirId: createdProfileId }),
      "profile-detail",
    );
    assert.ok(profileDetail.rows[0], "Opened profile was not returned by profile-detail");
    assertSuccess(await client.browser.close({ dirId: createdProfileId }), "profile-close");
    profileOpened = false;
    assertSuccess(
      await client.browser.clearLocalCache({
        dirIds: [createdProfileId],
        type: "cloud",
      }),
      "profile-clear-local-cache",
    );
    assertSuccess(
      await client.browser.clearServerCache({ dirIds: [createdProfileId] }),
      "profile-clear-server-cache",
    );
  } finally {
    if (client && createdProfileId) {
      if (profileOpened) {
        try {
          assertSuccess(await client.browser.close({ dirId: createdProfileId }), "profile-close");
        } catch (error) {
          cleanupErrors.push(error);
        }
      }
      try {
        const response = await client.browser.delete({
          dirIds: [createdProfileId],
          isSoftDelete: false,
        });
        assertSuccess(response, "profile-delete");
      } catch (error) {
        cleanupErrors.push(error);
      }
    }
    if (client && createdProxyIds.length > 0) {
      try {
        assertSuccess(await client.proxy.delete({ ids: createdProxyIds }), "proxy-delete");
      } catch (error) {
        cleanupErrors.push(error);
      }
    }
    if (client && createdAccountIds.length > 0) {
      try {
        assertSuccess(await client.account.delete({ ids: createdAccountIds }), "account-delete");
      } catch (error) {
        cleanupErrors.push(error);
      }
    }
    if (workspaceId) {
      try {
        await cleanupByPrefix(workspaceId, runId);
      } catch (error) {
        cleanupErrors.push(error);
      }
    }
  }

  if (cleanupErrors.length > 0) throw new AggregateError(cleanupErrors, "E2E cleanup failed");

  const missingEndpoints = [];
  const missingRequestFields = [];
  const missingResponseFields = [];
  let expectedResponseFieldCount = 0;
  for (const endpoint of spec.endpoints) {
    const entry = coverage.get(endpoint.id);
    if (entry.calls === 0) missingEndpoints.push(endpoint.id);
    for (const path of schemaPaths(endpoint.request?.schema)) {
      if (!entry.requestPaths.has(path)) missingRequestFields.push(`${endpoint.id}:${path}`);
    }
    const responsePaths = schemaPaths(endpoint.response.schema);
    expectedResponseFieldCount += responsePaths.size;
    for (const path of responsePaths) {
      if (!entry.responsePaths.has(path)) missingResponseFields.push(`${endpoint.id}:${path}`);
    }
  }
  assert.deepEqual(missingEndpoints, [], `Untested endpoints: ${missingEndpoints.join(", ")}`);
  assert.deepEqual(
    missingRequestFields,
    [],
    `Uncovered request fields: ${missingRequestFields.join(", ")}`,
  );
  const unexpectedMissingResponseFields = missingResponseFields.filter(
    (path) => !conditionallyAbsentResponseFields.has(path),
  );
  assert.deepEqual(
    unexpectedMissingResponseFields,
    [],
    `Unexpected unmaterialized response fields: ${unexpectedMissingResponseFields.join(", ")}`,
  );
  console.log(
    `PASS coverage audit: ${spec.endpoints.length}/${spec.endpoints.length} endpoints and all request fields`,
  );
  console.log(
    `PASS response audit: ${expectedResponseFieldCount - missingResponseFields.length}/${expectedResponseFieldCount} fields materialized; ${missingResponseFields.length} conditional fields validly absent`,
  );
}

await run();
