import axios from "axios";
import { apiUrl } from "./server-url"

const uploadError = (err) => {
    const xml = String(err?.response?.data || err?.message || "");
    if (/InvalidAccessKeyId/i.test(xml)) {
        return "AWS rejected the access key. Put a current IAM key in the server .env as AWS_ACCESS_KEY_ and AWS_SECRET_ACCESS_KEY.";
    }
    if (/SignatureDoesNotMatch/i.test(xml)) {
        return "AWS signature did not match. Check AWS_SECRET_ACCESS_KEY.";
    }
    if (/AccessDenied|AllAccessDisabled/i.test(xml)) {
        return "AWS denied the upload. The IAM user needs put access on the bucket.";
    }
    return err?.response?.data?.error || err?.message || "Upload failed";
}

const uploadImageToS3 = async (img) => {
    const { data } = await axios.get(apiUrl("/get-upload-url"));
    const uploadURL = data?.uploadURL;
    if (!uploadURL) {
        throw new Error("Could not get an upload link");
    }

    try {
        await axios({
            method: "PUT",
            url: uploadURL,
            headers: {
                "Content-Type": "image/jpeg"
            },
            data: img
        });
    } catch (err) {
        throw new Error(uploadError(err));
    }

    return uploadURL.split("?")[0];
}

export const uploadImage = async (img) => {
    try {
        const form = new FormData();
        form.append("image", img);
        const { data } = await axios.post(apiUrl("/upload-image"), form);
        if (data?.url) return data.url;
    } catch (err) {
        if (err?.response?.status !== 503) {
            throw new Error(err?.response?.data?.error || err?.message || "Upload failed");
        }
    }

    return uploadImageToS3(img);
}
