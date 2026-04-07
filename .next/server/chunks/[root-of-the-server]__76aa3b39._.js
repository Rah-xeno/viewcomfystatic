;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="6a553b78-5da5-9854-a677-8f54fc091e2c")}catch(e){}}();
module.exports=[193695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},918622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},556704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},832319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},324725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},814747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},750227,(e,t,a)=>{t.exports=e.x("node:path",()=>require("node:path"))},925372,(e,t,a)=>{t.exports=e.x("better-sqlite3",()=>require("better-sqlite3"))},762294,e=>{"use strict";var t=e.i(925372);let a=e.i(814747).default.resolve(process.cwd(),"data","viewcomfy.sqlite"),r=new t.default(a);r.pragma("foreign_keys = ON"),e.s(["VIEWCOMFY_DATABASE_PATH",0,a,"db",0,r])},959195,e=>{"use strict";var t=e.i(750227),a=e.i(762294);class r{listAlbums(){return this.ensureAlbumTables(),a.db.prepare(`
            SELECT
                albums.id,
                albums.name,
                albums.created_at AS createdAt,
                (
                    SELECT COUNT(*)
                    FROM assets
                    WHERE assets.album_id = albums.id
                        AND assets.deleted_at IS NULL
                ) AS assetCount,
                (
                    SELECT assets.thumbnail_path
                    FROM assets
                    WHERE assets.album_id = albums.id
                        AND assets.deleted_at IS NULL
                    ORDER BY datetime(assets.created_at) DESC, assets.id DESC
                    LIMIT 1
                ) AS thumbnailPath
            FROM albums
            ORDER BY datetime(albums.created_at) DESC, albums.id DESC
        `).all()}createAlbum(e){this.ensureAlbumTables();let t=e.trim();if(!t)throw Error("作品册名称不能为空");if(t.length>20)throw Error("作品册名称不能超过20个字符");let r=a.db.prepare(`
            INSERT INTO albums (name)
            VALUES (@name)
        `).run({name:t});return a.db.prepare(`
            SELECT
                albums.id,
                albums.name,
                albums.created_at AS createdAt,
                0 AS assetCount,
                NULL AS thumbnailPath
            FROM albums
            WHERE albums.id = @id
            LIMIT 1
        `).get({id:r.lastInsertRowid})}persistGeneratedAssets(e){let{outputFiles:r,promptId:s,oldImagePath:n,metadata:i}=e;if(!i?.mediaType||0===r.length)return;let l=a.db.prepare(`
            INSERT INTO assets (
                title,
                prompt_text,
                oldimg,
                file_name,
                relative_path,
                media_type,
                workflow_type,
                prompt_id,
                thumbnail_path,
                album_id
            ) VALUES (
                @title,
                @prompt_text,
                @oldimg,
                @file_name,
                @relative_path,
                @media_type,
                @workflow_type,
                @prompt_id,
                @thumbnail_path,
                NULL
            )
        `);a.db.transaction(e=>{for(let a of e){let e=a.filename?.trim();if(!e)continue;let r=this.buildRelativePath(a),o="image"===i.mediaType?r:null,d=t.default.parse(e).name||null;l.run({title:d,prompt_text:i.promptText?.trim()||null,oldimg:n||null,file_name:e,relative_path:r,media_type:i.mediaType,workflow_type:"image"===i.mediaType&&i.workflowType||null,prompt_id:s,thumbnail_path:o})}})(r)}buildUniqueAssetTitle(e){let t=e.trim();if(!t)return e;let r=a.db.prepare(`
            SELECT 1
            FROM assets
            WHERE title = @title
                AND deleted_at IS NULL
            LIMIT 1
        `),s=t,n=1;for(;r.get({title:s});)s=`${t}_${n}`,n+=1;return s}listAssets(e){this.ensureAlbumTables();let t=["assets.deleted_at IS NULL"],r={};return e?.albumId==="default"?t.push("assets.album_id IS NULL"):e?.albumId&&/^\d+$/.test(e.albumId)&&(t.push("assets.album_id = @albumId"),r.albumId=Number(e.albumId)),e?.mediaType&&(t.push("assets.media_type = @mediaType"),r.mediaType=e.mediaType),e?.search?.trim()&&(t.push("(COALESCE(assets.title, '') LIKE @search OR COALESCE(assets.prompt_text, '') LIKE @search OR COALESCE(assets.file_name, '') LIKE @search)"),r.search=`%${e.search.trim()}%`),a.db.prepare(`
            SELECT
                id,
                title,
                prompt_text AS promptText,
                oldimg,
                file_name AS fileName,
                relative_path AS relativePath,
                media_type AS mediaType,
                workflow_type AS workflowType,
                prompt_id AS promptId,
                thumbnail_path AS thumbnailPath,
                created_at AS createdAt
            FROM assets
            WHERE ${t.join(" AND ")}
            ORDER BY datetime(created_at) DESC, id DESC
        `).all(r)}moveAssetsToAlbum(e,t){if(this.ensureAlbumTables(),!e.length)return 0;if(null!==t&&!a.db.prepare(`
                SELECT 1
                FROM albums
                WHERE id = @albumId
                LIMIT 1
            `).get({albumId:t}))throw Error("目标作品册不存在");let r=a.db.prepare(`
            UPDATE assets
            SET album_id = @albumId
            WHERE id = @assetId
                AND deleted_at IS NULL
        `);return a.db.transaction(e=>{let a=0;for(let s of e)a+=r.run({assetId:s,albumId:t}).changes;return a})(e)}softDeleteAssets(e){if(this.ensureAlbumTables(),!e.length)return 0;let t=a.db.prepare(`
            UPDATE assets
            SET deleted_at = CURRENT_TIMESTAMP,
                album_id = NULL
            WHERE id = @assetId
                AND deleted_at IS NULL
        `);return a.db.transaction(e=>{let a=0;for(let r of e)a+=t.run({assetId:r}).changes;return a})(e)}buildRelativePath(e){let t=e.filename?.trim()||"",a=e.subfolder?.trim();return a?`${a}/${t}`:t}ensureAlbumTables(){a.db.exec(`
            CREATE TABLE IF NOT EXISTS albums (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                cover_asset_id INTEGER,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `),a.db.prepare("PRAGMA table_info(assets)").all().some(e=>"album_id"===e.name)||a.db.exec(`
                ALTER TABLE assets ADD COLUMN album_id INTEGER;
            `),a.db.exec("CREATE INDEX IF NOT EXISTS idx_assets_album_id ON assets(album_id);")}}e.s(["AssetLibraryService",()=>r])},69843,e=>{"use strict";var t=e.i(747909),a=e.i(174017),r=e.i(996250),s=e.i(759756),n=e.i(561916),i=e.i(114444),l=e.i(837092),o=e.i(869741),d=e.i(316795),u=e.i(487718),p=e.i(995169),m=e.i(47587),c=e.i(666012),E=e.i(570101),b=e.i(626937),h=e.i(10372),R=e.i(193695);e.i(52474);var T=e.i(600220),A=e.i(89171);let _=new(e.i(959195)).AssetLibraryService;async function f(){try{let e=_.listAlbums();return A.NextResponse.json({ok:!0,albums:e})}catch(t){let e=t instanceof Error?t.message:"Unknown album error";return A.NextResponse.json({ok:!1,error:e},{status:500})}}async function x(e){try{let t=await e.json();if("string"!=typeof t.name)return A.NextResponse.json({ok:!1,error:"作品册名称无效"},{status:400});let a=_.createAlbum(t.name);return A.NextResponse.json({ok:!0,album:a},{status:201})}catch(t){let e=t instanceof Error?t.message:"Unknown album error";return A.NextResponse.json({ok:!1,error:e},{status:500})}}e.s(["GET",()=>f,"POST",()=>x],20464);var S=e.i(20464);let N=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/albums/route",pathname:"/api/albums",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/albums/route.ts",nextConfigOutput:"standalone",userland:S}),{workAsyncStorage:v,workUnitAsyncStorage:g,serverHooks:C}=N;function w(){return(0,r.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:g})}async function I(e,t,r){N.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let A="/api/albums/route";A=A.replace(/\/index$/,"")||"/";let _=await N.prepare(e,t,{srcPage:A,multiZoneDraftMode:!1});if(!_)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:f,params:x,nextConfig:S,parsedUrl:v,isDraftMode:g,prerenderManifest:C,routerServerContext:w,isOnDemandRevalidate:I,revalidateOnlyGenerated:y,resolvedPathname:L,clientReferenceManifest:O,serverActionsManifest:U}=_,M=(0,o.normalizeAppPath)(A),P=!!(C.dynamicRoutes[M]||C.routes[L]),D=async()=>((null==w?void 0:w.render404)?await w.render404(e,t,v,!1):t.end("This page could not be found"),null);if(P&&!g){let e=!!C.routes[L],t=C.dynamicRoutes[M];if(t&&!1===t.fallback&&!e){if(S.experimental.adapterPath)return await D();throw new R.NoFallbackError}}let k=null;!P||N.isDev||g||(k="/index"===(k=L)?"/":k);let q=!0===N.isDev||!P,H=P&&!q;U&&O&&(0,i.setReferenceManifestsSingleton)({page:A,clientReferenceManifest:O,serverActionsManifest:U,serverModuleMap:(0,l.createServerModuleMap)({serverActionsManifest:U})});let j=e.method||"GET",F=(0,n.getTracer)(),$=F.getActiveScopeSpan(),K={params:x,prerenderManifest:C,renderOpts:{experimental:{authInterrupts:!!S.experimental.authInterrupts},cacheComponents:!!S.cacheComponents,supportsDynamicResponse:q,incrementalCache:(0,s.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:S.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r)=>N.onRequestError(e,t,r,w)},sharedContext:{buildId:f}},B=new d.NodeNextRequest(e),W=new d.NodeNextResponse(t),G=u.NextRequestAdapter.fromNodeNextRequest(B,(0,u.signalFromNodeResponse)(t));try{let i=async e=>N.handle(G,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=F.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${j} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t)}else e.updateName(`${j} ${A}`)}),l=!!(0,s.getRequestMeta)(e,"minimalMode"),o=async s=>{var n,o;let d=async({previousCacheEntry:a})=>{try{if(!l&&I&&y&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await i(s);e.fetchMetrics=K.renderOpts.fetchMetrics;let o=K.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let d=K.renderOpts.collectedTags;if(!P)return await (0,c.sendResponse)(B,W,n,K.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,E.toNodeOutgoingHttpHeaders)(n.headers);d&&(t[h.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=h.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,r=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=h.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:T.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await N.onRequestError(e,t,{routerKind:"App Router",routePath:A,routeType:"route",revalidateReason:(0,m.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:I})},w),t}},u=await N.handleResponse({req:e,nextConfig:S,cacheKey:k,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:I,revalidateOnlyGenerated:y,responseGenerator:d,waitUntil:r.waitUntil,isMinimalMode:l});if(!P)return null;if((null==u||null==(n=u.value)?void 0:n.kind)!==T.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(o=u.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});l||t.setHeader("x-nextjs-cache",I?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),g&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,E.fromNodeOutgoingHttpHeaders)(u.value.headers);return l&&P||p.delete(h.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,b.getCacheControlHeader)(u.cacheControl)),await (0,c.sendResponse)(B,W,new Response(u.value.body,{headers:p,status:u.value.status||200})),null};$?await o($):await F.withPropagatedContext(e.headers,()=>F.trace(p.BaseServerSpan.handleRequest,{spanName:`${j} ${A}`,kind:n.SpanKind.SERVER,attributes:{"http.method":j,"http.target":e.url}},o))}catch(t){if(t instanceof R.NoFallbackError||await N.onRequestError(e,t,{routerKind:"App Router",routePath:M,routeType:"route",revalidateReason:(0,m.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:I})}),P)throw t;return await (0,c.sendResponse)(B,W,new Response(null,{status:500})),null}}e.s(["handler",()=>I,"patchFetch",()=>w,"routeModule",()=>N,"serverHooks",()=>C,"workAsyncStorage",()=>v,"workUnitAsyncStorage",()=>g],69843)}];

//# debugId=6a553b78-5da5-9854-a677-8f54fc091e2c
//# sourceMappingURL=%5Broot-of-the-server%5D__76aa3b39._.js.map