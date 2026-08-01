import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, test } from "vite-plus/test";

function resolutionValues(markdown) {
  const section = markdown.match(
    /### (?:Appendix-Resolution List|附录-分辨率列表)[\s\S]*?(?=\n### |$)/,
  );
  assert.ok(section, "resolution appendix is missing");
  return section[0].match(/^\d+x\d+$/gm) ?? [];
}

function labeledCatalogEntries(markdown, heading) {
  const start = markdown.indexOf(`### ${heading}`);
  assert.notEqual(start, -1, `${heading} appendix is missing`);
  const block = markdown.slice(start).match(/```Text\n([\s\S]*?)\n```/);
  assert.ok(block, `${heading} appendix text block is missing`);
  return block[1].split("\n").map((line) => {
    const match = line.match(/^(\S+)\s+(.+)$/);
    assert.ok(match, `invalid ${heading} appendix row: ${line}`);
    return { value: match[1], label: match[2] };
  });
}

function plainCatalogValues(markdown, heading) {
  const start = markdown.indexOf(`### ${heading}`);
  assert.notEqual(start, -1, `${heading} appendix is missing`);
  const block = markdown.slice(start).match(/```Text\n([\s\S]*?)\n```/);
  assert.ok(block, `${heading} appendix text block is missing`);
  return block[1].split("\n");
}

