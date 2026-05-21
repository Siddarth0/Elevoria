import {
  generateSubtasks,
  suggestDeadline,
  summarizeDocument,
} from "@/services/ai.service";
import { useMutation } from "@tanstack/react-query";

export const useSummarizeDocument = () => {
  return useMutation({ mutationFn: summarizeDocument });
};

export const useGenerateSubtasks = () => {
  return useMutation({ mutationFn: generateSubtasks });
};

export const useSuggestDeadline = () => {
  return useMutation({ mutationFn: suggestDeadline });
};
