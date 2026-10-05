import React, { createContext, useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from "axios"
import { UserContext } from '../App'
import Loader from '../components/loader.component'
import AnimationWrapper from '../common/page-animation'
import { getDay } from '../common/date'
import BlogInteraction from '../components/blog-interaction.component'
import BlogPostcard from '../components/blog-post.component'
import BlogContent from '../components/blog-content.component'
import { calculateReadingTime } from '../common/readingtime'
import { FloatButton } from 'antd';
import CommentsContainer, { fetchComments } from '../components/comments.component'
import RemixLab from '../components/remix-lab.component'
import { InkCanvas } from '../components/ink-marks.component'
import { apiUrl } from "../common/server-url"

export const blogStructure = {
    title: '',
    des: '',
    content: [],
    author: {
        personal_info: {
        }
    },
    banner: '',
    publishedAt: ''
}

export const BlogContext = createContext({})

const BlogPage = () => {
    let { blog_id } = useParams();
    let { userAuth: { access_token } } = useContext(UserContext);

    const [blog, setBlog] = useState(blogStructure);
    const [similarBlogs, setSimilarBlog] = useState(blogStructure);
    const [loading, setLoading] = useState(true);
    const [islikedByUser, setLikedByUser] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [commentsWrapper, setCommentsWrapper] = useState(false);
    const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0)
    const [inkMarks, setInkMarks] = useState([])
    const [myInkTypes, setMyInkTypes] = useState([])
    const [placingType, setPlacingType] = useState(null)

    let { title, content, banner, author: { personal_info: { fullname, username: author_username, profile_img } }, publishedAt } = blog;

    const fetchBlog = () => {
        axios.post(apiUrl("/get-blog"), {
            blog_id
        })
            .then(async ({ data: { blog } }) => {
                blog.comments = await fetchComments({ blog_id: blog._id,
                setParentCommentCountFun:setTotalParentCommentsLoaded
                })
 
                setBlog(blog);
                axios.post(apiUrl("/ink-marks"), { blog_id }, {
                    headers: access_token ? { Authorization: `Bearer ${access_token}` } : {}
                })
                    .then(({ data }) => {
                        setInkMarks(data.marks || [])
                        setMyInkTypes(data.mine || [])
                    })
                    .catch(() => {})

                axios.post(apiUrl("/search-blogs"), { tag: blog.tags[0], limit: 6, eliminate_blog: blog_id })
                    .then(({ data }) => {
                        setSimilarBlog(data.blogs)
                    })
                    .catch(err => {
                        console.log(err.message);
                    })
                setLoading(false);
            })
            .catch(err => {
                console.log(err)
            })
    }

    useEffect(() => {
        resetStates();
        fetchBlog();
    }, [blog_id])

    const resetStates = () => {
        setBlog(blogStructure);
        setSimilarBlog(null);
        setLoading(true);
        setLikedByUser(false);
        setCommentsWrapper(false);
        setTotalParentCommentsLoaded(0);
        setInkMarks([]);
        setMyInkTypes([]);
        setPlacingType(null);
    }
    // console.log(content[0].blocks)
    return (
        <>
            <AnimationWrapper>
                {
                    loading ?
                        <Loader />
                        :
                        <BlogContext.Provider value={{ blog, setBlog, islikedByUser, setLikedByUser, isBookmarked, setIsBookmarked, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded, inkMarks, setInkMarks, myInkTypes, setMyInkTypes, placingType, setPlacingType }}>
                            <CommentsContainer />
                            <div className='max-w-[900px] center py-10 max-lg:px-[5vw]'>
                            <div className='ink-page shadow-md p-6'>
                                <InkCanvas />
                                <img src={banner} className='aspect-video' />

                                <div className='mt-12'>

                                    <h2 className=''>{title}</h2>

                                    <div className='flex max-sm:flex-col justify-between my-8 '>
                                        <div className='flex gap-5 items-start '>
                                            <img src={profile_img} alt="author img" className='w-12 h-12 rounded-full' />

                                            <p className='capitalize'>
                                                {fullname}
                                                <br />
                                                @
                                                <Link to={`/user/${author_username}`} className='underline'>{author_username}</Link>
                                            </p>
                                        </div>
                                        <p className='text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5'>

                                            {
                                                1 + Math.round(content[0].blocks.reduce((totalReadingTime, block, i) => {
                                                    return totalReadingTime + calculateReadingTime(block);
                                                }, 0))
                                            } min read  • Published on {getDay(publishedAt)}
                                        </p>

                                    </div>

                                </div>

                                <BlogInteraction />

                                <div className='my-12 font-gelasio blog-page-content'></div>

                                {
                                    content[0].blocks.map((block, i) => {
                                        return <div key={i} className='my-4 md:my-8'>
                                            <BlogContent block={block} />
                                        </div>
                                    })
                                }

                                <BlogInteraction />
                            </div>

                                <RemixLab blog_id={blog_id} />

                                {
                                    similarBlogs !== null && similarBlogs.length ?
                                        <>
                                            <h1 className='text-4xl mt-14 mb-10 font-medium'>
                                                Similar Blogs
                                            </h1>
                                            {
                                                similarBlogs.map((blog, i) => {
                                                    let { author: { personal_info } } = blog;
                                                    return <AnimationWrapper
                                                        key={i}
                                                        transition={{
                                                            duration: 1,
                                                            delay: i * 0.08
                                                        }}
                                                    >
                                                        <BlogPostcard content={blog} author={personal_info} />
                                                    </AnimationWrapper>
                                                })
                                            }
                                        </> : ""
                                }




                            </div>
                        </BlogContext.Provider>

                }
            </AnimationWrapper>
            <FloatButton.BackTop />
        </>
    )
}

export default BlogPage
