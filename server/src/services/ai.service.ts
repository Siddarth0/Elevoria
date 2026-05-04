import { gemini } from "@/config/gemini";
import { prisma } from "@/lib/prisma";

const MODEL = "gemini-2.5-flash";

const generateGeminiText = async (prompt: string) => {
  try {
    const res = await gemini.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return res.text || "No AI response generated.";
  } catch {
    return "AI quota reached or provider unavailable. Please try again later.";
  }
};

export const generateSummaryService = async (
  content: string,
  userId: string,
  workspaceId?: string,
) => {
  const result = await generateGeminiText(
    `Summarize this into concise actionable project notes:\n${content}`,
  );

  await prisma.aIHistory.create({
    data: {
      prompt: content,
      response: result,
      userId,
      workspaceId,
    },
  });

  return result;
};

export const generateSubtasksService = async (
  description: string,
  userId: string,
  workspaceId?: string,
) => {
  const result = await generateGeminiText(
    `Break this project into practical implementation subtasks:\n${description}`,
  );

  await prisma.aIHistory.create({
    data: {
      prompt: description,
      response: result,
      userId,
      workspaceId,
    },
  });

  return result;
};

export const generateDeadlineService = async (
  description: string,
  userId: string,
  workspaceId?: string,
) => {
  const result = await generateGeminiText(
    `Suggest a realistic execution timeline and deadline for this work:\n${description}`,
  );

  await prisma.aIHistory.create({
    data: {
      prompt: description,
      response: result,
      userId,
      workspaceId,
    },
  });

  return result;
};