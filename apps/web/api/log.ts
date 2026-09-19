import { apiClient, parseResponse } from "@/api/client"
import {
  walkLogSchema,
  walkLogsSchema,
  walkLogUpdateSchema,
  type WalkLogUpdate,
} from "@/schema/log"

export function getWalkLogs() {
  return parseResponse(apiClient.get("api/logs"), walkLogsSchema)
}

export function updateWalkLog(logId: number, input: WalkLogUpdate) {
  return parseResponse(
    apiClient.patch(`api/logs/${logId}`, {
      json: walkLogUpdateSchema.parse(input),
    }),
    walkLogSchema
  )
}
