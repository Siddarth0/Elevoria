import cloudinary from "@/config/cloudinary";

export const uploadToCloudinary = (fileBuffer: Buffer, folder = "elevoria") => {
  return new Promise<{ secure_url: string; original_filename: string }>(
    (resolve, reject) => {
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
          });
        },
      );

      stream.end(fileBuffer);
    },
  );
};
