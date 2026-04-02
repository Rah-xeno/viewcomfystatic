;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="624e8fb2-0ee7-32c2-d152-c977e459708a")}catch(e){}}();
module.exports=[856482,a=>{"use strict";var b=a.i(522734),c=a.i(983737);async function d(){for(let a of["/etc/machine-id","/var/lib/dbus/machine-id"])try{return(await b.promises.readFile(a,{encoding:"utf8"})).trim()}catch(a){c.diag.debug(`error reading machine id: ${a}`)}}a.s(["getMachineId",()=>d])}];

//# debugId=624e8fb2-0ee7-32c2-d152-c977e459708a
//# sourceMappingURL=0bf35_build_esm_detectors_platform_node_machine-id_getMachineId-linux_3cd80f58.js.map