import { createApi } from "@reduxjs/toolkit/query/react";
import { createAppBaseQuery } from "@/shared/api/base-query";

export interface IFileResponse {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  description: string;
  downloadUrl: string;
  uploadedByName: string;
}

export interface IUserFilesResponse {
  files: IFileResponse[];
  usedBytes: number;
  limitBytes: number;
}

const filesApiBaseUrl = `${((import.meta.env.VITE_API_URL as string | undefined) ?? "/api").replace(/\/$/, "")}/Files`;

export const documentsApi = createApi({
  reducerPath: "documentsApi",
  baseQuery: createAppBaseQuery(filesApiBaseUrl),
  tagTypes: ["Files"],
  endpoints: (builder) => ({
    getUserFiles: builder.query<IUserFilesResponse, void>({
      query: () => "/users/files",
      providesTags: ["Files"]
    }),
    uploadFile: builder.mutation<
      void,
      {
        file: File;
        description?: string;
      }
    >({
      query: ({ file, description }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (description) {
          formData.append("description", description);
        }
        return {
          url: "/upload",
          method: "POST",
          body: formData
        };
      },
      invalidatesTags: ["Files"]
    }),
    deleteFile: builder.mutation<void, string>({
      query: (fileId) => ({
        url: `/${fileId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Files"]
    }),
    getFileById: builder.query<Blob, string>({
      query: (fileId) => ({
        url: `/${fileId}`,
        responseHandler: (response) => response.blob()
      })
    }),
    downloadFile: builder.query<Blob, string>({
      query: (fileId) => ({
        url: `/download/${fileId}`,
        responseHandler: (response) => response.blob()
      })
    })
  })
});

export const {
  useGetUserFilesQuery,
  useUploadFileMutation,
  useDeleteFileMutation,
  useDownloadFileQuery,
  useLazyDownloadFileQuery
} = documentsApi;
