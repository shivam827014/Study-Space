import { ID, Permission, UploadProgress, Role } from "appwrite";
import appwriteSDKProvider from "./appwrite.client";


const { storage } = appwriteSDKProvider;

export async function uploadFileToBucket(
  senderId: string,
  file: File,
  bucketId: string,
  onProgress?: (progress: UploadProgress) => void
) {
  const bucket_id = "6636b06b001a3cb855a5"
  const uploadedFile = await storage?.createFile(
    bucket_id,
    ID.unique(),
    file,
    [Permission.write(Role.user(senderId)), Permission.read(Role.any())],
    onProgress
  );

  // console.log("uploadedFile", uploadedFile);

  return uploadedFile;
}
