import React, { useContext, useEffect, useState } from 'react'
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
    const [bannerUploading, setBannerUploading] = useState(false);

    const handleBannerUpload = (e) => {
        let img = e.target.files[0];
        if (!img) {
            toast.error("Banner Not Selected 😣")
            return;
        }

        setBannerUploading(true);
        uploadImage(img).then((url) => {
            if (url) {
                setBlog({ ...blog, banner: url })
            } else {
                toast.error("Upload failed")
            }
        }).catch(err => {
            toast.error(err?.message || "Upload failed")
        }).finally(() => {
            setBannerUploading(false);
            e.target.value = "";
        })
    }

    const handleTitleKeyDown = (e) => {
        if (e.keyCode == 13) {
            e.preventDefault();
        }
    }

    const fitTitleHeight = (el) => {
        if (!el || !el.clientWidth) return;
        el.style.transition = "none";
        el.style.height = "auto";
        el.style.height = `${Math.max(el.scrollHeight, 80)}px`;
    }

    const handleTitleChange = (e) => {
        fitTitleHeight(e.target);
        setBlog({ ...blog, title: e.target.value })
    }

    useEffect(() => {
        const el = document.getElementById("blogTitle");
        if (!el) return;

        const fit = () => fitTitleHeight(el);
        const id = requestAnimationFrame(fit);
        document.fonts?.ready?.then(fit);
        window.addEventListener("resize", fit);
        return () => {
            cancelAnimationFrame(id);
            window.removeEventListener("resize", fit);
        };
    }, [title])

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
                    <div className='mx-auto max-w-[900px] w-full '>

                        <div className='relative aspect-video bg-white border-4 border-grey hover:opacity-80'>
                            <label htmlFor='uploadBanner' className='block h-full'>
                                <img
                                    src={banner.length ? banner : (theme == "light" ? lightBanner : darkBanner)}
                                    className='z-20'
                                    onError={handleError}
                                />
                                <input
                                    id='uploadBanner'
                                    type="file"
                                    accept='.png, .jpg, .jpeg'
                                    hidden
                                    disabled={bannerUploading}
                                    onChange={handleBannerUpload}
                                />
                            </label>
                        </div>
                        {bannerUploading ?
                            <div className='flex items-center justify-center gap-3 mt-3 text-black'>
                                <span className='quiet-ring is-compact'></span>
                                <p className='font-medium text-xl'>Uploading...</p>
                            </div> : ""}

                        <textarea
                            id='blogTitle'
                            value={title}
                            rows={1}
                            placeholder='Blog Title'
                            className='blog-title-input text-4xl font-medium w-full min-h-20 outline-none resize-none mt-10 mb-4 leading-snug placeholder:opacity-40 bg-white'
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

                        <div id='textEditor' className='font-gelasio '></div>

                    </div>
                </section>

            </AnimationWrapper>
        </>
    )

}

export default BlogEditor