function codeExamples(markdown, sectionTitle) {
  const sectionStart = markdown.indexOf(`## ${sectionTitle}`);
  assert.notEqual(sectionStart, -1, `${sectionTitle} section is missing`);
  const appendixStart = markdown.indexOf("\n## ", sectionStart + 4);
  const section = markdown.slice(sectionStart, appendixStart === -1 ? undefined : appendixStart);
  const groups = [];
  for (const groupMatch of section.matchAll(/^### (.+)\{#([^}]+)\}$/gm)) {
    const groupStart = groupMatch.index + groupMatch[0].length;
    const nextGroup = section.indexOf("\n### ", groupStart);
    const groupBody = section.slice(groupStart, nextGroup === -1 ? undefined : nextGroup);
    groups.push({
      title: groupMatch[1],
      anchor: groupMatch[2],
      examples: [...groupBody.matchAll(/^#### (.+)\n\n```([^\n]+)\n([\s\S]*?)\n```$/gm)].map(
        (example) => ({
          title: example[1],
          language: example[2],
          content: example[3],
        }),
      ),
    });
  }
  return groups;
}

describe("API artifact generation", () => {
  test("keeps generated artifacts synchronized with the JSON source", () => {
    const result = execFileSync(
      process.execPath,
      ["scripts/generate-api-artifacts.mjs", "--check"],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    assert.match(result, /Checked 4 API artifacts for 29\/29 endpoints and 4\/4 catalogs/);
  });

  test("tracks the complete canonical API data", () => {
    const spec = JSON.parse(readFileSync("spec/roxy-api.json", "utf8"));
    const generatedEnglish = readFileSync("docs/api-endpoint.md", "utf8");
    const generatedChinese = readFileSync("docs/api-endpoint-zh.md", "utf8");
    const generatedTypes = readFileSync("src/generated/api-types.ts", "utf8");
    const generatedClient = readFileSync("src/generated/roxy-browser-client.ts", "utf8");

    assert.equal(spec.migration.complete, true);
    const localizedCodeExamples = (locale) =>
      spec.document.codeExamples.groups.map((group) => ({
        title: group.title[locale],
        anchor: group.anchor,
        examples: group.examples.map((example) => ({
          title: example.title[locale],
          language: example.language,
          content: example.content[locale],
        })),
      }));
    assert.deepEqual(
      codeExamples(generatedEnglish, spec.document.codeExamples.title.en),
      localizedCodeExamples("en"),
    );
    assert.deepEqual(
      codeExamples(generatedChinese, spec.document.codeExamples.title.zh),
      localizedCodeExamples("zh"),
    );
    assert.equal(spec.migration.expectedCatalogCount, 4);
    assert.deepEqual(spec.sections[0].endpointIds, ["health"]);
    assert.deepEqual(spec.sections[1].endpointIds, [
      "workspace-list",
      "browser-account-list",
      "label-list",
    ]);
    assert.deepEqual(spec.sections[2].endpointIds, [
      "profile-list",
      "profile-detail",
      "profile-create",
      "profile-modify",
      "profile-delete",
      "profile-open",
      "profile-close",
      "profile-randomize-fingerprint",
      "profile-clear-local-cache",
      "profile-clear-server-cache",
      "profile-connection-info",
    ]);
    assert.deepEqual(spec.sections[3].endpointIds, [
      "proxy-detect-channels",
      "proxy-list-legacy",
      "proxy-list-merged",
      "proxy-create",
      "proxy-batch-create",
      "proxy-detect",
      "proxy-modify",
      "proxy-delete",
      "proxy-bought-list",
    ]);
    assert.deepEqual(spec.sections[4].endpointIds, [
      "account-list",
      "account-create",
      "account-batch-create",
      "account-modify",
      "account-delete",
    ]);
    assert.equal(
      spec.endpoints.find((endpoint) => endpoint.id === "proxy-list-legacy").clients.browser,
      null,
    );
    assert.equal(
      spec.endpoints.find((endpoint) => endpoint.id === "proxy-bought-list").clients.browser,
      null,
    );
    assert.equal("platformName" in spec.schemas.RawPlatformAccount.properties, false);
    assert.equal(
      spec.schemas.RawAvailablePlatformAccount.extends.$ref,
      "#/schemas/RawPlatformAccount",
    );
    assert.deepEqual(Object.keys(spec.catalogs), [
      "resolution",
      "language",
      "interfaceLanguage",
      "timeZone",
    ]);
    assert.deepEqual(
      spec.catalogs.resolution.groups.map((group) => group.id),
      ["mobile", "desktop"],
    );
    assert.equal(
      spec.catalogs.resolution.entries.filter((entry) => entry.group === "mobile").length,
      11,
    );
    assert.equal(
      spec.catalogs.resolution.entries.filter((entry) => entry.group === "desktop").length,
      19,
    );
    const canonicalResolutionValues = spec.catalogs.resolution.entries.map((entry) => entry.value);
    assert.deepEqual(resolutionValues(generatedEnglish), canonicalResolutionValues);
    assert.deepEqual(resolutionValues(generatedChinese), canonicalResolutionValues);
    assert.equal(spec.catalogs.language.entries.length, 183);
    assert.equal(new Set(spec.catalogs.language.entries.map((entry) => entry.value)).size, 180);
    assert.deepEqual(
      spec.catalogs.language.entries
        .filter(
          (entry, index, entries) =>
            entries.findIndex((candidate) => candidate.value === entry.value) !== index,
        )
        .map((entry) => entry.value),
      ["pt-PT", "es-ES", "it-IT"],
    );
    const canonicalEnglishLanguages = spec.catalogs.language.entries.map((entry) => ({
      value: entry.value,
      label: entry.label.en,
    }));
    const canonicalChineseLanguages = spec.catalogs.language.entries.map((entry) => ({
      value: entry.value,
      label: entry.label.zh,
    }));
    assert.deepEqual(
      labeledCatalogEntries(generatedEnglish, "Appendix-Language List"),
      canonicalEnglishLanguages,
    );
    assert.deepEqual(
      labeledCatalogEntries(generatedChinese, "附录-语言列表"),
      canonicalChineseLanguages,
    );
    assert.equal(spec.catalogs.interfaceLanguage.entriesRef, "language");
    assert.deepEqual(
      labeledCatalogEntries(generatedEnglish, "Appendix-Interface Language List"),
      canonicalEnglishLanguages,
    );
    assert.deepEqual(
      labeledCatalogEntries(generatedChinese, "附录-界面语言列表"),
      canonicalChineseLanguages,
    );
    assert.equal(spec.schemas.ProfileFingerprintInput.properties.language.catalogRef, "language");
    assert.equal(
      spec.schemas.ProfileFingerprintInput.properties.displayLanguage.catalogRef,
      "interfaceLanguage",
    );
    const canonicalTimeZones = spec.catalogs.timeZone.entries.map((entry) => entry.value);
    assert.equal(canonicalTimeZones.length, 478);
    assert.equal(new Set(canonicalTimeZones).size, 478);
    assert.deepEqual(
      plainCatalogValues(generatedEnglish, "Appendix-Timezone List"),
      canonicalTimeZones,
    );
    assert.deepEqual(plainCatalogValues(generatedChinese, "附录-时区列表"), canonicalTimeZones);
    assert.equal(spec.schemas.ProfileFingerprintInput.properties.timeZone.catalogRef, "timeZone");
    assert.match(generatedEnglish, /GET \/health/);
    assert.match(generatedEnglish, /GET \/browser\/workspace/);
    assert.match(generatedEnglish, /GET \/browser\/account/);
    assert.match(generatedEnglish, /GET \/browser\/label/);
    assert.match(generatedEnglish, /GET \/browser\/list_v3/);
    assert.match(generatedEnglish, /GET \/browser\/detail/);
    assert.match(generatedEnglish, /POST \/browser\/create/);
    assert.match(generatedEnglish, /POST \/browser\/mdf/);
    assert.match(generatedEnglish, /POST \/browser\/delete/);
    assert.match(generatedEnglish, /POST \/browser\/open/);
    assert.match(generatedEnglish, /POST \/browser\/close/);
    assert.match(generatedEnglish, /POST \/browser\/random_env/);
    assert.match(generatedEnglish, /POST \/browser\/clear_local_cache/);
    assert.match(generatedEnglish, /POST \/browser\/clear_server_cache/);
    assert.match(generatedEnglish, /GET \/browser\/connection_info/);
    assert.match(generatedEnglish, /GET \/proxy\/detect_channel/);
    assert.match(generatedEnglish, />GET \/proxy\/list<\/b>/);
    assert.match(generatedEnglish, /Get Merged Proxy List\{#proxy-list-merged\}/);
    assert.match(generatedEnglish, /POST \/proxy\/create/);
    assert.match(generatedEnglish, /POST \/proxy\/batch_create/);
    assert.match(generatedEnglish, /POST \/proxy\/detect/);
    assert.match(generatedEnglish, /POST \/proxy\/modify/);
    assert.match(generatedEnglish, /POST \/proxy\/delete/);
    assert.match(generatedEnglish, /GET \/proxy\/bought_list/);
    assert.match(generatedEnglish, /GET \/account\/list/);
    assert.match(generatedEnglish, /POST \/account\/create/);
    assert.match(generatedEnglish, /POST \/account\/batch_create/);
    assert.match(generatedEnglish, /POST \/account\/modify/);
    assert.match(generatedEnglish, /POST \/account\/delete/);
    assert.match(generatedEnglish, /### Appendix-Resolution List \{#api_relution\}/);
    assert.match(generatedEnglish, /##### Mobile：/);
    assert.match(generatedEnglish, /##### Desktop：/);
    assert.match(generatedChinese, /### 附录-分辨率列表 \{#api_relution\}/);
    assert.match(generatedChinese, /##### 移动端：/);
    assert.match(generatedChinese, /##### 桌面端：/);
    assert.match(generatedEnglish, /### Appendix-Language List \{#api_language\}/);
    assert.match(generatedChinese, /### 附录-语言列表 \{#api_language\}/);
    assert.match(generatedEnglish, /### Appendix-Interface Language List \{#api_dispalylanguage\}/);
    assert.match(generatedChinese, /### 附录-界面语言列表 \{#api_dispalylanguage\}/);
    assert.match(generatedEnglish, /### Appendix-Timezone List \{#api_timezone\}/);
    assert.match(generatedChinese, /### 附录-时区列表 \{#api_timezone\}/);
    assert.match(generatedEnglish, /::: warning Deprecated/);
    assert.match(generatedEnglish, /Use \[`GET \/proxy\/list_merged`\]\(#proxy-list-merged\)/);
    assert.match(generatedEnglish, /Open Browser Profile\{#open-browser\}/);
    assert.match(generatedEnglish, /Required when type is cloud/);
    assert.match(generatedChinese, /type 为 cloud 时必传/);
    assert.match(
      generatedTypes,
      /export type ProfileClearLocalCacheType = "partial" \| "all" \| "cloud"/,
    );
    assert.match(
      generatedTypes,
      /ProfileClearLocalCacheLocalRequest\s*\| ProfileClearLocalCacheCloudRequest/,
    );
    assert.match(generatedTypes, /export interface ProfileClearServerCacheRequest/);
    assert.match(generatedTypes, /export interface ProfileClearServerCacheResponse/);
    assert.match(generatedTypes, /export interface ProfileConnectionInfoRequest/);
    assert.match(generatedTypes, /export interface ProfileConnectionInfoResponse/);
    assert.match(
      generatedTypes,
      /export type ProfileConnectionInfoData = Array<ProfileConnectionInfo>/,
    );
    assert.match(generatedTypes, /export interface ProxyDetectChannel/);
    assert.match(generatedTypes, /export interface ProxyDetectChannelResponse/);
    assert.match(generatedTypes, /export interface ProxyLegacyListRequest/);
    assert.match(generatedTypes, /export interface ProxyLegacyListResponse/);
    assert.match(generatedTypes, /export interface ProxyListMergedRequest/);
    assert.match(generatedTypes, /export interface ProxyListMergedResponse/);
    assert.match(generatedTypes, /export interface ProxyCreateRequest extends ProxyInput/);
    assert.match(generatedTypes, /export interface ProxyCreateResponse/);
    assert.match(generatedTypes, /export interface ProxyBatchItem/);
    assert.match(generatedTypes, /checkChannel\?: string/);
    assert.match(generatedTypes, /export interface ProxyBatchCreateInput/);
    assert.match(
      generatedTypes,
      /export interface ProxyBatchCreateRequest extends ProxyBatchCreateInput/,
    );
    assert.match(generatedTypes, /export interface ProxyBatchCreateResponse/);
    assert.match(generatedTypes, /export interface ProxyDetectRequest/);
    assert.match(generatedTypes, /export interface ProxyDetectResponse/);
    assert.match(generatedTypes, /export type ProxyUpdateInput = ProxyInput/);
    assert.match(generatedTypes, /export interface ProxyModifyRequest extends ProxyInput/);
    assert.match(generatedTypes, /export interface ProxyModifyResponse/);
    assert.match(generatedTypes, /export interface ProxyDeleteRequest/);
    assert.match(generatedTypes, /export interface ProxyDeleteResponse/);
    assert.match(generatedTypes, /export type PurchasedProxyQueryType = 0 \| 1/);
    assert.match(generatedTypes, /export interface PurchasedProxyListRequest/);
    assert.match(generatedTypes, /export interface RawPurchasedProxy/);
    assert.match(generatedTypes, /export interface PurchasedProxyListData/);
    assert.match(generatedTypes, /export interface PurchasedProxyListResponse/);
    assert.match(generatedTypes, /export interface AccountListRequest/);
    assert.match(generatedTypes, /export interface AccountListData/);
    assert.match(generatedTypes, /export interface AccountListResponse/);
    assert.match(
      generatedTypes,
      /export interface RawAvailablePlatformAccount extends RawPlatformAccount/,
    );
    assert.match(generatedTypes, /export interface PlatformAccountListParams/);
    assert.match(generatedTypes, /export interface PlatformAccountListResult/);
    assert.match(generatedTypes, /export interface PlatformAccountInput/);
    assert.match(
      generatedTypes,
      /export interface AccountCreateRequest extends PlatformAccountInput/,
    );
    assert.match(generatedTypes, /export interface AccountCreateData/);
    assert.match(generatedTypes, /export interface AccountCreateResponse/);
    assert.match(generatedTypes, /export interface AccountBatchCreateRequest/);
    assert.match(generatedTypes, /export interface AccountBatchCreateResponse/);
    assert.match(generatedTypes, /export type PlatformAccountUpdateInput = PlatformAccountInput/);
    assert.match(
      generatedTypes,
      /export interface AccountModifyRequest extends PlatformAccountInput/,
    );
    assert.match(generatedTypes, /export interface AccountModifyResponse/);
    assert.match(generatedTypes, /export interface AccountDeleteRequest/);
    assert.match(generatedTypes, /export interface AccountDeleteResponse/);
    assert.match(generatedTypes, /export type ResolutionValue =/);
    assert.match(generatedTypes, /\| "320x569"/);
    assert.match(generatedTypes, /\| "5120x2880";/);
    assert.match(generatedTypes, /language\?: LanguageValue/);
    const languageType = generatedTypes.match(/export type LanguageValue =[\s\S]*?;\n/);
    assert.ok(languageType, "LanguageValue is missing");
    assert.equal(languageType[0].match(/^\s*\| /gm)?.length, 180);
    assert.equal(languageType[0].match(/\| "pt-PT"/g)?.length, 1);
    assert.equal(languageType[0].match(/\| "es-ES"/g)?.length, 1);
    assert.equal(languageType[0].match(/\| "it-IT"/g)?.length, 1);
    assert.match(generatedTypes, /displayLanguage\?: InterfaceLanguageValue/);
    assert.match(generatedTypes, /export type InterfaceLanguageValue = LanguageValue/);
    assert.match(generatedTypes, /timeZone\?: TimeZoneValue/);
    const timeZoneType = generatedTypes.match(/export type TimeZoneValue =[\s\S]*?;\n/);
    assert.ok(timeZoneType, "TimeZoneValue is missing");
    assert.equal(timeZoneType[0].match(/^\s*\| /gm)?.length, 478);
    assert.match(timeZoneType[0], /\| "GMT-01:00 America\/Scoresbysund"/);
    assert.match(timeZoneType[0], /\| "GMT\+14:00 Pacific\/Kiritimati";/);
    assert.match(generatedTypes, /export type ProxyIpType = "IPV4" \| "IPV6"/);
    assert.match(generatedTypes, /export type ProxyProtocol = "HTTP" \| "HTTPS" \| "SOCKS5"/);
    assert.match(generatedTypes, /export interface RawProxy/);
    assert.match(generatedTypes, /export type ProxyDataType = "proxyModule" \| "buyProxy"/);
    assert.match(generatedTypes, /@deprecated Deprecated API surface/);
    assert.match(generatedEnglish, /Migrated 29\/29 endpoints and 4\/4 appendices/);
    assert.match(generatedClient, /class GeneratedWorkspaceDomain/);
    assert.match(generatedClient, /listAvailable/);
    assert.match(generatedClient, /class GeneratedLabelDomain/);
    assert.match(generatedClient, /class GeneratedProfileDomain/);
    assert.match(generatedClient, /class GeneratedProxyDomain/);
    assert.match(generatedClient, /Profile not found/);
    assert.match(generatedClient, /return this\.get\(data\.dirId\)/);
    assert.match(generatedClient, /async update/);
    assert.match(generatedClient, /isSoftDelete: options\.isSoftDelete \?\? true/);
    assert.match(generatedClient, /for \(const dirId of asArray\(dirIds\)\)/);
    assert.match(generatedClient, /removeUndefined/);
    assert.match(generatedClient, /results\[0\]!/);
    assert.match(generatedClient, /async close/);
    assert.match(generatedClient, /this\.api\.browser\.close\(\{ dirId \}\)/);
    assert.match(generatedClient, /async randomizeFingerprint/);
    assert.match(generatedClient, /this\.api\.browser\.randomEnv\(\{ dirId \}\)/);
    assert.match(generatedClient, /async clearLocalCache/);
    assert.match(generatedClient, /type: options\.type \?\? "all"/);
    assert.match(generatedClient, /async clearServerCache/);
    assert.match(generatedClient, /this\.api\.browser\.clearServerCache/);
    assert.match(generatedClient, /async connectionInfo/);
    assert.match(generatedClient, /Array\.isArray\(dirIds\) \? dirIds\.join\(","\) : dirIds/);
    assert.match(generatedClient, /async detectChannels/);
    assert.match(generatedClient, /this\.api\.proxy\.detectChannels\(\)/);
    assert.match(generatedClient, /async create\(input: ProxyInput\): Promise<void>/);
    assert.match(generatedClient, /this\.api\.proxy\.create\(input\)/);
    assert.match(generatedClient, /async createMany\(input: ProxyBatchCreateInput\)/);
    assert.match(generatedClient, /this\.api\.proxy\.batchCreate\(input\)/);
    assert.match(generatedClient, /async detect\(id: number\): Promise<void>/);
    assert.match(generatedClient, /this\.api\.proxy\.detect\(\{ id \}\)/);
    assert.match(generatedClient, /async update\(id: number, input: ProxyUpdateInput\)/);
    assert.match(generatedClient, /this\.api\.proxy\.modify\(\{ \.\.\.input, id \}\)/);
    assert.match(generatedClient, /async delete\(ids: Array<number>\): Promise<void>/);
    assert.match(generatedClient, /this\.api\.proxy\.delete\(\{ ids \}\)/);
    assert.match(generatedClient, /async list\(params: ProxyListParams = \{\}\)/);
    assert.match(
      generatedClient,
      /this\.api\.proxy\.listMerged\(toPageRequestWithFilters\(params\)\)/,
    );
    assert.doesNotMatch(generatedClient, /listLegacy/);
    assert.doesNotMatch(generatedClient, /boughtList/);
    assert.match(
      generatedClient,
      /async list\(params: PlatformAccountListParams = \{\}\): Promise<PlatformAccountListResult>/,
    );
    assert.match(generatedClient, /this\.api\.account\.list\(toPageRequest\(params\)\)/);
    assert.match(generatedClient, /async create\(input: PlatformAccountInput\): Promise<number>/);
    assert.match(generatedClient, /this\.api\.account\.create\(input\)/);
    assert.match(generatedClient, /return data\.platform_id/);
    assert.match(
      generatedClient,
      /async createMany\(inputs: Array<PlatformAccountInput>\): Promise<void>/,
    );
    assert.match(generatedClient, /batchCreate\(\{ accountList: inputs \}\)/);
    assert.match(
      generatedClient,
      /async update\(id: number, input: PlatformAccountUpdateInput\): Promise<void>/,
    );
    assert.match(generatedClient, /account\.modify\(removeUndefined\(\{ \.\.\.input, id \}\)\)/);
    assert.match(generatedClient, /this\.api\.account\.delete\(\{ ids \}\)/);
  });
});
