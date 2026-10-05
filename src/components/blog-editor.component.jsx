import React, { useContext, useEffect } from 'react'
import darkLogo from "../imgs/logo-dark.png"
import lightLogo from "../imgs/logo-light.png"
import { Link, useNavigate, useParams } from "react-router-dom";
import AnimationWrapper from '../common/page-animation';
import lightBanner from "../imgs/blog banner light.png"
import darkBanner from "../imgs/blog banner dark.png"
import { uploadImage } from '../common/aws';
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages"
import EditorJS from "@editorjs/editorjs"
import { tools } from "./tools.component"
import axios from 'axios';
import { ThemeContext, UserContext } from '../App';
import { apiUrl } from "../common/server-url"
const BlogEditor = () => {
    let {theme}=useContext(ThemeContext)

    let { blog_id } = useParams()

    let { blog, blog: { title, banner, content, tags, des }, setBlog, textEditor, setTextEditor, setEditorState } = useContext(EditorContext);
    let { userAuth: { access_token } } = useContext(UserContext);
    let navigate = useNavigate();

    const handleBannerUpload = (e) => {
        let img = e.target.files[0];
        let loadingToast = toast.loading("Uploading...");
        if (img) {

            uploadImage(img).then((url) => {
                if (url) {
                    toast.dismiss(loadingToast);
                    toast.success("Uploaded 🫡")
                    setBlog({ ...blog, banner: url })
                }
            }).catch(err => {
                toast.dismiss(loadingToast);
                return toast.error(err);
            })
        }
        else {
            toast.dismiss(loadingToast);
            toast.error("Banner Not Selected 😣")
        }
    }

    const handleTitleKeyDown = (e) => {
        if (e.keyCode == 13) {
            e.preventDefault();
        }
    }

    const handleTitleChange = (e) => {
        let input = e.target;
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + "px";

        setBlog({ ...blog, title: input.value })
    }

    const handleError = (e) => {
        let img = e.target;
        img.src = theme=="light" ?lightBanner:darkBanner;
    }

    const handlePublishEvent = () => {
        if (!banner.length) {
            return toast.error("Upload a banner to publish")
        }
        if (!title.length) {
            return toast.error("Write blog title to publish it");
        }
        if (textEditor.isReady) {
            textEditor.save().then(data => {
                if (data.blocks.length) {
                    setBlog({ ...blog, content: data });
                    setEditorState("publish")
                }
                else {
                    return toast.error('Write something in your blog to publish')
                }
            })
        }
    }

    const handleSaveDraft = (e) => {
        if (e.target.classList.contains("disable")) {
            return;
        }

        if (!title.length) {
            return toast.error("Write Blog title before Saving it as Draft")
        }

        let loadingToast = toast.loading("Saving Draft...");
        e.target.classList.add('disable');

        if (textEditor.isReady) {
            textEditor.save().then(content => {

                let blogObj = {
                    title, banner, des, content, tags, draft: true
                }
                axios.post(apiUrl("/create-blog"), { ...blogObj, id: blog_id }, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                })
                    .then(() => {
                        e.target.classList.remove('disable');
                        toast.dismiss(loadingToast);
                        toast.success("Saved 💐");

                        setTimeout(() => {
                            navigate("/dashboard/blogs?tab=draft")
                        }, 500)
                    })
                    .catch(({ response }) => {
                        e.target.classList.remove('disable');
                        toast.dismiss(loadingToast)
                        return toast.error(response.data.error);
                    })
            });
        }


    }

    useEffect(() => {
        if (!textEditor.isReady) {
            setTextEditor(new EditorJS({
                holderId: "textEditor",
                data: Array.isArray(content) ? content[0] : content,
                tools: tools,
                placeholder: "Write your blog"
            }))
        }
    }, [])


    return (
        <>
            <nav className='navbar'>
                <Link to="/" className='flex-none w-10'>
                <img src={theme == "light" ? darkLogo : lightLogo}  />
                </Link>
                <p className='max-md:hidden text-black line-clamp-1 w-full'>
                    {title.length ? title : "New Blog"}
                </p>
                <div className='flex gap-4 ml-auto '>
                    <button className='btn-dark py-2'
                        onClick={handlePublishEvent}
                    >
                        Publish
                    </button>
                    <button className='btn-light py-2 '
                        onClick={handleSaveDraft}
                    >
                        Save Draft
                    </button>
                </div>
            </nav>
            <AnimationWrapper>
                <section>
                    <Toaster
                        position="top-right"
                        reverseOrder={false}
                        gutter={8}
                        containerClassName="notification-toast"
                    />
                    <div className='mx-auto max-w-[900px] w-full write-page'>

                        <label htmlFor='uploadBanner' className='write-paper block cursor-pointer overflow-hidden rounded-md border border-dark-grey/25 hover:border-dark-grey'>
                            <div className='aspect-video'>
                                {banner.length ?
                                    <img
                                        src={banner}
                                        className='w-full h-full object-cover'
                                        onError={handleError}
                                    /> :
                                    <div className='w-full h-full'></div>}
                            </div>
                            <div className='write-paper flex items-center justify-center gap-3 py-4 px-4 border-t border-dark-grey/20 text-black'>
                                <i className='fi fi-rr-picture text-xl'></i>
                                <p className='font-medium text-xl'>Click to upload a banner image</p>
                            </div>
                            <input
                                id='uploadBanner'
                                type="file"
                                accept='.png, .jpg, .jpeg'
                                hidden
                                onChange={handleBannerUpload}
                            />
                        </label>

                        <textarea
                            value={title}
                            placeholder='Blog Title'
                            className='write-paper text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight text-black placeholder:text-dark-grey px-3 py-2 rounded-md'
                            onKeyDown={handleTitleKeyDown}
                            onChange={handleTitleChange}
                        ></textarea>
                        <button
                            type="button"
                            className='text-black text-base mb-2 hover:underline flex items-center gap-2'
                            onClick={() => {
                                if (!textEditor.isReady) return;
                                textEditor.save().then(async (data) => {
                                    let loadingToast = toast.loading("Muse is naming this...");
                                    try {
                                        const { data: muse } = await axios.post(apiUrl("/muse-draft"), {
                                            title,
                                            content: data,
                                            focus: "title"
                                        }, {
                                            headers: { Authorization: `Bearer ${access_token}` }
                                        });
                                        toast.dismiss(loadingToast);
                                        setBlog({ ...blog, title: muse.title || title, content: data });
                                        toast.success(muse.wild_title ? `Or go wild: ${muse.wild_title}` : "Named");
                                    } catch (err) {
                                        toast.dismiss(loadingToast);
                                        toast.error(err?.response?.data?.error || "Muse wandered off");
                                    }
                                });
                            }}
                        >
                            <i className='fi fi-rr-magic-wand'></i>
                            Let Muse name this
                        </button>

                        <hr className="w-full opacity-10 my-5" />

                        <div id='textEditor' className='write-paper font-gelasio text-black rounded-md px-3 py-4'></div>

                    </div>
                </section>

            </AnimationWrapper>
        </>
    )

}

export default BlogEditor
