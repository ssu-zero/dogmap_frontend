import { mutationOptions, queryOptions } from "@tanstack/react-query"

import { getWalkLogs, updateWalkLog } from "@/api/log"

export const walkLogQueryKeys = {
  all: ["walk-logs"] as const,
}

export const walkLogsQueryOptions = () =>
  queryOptions({
    queryKey: walkLogQueryKeys.all,
    queryFn: getWalkLogs,
  })

export const updateWalkLogMutationOptions = () =>
  mutationOptions({
    mutationKey: ["walk-logs", "update"],
    mutationFn: ({ logId, diary }: { logId: number; diary: string | null }) =>
      updateWalkLog(logId, { diary }),
  })
