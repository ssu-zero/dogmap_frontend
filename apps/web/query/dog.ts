import { mutationOptions, queryOptions } from "@tanstack/react-query"

import { getMyDog, registerDog, updateMyDog } from "@/api/dog"

export const dogQueryKeys = {
  me: ["dogs", "me"] as const,
}

export const myDogQueryOptions = () =>
  queryOptions({
    queryKey: dogQueryKeys.me,
    queryFn: getMyDog,
  })

export const registerDogMutationOptions = () =>
  mutationOptions({
    mutationKey: ["dogs", "register"],
    mutationFn: registerDog,
  })

export const updateMyDogMutationOptions = () =>
  mutationOptions({
    mutationKey: ["dogs", "me", "update"],
    mutationFn: updateMyDog,
  })
