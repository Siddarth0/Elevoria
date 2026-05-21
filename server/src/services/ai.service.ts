import { Type } from "@google/genai";
import { gemini } from "@/config/gemini";
import { prisma } from "@/lib/prisma";

const MODEL = "gemini-2.5-flash";

/* ---------- shared types ---------- */

export type AiContext = {
  workspaceId: string;
  boardId?: string;
  taskId?: string;
  refinement?: string;
};

export type Scope =
  | { type: "task"; label: string; data: TaskSubject }
  | { type: "board"; label: string; data: BoardSubject }
  | { type: "workspace"; label: string; data: WorkspaceSubject }
  | { type: "text"; label: string; data: { text: string } };

type TaskSubject = {
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: string | null;
  creator: string;
  board: string;
  workspace: string;
  comments: { author: string; text: string; at: string }[];
};

type BoardSubject = {
  board: string;
  workspace: string;
  taskCount: number;
  tasks: {
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: string | null;
    assignee: string | null;
  }[];
};

type WorkspaceSubject = {
  workspace: string;
  memberCount: number;
  members: { name: string; role: string }[];
  boards: {
    name: string;
    tasks: {
      title: string;
      status: string;
      priority: string;
      dueDate: string | null;
    }[];
  }[];
};

export type SummarizeResult = {
  scope: Scope["type"];
  title: string;
  summary: string;
  highlights: string[];
  unavailable?: boolean;
};

export type SubtasksResult = {
  scope: Scope["type"];
  items: { taskTitle: string; subtasks: string[] }[];
  unavailable?: boolean;
};

export type DeadlineResult = {
  scope: Scope["type"];
  items: { taskTitle: string; suggestedDate: string; reason: string }[];
  unavailable?: boolean;
};

/* ---------- scope loaders ---------- */

const TASK_DESC_CAP = 1000;
const BOARD_TASK_DESC_CAP = 240;
const BOARD_TASK_CAP = 60;
const WS_BOARD_TASK_CAP = 20;
const WS_MEMBER_CAP = 30;
const COMMENT_CAP = 5;
const COMMENT_TEXT_CAP = 280;

const isoDay = (d: Date | null | undefined) =>
  d ? d.toISOString().slice(0, 10) : null;

async function loadTaskScope(taskId: string): Promise<Scope | null> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      board: {
        select: {
          name: true,
          workspace: { select: { name: true } },
        },
      },
      assignee: { select: { fullName: true } },
      creator: { select: { fullName: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        take: COMMENT_CAP,
        include: { user: { select: { fullName: true } } },
      },
    },
  });
  if (!task) return null;

  return {
    type: "task",
    label: task.title,
    data: {
      title: task.title,
      description: task.description ? task.description.slice(0, TASK_DESC_CAP) : null,
      status: task.status,
      priority: task.priority,
      dueDate: isoDay(task.dueDate),
      assignee: task.assignee?.fullName ?? null,
      creator: task.creator.fullName,
      board: task.board.name,
      workspace: task.board.workspace.name,
      comments: task.comments.map((c) => ({
        author: c.user.fullName,
        text: c.content.slice(0, COMMENT_TEXT_CAP),
        at: isoDay(c.createdAt) ?? "",
      })),
    },
  };
}

async function loadBoardScope(boardId: string): Promise<Scope | null> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      workspace: { select: { name: true } },
      tasks: {
        take: BOARD_TASK_CAP,
        orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
        include: { assignee: { select: { fullName: true } } },
      },
    },
  });
  if (!board) return null;

  return {
    type: "board",
    label: board.name,
    data: {
      board: board.name,
      workspace: board.workspace.name,
      taskCount: board.tasks.length,
      tasks: board.tasks.map((t) => ({
        title: t.title,
        description: t.description ? t.description.slice(0, BOARD_TASK_DESC_CAP) : null,
        status: t.status,
        priority: t.priority,
        dueDate: isoDay(t.dueDate),
        assignee: t.assignee?.fullName ?? null,
      })),
    },
  };
}

