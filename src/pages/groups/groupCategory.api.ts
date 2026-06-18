import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/shared/api/base-query";

export interface GroupCategory {
  id: string;
  name: string;
  faculty: string;
  groupsCount: number;
  createdAt: string;
  canDelete: boolean;
}

export interface CreateGroupCategoryRequest {
  name: string;
  faculty?: string;
}

export const groupCategoryApi = createApi({
  reducerPath: "groupCategoryApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GroupCategory"],
  endpoints: (builder) => ({
    getGroupCategories: builder.query<GroupCategory[], void>({
      query: () => "/GroupCategory",
      providesTags: (result) =>
        result
          ? [
              ...result.map((category) => ({
                type: "GroupCategory" as const,
                id: category.id
              })),
              { type: "GroupCategory" as const, id: "LIST" }
            ]
          : [{ type: "GroupCategory" as const, id: "LIST" }]
    }),
    createGroupCategory: builder.mutation<
      GroupCategory,
      CreateGroupCategoryRequest
    >({
      query: (body) => ({
        url: "/GroupCategory",
        method: "POST",
        body
      }),
      invalidatesTags: [{ type: "GroupCategory", id: "LIST" }]
    }),
    deleteGroupCategory: builder.mutation<void, string>({
      query: (categoryId) => ({
        url: `/GroupCategory/${categoryId}`,
        method: "DELETE"
      }),
      invalidatesTags: (_result, _error, categoryId) => [
        { type: "GroupCategory", id: categoryId },
        { type: "GroupCategory", id: "LIST" }
      ]
    })
  })
});

export const {
  useGetGroupCategoriesQuery,
  useCreateGroupCategoryMutation,
  useDeleteGroupCategoryMutation
} = groupCategoryApi;
