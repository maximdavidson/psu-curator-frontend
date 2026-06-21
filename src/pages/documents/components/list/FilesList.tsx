import {
  useGetUserFilesQuery,
  useDeleteFileMutation,
  useLazyDownloadFileQuery
} from "../../documents.api";
import styles from "./FilesList.module.scss";
import { FilesItem } from "./FilesItem";
export const FilesList = () => {
  const { data, isLoading } = useGetUserFilesQuery();
  const files = data?.files ?? [];
  const [deleteFile] = useDeleteFileMutation();
  const [downloadFile] = useLazyDownloadFileQuery();
  const handleDelete = async (id?: string) => {
    if (!id) return;
    await deleteFile(id);
  };
  const handleDownload = async (fileId: string, fileName: string) => {
    const result = await downloadFile(fileId).unwrap();
    const url = URL.createObjectURL(result);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };
  if (isLoading) return <div>Загрузка...</div>;
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Загруженные файлы ({files?.length ?? 0})</h3>

      {!files?.length ? (
        <p>Файлов пока нет</p>
      ) : (
        <ul className={styles.list}>
          {files.map((file) => (
            <FilesItem
              key={file.id}
              id={file.id}
              name={file.fileName}
              size={file.fileSize}
              createdAt={0}
              handleDelete={handleDelete}
              handleDownload={() => handleDownload(file.id, file.fileName)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