async function loadWorkspaceScope(workspaceId: string): Promise<Scope | null> {
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        take: WS_MEMBER_CAP,
        include: { user: { select: { fullName: true } } },
      },
      boards: {
        include: {
          tasks: {
            take: WS_BOARD_TASK_CAP,
            orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
          },
        },
      },
    },
  });
  if (!ws) return null;

  return {
    type: "workspace",
    label: ws.name,
    data: {
      workspace: ws.name,
      memberCount: ws.members.length,
      members: ws.members.map((m) => ({
        name: m.user.fullName,
        role: m.role,
      })),
      boards: ws.boards.map((b) => ({
        name: b.name,
        tasks: b.tasks.map((t) => ({
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: isoDay(t.dueDate),
        })),
      })),
    },
  };
}

/**
 * Resolve the subject of the AI call.
 * Priority: taskId  ->  boardId  ->  user text  ->  workspace.
 */
export async function resolveScope(ctx: AiContext): Promise<Scope> {
  if (ctx.taskId) {
    const s = await loadTaskScope(ctx.taskId);
    if (s) return s;
  }

  if (ctx.boardId) {
    const s = await loadBoardScope(ctx.boardId);
    if (s) return s;
  }

  const text = ctx.refinement?.trim();
  if (text && text.length > 0) {
    return { type: "text", label: "user input", data: { text } };
  }

  const s = await loadWorkspaceScope(ctx.workspaceId);
  if (s) return s;

  return { type: "text", label: "empty", data: { text: "" } };
}

/* ---------- prompt + JSON helpers ---------- */

const COMMON_RULES = [
  "You are an assistant inside a project-management app.",
  "Only respond with valid JSON matching the schema. No markdown fences, no preamble, no apology.",
  "Be concrete and specific to the given subject. Do not invent tasks, people, or dates that are not implied by the data.",
  "Use plain text in JSON strings (no Markdown).",
].join(" ");

const todayIso = () => new Date().toISOString().slice(0, 10);

function buildScopeBlock(scope: Scope) {
  return `SCOPE: ${scope.type}\nSUBJECT_LABEL: ${scope.label}\nSUBJECT_DATA (JSON):\n${JSON.stringify(scope.data, null, 2)}`;
}

function buildRefinementBlock(refinement?: string, scopeType?: Scope["type"]) {
  const text = refinement?.trim();
  if (!text) return "";
  if (scopeType === "text") return "";
  return `\nUSER_REFINEMENT (treat as extra focus, do not invent beyond the subject):\n"${text}"`;
}

async function callJsonModel<T>(prompt: string, schema: object): Promise<T | null> {
  try {
    const res = await gemini.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema as never,
        temperature: 0.4,
      },
    });

    const text = res.text;
    if (!text) return null;

    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/* ---------- response schemas ---------- */

const SUMMARIZE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    summary: { type: Type.STRING },
    highlights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["title", "summary", "highlights"],
  propertyOrdering: ["title", "summary", "highlights"],
};

const SUBTASKS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          taskTitle: { type: Type.STRING },
          subtasks: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["taskTitle", "subtasks"],
        propertyOrdering: ["taskTitle", "subtasks"],
      },
    },
  },
  required: ["items"],
};

const DEADLINE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          taskTitle: { type: Type.STRING },
          suggestedDate: { type: Type.STRING },
          reason: { type: Type.STRING },
        },
        required: ["taskTitle", "suggestedDate", "reason"],
        propertyOrdering: ["taskTitle", "suggestedDate", "reason"],
      },
    },
  },
  required: ["items"],
};

/* ---------- AI history helper ---------- */

async function recordHistory(
  userId: string,
  workspaceId: string | undefined,
  prompt: string,
  responseObj: unknown,
) {
  try {
    await prisma.aIHistory.create({
      data: {
        prompt: prompt.slice(0, 4000),
        response: JSON.stringify(responseObj).slice(0, 4000),
        userId,
        workspaceId: workspaceId ?? null,
      },
    });
  } catch {
    // history is best-effort
  }
}

const FALLBACK_MESSAGE =
  "AI quota reached or provider unavailable. Please try again later.";

/* ---------- tool: summarize ---------- */

