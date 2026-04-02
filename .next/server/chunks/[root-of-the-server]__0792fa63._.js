;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="ca55b0c8-633b-332b-e4a5-9e496ee37f32")}catch(e){}}();
module.exports=[918622,(e,r,t)=>{r.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},556704,(e,r,t)=>{r.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},832319,(e,r,t)=>{r.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},324725,(e,r,t)=>{r.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},193695,(e,r,t)=>{r.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},814747,(e,r,t)=>{r.exports=e.x("path",()=>require("path"))},666680,(e,r,t)=>{r.exports=e.x("node:crypto",()=>require("node:crypto"))},750227,(e,r,t)=>{r.exports=e.x("node:path",()=>require("node:path"))},925372,(e,r,t)=>{r.exports=e.x("better-sqlite3",()=>require("better-sqlite3"))},762294,e=>{"use strict";var r=e.i(925372);let t=e.i(814747).default.resolve(process.cwd(),"data","viewcomfy.sqlite"),s=new r.default(t);s.pragma("foreign_keys = ON"),e.s(["VIEWCOMFY_DATABASE_PATH",0,t,"db",0,s])},959195,e=>{"use strict";var r=e.i(750227),t=e.i(762294);class s{listAlbums(){return this.ensureAlbumTables(),t.db.prepare(`
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
        `).all()}createAlbum(e){this.ensureAlbumTables();let r=e.trim();if(!r)throw Error("作品册名称不能为空");if(r.length>20)throw Error("作品册名称不能超过20个字符");let s=t.db.prepare(`
            INSERT INTO albums (name)
            VALUES (@name)
        `).run({name:r});return t.db.prepare(`
            SELECT
                albums.id,
                albums.name,
                albums.created_at AS createdAt,
                0 AS assetCount,
                NULL AS thumbnailPath
            FROM albums
            WHERE albums.id = @id
            LIMIT 1
        `).get({id:s.lastInsertRowid})}persistGeneratedAssets(e){let{outputFiles:s,promptId:a,oldImagePath:o,metadata:i}=e;if(!i?.mediaType||0===s.length)return;let n=t.db.prepare(`
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
        `);t.db.transaction(e=>{for(let t of e){let e=t.filename?.trim();if(!e)continue;let s=this.buildRelativePath(t),l="image"===i.mediaType?s:null,d=r.default.parse(e).name||null;n.run({title:d,prompt_text:i.promptText?.trim()||null,oldimg:o||null,file_name:e,relative_path:s,media_type:i.mediaType,workflow_type:"image"===i.mediaType&&i.workflowType||null,prompt_id:a,thumbnail_path:l})}})(s)}buildUniqueAssetTitle(e){let r=e.trim();if(!r)return e;let s=t.db.prepare(`
            SELECT 1
            FROM assets
            WHERE title = @title
                AND deleted_at IS NULL
            LIMIT 1
        `),a=r,o=1;for(;s.get({title:a});)a=`${r}_${o}`,o+=1;return a}listAssets(e){this.ensureAlbumTables();let r=["assets.deleted_at IS NULL"],s={};return e?.albumId==="default"?r.push("assets.album_id IS NULL"):e?.albumId&&/^\d+$/.test(e.albumId)&&(r.push("assets.album_id = @albumId"),s.albumId=Number(e.albumId)),e?.mediaType&&(r.push("assets.media_type = @mediaType"),s.mediaType=e.mediaType),e?.search?.trim()&&(r.push("(COALESCE(assets.title, '') LIKE @search OR COALESCE(assets.prompt_text, '') LIKE @search OR COALESCE(assets.file_name, '') LIKE @search)"),s.search=`%${e.search.trim()}%`),t.db.prepare(`
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
            WHERE ${r.join(" AND ")}
            ORDER BY datetime(created_at) DESC, id DESC
        `).all(s)}moveAssetsToAlbum(e,r){if(this.ensureAlbumTables(),!e.length)return 0;if(null!==r&&!t.db.prepare(`
                SELECT 1
                FROM albums
                WHERE id = @albumId
                LIMIT 1
            `).get({albumId:r}))throw Error("目标作品册不存在");let s=t.db.prepare(`
            UPDATE assets
            SET album_id = @albumId
            WHERE id = @assetId
                AND deleted_at IS NULL
        `);return t.db.transaction(e=>{let t=0;for(let a of e)t+=s.run({assetId:a,albumId:r}).changes;return t})(e)}softDeleteAssets(e){if(this.ensureAlbumTables(),!e.length)return 0;let r=t.db.prepare(`
            UPDATE assets
            SET deleted_at = CURRENT_TIMESTAMP,
                album_id = NULL
            WHERE id = @assetId
                AND deleted_at IS NULL
        `);return t.db.transaction(e=>{let t=0;for(let s of e)t+=r.run({assetId:s}).changes;return t})(e)}buildRelativePath(e){let r=e.filename?.trim()||"",t=e.subfolder?.trim();return t?`${t}/${r}`:r}ensureAlbumTables(){t.db.exec(`
            CREATE TABLE IF NOT EXISTS albums (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                cover_asset_id INTEGER,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `),t.db.prepare("PRAGMA table_info(assets)").all().some(e=>"album_id"===e.name)||t.db.exec(`
                ALTER TABLE assets ADD COLUMN album_id INTEGER;
            `),t.db.exec("CREATE INDEX IF NOT EXISTS idx_assets_album_id ON assets(album_id);")}}e.s(["AssetLibraryService",()=>s])},925017,e=>{"use strict";class r{message;errors;errorType;constructor(e){this.message=e.message,this.errorType=e.errorType,this.errors=e.errors||[]}}class t extends r{constructor(e){super({message:e.message,errorType:"ComfyWorkflowError",errors:e.errors})}}class s extends r{constructor(e){super({message:e.message,errorType:"ComfyError",errors:e.errors})}}class a{errorMsg;errorDetails;errorType;constructor(e){this.errorMsg=e.errorMsg,this.errorDetails=e.error,this.errorType=e.errorType}}class o{getErrorResponse(e){if(e.errorType)return new a({errorMsg:e.message,error:e.errors,errorType:e.errorType});if(e.cause&&e.cause.code)if("ERR_INVALID_URL"===e.cause.code)return new a({errorMsg:e.message,error:"Invalid API Endpoint",errorType:e.cause.code});else return new a({errorMsg:e.message,error:e.cause.message,errorType:e.cause.code});return new a({errorMsg:"Something went wrong",error:e.message,errorType:"UnknownError"})}}var i,n=((i={}).COMFY_WORKFLOW="ComfyWorkflowError",i.COMFY="ComfyError",i.UNKNOWN="UnknownError",i.VIEW_MODE_MISSING_FILES="ViewModeMissingFilesError",i.VIEW_MODE_MISSING_APP_ID="ViewModeMissingAppIdError",i.VIEW_MODE_TIMEOUT="ViewModeTimeoutError",i);e.s(["ComfyError",()=>s,"ComfyWorkflowError",()=>t,"ErrorBase",()=>r,"ErrorResponseFactory",()=>o,"ErrorTypes",()=>n])},588111,e=>{"use strict";class r{isUserManagementEnabled(){return!1}getViewComfyCloudApiUrl(){if(!process.env.VIEWCOMFY_CLOUD_API_URL)throw Error("VIEWCOMFY_CLOUD_API_URL is not set");return process.env.VIEWCOMFY_CLOUD_API_URL}getViewComfyCloudApiClientId(){return process.env.VIEWCOMFY_CLIENT_ID||""}getViewComfyCloudApiClientSecret(){return process.env.VIEWCOMFY_CLIENT_SECRET||""}getApiUrl(){if(!process.env.NEXT_PUBLIC_API_URL)throw Error("NEXT_PUBLIC_API_URL is not set");return process.env.NEXT_PUBLIC_API_URL}getComfyOutputDirectory(){if(!process.env.COMFY_OUTPUT_DIR)throw Error("COMFY_OUTPUT_DIR is not set, you need to use Full paths not relative paths");return process.env.COMFY_OUTPUT_DIR}getComfyOldImageDirectory(){if(!process.env.COMFY_OLDIMG_DIR)throw Error("COMFY_OLDIMG_DIR is not set, you need to use Full paths not relative paths");return process.env.COMFY_OLDIMG_DIR}getIsRunningInViewComfy(){return!!process.env.NEXT_PUBLIC_IS_RUNNING_IN_VIEWCOMFY&&"true"===process.env.NEXT_PUBLIC_IS_RUNNING_IN_VIEWCOMFY}getIsViewMode(){return!1}}e.s(["SettingsService",()=>r])},912714,(e,r,t)=>{r.exports=e.x("node:fs/promises",()=>require("node:fs/promises"))},406329,e=>{"use strict";let r=process.env.VIEW_COMFY_FILE_NAME||"view_comfy.json",t=`The ${r} file is missing from the root of your project, 
or set the VIEW_COMFY_FILE_NAME environment variable to the right path.`;e.s(["ComfyUIConnRefusedError",0,e=>`Cannot connect to ComfyUI using ${e}, make sure that you have a ComfyUI instance running and that the URL is correct 
or you can change the ComfyUI URL in the .env file using the variables COMFYUI_API_URL and if you're using SSL/TLS set COMFYUI_SECURE to true`,"SEED_LIKE_INPUT_VALUES",0,["seed","noise_seed","rand_seed"],"missingViewComfyFileError",0,t,"viewComfyFileName",0,r])}];

//# debugId=ca55b0c8-633b-332b-e4a5-9e496ee37f32
//# sourceMappingURL=%5Broot-of-the-server%5D__0792fa63._.js.map