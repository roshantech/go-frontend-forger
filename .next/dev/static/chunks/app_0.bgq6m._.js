(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/lib/auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AUTH_COOKIE_MAX_AGE",
    ()=>AUTH_COOKIE_MAX_AGE,
    "AUTH_COOKIE_NAME",
    ()=>AUTH_COOKIE_NAME,
    "clearSessionCookieString",
    ()=>clearSessionCookieString,
    "parseSessionCookie",
    ()=>parseSessionCookie,
    "serializeSessionCookie",
    ()=>serializeSessionCookie
]);
const AUTH_COOKIE_NAME = "forgeflow_session";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
function serializeSessionCookie(session) {
    return [
        `${AUTH_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(session))}`,
        `Max-Age=${AUTH_COOKIE_MAX_AGE}`,
        "Path=/",
        "SameSite=Lax"
    ].join("; ");
}
function clearSessionCookieString() {
    return [
        `${AUTH_COOKIE_NAME}=`,
        "Max-Age=0",
        "Path=/",
        "SameSite=Lax"
    ].join("; ");
}
function parseSessionCookie(cookieValue) {
    if (!cookieValue) {
        return null;
    }
    try {
        return JSON.parse(decodeURIComponent(cookieValue));
    } catch  {
        return null;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/workflow.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NODE_LIBRARY",
    ()=>NODE_LIBRARY,
    "TEMPLATE_LIBRARY",
    ()=>TEMPLATE_LIBRARY,
    "cloneDocument",
    ()=>cloneDocument,
    "createDefaultFlow",
    ()=>createDefaultFlow,
    "createNodeData",
    ()=>createNodeData,
    "createWorkflowNode",
    ()=>createWorkflowNode,
    "getTemplate",
    ()=>getTemplate,
    "instantiateTemplate",
    ()=>instantiateTemplate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reactflow$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reactflow/core/dist/esm/index.mjs [app-client] (ecmascript)");
;
const defaultViewport = {
    x: 0,
    y: 0,
    zoom: 0.95
};
const nodeDefinitions = {
    trigger: {
        kind: "trigger",
        label: "Trigger",
        subtitle: "Kicks things off",
        description: "Starts a workflow from a webhook, schedule, or user event.",
        accent: "#f59e0b",
        icon: "TR",
        status: "live"
    },
    input: {
        kind: "input",
        label: "Input",
        subtitle: "Collect data",
        description: "Captures a payload from a form, API, or uploaded file.",
        accent: "#38bdf8",
        icon: "IN",
        status: "ready"
    },
    processor: {
        kind: "processor",
        label: "Processor",
        subtitle: "Transform data",
        description: "Normalizes, enriches, or merges the incoming data model.",
        accent: "#34d399",
        icon: "PR",
        status: "ready"
    },
    condition: {
        kind: "condition",
        label: "Condition",
        subtitle: "Route decisions",
        description: "Branches the graph based on rules, confidence, or thresholds.",
        accent: "#fb7185",
        icon: "IF",
        status: "draft"
    },
    action: {
        kind: "action",
        label: "Action",
        subtitle: "Do the work",
        description: "Invokes a side effect such as sending, writing, or posting.",
        accent: "#818cf8",
        icon: "AC",
        status: "ready"
    },
    output: {
        kind: "output",
        label: "Output",
        subtitle: "Finalize result",
        description: "Ships the final artifact to a dashboard, inbox, or destination.",
        accent: "#a78bfa",
        icon: "OU",
        status: "live"
    }
};
const defaultConfig = {
    trigger: {
        source: "Webhook",
        cadence: "Realtime"
    },
    input: {
        schema: "Lead form",
        validation: "Strict"
    },
    processor: {
        transform: "Normalize payload",
        retries: "2"
    },
    condition: {
        rule: "score >= 70",
        fallback: "manual-review"
    },
    action: {
        destination: "CRM",
        owner: "Growth Ops"
    },
    output: {
        target: "Ops dashboard",
        format: "JSON"
    }
};
function createId(prefix) {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
    }
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
function templateNode(id, kind, offset, overrides) {
    return {
        id,
        kind,
        offset,
        overrides
    };
}
function templateEdge(source, target, label, animated) {
    return {
        source,
        target,
        label,
        animated
    };
}
const NODE_LIBRARY = Object.keys(nodeDefinitions).map(_c = (kind)=>({
        kind,
        label: nodeDefinitions[kind].label,
        blurb: nodeDefinitions[kind].description,
        accent: nodeDefinitions[kind].accent,
        icon: nodeDefinitions[kind].icon
    }));
_c1 = NODE_LIBRARY;
const TEMPLATE_LIBRARY = [
    {
        id: "lead-intake",
        name: "Lead Intake",
        description: "Qualify inbound leads and route them to the right follow-up lane.",
        category: "Growth",
        nodes: [
            templateNode("start", "trigger", {
                x: 0,
                y: 60
            }, {
                label: "Lead created"
            }),
            templateNode("form", "input", {
                x: 260,
                y: 60
            }, {
                label: "Capture profile"
            }),
            templateNode("score", "processor", {
                x: 540,
                y: 60
            }, {
                label: "Score fit"
            }),
            templateNode("branch", "condition", {
                x: 840,
                y: 60
            }, {
                label: "Hot lead?"
            }),
            templateNode("crm", "action", {
                x: 1140,
                y: -40
            }, {
                label: "Create CRM task"
            }),
            templateNode("handoff", "output", {
                x: 1420,
                y: -40
            }, {
                label: "Notify AE"
            }),
            templateNode("nurture", "action", {
                x: 1140,
                y: 170
            }, {
                label: "Enroll nurture"
            })
        ],
        edges: [
            templateEdge("start", "form"),
            templateEdge("form", "score"),
            templateEdge("score", "branch"),
            templateEdge("branch", "crm", "Yes", true),
            templateEdge("crm", "handoff"),
            templateEdge("branch", "nurture", "No")
        ]
    },
    {
        id: "support-triage",
        name: "Support Triage",
        description: "Sort urgent issues from general requests and keep handoffs visible.",
        category: "Operations",
        nodes: [
            templateNode("ticket", "trigger", {
                x: 0,
                y: 80
            }, {
                label: "Ticket opened"
            }),
            templateNode("context", "input", {
                x: 250,
                y: 80
            }, {
                label: "Collect metadata"
            }),
            templateNode("classify", "processor", {
                x: 520,
                y: 80
            }, {
                label: "Classify intent"
            }),
            templateNode("priority", "condition", {
                x: 810,
                y: 80
            }, {
                label: "Urgent?"
            }),
            templateNode("page", "action", {
                x: 1090,
                y: -20
            }, {
                label: "Page on-call"
            }),
            templateNode("queue", "action", {
                x: 1090,
                y: 170
            }, {
                label: "Assign queue"
            }),
            templateNode("closeout", "output", {
                x: 1360,
                y: 80
            }, {
                label: "Status synced"
            })
        ],
        edges: [
            templateEdge("ticket", "context"),
            templateEdge("context", "classify"),
            templateEdge("classify", "priority"),
            templateEdge("priority", "page", "Escalate", true),
            templateEdge("priority", "queue", "Standard"),
            templateEdge("page", "closeout"),
            templateEdge("queue", "closeout")
        ]
    },
    {
        id: "content-approval",
        name: "Content Approval",
        description: "Review creative, branch on approval, then publish on schedule.",
        category: "Marketing",
        nodes: [
            templateNode("brief", "trigger", {
                x: 0,
                y: 60
            }, {
                label: "Brief submitted"
            }),
            templateNode("draft", "input", {
                x: 240,
                y: 60
            }, {
                label: "Draft asset"
            }),
            templateNode("qa", "processor", {
                x: 500,
                y: 60
            }, {
                label: "Check brand rules"
            }),
            templateNode("approval", "condition", {
                x: 780,
                y: 60
            }, {
                label: "Approved?"
            }),
            templateNode("publish", "action", {
                x: 1060,
                y: -20
            }, {
                label: "Schedule publish"
            }),
            templateNode("revise", "action", {
                x: 1060,
                y: 165
            }, {
                label: "Request revisions"
            }),
            templateNode("archive", "output", {
                x: 1340,
                y: 60
            }, {
                label: "Update archive"
            })
        ],
        edges: [
            templateEdge("brief", "draft"),
            templateEdge("draft", "qa"),
            templateEdge("qa", "approval"),
            templateEdge("approval", "publish", "Yes", true),
            templateEdge("approval", "revise", "No"),
            templateEdge("publish", "archive"),
            templateEdge("revise", "archive")
        ]
    }
];
function createNodeData(kind, overrides) {
    const definition = nodeDefinitions[kind];
    return {
        ...definition,
        notes: overrides?.notes ?? "Keep this node opinionated: compact defaults, clear output, low-friction edits.",
        config: {
            ...defaultConfig[kind],
            ...overrides?.config
        },
        ...overrides,
        kind
    };
}
function createWorkflowNode(kind, position, overrides) {
    return {
        id: createId(kind),
        type: "blueprint",
        position,
        data: createNodeData(kind, overrides)
    };
}
function instantiateTemplate(templateId, position) {
    const template = TEMPLATE_LIBRARY.find((item)=>item.id === templateId);
    if (!template) {
        return {
            nodes: [],
            edges: []
        };
    }
    const idMap = new Map();
    const nodes = template.nodes.map((node)=>{
        const nextId = createId(node.kind);
        idMap.set(node.id, nextId);
        return {
            id: nextId,
            type: "blueprint",
            position: {
                x: position.x + node.offset.x,
                y: position.y + node.offset.y
            },
            data: createNodeData(node.kind, node.overrides)
        };
    });
    const edges = template.edges.map((edge)=>({
            id: createId("edge"),
            source: idMap.get(edge.source) ?? edge.source,
            target: idMap.get(edge.target) ?? edge.target,
            label: edge.label,
            animated: edge.animated ?? false,
            type: "smoothstep",
            markerEnd: {
                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reactflow$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MarkerType"].ArrowClosed
            }
        }));
    return {
        nodes,
        edges
    };
}
function createDefaultFlow(name = "Blueprint Workspace") {
    const { nodes, edges } = instantiateTemplate("lead-intake", {
        x: 80,
        y: 80
    });
    return {
        name,
        updatedAt: new Date().toISOString(),
        saveMode: "seed",
        nodes,
        edges,
        viewport: defaultViewport
    };
}
function getTemplate(templateId) {
    return TEMPLATE_LIBRARY.find((item)=>item.id === templateId) ?? null;
}
function cloneDocument(document) {
    return structuredClone(document);
}
var _c, _c1;
__turbopack_context__.k.register(_c, "NODE_LIBRARY$(\n  Object.keys(nodeDefinitions) as WorkflowNodeKind[]\n).map");
__turbopack_context__.k.register(_c1, "NODE_LIBRARY");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSession",
    ()=>getSession,
    "loadFlow",
    ()=>loadFlow,
    "login",
    ()=>login,
    "logout",
    ()=>logout,
    "saveFlow",
    ()=>saveFlow,
    "signup",
    ()=>signup
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$workflow$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/workflow.ts [app-client] (ecmascript)");
"use client";
;
;
const USERS_STORAGE_KEY = "forgeflow_users";
const SESSION_STORAGE_KEY = "forgeflow_auth";
const FLOW_STORAGE_PREFIX = "forgeflow_flow_";
const seededUsers = [
    {
        id: "user-demo",
        name: "Blueprint Demo",
        email: "demo@forgeflow.local",
        password: "Demo123!",
        createdAt: "2026-03-23T00:00:00.000Z"
    }
];
function wait(ms = 250) {
    return new Promise((resolve)=>{
        window.setTimeout(resolve, ms);
    });
}
function readJSON(key, fallback) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const raw = window.localStorage.getItem(key);
    if (!raw) {
        return fallback;
    }
    try {
        return JSON.parse(raw);
    } catch  {
        return fallback;
    }
}
function writeJSON(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
}
function getFlowStorageKey(userId) {
    return `${FLOW_STORAGE_PREFIX}${userId}`;
}
function normalizeSession(session) {
    writeJSON(SESSION_STORAGE_KEY, session);
    document.cookie = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serializeSessionCookie"])(session);
    return session;
}
function clearStoredSession() {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    document.cookie = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearSessionCookieString"])();
}
function readUsers() {
    const users = readJSON(USERS_STORAGE_KEY, seededUsers);
    if (users.length === 0) {
        writeJSON(USERS_STORAGE_KEY, seededUsers);
        return seededUsers;
    }
    if (users === seededUsers) {
        writeJSON(USERS_STORAGE_KEY, seededUsers);
    }
    return users;
}
function writeUsers(users) {
    writeJSON(USERS_STORAGE_KEY, users);
}
function getCookieValue(name) {
    const raw = document.cookie.split("; ").find((part)=>part.startsWith(`${name}=`));
    return raw ? raw.slice(name.length + 1) : null;
}
function toSession(user) {
    return {
        token: `token-${user.id}`,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    };
}
async function getSession() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    await wait(100);
    const storedSession = readJSON(SESSION_STORAGE_KEY, null);
    if (storedSession) {
        return storedSession;
    }
    const cookieSession = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseSessionCookie"])(getCookieValue(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AUTH_COOKIE_NAME"]));
    if (cookieSession) {
        writeJSON(SESSION_STORAGE_KEY, cookieSession);
    }
    return cookieSession;
}
async function signup(payload) {
    await wait();
    const users = readUsers();
    const email = payload.email.trim().toLowerCase();
    if (payload.name.trim().length < 2) {
        throw new Error("Name should be at least 2 characters.");
    }
    if (payload.password.trim().length < 6) {
        throw new Error("Password should be at least 6 characters.");
    }
    if (users.some((user)=>user.email.toLowerCase() === email)) {
        throw new Error("An account with that email already exists.");
    }
    const user = {
        id: `user-${Math.random().toString(36).slice(2, 10)}`,
        name: payload.name.trim(),
        email,
        password: payload.password,
        createdAt: new Date().toISOString()
    };
    writeUsers([
        ...users,
        user
    ]);
    const starterFlow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$workflow$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createDefaultFlow"])(`${user.name.split(" ")[0]}'s Workflow`);
    writeJSON(getFlowStorageKey(user.id), starterFlow);
    return normalizeSession(toSession(user));
}
async function login(payload) {
    await wait();
    const email = payload.email.trim().toLowerCase();
    const user = readUsers().find((entry)=>entry.email.toLowerCase() === email && entry.password === payload.password);
    if (!user) {
        throw new Error("Invalid email or password.");
    }
    return normalizeSession(toSession(user));
}
async function logout() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    await wait(100);
    clearStoredSession();
}
async function loadFlow(userId) {
    await wait(180);
    const existing = readJSON(getFlowStorageKey(userId), null);
    if (existing) {
        return existing;
    }
    const user = readUsers().find((entry)=>entry.id === userId);
    const seeded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$workflow$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createDefaultFlow"])(user ? `${user.name.split(" ")[0]}'s Workflow` : "Blueprint Workspace");
    writeJSON(getFlowStorageKey(userId), seeded);
    return seeded;
}
async function saveFlow({ userId, document: document1, mode }) {
    await wait(mode === "manual" ? 240 : 120);
    const nextDocument = {
        ...document1,
        updatedAt: new Date().toISOString(),
        saveMode: mode
    };
    writeJSON(getFlowStorageKey(userId), nextDocument);
    return nextDocument;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/context/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function AuthProvider({ children }) {
    _s();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const sessionQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "auth",
            "session"
        ],
        queryFn: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSession"],
        initialData: null
    });
    const loginMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["login"],
        onSuccess: {
            "AuthProvider.useMutation[loginMutation]": (session)=>{
                queryClient.setQueryData([
                    "auth",
                    "session"
                ], session);
            }
        }["AuthProvider.useMutation[loginMutation]"]
    });
    const signupMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signup"],
        onSuccess: {
            "AuthProvider.useMutation[signupMutation]": (session)=>{
                queryClient.setQueryData([
                    "auth",
                    "session"
                ], session);
            }
        }["AuthProvider.useMutation[signupMutation]"]
    });
    const logoutMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logout"],
        onSuccess: {
            "AuthProvider.useMutation[logoutMutation]": ()=>{
                queryClient.setQueryData([
                    "auth",
                    "session"
                ], null);
            }
        }["AuthProvider.useMutation[logoutMutation]"]
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            function handleStorageSync(event) {
                if (event.key === "forgeflow_auth" || event.key === null) {
                    queryClient.invalidateQueries({
                        queryKey: [
                            "auth",
                            "session"
                        ]
                    });
                }
            }
            window.addEventListener("storage", handleStorageSync);
            return ({
                "AuthProvider.useEffect": ()=>{
                    window.removeEventListener("storage", handleStorageSync);
                }
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], [
        queryClient
    ]);
    const value = {
        session: sessionQuery.data,
        isAuthenticated: Boolean(sessionQuery.data),
        isLoading: sessionQuery.isFetching,
        login: loginMutation.mutateAsync,
        signup: signupMutation.mutateAsync,
        logout: async ()=>{
            await logoutMutation.mutateAsync();
        },
        isLoggingIn: loginMutation.isPending,
        isSigningUp: signupMutation.isPending,
        isLoggingOut: logoutMutation.isPending
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/app/context/AuthContext.tsx",
        lineNumber: 94,
        columnNumber: 10
    }, this);
}
_s(AuthProvider, "PxAjbIiyVLnCkrYUJp8BoMjWWkk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/AuthContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function Providers({ children }) {
    _s();
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Providers.useState": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClient"]({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5,
                        refetchOnWindowFocus: false
                    },
                    mutations: {
                        retry: 0
                    }
                }
            })
    }["Providers.useState"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
            children: children
        }, void 0, false, {
            fileName: "[project]/app/providers.tsx",
            lineNumber: 30,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/providers.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
_s(Providers, "iWxBLoQ5JY2lgmIJk3m+OCQxarU=");
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_0.bgq6m._.js.map