export async function generateSummaryService(
  ctx: AiContext,
  userId: string,
): Promise<SummarizeResult> {
  const scope = await resolveScope(ctx);

  const instruction = (() => {
    switch (scope.type) {
      case "task":
        return "Summarize this single task: what it's about, current state, and any blockers visible in the comments. Highlights should call out status, blockers, and notable comments.";
      case "board":
        return "Summarize the current state of this board across its columns. Call out workload by status, in-progress focus, blockers, and anything overdue. Highlights are 3-6 concrete observations rooted in the data.";
      case "workspace":
        return "Summarize the workspace's overall project state across boards. Call out where energy is concentrated, what's stuck, and what's coming. Highlights are 3-6 concrete observations rooted in the data.";
      case "text":
        return "Summarize the user's pasted text into concise project notes. Highlights are 3-6 short actionable bullets pulled directly from the text.";
    }
  })();

  const prompt = [
    COMMON_RULES,
    "",
    "TASK: Produce a JSON summary of the subject below.",
    `Today is ${todayIso()}.`,
    instruction,
    "",
    buildScopeBlock(scope),
    buildRefinementBlock(ctx.refinement, scope.type),
    "",
    'Output JSON with keys: "title" (short, name of the thing summarized), "summary" (2-3 tight sentences), "highlights" (array of 3-6 short strings).',
  ]
    .filter(Boolean)
    .join("\n");

  const parsed = await callJsonModel<{
    title: string;
    summary: string;
    highlights: string[];
  }>(prompt, SUMMARIZE_SCHEMA);

  const result: SummarizeResult = parsed
    ? {
        scope: scope.type,
        title: parsed.title?.trim() || scope.label,
        summary: parsed.summary?.trim() || "",
        highlights: Array.isArray(parsed.highlights)
          ? parsed.highlights.filter((s) => typeof s === "string" && s.trim()).slice(0, 8)
          : [],
      }
    : {
        scope: scope.type,
        title: scope.label,
        summary: FALLBACK_MESSAGE,
        highlights: [],
        unavailable: true,
      };

  await recordHistory(userId, ctx.workspaceId, prompt, result);
  return result;
}

/* ---------- tool: subtasks ---------- */

