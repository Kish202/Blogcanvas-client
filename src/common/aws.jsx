import axios from "axios";
import { apiUrl } from "./server-url"

export const uploadImage = async (img) => {
    let imgUrl = null;
    await axios.get(apiUrl("/get-upload-url"))
        .then(async ({ data: { uploadURL } }) => {

           await axios({
                method: "PUT",
                url: uploadURL,
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                data: img
            })
                .then(() => {
                    imgUrl = uploadURL.split("?")[0];
                })
        }).catch((err)=>{
            console.log(err);
        })
    return imgUrl;
}