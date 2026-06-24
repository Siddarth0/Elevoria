import cloudinary from "@/config/cloudinary";

export type CloudinaryUpload = {
  secure_url: string;
  original_filename: string;
  public_id: string;
  bytes: number;
  resource_type: string;
  format?: string;
};

export const uploadToCloudinary = (fileBuffer: Buffer, folder = "elevoria") => {
  return new Promise<CloudinaryUpload>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error || !result) {
          reject(error);
          return;
        }

        resolve({
          secure_url: result.secure_url,
          original_filename: result.original_filename,
          public_id: result.public_id,
          bytes: result.bytes,
          resource_type: result.resource_type,
          format: result.format,
        });
      },
    );

    stream.end(fileBuffer);
  });
};

/** Best-effort removal of an uploaded asset (used when deleting attachments). */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType = "image",
) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (err) {
    console.error("[cloudinary] destroy failed:", err);
  }
};