function pickSubtaskCandidates(scope: Scope): string[] {
  if (scope.type === "task") return [scope.data.title];
  if (scope.type === "text") return [scope.data.text.slice(0, 120) || "User input"];

  if (scope.type === "board") {
    const open = scope.data.tasks.filter(
      (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
    );
    const pool = open.length > 0 ? open : scope.data.tasks;
    return pool.slice(0, 5).map((t) => t.title);
  }

  // workspace
  const flat = scope.data.boards.flatMap((b) =>
    b.tasks
      .filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS")
      .map((t) => t.title),
  );
  return flat.slice(0, 5);
}

export async function generateSubtasksService(
  ctx: AiContext,
  userId: string,
): Promise<SubtasksResult> {
  const scope = await resolveScope(ctx);
  const candidates = pickSubtaskCandidates(scope);

  if (candidates.length === 0) {
    return {
      scope: scope.type,
      items: [],
    };
  }

  const instruction = (() => {
    switch (scope.type) {
      case "task":
        return "Break this one task into 4-7 concrete subtasks. Each subtask is a short imperative phrase (start with a verb).";
      case "text":
        return "Treat the user's text as a new task description. Produce 4-7 concrete subtasks. Each subtask is a short imperative phrase (start with a verb).";
      case "board":
        return `For each of these board tasks (up to 5 highest priority TODO/IN_PROGRESS): produce 3-5 concrete subtasks. Only return tasks listed below.`;
      case "workspace":
        return `For up to 5 highest-priority open tasks across the workspace: produce 3-5 concrete subtasks each. Only return tasks listed below.`;
    }
  })();

  const candidateBlock =
    scope.type === "board" || scope.type === "workspace"
      ? `\nTARGET_TASKS:\n${candidates.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
      : "";

  const prompt = [
    COMMON_RULES,
    "",
    "TASK: Produce JSON subtasks for the target(s) below.",
    instruction,
    "",
    buildScopeBlock(scope),
    candidateBlock,
    buildRefinementBlock(ctx.refinement, scope.type),
    "",
    'Output JSON shaped: { "items": [{ "taskTitle": string, "subtasks": [string, ...] }, ...] }. For task or text scope return exactly one item. For board/workspace return one item per target task.',
  ]
    .filter(Boolean)
    .join("\n");

  const parsed = await callJsonModel<{
    items: { taskTitle: string; subtasks: string[] }[];
  }>(prompt, SUBTASKS_SCHEMA);

  const result: SubtasksResult = parsed
    ? {
        scope: scope.type,
        items: (parsed.items ?? [])
          .filter((it) => it && Array.isArray(it.subtasks))
          .slice(0, 6)
          .map((it) => ({
            taskTitle: (it.taskTitle ?? "").trim() || "Task",
            subtasks: it.subtasks
              .filter((s) => typeof s === "string" && s.trim())
              .slice(0, 8),
          })),
      }
    : {
        scope: scope.type,
        items: [],
        unavailable: true,
      };

  await recordHistory(userId, ctx.workspaceId, prompt, result);
  return result;
}

/* ---------- tool: deadline ---------- */

function pickDeadlineCandidates(scope: Scope): { title: string; current?: string | null }[] {
  if (scope.type === "task") {
    return [{ title: scope.data.title, current: scope.data.dueDate }];
  }
  if (scope.type === "text") {
    return [{ title: scope.data.text.slice(0, 120) || "User input" }];
  }

  if (scope.type === "board") {
    const undated = scope.data.tasks.filter((t) => !t.dueDate && t.status !== "COMPLETED");
    const pool = undated.length > 0 ? undated : scope.data.tasks.filter((t) => t.status !== "COMPLETED");
    return pool.slice(0, 5).map((t) => ({ title: t.title, current: t.dueDate }));
  }

  const flat = scope.data.boards.flatMap((b) =>
    b.tasks
      .filter((t) => !t.dueDate && t.status !== "COMPLETED")
      .map((t) => ({ title: t.title, current: t.dueDate })),
  );
  return flat.slice(0, 5);
}

export async function generateDeadlineService(
  ctx: AiContext,
  userId: string,
): Promise<DeadlineResult> {
  const scope = await resolveScope(ctx);
  const candidates = pickDeadlineCandidates(scope);

  if (candidates.length === 0) {
    return {
      scope: scope.type,
      items: [],
    };
  }

  const instruction = (() => {
    switch (scope.type) {
      case "task":
        return "Suggest a realistic deadline for this one task based on its description, priority and comments. Return a single ISO date (YYYY-MM-DD) in the future.";
      case "text":
        return "Treat the user's text as a new task. Suggest a realistic deadline (ISO date, YYYY-MM-DD, future) and a one-sentence reason.";
      case "board":
        return "For each task listed below that lacks a deadline, suggest a realistic ISO date (YYYY-MM-DD), assuming standard workload. Stagger dates sensibly across the list.";
      case "workspace":
        return "For each task listed below that lacks a deadline, suggest a realistic ISO date (YYYY-MM-DD), assuming standard workload. Stagger dates sensibly across the list.";
    }
  })();

  const candidateBlock = `\nTARGET_TASKS (only return entries for these):\n${candidates
    .map(
      (c, i) =>
        `${i + 1}. ${c.title}${c.current ? ` (current due: ${c.current})` : ""}`,
    )
    .join("\n")}`;

  const prompt = [
    COMMON_RULES,
    "",
    `Today is ${todayIso()}. Suggested dates MUST be on or after today.`,
    instruction,
    "",
    buildScopeBlock(scope),
    candidateBlock,
    buildRefinementBlock(ctx.refinement, scope.type),
    "",
    'Output JSON shaped: { "items": [{ "taskTitle": string, "suggestedDate": "YYYY-MM-DD", "reason": "one short sentence" }, ...] }. Use ISO dates only.',
  ]
    .filter(Boolean)
    .join("\n");

  const parsed = await callJsonModel<{
    items: { taskTitle: string; suggestedDate: string; reason: string }[];
  }>(prompt, DEADLINE_SCHEMA);

  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;

  const result: DeadlineResult = parsed
    ? {
        scope: scope.type,
        items: (parsed.items ?? [])
          .filter((it) => it && isoPattern.test(it.suggestedDate))
          .slice(0, 6)
          .map((it) => ({
            taskTitle: (it.taskTitle ?? "").trim() || "Task",
            suggestedDate: it.suggestedDate,
            reason: (it.reason ?? "").trim(),
          })),
      }
    : {
        scope: scope.type,
        items: [],
        unavailable: true,
      };

  await recordHistory(userId, ctx.workspaceId, prompt, result);
  return result;
}
